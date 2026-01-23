'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useCombatFreeStore } from '@/lib/stores/combatfree-store'
import { FREE_AGENTS } from '@/lib/types/combatfree'
import type { FreeAgentId } from '@/lib/types/combatfree'
import { CombatFreeMessage } from './combatfree-message'
import { CombatFreeSidebar } from './combatfree-sidebar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Trash2, Menu, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const AGENTS_LIST: FreeAgentId[] = ['spark', 'lens', 'radar', 'devil']

export function CombatFreeRoom() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedAgent, setSelectedAgent] = useState<FreeAgentId | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [showSidebar, setShowSidebar] = useState(false)

  const {
    messages,
    isSending,
    streamingContent,
    streamingAgent,
    error,
    currentSessionId,
    sessions,
    sendMessage,
    sendMessageToAgents,
    clearMessages,
    setError,
    createSession,
  } = useCombatFreeStore()

  // Extract mentioned agents from message
  const extractMentionedAgents = useCallback((text: string): FreeAgentId[] => {
    const mentionedAgents: FreeAgentId[] = []
    for (const agentId of AGENTS_LIST) {
      const agentName = FREE_AGENTS[agentId].name
      // Check for @AgentName pattern (case insensitive)
      const regex = new RegExp(`@${agentName}\\b`, 'i')
      if (regex.test(text)) {
        mentionedAgents.push(agentId)
      }
    }
    return mentionedAgents
  }, [])

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Filter agents for mention dropdown
  const filteredAgents = AGENTS_LIST.filter(agentId =>
    FREE_AGENTS[agentId].name.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  // Detect @ mention in input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputMessage(value)

    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setShowMentionDropdown(true)
      setMentionFilter(mentionMatch[1])
      setMentionIndex(0)
    } else {
      setShowMentionDropdown(false)
      setMentionFilter('')
    }
  }, [])

  // Insert mention into input
  const insertMention = useCallback((agentId: FreeAgentId) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
    const textBeforeCursor = inputMessage.slice(0, cursorPos)
    const textAfterCursor = inputMessage.slice(cursorPos)

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      const atPos = cursorPos - mentionMatch[0].length
      const newText = textBeforeCursor.slice(0, atPos) + `@${FREE_AGENTS[agentId].name} ` + textAfterCursor
      setInputMessage(newText)
      setSelectedAgent(agentId)
    }

    setShowMentionDropdown(false)
    setMentionFilter('')
    textarea.focus()
  }, [inputMessage])

  const handleSend = async () => {
    if (!inputMessage.trim() || isSending) return

    const message = inputMessage.trim()

    // Extract all mentioned agents from the message
    const mentionedAgents = extractMentionedAgents(message)

    // Determine which agents should respond
    let targetAgents: FreeAgentId[] = []

    if (mentionedAgents.length > 0) {
      // If there are mentions, use them
      targetAgents = mentionedAgents
    } else if (selectedAgent) {
      // Otherwise use the selected agent
      targetAgents = [selectedAgent]
    } else {
      // No agent selected or mentioned
      return
    }

    setInputMessage('')
    setShowMentionDropdown(false)

    if (targetAgents.length === 1) {
      // Single agent - use regular sendMessage
      await sendMessage(targetAgents[0], message)
    } else {
      // Multiple agents - use sendMessageToAgents
      await sendMessageToAgents(targetAgents, message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionDropdown && filteredAgents.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(prev => (prev + 1) % filteredAgents.length)
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredAgents[mentionIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionDropdown(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <CombatFreeSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-slate-700/50 px-4 py-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-lg">
              🆓
            </div>
            <div>
              <h1 className="font-semibold text-white flex items-center gap-2">
                {currentSession ? currentSession.title : 'Combat Free'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  {currentSession ? (currentSession.status === 'active' ? 'Đang họp' : 'Đã kết thúc') : '4 AI Miễn phí'}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                {currentSession?.topic || 'Hội đồng 4 AI - Hoàn toàn miễn phí'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!currentSession && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const title = prompt('Tiêu đề cuộc họp:')
                  if (title) {
                    const topic = prompt('Chủ đề (tùy chọn):')
                    createSession(title, topic || undefined)
                  }
                }}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tạo cuộc họp
              </Button>
            )}
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

      {/* Agent selector bar */}
      <div className="border-b border-slate-700/50 px-4 py-3 bg-slate-900/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-400 mr-2">Chọn AI:</span>
          {AGENTS_LIST.map((agentId) => {
            const agent = FREE_AGENTS[agentId]
            const isSelected = selectedAgent === agentId
            return (
              <button
                key={agentId}
                onClick={() => setSelectedAgent(agentId)}
                disabled={isSending}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
                  isSelected
                    ? `bg-gradient-to-r ${agent.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                )}
              >
                <span>{agent.emoji}</span>
                <span>{agent.name}</span>
              </button>
            )
          })}
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
                {currentSession ? currentSession.title : 'Combat Free - Hội đồng 4 AI Miễn phí'}
              </h2>
              <p className="text-slate-400 mb-4">
                {currentSession?.topic || 'Chat với 4 AI agents hoàn toàn miễn phí!'}
              </p>
              <div className="flex justify-center gap-4 flex-wrap mb-4">
                {AGENTS_LIST.map((agentId) => {
                  const agent = FREE_AGENTS[agentId]
                  return (
                    <div key={agentId} className="flex items-center gap-2 text-sm">
                      <span className={cn('w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-xs', agent.color)}>
                        {agent.emoji}
                      </span>
                      <span className="text-slate-300">{agent.name}</span>
                    </div>
                  )
                })}
              </div>
              {!currentSession && (
                <div className="pt-4 border-t border-slate-700/30">
                  <p className="text-sm text-slate-500 mb-3">
                    Tạo cuộc họp để lưu lại nội dung trao đổi
                  </p>
                  <Button
                    onClick={() => {
                      const title = prompt('Tiêu đề cuộc họp:')
                      if (title) {
                        const topic = prompt('Chủ đề (tùy chọn):')
                        createSession(title, topic || undefined)
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo cuộc họp mới
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <CombatFreeMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && streamingAgent && (
          <CombatFreeMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              agent: streamingAgent,
              content: streamingContent,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Loading indicator */}
        {isSending && !streamingContent && streamingAgent && (
          <div className="flex gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
                FREE_AGENTS[streamingAgent].color
              )}
            >
              {FREE_AGENTS[streamingAgent].emoji}
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
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={selectedAgent
                ? `Nói với ${FREE_AGENTS[selectedAgent].name}... (gõ @Spark @Lens để hỏi nhiều AI)`
                : 'Chọn AI hoặc gõ @ để mention (VD: @Spark @Lens cho nhiều AI trả lời)'
              }
              className="bg-slate-800 border-slate-700 text-white resize-none pr-12 min-h-[48px] max-h-32"
              rows={1}
              disabled={isSending}
            />

            {/* Mention Dropdown */}
            {showMentionDropdown && filteredAgents.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-2 text-xs text-slate-400 border-b border-slate-700">
                  Chọn AI để mention
                </div>
                {filteredAgents.map((agentId, index) => {
                  const agent = FREE_AGENTS[agentId]
                  return (
                    <button
                      key={agentId}
                      onClick={() => insertMention(agentId)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors text-left',
                        index === mentionIndex && 'bg-slate-700/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-sm shrink-0',
                          agent.color
                        )}
                      >
                        {agent.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">{agent.name}</div>
                        <div className="text-xs text-slate-400 truncate">
                          {agent.description.split(' - ')[1]}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={(!selectedAgent && extractMentionedAgents(inputMessage).length === 0) || !inputMessage.trim() || isSending}
            className={cn(
              'px-4',
              selectedAgent
                ? `bg-gradient-to-r ${FREE_AGENTS[selectedAgent].color} hover:opacity-90`
                : extractMentionedAgents(inputMessage).length > 0
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90'
                  : 'bg-slate-700 hover:bg-slate-600'
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
      </div> {/* End Main Content */}
    </div>
  )
}
