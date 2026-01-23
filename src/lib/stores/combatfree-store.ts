import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CombatFreeMessage, CombatFreeConfig } from '@/lib/types/combatfree'
import { DEFAULT_CONFIG } from '@/lib/types/combatfree'

interface CombatFreeStore {
  // State
  messages: CombatFreeMessage[]
  config: CombatFreeConfig
  isLoading: boolean
  isSending: boolean
  streamingContent: string
  error: string | null
  serverStatus: 'unknown' | 'online' | 'offline'

  // Actions
  setConfig: (config: Partial<CombatFreeConfig>) => void
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  checkServerStatus: () => Promise<void>
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  messages: [],
  config: DEFAULT_CONFIG,
  isLoading: false,
  isSending: false,
  streamingContent: '',
  error: null,
  serverStatus: 'unknown' as const,
}

export const useCombatFreeStore = create<CombatFreeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }))
      },

      checkServerStatus: async () => {
        const { config } = get()
        try {
          const response = await fetch(`${config.serverUrl}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          })
          set({ serverStatus: response.ok ? 'online' : 'offline' })
        } catch {
          set({ serverStatus: 'offline' })
        }
      },

      sendMessage: async (content: string) => {
        const { config, messages } = get()

        if (get().isSending) return

        set({
          isSending: true,
          error: null,
          streamingContent: '',
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
                content: m.content,
              })),
              config,
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
                    content: fullContent,
                    provider: config.provider,
                    model: config.model,
                    created_at: new Date().toISOString(),
                  }
                  set((state) => ({
                    messages: [...state.messages, aiMessage],
                    streamingContent: '',
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
          set({ isSending: false })
        }
      },

      clearMessages: () => {
        set({ messages: [], streamingContent: '' })
      },

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    {
      name: 'combatfree-storage',
      partialize: (state) => ({
        config: state.config,
        messages: state.messages.slice(-50), // Keep last 50 messages
      }),
    }
  )
)
