'use client'

import { useEffect, useRef, useState } from 'react'
import { useCombatStore } from '@/lib/stores/combat-store'
import { COMBAT_AGENTS } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'
import { CombatMessage } from './combat-message'
import { AgentSelector } from './agent-selector'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Loader2, LogOut } from 'lucide-react'

export function CombatRoom() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)
  const [inputMessage, setInputMessage] = useState('')

  const {
    session,
    messages,
    isSending,
    streamingContent,
    streamingAgent,
    error,
    sendMessage,
    endSession,
    reset,
  } = useCombatStore()

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    if (!selectedAgent || !inputMessage.trim() || isSending) return

    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(selectedAgent, message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBack = () => {
    reset()
  }

  const handleEnd = async () => {
    await endSession()
    reset()
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-white">{session.title}</h1>
            {session.topic && (
              <p className="text-sm text-slate-400 truncate max-w-md">{session.topic}</p>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleEnd}
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Kết thúc
        </Button>
      </div>

      {/* Agent selector bar */}
      <div className="border-b border-slate-700/50 px-4 py-3 bg-slate-900/50">
        <AgentSelector
          selectedAgent={selectedAgent}
          onSelect={setSelectedAgent}
          disabled={isSending}
        />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <CombatMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && streamingAgent && (
          <CombatMessage
            message={{
              id: 'streaming',
              session_id: session.id,
              role: streamingAgent,
              content: streamingContent,
              mentioned_agents: [],
              tokens_input: 0,
              tokens_output: 0,
              cost: 0,
              duration_ms: 0,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Loading indicator */}
        {isSending && !streamingContent && streamingAgent && (
          <div className="flex gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${COMBAT_AGENTS[streamingAgent].color} flex items-center justify-center text-lg shrink-0`}
            >
              {COMBAT_AGENTS[streamingAgent].emoji}
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
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700/50 p-4 bg-slate-900/80 backdrop-blur-sm">
        {!selectedAgent ? (
          <p className="text-center text-slate-500 py-2">
            Chọn một AI ở trên để bắt đầu cuộc hội thoại
          </p>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Nói với ${COMBAT_AGENTS[selectedAgent].name}...`}
                className="bg-slate-800 border-slate-700 text-white resize-none pr-12 min-h-[48px] max-h-32"
                rows={1}
                disabled={isSending}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isSending}
              className={`bg-gradient-to-r ${COMBAT_AGENTS[selectedAgent].color} hover:opacity-90 px-4`}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
