import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdmin } from '@/lib/admin/check-admin'
import { decryptApiKey } from '@/lib/admin/crypto'

type Provider = 'openai' | 'anthropic' | 'google' | 'xai'

/**
 * POST /api/admin/ai-settings/[provider]/test
 * Test if the configured API key works
 */
export async function POST(
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

  const supabase = await createClient()

  // Get encrypted key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings, error } = await (supabase as any)
    .from('ai_provider_settings')
    .select('api_key_encrypted, is_configured')
    .eq('provider', provider)
    .single()

  if (error || !settings) {
    return NextResponse.json(
      { error: `Provider ${provider} not found` },
      { status: 404 }
    )
  }

  if (!settings.is_configured || !settings.api_key_encrypted) {
    return NextResponse.json(
      { error: `No API key configured for ${provider}` },
      { status: 400 }
    )
  }

  try {
    // Decrypt the API key
    const apiKey = decryptApiKey(settings.api_key_encrypted)

    // Test the API key based on provider
    const testResult = await testProviderApiKey(provider as Provider, apiKey)

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
      model: testResult.model,
      latency_ms: testResult.latency,
    })
  } catch (error) {
    console.error(`Error testing ${provider} API:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function testProviderApiKey(
  provider: Provider,
  apiKey: string
): Promise<{ success: boolean; message: string; model?: string; latency?: number }> {
  const startTime = Date.now()

  switch (provider) {
    case 'openai': {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`)
      }

      return {
        success: true,
        message: 'OpenAI API key is valid',
        model: 'gpt-4.1',
        latency: Date.now() - startTime,
      }
    }

    case 'anthropic': {
      // Test Anthropic with a minimal request
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        if (error.error?.type === 'authentication_error') {
          throw new Error('Invalid Anthropic API key')
        }
        // Rate limit or other errors mean the key is valid
        if (response.status === 429 || response.status === 529) {
          return {
            success: true,
            message: 'Anthropic API key is valid (rate limited)',
            model: 'claude-sonnet-4-5-20250514',
            latency: Date.now() - startTime,
          }
        }
        throw new Error(error.error?.message || `Anthropic API error: ${response.status}`)
      }

      return {
        success: true,
        message: 'Anthropic API key is valid',
        model: 'claude-sonnet-4-5-20250514',
        latency: Date.now() - startTime,
      }
    }

    case 'google': {
      // Test Google AI with models list
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `Google AI API error: ${response.status}`)
      }

      return {
        success: true,
        message: 'Google AI API key is valid',
        model: 'gemini-2.0-flash',
        latency: Date.now() - startTime,
      }
    }

    case 'xai': {
      // Test xAI/Grok - endpoint may vary
      const response = await fetch('https://api.x.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        // xAI might not have a public models endpoint yet
        // Try with a minimal chat request
        const chatResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'grok-3',
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 1,
          }),
        })

        if (!chatResponse.ok) {
          const error = await chatResponse.json().catch(() => ({}))
          throw new Error(error.error?.message || `xAI API error: ${chatResponse.status}`)
        }
      }

      return {
        success: true,
        message: 'xAI API key is valid',
        model: 'grok-3',
        latency: Date.now() - startTime,
      }
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
