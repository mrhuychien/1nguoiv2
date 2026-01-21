'use client'

import { useState } from 'react'
import { AgentAvatar } from './agent-avatar'
import { AGENTS, type BrainstormRound, type AgentId } from '@/lib/types/brainstorm'
import { ChevronDown, ChevronUp, Clock, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoundCardProps {
  round: BrainstormRound
  isExpanded?: boolean
}

export function RoundCard({ round, isExpanded: defaultExpanded = false }: RoundCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const agent = AGENTS[round.agent as AgentId]

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    running: <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />,
    completed: <Check className="w-4 h-4 text-green-400" />,
    failed: <X className="w-4 h-4 text-red-400" />,
    skipped: <Clock className="w-4 h-4 text-gray-400" />,
  }

  const roleLabels: Record<string, string> = {
    ideation: 'Phat trien y tuong',
    research: 'Nghien cuu thi truong',
    analysis: 'Phan tich SWOT',
    challenge: 'Phan bien',
    synthesis: 'Tong hop',
  }

  return (
    <div
      className={cn(
        'bg-white/5 border border-white/10 rounded-xl p-4 transition-all',
        round.status === 'running' && 'border-cyan-500/50',
        round.status === 'completed' && 'border-green-500/30'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <AgentAvatar agent={round.agent as AgentId} size="sm" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold', agent.textColor)}>
                {agent.name}
              </span>
              {statusIcon[round.status]}
            </div>
            <p className="text-sm text-gray-400">
              {roleLabels[round.role] || round.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {round.duration_ms > 0 && (
            <span className="text-sm text-gray-400">
              {(round.duration_ms / 1000).toFixed(1)}s
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && round.output_content && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap">
            {round.output_content}
          </div>

          {/* Stats */}
          {(round.tokens_input + round.tokens_output > 0) && (
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <span>Tokens: {round.tokens_input + round.tokens_output}</span>
              {round.cost > 0 && <span>Cost: ${round.cost.toFixed(4)}</span>}
            </div>
          )}
        </div>
      )}

      {/* Running state */}
      {round.status === 'running' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{agent.name} dang suy nghi...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {round.status === 'failed' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">Da xay ra loi trong round nay</p>
          </div>
        </div>
      )}
    </div>
  )
}
