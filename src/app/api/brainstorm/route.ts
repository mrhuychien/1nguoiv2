import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateSessionInput } from '@/lib/types/brainstorm'

// GET /api/brainstorm - List all sessions
export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('brainstorm_sessions')
    .select(`
      *,
      project:projects(id, title, color)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/brainstorm - Create new session
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: CreateSessionInput = await request.json()

  // Validate input
  if (!body.title || !body.original_idea) {
    return NextResponse.json(
      { error: 'Title and original_idea are required' },
      { status: 400 }
    )
  }

  const sessionData = {
    user_id: user.id,
    title: body.title,
    original_idea: body.original_idea,
    mode: body.mode || 'deep',
    quick_mode_agent: body.quick_mode_agent || null,
    project_id: body.project_id || null,
    status: 'pending',
    total_rounds: body.mode === 'deep' ? 5 : 1,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('brainstorm_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
