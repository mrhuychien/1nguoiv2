'use client'

import { useEffect } from 'react'
import { ChatInterface } from '../chat/chat-interface'
import { ArtifactViewer } from '../artifacts/artifact-viewer'
import { ArtifactActions } from '../artifacts/artifact-actions'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface BlueprintStepProps {
  onNext: () => void
  onPrev: () => void
}

export function BlueprintStep({ onNext, onPrev }: BlueprintStepProps) {
  const { getArtifactByType, loadArtifacts } = useVibeCodeStore()

  const blueprint = getArtifactByType('blueprint')
  const isApproved = blueprint?.status === 'approved'

  // Reload artifacts when component mounts or after generation
  useEffect(() => {
    loadArtifacts()
  }, [loadArtifacts])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold mb-2">Bước 3: Blueprint</h2>
        <p className="text-gray-400 text-sm">
          Xem và duyệt bản thiết kế kiến trúc hệ thống. Bạn có thể yêu cầu chỉnh sửa.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Generate/Approve actions */}
          <ArtifactActions
            artifactType="blueprint"
            onGenerate={() => loadArtifacts()}
            className="mb-6"
          />

          {/* Blueprint viewer */}
          {blueprint && (
            <ArtifactViewer
              artifact={blueprint}
              className="mb-6"
            />
          )}

          {/* Chat for refinement */}
          {blueprint && !isApproved && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-medium mb-3 text-gray-400">
                Yêu cầu chỉnh sửa blueprint
              </h3>
              <ChatInterface
                step={3}
                placeholder="Yêu cầu chỉnh sửa blueprint..."
              />
            </div>
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
