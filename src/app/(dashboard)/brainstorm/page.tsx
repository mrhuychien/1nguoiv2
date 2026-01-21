'use client'

import { useEffect, useState } from 'react'
import { useBrainstormStore } from '@/store/brainstorm-store'
import { useUser } from '@/hooks/use-user'
import { SessionCard } from '@/components/brainstorm/session-card'
import { NewSessionModal } from '@/components/brainstorm/new-session-modal'
import { Brain, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterStatus = 'all' | 'running' | 'completed'

export default function BrainstormPage() {
  const { user, isLoading: userLoading } = useUser()
  const { sessions, isLoading, loadSessions } = useBrainstormStore()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showNewModal, setShowNewModal] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadSessions(user.id)
    }
  }, [user?.id, loadSessions])

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true
    if (filter === 'running') return s.status === 'running' || s.status === 'pending'
    if (filter === 'completed') return s.status === 'completed'
    return true
  })

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-400" />
            Brainstorm4
          </h1>
          <p className="text-gray-400 mt-1">
            4 AI cùng phân tích và phát triển ý tưởng của bạn
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Brainstorm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'running', 'completed'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            {f === 'all' && 'Tất cả'}
            {f === 'running' && '🔄 Đang chạy'}
            {f === 'completed' && '✅ Hoàn thành'}
          </button>
        ))}
      </div>

      {/* Sessions grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <EmptyState onNewSession={() => setShowNewModal(true)} />
      )}

      {/* New session modal */}
      {user && (
        <NewSessionModal
          open={showNewModal}
          onOpenChange={setShowNewModal}
          userId={user.id}
        />
      )}
    </div>
  )
}

function EmptyState({ onNewSession }: { onNewSession: () => void }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <Brain className="w-10 h-10 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Chưa có phiên Brainstorm nào
          </h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Bắt đầu với một ý tưởng, 4 AI sẽ giúp bạn phân tích và phát triển nó
            từ nhiều góc độ khác nhau.
          </p>
        </div>
        <button
          onClick={onNewSession}
          className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Bắt đầu Brainstorm đầu tiên
        </button>
      </div>
    </div>
  )
}
