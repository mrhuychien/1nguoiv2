'use client'

import { cn } from '@/lib/utils'
import { AGENTS, type AgentId } from '@/lib/types/brainstorm'

interface AgentAvatarProps {
  agent: AgentId
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showRole?: boolean
  className?: string
}

export function AgentAvatar({
  agent,
  size = 'md',
  showName = false,
  showRole = false,
  className,
}: AgentAvatarProps) {
  const config = AGENTS[agent]

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center border-2',
          config.bgColor,
          sizeClasses[size]
        )}
        style={{ borderColor: config.color }}
      >
        {config.icon}
      </div>
      {(showName || showRole) && (
        <div>
          {showName && (
            <span className={cn('font-bold', config.textColor)}>
              {config.name}
            </span>
          )}
          {showRole && (
            <p className="text-sm text-gray-400">{config.role}</p>
          )}
        </div>
      )}
    </div>
  )
}
