'use client'

import { cn } from '@/lib/utils'
import type { VibeCodeMessage } from '@/lib/types/vibecode'

interface ChatMessageProps {
  message: VibeCodeMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-white/5 rounded-full text-xs text-gray-400">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex gap-3', isUser && 'justify-end')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm shrink-0">
          🤖
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl p-4 whitespace-pre-wrap',
          isUser
            ? 'bg-cyan-500/20 rounded-tr-none'
            : 'bg-white/5 rounded-tl-none'
        )}
      >
        <div className="text-sm prose prose-invert prose-sm max-w-none">
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-sm shrink-0">
          👤
        </div>
      )}
    </div>
  )
}
