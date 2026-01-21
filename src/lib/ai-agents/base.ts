import { createClient } from '@/lib/supabase/server'
import { decryptApiKey } from '@/lib/admin/crypto'
import type { AgentId, RoundRole, ParsedRoundOutput } from '@/lib/types/brainstorm'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'xai'

export interface AIAgentConfig {
  agentId: AgentId
  provider: AIProvider
  model: string
}

export interface AIAgentRequest {
  sessionId: string
  roundId: string
  role: RoundRole
  originalIdea: string
  previousOutputs: string[]
  context?: string
}

export interface AIAgentResponse {
  success: boolean
  content: string
  parsedOutput?: ParsedRoundOutput
  tokensInput: number
  tokensOutput: number
  cost: number
  durationMs: number
  error?: string
}

export const AGENT_CONFIGS: Record<AgentId, AIAgentConfig> = {
  spark: {
    agentId: 'spark',
    provider: 'openai',
    model: 'gpt-4.1',
  },
  lens: {
    agentId: 'lens',
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250514',
  },
  radar: {
    agentId: 'radar',
    provider: 'google',
    model: 'gemini-2.0-flash',
  },
  devil: {
    agentId: 'devil',
    provider: 'xai',
    model: 'grok-3',
  },
}

/**
 * Get API key for a provider (decrypted)
 */
export async function getProviderApiKey(provider: AIProvider): Promise<string | null> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ai_provider_settings')
    .select('api_key_encrypted, is_enabled, is_configured')
    .eq('provider', provider)
    .single()

  if (error || !data) {
    console.error(`Failed to get API key for ${provider}:`, error)
    return null
  }

  if (!data.is_enabled || !data.is_configured || !data.api_key_encrypted) {
    console.warn(`Provider ${provider} is not enabled or configured`)
    return null
  }

  try {
    return decryptApiKey(data.api_key_encrypted)
  } catch (err) {
    console.error(`Failed to decrypt API key for ${provider}:`, err)
    return null
  }
}

/**
 * Check if an agent is available (provider is configured and enabled)
 */
export async function isAgentAvailable(agentId: AgentId): Promise<boolean> {
  const config = AGENT_CONFIGS[agentId]
  if (!config) return false

  const apiKey = await getProviderApiKey(config.provider)
  return !!apiKey
}

/**
 * Get available agents
 */
export async function getAvailableAgents(): Promise<AgentId[]> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ai_provider_settings')
    .select('provider')
    .eq('is_enabled', true)
    .eq('is_configured', true)

  if (error || !data) {
    return []
  }

  const enabledProviders = new Set(data.map((d: { provider: string }) => d.provider))

  return (Object.entries(AGENT_CONFIGS) as [AgentId, AIAgentConfig][])
    .filter(([, config]) => enabledProviders.has(config.provider))
    .map(([agentId]) => agentId)
}

/**
 * Get effective agent for a role - uses fallback to OpenAI if primary agent unavailable
 * @param agentId - The primary agent ID
 * @param availableAgents - List of available agents
 * @returns The agent ID to use (original or fallback)
 */
export function getEffectiveAgent(agentId: AgentId, availableAgents: AgentId[]): AgentId | null {
  // If primary agent is available, use it
  if (availableAgents.includes(agentId)) {
    return agentId
  }

  // Fallback to OpenAI (spark) if available
  if (availableAgents.includes('spark')) {
    console.log(`Agent ${agentId} not available, falling back to spark (OpenAI)`)
    return 'spark'
  }

  // No fallback available
  return null
}

/**
 * Check if at least one agent (OpenAI) is available to run brainstorm
 */
export async function hasAnyAgentAvailable(): Promise<boolean> {
  const agents = await getAvailableAgents()
  return agents.length > 0
}

/**
 * Log AI usage for tracking and billing
 */
export async function logAIUsage(
  provider: AIProvider,
  sessionId: string,
  roundId: string,
  userId: string,
  model: string,
  tokensInput: number,
  tokensOutput: number,
  cost: number,
  durationMs: number,
  status: 'success' | 'error' | 'timeout',
  errorMessage?: string
): Promise<void> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('ai_usage_logs').insert({
    provider,
    session_id: sessionId,
    round_id: roundId,
    user_id: userId,
    model,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cost,
    duration_ms: durationMs,
    status,
    error_message: errorMessage,
  })

  // Update provider stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc('increment_ai_provider_stats', {
    p_provider: provider,
    p_requests: 1,
    p_tokens: tokensInput + tokensOutput,
    p_cost: cost,
  })
}

/**
 * Build prompts for each role
 */
export function buildRolePrompt(role: RoundRole, originalIdea: string, previousOutputs: string[]): string {
  const context = previousOutputs.length > 0
    ? `\n\n--- Previous Analysis ---\n${previousOutputs.join('\n\n---\n\n')}`
    : ''

  switch (role) {
    case 'ideation':
      return `You are SPARK - The Ideator. Your role is to creatively develop and expand on business ideas.

Given this original idea:
"${originalIdea}"
${context}

Please:
1. Generate 3-5 creative variations or extensions of this idea
2. For each variation, provide:
   - A catchy name/title
   - A brief description (2-3 sentences)
   - What makes it unique

Respond in Vietnamese. Be creative and think outside the box!`

    case 'research':
      return `You are RADAR - The Researcher. Your role is to research market data and trends.

Given this idea:
"${originalIdea}"
${context}

Please research and provide:
1. Market Size: Estimated market size for this type of product/service
2. Growth Rate: Industry growth trends
3. Key Trends: 3-5 relevant market trends
4. Competitors: 3-5 potential competitors with brief descriptions
5. Opportunities: 3-5 market opportunities

Respond in Vietnamese. Focus on actionable insights!`

    case 'analysis':
      return `You are LENS - The Analyst. Your role is to analyze feasibility and do SWOT analysis.

Given this idea:
"${originalIdea}"
${context}

Please provide a comprehensive SWOT analysis:
1. Strengths (3-5 points): Internal advantages
2. Weaknesses (3-5 points): Internal limitations
3. Opportunities (3-5 points): External opportunities
4. Threats (3-5 points): External threats

Also provide:
- Feasibility Score (1-10) with justification
- Key success factors
- Resource requirements

Respond in Vietnamese. Be objective and thorough!`

    case 'challenge':
      return `You are DEVIL - The Challenger. Your role is to question, challenge, and find weaknesses.

Given this idea:
"${originalIdea}"
${context}

Please be critical and provide:
1. Hard Questions: 5-7 tough questions the founder should answer
2. Potential Failures: 3-5 ways this idea could fail
3. Hidden Risks: Risks that aren't immediately obvious
4. Assumptions to Test: Key assumptions that need validation
5. Worst Case Scenarios: What happens if things go wrong?

Respond in Vietnamese. Be tough but constructive!`

    case 'synthesis':
      return `You are LENS - The Synthesizer. Your role is to synthesize all analysis into final recommendations.

Given this idea:
"${originalIdea}"
${context}

Please provide a final synthesis:
1. Overall Score (1-10): Based on all analysis
2. Executive Summary: 2-3 sentences summarizing the verdict
3. Recommendation: Should this idea PROCEED, PIVOT, or DROP?
4. Key Strengths: Top 3 reasons to pursue
5. Key Risks: Top 3 risks to mitigate
6. Next Steps: 5 concrete action items

Respond in Vietnamese. Make a clear recommendation!`

    default:
      return `Analyze this idea: "${originalIdea}"\n${context}`
  }
}

/**
 * Calculate cost based on provider pricing
 * Prices are approximate per 1K tokens
 */
export function calculateCost(
  provider: AIProvider,
  model: string,
  tokensInput: number,
  tokensOutput: number
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    // OpenAI models
    'gpt-4.1': { input: 0.002, output: 0.008 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    // Anthropic models
    'claude-sonnet-4-5-20250514': { input: 0.003, output: 0.015 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    // Google models
    'gemini-2.0-flash': { input: 0.0001, output: 0.0004 },
    'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
    'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
    // xAI models
    'grok-3': { input: 0.003, output: 0.015 },
    'grok-beta': { input: 0.005, output: 0.015 },
  }

  const modelPricing = pricing[model] || { input: 0.001, output: 0.002 }

  return (
    (tokensInput / 1000) * modelPricing.input +
    (tokensOutput / 1000) * modelPricing.output
  )
}
