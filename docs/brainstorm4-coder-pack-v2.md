# ═══════════════════════════════════════════════════════════════════════════════
#                              🧠 CODER PACK v2
#                         BRAINSTORM4 MODULE
#                    UI Components & Integration
#                           1nguoi.com - Phase 2
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 MỤC LỤC:
#
#  STEP 6: UI Components (Part 2)
#  STEP 7: Integration với Project Hub
#  STEP 8: Dashboard Sidebar Update
#  STEP 9: Environment Setup & Dependencies
#
#  📦 FILE TRƯỚC: brainstorm4-coder-pack-v1.md
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 6: UI COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 6.1 File: components/brainstorm/agent-avatar.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import { AGENTS, type AgentType } from '@/lib/types/brainstorm'

interface AgentAvatarProps {
  agent: AgentType
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
          'rounded-full flex items-center justify-center',
          config.bgColor,
          sizeClasses[size]
        )}
        style={{ borderColor: config.color, borderWidth: 2 }}
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
            <p className="text-sm text-foreground-muted">{config.role}</p>
          )}
        </div>
      )}
    </div>
  )
}
```

## 6.2 File: components/brainstorm/progress-indicator.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import { AGENTS, DEEP_MODE_ROUNDS, type AgentType } from '@/lib/types/brainstorm'
import { Check, Loader2, Circle } from 'lucide-react'

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
          <span className="text-foreground-secondary">
            Round {currentRound}/{totalRounds}
          </span>
          <span className="text-foreground-muted">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan to-purple transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Round indicators */}
      <div className="flex items-center justify-between">
        {DEEP_MODE_ROUNDS.slice(0, totalRounds).map((round) => {
          const agent = AGENTS[round.agent]
          const isCompleted = round.number < currentRound
          const isCurrent = round.number === currentRound && status === 'running'
          const isPending = round.number > currentRound

          return (
            <div
              key={round.number}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
                  isCompleted && 'bg-success/20 text-success',
                  isCurrent && `${agent.bgColor} ${agent.textColor} animate-pulse`,
                  isPending && 'bg-white/5 text-foreground-muted'
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
              <span className="text-xs text-foreground-muted">
                {round.title.slice(0, 3)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

## 6.3 File: components/brainstorm/session-card.tsx

```typescript
'use client'

import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Card, Badge } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { AGENTS, type BrainstormSession, type AgentType } from '@/lib/types/brainstorm'
import { Clock, Zap, Star, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: BrainstormSession & {
    project?: { id: string; title: string; color: string } | null
  }
}

export function SessionCard({ session }: SessionCardProps) {
  const router = useRouter()

  const statusConfig = {
    pending: { label: 'Chờ xử lý', color: 'warning', icon: Clock },
    running: { label: 'Đang chạy', color: 'cyan', icon: Loader2 },
    completed: { label: 'Hoàn thành', color: 'success', icon: Star },
    failed: { label: 'Lỗi', color: 'danger', icon: null },
    cancelled: { label: 'Đã hủy', color: 'secondary', icon: null },
  }

  const config = statusConfig[session.status]
  const Icon = config.icon

  // Count insights by agent (mock - would come from API)
  const agentCounts: Partial<Record<AgentType, number>> = {
    spark: 3,
    radar: 2,
    lens: 1,
    devil: 3,
  }

  return (
    <Card
      className="cursor-pointer hover:border-cyan/50 transition-all group"
      onClick={() => router.push(`/brainstorm/${session.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-cyan transition-colors">
            {session.title}
          </h3>
          {session.project && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: session.project.color }}
              />
              <span className="text-sm text-foreground-muted">
                {session.project.title}
              </span>
            </div>
          )}
        </div>
        <Badge
          variant={config.color as any}
          className="flex items-center gap-1"
        >
          {Icon && (
            <Icon
              className={cn(
                'w-3 h-3',
                session.status === 'running' && 'animate-spin'
              )}
            />
          )}
          {config.label}
        </Badge>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-foreground-muted mb-4">
        <span>
          {formatDistanceToNow(new Date(session.created_at), {
            addSuffix: true,
            locale: vi,
          })}
        </span>
        {session.duration_seconds && (
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
      {session.status === 'completed' && session.final_score && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Điểm khả thi</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(session.final_score! / 2)
                      ? 'text-warning fill-warning'
                      : 'text-foreground-muted'
                  )}
                />
              ))}
              <span className="ml-2 font-semibold text-foreground">
                {session.final_score}/10
              </span>
            </div>
          </div>
          {session.final_verdict && (
            <p className="text-sm text-foreground-secondary mt-2 line-clamp-2">
              {session.final_verdict}
            </p>
          )}
        </div>
      )}

      {/* Progress (if running) */}
      {session.status === 'running' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground-muted">
              Round {session.current_round}/{session.total_rounds}
            </span>
            <span className="text-cyan">
              {Math.round((session.current_round / session.total_rounds) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan transition-all"
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
          {(Object.keys(agentCounts) as AgentType[]).map((agent) => (
            <div
              key={agent}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                AGENTS[agent].bgColor,
                AGENTS[agent].textColor
              )}
            >
              <span>{AGENTS[agent].icon}</span>
              <span>×{agentCounts[agent]}</span>
            </div>
          ))}
        </div>
        <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-cyan transition-colors" />
      </div>
    </Card>
  )
}
```

## 6.4 File: components/brainstorm/session-list.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { useUser } from '@/lib/hooks/use-user'
import { SessionCard } from './session-card'
import { Button, Card } from '@/components/ui'
import { Brain, Plus, Filter, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SessionListProps {
  onNewSession: () => void
}

type FilterStatus = 'all' | 'running' | 'completed'

export function SessionList({ onNewSession }: SessionListProps) {
  const { user } = useUser()
  const { sessions, isLoading, loadSessions } = useBrainstormStore()
  const [filter, setFilter] = useState<FilterStatus>('all')

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['all', 'running', 'completed'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                filter === f
                  ? 'bg-cyan/20 text-cyan'
                  : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
              )}
            >
              {f === 'all' && 'Tất cả'}
              {f === 'running' && '🔄 Đang chạy'}
              {f === 'completed' && '✅ Hoàn thành'}
            </button>
          ))}
        </div>
        <Button onClick={onNewSession}>
          <Plus className="w-4 h-4 mr-2" />
          Brainstorm mới
        </Button>
      </div>

      {/* Sessions grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session as any} />
          ))}
        </div>
      ) : (
        <EmptyState onNewSession={onNewSession} />
      )}
    </div>
  )
}

function EmptyState({ onNewSession }: { onNewSession: () => void }) {
  return (
    <Card className="py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-cyan/10 flex items-center justify-center">
          <Brain className="w-10 h-10 text-cyan" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Chưa có phiên Brainstorm nào
          </h3>
          <p className="text-foreground-muted max-w-md mx-auto">
            Bắt đầu với một ý tưởng, 4 AI sẽ giúp bạn phân tích và phát triển nó
            từ nhiều góc độ khác nhau.
          </p>
        </div>
        <Button onClick={onNewSession} size="lg" className="mt-4">
          <Plus className="w-5 h-5 mr-2" />
          Bắt đầu Brainstorm đầu tiên
        </Button>
      </div>
    </Card>
  )
}
```

## 6.5 File: components/brainstorm/new-session-modal.tsx

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Button, Input, Card } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUser } from '@/lib/hooks/use-user'
import { AGENTS, type AgentType, type SessionMode } from '@/lib/types/brainstorm'
import { Zap, Brain, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  original_idea: z.string().min(10, 'Mô tả ý tưởng ít nhất 10 ký tự'),
})

type FormData = z.infer<typeof schema>

interface NewSessionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedProjectId?: string
}

export function NewSessionModal({
  open,
  onOpenChange,
  preselectedProjectId,
}: NewSessionModalProps) {
  const router = useRouter()
  const { user } = useUser()
  const { createSession, isLoading: creating } = useBrainstormStore()
  const { projects, loadProjects } = useProjectStore()
  
  const [mode, setMode] = useState<SessionMode>('deep')
  const [quickAgent, setQuickAgent] = useState<AgentType>('spark')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    preselectedProjectId || null
  )

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Load projects with "idea" status
  useEffect(() => {
    if (user?.id && open) {
      loadProjects(user.id)
    }
  }, [user?.id, open, loadProjects])

  // Filter to only "idea" status projects
  const ideaProjects = projects.filter((p) => p.status === 'idea')

  // Pre-fill from selected project
  useEffect(() => {
    if (selectedProjectId) {
      const project = ideaProjects.find((p) => p.id === selectedProjectId)
      if (project) {
        setValue('title', project.title)
        setValue('original_idea', project.description || '')
      }
    }
  }, [selectedProjectId, ideaProjects, setValue])

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return

    const session = await createSession({
      userId: user.id,
      title: data.title,
      original_idea: data.original_idea,
      mode,
      quick_mode_agent: mode === 'quick' ? quickAgent : undefined,
      project_id: selectedProjectId || undefined,
    })

    if (session) {
      reset()
      onOpenChange(false)
      router.push(`/brainstorm/${session.id}`)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="🧠 Brainstorm Mới"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <Input
          label="Tiêu đề *"
          placeholder="VD: App học tiếng Anh qua phim"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Idea description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mô tả ý tưởng *
          </label>
          <textarea
            {...register('original_idea')}
            rows={4}
            placeholder="Mô tả chi tiết ý tưởng của bạn. Càng chi tiết, AI càng phân tích tốt hơn..."
            className={cn(
              'w-full bg-white/5 border rounded-xl px-4 py-3 text-foreground',
              'focus:outline-none focus:border-cyan resize-none',
              errors.original_idea ? 'border-danger' : 'border-white/10'
            )}
          />
          {errors.original_idea && (
            <p className="mt-1 text-sm text-danger">{errors.original_idea.message}</p>
          )}
        </div>

        {/* Select from existing projects */}
        {ideaProjects.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hoặc chọn từ Project có sẵn
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {ideaProjects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(
                    selectedProjectId === project.id ? null : project.id
                  )}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                    selectedProjectId === project.id
                      ? 'border-cyan bg-cyan/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 text-foreground">{project.title}</span>
                  {selectedProjectId === project.id && (
                    <Check className="w-4 h-4 text-cyan" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
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
                  ? 'border-cyan bg-cyan/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-warning" />
                <span className="font-semibold text-foreground">Quick Mode</span>
              </div>
              <p className="text-sm text-foreground-muted">
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
                  ? 'border-cyan bg-cyan/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple" />
                <span className="font-semibold text-foreground">Deep Mode</span>
              </div>
              <p className="text-sm text-foreground-muted">
                4 AI • 5 rounds • Phân tích toàn diện
              </p>
            </button>
          </div>
        </div>

        {/* Quick mode agent selection */}
        {mode === 'quick' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Chọn AI
            </label>
            <div className="grid grid-cols-4 gap-3">
              {(Object.keys(AGENTS) as AgentType[]).map((agent) => (
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
                  <p className="text-xs text-foreground-muted mt-1">
                    {AGENTS[agent].role.replace('The ', '')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type="submit" className="flex-1" isLoading={creating}>
            🚀 Bắt đầu Brainstorm
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

## 6.6 File: components/brainstorm/round-card.tsx

```typescript
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui'
import { AgentAvatar } from './agent-avatar'
import { AGENTS, type BrainstormRound } from '@/lib/types/brainstorm'
import { ChevronDown, ChevronUp, Clock, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface RoundCardProps {
  round: BrainstormRound
  isExpanded?: boolean
}

export function RoundCard({ round, isExpanded: defaultExpanded = false }: RoundCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const agent = AGENTS[round.agent]

  const statusIcon = {
    pending: <Clock className="w-4 h-4 text-foreground-muted" />,
    running: <Loader2 className="w-4 h-4 text-cyan animate-spin" />,
    completed: <Check className="w-4 h-4 text-success" />,
    failed: <X className="w-4 h-4 text-danger" />,
    skipped: <Clock className="w-4 h-4 text-foreground-muted" />,
  }

  const roleLabels = {
    ideation: '💡 Phát triển ý tưởng',
    research: '📊 Nghiên cứu thị trường',
    analysis: '🔍 Phân tích SWOT',
    challenge: '😈 Phản biện',
    synthesis: '🎯 Tổng hợp',
  }

  return (
    <Card
      className={cn(
        'transition-all',
        round.status === 'running' && 'border-cyan/50',
        round.status === 'completed' && 'border-success/30'
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <AgentAvatar agent={round.agent} size="sm" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={cn('font-semibold', agent.textColor)}>
                {agent.name}
              </span>
              {statusIcon[round.status]}
            </div>
            <p className="text-sm text-foreground-muted">
              {roleLabels[round.role]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {round.duration_ms && (
            <span className="text-sm text-foreground-muted">
              {(round.duration_ms / 1000).toFixed(1)}s
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-foreground-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-foreground-muted" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && round.output_content && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{round.output_content}</ReactMarkdown>
          </div>
          
          {/* Stats */}
          <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
            <span>Tokens: {round.tokens_input + round.tokens_output}</span>
            <span>Cost: ${round.cost.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Running state */}
      {round.status === 'running' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-cyan">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{agent.name} đang suy nghĩ...</span>
          </div>
        </div>
      )}

      {/* Error state */}
      {round.status === 'failed' && round.error_message && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
            <p className="text-sm text-danger">{round.error_message}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
```

## 6.7 File: components/brainstorm/live-session.tsx

```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { ProgressIndicator } from './progress-indicator'
import { RoundCard } from './round-card'
import { Button, Card } from '@/components/ui'
import { X } from 'lucide-react'
import type { SessionWithRelations } from '@/lib/types/brainstorm'

interface LiveSessionProps {
  session: SessionWithRelations
}

export function LiveSession({ session }: LiveSessionProps) {
  const router = useRouter()
  const { cancelBrainstorm, setIsRunning, loadSession } = useBrainstormStore()
  const eventSourceRef = useRef<EventSource | null>(null)

  // Setup SSE connection
  useEffect(() => {
    if (session.status !== 'running' && session.status !== 'pending') return

    setIsRunning(true)

    const eventSource = new EventSource(`/api/brainstorm/${session.id}/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'connected':
          console.log('SSE connected')
          break
        case 'session_update':
          // Reload session data
          loadSession(session.id)
          break
        case 'round_created':
        case 'round_updated':
          loadSession(session.id)
          break
        case 'insight_created':
          loadSession(session.id)
          break
      }
    }

    eventSource.onerror = () => {
      console.error('SSE error')
      eventSource.close()
      setIsRunning(false)
      loadSession(session.id)
    }

    return () => {
      eventSource.close()
      setIsRunning(false)
    }
  }, [session.id, session.status, loadSession, setIsRunning])

  const handleCancel = async () => {
    await cancelBrainstorm(session.id)
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="!p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">{session.title}</h2>
          <Button variant="secondary" size="sm" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Hủy
          </Button>
        </div>

        {/* Progress */}
        <ProgressIndicator
          currentRound={session.current_round}
          totalRounds={session.total_rounds}
          status={session.status}
        />
      </Card>

      {/* Original idea */}
      <Card>
        <h3 className="font-semibold text-foreground mb-2">💡 Ý tưởng gốc</h3>
        <p className="text-foreground-secondary">{session.original_idea}</p>
      </Card>

      {/* Rounds */}
      <div className="space-y-4">
        {session.rounds.map((round, index) => (
          <RoundCard
            key={round.id}
            round={round}
            isExpanded={
              round.status === 'running' || 
              index === session.rounds.length - 1
            }
          />
        ))}
      </div>
    </div>
  )
}
```

## 6.8 File: components/brainstorm/verdict-card.tsx

```typescript
'use client'

import { Card, Badge, Button } from '@/components/ui'
import { useRouter } from 'next/navigation'
import { Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SessionWithRelations, FinalData } from '@/lib/types/brainstorm'

interface VerdictCardProps {
  session: SessionWithRelations
}

export function VerdictCard({ session }: VerdictCardProps) {
  const router = useRouter()
  const { final_score, final_verdict, final_data } = session
  const data = final_data as FinalData

  if (!final_score) return null

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-success'
    if (score >= 5) return 'text-warning'
    return 'text-danger'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return { text: 'Rất khả thi', icon: CheckCircle, color: 'success' }
    if (score >= 6) return { text: 'Khả thi', icon: TrendingUp, color: 'success' }
    if (score >= 4) return { text: 'Cần cân nhắc', icon: AlertTriangle, color: 'warning' }
    return { text: 'Rủi ro cao', icon: TrendingDown, color: 'danger' }
  }

  const scoreLabel = getScoreLabel(final_score)
  const ScoreIcon = scoreLabel.icon

  return (
    <Card className="border-cyan/30 bg-gradient-to-br from-cyan/5 to-purple/5">
      {/* Score header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">🎯 VERDICT</h3>
          <div className="flex items-center gap-2">
            <ScoreIcon className={cn('w-5 h-5', `text-${scoreLabel.color}`)} />
            <Badge variant={scoreLabel.color as any}>{scoreLabel.text}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-6 h-6',
                  i < Math.round(final_score / 2)
                    ? 'text-warning fill-warning'
                    : 'text-foreground-muted'
                )}
              />
            ))}
          </div>
          <span className={cn('text-3xl font-bold', getScoreColor(final_score))}>
            {final_score}/10
          </span>
        </div>
      </div>

      {/* Summary */}
      {final_verdict && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl">
          <p className="text-foreground-secondary">{final_verdict}</p>
        </div>
      )}

      {/* SWOT Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-success/10 rounded-lg">
          <h4 className="text-sm font-semibold text-success mb-2">
            💪 Điểm mạnh ({data.strengths?.length || 0})
          </h4>
          <ul className="text-sm text-foreground-secondary space-y-1">
            {data.strengths?.slice(0, 3).map((s, i) => (
              <li key={i} className="truncate">• {s}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-warning/10 rounded-lg">
          <h4 className="text-sm font-semibold text-warning mb-2">
            ⚠️ Rủi ro ({data.risks?.length || 0})
          </h4>
          <ul className="text-sm text-foreground-secondary space-y-1">
            {data.risks?.slice(0, 3).map((r, i) => (
              <li key={i} className="truncate">• {r}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-purple/10 rounded-lg">
          <h4 className="text-sm font-semibold text-purple mb-2">
            🚀 Cơ hội ({data.opportunities?.length || 0})
          </h4>
          <ul className="text-sm text-foreground-secondary space-y-1">
            {data.opportunities?.slice(0, 3).map((o, i) => (
              <li key={i} className="truncate">• {o}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-danger/10 rounded-lg">
          <h4 className="text-sm font-semibold text-danger mb-2">
            🚧 Blockers ({data.blockers?.length || 0})
          </h4>
          <ul className="text-sm text-foreground-secondary space-y-1">
            {data.blockers?.slice(0, 3).map((b, i) => (
              <li key={i} className="truncate">• {b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        {session.project_id && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => {
              // Promote project to active
              // TODO: Implement promotion logic
              router.push(`/projects/${session.project_id}`)
            }}
          >
            🚀 Promote to Active
          </Button>
        )}
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => {
            // Start another brainstorm on same idea
            // TODO: Implement re-brainstorm
          }}
        >
          🧠 Brainstorm tiếp
        </Button>
      </div>
    </Card>
  )
}
```

## 6.9 File: components/brainstorm/session-result.tsx

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Badge, Button } from '@/components/ui'
import { VerdictCard } from './verdict-card'
import { RoundCard } from './round-card'
import { AgentAvatar } from './agent-avatar'
import { AGENTS, type SessionWithRelations, type AgentType, type InsightType } from '@/lib/types/brainstorm'
import { ArrowLeft, Download, Share2, Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface SessionResultProps {
  session: SessionWithRelations
}

type TabType = 'overview' | 'ideas' | 'research' | 'analysis' | 'challenges'

export function SessionResult({ session }: SessionResultProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: '🎯' },
    { id: 'ideas', label: 'Ý tưởng', icon: '💡' },
    { id: 'research', label: 'Nghiên cứu', icon: '📊' },
    { id: 'analysis', label: 'Phân tích', icon: '🔍' },
    { id: 'challenges', label: 'Challenges', icon: '😈' },
  ]

  const getInsightsByType = (types: InsightType[]) => {
    return session.insights.filter((i) => types.includes(i.type))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/brainstorm')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{session.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-foreground-muted">
              <span>
                {formatDistanceToNow(new Date(session.created_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
              {session.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                </span>
              )}
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {session.mode === 'deep' ? 'Deep Mode' : 'Quick Mode'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Original idea */}
      <Card>
        <h3 className="font-semibold text-foreground mb-2">💡 Ý tưởng gốc</h3>
        <p className="text-foreground-secondary">{session.original_idea}</p>
      </Card>

      {/* Verdict */}
      <VerdictCard session={session} />

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-all',
                activeTab === tab.id
                  ? 'border-cyan text-cyan'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {session.rounds.map((round) => (
              <RoundCard key={round.id} round={round} />
            ))}
          </div>
        )}

        {activeTab === 'ideas' && (
          <div className="grid gap-4">
            {getInsightsByType(['idea']).map((insight) => (
              <Card key={insight.id}>
                <div className="flex items-start gap-3">
                  <AgentAvatar agent={insight.agent} size="sm" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    {insight.content && (
                      <p className="text-sm text-foreground-secondary mt-1">
                        {insight.content}
                      </p>
                    )}
                    {insight.score && (
                      <Badge variant="cyan" size="sm" className="mt-2">
                        Score: {insight.score}/10
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="grid gap-4">
            {getInsightsByType(['market_data', 'competitor']).map((insight) => (
              <Card key={insight.id}>
                <div className="flex items-start gap-3">
                  <AgentAvatar agent={insight.agent} size="sm" />
                  <div className="flex-1">
                    <Badge
                      variant={insight.type === 'market_data' ? 'purple' : 'secondary'}
                      size="sm"
                      className="mb-2"
                    >
                      {insight.type === 'market_data' ? '📊 Market Data' : '🏢 Competitor'}
                    </Badge>
                    <h4 className="font-semibold text-foreground">{insight.title}</h4>
                    {insight.content && (
                      <p className="text-sm text-foreground-secondary mt-1">
                        {insight.content}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Strengths */}
            <Card className="border-success/30">
              <h4 className="font-semibold text-success mb-3">💪 Điểm mạnh</h4>
              <ul className="space-y-2">
                {getInsightsByType(['strength']).map((insight) => (
                  <li key={insight.id} className="flex items-start gap-2 text-sm text-foreground-secondary">
                    <span className="text-success">•</span>
                    {insight.title}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card className="border-warning/30">
              <h4 className="font-semibold text-warning mb-3">⚠️ Điểm yếu</h4>
              <ul className="space-y-2">
                {getInsightsByType(['weakness']).map((insight) => (
                  <li key={insight.id} className="flex items-start gap-2 text-sm text-foreground-secondary">
                    <span className="text-warning">•</span>
                    {insight.title}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {getInsightsByType(['question', 'risk', 'blocker']).map((insight) => (
              <Card
                key={insight.id}
                className={cn(
                  insight.priority === 'high' && 'border-danger/30',
                  insight.priority === 'medium' && 'border-warning/30'
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {insight.type === 'question' ? '❓' : insight.type === 'risk' ? '⚠️' : '🚧'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      {insight.priority && (
                        <Badge
                          variant={
                            insight.priority === 'high'
                              ? 'danger'
                              : insight.priority === 'medium'
                              ? 'warning'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {insight.priority}
                        </Badge>
                      )}
                    </div>
                    {insight.content && (
                      <p className="text-sm text-foreground-muted">
                        Category: {insight.content}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

## 6.10 File: components/brainstorm/index.ts

```typescript
export { AgentAvatar } from './agent-avatar'
export { ProgressIndicator } from './progress-indicator'
export { SessionCard } from './session-card'
export { SessionList } from './session-list'
export { NewSessionModal } from './new-session-modal'
export { RoundCard } from './round-card'
export { LiveSession } from './live-session'
export { VerdictCard } from './verdict-card'
export { SessionResult } from './session-result'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 7: PAGE COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 7.1 File: app/(dashboard)/brainstorm/page.tsx

```typescript
'use client'

import { useState } from 'react'
import { SessionList, NewSessionModal } from '@/components/brainstorm'
import { Brain } from 'lucide-react'

export default function BrainstormPage() {
  const [showNewModal, setShowNewModal] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-cyan" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brainstorm4</h1>
          <p className="text-foreground-muted">
            4 AI cùng phân tích và phát triển ý tưởng của bạn
          </p>
        </div>
      </div>

      {/* Session list */}
      <SessionList onNewSession={() => setShowNewModal(true)} />

      {/* New session modal */}
      <NewSessionModal
        open={showNewModal}
        onOpenChange={setShowNewModal}
      />
    </div>
  )
}
```

## 7.2 File: app/(dashboard)/brainstorm/[id]/page.tsx

```typescript
'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useBrainstormStore } from '@/lib/stores/brainstorm-store'
import { LiveSession, SessionResult } from '@/components/brainstorm'
import { Loader2 } from 'lucide-react'

export default function BrainstormSessionPage() {
  const params = useParams()
  const sessionId = params.id as string

  const { currentSession, isLoading, loadSession, reset } = useBrainstormStore()

  useEffect(() => {
    loadSession(sessionId)
    return () => reset()
  }, [sessionId, loadSession, reset])

  if (isLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    )
  }

  const isLive = currentSession.status === 'running' || currentSession.status === 'pending'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isLive ? (
        <LiveSession session={currentSession} />
      ) : (
        <SessionResult session={currentSession} />
      )}
    </div>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 8: INTEGRATION VỚI PROJECT HUB
# ═══════════════════════════════════════════════════════════════════════════════

## 8.1 File: components/project-hub/project-card-menu.tsx (Cập nhật)

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui'
import { useProjectStore } from '@/lib/stores/project-store'
import {
  MoreHorizontal,
  Edit,
  Brain,
  TrendingUp,
  Archive,
  Trash2,
} from 'lucide-react'
import type { Project } from '@/lib/types/database'

interface ProjectCardMenuProps {
  project: Project
}

export function ProjectCardMenu({ project }: ProjectCardMenuProps) {
  const router = useRouter()
  const { updateProject, deleteProject } = useProjectStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const canBrainstorm = project.status === 'idea'
  const canPromote = project.status === 'idea' || project.status === 'backlog'
  const canArchive = project.status !== 'archived'

  const handleBrainstorm = () => {
    router.push(`/brainstorm?project=${project.id}`)
  }

  const handlePromote = async () => {
    await updateProject(project.id, { status: 'active' })
  }

  const handleArchive = async () => {
    await updateProject(project.id, { status: 'archived' })
  }

  const handleDelete = async () => {
    if (confirm('Bạn có chắc muốn xóa project này?')) {
      setIsDeleting(true)
      await deleteProject(project.id)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
          <Edit className="w-4 h-4 mr-2" />
          Chỉnh sửa
        </DropdownMenuItem>

        {/* BRAINSTORM4 - Only for "idea" status */}
        {canBrainstorm && (
          <DropdownMenuItem onClick={handleBrainstorm} className="text-cyan">
            <Brain className="w-4 h-4 mr-2" />
            🧠 Brainstorm4
          </DropdownMenuItem>
        )}

        {canPromote && (
          <DropdownMenuItem onClick={handlePromote}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Promote to Active
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {canArchive && (
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Lưu trữ
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-danger focus:text-danger"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? 'Đang xóa...' : 'Xóa'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## 8.2 File: components/layout/dashboard-sidebar.tsx (Cập nhật)

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Lightbulb,
  Brain,        // NEW
  FolderKanban,
  Clock,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Lightbulb,
    label: 'Idea Graph',
    href: '/ideas',
  },
  {
    icon: Brain,          // NEW
    label: 'Brainstorm4',  // NEW
    href: '/brainstorm',   // NEW
    badge: 'New',          // NEW - Optional badge
  },
  {
    icon: FolderKanban,
    label: 'Projects',
    href: '/projects',
  },
  {
    icon: Clock,
    label: 'Time Tracking',
    href: '/time',
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-background-card border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="font-bold text-foreground">1nguoi</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-cyan/10 text-cyan'
                      : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple/20 text-purple rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground-muted hover:text-foreground hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Cài đặt</span>
        </Link>
      </div>
    </aside>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 9: ENVIRONMENT SETUP
# ═══════════════════════════════════════════════════════════════════════════════

## 9.1 File: .env.local.example (Cập nhật)

```env
# ═══════════════════════════════════════════════════════════════════════════════
# 1NGUOI.COM ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════════════════════

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ═══════════════════════════════════════════════════════════════════════════════
# BRAINSTORM4 - AI API KEYS
# ═══════════════════════════════════════════════════════════════════════════════

# SPARK Agent - OpenAI (ChatGPT)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# LENS Agent - Anthropic (Claude)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# RADAR Agent - Google AI (Gemini)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=AIza...

# DEVIL Agent - xAI (Grok)
# Get from: https://console.x.ai/
XAI_API_KEY=xai-...

# ═══════════════════════════════════════════════════════════════════════════════
# BRAINSTORM4 - FEATURE FLAGS
# ═══════════════════════════════════════════════════════════════════════════════

# Enable/disable brainstorm feature
BRAINSTORM_ENABLED=true

# Max sessions per user per day (rate limiting)
BRAINSTORM_MAX_SESSIONS_PER_DAY=10

# Enable deep mode (4 AI)
BRAINSTORM_DEEP_MODE_ENABLED=true

# ═══════════════════════════════════════════════════════════════════════════════
```

## 9.2 File: package.json (Dependencies to add)

```json
{
  "dependencies": {
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.0",
    "@google/generative-ai": "^0.2.1",
    "react-markdown": "^9.0.1"
  }
}
```

**Run:**
```bash
npm install openai @anthropic-ai/sdk @google/generative-ai react-markdown
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 10: TESTING CHECKLIST
# ═══════════════════════════════════════════════════════════════════════════════

## 10.1 Manual Testing Checklist

```markdown
## Brainstorm4 Testing Checklist

### Database
- [ ] Migration runs without errors
- [ ] RLS policies work correctly
- [ ] Can create/read/update/delete sessions

### UI - Session List
- [ ] Empty state shows correctly
- [ ] Sessions load and display
- [ ] Filter buttons work (All/Running/Completed)
- [ ] Session cards show correct status
- [ ] Click navigates to session detail

### UI - New Session Modal
- [ ] Modal opens/closes correctly
- [ ] Form validation works
- [ ] Can select from existing "idea" projects
- [ ] Quick/Deep mode toggle works
- [ ] Agent selection in quick mode works
- [ ] Submit creates session and navigates

### UI - Live Session
- [ ] Progress indicator updates
- [ ] SSE connection establishes
- [ ] Rounds display as they complete
- [ ] Cancel button works
- [ ] Handles errors gracefully

### UI - Session Result
- [ ] Verdict card shows score correctly
- [ ] Tabs switch content
- [ ] Insights grouped correctly
- [ ] Export/Share buttons present

### Integration - Project Hub
- [ ] "Brainstorm4" menu item shows for "idea" status only
- [ ] Click navigates to brainstorm with project preselected
- [ ] "Promote to Active" works

### AI Agents
- [ ] SPARK (ChatGPT) responds correctly
- [ ] LENS (Claude) responds correctly
- [ ] RADAR (Gemini) responds correctly
- [ ] DEVIL (Grok) responds correctly
- [ ] Errors are handled and logged

### Performance
- [ ] Page loads under 2 seconds
- [ ] No memory leaks during long sessions
- [ ] SSE doesn't accumulate connections
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         END OF CODER PACK v2
# ═══════════════════════════════════════════════════════════════════════════════
#
#  ✅ COMPLETED:
#  - Database schema with migration
#  - TypeScript types
#  - Zustand store
#  - API routes
#  - AI Agent services (4 agents)
#  - All UI components
#  - Page components
#  - Project Hub integration
#  - Sidebar update
#  - Environment setup
#  - Testing checklist
#
#  🚀 READY FOR IMPLEMENTATION
#
# ═══════════════════════════════════════════════════════════════════════════════
