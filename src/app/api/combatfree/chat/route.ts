import { NextRequest } from 'next/server'
import type { CombatFreeConfig } from '@/lib/types/combatfree'

export const runtime = 'nodejs'

// gpt4free providers mapping
const GPT4FREE_PROVIDERS: Record<string, string> = {
  chatgpt: 'OpenaiChat',
  claude: 'Anthropic',
  deepseek: 'DeepSeek',
  gemini: 'Gemini',
}

export async function POST(request: NextRequest) {
  try {
    const { messages, config } = await request.json() as {
      messages: Array<{ role: string; content: string }>
      config: CombatFreeConfig
    }

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Try WebAI-to-API server first
    let response: Response | null = null
    let useGpt4free = false

    try {
      response = await callWebAIServer(config.serverUrl, messages, config.model)
      if (!response.ok) {
        console.log('WebAI server returned error, trying gpt4free...')
        useGpt4free = true
      }
    } catch (error) {
      console.log('WebAI server not available, trying gpt4free...', error)
      useGpt4free = true
    }

    // Fallback to gpt4free
    if (useGpt4free) {
      response = await callGpt4Free(messages, config.provider, config.model)
    }

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response'
      return new Response(JSON.stringify({
        error: 'AI không khả dụng. Vui lòng kiểm tra WebAI-to-API server.',
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

// Call WebAI-to-API server
async function callWebAIServer(
  serverUrl: string,
  messages: Array<{ role: string; content: string }>,
  model: string
): Promise<Response> {
  return fetch(`${serverUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
    signal: AbortSignal.timeout(60000),
  })
}

// Call gpt4free (using public endpoints or self-hosted)
async function callGpt4Free(
  messages: Array<{ role: string; content: string }>,
  provider: string,
  model: string
): Promise<Response> {
  // Try multiple gpt4free endpoints
  const endpoints = [
    'https://api.gpt4free.io/v1/chat/completions',
    'https://g4f.cloud/v1/chat/completions',
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model === 'auto' ? 'gpt-4o-mini' : model,
          messages,
          stream: true,
          provider: GPT4FREE_PROVIDERS[provider] || 'auto',
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (response.ok) {
        return response
      }
    } catch (error) {
      console.log(`gpt4free endpoint ${endpoint} failed:`, error)
    }
  }

  // Return a failed response
  return new Response(JSON.stringify({ error: 'All endpoints failed' }), {
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
