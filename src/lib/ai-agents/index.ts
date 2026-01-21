import type { AgentId, RoundRole } from '@/lib/types/brainstorm'
import type { AIAgentRequest, AIAgentResponse } from './base'
import { callSparkAgent } from './openai'
import { callLensAgent } from './anthropic'
import { callRadarAgent } from './google'
import { callDevilAgent } from './xai'

export * from './base'
export { callSparkAgent } from './openai'
export { callLensAgent } from './anthropic'
export { callRadarAgent } from './google'
export { callDevilAgent } from './xai'

/**
 * Map roles to their primary agents
 */
const ROLE_TO_AGENT: Record<RoundRole, AgentId> = {
  ideation: 'spark',    // SPARK for creative ideation
  research: 'radar',    // RADAR for market research
  analysis: 'lens',     // LENS for SWOT analysis
  challenge: 'devil',   // DEVIL for challenging
  synthesis: 'lens',    // LENS for synthesis
}

/**
 * Call the appropriate agent based on the agent ID
 */
export async function callAgent(
  agentId: AgentId,
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  switch (agentId) {
    case 'spark':
      return callSparkAgent(request, userId)
    case 'lens':
      return callLensAgent(request, userId)
    case 'radar':
      return callRadarAgent(request, userId)
    case 'devil':
      return callDevilAgent(request, userId)
    default:
      return {
        success: false,
        content: '',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: 0,
        error: `Unknown agent: ${agentId}`,
      }
  }
}

/**
 * Call the appropriate agent for a role
 * Uses the default agent mapping
 */
export async function callAgentForRole(
  role: RoundRole,
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  const agentId = ROLE_TO_AGENT[role]
  return callAgent(agentId, request, userId)
}

/**
 * Get the agent ID for a role
 */
export function getAgentForRole(role: RoundRole): AgentId {
  return ROLE_TO_AGENT[role]
}
