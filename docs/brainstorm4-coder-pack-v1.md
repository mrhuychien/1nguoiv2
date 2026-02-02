# ═══════════════════════════════════════════════════════════════════════════════
#                              🧠 CODER PACK: BRAINSTORM4
#                            1NGUOI.COM - MODULE MỚI
#                        4 AI Agents Collaborative Brainstorming
#                              Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 MỤC ĐÍCH: Xây dựng module Brainstorm4 - cho phép 4 AI cùng phân tích ý tưởng
#
#  🤖 AI AGENTS:
#  • SPARK (ChatGPT) - The Ideator: Sáng tạo, phát triển ý tưởng
#  • LENS (Claude) - The Analyst: Phân tích logic, đánh giá khả thi
#  • RADAR (Gemini) - The Researcher: Nghiên cứu thị trường, data
#  • DEVIL (Grok) - The Challenger: Phản biện, đặt câu hỏi khó
#
#  📦 DELIVERABLES:
#  • Database schema cho brainstorm sessions
#  • API routes cho CRUD + AI calls
#  • UI Components (List, Modal, Live Session, Results)
#  • Integration với Project Hub (status: idea)
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# ═══════════════════════════════════════════════════════════════════════════════
#                              📋 HƯỚNG DẪN CHO AI CODER
# ═══════════════════════════════════════════════════════════════════════════════

## VAI TRÒ CỦA BẠN

Bạn là **Thợ xây** (Builder). Nhiệm vụ là implement CHÍNH XÁC theo Coder Pack này.

### QUY TẮC TUYỆT ĐỐI:
1. ❌ KHÔNG thay đổi kiến trúc / layout
2. ❌ KHÔNG thêm features không có trong Coder Pack
3. ❌ KHÔNG đổi tech stack
4. ❌ KHÔNG tự ý quyết định khi gặp conflict
5. ✅ Gặp vấn đề → BÁO CÁO và hỏi trước khi làm

### THỨ TỰ THỰC HIỆN:
1. STEP 1: Database Migration
2. STEP 2: TypeScript Types
3. STEP 3: Zustand Store
4. STEP 4: API Routes
5. STEP 5: AI Agent Services
6. STEP 6: UI Components
7. STEP 7: Pages
8. STEP 8: Integration với Project Hub

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 1: DATABASE MIGRATION
# ═══════════════════════════════════════════════════════════════════════════════

## 1.1 File: supabase/migrations/002_brainstorm4.sql

```sql
-- ═══════════════════════════════════════════════════════════════════════════════
--                         BRAINSTORM4 DATABASE SCHEMA
--                            1nguoi.com Module
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Update projects table: Add 'idea' status
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.projects 
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects 
  ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('idea', 'focus', 'active', 'backlog', 'archived'));

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);

-- 2. Brainstorm Sessions table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- Input
    title TEXT NOT NULL,
    original_idea TEXT NOT NULL,
    mode VARCHAR(20) DEFAULT 'deep' CHECK (mode IN ('quick', 'deep')),
    quick_mode_agent VARCHAR(20) CHECK (quick_mode_agent IN ('spark', 'lens', 'radar', 'devil')),
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 5,
    
    -- Results
    final_verdict JSONB DEFAULT NULL,
    -- Structure: {
    --   score: number (1-10),
    --   summary: string,
    --   recommendation: 'proceed' | 'pivot' | 'drop',
    --   strengths: string[],
    --   weaknesses: string[],
    --   risks: string[],
    --   next_steps: string[]
    -- }
    
    -- Metadata
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brainstorm_sessions_user ON public.brainstorm_sessions(user_id);
CREATE INDEX idx_brainstorm_sessions_status ON public.brainstorm_sessions(status);
CREATE INDEX idx_brainstorm_sessions_project ON public.brainstorm_sessions(project_id);

-- RLS
ALTER TABLE public.brainstorm_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions" ON public.brainstorm_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 3. Brainstorm Rounds table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,
    
    -- Round info
    round_number INTEGER NOT NULL,
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('spark', 'lens', 'radar', 'devil')),
    role VARCHAR(50) NOT NULL,
    -- Roles: 'ideation', 'research', 'analysis', 'challenge', 'synthesis'
    
    -- Input/Output
    input_prompt TEXT,
    output_content TEXT,
    parsed_output JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
    error_message TEXT,
    
    -- Metrics
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10, 4) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_brainstorm_rounds_session ON public.brainstorm_rounds(session_id);
CREATE INDEX idx_brainstorm_rounds_status ON public.brainstorm_rounds(status);

-- RLS
ALTER TABLE public.brainstorm_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rounds" ON public.brainstorm_rounds
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage rounds" ON public.brainstorm_rounds
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

-- 4. Brainstorm Insights table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.brainstorm_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.brainstorm_sessions(id) ON DELETE CASCADE NOT NULL,
    round_id UUID REFERENCES public.brainstorm_rounds(id) ON DELETE CASCADE,
    
    -- Insight content
    type VARCHAR(30) NOT NULL 
      CHECK (type IN (
        'idea',           -- Ý tưởng mới từ SPARK
        'market_data',    -- Data thị trường từ RADAR
        'competitor',     -- Thông tin đối thủ từ RADAR
        'strength',       -- Điểm mạnh từ LENS
        'weakness',       -- Điểm yếu từ LENS
        'opportunity',    -- Cơ hội từ LENS
        'threat',         -- Thách thức từ LENS
        'risk',           -- Rủi ro từ DEVIL
        'question',       -- Câu hỏi khó từ DEVIL
        'recommendation', -- Đề xuất từ LENS (synthesis)
        'next_step'       -- Bước tiếp theo từ LENS (synthesis)
      )),
    agent VARCHAR(20) NOT NULL CHECK (agent IN ('spark', 'lens', 'radar', 'devil')),
    
    title TEXT NOT NULL,
    content TEXT,
    
    -- Scoring (optional)
    score DECIMAL(3, 1) CHECK (score >= 0 AND score <= 10),
    confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Relationships
    parent_insight_id UUID REFERENCES public.brainstorm_insights(id) ON DELETE SET NULL,
    related_idea_index INTEGER, -- Links back to which idea this relates to
    
    -- Extra data
    metadata JSONB DEFAULT '{}',
    -- For market_data: { source: string, year: number, value: string }
    -- For competitor: { name: string, url: string, strengths: string[] }
    -- For risk: { severity: 'low'|'medium'|'high', mitigation: string }
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_brainstorm_insights_session ON public.brainstorm_insights(session_id);
CREATE INDEX idx_brainstorm_insights_round ON public.brainstorm_insights(round_id);
CREATE INDEX idx_brainstorm_insights_type ON public.brainstorm_insights(type);
CREATE INDEX idx_brainstorm_insights_agent ON public.brainstorm_insights(agent);

-- RLS
ALTER TABLE public.brainstorm_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.brainstorm_insights
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage insights" ON public.brainstorm_insights
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.brainstorm_sessions WHERE user_id = auth.uid()
        )
    );

-- 5. Update triggers
-- ═══════════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at for sessions
CREATE OR REPLACE FUNCTION update_brainstorm_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_brainstorm_session_timestamp
    BEFORE UPDATE ON public.brainstorm_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_brainstorm_session_timestamp();

-- 6. Helper views (optional but useful)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.brainstorm_sessions_with_stats AS
SELECT 
    bs.*,
    COUNT(DISTINCT br.id) AS total_rounds_completed,
    COUNT(DISTINCT bi.id) AS total_insights,
    COUNT(DISTINCT CASE WHEN bi.type = 'idea' THEN bi.id END) AS ideas_count,
    COUNT(DISTINCT CASE WHEN bi.type = 'risk' THEN bi.id END) AS risks_count,
    COUNT(DISTINCT CASE WHEN bi.type = 'question' THEN bi.id END) AS questions_count
FROM public.brainstorm_sessions bs
LEFT JOIN public.brainstorm_rounds br ON br.session_id = bs.id AND br.status = 'completed'
LEFT JOIN public.brainstorm_insights bi ON bi.session_id = bs.id
GROUP BY bs.id;
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 2: TYPESCRIPT TYPES
# ═══════════════════════════════════════════════════════════════════════════════

## 2.1 File: lib/types/brainstorm.ts

```typescript
// ═══════════════════════════════════════════════════════════════════════════════
//                         BRAINSTORM4 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// Agent types
export type AgentId = 'spark' | 'lens' | 'radar' | 'devil'

export interface Agent {
  id: AgentId
  name: string
  role: string
  description: string
  icon: string
  color: string
  bgColor: string
  model: string
}

export const AGENTS: Record<AgentId, Agent> = {
  spark: {
    id: 'spark',
    name: 'SPARK',
    role: 'The Ideator',
    description: 'Sáng tạo và phát triển ý tưởng theo nhiều hướng',
    icon: '💡',
    color: '#22c55e',
    bgColor: 'bg-green-500/10',
    model: 'gpt-4o',
  },
  lens: {
    id: 'lens',
    name: 'LENS',
    role: 'The Analyst',
    description: 'Phân tích logic, đánh giá tính khả thi',
    icon: '🔍',
    color: '#00d4ff',
    bgColor: 'bg-cyan-500/10',
    model: 'claude-3-5-sonnet-20241022',
  },
  radar: {
    id: 'radar',
    name: 'RADAR',
    role: 'The Researcher',
    description: 'Nghiên cứu thị trường, tìm data và xu hướng',
    icon: '📊',
    color: '#a855f7',
    bgColor: 'bg-purple-500/10',
    model: 'gemini-1.5-pro',
  },
  devil: {
    id: 'devil',
    name: 'DEVIL',
    role: 'The Challenger',
    description: 'Phản biện, đặt câu hỏi khó, tìm lỗ hổng',
    icon: '😈',
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    model: 'grok-beta',
  },
}

// Session types
export type SessionMode = 'quick' | 'deep'
export type SessionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type RoundStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
export type RoundRole = 'ideation' | 'research' | 'analysis' | 'challenge' | 'synthesis'

export type InsightType = 
  | 'idea' 
  | 'market_data' 
  | 'competitor'
  | 'strength' 
  | 'weakness' 
  | 'opportunity'
  | 'threat'
  | 'risk' 
  | 'question' 
  | 'recommendation'
  | 'next_step'

export type VerdictRecommendation = 'proceed' | 'pivot' | 'drop'

// Database types
export interface BrainstormSession {
  id: string
  user_id: string
  project_id: string | null
  title: string
  original_idea: string
  mode: SessionMode
  quick_mode_agent: AgentId | null
  status: SessionStatus
  current_round: number
  total_rounds: number
  final_verdict: FinalVerdict | null
  total_tokens: number
  total_cost: number
  duration_seconds: number
  created_at: string
  started_at: string | null
  completed_at: string | null
  updated_at: string
  // Joined data
  project?: {
    id: string
    title: string
    color: string
  }
  rounds?: BrainstormRound[]
  insights?: BrainstormInsight[]
}

export interface BrainstormRound {
  id: string
  session_id: string
  round_number: number
  agent: AgentId
  role: RoundRole
  input_prompt: string | null
  output_content: string | null
  parsed_output: ParsedRoundOutput | null
  status: RoundStatus
  error_message: string | null
  tokens_input: number
  tokens_output: number
  cost: number
  duration_ms: number
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface BrainstormInsight {
  id: string
  session_id: string
  round_id: string | null
  type: InsightType
  agent: AgentId
  title: string
  content: string | null
  score: number | null
  confidence: number | null
  parent_insight_id: string | null
  related_idea_index: number | null
  metadata: Record<string, unknown>
  created_at: string
}

// Parsed outputs from AI
export interface ParsedRoundOutput {
  ideas?: ParsedIdea[]
  market_data?: ParsedMarketData
  analysis?: ParsedAnalysis
  challenges?: ParsedChallenge[]
  synthesis?: ParsedSynthesis
}

export interface ParsedIdea {
  index: number
  title: string
  description: string
  unique_value: string
}

export interface ParsedMarketData {
  market_size: string
  growth_rate: string
  trends: string[]
  competitors: {
    name: string
    description: string
    strengths: string[]
  }[]
  opportunities: string[]
  sources: string[]
}

export interface ParsedAnalysis {
  feasibility_score: number
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  resource_requirements: string[]
  timeline_estimate: string
}

export interface ParsedChallenge {
  type: 'risk' | 'question'
  severity?: 'low' | 'medium' | 'high'
  title: string
  description: string
  mitigation?: string
}

export interface ParsedSynthesis {
  overall_score: number
  recommendation: VerdictRecommendation
  summary: string
  top_ideas: number[]
  key_risks: string[]
  next_steps: string[]
}

export interface FinalVerdict {
  score: number
  summary: string
  recommendation: VerdictRecommendation
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  next_steps: string[]
}

// Round configuration for Deep Mode
export interface RoundConfig {
  round_number: number
  agent: AgentId
  role: RoundRole
  title: string
  description: string
}

export const DEEP_MODE_ROUNDS: RoundConfig[] = [
  {
    round_number: 1,
    agent: 'spark',
    role: 'ideation',
    title: 'Ideation',
    description: 'Phát triển ý tưởng theo nhiều hướng',
  },
  {
    round_number: 2,
    agent: 'radar',
    role: 'research',
    title: 'Research',
    description: 'Nghiên cứu thị trường và đối thủ',
  },
  {
    round_number: 3,
    agent: 'lens',
    role: 'analysis',
    title: 'Analysis',
    description: 'Phân tích SWOT và tính khả thi',
  },
  {
    round_number: 4,
    agent: 'devil',
    role: 'challenge',
    title: 'Challenge',
    description: 'Phản biện và đặt câu hỏi khó',
  },
  {
    round_number: 5,
    agent: 'lens',
    role: 'synthesis',
    title: 'Synthesis',
    description: 'Tổng hợp và đưa ra verdict',
  },
]

// API types
export interface CreateSessionInput {
  title: string
  original_idea: string
  mode: SessionMode
  quick_mode_agent?: AgentId
  project_id?: string
}

export interface SessionStreamEvent {
  type: 'round_start' | 'round_progress' | 'round_complete' | 'round_error' | 'session_complete' | 'session_error'
  round_number?: number
  agent?: AgentId
  progress?: number
  content?: string
  parsed_output?: ParsedRoundOutput
  final_verdict?: FinalVerdict
  error?: string
}

// UI State types
export interface BrainstormUIState {
  activeTab: 'ideas' | 'research' | 'analysis' | 'challenges' | 'summary'
  selectedInsightId: string | null
  isPlaying: boolean
}
```

## 2.2 Update: lib/types/database.ts (thêm vào file hiện có)

```typescript
// Thêm vào cuối file database.ts hiện có

// Project status update
export type ProjectStatus = 'idea' | 'focus' | 'active' | 'backlog' | 'archived'

// Re-export brainstorm types
export * from './brainstorm'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 3: ZUSTAND STORE
# ═══════════════════════════════════════════════════════════════════════════════

## 3.1 File: lib/stores/brainstorm-store.ts

```typescript
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
    
    const { data, error } = await supabase
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
    
    set({ sessions: data || [], isLoading: false })
  },

  // Load single session with all related data
  loadSession: async (sessionId) => {
    set({ isLoading: true })
    const supabase = createClient()
    
    // Load session
    const { data: session, error: sessionError } = await supabase
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
    const { data: rounds } = await supabase
      .from('brainstorm_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true })
    
    // Load insights
    const { data: insights } = await supabase
      .from('brainstorm_insights')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    
    set({
      currentSession: session,
      currentRounds: rounds || [],
      currentInsights: insights || [],
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
    
    const { data, error } = await supabase
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
      sessions: [data, ...state.sessions],
      isCreating: false,
    }))
    
    return data
  },

  // Delete session
  deleteSession: async (sessionId) => {
    const supabase = createClient()
    
    const { error } = await supabase
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
    
    await supabase
      .from('brainstorm_sessions')
      .update({ status: 'cancelled' })
      .eq('id', sessionId)
    
    set((state) => ({
      isRunning: false,
      currentSession: state.currentSession?.id === sessionId
        ? { ...state.currentSession, status: 'cancelled' }
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
          supabase
            .from('brainstorm_rounds')
            .select('*')
            .eq('session_id', sessionId)
            .order('round_number', { ascending: true })
            .then(({ data }) => {
              if (data) set({ currentRounds: data })
            })
          
          supabase
            .from('brainstorm_insights')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .then(({ data }) => {
              if (data) set({ currentInsights: data })
            })
        }
        set({ streamContent: '', streamProgress: 0 })
        break
        
      case 'session_complete':
        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                status: 'completed',
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
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 4: API ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

## 4.1 File: app/api/brainstorm/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateSessionInput } from '@/lib/types/brainstorm'

// GET /api/brainstorm - List all sessions
export async function GET() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data, error } = await supabase
    .from('brainstorm_sessions')
    .select(`
      *,
      project:projects(id, title, color)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

// POST /api/brainstorm - Create new session
export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body: CreateSessionInput = await request.json()
  
  // Validate input
  if (!body.title || !body.original_idea) {
    return NextResponse.json(
      { error: 'Title and original_idea are required' },
      { status: 400 }
    )
  }
  
  const sessionData = {
    user_id: user.id,
    title: body.title,
    original_idea: body.original_idea,
    mode: body.mode || 'deep',
    quick_mode_agent: body.quick_mode_agent || null,
    project_id: body.project_id || null,
    status: 'pending',
    total_rounds: body.mode === 'deep' ? 5 : 1,
  }
  
  const { data, error } = await supabase
    .from('brainstorm_sessions')
    .insert(sessionData)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data, { status: 201 })
}
```

## 4.2 File: app/api/brainstorm/[id]/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/brainstorm/[id] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: session, error } = await supabase
    .from('brainstorm_sessions')
    .select(`
      *,
      project:projects(id, title, color)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  
  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }
  
  // Load rounds
  const { data: rounds } = await supabase
    .from('brainstorm_rounds')
    .select('*')
    .eq('session_id', params.id)
    .order('round_number', { ascending: true })
  
  // Load insights
  const { data: insights } = await supabase
    .from('brainstorm_insights')
    .select('*')
    .eq('session_id', params.id)
    .order('created_at', { ascending: true })
  
  return NextResponse.json({
    ...session,
    rounds: rounds || [],
    insights: insights || [],
  })
}

// DELETE /api/brainstorm/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { error } = await supabase
    .from('brainstorm_sessions')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

## 4.3 File: app/api/brainstorm/[id]/start/route.ts

```typescript
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runBrainstormSession } from '@/lib/services/brainstorm-service'

// POST /api/brainstorm/[id]/start - Start brainstorm (SSE stream)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Verify session ownership
  const { data: session, error } = await supabase
    .from('brainstorm_sessions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()
  
  if (error || !session) {
    return new Response('Session not found', { status: 404 })
  }
  
  if (session.status !== 'pending') {
    return new Response('Session already started or completed', { status: 400 })
  }
  
  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }
      
      try {
        await runBrainstormSession(session, sendEvent, supabase)
      } catch (error) {
        sendEvent({
          type: 'session_error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        controller.close()
      }
    },
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## 4.4 File: app/api/brainstorm/[id]/cancel/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/brainstorm/[id]/cancel - Cancel session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { error } = await supabase
    .from('brainstorm_sessions')
    .update({ status: 'cancelled' })
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'running')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 5: AI AGENT SERVICES
# ═══════════════════════════════════════════════════════════════════════════════

## 5.1 File: lib/services/brainstorm-service.ts

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BrainstormSession,
  BrainstormRound,
  AgentId,
  RoundRole,
  ParsedRoundOutput,
  FinalVerdict,
  DEEP_MODE_ROUNDS,
} from '@/lib/types/brainstorm'
import { callSparkAgent } from './ai-agents/spark-agent'
import { callLensAgent } from './ai-agents/lens-agent'
import { callRadarAgent } from './ai-agents/radar-agent'
import { callDevilAgent } from './ai-agents/devil-agent'

type SendEventFn = (data: object) => void

const DEEP_MODE_ROUNDS_CONFIG = [
  { round_number: 1, agent: 'spark' as AgentId, role: 'ideation' as RoundRole },
  { round_number: 2, agent: 'radar' as AgentId, role: 'research' as RoundRole },
  { round_number: 3, agent: 'lens' as AgentId, role: 'analysis' as RoundRole },
  { round_number: 4, agent: 'devil' as AgentId, role: 'challenge' as RoundRole },
  { round_number: 5, agent: 'lens' as AgentId, role: 'synthesis' as RoundRole },
]

export async function runBrainstormSession(
  session: BrainstormSession,
  sendEvent: SendEventFn,
  supabase: SupabaseClient
) {
  const startTime = Date.now()
  
  // Update session to running
  await supabase
    .from('brainstorm_sessions')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', session.id)
  
  let totalTokens = 0
  let totalCost = 0
  const allRoundOutputs: ParsedRoundOutput[] = []
  
  try {
    if (session.mode === 'quick') {
      // Quick mode: single agent
      const agent = session.quick_mode_agent || 'spark'
      const result = await runSingleRound(
        session,
        { round_number: 1, agent, role: 'ideation' },
        sendEvent,
        supabase,
        []
      )
      
      totalTokens = result.tokens
      totalCost = result.cost
      allRoundOutputs.push(result.parsed_output)
      
    } else {
      // Deep mode: 5 rounds
      for (const roundConfig of DEEP_MODE_ROUNDS_CONFIG) {
        sendEvent({
          type: 'round_start',
          round_number: roundConfig.round_number,
          agent: roundConfig.agent,
        })
        
        const result = await runSingleRound(
          session,
          roundConfig,
          sendEvent,
          supabase,
          allRoundOutputs
        )
        
        totalTokens += result.tokens
        totalCost += result.cost
        allRoundOutputs.push(result.parsed_output)
        
        // Update session progress
        await supabase
          .from('brainstorm_sessions')
          .update({ current_round: roundConfig.round_number })
          .eq('id', session.id)
      }
    }
    
    // Generate final verdict from synthesis round
    const finalVerdict = generateFinalVerdict(allRoundOutputs)
    
    // Complete session
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    
    await supabase
      .from('brainstorm_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_tokens: totalTokens,
        total_cost: totalCost,
        duration_seconds: durationSeconds,
        final_verdict: finalVerdict,
      })
      .eq('id', session.id)
    
    sendEvent({
      type: 'session_complete',
      final_verdict: finalVerdict,
    })
    
  } catch (error) {
    await supabase
      .from('brainstorm_sessions')
      .update({ status: 'failed' })
      .eq('id', session.id)
    
    throw error
  }
}

async function runSingleRound(
  session: BrainstormSession,
  config: { round_number: number; agent: AgentId; role: RoundRole },
  sendEvent: SendEventFn,
  supabase: SupabaseClient,
  previousOutputs: ParsedRoundOutput[]
): Promise<{
  tokens: number
  cost: number
  parsed_output: ParsedRoundOutput
}> {
  const roundStartTime = Date.now()
  
  // Create round record
  const { data: round } = await supabase
    .from('brainstorm_rounds')
    .insert({
      session_id: session.id,
      round_number: config.round_number,
      agent: config.agent,
      role: config.role,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  try {
    // Build context from previous rounds
    const context = buildContext(session, config.role, previousOutputs)
    
    // Call appropriate agent
    const agentResult = await callAgent(
      config.agent,
      config.role,
      context,
      (content, progress) => {
        sendEvent({
          type: 'round_progress',
          round_number: config.round_number,
          agent: config.agent,
          content,
          progress,
        })
      }
    )
    
    // Save insights from parsed output
    if (agentResult.parsed_output) {
      await saveInsights(
        session.id,
        round?.id || '',
        config.agent,
        agentResult.parsed_output,
        supabase
      )
    }
    
    // Update round as completed
    const durationMs = Date.now() - roundStartTime
    
    await supabase
      .from('brainstorm_rounds')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_content: agentResult.raw_content,
        parsed_output: agentResult.parsed_output,
        tokens_input: agentResult.tokens_input,
        tokens_output: agentResult.tokens_output,
        cost: agentResult.cost,
        duration_ms: durationMs,
      })
      .eq('id', round?.id)
    
    sendEvent({
      type: 'round_complete',
      round_number: config.round_number,
      agent: config.agent,
      parsed_output: agentResult.parsed_output,
    })
    
    return {
      tokens: agentResult.tokens_input + agentResult.tokens_output,
      cost: agentResult.cost,
      parsed_output: agentResult.parsed_output,
    }
    
  } catch (error) {
    await supabase
      .from('brainstorm_rounds')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', round?.id)
    
    sendEvent({
      type: 'round_error',
      round_number: config.round_number,
      agent: config.agent,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    
    throw error
  }
}

function buildContext(
  session: BrainstormSession,
  role: RoundRole,
  previousOutputs: ParsedRoundOutput[]
): string {
  let context = `# Ý tưởng gốc\n${session.original_idea}\n\n`
  
  if (role === 'research' && previousOutputs[0]?.ideas) {
    context += `# Các hướng phát triển từ SPARK\n`
    previousOutputs[0].ideas.forEach((idea, i) => {
      context += `${i + 1}. **${idea.title}**: ${idea.description}\n`
    })
    context += '\n'
  }
  
  if (role === 'analysis') {
    if (previousOutputs[0]?.ideas) {
      context += `# Các ý tưởng\n`
      previousOutputs[0].ideas.forEach((idea, i) => {
        context += `${i + 1}. **${idea.title}**: ${idea.description}\n`
      })
      context += '\n'
    }
    if (previousOutputs[1]?.market_data) {
      const md = previousOutputs[1].market_data
      context += `# Dữ liệu thị trường từ RADAR\n`
      context += `- Market size: ${md.market_size}\n`
      context += `- Growth rate: ${md.growth_rate}\n`
      context += `- Trends: ${md.trends.join(', ')}\n`
      context += `- Competitors: ${md.competitors.map(c => c.name).join(', ')}\n\n`
    }
  }
  
  if (role === 'challenge') {
    // Include all previous context
    if (previousOutputs[0]?.ideas) {
      context += `# Ý tưởng\n`
      previousOutputs[0].ideas.forEach((idea, i) => {
        context += `${i + 1}. ${idea.title}\n`
      })
      context += '\n'
    }
    if (previousOutputs[2]?.analysis) {
      const analysis = previousOutputs[2].analysis
      context += `# Phân tích từ LENS\n`
      context += `- Feasibility: ${analysis.feasibility_score}/10\n`
      context += `- Strengths: ${analysis.strengths.join(', ')}\n`
      context += `- Weaknesses: ${analysis.weaknesses.join(', ')}\n\n`
    }
  }
  
  if (role === 'synthesis') {
    // Include everything
    context += `# Tổng hợp từ tất cả các rounds\n\n`
    
    if (previousOutputs[0]?.ideas) {
      context += `## Ý tưởng (SPARK)\n`
      previousOutputs[0].ideas.forEach((idea, i) => {
        context += `${i + 1}. **${idea.title}**: ${idea.description}\n`
      })
      context += '\n'
    }
    
    if (previousOutputs[1]?.market_data) {
      const md = previousOutputs[1].market_data
      context += `## Thị trường (RADAR)\n`
      context += `- Size: ${md.market_size}, Growth: ${md.growth_rate}\n`
      context += `- Competitors: ${md.competitors.length}\n\n`
    }
    
    if (previousOutputs[2]?.analysis) {
      const a = previousOutputs[2].analysis
      context += `## Phân tích (LENS)\n`
      context += `- Feasibility: ${a.feasibility_score}/10\n`
      context += `- SWOT summary available\n\n`
    }
    
    if (previousOutputs[3]?.challenges) {
      context += `## Thách thức (DEVIL)\n`
      previousOutputs[3].challenges.forEach((c, i) => {
        context += `${i + 1}. [${c.severity?.toUpperCase()}] ${c.title}\n`
      })
      context += '\n'
    }
  }
  
  return context
}

async function callAgent(
  agent: AgentId,
  role: RoundRole,
  context: string,
  onProgress: (content: string, progress: number) => void
): Promise<{
  raw_content: string
  parsed_output: ParsedRoundOutput
  tokens_input: number
  tokens_output: number
  cost: number
}> {
  switch (agent) {
    case 'spark':
      return callSparkAgent(context, role, onProgress)
    case 'lens':
      return callLensAgent(context, role, onProgress)
    case 'radar':
      return callRadarAgent(context, role, onProgress)
    case 'devil':
      return callDevilAgent(context, role, onProgress)
    default:
      throw new Error(`Unknown agent: ${agent}`)
  }
}

async function saveInsights(
  sessionId: string,
  roundId: string,
  agent: AgentId,
  output: ParsedRoundOutput,
  supabase: SupabaseClient
) {
  const insights: Array<{
    session_id: string
    round_id: string
    agent: AgentId
    type: string
    title: string
    content: string | null
    score: number | null
    metadata: Record<string, unknown>
  }> = []
  
  // Ideas from SPARK
  if (output.ideas) {
    output.ideas.forEach((idea, index) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'idea',
        title: idea.title,
        content: idea.description,
        score: null,
        metadata: { index, unique_value: idea.unique_value },
      })
    })
  }
  
  // Market data from RADAR
  if (output.market_data) {
    insights.push({
      session_id: sessionId,
      round_id: roundId,
      agent,
      type: 'market_data',
      title: 'Market Overview',
      content: `Size: ${output.market_data.market_size}, Growth: ${output.market_data.growth_rate}`,
      score: null,
      metadata: output.market_data,
    })
    
    output.market_data.competitors.forEach((comp) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'competitor',
        title: comp.name,
        content: comp.description,
        score: null,
        metadata: { strengths: comp.strengths },
      })
    })
  }
  
  // Analysis from LENS
  if (output.analysis) {
    const a = output.analysis
    a.strengths.forEach((s) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'strength',
        title: s,
        content: null,
        score: null,
        metadata: {},
      })
    })
    a.weaknesses.forEach((w) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'weakness',
        title: w,
        content: null,
        score: null,
        metadata: {},
      })
    })
    a.opportunities.forEach((o) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'opportunity',
        title: o,
        content: null,
        score: null,
        metadata: {},
      })
    })
    a.threats.forEach((t) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'threat',
        title: t,
        content: null,
        score: null,
        metadata: {},
      })
    })
  }
  
  // Challenges from DEVIL
  if (output.challenges) {
    output.challenges.forEach((c) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: c.type,
        title: c.title,
        content: c.description,
        score: null,
        metadata: { severity: c.severity, mitigation: c.mitigation },
      })
    })
  }
  
  // Synthesis recommendations
  if (output.synthesis) {
    output.synthesis.next_steps.forEach((step) => {
      insights.push({
        session_id: sessionId,
        round_id: roundId,
        agent,
        type: 'next_step',
        title: step,
        content: null,
        score: null,
        metadata: {},
      })
    })
  }
  
  if (insights.length > 0) {
    await supabase.from('brainstorm_insights').insert(insights)
  }
}

function generateFinalVerdict(outputs: ParsedRoundOutput[]): FinalVerdict {
  const synthesis = outputs[4]?.synthesis
  const analysis = outputs[2]?.analysis
  const challenges = outputs[3]?.challenges || []
  
  return {
    score: synthesis?.overall_score || analysis?.feasibility_score || 5,
    summary: synthesis?.summary || 'Chưa có tổng kết',
    recommendation: synthesis?.recommendation || 'pivot',
    strengths: analysis?.strengths || [],
    weaknesses: analysis?.weaknesses || [],
    risks: challenges.filter(c => c.type === 'risk').map(c => c.title),
    next_steps: synthesis?.next_steps || [],
  }
}
```

## 5.2 File: lib/services/ai-agents/spark-agent.ts

```typescript
import OpenAI from 'openai'
import type { RoundRole, ParsedRoundOutput, ParsedIdea } from '@/lib/types/brainstorm'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SPARK_SYSTEM_PROMPT = `Bạn là SPARK - The Ideator, một AI chuyên về sáng tạo và phát triển ý tưởng.

Phong cách của bạn:
- Sáng tạo, đột phá, không giới hạn
- Luôn tìm góc nhìn mới, unique
- Enthusiastic và positive
- Focus vào possibilities, không phải limitations

Khi brainstorm, bạn sẽ:
1. Phát triển ý tưởng theo nhiều hướng khác nhau
2. Tìm unique value proposition cho mỗi hướng
3. Đề xuất cách differentiate với competitors
4. Nghĩ về scalability và growth potential

Output của bạn PHẢI theo format JSON sau:
{
  "ideas": [
    {
      "index": 1,
      "title": "Tên ngắn gọn",
      "description": "Mô tả chi tiết 2-3 câu",
      "unique_value": "Điểm khác biệt chính"
    }
  ]
}

Luôn đưa ra 3-5 ý tưởng khác nhau.`

type ProgressCallback = (content: string, progress: number) => void

export async function callSparkAgent(
  context: string,
  role: RoundRole,
  onProgress: ProgressCallback
): Promise<{
  raw_content: string
  parsed_output: ParsedRoundOutput
  tokens_input: number
  tokens_output: number
  cost: number
}> {
  const userPrompt = `${context}

Hãy phát triển ý tưởng này theo 3-5 hướng khác nhau. Mỗi hướng cần có unique value proposition rõ ràng.

Trả lời bằng JSON theo format đã định.`

  let fullContent = ''
  let tokensInput = 0
  let tokensOutput = 0
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SPARK_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    stream: true,
    stream_options: { include_usage: true },
  })
  
  let chunkCount = 0
  const estimatedChunks = 50
  
  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      fullContent += chunk.choices[0].delta.content
      chunkCount++
      onProgress(chunk.choices[0].delta.content, Math.min(chunkCount / estimatedChunks * 100, 95))
    }
    if (chunk.usage) {
      tokensInput = chunk.usage.prompt_tokens
      tokensOutput = chunk.usage.completion_tokens
    }
  }
  
  onProgress('', 100)
  
  // Parse JSON response
  let parsed: { ideas: ParsedIdea[] }
  try {
    parsed = JSON.parse(fullContent)
  } catch {
    parsed = { ideas: [] }
  }
  
  // Calculate cost (GPT-4o: $0.005/1K input, $0.015/1K output)
  const cost = (tokensInput * 0.005 + tokensOutput * 0.015) / 1000
  
  return {
    raw_content: fullContent,
    parsed_output: { ideas: parsed.ideas },
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cost,
  }
}
```

## 5.3 File: lib/services/ai-agents/lens-agent.ts

```typescript
import Anthropic from '@anthropic-ai/sdk'
import type { RoundRole, ParsedRoundOutput, ParsedAnalysis, ParsedSynthesis } from '@/lib/types/brainstorm'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const LENS_ANALYSIS_PROMPT = `Bạn là LENS - The Analyst, một AI chuyên về phân tích logic và đánh giá tính khả thi.

Phong cách của bạn:
- Logic, có cấu trúc, objective
- Dựa trên data và evidence
- Balanced - thấy cả strengths và weaknesses
- Practical và realistic

Khi phân tích, bạn sẽ thực hiện:
1. Đánh giá feasibility score (1-10)
2. Phân tích SWOT đầy đủ
3. Estimate resource requirements
4. Dự đoán timeline hợp lý

Output PHẢI theo format JSON:
{
  "analysis": {
    "feasibility_score": 7,
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
    "opportunities": ["cơ hội 1", "cơ hội 2"],
    "threats": ["thách thức 1", "thách thức 2"],
    "resource_requirements": ["nguồn lực 1", "nguồn lực 2"],
    "timeline_estimate": "3-6 tháng"
  }
}`

const LENS_SYNTHESIS_PROMPT = `Bạn là LENS - The Analyst, đang thực hiện tổng hợp cuối cùng.

Nhiệm vụ: Tổng hợp tất cả insights từ các rounds trước và đưa ra verdict cuối cùng.

Output PHẢI theo format JSON:
{
  "synthesis": {
    "overall_score": 7.5,
    "recommendation": "proceed|pivot|drop",
    "summary": "Tóm tắt 2-3 câu về ý tưởng",
    "top_ideas": [1, 2],
    "key_risks": ["rủi ro quan trọng nhất"],
    "next_steps": ["bước 1", "bước 2", "bước 3"]
  }
}

recommendation:
- "proceed": Score >= 7, ít rủi ro critical
- "pivot": Score 5-7, cần điều chỉnh significant
- "drop": Score < 5, quá nhiều blockers`

type ProgressCallback = (content: string, progress: number) => void

export async function callLensAgent(
  context: string,
  role: RoundRole,
  onProgress: ProgressCallback
): Promise<{
  raw_content: string
  parsed_output: ParsedRoundOutput
  tokens_input: number
  tokens_output: number
  cost: number
}> {
  const systemPrompt = role === 'synthesis' ? LENS_SYNTHESIS_PROMPT : LENS_ANALYSIS_PROMPT
  const userPrompt = role === 'synthesis'
    ? `${context}\n\nHãy tổng hợp và đưa ra verdict cuối cùng. Trả lời bằng JSON.`
    : `${context}\n\nHãy phân tích SWOT và đánh giá tính khả thi. Trả lời bằng JSON.`

  let fullContent = ''
  let tokensInput = 0
  let tokensOutput = 0
  
  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  
  let chunkCount = 0
  const estimatedChunks = 50
  
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text
      chunkCount++
      onProgress(event.delta.text, Math.min(chunkCount / estimatedChunks * 100, 95))
    }
  }
  
  const finalMessage = await stream.finalMessage()
  tokensInput = finalMessage.usage.input_tokens
  tokensOutput = finalMessage.usage.output_tokens
  
  onProgress('', 100)
  
  // Parse JSON
  let parsed: ParsedRoundOutput = {}
  try {
    // Extract JSON from response (might be wrapped in markdown)
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      if (role === 'synthesis') {
        parsed = { synthesis: data.synthesis as ParsedSynthesis }
      } else {
        parsed = { analysis: data.analysis as ParsedAnalysis }
      }
    }
  } catch {
    // Fallback
  }
  
  // Cost (Claude 3.5 Sonnet: $0.003/1K input, $0.015/1K output)
  const cost = (tokensInput * 0.003 + tokensOutput * 0.015) / 1000
  
  return {
    raw_content: fullContent,
    parsed_output: parsed,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cost,
  }
}
```

## 5.4 File: lib/services/ai-agents/radar-agent.ts

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RoundRole, ParsedRoundOutput, ParsedMarketData } from '@/lib/types/brainstorm'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

const RADAR_SYSTEM_PROMPT = `Bạn là RADAR - The Researcher, một AI chuyên về nghiên cứu thị trường.

Phong cách của bạn:
- Data-driven, fact-based
- Tìm kiếm và tổng hợp thông tin thị trường
- Identify trends và patterns
- Competitive analysis

Khi nghiên cứu, bạn sẽ:
1. Estimate market size và growth rate
2. Identify key trends trong ngành
3. List competitors chính và strengths của họ
4. Tìm market opportunities

Output PHẢI theo format JSON:
{
  "market_data": {
    "market_size": "$X billion (năm)",
    "growth_rate": "X% CAGR",
    "trends": ["trend 1", "trend 2", "trend 3"],
    "competitors": [
      {
        "name": "Tên competitor",
        "description": "Mô tả ngắn",
        "strengths": ["strength 1", "strength 2"]
      }
    ],
    "opportunities": ["opportunity 1", "opportunity 2"],
    "sources": ["nguồn tham khảo"]
  }
}

Lưu ý: Dựa trên kiến thức của bạn, không cần search thực. Nếu không biết chính xác, hãy estimate hợp lý.`

type ProgressCallback = (content: string, progress: number) => void

export async function callRadarAgent(
  context: string,
  role: RoundRole,
  onProgress: ProgressCallback
): Promise<{
  raw_content: string
  parsed_output: ParsedRoundOutput
  tokens_input: number
  tokens_output: number
  cost: number
}> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
  
  const prompt = `${RADAR_SYSTEM_PROMPT}

${context}

Hãy nghiên cứu thị trường cho ý tưởng này. Trả lời bằng JSON theo format đã định.`

  let fullContent = ''
  
  const result = await model.generateContentStream(prompt)
  
  let chunkCount = 0
  const estimatedChunks = 30
  
  for await (const chunk of result.stream) {
    const text = chunk.text()
    fullContent += text
    chunkCount++
    onProgress(text, Math.min(chunkCount / estimatedChunks * 100, 95))
  }
  
  onProgress('', 100)
  
  // Parse JSON
  let parsed: ParsedRoundOutput = {}
  try {
    const jsonMatch = fullContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      parsed = { market_data: data.market_data as ParsedMarketData }
    }
  } catch {
    // Fallback
  }
  
  // Estimate tokens (Gemini doesn't return exact counts in stream)
  const tokensInput = Math.ceil(prompt.length / 4)
  const tokensOutput = Math.ceil(fullContent.length / 4)
  
  // Cost (Gemini 1.5 Pro: $0.00125/1K input, $0.005/1K output)
  const cost = (tokensInput * 0.00125 + tokensOutput * 0.005) / 1000
  
  return {
    raw_content: fullContent,
    parsed_output: parsed,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cost,
  }
}
```

## 5.5 File: lib/services/ai-agents/devil-agent.ts

```typescript
import type { RoundRole, ParsedRoundOutput, ParsedChallenge } from '@/lib/types/brainstorm'

// Note: Grok API may change. This is a placeholder implementation.
// Replace with actual Grok API when available.

const DEVIL_SYSTEM_PROMPT = `Bạn là DEVIL - The Challenger, một AI chuyên về phản biện và đặt câu hỏi khó.

Phong cách của bạn:
- Skeptical nhưng constructive
- Thẳng thắn, không né tránh
- Tìm lỗ hổng và blind spots
- Đôi khi hài hước, sarcastic một chút

Khi challenge, bạn sẽ:
1. Tìm 3-5 rủi ro chính có thể khiến ý tưởng thất bại
2. Đặt những câu hỏi khó mà founder cần trả lời
3. Point out những assumptions chưa được validate
4. Suggest mitigation cho mỗi risk

Output PHẢI theo format JSON:
{
  "challenges": [
    {
      "type": "risk",
      "severity": "high|medium|low",
      "title": "Tên risk ngắn gọn",
      "description": "Giải thích chi tiết",
      "mitigation": "Cách giảm thiểu risk này"
    },
    {
      "type": "question",
      "title": "Câu hỏi khó",
      "description": "Tại sao câu hỏi này quan trọng"
    }
  ]
}

Đưa ra ít nhất 3 risks và 2 questions.`

type ProgressCallback = (content: string, progress: number) => void

export async function callDevilAgent(
  context: string,
  role: RoundRole,
  onProgress: ProgressCallback
): Promise<{
  raw_content: string
  parsed_output: ParsedRoundOutput
  tokens_input: number
  tokens_output: number
  cost: number
}> {
  // TODO: Replace with actual Grok API call
  // For now, using OpenAI as fallback with DEVIL personality
  
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({
    apiKey: process.env.XAI_API_KEY || process.env.OPENAI_API_KEY,
    baseURL: process.env.XAI_API_KEY ? 'https://api.x.ai/v1' : undefined,
  })
  
  const userPrompt = `${context}

Hãy challenge ý tưởng này. Tìm risks và đặt câu hỏi khó. Trả lời bằng JSON.`

  let fullContent = ''
  let tokensInput = 0
  let tokensOutput = 0
  
  const stream = await openai.chat.completions.create({
    model: process.env.XAI_API_KEY ? 'grok-beta' : 'gpt-4o',
    messages: [
      { role: 'system', content: DEVIL_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    stream: true,
    stream_options: { include_usage: true },
  })
  
  let chunkCount = 0
  const estimatedChunks = 40
  
  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      fullContent += chunk.choices[0].delta.content
      chunkCount++
      onProgress(chunk.choices[0].delta.content, Math.min(chunkCount / estimatedChunks * 100, 95))
    }
    if (chunk.usage) {
      tokensInput = chunk.usage.prompt_tokens
      tokensOutput = chunk.usage.completion_tokens
    }
  }
  
  onProgress('', 100)
  
  // Parse JSON
  let parsed: { challenges: ParsedChallenge[] } = { challenges: [] }
  try {
    parsed = JSON.parse(fullContent)
  } catch {
    // Fallback
  }
  
  // Cost (estimate)
  const cost = (tokensInput * 0.005 + tokensOutput * 0.015) / 1000
  
  return {
    raw_content: fullContent,
    parsed_output: { challenges: parsed.challenges },
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cost,
  }
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 6: UI COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 6.1 File: components/brainstorm/agent-avatar.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import { AGENTS, type AgentId } from '@/lib/types/brainstorm'

interface AgentAvatarProps {
  agent: AgentId
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showRole?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-lg',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-16 h-16 text-4xl',
}

export function AgentAvatar({
  agent,
  size = 'md',
  showName = false,
  showRole = false,
  className,
}: AgentAvatarProps) {
  const agentData = AGENTS[agent]
  
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          agentData.bgColor
        )}
        style={{ borderColor: agentData.color, borderWidth: 2 }}
      >
        {agentData.icon}
      </div>
      {(showName || showRole) && (
        <div>
          {showName && (
            <p className="font-bold text-foreground\" style={{ color: agentData.color }}>
              {agentData.name}
            </p>
          )}
          {showRole && (
            <p className="text-sm text-foreground-secondary">{agentData.role}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

## 6.2 File: components/brainstorm/session-card.tsx

```typescript
'use client'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Clock, MessageSquare, Trash2, Play, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, Badge, Button } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import type { BrainstormSession } from '@/lib/types/brainstorm'
import { AGENTS } from '@/lib/types/brainstorm'

interface SessionCardProps {
  session: BrainstormSession
  onDelete?: (id: string) => void
}

const statusConfig = {
  pending: { label: 'Chờ bắt đầu', variant: 'secondary' as const },
  running: { label: 'Đang chạy', variant: 'warning' as const },
  completed: { label: 'Hoàn thành', variant: 'success' as const },
  failed: { label: 'Lỗi', variant: 'danger' as const },
  cancelled: { label: 'Đã hủy', variant: 'secondary' as const },
}

export function SessionCard({ session, onDelete }: SessionCardProps) {
  const router = useRouter()
  const status = statusConfig[session.status]
  
  const timeAgo = formatDistanceToNow(new Date(session.created_at), {
    addSuffix: true,
    locale: vi,
  })
  
  const handleClick = () => {
    router.push(`/brainstorm/${session.id}`)
  }
  
  return (
    <Card className="hover:border-cyan/30 transition-colors cursor-pointer\" onClick={handleClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">
            {session.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-foreground-secondary">
            <span>{timeAgo}</span>
            {session.duration_seconds > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                </span>
              </>
            )}
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      
      {/* Idea preview */}
      <p className="text-foreground-secondary text-sm mb-4 line-clamp-2">
        {session.original_idea}
      </p>
      
      {/* Progress for running sessions */}
      {session.status === 'running' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground-secondary">
              Round {session.current_round}/{session.total_rounds}
            </span>
            <span className="text-cyan">
              {Math.round((session.current_round / session.total_rounds) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan to-purple transition-all"
              style={{ width: `${(session.current_round / session.total_rounds) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Verdict for completed sessions */}
      {session.status === 'completed' && session.final_verdict && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">
              {session.final_verdict.score >= 7 ? '🟢' : session.final_verdict.score >= 5 ? '🟡' : '🔴'}
            </span>
            <span className="font-semibold text-foreground">
              {session.final_verdict.score}/10
            </span>
            <Badge
              variant={
                session.final_verdict.recommendation === 'proceed'
                  ? 'success'
                  : session.final_verdict.recommendation === 'pivot'
                  ? 'warning'
                  : 'danger'
              }
              size="sm"
            >
              {session.final_verdict.recommendation === 'proceed'
                ? 'Tiến hành'
                : session.final_verdict.recommendation === 'pivot'
                ? 'Điều chỉnh'
                : 'Dừng lại'}
            </Badge>
          </div>
          <p className="text-sm text-foreground-secondary line-clamp-2">
            {session.final_verdict.summary}
          </p>
        </div>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-1">
          {session.mode === 'deep' ? (
            Object.keys(AGENTS).map((agentId) => (
              <AgentAvatar key={agentId} agent={agentId as any} size="sm" />
            ))
          ) : (
            session.quick_mode_agent && (
              <AgentAvatar agent={session.quick_mode_agent} size="sm" showName />
            )
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(session.id)
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button variant="secondary" size="sm">
            {session.status === 'pending' ? (
              <>
                <Play className="w-4 h-4 mr-1" /> Bắt đầu
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" /> Xem
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

## 6.3 File: components/brainstorm/new-session-modal.tsx

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Brain, Zap } from 'lucide-react'
import { Modal, Button, Input } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUser } from '@/lib/hooks/use-user'
import { AGENTS, type AgentId, type SessionMode } from '@/lib/types/brainstorm'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  original_idea: z.string().min(10, 'Vui lòng mô tả ý tưởng (ít nhất 10 ký tự)'),
})

type FormData = z.infer<typeof schema>

interface NewSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prefilledProjectId?: string
  onSuccess?: (sessionId: string) => void
}

export function NewSessionModal({
  open,
  onOpenChange,
  prefilledProjectId,
  onSuccess,
}: NewSessionModalProps) {
  const { user } = useUser()
  const { createSession, isCreating } = useBrainstormStore()
  const { projects, loadProjects } = useProjectStore()
  
  const [mode, setMode] = useState<SessionMode>('deep')
  const [quickAgent, setQuickAgent] = useState<AgentId>('spark')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(prefilledProjectId || null)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  
  // Load projects with status 'idea'
  useEffect(() => {
    if (user?.id && open) {
      loadProjects(user.id)
    }
  }, [user?.id, open, loadProjects])
  
  // Filter only idea projects
  const ideaProjects = projects.filter((p) => p.status === 'idea')
  
  // Prefill from selected project
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId)
      if (project) {
        setValue('title', project.title)
        setValue('original_idea', project.description || '')
      }
    }
  }, [selectedProjectId, projects, setValue])
  
  const onSubmit = async (data: FormData) => {
    if (!user?.id) return
    
    const session = await createSession(
      {
        title: data.title,
        original_idea: data.original_idea,
        mode,
        quick_mode_agent: mode === 'quick' ? quickAgent : undefined,
        project_id: selectedProjectId || undefined,
      },
      user.id
    )
    
    if (session) {
      reset()
      onOpenChange(false)
      onSuccess?.(session.id)
    }
  }
  
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="🧠 Brainstorm Mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label="Tiêu đề *"
          placeholder="VD: App học tiếng Anh qua phim"
          error={errors.title?.message}
          {...register('title')}
        />
        
        {/* Idea */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mô tả ý tưởng *
          </label>
          <textarea
            {...register('original_idea')}
            rows={4}
            placeholder="Mô tả chi tiết ý tưởng của bạn. Càng chi tiết, AI sẽ phân tích càng chính xác..."
            className={cn(
              'w-full bg-white/5 border rounded-xl px-4 py-3 text-foreground',
              'placeholder:text-foreground-muted resize-none',
              'focus:outline-none focus:border-cyan',
              errors.original_idea ? 'border-danger' : 'border-white/10'
            )}
          />
          {errors.original_idea && (
            <p className="text-danger text-sm mt-1">{errors.original_idea.message}</p>
          )}
        </div>
        
        {/* Select from existing idea projects */}
        {ideaProjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hoặc chọn từ Project có sẵn
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {ideaProjects.map((project) => (
                <label
                  key={project.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    'border',
                    selectedProjectId === project.id
                      ? 'border-cyan bg-cyan/10'
                      : 'border-white/10 hover:bg-white/5'
                  )}
                >
                  <input
                    type="radio"
                    name="project"
                    checked={selectedProjectId === project.id}
                    onChange={() => setSelectedProjectId(project.id)}
                    className="sr-only"
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-foreground flex-1">{project.title}</span>
                  {selectedProjectId === project.id && (
                    <span className="text-cyan">✓</span>
                  )}
                </label>
              ))}
            </div>
            {selectedProjectId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null)
                  reset()
                }}
                className="text-sm text-foreground-secondary hover:text-foreground mt-2"
              >
                Bỏ chọn
              </button>
            )}
          </div>
        )}
        
        {/* Mode selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Chọn mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                mode === 'quick'
                  ? 'border-cyan bg-cyan/10'
                  : 'border-white/10 hover:bg-white/5'
              )}
            >
              <Zap className={cn('w-6 h-6 mb-2', mode === 'quick' ? 'text-cyan' : 'text-foreground-secondary')} />
              <p className="font-semibold text-foreground">Quick Mode</p>
              <p className="text-sm text-foreground-secondary">1 AI • ~30 giây</p>
            </button>
            
            <button
              type="button"
              onClick={() => setMode('deep')}
              className={cn(
                'p-4 rounded-xl border text-left transition-all',
                mode === 'deep'
                  ? 'border-purple bg-purple/10'
                  : 'border-white/10 hover:bg-white/5'
              )}
            >
              <Brain className={cn('w-6 h-6 mb-2', mode === 'deep' ? 'text-purple' : 'text-foreground-secondary')} />
              <p className="font-semibold text-foreground">Deep Mode</p>
              <p className="text-sm text-foreground-secondary">4 AI • 5 rounds</p>
            </button>
          </div>
        </div>
        
        {/* Quick mode agent selection */}
        {mode === 'quick' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chọn AI
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(AGENTS) as AgentId[]).map((agentId) => {
                const agent = AGENTS[agentId]
                return (
                  <button
                    key={agentId}
                    type="button"
                    onClick={() => setQuickAgent(agentId)}
                    className={cn(
                      'p-3 rounded-xl border flex items-center gap-3 transition-all',
                      quickAgent === agentId
                        ? 'border-current bg-current/10'
                        : 'border-white/10 hover:bg-white/5'
                    )}
                    style={{
                      borderColor: quickAgent === agentId ? agent.color : undefined,
                    }}
                  >
                    <AgentAvatar agent={agentId} size="sm" />
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{agent.name}</p>
                      <p className="text-xs text-foreground-secondary">{agent.role}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" className="flex-1" isLoading={isCreating}>
            🚀 Bắt đầu
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

## 6.4 File: components/brainstorm/live-session.tsx

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Check, Circle, AlertCircle, XCircle } from 'lucide-react'
import { Card, Button, Progress } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { DEEP_MODE_ROUNDS, AGENTS, type AgentId, type RoundStatus } from '@/lib/types/brainstorm'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface LiveSessionProps {
  sessionId: string
}

const roundStatusIcons: Record<RoundStatus, React.ReactNode> = {
  pending: <Circle className="w-5 h-5 text-foreground-muted" />,
  running: <Loader2 className="w-5 h-5 text-cyan animate-spin" />,
  completed: <Check className="w-5 h-5 text-success" />,
  failed: <XCircle className="w-5 h-5 text-danger" />,
  skipped: <AlertCircle className="w-5 h-5 text-warning" />,
}

export function LiveSession({ sessionId }: LiveSessionProps) {
  const {
    currentSession,
    currentRounds,
    isRunning,
    streamContent,
    streamProgress,
    startSession,
    cancelSession,
    loadSession,
  } = useBrainstormStore()
  
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Load session on mount
  useEffect(() => {
    loadSession(sessionId)
  }, [sessionId, loadSession])
  
  // Auto-scroll to bottom when new content
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [streamContent])
  
  // Start session if pending
  useEffect(() => {
    if (currentSession?.status === 'pending' && !isRunning) {
      startSession(sessionId)
    }
  }, [currentSession?.status, isRunning, sessionId, startSession])
  
  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    )
  }
  
  const currentRoundConfig = DEEP_MODE_ROUNDS.find(
    (r) => r.round_number === currentSession.current_round
  )
  const currentAgent = currentRoundConfig?.agent
  const overallProgress = (currentSession.current_round / currentSession.total_rounds) * 100
  
  return (
    <div className="space-y-6">
      {/* Progress header */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{currentSession.title}</h2>
            <p className="text-foreground-secondary">
              {currentSession.mode === 'deep' ? 'Deep Mode • 5 Rounds' : 'Quick Mode'}
            </p>
          </div>
          {isRunning && (
            <Button variant="danger" onClick={() => cancelSession(sessionId)}>
              Hủy
            </Button>
          )}
        </div>
        
        {/* Overall progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">
              Round {currentSession.current_round}/{currentSession.total_rounds}
              {currentAgent && ` • ${AGENTS[currentAgent].name} đang làm việc...`}
            </span>
            <span className="text-cyan">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} />
        </div>
      </Card>
      
      {/* Rounds timeline */}
      <div className="grid grid-cols-5 gap-2">
        {DEEP_MODE_ROUNDS.map((round) => {
          const roundData = currentRounds.find((r) => r.round_number === round.round_number)
          const status: RoundStatus = roundData?.status || 
            (round.round_number < currentSession.current_round ? 'completed' :
             round.round_number === currentSession.current_round ? 'running' : 'pending')
          
          return (
            <div
              key={round.round_number}
              className={cn(
                'p-3 rounded-xl border text-center',
                status === 'running' && 'border-cyan bg-cyan/10',
                status === 'completed' && 'border-success/30 bg-success/5',
                status === 'pending' && 'border-white/10',
                status === 'failed' && 'border-danger/30 bg-danger/5'
              )}
            >
              <AgentAvatar agent={round.agent} size="sm" className="justify-center mb-2" />
              <p className="text-xs font-medium text-foreground">{round.title}</p>
              <div className="mt-2 flex justify-center">
                {roundStatusIcons[status]}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Live content stream */}
      <Card className="min-h-[400px] max-h-[600px] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          {currentAgent && (
            <>
              <AgentAvatar agent={currentAgent} size="md" showName showRole />
              {isRunning && (
                <div className="flex-1">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan to-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${streamProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto py-4 prose prose-invert prose-sm max-w-none"
        >
          {/* Previous rounds */}
          {currentRounds
            .filter((r) => r.status === 'completed' && r.output_content)
            .map((round) => (
              <div key={round.id} className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <AgentAvatar agent={round.agent} size="sm" />
                  <span className="font-semibold\" style={{ color: AGENTS[round.agent].color }}>
                    {AGENTS[round.agent].name}
                  </span>
                  <span className="text-foreground-muted">•</span>
                  <span className="text-foreground-secondary text-sm">
                    {DEEP_MODE_ROUNDS.find((r) => r.round_number === round.round_number)?.title}
                  </span>
                </div>
                <div className="pl-11">
                  <ReactMarkdown>{round.output_content || ''}</ReactMarkdown>
                </div>
              </div>
            ))}
          
          {/* Current streaming content */}
          <AnimatePresence>
            {streamContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pl-11"
              >
                <ReactMarkdown>{streamContent}</ReactMarkdown>
                {isRunning && (
                  <span className="inline-block w-2 h-4 bg-cyan animate-pulse ml-1" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}
```

## 6.5 File: components/brainstorm/session-result.tsx

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, TrendingUp, TrendingDown, AlertTriangle, 
  HelpCircle, ArrowRight, Download, Share2,
  Lightbulb, BarChart3, Search, Skull
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { AGENTS, type InsightType } from '@/lib/types/brainstorm'
import { cn } from '@/lib/utils'

interface SessionResultProps {
  sessionId: string
}

const insightTypeConfig: Record<InsightType, { icon: React.ReactNode; color: string }> = {
  idea: { icon: <Lightbulb className="w-4 h-4" />, color: 'text-green-400' },
  market_data: { icon: <BarChart3 className="w-4 h-4" />, color: 'text-purple-400' },
  competitor: { icon: <BarChart3 className="w-4 h-4" />, color: 'text-purple-400' },
  strength: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-success' },
  weakness: { icon: <TrendingDown className="w-4 h-4" />, color: 'text-warning' },
  opportunity: { icon: <Star className="w-4 h-4" />, color: 'text-cyan' },
  threat: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-danger' },
  risk: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-danger' },
  question: { icon: <HelpCircle className="w-4 h-4" />, color: 'text-yellow-400' },
  recommendation: { icon: <ArrowRight className="w-4 h-4" />, color: 'text-cyan' },
  next_step: { icon: <ArrowRight className="w-4 h-4" />, color: 'text-success' },
}

export function SessionResult({ sessionId }: SessionResultProps) {
  const router = useRouter()
  const { currentSession, currentRounds, currentInsights } = useBrainstormStore()
  const [activeTab, setActiveTab] = useState('summary')
  
  if (!currentSession || currentSession.status !== 'completed') {
    return null
  }
  
  const verdict = currentSession.final_verdict
  
  // Group insights by type
  const ideas = currentInsights.filter((i) => i.type === 'idea')
  const marketData = currentInsights.filter((i) => ['market_data', 'competitor'].includes(i.type))
  const analysis = currentInsights.filter((i) => 
    ['strength', 'weakness', 'opportunity', 'threat'].includes(i.type)
  )
  const challenges = currentInsights.filter((i) => ['risk', 'question'].includes(i.type))
  const nextSteps = currentInsights.filter((i) => ['recommendation', 'next_step'].includes(i.type))
  
  const handlePromoteToProject = async () => {
    // TODO: Implement promote to active project
    router.push('/dashboard')
  }
  
  return (
    <div className="space-y-6">
      {/* Verdict Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-cyan/10 to-purple/10 border-cyan/30">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🎯 Final Verdict
              </h2>
              <p className="text-foreground-secondary">{currentSession.title}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-1" /> Share
              </Button>
            </div>
          </div>
          
          {verdict && (
            <>
              {/* Score */}
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-foreground mb-1">
                    {verdict.score}
                    <span className="text-2xl text-foreground-secondary">/10</span>
                  </div>
                  <p className="text-sm text-foreground-secondary">Feasibility Score</p>
                </div>
                
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        verdict.score >= 7 ? 'bg-success' :
                        verdict.score >= 5 ? 'bg-warning' : 'bg-danger'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${verdict.score * 10}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
                
                <Badge
                  variant={
                    verdict.recommendation === 'proceed' ? 'success' :
                    verdict.recommendation === 'pivot' ? 'warning' : 'danger'
                  }
                  size="lg"
                >
                  {verdict.recommendation === 'proceed' ? '🚀 Tiến hành' :
                   verdict.recommendation === 'pivot' ? '🔄 Điều chỉnh' : '⛔ Dừng lại'}
                </Badge>
              </div>
              
              {/* Summary */}
              <p className="text-foreground text-lg mb-6">{verdict.summary}</p>
              
              {/* Quick stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-success">{verdict.strengths.length}</p>
                  <p className="text-sm text-foreground-secondary">Strengths</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{verdict.weaknesses.length}</p>
                  <p className="text-sm text-foreground-secondary">Weaknesses</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-danger">{verdict.risks.length}</p>
                  <p className="text-sm text-foreground-secondary">Risks</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-cyan">{verdict.next_steps.length}</p>
                  <p className="text-sm text-foreground-secondary">Next Steps</p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handlePromoteToProject} className="flex-1">
                  🚀 Chuyển thành Active Project
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/brainstorm/new?continue=${sessionId}`)}
                >
                  🧠 Brainstorm tiếp
                </Button>
              </div>
            </>
          )}
        </Card>
      </motion.div>
      
      {/* Detailed tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="summary">📋 Tổng quan</TabsTrigger>
          <TabsTrigger value="ideas">💡 Ý tưởng ({ideas.length})</TabsTrigger>
          <TabsTrigger value="research">📊 Thị trường ({marketData.length})</TabsTrigger>
          <TabsTrigger value="analysis">🔍 Phân tích ({analysis.length})</TabsTrigger>
          <TabsTrigger value="challenges">😈 Thách thức ({challenges.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                <TrendingUp className="w-5 h-5 text-success" />
                Điểm mạnh
              </h3>
              <ul className="space-y-2">
                {verdict?.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                    <span className="text-success mt-1">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Weaknesses */}
            <Card>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                <TrendingDown className="w-5 h-5 text-warning" />
                Điểm yếu
              </h3>
              <ul className="space-y-2">
                {verdict?.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                    <span className="text-warning mt-1">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Risks */}
            <Card>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                <AlertTriangle className="w-5 h-5 text-danger" />
                Rủi ro chính
              </h3>
              <ul className="space-y-2">
                {verdict?.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                    <span className="text-danger mt-1">⚠</span>
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
            
            {/* Next steps */}
            <Card>
              <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                <ArrowRight className="w-5 h-5 text-cyan" />
                Bước tiếp theo
              </h3>
              <ol className="space-y-2">
                {verdict?.next_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground-secondary">
                    <span className="text-cyan font-bold">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ideas" className="mt-6">
          <div className="space-y-4">
            {ideas.map((insight, index) => (
              <Card key={insight.id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                    <p className="text-foreground-secondary">{insight.content}</p>
                    {insight.metadata?.unique_value && (
                      <p className="text-sm text-cyan mt-2">
                        💡 {insight.metadata.unique_value as string}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="research" className="mt-6">
          <div className="space-y-4">
            {marketData.map((insight) => (
              <Card key={insight.id}>
                <div className="flex items-center gap-2 mb-2">
                  {insightTypeConfig[insight.type].icon}
                  <Badge variant="purple" size="sm">
                    {insight.type === 'market_data' ? 'Thị trường' : 'Đối thủ'}
                  </Badge>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{insight.title}</h4>
                <p className="text-foreground-secondary">{insight.content}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.map((insight) => (
              <Card key={insight.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={insightTypeConfig[insight.type].color}>
                    {insightTypeConfig[insight.type].icon}
                  </span>
                  <Badge
                    variant={
                      insight.type === 'strength' ? 'success' :
                      insight.type === 'weakness' ? 'warning' :
                      insight.type === 'opportunity' ? 'cyan' : 'danger'
                    }
                    size="sm"
                  >
                    {insight.type === 'strength' ? 'Điểm mạnh' :
                     insight.type === 'weakness' ? 'Điểm yếu' :
                     insight.type === 'opportunity' ? 'Cơ hội' : 'Thách thức'}
                  </Badge>
                </div>
                <p className="text-foreground">{insight.title}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            {challenges.map((insight) => (
              <Card key={insight.id} className={cn(
                insight.type === 'risk' && 'border-danger/30',
                insight.type === 'question' && 'border-yellow-500/30'
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    insight.type === 'risk' ? 'bg-danger/10 text-danger' : 'bg-yellow-500/10 text-yellow-400'
                  )}>
                    {insight.type === 'risk' ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      {insight.metadata?.severity && (
                        <Badge
                          variant={
                            insight.metadata.severity === 'high' ? 'danger' :
                            insight.metadata.severity === 'medium' ? 'warning' : 'secondary'
                          }
                          size="sm"
                        >
                          {insight.metadata.severity as string}
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground-secondary">{insight.content}</p>
                    {insight.metadata?.mitigation && (
                      <p className="text-sm text-success mt-2">
                        💡 Mitigation: {insight.metadata.mitigation as string}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

## 6.6 File: components/brainstorm/session-list.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { SessionCard } from './session-card'
import { NewSessionModal } from './new-session-modal'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { useUser } from '@/lib/hooks/use-user'
import type { SessionStatus } from '@/lib/types/brainstorm'

export function SessionList() {
  const { user } = useUser()
  const { sessions, loadSessions, deleteSession, isLoading } = useBrainstormStore()
  
  const [showNewModal, setShowNewModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'all'>('all')
  
  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id)
    }
  }, [user?.id, loadSessions])
  
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title.toLowerCase().includes(search.toLowerCase()) ||
      session.original_idea.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa session này?')) {
      await deleteSession(id)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">🧠 Brainstorm4</h1>
          <p className="text-foreground-secondary">
            4 AI cùng phân tích và phát triển ý tưởng của bạn
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Brainstorm
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SessionStatus | 'all')}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:border-cyan"
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ bắt đầu</option>
          <option value="running">Đang chạy</option>
          <option value="completed">Hoàn thành</option>
          <option value="failed">Lỗi</option>
        </select>
      </div>
      
      {/* Session list */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {search || statusFilter !== 'all'
              ? 'Không tìm thấy session nào'
              : 'Chưa có Brainstorm nào'}
          </h3>
          <p className="text-foreground-secondary mb-6">
            {search || statusFilter !== 'all'
              ? 'Thử thay đổi bộ lọc'
              : 'Bắt đầu với một ý tưởng, 4 AI sẽ giúp bạn phân tích'}
          </p>
          {!search && statusFilter === 'all' && (
            <Button onClick={() => setShowNewModal(true)}>
              🚀 Bắt đầu Brainstorm đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      
      {/* New session modal */}
      <NewSessionModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
      />
    </div>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 7: PAGES
# ═══════════════════════════════════════════════════════════════════════════════

## 7.1 File: app/(dashboard)/brainstorm/page.tsx

```typescript
import { Metadata } from 'next'
import { SessionList } from '@/components/brainstorm/session-list'

export const metadata: Metadata = {
  title: 'Brainstorm4 - 1nguoi.com',
  description: '4 AI cùng phân tích và phát triển ý tưởng của bạn',
}

export default function BrainstormPage() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <SessionList />
    </div>
  )
}
```

## 7.2 File: app/(dashboard)/brainstorm/[id]/page.tsx

```typescript
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { LiveSession } from '@/components/brainstorm/live-session'
import { SessionResult } from '@/components/brainstorm/session-result'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'

export default function BrainstormSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  
  const { currentSession, loadSession, isLoading } = useBrainstormStore()
  
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, loadSession])
  
  if (isLoading || !currentSession) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-64 bg-white/5 rounded-2xl" />
          <div className="h-96 bg-white/5 rounded-2xl" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/brainstorm')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>
      
      {/* Show live session or result based on status */}
      {currentSession.status === 'completed' ? (
        <SessionResult sessionId={sessionId} />
      ) : (
        <LiveSession sessionId={sessionId} />
      )}
    </div>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                  STEP 8: INTEGRATION VỚI PROJECT HUB
# ═══════════════════════════════════════════════════════════════════════════════

## 8.1 Update: components/project-hub/project-card.tsx

Thêm vào dropdown menu:

```typescript
// Thêm import
import { Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Trong component, thêm vào DropdownMenu:
{project.status === 'idea' && (
  <DropdownMenuItem
    onClick={() => router.push(`/brainstorm?project=${project.id}`)}
  >
    <Brain className="w-4 h-4 mr-2" />
    🧠 Brainstorm4
  </DropdownMenuItem>
)}
```

## 8.2 Update: components/layout/dashboard-sidebar.tsx

Thêm menu item:

```typescript
// Thêm import
import { Brain } from 'lucide-react'

// Trong navItems array, thêm:
{
  icon: Brain,
  label: 'Brainstorm4',
  href: '/brainstorm',
},
```

## 8.3 Update: components/project-hub/new-project-modal.tsx

Thêm status "idea":

```typescript
// Trong form, update status options:
<div className="space-y-2">
  {[
    ['idea', '💭 Idea'],
    ['focus', '🔥 Focus'],
    ['active', '⚡ Active'],
    ['backlog', '📦 Backlog'],
  ].map(([v, l]) => (
    <label key={v} className="flex items-center gap-3 cursor-pointer">
      <input type="radio" value={v} {...register('status')} className="w-4 h-4 text-cyan" />
      <span className="text-foreground">{l}</span>
    </label>
  ))}
</div>
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 9: ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════

## 9.1 Update: .env.local

```env
# Existing variables...

# AI API Keys for Brainstorm4
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
XAI_API_KEY=xai-...  # Optional, falls back to OpenAI
```

## 9.2 Update: .env.example

```env
# AI API Keys for Brainstorm4
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=
XAI_API_KEY=
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 10: PACKAGE DEPENDENCIES
# ═══════════════════════════════════════════════════════════════════════════════

## 10.1 Install dependencies

```bash
npm install openai @anthropic-ai/sdk @google/generative-ai react-markdown
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                              📋 CHECKLIST
# ═══════════════════════════════════════════════════════════════════════════════

## Implementation Checklist

- [ ] STEP 1: Run database migration
- [ ] STEP 2: Add TypeScript types
- [ ] STEP 3: Create Zustand store
- [ ] STEP 4: Implement API routes
- [ ] STEP 5: Implement AI agent services
- [ ] STEP 6: Create UI components
- [ ] STEP 7: Create pages
- [ ] STEP 8: Integrate with Project Hub
- [ ] STEP 9: Add environment variables
- [ ] STEP 10: Install dependencies

## Testing Checklist

- [ ] Create new brainstorm session (quick mode)
- [ ] Create new brainstorm session (deep mode)
- [ ] Watch live stream of AI responses
- [ ] View completed session results
- [ ] Create brainstorm from Project with status "idea"
- [ ] Delete brainstorm session
- [ ] Cancel running session

---

# END OF CODER PACK
## BRAINSTORM4 - 1NGUOI.COM
## Vibecode Kit v4.0
