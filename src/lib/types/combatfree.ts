// ═══════════════════════════════════════════════════════════════════════════
// COMBAT FREE TYPES - Free AI Chat using WebAI-to-API / gpt4free
// ═══════════════════════════════════════════════════════════════════════════

export type FreeProvider = 'gemini' | 'chatgpt' | 'claude' | 'deepseek' | 'auto'

export interface CombatFreeMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  provider?: FreeProvider
  model?: string
  created_at: string
}

export interface CombatFreeConfig {
  // WebAI-to-API server URL (default: http://localhost:8000)
  serverUrl: string
  // Preferred provider
  provider: FreeProvider
  // Model to use
  model: string
}

export const FREE_PROVIDERS: Record<FreeProvider, {
  name: string
  emoji: string
  color: string
  description: string
  models: string[]
}> = {
  gemini: {
    name: 'Gemini',
    emoji: '🌟',
    color: 'from-blue-500 to-cyan-500',
    description: 'Google Gemini (miễn phí)',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.0-pro'],
  },
  chatgpt: {
    name: 'ChatGPT',
    emoji: '🤖',
    color: 'from-green-500 to-emerald-500',
    description: 'OpenAI ChatGPT (gpt4free)',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  },
  claude: {
    name: 'Claude',
    emoji: '🧠',
    color: 'from-orange-500 to-amber-500',
    description: 'Anthropic Claude (gpt4free)',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  deepseek: {
    name: 'DeepSeek',
    emoji: '🔍',
    color: 'from-purple-500 to-pink-500',
    description: 'DeepSeek AI (gpt4free)',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
  auto: {
    name: 'Auto',
    emoji: '🎲',
    color: 'from-slate-500 to-slate-600',
    description: 'Tự động chọn provider khả dụng',
    models: ['auto'],
  },
}

export const DEFAULT_CONFIG: CombatFreeConfig = {
  serverUrl: 'http://localhost:6969',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
}
