import OpenAI from 'openai'
import type { AIAgentRequest, AIAgentResponse } from './base'
import {
  getProviderApiKey,
  buildRolePrompt,
  calculateCost,
  logAIUsage,
  AGENT_CONFIGS
} from './base'

/**
 * DEVIL Agent - The Challenger (xAI Grok)
 * Critical thinking and challenge assumptions
 * Note: xAI uses OpenAI-compatible API
 */
export async function callDevilAgent(
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  const startTime = Date.now()
  const config = AGENT_CONFIGS.devil

  try {
    const apiKey = await getProviderApiKey('xai')
    if (!apiKey) {
      return {
        success: false,
        content: '',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: Date.now() - startTime,
        error: 'xAI API key not configured',
      }
    }

    // xAI uses OpenAI-compatible API
    const xai = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    })

    const prompt = buildRolePrompt(
      request.role,
      request.originalIdea,
      request.previousOutputs
    )

    const response = await xai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are DEVIL, a critical thinking AI assistant specialized in challenging assumptions, finding weaknesses, and stress-testing ideas. You play devil\'s advocate constructively to strengthen ideas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || ''
    const tokensInput = response.usage?.prompt_tokens || 0
    const tokensOutput = response.usage?.completion_tokens || 0
    const cost = calculateCost('xai', config.model, tokensInput, tokensOutput)
    const durationMs = Date.now() - startTime

    // Log usage
    await logAIUsage(
      'xai',
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
      'xai',
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
