'use client'

import Link from 'next/link'
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from './button'

interface UpgradePromptProps {
  feature: string
  description?: string
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Tính năng PRO
        </h2>

        {/* Feature name */}
        <p className="text-lg text-cyan-400 font-semibold mb-4">
          {feature}
        </p>

        {/* Description */}
        <p className="text-slate-400 mb-6">
          {description || `Nâng cấp lên PRO để sử dụng ${feature} và nhiều tính năng mạnh mẽ khác.`}
        </p>

        {/* Features list */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            PRO bao gồm:
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Combat Pro - 4 AI mạnh nhất (GPT-4, Claude, Gemini, Grok)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Brainstorm AI - Phân tích ý tưởng sâu
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Vibecode Kit - AI coding assistant
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Không giới hạn requests
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Link href="/settings">
              <Crown className="w-5 h-5 mr-2" />
              Nâng cấp PRO
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          <p className="text-xs text-slate-500">
            Hoặc liên hệ admin để được nâng cấp
          </p>
        </div>
      </div>
    </div>
  )
}

// Wrapper component to check subscription and show prompt
export function ProFeatureGate({
  children,
  isPro,
  isLoading,
  feature,
  description,
}: {
  children: React.ReactNode
  isPro: boolean
  isLoading: boolean
  feature: string
  description?: string
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isPro) {
    return <UpgradePrompt feature={feature} description={description} />
  }

  return <>{children}</>
}
