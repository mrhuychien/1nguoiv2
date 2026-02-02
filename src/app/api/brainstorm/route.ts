import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import type { BrainstormSession } from '@/lib/types/brainstorm'
import { ROUNDS } from '@/lib/types/brainstorm'

/**
 * GET /api/brainstorm
 * List all brainstorm sessions for current user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sessions, error } = await (supabase as any)
      .from('brainstorm_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error in GET /api/brainstorm:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/brainstorm
 * Create a new brainstorm session
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, originalIdea, projectId } = body

    if (!title || !originalIdea) {
      return NextResponse.json(
        { error: 'Title and original idea are required' },
        { status: 400 }
      )
    }

    const sessionId = uuidv4()
    const now = new Date().toISOString()

    // Create session
    const session: BrainstormSession = {
      id: sessionId,
      user_id: user.id,
      project_id: projectId || null,
      title,
      original_idea: originalIdea,
      status: 'draft',
      total_rounds: ROUNDS.length,
      current_round: 0,
      total_cost: 0,
      final_verdict: null,
      created_at: now,
      updated_at: now,
      completed_at: null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sessionError } = await (supabase as any)
      .from('brainstorm_sessions')
      .insert(session)

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Create rounds
    const rounds = ROUNDS.map((round, index) => ({
      id: uuidv4(),
      session_id: sessionId,
      round_number: index + 1,
      role: round.role,
      agent_id: round.agent,
      status: 'pending',
      prompt: '',
      output: null,
      tokens_input: 0,
      tokens_output: 0,
      cost: 0,
      duration_ms: 0,
      error: null,
      started_at: null,
      completed_at: null,
      created_at: now,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: roundsError } = await (supabase as any)
      .from('brainstorm_rounds')
      .insert(rounds)

    if (roundsError) {
      console.error('Error creating rounds:', roundsError)
      // Clean up session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('brainstorm_sessions')
        .delete()
        .eq('id', sessionId)
      return NextResponse.json({ error: 'Failed to create rounds' }, { status: 500 })
    }

    return NextResponse.json({ session, rounds }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/brainstorm:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
