'use client'

import { COMBAT_AGENTS } from '@/lib/types/combat'
import type { AgentId } from '@/lib/types/brainstorm'
import { cn } from '@/lib/utils'

interface AgentSelectorProps {
  selectedAgent: AgentId | null
  onSelect: (agent: AgentId) => void
  disabled?: boolean
}

const agents: AgentId[] = ['spark', 'lens', 'radar', 'devil']

export function AgentSelector({ selectedAgent, onSelect, disabled }: AgentSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {agents.map((agentId) => {
        const agent = COMBAT_AGENTS[agentId]
        const isSelected = selectedAgent === agentId

        return (
          <button
            key={agentId}
            onClick={() => onSelect(agentId)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all whitespace-nowrap',
              isSelected
                ? `bg-gradient-to-r ${agent.color} border-transparent text-white shadow-lg`
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="text-lg">{agent.emoji}</span>
            <div className="text-left">
              <div className="font-medium text-sm">{agent.name}</div>
              <div className={cn('text-xs', isSelected ? 'text-white/70' : 'text-slate-500')}>
                {agent.description.split(' - ')[0]}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
