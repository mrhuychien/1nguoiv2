import { NextRequest } from 'next/server'
import { FREE_AGENTS, FREE_SYSTEM_PROMPTS } from '@/lib/types/combatfree'
import type { FreeAgentId } from '@/lib/types/combatfree'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { messages, targetAgent } = await request.json() as {
      messages: Array<{ role: string; content: string }>
      targetAgent: FreeAgentId
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!targetAgent || !FREE_AGENTS[targetAgent]) {
      return new Response(JSON.stringify({ error: 'Invalid agent' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const agent = FREE_AGENTS[targetAgent]
    const systemPrompt = FREE_SYSTEM_PROMPTS[targetAgent]

    // Build messages with system prompt
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    // Try free AI endpoints
    const response = await callFreeAI(fullMessages, agent.freeProvider)

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response'
      return new Response(JSON.stringify({
        error: `${agent.name} không khả dụng. Vui lòng thử lại.`,
        details: errorText,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform to our streaming format
    const transformStream = createTransformStream()

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Combat Free chat error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// Model mapping for better Vietnamese support
const MODEL_MAP: Record<string, string> = {
  openai: 'openai',
  claude: 'claude',
  gemini: 'gemini',
  mistral: 'mistral',
}

// Call free AI endpoints
async function callFreeAI(
  messages: Array<{ role: string; content: string }>,
  provider: string
): Promise<Response> {
  const model = MODEL_MAP[provider] || 'openai'

  // Try Pollinations AI first (free, reliable)
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'text/event-stream',
        'Accept-Charset': 'utf-8',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (response.ok) {
      return response
    }
    console.log('Pollinations AI failed:', response.status)
  } catch (error) {
    console.log('Pollinations AI error:', error)
  }

  // Fallback to api.airforce
  try {
    const response = await fetch('https://api.airforce/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (response.ok) {
      return response
    }
    console.log('api.airforce failed:', response.status)
  } catch (error) {
    console.log('api.airforce error:', error)
  }

  // Return failed response
  return new Response(JSON.stringify({ error: 'All free AI endpoints failed' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Transform stream to our format with proper UTF-8 handling
function createTransformStream() {
  let doneSent = false
  let buffer = ''
  const decoder = new TextDecoder('utf-8')
  const encoder = new TextEncoder()

  return new TransformStream({
    transform(chunk, controller) {
      // Decode with stream mode to handle partial UTF-8 sequences
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')

      // Keep the last incomplete line in buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine) continue

        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6).trim()

          if (data === '[DONE]') {
            if (!doneSent) {
              doneSent = true
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            }
            continue
          }

          try {
            const parsed = JSON.parse(data)
            let content = ''

            // OpenAI format
            if (parsed.choices?.[0]?.delta?.content) {
              content = parsed.choices[0].delta.content
            }
            // Direct content format
            else if (typeof parsed.content === 'string') {
              content = parsed.content
            }
            // Message format
            else if (parsed.message?.content) {
              content = parsed.message.content
            }

            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }

            // Check for finish
            if (parsed.choices?.[0]?.finish_reason === 'stop' && !doneSent) {
              doneSent = true
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            }
          } catch {
            // If JSON parsing fails, try to extract content directly
            // This handles plain text responses
            if (data && data.length > 0 && !data.startsWith('{')) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: data })}\n\n`)
              )
            }
          }
        }
      }
    },
    flush(controller) {
      // Process any remaining buffer content
      if (buffer.trim()) {
        const trimmedLine = buffer.trim()
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6).trim()
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content ||
                parsed.content ||
                parsed.message?.content
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                )
              }
            } catch {
              // Ignore
            }
          }
        }
      }
      // Ensure DONE is sent
      if (!doneSent) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      }
    },
  })
}
