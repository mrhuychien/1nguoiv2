import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProviderApiKey, AGENT_CONFIGS, calculateCost } from '@/lib/ai-agents/base'
import { COMBAT_SYSTEM_PROMPTS, COMBAT_AGENTS } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'
import type { CombatMessage } from '@/lib/types/combat'

// Use Node.js runtime for crypto support
export const runtime = 'nodejs'

// Provider API endpoints
const PROVIDER_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
  xai: 'https://api.x.ai/v1/chat/completions',
}

export async function POST(request: NextRequest) {
  try {
    const { session_id, target_agent, message } = await request.json()

    if (!session_id || !target_agent || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Validate agent
    if (!['spark', 'lens', 'radar', 'devil'].includes(target_agent)) {
      return new Response(JSON.stringify({ error: 'Invalid agent' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = await createClient()

    // Get session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase as any)
      .from('combat_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Save user message first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('combat_messages').insert({
      session_id,
      role: 'user',
      content: message,
      mentioned_agents: [target_agent],
    })

    // Get conversation history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages } = await (supabase as any)
      .from('combat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })
      .limit(50) // Last 50 messages for context

    // Get agent config
    const agentConfig = AGENT_CONFIGS[target_agent as AgentId]
    const agentInfo = COMBAT_AGENTS[target_agent as AgentId]

    // Get API key
    const apiKey = await getProviderApiKey(agentConfig.provider)
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: `${agentInfo.name} không khả dụng. Vui lòng cấu hình API key cho ${agentConfig.provider} trong Admin.`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build conversation history for AI
    const conversationHistory = buildConversationHistory(messages || [], target_agent as AgentId)

    // Call agent based on provider
    const startTime = Date.now()

    let response: Response

    if (agentConfig.provider === 'anthropic') {
      response = await callAnthropicStreaming(apiKey, agentConfig.model, target_agent as AgentId, conversationHistory)
    } else if (agentConfig.provider === 'openai') {
      response = await callOpenAIStreaming(apiKey, agentConfig.model, target_agent as AgentId, conversationHistory)
    } else if (agentConfig.provider === 'google') {
      response = await callGoogleStreaming(apiKey, agentConfig.model, target_agent as AgentId, conversationHistory)
    } else if (agentConfig.provider === 'xai') {
      response = await callXAIStreaming(apiKey, agentConfig.model, target_agent as AgentId, conversationHistory)
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported provider' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`${agentConfig.provider} API error:`, response.status, errorText)
      console.error(`Model: ${agentConfig.model}, Provider: ${agentConfig.provider}`)
      return new Response(JSON.stringify({
        error: `${agentInfo.name} gặp lỗi khi xử lý (${response.status})`,
        details: errorText
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform streaming response based on provider
    const transformStream = createTransformStream(agentConfig.provider, {
      supabase,
      session_id,
      target_agent,
      startTime,
      model: agentConfig.model,
    })

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Combat chat error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Build conversation history for AI context
function buildConversationHistory(
  messages: CombatMessage[],
  targetAgent: AgentId
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  for (const msg of messages) {
    if (msg.role === 'user') {
      history.push({ role: 'user', content: msg.content })
    } else if (msg.role === targetAgent) {
      // This agent's previous responses
      history.push({ role: 'assistant', content: msg.content })
    } else if (['spark', 'lens', 'radar', 'devil'].includes(msg.role)) {
      // Other agent's responses - include as context
      const agentInfo = COMBAT_AGENTS[msg.role as AgentId]
      history.push({
        role: 'user',
        content: `[${agentInfo.emoji} ${agentInfo.name}]: ${msg.content}`
      })
    }
  }

  return history
}

// Anthropic streaming call
async function callAnthropicStreaming(
  apiKey: string,
  model: string,
  agent: AgentId,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  return fetch(PROVIDER_ENDPOINTS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: COMBAT_SYSTEM_PROMPTS[agent],
      messages: history,
      stream: true,
    }),
  })
}

// OpenAI streaming call
async function callOpenAIStreaming(
  apiKey: string,
  model: string,
  agent: AgentId,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  return fetch(PROVIDER_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: COMBAT_SYSTEM_PROMPTS[agent] },
        ...history,
      ],
      stream: true,
    }),
  })
}

// Google streaming call
async function callGoogleStreaming(
  apiKey: string,
  model: string,
  agent: AgentId,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  const contents = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))

  return fetch(`${PROVIDER_ENDPOINTS.google}/${model}:streamGenerateContent?key=${apiKey}&alt=sse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: COMBAT_SYSTEM_PROMPTS[agent] }],
      },
      contents,
      generationConfig: {
        maxOutputTokens: 2000,
      },
    }),
  })
}

// xAI (Grok) streaming call
async function callXAIStreaming(
  apiKey: string,
  model: string,
  agent: AgentId,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<Response> {
  return fetch(PROVIDER_ENDPOINTS.xai, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: COMBAT_SYSTEM_PROMPTS[agent] },
        ...history,
      ],
      stream: true,
    }),
  })
}

// Create transform stream based on provider
function createTransformStream(
  provider: string,
  context: {
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
    session_id: string
    target_agent: string
    startTime: number
    model: string
  }
) {
  let fullContent = ''
  let tokensInput = 0
  let tokensOutput = 0
  let doneSent = false

  return new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk)
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            if (!doneSent) {
              doneSent = true
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            }
            continue
          }

          try {
            const parsed = JSON.parse(data)
            let content = ''

            // Extract text based on provider format
            if (provider === 'anthropic') {
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                content = parsed.delta.text
              }
              if (parsed.type === 'message_delta' && parsed.usage) {
                tokensOutput = parsed.usage.output_tokens || 0
              }
              if (parsed.type === 'message_start' && parsed.message?.usage) {
                tokensInput = parsed.message.usage.input_tokens || 0
              }
              if (parsed.type === 'message_stop' && !doneSent) {
                doneSent = true
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              }
            } else if (provider === 'openai' || provider === 'xai') {
              if (parsed.choices?.[0]?.delta?.content) {
                content = parsed.choices[0].delta.content
              }
              if (parsed.usage) {
                tokensInput = parsed.usage.prompt_tokens || 0
                tokensOutput = parsed.usage.completion_tokens || 0
              }
              // OpenAI/xAI signals end with finish_reason
              if (parsed.choices?.[0]?.finish_reason === 'stop' && !doneSent) {
                doneSent = true
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              }
            } else if (provider === 'google') {
              if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
                content = parsed.candidates[0].content.parts[0].text
              }
              if (parsed.usageMetadata) {
                tokensInput = parsed.usageMetadata.promptTokenCount || 0
                tokensOutput = parsed.usageMetadata.candidatesTokenCount || 0
              }
              // Google signals end with finishReason
              if (parsed.candidates?.[0]?.finishReason === 'STOP' && !doneSent) {
                doneSent = true
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              }
            }

            if (content) {
              fullContent += content
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    },
    async flush() {
      // Save AI message to database
      if (fullContent) {
        const durationMs = Date.now() - context.startTime
        const cost = calculateCost(
          AGENT_CONFIGS[context.target_agent as AgentId].provider,
          context.model,
          tokensInput,
          tokensOutput
        )

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (context.supabase as any).from('combat_messages').insert({
          session_id: context.session_id,
          role: context.target_agent,
          content: fullContent,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          cost,
          duration_ms: durationMs,
        })

        // Update session totals using raw SQL increment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (context.supabase as any).rpc('increment_combat_session_stats', {
          p_session_id: context.session_id,
          p_tokens: tokensInput + tokensOutput,
          p_cost: cost,
        }).catch(() => {
          // Fallback: RPC might not exist yet, ignore error
        })
      }
    },
  })
}
