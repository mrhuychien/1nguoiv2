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
  textColor: string
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
    textColor: 'text-green-400',
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
    textColor: 'text-cyan-400',
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
    textColor: 'text-purple-400',
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
    textColor: 'text-red-400',
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
