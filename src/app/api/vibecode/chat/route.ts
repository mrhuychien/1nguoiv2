import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  STEP_PROMPTS,
  buildContextString,
  formatMessagesForAPI
} from '@/lib/services/vibecode-ai'
import type { VibeCodeStep } from '@/lib/types/vibecode'

export const runtime = 'edge'

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

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured')
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
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
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
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

    // Return streaming response
    return new Response(response.body, {
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
