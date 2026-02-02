import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { CombatSession, CombatMessage, CombatRole } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'

interface CombatStore {
  // State
  session: CombatSession | null
  sessions: CombatSession[]
  messages: CombatMessage[]
  isLoading: boolean
  isSending: boolean
  streamingContent: string
  streamingAgent: AgentId | null
  error: string | null

  // Session actions
  loadSessions: (projectId?: string) => Promise<void>
  createSession: (title: string, topic?: string, projectId?: string) => Promise<CombatSession | null>
  loadSession: (sessionId: string) => Promise<void>
  endSession: () => Promise<void>

  // Message actions
  loadMessages: () => Promise<void>
  sendMessage: (targetAgent: AgentId, content: string) => Promise<void>

  // UI actions
  setStreamingContent: (content: string) => void
  setStreamingAgent: (agent: AgentId | null) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  session: null,
  sessions: [],
  messages: [],
  isLoading: false,
  isSending: false,
  streamingContent: '',
  streamingAgent: null,
  error: null,
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  ...initialState,

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  loadSessions: async (projectId?: string) => {
    set({ isLoading: true, error: null })

    try {
      const url = projectId
        ? `/api/combat/sessions?project_id=${projectId}`
        : '/api/combat/sessions'

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load sessions')
      }

      set({ sessions: data.sessions, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      })
    }
  },

  createSession: async (title: string, topic?: string, projectId?: string) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/combat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, topic, project_id: projectId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      set({
        session: data.session,
        sessions: [data.session, ...get().sessions],
        isLoading: false,
      })

      // Load initial messages (welcome message)
      await get().loadMessages()

      return data.session
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      })
      return null
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('combat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error

      set({ session: data, isLoading: false })
      await get().loadMessages()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      })
    }
  },

  endSession: async () => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('combat_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', session.id)

    set({ session: { ...session, status: 'ended' } })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  loadMessages: async () => {
    const { session } = get()
    if (!session) return

    try {
      const response = await fetch(`/api/combat/messages?session_id=${session.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load messages')
      }

      set({ messages: data.messages })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  },

  sendMessage: async (targetAgent: AgentId, content: string) => {
    const { session, messages } = get()
    if (!session || get().isSending) return

    set({
      isSending: true,
      error: null,
      streamingContent: '',
      streamingAgent: targetAgent,
    })

    // Optimistically add user message
    const userMessage: CombatMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      role: 'user' as CombatRole,
      content,
      mentioned_agents: [targetAgent],
      tokens_input: 0,
      tokens_output: 0,
      cost: 0,
      duration_ms: 0,
      created_at: new Date().toISOString(),
    }
    set({ messages: [...messages, userMessage] })

    try {
      const response = await fetch('/api/combat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          target_agent: targetAgent,
          message: content,
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
              // Add AI message to state
              const aiMessage: CombatMessage = {
                id: `ai-${Date.now()}`,
                session_id: session.id,
                role: targetAgent as CombatRole,
                content: fullContent,
                mentioned_agents: [],
                tokens_input: 0,
                tokens_output: 0,
                cost: 0,
                duration_ms: 0,
                created_at: new Date().toISOString(),
              }
              set((state) => ({
                messages: [...state.messages, aiMessage],
                streamingContent: '',
                streamingAgent: null,
              }))
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

  // ═══════════════════════════════════════════════════════════════════════════
  // UI ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setStreamingContent: (content) => set({ streamingContent: content }),
  setStreamingAgent: (agent) => set({ streamingAgent: agent }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}))
