'use client'

import { useEffect, useState } from 'react'
import { ArtifactViewer } from '../artifacts/artifact-viewer'
import { ArtifactActions } from '../artifacts/artifact-actions'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

interface BuildStepProps {
  onNext: () => void
  onPrev: () => void
}

export function BuildStep({ onNext, onPrev }: BuildStepProps) {
  const { getArtifactByType, loadArtifacts, session } = useVibeCodeStore()
  const [buildProgress, setBuildProgress] = useState<string[]>([])
  const [isBuilding, setIsBuilding] = useState(false)

  const coderPack = getArtifactByType('coder_pack')
  const isApproved = coderPack?.status === 'approved'
  const blueprint = getArtifactByType('blueprint')
  const contract = getArtifactByType('contract')

  // Check prerequisites
  const canBuild = blueprint?.status === 'approved' && contract?.status === 'approved'

  useEffect(() => {
    loadArtifacts()
  }, [loadArtifacts])

  const handleBuild = async () => {
    if (!session || !canBuild) return

    setIsBuilding(true)
    setBuildProgress(['Khởi tạo quá trình build...'])

    try {
      // Simulate build progress
      const steps = [
        'Đang phân tích Blueprint...',
        'Đang xử lý Contract requirements...',
        'Đang tạo cấu trúc project...',
        'Đang generate code components...',
        'Đang tạo documentation...',
        'Đang finalize Coder Pack...',
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        setBuildProgress((prev) => [...prev, steps[i]])
      }

      // Actually generate the coder pack
      const response = await fetch('/api/vibecode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          project_id: session.project_id,
          type: 'coder_pack',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate Coder Pack')
      }

      setBuildProgress((prev) => [...prev, 'Coder Pack đã được tạo thành công!'])
      await loadArtifacts()
    } catch (error) {
      setBuildProgress((prev) => [...prev, `Lỗi: ${(error as Error).message}`])
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold mb-2">Bước 5: Build</h2>
        <p className="text-gray-400 text-sm">
          Tạo production-ready Coder Pack từ Blueprint và Contract đã duyệt.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Prerequisites check */}
          {!canBuild && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                Bạn cần duyệt Blueprint và Contract trước khi tạo Coder Pack.
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {blueprint?.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-500" />
                  )}
                  <span className={blueprint?.status === 'approved' ? 'text-green-400' : 'text-gray-400'}>
                    Blueprint
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {contract?.status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-500" />
                  )}
                  <span className={contract?.status === 'approved' ? 'text-green-400' : 'text-gray-400'}>
                    Contract
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Build action */}
          {canBuild && !coderPack && (
            <div className="mb-6">
              <Button
                onClick={handleBuild}
                disabled={isBuilding}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang build...
                  </>
                ) : (
                  'Build Coder Pack'
                )}
              </Button>
            </div>
          )}

          {/* Build progress */}
          {buildProgress.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4 mb-6 font-mono text-sm">
              {buildProgress.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i === buildProgress.length - 1 && isBuilding ? (
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                  <span className={i === buildProgress.length - 1 && !isBuilding && line.includes('thành công') ? 'text-green-400' : ''}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Coder Pack viewer */}
          {coderPack && (
            <>
              <ArtifactActions
                artifactType="coder_pack"
                onGenerate={() => loadArtifacts()}
                className="mb-6"
              />
              <ArtifactViewer artifact={coderPack} />
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button
          onClick={onPrev}
          variant="outline"
          className="border-white/20 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {isApproved && (
          <Button
            onClick={onNext}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
