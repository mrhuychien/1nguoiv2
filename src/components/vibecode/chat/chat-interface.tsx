'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatInput } from './chat-input'
import { ChatMessage } from './chat-message'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import type { VibeCodeStep } from '@/lib/types/vibecode'
import { Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  step: VibeCodeStep
  placeholder?: string
  systemMessage?: string
  onComplete?: () => void
}

export function ChatInterface({
  step,
  placeholder = 'Nhập tin nhắn...',
  systemMessage,
  onComplete,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [streamingContent, setStreamingContent] = useState('')

  const {
    session,
    messages,
    isGenerating,
    setGenerating,
    addMessage,
    loadMessages,
    setError,
  } = useVibeCodeStore()

  // Load messages for current step
  useEffect(() => {
    if (session) {
      loadMessages(step)
    }
  }, [session, step, loadMessages])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Show system message on mount if provided
  useEffect(() => {
    if (systemMessage && messages.length === 0 && session) {
      addMessage({
        step,
        role: 'system',
        content: systemMessage,
      })
    }
  }, [systemMessage, messages.length, session, step, addMessage])

  const handleSend = async (content: string) => {
    if (!session || isGenerating) return

    // Add user message
    await addMessage({
      step,
      role: 'user',
      content,
    })

    setGenerating(true)
    setStreamingContent('')

    try {
      const response = await fetch('/api/vibecode/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          step,
          message: content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              // Save assistant message
              await addMessage({
                step,
                role: 'assistant',
                content: fullContent,
              })
              setStreamingContent('')

              // Check for completion trigger
              if (onComplete && shouldTriggerComplete(fullContent, step)) {
                onComplete()
              }
            } else {
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  fullContent += parsed.content
                  setStreamingContent(fullContent)
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  const filteredMessages = messages.filter((m) => m.step === step)

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              session_id: session?.id || '',
              step,
              role: 'assistant',
              content: streamingContent,
              created_at: new Date().toISOString(),
            }}
          />
        )}

        {/* Loading indicator */}
        {isGenerating && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4">
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-white/10 p-4">
        <ChatInput
          onSend={handleSend}
          placeholder={placeholder}
          disabled={isGenerating}
        />
      </div>
    </div>
  )
}

// Helper to determine if step is complete based on AI response
function shouldTriggerComplete(content: string, step: VibeCodeStep): boolean {
  const triggers: Record<VibeCodeStep, string[]> = {
    1: ['đã hiểu', 'rõ ràng', 'sẵn sàng', 'tiếp tục', 'bước tiếp'],
    2: ['đủ thông tin', 'hoàn tất', 'sẵn sàng tạo', 'tiến hành'],
    3: ['blueprint hoàn tất', 'đã tạo xong', 'duyệt blueprint'],
    4: ['contract đã sẵn', 'xác nhận scope', 'đồng ý với'],
    5: ['coder pack hoàn tất', 'đã tạo xong', 'sẵn sàng sử dụng'],
    6: ['hoàn thành', 'kết thúc', 'không còn gì'],
  }

  const stepTriggers = triggers[step] || []
  const lowerContent = content.toLowerCase()

  return stepTriggers.some((trigger) => lowerContent.includes(trigger))
}
