import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: List combat sessions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const project_id = searchParams.get('project_id')

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('combat_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (project_id) {
    query = query.eq('project_id', project_id)
  }

  const { data, error } = await query.limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessions: data })
}

// POST: Create new combat session
export async function POST(request: NextRequest) {
  const { title, topic, project_id } = await request.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('combat_sessions')
    .insert({
      user_id: user.id,
      project_id: project_id || null,
      title,
      topic: topic || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Add welcome message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('combat_messages').insert({
    session_id: data.id,
    role: 'system',
    content: `🎯 Phòng họp "${title}" đã sẵn sàng!\n\nBạn là người điều phối. Chọn AI để bắt đầu thảo luận:\n• ⚡ Spark - Sáng tạo\n• 🔍 Lens - Phân tích\n• 📡 Radar - Quan sát\n• 😈 Devil - Phản biện`,
  })

  return NextResponse.json({ session: data })
}
