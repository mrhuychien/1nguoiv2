import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  STEP_PROMPTS,
  buildContextString,
  formatMessagesForAPI
} from '@/lib/services/vibecode-ai'
import { getProviderApiKey } from '@/lib/ai-agents/base'
import type { VibeCodeStep } from '@/lib/types/vibecode'

// Use Node.js runtime for crypto support (needed for API key decryption)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { session_id, step, message } = await request.json()

    if (!session_id || !step || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = await createClient()

    // Get session data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase as any)
      .from('vibecode_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get previous messages for this session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages } = await (supabase as any)
      .from('vibecode_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    // Build context
    const context = buildContextString(
      session.vision_text,
      session.context_data,
      messages || []
    )

    // Format messages for API
    const systemPrompt = STEP_PROMPTS[step as VibeCodeStep]
    const apiMessages = formatMessagesForAPI(
      context,
      messages || [],
      message
    )

    // Get API key from database (configured in admin panel)
    const apiKey = await getProviderApiKey('anthropic')
    if (!apiKey) {
      console.error('Anthropic API key not configured in admin settings')
      return new Response(JSON.stringify({ error: 'AI service not configured. Please configure Anthropic API key in admin panel.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('Calling Claude API with', {
      model: 'claude-sonnet-4-5-20250929',
      messagesCount: apiMessages.length,
      systemPromptLength: systemPrompt?.length,
    })

    // Call Claude API (streaming)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8192,
        system: systemPrompt,
        messages: apiMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', response.status, response.statusText, errorText)
      return new Response(JSON.stringify({
        error: 'AI service error',
        details: errorText,
        status: response.status
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform Anthropic streaming format to simple format for frontend
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              // Extract text from content_block_delta events
              if (data.type === 'content_block_delta' && data.delta?.text) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ content: data.delta.text })}\n\n`)
                )
              }

              // Send [DONE] on message_stop
              if (data.type === 'message_stop') {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      },
    })

    // Return transformed streaming response
    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
