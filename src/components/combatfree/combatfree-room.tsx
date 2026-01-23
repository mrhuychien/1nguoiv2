'use client'

import { useEffect, useRef, useState } from 'react'
import { useCombatFreeStore } from '@/lib/stores/combatfree-store'
import { FREE_PROVIDERS } from '@/lib/types/combatfree'
import type { FreeProvider } from '@/lib/types/combatfree'
import { CombatFreeMessage } from './combatfree-message'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Trash2, Settings, Wifi, WifiOff, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROVIDERS = Object.entries(FREE_PROVIDERS) as [FreeProvider, typeof FREE_PROVIDERS[FreeProvider]][]

export function CombatFreeRoom() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const {
    messages,
    config,
    isSending,
    streamingContent,
    error,
    serverStatus,
    setConfig,
    sendMessage,
    clearMessages,
    checkServerStatus,
    setError,
  } = useCombatFreeStore()

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Check server status on mount
  useEffect(() => {
    checkServerStatus()
  }, [checkServerStatus])

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return

    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentProvider = FREE_PROVIDERS[config.provider]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-lg">
            🆓
          </div>
          <div>
            <h1 className="font-semibold text-white flex items-center gap-2">
              Combat Free
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                Miễn phí
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Chat với AI miễn phí qua WebAI-to-API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Server status */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs',
              serverStatus === 'online' && 'bg-green-500/20 text-green-400',
              serverStatus === 'offline' && 'bg-red-500/20 text-red-400',
              serverStatus === 'unknown' && 'bg-slate-500/20 text-slate-400'
            )}
          >
            {serverStatus === 'online' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {serverStatus === 'online' ? 'Server Online' : serverStatus === 'offline' ? 'Server Offline' : 'Checking...'}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-slate-700/50 px-4 py-4 bg-slate-900/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Server URL */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                WebAI-to-API Server URL
              </label>
              <input
                type="text"
                value={config.serverUrl}
                onChange={(e) => setConfig({ serverUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                placeholder="http://localhost:8000"
              />
              <a
                href="https://github.com/Amm1rr/WebAI-to-API"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1"
              >
                Hướng dẫn cài đặt <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Provider selector */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Provider
              </label>
              <div className="flex flex-wrap gap-2">
                {PROVIDERS.map(([id, provider]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setConfig({
                        provider: id,
                        model: provider.models[0],
                      })
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                      config.provider === id
                        ? `bg-gradient-to-r ${provider.color} text-white`
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    <span>{provider.emoji}</span>
                    <span>{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model selector */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Model: {config.model}
            </label>
            <div className="flex flex-wrap gap-2">
              {currentProvider.models.map((model) => (
                <button
                  key={model}
                  onClick={() => setConfig({ model })}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs transition-all',
                    config.model === model
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => {
              checkServerStatus()
              setShowSettings(false)
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Lưu & Kiểm tra kết nối
          </Button>
        </div>
      )}

      {/* Provider indicator */}
      <div className="border-b border-slate-700/50 px-4 py-2 bg-slate-900/30 flex items-center gap-2">
        <span className="text-slate-400 text-sm">Đang dùng:</span>
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-gradient-to-r',
            currentProvider.color
          )}
        >
          <span>{currentProvider.emoji}</span>
          <span className="text-white font-medium">{currentProvider.name}</span>
          <span className="text-white/70">({config.model})</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex justify-center">
            <div className="max-w-xl p-6 rounded-xl bg-slate-800/30 border border-slate-700/30 text-center">
              <div className="text-4xl mb-4">🆓</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Chào mừng đến Combat Free!
              </h2>
              <p className="text-slate-400 mb-4">
                Chat với AI hoàn toàn miễn phí. Sử dụng WebAI-to-API để kết nối với Gemini, ChatGPT, Claude và nhiều AI khác.
              </p>
              <div className="text-sm text-slate-500">
                {serverStatus === 'offline' ? (
                  <span className="text-yellow-400">
                    ⚠️ Server chưa kết nối. Hãy cài đặt WebAI-to-API hoặc sử dụng gpt4free fallback.
                  </span>
                ) : (
                  <span className="text-green-400">
                    ✓ Sẵn sàng chat!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <CombatFreeMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <CombatFreeMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              provider: config.provider,
              model: config.model,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Loading indicator */}
        {isSending && !streamingContent && (
          <div className="flex gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
                currentProvider.color
              )}
            >
              {currentProvider.emoji}
            </div>
            <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-4">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-200 underline"
            >
              Đóng
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700/50 p-4 bg-slate-900/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
              className="bg-slate-800 border-slate-700 text-white resize-none pr-12 min-h-[48px] max-h-32"
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending}
            className={cn(
              'px-4 bg-gradient-to-r',
              currentProvider.color,
              'hover:opacity-90'
            )}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
