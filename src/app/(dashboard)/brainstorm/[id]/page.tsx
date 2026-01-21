'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useBrainstormStore } from '@/store/brainstorm-store'
import { AgentAvatar } from '@/components/brainstorm/agent-avatar'
import { AGENTS, DEEP_MODE_ROUNDS } from '@/lib/types/brainstorm'
import {
  ArrowLeft,
  Play,
  Square,
  Loader2,
  Check,
  Clock,
  Star,
  AlertTriangle,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BrainstormSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const {
    currentSession,
    currentRounds,
    currentInsights,
    isLoading,
    isRunning,
    streamContent,
    streamProgress,
    loadSession,
    startSession,
    cancelSession,
    ui,
    setActiveTab,
  } = useBrainstormStore()

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId, loadSession])

  if (isLoading || !currentSession) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  const canStart = currentSession.status === 'draft'
  const isComplete = currentSession.status === 'completed'

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/brainstorm')}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{currentSession.title}</h1>
          <p className="text-gray-400 mt-1 line-clamp-1">
            {currentSession.original_idea}
          </p>
        </div>
        {canStart && (
          <button
            onClick={() => startSession(sessionId)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang chạy...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Bắt đầu
              </>
            )}
          </button>
        )}
        {currentSession.status === 'running' && (
          <button
            onClick={() => cancelSession(sessionId)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Square className="w-5 h-5" />
            Dừng
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Rounds progress */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-4">Tiến trình</h3>
            <div className="space-y-3">
              {DEEP_MODE_ROUNDS.slice(0, currentSession.total_rounds).map((round) => {
                const roundData = currentRounds.find(
                  (r) => r.round_number === round.round_number
                )
                const isCompleted = roundData?.status === 'completed'
                const isCurrent =
                  round.round_number === currentSession.current_round &&
                  currentSession.status === 'running'
                const isPending = !roundData || roundData.status === 'pending'

                return (
                  <div
                    key={round.round_number}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-all',
                      isCompleted && 'bg-green-500/10',
                      isCurrent && 'bg-cyan-500/10 border border-cyan-500/30',
                      isPending && 'opacity-50'
                    )}
                  >
                    <AgentAvatar agent={round.agent} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium', AGENTS[round.agent].textColor)}>
                          {AGENTS[round.agent].name}
                        </span>
                        {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                        {isCurrent && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                      </div>
                      <p className="text-xs text-gray-400">{round.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stream content */}
            {isRunning && streamContent && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-300">{streamContent}</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${streamProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Results */}
        <div className="lg:col-span-2">
          {isComplete && currentSession.final_verdict ? (
            <div className="space-y-6">
              {/* Final Score */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Kết quả phân tích</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        currentSession.final_verdict.recommendation === 'proceed'
                          ? 'bg-green-500/20 text-green-400'
                          : currentSession.final_verdict.recommendation === 'pivot'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {currentSession.final_verdict.recommendation === 'proceed'
                        ? '✅ Tiến hành'
                        : currentSession.final_verdict.recommendation === 'pivot'
                        ? '🔄 Điều chỉnh'
                        : '❌ Dừng lại'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-6 h-6',
                          i < Math.round(currentSession.final_verdict!.score / 2)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {currentSession.final_verdict.score}/10
                  </span>
                </div>

                <p className="text-gray-300">{currentSession.final_verdict.summary}</p>
              </div>

              {/* Tabs */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex border-b border-white/10">
                  {[
                    { key: 'summary', label: 'Tổng hợp', icon: Target },
                    { key: 'ideas', label: 'Ý tưởng', icon: Lightbulb },
                    { key: 'analysis', label: 'Phân tích', icon: TrendingUp },
                    { key: 'challenges', label: 'Thách thức', icon: AlertTriangle },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof ui.activeTab)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                        ui.activeTab === tab.key
                          ? 'text-cyan-400 border-b-2 border-cyan-400'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {ui.activeTab === 'summary' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <h4 className="font-medium text-green-400 mb-2">Điểm mạnh</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {currentSession.final_verdict?.strengths.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-lg">
                        <h4 className="font-medium text-red-400 mb-2">Điểm yếu</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {currentSession.final_verdict?.weaknesses.map((w, i) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-yellow-500/10 rounded-lg">
                        <h4 className="font-medium text-yellow-400 mb-2">Rủi ro</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {currentSession.final_verdict?.risks.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-cyan-500/10 rounded-lg">
                        <h4 className="font-medium text-cyan-400 mb-2">Bước tiếp theo</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          {currentSession.final_verdict?.next_steps.map((n, i) => (
                            <li key={i}>{i + 1}. {n}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {ui.activeTab === 'ideas' && (
                    <div className="space-y-4">
                      {currentInsights
                        .filter((i) => i.type === 'idea')
                        .map((insight) => (
                          <div
                            key={insight.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10"
                          >
                            <h4 className="font-medium text-white mb-2">{insight.title}</h4>
                            {insight.content && (
                              <p className="text-sm text-gray-300">{insight.content}</p>
                            )}
                          </div>
                        ))}
                      {currentInsights.filter((i) => i.type === 'idea').length === 0 && (
                        <p className="text-gray-400 text-center py-4">Chưa có ý tưởng nào</p>
                      )}
                    </div>
                  )}

                  {ui.activeTab === 'analysis' && (
                    <div className="space-y-4">
                      {['strength', 'weakness', 'opportunity', 'threat'].map((type) => {
                        const insights = currentInsights.filter((i) => i.type === type)
                        if (insights.length === 0) return null
                        return (
                          <div key={type}>
                            <h4 className="font-medium text-white mb-2 capitalize">
                              {type === 'strength' && '💪 Điểm mạnh'}
                              {type === 'weakness' && '⚠️ Điểm yếu'}
                              {type === 'opportunity' && '🚀 Cơ hội'}
                              {type === 'threat' && '⚡ Thách thức'}
                            </h4>
                            <ul className="space-y-1 text-sm text-gray-300">
                              {insights.map((i) => (
                                <li key={i.id}>• {i.title}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {ui.activeTab === 'challenges' && (
                    <div className="space-y-4">
                      {currentInsights
                        .filter((i) => i.type === 'risk' || i.type === 'question')
                        .map((insight) => (
                          <div
                            key={insight.id}
                            className={cn(
                              'p-4 rounded-lg border',
                              insight.type === 'risk'
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-purple-500/10 border-purple-500/30'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {insight.type === 'risk' ? (
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                              ) : (
                                <span className="text-purple-400">❓</span>
                              )}
                              <h4 className="font-medium text-white">{insight.title}</h4>
                            </div>
                            {insight.content && (
                              <p className="text-sm text-gray-300">{insight.content}</p>
                            )}
                          </div>
                        ))}
                      {currentInsights.filter((i) => i.type === 'risk' || i.type === 'question').length === 0 && (
                        <p className="text-gray-400 text-center py-4">Chưa có thách thức nào</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              {currentSession.status === 'draft' ? (
                <>
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sẵn sàng bắt đầu
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Nhấn &ldquo;Bắt đầu&rdquo; để 4 AI bắt đầu phân tích ý tưởng của bạn
                  </p>
                </>
              ) : currentSession.status === 'running' ? (
                <>
                  <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Đang phân tích...
                  </h3>
                  <p className="text-gray-400">
                    Round {currentSession.current_round}/{currentSession.total_rounds}
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Phiên đã {currentSession.status === 'error' ? 'thất bại' : 'hoàn thành'}
                  </h3>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
