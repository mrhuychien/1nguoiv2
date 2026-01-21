import crypto from 'crypto'

/**
 * Encryption utility for API keys
 * Uses AES-256-GCM for authenticated encryption
 *
 * SECURITY NOTES:
 * - This module MUST only be used server-side
 * - Never expose encrypted keys or encryption logic to client
 * - Set ENCRYPTION_SECRET in environment variables (min 32 chars)
 */

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Get encryption key from environment
 * Falls back to a default for development only
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET

  if (!secret) {
    console.warn('WARNING: ENCRYPTION_SECRET not set. Using default key (NOT SECURE FOR PRODUCTION)')
    // Default key for development - DO NOT USE IN PRODUCTION
    return crypto.scryptSync('default-dev-key-not-secure', 'salt', 32)
  }

  if (secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters')
  }

  // Derive a proper key from the secret
  return crypto.scryptSync(secret, 'api-key-salt', 32)
}

/**
 * Encrypt an API key
 * @param plainText - The API key to encrypt
 * @returns Base64 encoded encrypted string (includes IV and auth tag)
 */
export function encryptApiKey(plainText: string): string {
  if (!plainText) return ''

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plainText, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Combine IV + Auth Tag + Encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ])

  return combined.toString('base64')
}

/**
 * Decrypt an API key
 * @param encryptedText - Base64 encoded encrypted string
 * @returns The original API key
 */
export function decryptApiKey(encryptedText: string): string {
  if (!encryptedText) return ''

  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedText, 'base64')

    // Extract IV, Auth Tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  } catch (error) {
    console.error('Failed to decrypt API key:', error)
    throw new Error('Failed to decrypt API key. Key may be corrupted or encryption secret changed.')
  }
}

/**
 * Mask an API key for display (show only first 4 and last 4 chars)
 * @param apiKey - The API key to mask
 * @returns Masked string like "sk-a...xyz"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) return '••••••••'

  const prefix = apiKey.substring(0, 7)  // e.g., "sk-ant-" or "sk-proj"
  const suffix = apiKey.substring(apiKey.length - 4)

  return `${prefix}...${suffix}`
}

/**
 * Validate API key format for each provider
 */
export function validateApiKeyFormat(provider: string, apiKey: string): boolean {
  if (!apiKey || apiKey.length < 10) return false

  switch (provider) {
    case 'openai':
      // OpenAI keys start with 'sk-' and are ~51 chars
      return apiKey.startsWith('sk-') && apiKey.length >= 40
    case 'anthropic':
      // Anthropic keys start with 'sk-ant-'
      return apiKey.startsWith('sk-ant-') && apiKey.length >= 40
    case 'google':
      // Google AI keys are typically 39 chars
      return apiKey.length >= 30
    case 'xai':
      // xAI/Grok keys - format may vary
      return apiKey.length >= 20
    default:
      return apiKey.length >= 10
  }
}
