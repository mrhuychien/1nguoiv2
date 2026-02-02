import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/admin/check-admin'

/**
 * GET /api/admin/ai-settings
 * List all AI provider settings (without exposing keys)
 */
export async function GET() {
  // Check admin access
  const { isAdmin, userId } = await checkAdmin()

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  const supabase = await createClient()

  // Get all providers with their status (no keys exposed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ai_provider_settings')
    .select(`
      id,
      provider,
      display_name,
      is_enabled,
      is_configured,
      total_requests,
      total_tokens,
      total_cost,
      last_used_at,
      updated_at
    `)
    .order('provider')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map providers to include agent info
  const agentMap: Record<string, { agent: string; icon: string }> = {
    openai: { agent: 'SPARK', icon: '💡' },
    anthropic: { agent: 'LENS', icon: '🔍' },
    google: { agent: 'RADAR', icon: '📊' },
    xai: { agent: 'DEVIL', icon: '😈' },
  }

  const providers = data.map((p: Record<string, unknown>) => ({
    ...p,
    ...(agentMap[p.provider as string] || {}),
  }))

  return NextResponse.json({ providers })
}
