'use client'

import { COMBAT_AGENTS } from '@/lib/types/combat'
import type { CombatMessage as CombatMessageType } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface CombatMessageProps {
  message: CombatMessageType
  isStreaming?: boolean
}

export function CombatMessage({ message, isStreaming }: CombatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  const isAgent = ['spark', 'lens', 'radar', 'devil'].includes(message.role)

  const agent = isAgent ? COMBAT_AGENTS[message.role as AgentId] : null

  // System message
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-xl p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 text-slate-400 text-sm">
          <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    )
  }

  // User message
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex gap-3">
          <div className="p-4 rounded-2xl rounded-tr-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.mentioned_agents.length > 0 && (
              <div className="flex gap-1 mt-2">
                {message.mentioned_agents.map((agentId) => (
                  <span
                    key={agentId}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/20"
                  >
                    @{COMBAT_AGENTS[agentId as AgentId]?.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shrink-0">
            U
          </div>
        </div>
      </div>
    )
  }

  // Agent message
  if (agent) {
    return (
      <div className="flex gap-3 max-w-[85%]">
        <div
          className={cn(
            'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0',
            agent.color
          )}
        >
          {agent.emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white">{agent.name}</span>
            <span className="text-xs text-slate-500">{agent.description.split(' - ')[1]}</span>
          </div>
          <div
            className={cn(
              'p-4 rounded-2xl rounded-tl-none bg-slate-800/50 border border-slate-700/30',
              isStreaming && 'animate-pulse'
            )}
          >
            <ReactMarkdown
              className="prose prose-invert prose-sm max-w-none
                prose-p:my-2 prose-ul:my-2 prose-ol:my-2
                prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2"
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-white/50 animate-pulse ml-1" />
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
