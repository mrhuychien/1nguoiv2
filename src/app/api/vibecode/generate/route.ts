import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STEP_PROMPTS, buildContextString, GENERATE_PROMPTS } from '@/lib/services/vibecode-ai'
import { getProviderApiKey } from '@/lib/ai-agents/base'
import type { ArtifactType } from '@/lib/types/vibecode'

export async function POST(request: NextRequest) {
  try {
    const { session_id, type } = await request.json()

    if (!session_id || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session, error: sessionError } = await (supabase as any)
      .from('vibecode_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get existing artifacts for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: artifacts } = await (supabase as any)
      .from('vibecode_artifacts')
      .select('*')
      .eq('session_id', session_id)
      .in('status', ['draft', 'approved'])

    // Get messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages } = await (supabase as any)
      .from('vibecode_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true })

    // Build full context
    let context = buildContextString(session.vision_text, session.context_data, messages || [])

    // Add existing artifacts to context
    if (artifacts && artifacts.length > 0) {
      context += '\n## Existing Artifacts\n'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      artifacts.forEach((a: any) => {
        context += `### ${a.type} (${a.status})\n${a.content}\n\n`
      })
    }

    // Determine which step prompt to use
    const stepForType = type === 'blueprint' ? 3 : type === 'contract' ? 4 : 5

    // Get API key from database
    const apiKey = await getProviderApiKey('anthropic')
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured. Please configure Anthropic API key in admin panel.' }, { status: 500 })
    }

    // Generate artifact
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16384, // Larger for coder pack
        system: STEP_PROMPTS[stepForType as 3 | 4 | 5],
        messages: [
          {
            role: 'user',
            content: `${context}\n\n---\n\n${GENERATE_PROMPTS[type as ArtifactType]}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''

    // Get version number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingOfType = artifacts?.filter((a: any) => a.type === type) || []
    const version = existingOfType.length + 1

    // Format title
    const typeTitle = type === 'coder_pack' ? 'Coder Pack' :
      type.charAt(0).toUpperCase() + type.slice(1)

    // Save artifact
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: artifact, error: artifactError } = await (supabase as any)
      .from('vibecode_artifacts')
      .insert({
        session_id,
        project_id: session.project_id,
        type,
        version,
        title: `${typeTitle} v${version}`,
        content,
        status: 'draft',
        metadata: {
          generated_at: new Date().toISOString(),
          model: 'claude-sonnet-4-5-20250929',
        },
      })
      .select()
      .single()

    if (artifactError) {
      console.error('Save artifact error:', artifactError)
      return NextResponse.json({ error: 'Failed to save artifact' }, { status: 500 })
    }

    return NextResponse.json({ artifact })
  } catch (error) {
    console.error('Generate API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
