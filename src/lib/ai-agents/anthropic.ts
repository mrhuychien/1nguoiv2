import Anthropic from '@anthropic-ai/sdk'
import type { AIAgentRequest, AIAgentResponse } from './base'
import {
  getProviderApiKey,
  buildRolePrompt,
  calculateCost,
  logAIUsage,
  AGENT_CONFIGS
} from './base'

/**
 * LENS Agent - The Analyst (Anthropic Claude)
 * Deep analysis, SWOT, and synthesis
 */
export async function callLensAgent(
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  const startTime = Date.now()
  const config = AGENT_CONFIGS.lens

  try {
    const apiKey = await getProviderApiKey('anthropic')
    if (!apiKey) {
      return {
        success: false,
        content: '',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: Date.now() - startTime,
        error: 'Anthropic API key not configured',
      }
    }

    const anthropic = new Anthropic({ apiKey })

    const prompt = buildRolePrompt(
      request.role,
      request.originalIdea,
      request.previousOutputs
    )

    const response = await anthropic.messages.create({
      model: config.model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: 'You are LENS, an analytical AI assistant specialized in deep analysis, SWOT analysis, and synthesizing information. You provide thorough, balanced, and objective insights.',
    })

    const content = response.content[0]?.type === 'text'
      ? response.content[0].text
      : ''
    const tokensInput = response.usage?.input_tokens || 0
    const tokensOutput = response.usage?.output_tokens || 0
    const cost = calculateCost('anthropic', config.model, tokensInput, tokensOutput)
    const durationMs = Date.now() - startTime

    // Log usage
    await logAIUsage(
      'anthropic',
      request.sessionId,
      request.roundId,
      userId,
      config.model,
      tokensInput,
      tokensOutput,
      cost,
      durationMs,
      'success'
    )

    return {
      success: true,
      content,
      tokensInput,
      tokensOutput,
      cost,
      durationMs,
    }
  } catch (error) {
    const durationMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log error
    await logAIUsage(
      'anthropic',
      request.sessionId,
      request.roundId,
      userId,
      config.model,
      0,
      0,
      0,
      durationMs,
      'error',
      errorMessage
    )

    return {
      success: false,
      content: '',
      tokensInput: 0,
      tokensOutput: 0,
      cost: 0,
      durationMs,
      error: errorMessage,
    }
  }
}
