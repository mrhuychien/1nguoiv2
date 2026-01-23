import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CombatFreeMessage, CombatFreeConfig, CombatFreeSession, FreeAgentId } from '@/lib/types/combatfree'
import { DEFAULT_CONFIG, FREE_AGENTS } from '@/lib/types/combatfree'

interface CombatFreeStore {
  // State
  sessions: CombatFreeSession[]
  currentSessionId: string | null
  messages: CombatFreeMessage[]
  config: CombatFreeConfig
  isSending: boolean
  streamingContent: string
  streamingAgent: FreeAgentId | null
  error: string | null

  // Session Actions
  createSession: (title: string, topic?: string) => string
  loadSession: (sessionId: string) => void
  endSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  getCurrentSession: () => CombatFreeSession | null

  // Message Actions
  sendMessage: (targetAgent: FreeAgentId, content: string) => Promise<void>
  clearMessages: () => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  sessions: [] as CombatFreeSession[],
  currentSessionId: null as string | null,
  messages: [] as CombatFreeMessage[],
  config: DEFAULT_CONFIG,
  isSending: false,
  streamingContent: '',
  streamingAgent: null,
  error: null,
}

export const useCombatFreeStore = create<CombatFreeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Create a new session
      createSession: (title: string, topic?: string) => {
        const sessionId = `session-${Date.now()}`
        const now = new Date().toISOString()
        const newSession: CombatFreeSession = {
          id: sessionId,
          title,
          topic,
          status: 'active',
          messages: [],
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId,
          messages: [],
        }))
        return sessionId
      },

      // Load an existing session
      loadSession: (sessionId: string) => {
        const { sessions } = get()
        const session = sessions.find((s) => s.id === sessionId)
        if (session) {
          set({
            currentSessionId: sessionId,
            messages: session.messages,
          })
        }
      },

      // End a session (mark as ended)
      endSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: 'ended' as const, updated_at: new Date().toISOString() }
              : s
          ),
        }))
      },

      // Delete a session
      deleteSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId ? null : state.currentSessionId,
          messages: state.currentSessionId === sessionId ? [] : state.messages,
        }))
      },

      // Get current session
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get()
        return sessions.find((s) => s.id === currentSessionId) || null
      },

      sendMessage: async (targetAgent: FreeAgentId, content: string) => {
        const { messages } = get()

        if (get().isSending) return

        set({
          isSending: true,
          error: null,
          streamingContent: '',
          streamingAgent: targetAgent,
        })

        // Add user message
        const userMessage: CombatFreeMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          created_at: new Date().toISOString(),
        }
        const newMessages = [...messages, userMessage]
        // Update both messages and session
        set((state) => {
          const updatedSessions = state.currentSessionId
            ? state.sessions.map((s) =>
                s.id === state.currentSessionId
                  ? { ...s, messages: newMessages, updated_at: new Date().toISOString() }
                  : s
              )
            : state.sessions
          return {
            messages: newMessages,
            sessions: updatedSessions,
          }
        })

        try {
          const response = await fetch('/api/combatfree/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.role === 'assistant' && m.agent
                  ? `[${FREE_AGENTS[m.agent].emoji} ${FREE_AGENTS[m.agent].name}]: ${m.content}`
                  : m.content,
              })),
              targetAgent,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to send message')
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          const decoder = new TextDecoder()
          let fullContent = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Add AI message
                  const aiMessage: CombatFreeMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    agent: targetAgent,
                    content: fullContent,
                    created_at: new Date().toISOString(),
                  }
                  set((state) => {
                    const newMessages = [...state.messages, aiMessage]
                    // Also update session if one is active
                    const updatedSessions = state.currentSessionId
                      ? state.sessions.map((s) =>
                          s.id === state.currentSessionId
                            ? { ...s, messages: newMessages, updated_at: new Date().toISOString() }
                            : s
                        )
                      : state.sessions
                    return {
                      messages: newMessages,
                      sessions: updatedSessions,
                      streamingContent: '',
                      streamingAgent: null,
                    }
                  })
                } else {
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.content) {
                      fullContent += parsed.content
                      set({ streamingContent: fullContent })
                    }
                  } catch {
                    // Ignore parse errors
                  }
                }
              }
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Unknown error' })
        } finally {
          set({ isSending: false, streamingAgent: null })
        }
      },

      clearMessages: () => {
        set((state) => {
          // Also clear messages in current session
          const updatedSessions = state.currentSessionId
            ? state.sessions.map((s) =>
                s.id === state.currentSessionId
                  ? { ...s, messages: [], updated_at: new Date().toISOString() }
                  : s
              )
            : state.sessions
          return {
            messages: [],
            sessions: updatedSessions,
            streamingContent: '',
            streamingAgent: null,
          }
        })
      },

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'combatfree-storage',
      partialize: (state) => ({
        sessions: state.sessions.slice(0, 20).map((s) => ({
          ...s,
          messages: s.messages.slice(-100),
        })),
        currentSessionId: state.currentSessionId,
        messages: state.messages.slice(-50),
      }),
    }
  )
)
