'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useCombatStore } from '@/lib/stores/combat-store'
import { COMBAT_AGENTS } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'
import { CombatMessage } from './combat-message'
import { AgentSelector } from './agent-selector'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Loader2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const AGENTS_LIST: AgentId[] = ['spark', 'lens', 'radar', 'devil']

export function CombatRoom() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)

  const {
    session,
    messages,
    isSending,
    streamingContent,
    streamingAgent,
    error,
    sendMessage,
    sendMessageToAgents,
    endSession,
    reset,
  } = useCombatStore()

  // Extract mentioned agents from message
  const extractMentionedAgents = useCallback((text: string): AgentId[] => {
    const mentionedAgents: AgentId[] = []
    for (const agentId of AGENTS_LIST) {
      const agentName = COMBAT_AGENTS[agentId].name
      // Check for @AgentName pattern (case insensitive)
      const regex = new RegExp(`@${agentName}\\b`, 'i')
      if (regex.test(text)) {
        mentionedAgents.push(agentId)
      }
    }
    return mentionedAgents
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Filter agents for mention dropdown
  const filteredAgents = AGENTS_LIST.filter(agentId =>
    COMBAT_AGENTS[agentId].name.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  // Detect @ mention in input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputMessage(value)

    // Check for @ mention
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
  const insertMention = useCallback((agentId: AgentId) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
    const textBeforeCursor = inputMessage.slice(0, cursorPos)
    const textAfterCursor = inputMessage.slice(cursorPos)

    // Find @ position
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      const atPos = cursorPos - mentionMatch[0].length
      const newText = textBeforeCursor.slice(0, atPos) + `@${COMBAT_AGENTS[agentId].name} ` + textAfterCursor
      setInputMessage(newText)

      // Auto-select this agent
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
    let targetAgents: AgentId[] = []

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
    // Handle mention dropdown navigation
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

    // Normal send on Enter
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

  // Calculate totals from messages
  const sessionStats = messages.reduce(
    (acc, msg) => ({
      totalTokens: acc.totalTokens + msg.tokens_input + msg.tokens_output,
      totalCost: acc.totalCost + msg.cost,
      messageCount: acc.messageCount + (msg.role !== 'user' && msg.role !== 'system' ? 1 : 0),
    }),
    { totalTokens: 0, totalCost: 0, messageCount: 0 }
  )

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

        <div className="flex items-center gap-4">
          {/* Session stats */}
          {sessionStats.totalTokens > 0 && (
            <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg">
              <span title="Tổng câu trả lời AI">
                💬 {sessionStats.messageCount}
              </span>
              <span title="Tổng tokens">
                🎯 {sessionStats.totalTokens.toLocaleString()}
              </span>
              <span title="Tổng chi phí">
                💰 ${sessionStats.totalCost.toFixed(4)}
              </span>
            </div>
          )}

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
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={selectedAgent
                ? `Nói với ${COMBAT_AGENTS[selectedAgent].name}... (gõ @Spark @Lens để hỏi nhiều AI)`
                : 'Gõ @ để mention AI (VD: @Spark @Lens cho nhiều AI trả lời)'
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
                  const agent = COMBAT_AGENTS[agentId]
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
                ? `bg-gradient-to-r ${COMBAT_AGENTS[selectedAgent].color} hover:opacity-90`
                : extractMentionedAgents(inputMessage).length > 0
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
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
    </div>
  )
}
