'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import type { ArtifactType } from '@/lib/types/vibecode'
import { Loader2, Check, RefreshCw, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ArtifactActionsProps {
  artifactType: ArtifactType
  onGenerate?: () => void
  onApprove?: () => void
  onRegenerate?: () => void
  className?: string
}

export function ArtifactActions({
  artifactType,
  onGenerate,
  onApprove,
  onRegenerate,
  className,
}: ArtifactActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { session, getArtifactByType, approveArtifact, setError } = useVibeCodeStore()

  const artifact = getArtifactByType(artifactType)
  const isApproved = artifact?.status === 'approved'

  const handleGenerate = async () => {
    if (!session) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/vibecode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          project_id: session.project_id,
          type: artifactType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate artifact')
      }

      onGenerate?.()
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!artifact) return

    try {
      await approveArtifact(artifact.id)
      onApprove?.()
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleRegenerate = async () => {
    await handleGenerate()
    onRegenerate?.()
  }

  const labels = {
    blueprint: 'Blueprint',
    contract: 'Contract',
    coder_pack: 'Coder Pack',
  }

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {!artifact && (
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            `Tạo ${labels[artifactType]}`
          )}
        </Button>
      )}

      {artifact && !isApproved && (
        <>
          <Button
            onClick={handleApprove}
            className="bg-green-500 hover:bg-green-600"
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Duyệt {labels[artifactType]}
          </Button>

          <Button
            onClick={handleRegenerate}
            disabled={isGenerating}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo lại...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tạo lại
              </>
            )}
          </Button>
        </>
      )}

      {isApproved && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg text-green-400">
          <Check className="w-4 h-4" />
          <span>{labels[artifactType]} đã được duyệt</span>
        </div>
      )}
    </div>
  )
}
