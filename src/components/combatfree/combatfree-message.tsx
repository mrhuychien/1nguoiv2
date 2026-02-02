'use client'

import { FREE_AGENTS } from '@/lib/types/combatfree'
import type { CombatFreeMessage as MessageType, FreeAgentId } from '@/lib/types/combatfree'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface CombatFreeMessageProps {
  message: MessageType
  isStreaming?: boolean
}

export function CombatFreeMessage({ message, isStreaming }: CombatFreeMessageProps) {
  const isUser = message.role === 'user'
  const agent = message.agent ? FREE_AGENTS[message.agent as FreeAgentId] : null

  // User message
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex gap-3">
          <div className="p-4 rounded-2xl rounded-tr-none bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <p className="whitespace-pre-wrap">{message.content}</p>
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
              FREE
            </span>
          </div>
          <div
            className={cn(
              'p-4 rounded-2xl rounded-tl-none bg-slate-800/50 border border-slate-700/30',
              isStreaming && 'animate-pulse'
            )}
          >
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:mt-4 prose-headings:mb-2">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
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
