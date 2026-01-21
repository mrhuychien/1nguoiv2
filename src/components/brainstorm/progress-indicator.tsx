'use client'

import { cn } from '@/lib/utils'
import { AGENTS, DEEP_MODE_ROUNDS, type AgentId } from '@/lib/types/brainstorm'
import { Check, Loader2 } from 'lucide-react'

interface ProgressIndicatorProps {
  currentRound: number
  totalRounds: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  className?: string
}

export function ProgressIndicator({
  currentRound,
  totalRounds,
  status,
  className,
}: ProgressIndicatorProps) {
  const progressPercent = totalRounds > 0
    ? Math.round((currentRound / totalRounds) * 100)
    : 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">
            Round {currentRound}/{totalRounds}
          </span>
          <span className="text-gray-400">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Round indicators */}
      <div className="flex items-center justify-between">
        {DEEP_MODE_ROUNDS.slice(0, totalRounds).map((round) => {
          const agent = AGENTS[round.agent as AgentId]
          const isCompleted = round.round_number < currentRound
          const isCurrent = round.round_number === currentRound && status === 'running'
          const isPending = round.round_number > currentRound

          return (
            <div
              key={round.round_number}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                  isCompleted && 'bg-green-500/20 text-green-400',
                  isCurrent && `${agent.bgColor} ${agent.textColor} animate-pulse`,
                  isPending && 'bg-white/5 text-gray-500'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  agent.icon
                )}
              </div>
              <span className="text-xs text-gray-400">
                {round.description.slice(0, 8)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
