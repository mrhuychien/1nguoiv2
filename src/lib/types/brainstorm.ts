/**
 * Brainstorm4 Types
 * AI-powered brainstorming with 4 specialized agents
 */

// Agent identifiers
export type AgentId = 'spark' | 'lens' | 'radar' | 'devil'

// Round roles in the brainstorm process
export type RoundRole = 'ideation' | 'research' | 'analysis' | 'challenge' | 'synthesis'

// Session mode
export type SessionMode = 'quick' | 'deep'

// Session status
export type SessionStatus = 'draft' | 'running' | 'completed' | 'error'

// Final verdict from synthesis
export interface FinalVerdict {
  score: number
  recommendation: 'proceed' | 'pivot' | 'drop'
  summary: string
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  next_steps: string[]
}

// Agent information for display
export interface AgentInfo {
  id: AgentId
  name: string
  description: string
  icon: string
  color: string
  textColor: string
  bgColor: string
  provider: string
  role: RoundRole[]
}

// Brainstorm session
export interface BrainstormSession {
  id: string
  user_id: string
  project_id: string | null
  title: string
  original_idea: string
  status: SessionStatus
  total_rounds: number
  current_round: number
  total_cost: number
  final_verdict: FinalVerdict | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

// Brainstorm round
export interface BrainstormRound {
  id: string
  session_id: string
  round_number: number
  role: RoundRole
  agent_id: AgentId
  status: 'pending' | 'running' | 'completed' | 'error'
  prompt: string
  output: string | null
  tokens_input: number
  tokens_output: number
  cost: number
  duration_ms: number
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// Parsed output structure for different roles
export interface ParsedIdeation {
  variations: {
    name: string
    description: string
    uniqueness: string
  }[]
}

export interface ParsedResearch {
  marketSize: string
  growthRate: string
  trends: string[]
  competitors: { name: string; description: string }[]
  opportunities: string[]
}

export interface ParsedAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  feasibilityScore: number
  successFactors: string[]
  resources: string[]
}

export interface ParsedChallenge {
  hardQuestions: string[]
  potentialFailures: string[]
  hiddenRisks: string[]
  assumptions: string[]
  worstCases: string[]
}

export interface ParsedSynthesis {
  overallScore: number
  summary: string
  recommendation: 'PROCEED' | 'PIVOT' | 'DROP'
  keyStrengths: string[]
  keyRisks: string[]
  nextSteps: string[]
}

export type ParsedRoundOutput =
  | ParsedIdeation
  | ParsedResearch
  | ParsedAnalysis
  | ParsedChallenge
  | ParsedSynthesis

// Agent display info
export const AGENTS: Record<AgentId, AgentInfo> = {
  spark: {
    id: 'spark',
    name: 'SPARK',
    description: 'The Ideator - Creative idea generation',
    icon: '✨',
    color: '#FFB800',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    provider: 'OpenAI GPT-4o',
    role: ['ideation'],
  },
  lens: {
    id: 'lens',
    name: 'LENS',
    description: 'The Analyst - Deep analysis & synthesis',
    icon: '🔍',
    color: '#7C3AED',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    provider: 'Anthropic Claude',
    role: ['analysis', 'synthesis'],
  },
  radar: {
    id: 'radar',
    name: 'RADAR',
    description: 'The Researcher - Market research & trends',
    icon: '📡',
    color: '#10B981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    provider: 'Google Gemini',
    role: ['research'],
  },
  devil: {
    id: 'devil',
    name: 'DEVIL',
    description: 'The Challenger - Critical thinking',
    icon: '😈',
    color: '#EF4444',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/20',
    provider: 'xAI Grok',
    role: ['challenge'],
  },
}

// Round display info
export const ROUNDS: { role: RoundRole; name: string; agent: AgentId; description: string }[] = [
  {
    role: 'ideation',
    name: 'Idea Generation',
    agent: 'spark',
    description: 'SPARK generates creative variations and extensions of your idea',
  },
  {
    role: 'research',
    name: 'Market Research',
    agent: 'radar',
    description: 'RADAR researches market data, trends, and competitors',
  },
  {
    role: 'analysis',
    name: 'SWOT Analysis',
    agent: 'lens',
    description: 'LENS provides comprehensive SWOT analysis and feasibility assessment',
  },
  {
    role: 'challenge',
    name: 'Challenge',
    agent: 'devil',
    description: 'DEVIL challenges assumptions and identifies potential risks',
  },
  {
    role: 'synthesis',
    name: 'Final Synthesis',
    agent: 'lens',
    description: 'LENS synthesizes all analysis into final recommendations',
  },
]

// Round configuration for deep mode
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

// Insight type for extracted insights from rounds
export type InsightType = 'idea' | 'strength' | 'weakness' | 'opportunity' | 'threat' | 'risk' | 'question' | 'recommendation'

export interface BrainstormInsight {
  id: string
  session_id: string
  round_id: string | null
  type: InsightType
  title: string
  content: string | null
  confidence: number | null
  source_agent: AgentId | null
  created_at: string
}

// Input for creating a new session
export interface CreateSessionInput {
  title: string
  original_idea: string
  mode: SessionMode
  project_id?: string
  quick_mode_agent?: AgentId
}

// UI state for the brainstorm interface
export interface BrainstormUIState {
  activeTab: 'summary' | 'ideas' | 'analysis' | 'challenges'
  selectedInsightId: string | null
  isPlaying: boolean
}
