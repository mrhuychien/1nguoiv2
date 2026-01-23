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

// Call free AI endpoints
async function callFreeAI(
  messages: Array<{ role: string; content: string }>,
  provider: string
): Promise<Response> {
  // Try Pollinations AI first (free, reliable)
  try {
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider, // openai, claude, gemini, mistral
        messages,
        stream: true,
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
        'Content-Type': 'application/json',
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

// Transform stream to our format
function createTransformStream() {
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

            // OpenAI format
            if (parsed.choices?.[0]?.delta?.content) {
              content = parsed.choices[0].delta.content
            }
            // Direct content
            else if (parsed.content) {
              content = parsed.content
            }

            if (content) {
              controller.enqueue(
                new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
              )
            }

            // Check for finish
            if (parsed.choices?.[0]?.finish_reason === 'stop' && !doneSent) {
              doneSent = true
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    },
  })
}
