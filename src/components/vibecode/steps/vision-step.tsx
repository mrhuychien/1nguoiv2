'use client'

import { ChatInterface } from '../chat/chat-interface'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface VisionStepProps {
  onNext: () => void
}

export function VisionStep({ onNext }: VisionStepProps) {
  const { messages } = useVibeCodeStore()

  // Check if user has provided enough vision
  const hasVision = messages.filter((m) => m.step === 1 && m.role === 'user').length >= 1
  const hasResponse = messages.filter((m) => m.step === 1 && m.role === 'assistant').length >= 1

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold mb-2">Bước 1: Vision</h2>
        <p className="text-gray-400 text-sm">
          Mô tả ý tưởng sản phẩm của bạn. AI sẽ giúp bạn làm rõ và hoàn thiện vision.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatInterface
          step={1}
          placeholder="Mô tả ý tưởng sản phẩm của bạn..."
          systemMessage="Xin chào! Tôi sẽ giúp bạn xây dựng vision cho sản phẩm. Hãy mô tả ý tưởng của bạn - sản phẩm giải quyết vấn đề gì, cho ai, và tại sao nó quan trọng?"
        />
      </div>

      {hasVision && hasResponse && (
        <div className="p-4 border-t border-white/10 flex justify-end">
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
