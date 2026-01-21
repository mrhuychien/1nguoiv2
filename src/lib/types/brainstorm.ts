/**
 * Brainstorm4 Types
 * AI-powered brainstorming with 4 specialized agents
 */

// Agent identifiers
export type AgentId = 'spark' | 'lens' | 'radar' | 'devil'

// Round roles in the brainstorm process
export type RoundRole = 'ideation' | 'research' | 'analysis' | 'challenge' | 'synthesis'

// Session status
export type SessionStatus = 'draft' | 'running' | 'completed' | 'error'

// Agent information for display
export interface AgentInfo {
  id: AgentId
  name: string
  description: string
  icon: string
  color: string
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
    provider: 'OpenAI GPT-4o',
    role: ['ideation'],
  },
  lens: {
    id: 'lens',
    name: 'LENS',
    description: 'The Analyst - Deep analysis & synthesis',
    icon: '🔍',
    color: '#7C3AED',
    provider: 'Anthropic Claude',
    role: ['analysis', 'synthesis'],
  },
  radar: {
    id: 'radar',
    name: 'RADAR',
    description: 'The Researcher - Market research & trends',
    icon: '📡',
    color: '#10B981',
    provider: 'Google Gemini',
    role: ['research'],
  },
  devil: {
    id: 'devil',
    name: 'DEVIL',
    description: 'The Challenger - Critical thinking',
    icon: '😈',
    color: '#EF4444',
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
