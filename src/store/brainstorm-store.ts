import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type {
  BrainstormSession,
  BrainstormRound,
  BrainstormInsight,
  CreateSessionInput,
  SessionStatus,
  AgentId,
  FinalVerdict,
  ParsedRoundOutput,
  BrainstormUIState,
} from '@/lib/types/brainstorm'

interface BrainstormStore {
  // Data
  sessions: BrainstormSession[]
  currentSession: BrainstormSession | null
  currentRounds: BrainstormRound[]
  currentInsights: BrainstormInsight[]

  // UI State
  ui: BrainstormUIState

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isRunning: boolean

  // Stream state
  streamContent: string
  streamProgress: number

  // Actions - Sessions
  loadSessions: (userId: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  createSession: (input: CreateSessionInput, userId: string) => Promise<BrainstormSession | null>
  deleteSession: (sessionId: string) => Promise<void>

  // Actions - Run
  startSession: (sessionId: string) => Promise<void>
  cancelSession: (sessionId: string) => Promise<void>

  // Actions - UI
  setActiveTab: (tab: BrainstormUIState['activeTab']) => void
  setSelectedInsight: (id: string | null) => void

  // Actions - Stream handlers
  handleStreamEvent: (event: {
    type: string
    round_number?: number
    agent?: AgentId
    progress?: number
    content?: string
    parsed_output?: ParsedRoundOutput
    final_verdict?: FinalVerdict
    error?: string
  }) => void
  resetStream: () => void
}

export const useBrainstormStore = create<BrainstormStore>((set, get) => ({
  // Initial state
  sessions: [],
  currentSession: null,
  currentRounds: [],
  currentInsights: [],
  ui: {
    activeTab: 'ideas',
    selectedInsightId: null,
    isPlaying: false,
  },
  isLoading: false,
  isCreating: false,
  isRunning: false,
  streamContent: '',
  streamProgress: 0,

  // Load all sessions for user
  loadSessions: async (userId) => {
    set({ isLoading: true })
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('brainstorm_sessions')
      .select(`
        *,
        project:projects(id, title, color)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading sessions:', error)
      set({ isLoading: false })
      return
    }

    set({ sessions: (data || []) as BrainstormSession[], isLoading: false })
  },

  // Load single session with all related data
  loadSession: async (sessionId) => {
    set({ isLoading: true })
    const supabase = createClient()

    // Load session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase as any)
      .from('brainstorm_sessions')
      .select(`
        *,
        project:projects(id, title, color)
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      console.error('Error loading session:', sessionError)
      set({ isLoading: false })
      return
    }

    // Load rounds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rounds } = await (supabase as any)
      .from('brainstorm_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true })

    // Load insights
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: insights } = await (supabase as any)
      .from('brainstorm_insights')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    set({
      currentSession: session as BrainstormSession,
      currentRounds: (rounds || []) as BrainstormRound[],
      currentInsights: (insights || []) as BrainstormInsight[],
      isLoading: false,
    })
  },

  // Create new session
  createSession: async (input, userId) => {
    set({ isCreating: true })
    const supabase = createClient()

    const sessionData = {
      user_id: userId,
      title: input.title,
      original_idea: input.original_idea,
      mode: input.mode,
      quick_mode_agent: input.quick_mode_agent || null,
      project_id: input.project_id || null,
      status: 'pending' as SessionStatus,
      total_rounds: input.mode === 'deep' ? 5 : 1,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('brainstorm_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      set({ isCreating: false })
      return null
    }

    // Add to sessions list
    set((state) => ({
      sessions: [data as BrainstormSession, ...state.sessions],
      isCreating: false,
    }))

    return data as BrainstormSession
  },

  // Delete session
  deleteSession: async (sessionId) => {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('brainstorm_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Error deleting session:', error)
      return
    }

    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),
      currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
    }))
  },

  // Start brainstorm session (calls API)
  startSession: async (sessionId) => {
    set({ isRunning: true, streamContent: '', streamProgress: 0 })

    try {
      const response = await fetch(`/api/brainstorm/${sessionId}/start`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      // Handle SSE stream
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              get().handleStreamEvent(event)
            } catch (e) {
              console.error('Error parsing SSE event:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error running session:', error)
      set({ isRunning: false })
    }
  },

  // Cancel running session
  cancelSession: async (sessionId) => {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('brainstorm_sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId)

    set((state) => ({
      isRunning: false,
      currentSession: state.currentSession?.id === sessionId
        ? { ...state.currentSession, status: 'cancelled' as SessionStatus }
        : state.currentSession,
    }))
  },

  // UI Actions
  setActiveTab: (tab) => {
    set((state) => ({
      ui: { ...state.ui, activeTab: tab },
    }))
  },

  setSelectedInsight: (id) => {
    set((state) => ({
      ui: { ...state.ui, selectedInsightId: id },
    }))
  },

  // Stream event handler
  handleStreamEvent: (event) => {
    const { type } = event

    switch (type) {
      case 'round_start':
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, current_round: event.round_number || 0 }
            : null,
          streamContent: '',
        }))
        break

      case 'round_progress':
        set((state) => ({
          streamContent: state.streamContent + (event.content || ''),
          streamProgress: event.progress || 0,
        }))
        break

      case 'round_complete':
        // Reload rounds to get latest data
        const sessionId = get().currentSession?.id
        if (sessionId) {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(supabase as any)
            .from('brainstorm_rounds')
            .select('*')
            .eq('session_id', sessionId)
            .order('round_number', { ascending: true })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(({ data }: { data: any }) => {
              if (data) set({ currentRounds: data as BrainstormRound[] })
            })

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(supabase as any)
            .from('brainstorm_insights')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(({ data }: { data: any }) => {
              if (data) set({ currentInsights: data as BrainstormInsight[] })
            })
        }
        set({ streamContent: '', streamProgress: 0 })
        break

      case 'session_complete':
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                status: 'completed' as SessionStatus,
                final_verdict: event.final_verdict || null,
              }
            : null,
          isRunning: false,
        }))
        // Reload full session
        if (get().currentSession?.id) {
          get().loadSession(get().currentSession!.id)
        }
        break

      case 'round_error':
      case 'session_error':
        console.error('Stream error:', event.error)
        set({ isRunning: false })
        break
    }
  },

  resetStream: () => {
    set({ streamContent: '', streamProgress: 0, isRunning: false })
  },
}))
