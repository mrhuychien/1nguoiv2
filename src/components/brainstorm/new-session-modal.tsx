'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { AgentAvatar } from './agent-avatar'
import { useBrainstormStore } from '@/store/brainstorm-store'
import { AGENTS, type AgentId, type SessionMode } from '@/lib/types/brainstorm'
import { Zap, Brain, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function NewSessionModal({
  open,
  onOpenChange,
  userId,
}: NewSessionModalProps) {
  const router = useRouter()
  const { createSession, isCreating } = useBrainstormStore()

  const [title, setTitle] = useState('')
  const [originalIdea, setOriginalIdea] = useState('')
  const [mode, setMode] = useState<SessionMode>('deep')
  const [quickAgent, setQuickAgent] = useState<AgentId>('spark')
  const [errors, setErrors] = useState<{ title?: string; idea?: string }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const newErrors: { title?: string; idea?: string } = {}
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề'
    if (!originalIdea.trim() || originalIdea.length < 10) {
      newErrors.idea = 'Mô tả ý tưởng ít nhất 10 ký tự'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const session = await createSession(
      {
        title: title.trim(),
        original_idea: originalIdea.trim(),
        mode,
        quick_mode_agent: mode === 'quick' ? quickAgent : undefined,
      },
      userId
    )

    if (session) {
      setTitle('')
      setOriginalIdea('')
      setErrors({})
      onOpenChange(false)
      router.push(`/brainstorm/${session.id}`)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-cyan-400" />
            Brainstorm Mới
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: App học tiếng Anh qua phim"
              className={cn(
                'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500',
                'focus:outline-none focus:border-cyan-500 transition-colors',
                errors.title ? 'border-red-500' : 'border-white/10'
              )}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Idea description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Mô tả ý tưởng *
            </label>
            <textarea
              value={originalIdea}
              onChange={(e) => setOriginalIdea(e.target.value)}
              rows={4}
              placeholder="Mô tả chi tiết ý tưởng của bạn. Càng chi tiết, AI càng phân tích tốt hơn..."
              className={cn(
                'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500',
                'focus:outline-none focus:border-cyan-500 resize-none transition-colors',
                errors.idea ? 'border-red-500' : 'border-white/10'
              )}
            />
            {errors.idea && (
              <p className="mt-1 text-sm text-red-400">{errors.idea}</p>
            )}
          </div>

          {/* Mode selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Chọn mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Quick Mode */}
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  mode === 'quick'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Quick Mode</span>
                </div>
                <p className="text-sm text-gray-400">
                  1 AI • ~30 giây • Phát triển nhanh
                </p>
              </button>

              {/* Deep Mode */}
              <button
                type="button"
                onClick={() => setMode('deep')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  mode === 'deep'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Deep Mode</span>
                </div>
                <p className="text-sm text-gray-400">
                  4 AI • 5 rounds • Phân tích toàn diện
                </p>
              </button>
            </div>
          </div>

          {/* Quick mode agent selection */}
          {mode === 'quick' && (
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Chọn AI
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(Object.keys(AGENTS) as AgentId[]).map((agent) => (
                  <button
                    key={agent}
                    type="button"
                    onClick={() => setQuickAgent(agent)}
                    className={cn(
                      'p-3 rounded-xl border text-center transition-all',
                      quickAgent === agent
                        ? `border-2 ${AGENTS[agent].bgColor}`
                        : 'border-white/10 hover:border-white/20'
                    )}
                    style={{
                      borderColor: quickAgent === agent ? AGENTS[agent].color : undefined,
                    }}
                  >
                    <AgentAvatar agent={agent} size="sm" className="justify-center mb-2" />
                    <p className={cn('text-xs font-medium', AGENTS[agent].textColor)}>
                      {AGENTS[agent].name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {AGENTS[agent].description.replace('The ', '')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className={cn(
                'flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-white font-medium',
                'hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isCreating ? 'Đang tạo...' : '🚀 Bắt đầu Brainstorm'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
