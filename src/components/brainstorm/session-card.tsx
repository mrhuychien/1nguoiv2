'use client'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { AGENTS, type BrainstormSession, type AgentId } from '@/lib/types/brainstorm'
import { Clock, Zap, Star, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: BrainstormSession
}

export function SessionCard({ session }: SessionCardProps) {
  const router = useRouter()

  const statusConfig = {
    pending: { label: 'Chờ xử lý', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    running: { label: 'Đang chạy', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
    completed: { label: 'Hoàn thành', color: 'text-green-400', bgColor: 'bg-green-500/10' },
    failed: { label: 'Lỗi', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    cancelled: { label: 'Đã hủy', color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
  }

  const config = statusConfig[session.status]

  return (
    <div
      className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-cyan-500/50 transition-all group"
      onClick={() => router.push(`/brainstorm/${session.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {session.title}
          </h3>
          {session.project && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: session.project.color }}
              />
              <span className="text-sm text-gray-400">
                {session.project.title}
              </span>
            </div>
          )}
        </div>
        <span className={cn('px-2 py-1 rounded-full text-xs flex items-center gap-1', config.bgColor, config.color)}>
          {session.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
          {config.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span>
          {formatDistanceToNow(new Date(session.created_at), {
            addSuffix: true,
            locale: vi,
          })}
        </span>
        {session.duration_seconds > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
          </span>
        )}
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3" />
          {session.mode === 'deep' ? 'Deep' : 'Quick'}
        </span>
      </div>

      {/* Score (if completed) */}
      {session.status === 'completed' && session.final_verdict && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Điểm khả thi</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(session.final_verdict!.score / 2)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-600'
                  )}
                />
              ))}
              <span className="ml-2 font-semibold text-white">
                {session.final_verdict.score}/10
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
            {session.final_verdict.summary}
          </p>
        </div>
      )}

      {/* Progress (if running) */}
      {session.status === 'running' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">
              Round {session.current_round}/{session.total_rounds}
            </span>
            <span className="text-cyan-400">
              {Math.round((session.current_round / session.total_rounds) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all"
              style={{
                width: `${(session.current_round / session.total_rounds) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Agent badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {session.mode === 'deep' ? (
            (['spark', 'radar', 'lens', 'devil'] as AgentId[]).map((agent) => (
              <div
                key={agent}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  AGENTS[agent].bgColor
                )}
              >
                {AGENTS[agent].icon}
              </div>
            ))
          ) : (
            session.quick_mode_agent && (
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                  AGENTS[session.quick_mode_agent].bgColor
                )}
              >
                {AGENTS[session.quick_mode_agent].icon}
              </div>
            )
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
      </div>
    </div>
  )
}
