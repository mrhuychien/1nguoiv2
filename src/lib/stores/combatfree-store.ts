import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CombatFreeMessage, CombatFreeConfig, FreeAgentId } from '@/lib/types/combatfree'
import { DEFAULT_CONFIG, FREE_AGENTS } from '@/lib/types/combatfree'

interface CombatFreeStore {
  // State
  messages: CombatFreeMessage[]
  config: CombatFreeConfig
  isSending: boolean
  streamingContent: string
  streamingAgent: FreeAgentId | null
  error: string | null

  // Actions
  sendMessage: (targetAgent: FreeAgentId, content: string) => Promise<void>
  clearMessages: () => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  messages: [],
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
        set({ messages: [...messages, userMessage] })

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

      clearMessages: () => {
        set({ messages: [], streamingContent: '', streamingAgent: null })
      },

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'combatfree-storage',
      partialize: (state) => ({
        messages: state.messages.slice(-50),
      }),
    }
  )
)
