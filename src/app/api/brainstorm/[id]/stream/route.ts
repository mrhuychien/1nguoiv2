import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/brainstorm/[id]/stream
 * Server-Sent Events for real-time brainstorm updates
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify session belongs to user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error } = await (supabase as any)
    .from('brainstorm_sessions')
    .select('id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !session) {
    return new Response('Session not found', { status: 404 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  let isConnected = true

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        if (!isConnected) return
        try {
          controller.enqueue(encoder.encode(`event: ${event}\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          isConnected = false
        }
      }

      // Send initial state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: initialRounds } = await (supabase as any)
        .from('brainstorm_rounds')
        .select('*')
        .eq('session_id', id)
        .order('round_number', { ascending: true })

      sendEvent('init', {
        session,
        rounds: initialRounds || [],
      })

      // Poll for updates every 2 seconds
      const pollInterval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(pollInterval)
          return
        }

        try {
          // Get current session state
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: currentSession } = await (supabase as any)
            .from('brainstorm_sessions')
            .select('*')
            .eq('id', id)
            .single()

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: currentRounds } = await (supabase as any)
            .from('brainstorm_rounds')
            .select('*')
            .eq('session_id', id)
            .order('round_number', { ascending: true })

          sendEvent('update', {
            session: currentSession,
            rounds: currentRounds || [],
          })

          // Stop polling if session is completed or errored
          if (currentSession?.status === 'completed' || currentSession?.status === 'error') {
            sendEvent('complete', {
              session: currentSession,
              rounds: currentRounds || [],
            })
            clearInterval(pollInterval)
            controller.close()
          }
        } catch (err) {
          console.error('Error polling session:', err)
        }
      }, 2000)

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isConnected = false
        clearInterval(pollInterval)
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
