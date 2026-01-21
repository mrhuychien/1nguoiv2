'use client'

import { useEffect, useRef } from 'react'
import { useBrainstormStore } from '@/store/brainstorm-store'
import { ProgressIndicator } from './progress-indicator'
import { RoundCard } from './round-card'
import { Square } from 'lucide-react'
import type { BrainstormSession, BrainstormRound } from '@/lib/types/brainstorm'

interface LiveSessionProps {
  session: BrainstormSession
  rounds: BrainstormRound[]
}

export function LiveSession({ session, rounds }: LiveSessionProps) {
  const { cancelSession, loadSession } = useBrainstormStore()
  const eventSourceRef = useRef<EventSource | null>(null)

  // Setup SSE connection for real-time updates
  useEffect(() => {
    if (session.status !== 'running' && session.status !== 'pending') return

    const eventSource = new EventSource(`/api/brainstorm/${session.id}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'session_update':
        case 'round_created':
        case 'round_updated':
        case 'insight_created':
          loadSession(session.id)
          break
      }
    }

    eventSource.onerror = () => {
      console.error('SSE error')
      eventSource.close()
      loadSession(session.id)
    }

    return () => {
      eventSource.close()
    }
  }, [session.id, session.status, loadSession])

  const handleCancel = async () => {
    await cancelSession(session.id)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">{session.title}</h2>
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Square className="w-4 h-4" />
            Huy
          </button>
        </div>

        {/* Progress */}
        <ProgressIndicator
          currentRound={session.current_round}
          totalRounds={session.total_rounds}
          status={session.status}
        />
      </div>

      {/* Original idea */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-2">Y tuong goc</h3>
        <p className="text-gray-300">{session.original_idea}</p>
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        {rounds.map((round, index) => (
          <RoundCard
            key={round.id}
            round={round}
            isExpanded={
              round.status === 'running' ||
              index === rounds.length - 1
            }
          />
        ))}
      </div>
    </div>
  )
}
