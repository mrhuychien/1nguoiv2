'use client'

import { ChatInterface } from '../chat/chat-interface'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface ContextStepProps {
  onNext: () => void
  onPrev: () => void
}

export function ContextStep({ onNext, onPrev }: ContextStepProps) {
  const { messages, updateContext } = useVibeCodeStore()

  // Check if enough context has been collected
  const userMessages = messages.filter((m) => m.step === 2 && m.role === 'user')
  const hasEnoughContext = userMessages.length >= 2

  const handleComplete = () => {
    // Extract context from messages and save
    const contextMessages = messages.filter((m) => m.step === 2)
    const contextSummary = contextMessages.map((m) => m.content).join('\n')

    updateContext({
      raw_context: contextSummary,
      collected_at: new Date().toISOString(),
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold mb-2">Bước 2: Context</h2>
        <p className="text-gray-400 text-sm">
          Cung cấp thông tin chi tiết về tech stack, timeline, constraints và requirements.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          step={2}
          placeholder="Trả lời câu hỏi về context..."
          systemMessage="Để tạo blueprint chính xác, tôi cần thu thập thêm thông tin. Hãy cho tôi biết về: 1) Tech stack bạn muốn sử dụng, 2) Timeline dự kiến, 3) Các constraints (ngân sách, team size, etc), 4) MVP features quan trọng nhất."
          onComplete={handleComplete}
        />
      </div>

      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button
          onClick={onPrev}
          variant="outline"
          className="border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {hasEnoughContext && (
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
