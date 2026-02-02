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
 * SPARK Agent - The Ideator (OpenAI GPT-4o)
 * Creative idea generation and expansion
 */
export async function callSparkAgent(
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  const startTime = Date.now()
  const config = AGENT_CONFIGS.spark

  try {
    const apiKey = await getProviderApiKey('openai')
    if (!apiKey) {
      return {
        success: false,
        content: '',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: Date.now() - startTime,
        error: 'OpenAI API key not configured',
      }
    }

    const openai = new OpenAI({ apiKey })

    const prompt = buildRolePrompt(
      request.role,
      request.originalIdea,
      request.previousOutputs
    )

    const response = await openai.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are SPARK, a creative AI assistant specialized in brainstorming and idea generation. You think outside the box and come up with innovative solutions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_completion_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content || ''
    const tokensInput = response.usage?.prompt_tokens || 0
    const tokensOutput = response.usage?.completion_tokens || 0
    const cost = calculateCost('openai', config.model, tokensInput, tokensOutput)
    const durationMs = Date.now() - startTime

    // Log usage
    await logAIUsage(
      'openai',
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
      'openai',
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
