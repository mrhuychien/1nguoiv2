import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/brainstorm/[id]/start - Start brainstorm (SSE stream)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify session ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error } = await (supabase as any)
    .from('brainstorm_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !session) {
    return new Response('Session not found', { status: 404 })
  }

  if (session.status !== 'pending') {
    return new Response('Session already started or completed', { status: 400 })
  }

  // Create SSE stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Update session to running
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_sessions')
          .update({ status: 'running', started_at: new Date().toISOString() })
          .eq('id', id)

        // TODO: Implement AI agent calls
        // For now, simulate with placeholder events
        const rounds = session.mode === 'deep'
          ? [
              { round_number: 1, agent: 'spark', role: 'ideation' },
              { round_number: 2, agent: 'radar', role: 'research' },
              { round_number: 3, agent: 'lens', role: 'analysis' },
              { round_number: 4, agent: 'devil', role: 'challenge' },
              { round_number: 5, agent: 'lens', role: 'synthesis' },
            ]
          : [{ round_number: 1, agent: session.quick_mode_agent || 'spark', role: 'ideation' }]

        for (const round of rounds) {
          sendEvent({
            type: 'round_start',
            round_number: round.round_number,
            agent: round.agent,
          })

          // Create round record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: roundData } = await (supabase as any)
            .from('brainstorm_rounds')
            .insert({
              session_id: id,
              round_number: round.round_number,
              agent: round.agent,
              role: round.role,
              status: 'running',
              started_at: new Date().toISOString(),
            })
            .select()
            .single()

          // Simulate progress
          for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            sendEvent({
              type: 'round_progress',
              round_number: round.round_number,
              agent: round.agent,
              progress: (i + 1) * 20,
              content: `Đang xử lý round ${round.round_number}...`,
            })
          }

          // Update round as completed
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('brainstorm_rounds')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              output_content: `Placeholder output for ${round.agent} - ${round.role}`,
            })
            .eq('id', roundData?.id)

          // Update session progress
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('brainstorm_sessions')
            .update({ current_round: round.round_number })
            .eq('id', id)

          sendEvent({
            type: 'round_complete',
            round_number: round.round_number,
            agent: round.agent,
          })
        }

        // Complete session
        const finalVerdict = {
          score: 7.5,
          summary: 'Ý tưởng có tiềm năng phát triển. Cần nghiên cứu thêm về thị trường và đối thủ.',
          recommendation: 'proceed' as const,
          strengths: ['Ý tưởng độc đáo', 'Thị trường tiềm năng'],
          weaknesses: ['Cần thêm nguồn lực', 'Cạnh tranh cao'],
          risks: ['Thay đổi thị trường', 'Chi phí phát triển'],
          next_steps: ['Nghiên cứu thị trường chi tiết', 'Xây dựng MVP', 'Tìm kiếm đầu tư'],
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            final_verdict: finalVerdict,
            duration_seconds: 30,
          })
          .eq('id', id)

        sendEvent({
          type: 'session_complete',
          final_verdict: finalVerdict,
        })

      } catch (error) {
        sendEvent({
          type: 'session_error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_sessions')
          .update({ status: 'failed' })
          .eq('id', id)
      } finally {
        controller.close()
      }
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
