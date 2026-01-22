'use client'

import { useCombatStore } from '@/lib/stores/combat-store'
import type { CombatSession } from '@/lib/types/combat'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { MessageSquare, Clock, Loader2 } from 'lucide-react'

interface SessionListProps {
  sessions: CombatSession[]
  isLoading: boolean
}

export function SessionList({ sessions, isLoading }: SessionListProps) {
  const { loadSession } = useCombatStore()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Chưa có phòng họp nào. Tạo phòng họp đầu tiên!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-300 mb-4">Phòng họp gần đây</h2>

      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => loadSession(session.id)}
          className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-red-500/50 hover:bg-slate-800 transition-all text-left group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-white group-hover:text-red-400 transition-colors">
                {session.title}
              </h3>
              {session.topic && (
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{session.topic}</p>
              )}
            </div>

            <span
              className={`px-2 py-1 rounded-full text-xs ${
                session.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : session.status === 'paused'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {session.status === 'active'
                ? 'Đang diễn ra'
                : session.status === 'paused'
                ? 'Tạm dừng'
                : 'Đã kết thúc'}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{session.total_messages} tin nhắn</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
