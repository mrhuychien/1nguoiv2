import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: List artifacts for a session
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const session_id = searchParams.get('session_id')
  const project_id = searchParams.get('project_id')

  if (!session_id && !project_id) {
    return NextResponse.json({ error: 'Missing session_id or project_id' }, { status: 400 })
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('vibecode_artifacts').select('*')

  if (session_id) {
    query = query.eq('session_id', session_id)
  } else if (project_id) {
    query = query.eq('project_id', project_id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ artifacts: data })
}

// PATCH: Update artifact (approve, archive, etc)
export async function PATCH(request: NextRequest) {
  const { id, ...updates } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing artifact id' }, { status: 400 })
  }

  const supabase = await createClient()

  // If approving, set approved_at
  if (updates.status === 'approved') {
    updates.approved_at = new Date().toISOString()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('vibecode_artifacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ artifact: data })
}
