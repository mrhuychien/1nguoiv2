'use client'

import { useRouter } from 'next/navigation'
import { Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FinalVerdict } from '@/lib/types/brainstorm'

interface VerdictCardProps {
  verdict: FinalVerdict
  projectId?: string | null
}

export function VerdictCard({ verdict, projectId }: VerdictCardProps) {
  const router = useRouter()

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return { text: 'Rat kha thi', icon: CheckCircle, color: 'green' }
    if (score >= 6) return { text: 'Kha thi', icon: TrendingUp, color: 'green' }
    if (score >= 4) return { text: 'Can can nhac', icon: AlertTriangle, color: 'yellow' }
    return { text: 'Rui ro cao', icon: TrendingDown, color: 'red' }
  }

  const scoreLabel = getScoreLabel(verdict.score)
  const ScoreIcon = scoreLabel.icon

  return (
    <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
      {/* Score header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">VERDICT</h3>
          <div className="flex items-center gap-2">
            <ScoreIcon className={cn('w-5 h-5', `text-${scoreLabel.color}-400`)} />
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              scoreLabel.color === 'green' && 'bg-green-500/20 text-green-400',
              scoreLabel.color === 'yellow' && 'bg-yellow-500/20 text-yellow-400',
              scoreLabel.color === 'red' && 'bg-red-500/20 text-red-400'
            )}>
              {scoreLabel.text}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-6 h-6',
                  i < Math.round(verdict.score / 2)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                )}
              />
            ))}
          </div>
          <span className={cn('text-3xl font-bold', getScoreColor(verdict.score))}>
            {verdict.score}/10
          </span>
        </div>
      </div>

      {/* Summary */}
      {verdict.summary && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl">
          <p className="text-gray-300">{verdict.summary}</p>
        </div>
      )}

      {/* SWOT Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-green-500/10 rounded-lg">
          <h4 className="text-sm font-semibold text-green-400 mb-2">
            Diem manh ({verdict.strengths?.length || 0})
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {verdict.strengths?.slice(0, 3).map((s, i) => (
              <li key={i} className="truncate">• {s}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-yellow-500/10 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">
            Rui ro ({verdict.risks?.length || 0})
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {verdict.risks?.slice(0, 3).map((r, i) => (
              <li key={i} className="truncate">• {r}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-red-500/10 rounded-lg">
          <h4 className="text-sm font-semibold text-red-400 mb-2">
            Diem yeu ({verdict.weaknesses?.length || 0})
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {verdict.weaknesses?.slice(0, 3).map((w, i) => (
              <li key={i} className="truncate">• {w}</li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-cyan-500/10 rounded-lg">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">
            Buoc tiep theo ({verdict.next_steps?.length || 0})
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            {verdict.next_steps?.slice(0, 3).map((n, i) => (
              <li key={i} className="truncate">{i + 1}. {n}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        {projectId && (
          <button
            onClick={() => router.push(`/projects/${projectId}`)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
          >
            Xem Project
          </button>
        )}
        <button
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
        >
          Brainstorm tiep
        </button>
      </div>
    </div>
  )
}
