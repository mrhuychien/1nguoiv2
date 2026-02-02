import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/admin/check-admin'
import { encryptApiKey, validateApiKeyFormat } from '@/lib/admin/crypto'

type Provider = 'openai' | 'anthropic' | 'google' | 'xai'

const VALID_PROVIDERS: Provider[] = ['openai', 'anthropic', 'google', 'xai']

/**
 * GET /api/admin/ai-settings/[provider]
 * Get specific provider status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { isAdmin, userId } = await checkAdmin()
  const { provider } = await params

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  if (!VALID_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { error: `Invalid provider: ${provider}` },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ai_provider_settings')
    .select('*')
    .eq('provider', provider)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return without the actual key
  return NextResponse.json({
    ...data,
    api_key_encrypted: undefined,
    has_key: !!data.api_key_encrypted,
  })
}

/**
 * PATCH /api/admin/ai-settings/[provider]
 * Update provider settings (API key, enable/disable)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { isAdmin, userId } = await checkAdmin()
  const { provider } = await params

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  if (!VALID_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { error: `Invalid provider: ${provider}` },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { api_key, is_enabled } = body

  const supabase = await createClient()

  // Build update object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    updated_by: userId,
    updated_at: new Date().toISOString(),
  }

  // Handle API key update
  if (api_key !== undefined) {
    if (api_key === null || api_key === '') {
      // Clear the API key
      updateData.api_key_encrypted = null
      updateData.is_configured = false
      updateData.is_enabled = false
    } else {
      // Validate and encrypt the new key
      if (!validateApiKeyFormat(provider, api_key)) {
        return NextResponse.json(
          { error: `Invalid API key format for ${provider}` },
          { status: 400 }
        )
      }

      const encryptedKey = encryptApiKey(api_key)
      updateData.api_key_encrypted = encryptedKey
      updateData.is_configured = true
    }
  }

  // Handle enable/disable
  if (is_enabled !== undefined) {
    // Can only enable if configured
    if (is_enabled) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: current } = await (supabase as any)
        .from('ai_provider_settings')
        .select('is_configured')
        .eq('provider', provider)
        .single()

      if (!current?.is_configured && !updateData.is_configured) {
        return NextResponse.json(
          { error: 'Cannot enable provider without API key configured' },
          { status: 400 }
        )
      }
    }
    updateData.is_enabled = is_enabled
  }

  // Update the settings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('ai_provider_settings')
    .update(updateData)
    .eq('provider', provider)
    .select(`
      id,
      provider,
      display_name,
      is_enabled,
      is_configured,
      updated_at
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    provider: data,
    message: api_key
      ? `API key updated for ${provider}`
      : is_enabled !== undefined
      ? `${provider} ${is_enabled ? 'enabled' : 'disabled'}`
      : 'Settings updated',
  })
}

/**
 * DELETE /api/admin/ai-settings/[provider]
 * Remove API key from provider
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { isAdmin, userId } = await checkAdmin()
  const { provider } = await params

  if (!isAdmin || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }

  if (!VALID_PROVIDERS.includes(provider as Provider)) {
    return NextResponse.json(
      { error: `Invalid provider: ${provider}` },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('ai_provider_settings')
    .update({
      api_key_encrypted: null,
      is_configured: false,
      is_enabled: false,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('provider', provider)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `API key removed for ${provider}`,
  })
}
