import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/brainstorm/[id] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: session, error } = await (supabase as any)
    .from('brainstorm_sessions')
    .select(`
      *,
      project:projects(id, title, color)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rounds } = await (supabase as any)
    .from('brainstorm_rounds')
    .select('*')
    .eq('session_id', id)
    .order('round_number', { ascending: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: insights } = await (supabase as any)
    .from('brainstorm_insights')
    .select('*')
    .eq('session_id', id)
    .order('created_at', { ascending: true })

  return NextResponse.json({
    ...session,
    rounds: rounds || [],
    insights: insights || [],
  })
}

// DELETE /api/brainstorm/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('brainstorm_sessions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
