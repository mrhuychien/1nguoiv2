'use client'

import { ChatInterface } from '../chat/chat-interface'
import { ArtifactList } from '../artifacts/artifact-list'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface RefineStepProps {
  onPrev: () => void
  onComplete: () => void
}

export function RefineStep({ onPrev, onComplete }: RefineStepProps) {
  const { getArtifactByType, updateSession } = useVibeCodeStore()
  const [copied, setCopied] = useState(false)

  const coderPack = getArtifactByType('coder_pack')
  const isCoderPackApproved = coderPack?.status === 'approved'

  const handleCopyAll = async () => {
    if (!coderPack) return
    await navigator.clipboard.writeText(coderPack.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadAll = () => {
    if (!coderPack) return
    const blob = new Blob([coderPack.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coder-pack-v${coderPack.version}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleComplete = async () => {
    await updateSession({ status: 'completed' })
    onComplete()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold mb-2">Bước 6: Refine</h2>
        <p className="text-gray-400 text-sm">
          Review Coder Pack và yêu cầu chỉnh sửa nếu cần. Khi hoàn tất, bạn có thể download và sử dụng.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Success banner */}
          {isCoderPackApproved && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="font-medium text-green-400">Coder Pack hoàn tất!</h3>
                  <p className="text-sm text-gray-400">
                    Bạn có thể download hoặc copy Coder Pack để sử dụng.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={handleCopyAll}
                  variant="outline"
                  className="border-green-500/30 hover:bg-green-500/10"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Đã copy
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Coder Pack
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadAll}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* All artifacts */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-400">Tất cả Artifacts</h3>
            <ArtifactList />
          </div>

          {/* Chat for refinement */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium mb-3 text-gray-400">
              Yêu cầu chỉnh sửa hoặc hỏi đáp
            </h3>
            <div className="h-[300px] border border-white/10 rounded-lg overflow-hidden">
              <ChatInterface
                step={6}
                placeholder="Yêu cầu chỉnh sửa Coder Pack..."
              />
            </div>
          </div>
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

        {isCoderPackApproved && (
          <Button
            onClick={handleComplete}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Hoàn thành
          </Button>
        )}
      </div>
    </div>
  )
}
