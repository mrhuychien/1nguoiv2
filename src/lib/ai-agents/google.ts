import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIAgentRequest, AIAgentResponse } from './base'
import {
  getProviderApiKey,
  buildRolePrompt,
  calculateCost,
  logAIUsage,
  AGENT_CONFIGS
} from './base'

/**
 * RADAR Agent - The Researcher (Google Gemini)
 * Market research and trend analysis
 */
export async function callRadarAgent(
  request: AIAgentRequest,
  userId: string
): Promise<AIAgentResponse> {
  const startTime = Date.now()
  const config = AGENT_CONFIGS.radar

  try {
    const apiKey = await getProviderApiKey('google')
    if (!apiKey) {
      return {
        success: false,
        content: '',
        tokensInput: 0,
        tokensOutput: 0,
        cost: 0,
        durationMs: Date.now() - startTime,
        error: 'Google API key not configured',
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: config.model,
      systemInstruction: 'You are RADAR, a research AI assistant specialized in market research, trend analysis, and competitive intelligence. You provide data-driven insights and actionable research.',
    })

    const prompt = buildRolePrompt(
      request.role,
      request.originalIdea,
      request.previousOutputs
    )

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    })

    const response = result.response
    const content = response.text()

    // Gemini provides token counts in usageMetadata
    const usageMetadata = response.usageMetadata
    const tokensInput = usageMetadata?.promptTokenCount || 0
    const tokensOutput = usageMetadata?.candidatesTokenCount || 0
    const cost = calculateCost('google', config.model, tokensInput, tokensOutput)
    const durationMs = Date.now() - startTime

    // Log usage
    await logAIUsage(
      'google',
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
      'google',
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
