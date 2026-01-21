import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type {
  VibeCodeSession,
  VibeCodeArtifact,
  VibeCodeMessage,
  VibeCodeStep,
  ArtifactType,
  ContextData,
} from '@/lib/types/vibecode'

interface VibeCodeStore {
  // State
  session: VibeCodeSession | null
  artifacts: VibeCodeArtifact[]
  messages: VibeCodeMessage[]
  currentStep: VibeCodeStep
  isLoading: boolean
  isGenerating: boolean
  error: string | null

  // Session actions
  initSession: (projectId: string, userId: string) => Promise<void>
  loadSession: (projectId: string) => Promise<void>
  updateSession: (data: Partial<VibeCodeSession>) => Promise<void>

  // Step actions
  setStep: (step: VibeCodeStep) => void
  nextStep: () => Promise<void>
  prevStep: () => void

  // Message actions
  addMessage: (message: Omit<VibeCodeMessage, 'id' | 'created_at' | 'session_id'>) => Promise<void>
  loadMessages: (step?: VibeCodeStep) => Promise<void>

  // Artifact actions
  loadArtifacts: () => Promise<void>
  saveArtifact: (artifact: Omit<VibeCodeArtifact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  approveArtifact: (id: string) => Promise<void>
  getArtifactByType: (type: ArtifactType) => VibeCodeArtifact | undefined

  // Context actions
  updateContext: (data: Partial<ContextData>) => Promise<void>
  setVision: (text: string) => Promise<void>

  // UI actions
  setLoading: (loading: boolean) => void
  setGenerating: (generating: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  session: null,
  artifacts: [],
  messages: [],
  currentStep: 1 as VibeCodeStep,
  isLoading: false,
  isGenerating: false,
  error: null,
}

export const useVibeCodeStore = create<VibeCodeStore>((set, get) => ({
  ...initialState,

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  initSession: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    try {
      // Check if session already exists
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase as any)
        .from('vibecode_sessions')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (existing) {
        set({
          session: existing,
          currentStep: existing.current_step,
          isLoading: false
        })
        await get().loadArtifacts()
        await get().loadMessages()
        return
      }

      // Create new session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newSession, error } = await (supabase as any)
        .from('vibecode_sessions')
        .insert({
          project_id: projectId,
          user_id: userId,
          current_step: 1,
          status: 'in_progress',
          context_data: {},
        })
        .select()
        .single()

      if (error) throw error

      set({ session: newSession, currentStep: 1, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  loadSession: async (projectId: string) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('vibecode_sessions')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        set({
          session: data,
          currentStep: data.current_step,
          isLoading: false
        })
        await get().loadArtifacts()
        await get().loadMessages()
      } else {
        set({ session: null, isLoading: false })
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateSession: async (data: Partial<VibeCodeSession>) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('vibecode_sessions')
        .update(data)
        .eq('id', session.id)

      if (error) throw error

      set({ session: { ...session, ...data } })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setStep: (step: VibeCodeStep) => {
    set({ currentStep: step })
  },

  nextStep: async () => {
    const { currentStep, session } = get()
    if (currentStep >= 6 || !session) return

    const nextStep = (currentStep + 1) as VibeCodeStep

    await get().updateSession({ current_step: nextStep })
    set({ currentStep: nextStep })
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep <= 1) return

    set({ currentStep: (currentStep - 1) as VibeCodeStep })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  addMessage: async (message) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('vibecode_messages')
        .insert({
          session_id: session.id,
          ...message,
        })
        .select()
        .single()

      if (error) throw error

      set({ messages: [...get().messages, data] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  loadMessages: async (step?: VibeCodeStep) => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from('vibecode_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })

      if (step) {
        query = query.eq('step', step)
      }

      const { data, error } = await query

      if (error) throw error

      set({ messages: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ARTIFACT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  loadArtifacts: async () => {
    const { session } = get()
    if (!session) return

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('vibecode_artifacts')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ artifacts: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  saveArtifact: async (artifact) => {
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('vibecode_artifacts')
        .insert(artifact)
        .select()
        .single()

      if (error) throw error

      set({ artifacts: [data, ...get().artifacts] })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  approveArtifact: async (id: string) => {
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('vibecode_artifacts')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      set({
        artifacts: get().artifacts.map((a) =>
          a.id === id ? { ...a, status: 'approved', approved_at: new Date().toISOString() } : a
        ),
      })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  getArtifactByType: (type: ArtifactType) => {
    return get().artifacts.find((a) => a.type === type && a.status !== 'archived')
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  updateContext: async (data: Partial<ContextData>) => {
    const { session } = get()
    if (!session) return

    const newContext = { ...session.context_data, ...data }
    await get().updateSession({ context_data: newContext })
  },

  setVision: async (text: string) => {
    await get().updateSession({ vision_text: text })
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setGenerating: (generating: boolean) => set({ isGenerating: generating }),
  setError: (error: string | null) => set({ error }),
  reset: () => set(initialState),
}))
