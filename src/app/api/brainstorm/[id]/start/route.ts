import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callAgent, buildRolePrompt, getAvailableAgents, getEffectiveAgent } from '@/lib/ai-agents'
import type { BrainstormSession, BrainstormRound, RoundRole, AgentId } from '@/lib/types/brainstorm'

/**
 * POST /api/brainstorm/[id]/start
 * Start a brainstorm session - runs all rounds sequentially with real AI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase as any)
      .from('brainstorm_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single() as { data: BrainstormSession | null; error: Error | null }

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status === 'running') {
      return NextResponse.json({ error: 'Session is already running' }, { status: 400 })
    }

    if (session.status === 'completed') {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 })
    }

    // Allow retry for 'draft' or 'error' status
    const isRetry = session.status === 'error'

    // Check available agents
    const availableAgents = await getAvailableAgents()
    if (availableAgents.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers configured. Please configure AI settings in admin panel.' },
        { status: 400 }
      )
    }

    // Get rounds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rounds, error: roundsError } = await (supabase as any)
      .from('brainstorm_rounds')
      .select('*')
      .eq('session_id', id)
      .order('round_number', { ascending: true }) as { data: BrainstormRound[] | null; error: Error | null }

    if (roundsError || !rounds) {
      return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 })
    }

    // Update session status to running
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('brainstorm_sessions')
      .update({
        status: 'running',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Process rounds sequentially
    const previousOutputs: string[] = []
    let totalCost = session.total_cost || 0 // Keep existing cost if retrying
    let hasError = false

    for (const round of rounds) {
      // Skip completed rounds (for retry scenarios)
      if (round.status === 'completed') {
        // Add completed round output to context for next rounds
        if (round.output) {
          previousOutputs.push(`[${round.role.toUpperCase()}]\n${round.output}`)
        }
        console.log(`Skipping completed round ${round.round_number}`)
        continue
      }

      // Reset error status for retry
      if (round.status === 'error' && isRetry) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_rounds')
          .update({
            status: 'pending',
            error: null,
          })
          .eq('id', round.id)
      }

      // Get effective agent (fallback to OpenAI if primary not available)
      const primaryAgent = round.agent_id as AgentId
      const effectiveAgent = getEffectiveAgent(primaryAgent, availableAgents)

      if (!effectiveAgent) {
        // No agent available at all
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_rounds')
          .update({
            status: 'error',
            error: `No AI agent available. Please configure at least OpenAI in admin panel.`,
            completed_at: new Date().toISOString(),
          })
          .eq('id', round.id)

        hasError = true
        break
      }

      // Log if using fallback
      const usingFallback = effectiveAgent !== primaryAgent
      if (usingFallback) {
        console.log(`Round ${round.round_number}: Using ${effectiveAgent} (fallback) instead of ${primaryAgent}`)
      }

      // Update round status to running
      const startedAt = new Date().toISOString()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('brainstorm_rounds')
        .update({
          status: 'running',
          started_at: startedAt,
          // Update agent_id if using fallback
          ...(usingFallback ? { agent_id: effectiveAgent } : {}),
        })
        .eq('id', round.id)

      // Update session current round
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('brainstorm_sessions')
        .update({
          current_round: round.round_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Build prompt
      const prompt = buildRolePrompt(
        round.role as RoundRole,
        session.original_idea,
        previousOutputs
      )

      // Call AI agent (using effective agent which may be fallback)
      const response = await callAgent(
        effectiveAgent,
        {
          sessionId: id,
          roundId: round.id,
          role: round.role as RoundRole,
          originalIdea: session.original_idea,
          previousOutputs,
        },
        user.id
      )

      if (response.success) {
        // Update round with success
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_rounds')
          .update({
            status: 'completed',
            prompt,
            output: response.content,
            tokens_input: response.tokensInput,
            tokens_output: response.tokensOutput,
            cost: response.cost,
            duration_ms: response.durationMs,
            completed_at: new Date().toISOString(),
          })
          .eq('id', round.id)

        // Add to previous outputs for next round
        previousOutputs.push(`[${round.role.toUpperCase()}]\n${response.content}`)
        totalCost += response.cost
      } else {
        // Update round with error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('brainstorm_rounds')
          .update({
            status: 'error',
            prompt,
            error: response.error,
            duration_ms: response.durationMs,
            completed_at: new Date().toISOString(),
          })
          .eq('id', round.id)

        hasError = true
        break
      }
    }

    // Update session final status
    const finalStatus = hasError ? 'error' : 'completed'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('brainstorm_sessions')
      .update({
        status: finalStatus,
        total_cost: totalCost,
        completed_at: hasError ? null : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Fetch updated session and rounds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedSession } = await (supabase as any)
      .from('brainstorm_sessions')
      .select('*')
      .eq('id', id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedRounds } = await (supabase as any)
      .from('brainstorm_rounds')
      .select('*')
      .eq('session_id', id)
      .order('round_number', { ascending: true })

    return NextResponse.json({
      success: !hasError,
      session: updatedSession,
      rounds: updatedRounds,
    })
  } catch (error) {
    console.error('Error in POST /api/brainstorm/[id]/start:', error)

    // Try to update session status to error
    try {
      const { id } = await params
      const supabase = await createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('brainstorm_sessions')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
    } catch {
      // Ignore error in error handler
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
