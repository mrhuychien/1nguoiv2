# ═══════════════════════════════════════════════════════════════════════════════
#                              🔧 CODER PACK v2
#                         VIBECODE KIT MODULE
#                      1NGUOI.COM Framework Integration
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  📋 FILE NÀY TIẾP NỐI TỪ CODER PACK v1
#
#  Nội dung:
#  • Step components (Vision, Context, Blueprint, Contract, Build, Refine)
#  • Artifact components
#  • Main Wizard container
#  • Page & Layout
#  • Integration với Project Hub
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# ═══════════════════════════════════════════════════════════════════════════════
#                    STEP 6 (TIẾP): UI COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════════

## 6.5 File: components/vibecode/artifacts/artifact-viewer.tsx

```typescript
'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import type { VibeCodeArtifact } from '@/lib/types/vibecode'

interface ArtifactViewerProps {
  artifact: VibeCodeArtifact
  onApprove?: () => void
  showActions?: boolean
}

export function ArtifactViewer({ artifact, onApprove, showActions = true }: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusColors = {
    draft: 'bg-yellow/20 text-yellow border-yellow/30',
    approved: 'bg-green/20 text-green border-green/30',
    archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }

  const typeIcons = {
    blueprint: '📐',
    contract: '📜',
    coder_pack: '🔧',
  }

  return (
    <div
      className={cn(
        'bg-card border border-white/10 rounded-2xl overflow-hidden',
        isFullscreen && 'fixed inset-4 z-50 flex flex-col'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeIcons[artifact.type]}</span>
          <div>
            <h3 className="font-semibold">{artifact.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-0.5 rounded border', statusColors[artifact.status])}>
                {artifact.status === 'approved' ? '✓ Approved' : artifact.status}
              </span>
              <span className="text-xs text-gray-500">v{artifact.version}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn('overflow-y-auto p-6', isFullscreen ? 'flex-1' : 'max-h-[500px]')}>
        <ReactMarkdown
          className="prose prose-invert prose-sm max-w-none"
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <div className="relative group">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-lg text-sm !bg-black/50"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(children))}
                    className="absolute top-2 right-2 p-1.5 rounded bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <code className={cn('bg-white/10 px-1 rounded text-cyan', className)} {...props}>
                  {children}
                </code>
              )
            },
            h1: ({ children }) => <h1 className="text-2xl font-bold text-cyan border-b border-white/10 pb-2 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold text-purple mt-6 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-pink mt-4 mb-2">{children}</h3>,
            table: ({ children }) => <table className="w-full border-collapse my-4">{children}</table>,
            th: ({ children }) => <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">{children}</th>,
            td: ({ children }) => <td className="border border-white/10 px-3 py-2">{children}</td>,
          }}
        >
          {artifact.content}
        </ReactMarkdown>
      </div>

      {/* Actions */}
      {showActions && artifact.status === 'draft' && onApprove && (
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <Button variant="secondary">Yêu cầu sửa đổi</Button>
          <Button onClick={onApprove}>
            ✓ Approve {artifact.type === 'contract' ? '& Confirm' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
```

## 6.6 File: components/vibecode/artifacts/artifact-list.tsx

```typescript
'use client'

import { cn } from '@/lib/utils'
import { FileText, Download, Eye } from 'lucide-react'
import type { VibeCodeArtifact, ArtifactType } from '@/lib/types/vibecode'

interface ArtifactListProps {
  artifacts: VibeCodeArtifact[]
  onView?: (artifact: VibeCodeArtifact) => void
  onDownload?: (artifact: VibeCodeArtifact) => void
  selectedId?: string
}

const typeLabels: Record<ArtifactType, string> = {
  blueprint: 'Blueprint',
  contract: 'Contract',
  coder_pack: 'Coder Pack',
}

const typeIcons: Record<ArtifactType, string> = {
  blueprint: '📐',
  contract: '📜',
  coder_pack: '🔧',
}

export function ArtifactList({ artifacts, onView, onDownload, selectedId }: ArtifactListProps) {
  if (artifacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Chưa có artifacts nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {artifacts.map((artifact) => (
        <div
          key={artifact.id}
          className={cn(
            'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
            selectedId === artifact.id
              ? 'bg-cyan/10 border-cyan/30'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          )}
          onClick={() => onView?.(artifact)}
        >
          <span className="text-xl">{typeIcons[artifact.type]}</span>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{artifact.title}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{typeLabels[artifact.type]}</span>
              <span>•</span>
              <span>v{artifact.version}</span>
              <span>•</span>
              <span>{new Date(artifact.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded',
                artifact.status === 'approved' && 'bg-green/20 text-green',
                artifact.status === 'draft' && 'bg-yellow/20 text-yellow',
                artifact.status === 'archived' && 'bg-gray-500/20 text-gray-400'
              )}
            >
              {artifact.status === 'approved' ? '✓' : artifact.status}
            </span>

            {onDownload && artifact.type === 'coder_pack' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(artifact)
                }}
                className="p-1.5 rounded hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## 6.7 File: components/vibecode/artifacts/artifact-actions.tsx

```typescript
'use client'

import { useState } from 'react'
import { Download, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui'
import type { VibeCodeArtifact } from '@/lib/types/vibecode'

interface ArtifactActionsProps {
  artifact: VibeCodeArtifact
}

export function ArtifactActions({ artifact }: ArtifactActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.type}-v${artifact.version}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadZip = async () => {
    // For coder pack, create a zip with proper file structure
    // This would require a library like JSZip
    // For now, just download as .md
    handleDownload()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={handleCopyToClipboard}>
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green" />
            Đã copy!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </>
        )}
      </Button>

      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download .md
      </Button>

      {artifact.type === 'coder_pack' && (
        <>
          <Button variant="secondary" size="sm" onClick={handleDownloadZip}>
            <Download className="w-4 h-4 mr-2" />
            Download .zip
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              // Copy formatted for Claude Code
              const formatted = `# CODER PACK\n\n${artifact.content}\n\n---\nPaste this into Claude Code or Cursor to build the project.`
              navigator.clipboard.writeText(formatted)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Send to Claude Code
          </Button>
        </>
      )}
    </div>
  )
}
```

## 6.8 File: components/vibecode/steps/vision-step.tsx

```typescript
'use client'

import { useState } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { Button, Card } from '@/components/ui'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface VisionStepProps {
  onNext: () => void
}

export function VisionStep({ onNext }: VisionStepProps) {
  const { session, setVision, isLoading } = useVibeCodeStore()
  const [vision, setVisionText] = useState(session?.vision_text || '')

  const handleSubmit = async () => {
    if (!vision.trim()) return
    await setVision(vision.trim())
    onNext()
  }

  const suggestions = [
    'Ứng dụng quản lý tài chính cá nhân cho người Việt',
    'Landing page cho startup công nghệ',
    'Dashboard analytics cho e-commerce',
    'App đặt lịch hẹn cho phòng khám',
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan/20 flex items-center justify-center text-3xl mx-auto mb-4">
            👁️
          </div>
          <h2 className="text-2xl font-bold mb-2">Bước 1: Vision</h2>
          <p className="text-gray-400">
            Mô tả ý tưởng sản phẩm bạn muốn xây dựng. Càng chi tiết càng tốt!
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mô tả sản phẩm của bạn
          </label>
          <textarea
            value={vision}
            onChange={(e) => setVisionText(e.target.value)}
            placeholder="VD: Tôi muốn xây dựng một ứng dụng web giúp người dùng theo dõi thói quen hàng ngày. Có dashboard hiển thị streak, biểu đồ tiến độ, và reminder qua email..."
            rows={6}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all resize-none"
          />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Gợi ý: Mô tả vấn đề, đối tượng users, tính năng chính</span>
            <span>{vision.length} ký tự</span>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-8">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
            <Lightbulb className="w-3 h-3" />
            Gợi ý nhanh:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setVisionText(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan/30 hover:bg-cyan/10 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!vision.trim() || isLoading}
            className="min-w-[200px]"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

## 6.9 File: components/vibecode/steps/context-step.tsx

```typescript
'use client'

import { useState } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ChatInterface } from '../chat/chat-interface'
import { Button, Card } from '@/components/ui'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface ContextStepProps {
  onNext: () => void
  onPrev: () => void
}

export function ContextStep({ onNext, onPrev }: ContextStepProps) {
  const { session, addMessage, updateContext, isLoading, setLoading } = useVibeCodeStore()
  const [isReady, setIsReady] = useState(false)

  const handleSendMessage = async (message: string) => {
    // Add user message
    await addMessage({
      session_id: session!.id,
      step: 2,
      role: 'user',
      content: message,
      metadata: {},
    })

    setLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/vibecode/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session!.id,
          step: 2,
          message,
        }),
      })

      if (!response.ok) throw new Error('Chat failed')

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // Parse SSE events
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content_block_delta') {
                fullResponse += data.delta?.text || ''
              }
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }

      // Add assistant message
      await addMessage({
        session_id: session!.id,
        step: 2,
        role: 'assistant',
        content: fullResponse,
        metadata: {},
      })

      // Check if context collection is complete
      if (
        fullResponse.toLowerCase().includes('đã đủ thông tin') ||
        fullResponse.toLowerCase().includes('sẵn sàng tạo blueprint')
      ) {
        setIsReady(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="text-center py-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Bước 2: Context</h2>
        <p className="text-sm text-gray-400">
          Chat với AI để cung cấp thêm thông tin chi tiết
        </p>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatInterface step={2} onSendMessage={handleSendMessage} />
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <Button onClick={onNext} disabled={!isReady && !session?.context_data?.tech_stack}>
          Tạo Blueprint
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
```

## 6.10 File: components/vibecode/steps/blueprint-step.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ArtifactViewer } from '../artifacts/artifact-viewer'
import { ChatInterface } from '../chat/chat-interface'
import { Button, Card } from '@/components/ui'
import { ArrowRight, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'

interface BlueprintStepProps {
  onNext: () => void
  onPrev: () => void
}

export function BlueprintStep({ onNext, onPrev }: BlueprintStepProps) {
  const {
    session,
    getArtifactByType,
    approveArtifact,
    addMessage,
    isGenerating,
    setGenerating,
    setLoading,
  } = useVibeCodeStore()

  const blueprint = getArtifactByType('blueprint')
  const [showChat, setShowChat] = useState(false)

  // Generate blueprint on mount if not exists
  useEffect(() => {
    if (!blueprint && session) {
      generateBlueprint()
    }
  }, [])

  const generateBlueprint = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/vibecode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session!.id,
          type: 'blueprint',
        }),
      })

      if (!response.ok) throw new Error('Generation failed')

      // Reload artifacts
      await useVibeCodeStore.getState().loadArtifacts()
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!blueprint) return
    await approveArtifact(blueprint.id)
    onNext()
  }

  const handleSendMessage = async (message: string) => {
    await addMessage({
      session_id: session!.id,
      step: 3,
      role: 'user',
      content: message,
      metadata: {},
    })

    setLoading(true)
    // Similar chat handling as context step...
    // After feedback, can regenerate blueprint
    setLoading(false)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-cyan mb-4" />
        <h3 className="text-xl font-bold mb-2">Đang tạo Blueprint...</h3>
        <p className="text-gray-400">Kiến trúc sư đang thiết kế sản phẩm của bạn</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">Bước 3: Blueprint</h2>
          <p className="text-sm text-gray-400">Review và approve bản thiết kế</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
            {showChat ? 'Xem Blueprint' : 'Feedback'}
          </Button>
          <Button variant="ghost" size="sm" onClick={generateBlueprint}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {showChat ? (
          <ChatInterface step={3} onSendMessage={handleSendMessage} />
        ) : blueprint ? (
          <ArtifactViewer artifact={blueprint} onApprove={handleApprove} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">Chưa có Blueprint</p>
            <Button onClick={generateBlueprint}>Tạo Blueprint</Button>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {blueprint?.status === 'approved' && (
          <Button onClick={onNext}>
            Tiếp tục
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

## 6.11 File: components/vibecode/steps/contract-step.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ArtifactViewer } from '../artifacts/artifact-viewer'
import { Button, Card } from '@/components/ui'
import { ArrowRight, ArrowLeft, RefreshCw, Loader2, CheckCircle } from 'lucide-react'

interface ContractStepProps {
  onNext: () => void
  onPrev: () => void
}

export function ContractStep({ onNext, onPrev }: ContractStepProps) {
  const { session, getArtifactByType, approveArtifact, isGenerating, setGenerating } =
    useVibeCodeStore()

  const contract = getArtifactByType('contract')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!contract && session) {
      generateContract()
    }
  }, [])

  const generateContract = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/vibecode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session!.id,
          type: 'contract',
        }),
      })

      if (!response.ok) throw new Error('Generation failed')
      await useVibeCodeStore.getState().loadArtifacts()
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleConfirm = async () => {
    if (!contract) return
    await approveArtifact(contract.id)
    setConfirmed(true)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-orange mb-4" />
        <h3 className="text-xl font-bold mb-2">Đang tạo Contract...</h3>
        <p className="text-gray-400">Đang soạn thảo hợp đồng dự án</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">Bước 4: Contract</h2>
          <p className="text-sm text-gray-400">Đọc kỹ và xác nhận scope dự án</p>
        </div>
        <Button variant="ghost" size="sm" onClick={generateContract}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {contract ? (
          <ArtifactViewer artifact={contract} showActions={false} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">Chưa có Contract</p>
            <Button onClick={generateContract}>Tạo Contract</Button>
          </Card>
        )}
      </div>

      {/* Confirm Box */}
      {contract && contract.status === 'draft' && (
        <div className="mx-4 mb-4 p-4 bg-orange/10 border border-orange/30 rounded-xl">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-contract"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-orange/30 bg-white/5 text-orange focus:ring-orange/20"
            />
            <label htmlFor="confirm-contract" className="text-sm">
              Tôi đã đọc và hiểu toàn bộ Contract. Tôi đồng ý với Deliverables, Timeline, và những gì
              KHÔNG bao gồm trong scope. Tôi sẵn sàng bắt đầu build.
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {contract?.status === 'approved' ? (
          <Button onClick={onNext}>
            Tiếp tục Build
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleConfirm} disabled={!confirmed || !contract}>
            <CheckCircle className="w-4 h-4 mr-2" />
            CONFIRM & Tiếp tục
          </Button>
        )}
      </div>
    </div>
  )
}
```

## 6.12 File: components/vibecode/steps/build-step.tsx

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ArtifactViewer } from '../artifacts/artifact-viewer'
import { ArtifactActions } from '../artifacts/artifact-actions'
import { Button, Card } from '@/components/ui'
import { ArrowRight, ArrowLeft, Loader2, Package } from 'lucide-react'

interface BuildStepProps {
  onNext: () => void
  onPrev: () => void
}

export function BuildStep({ onNext, onPrev }: BuildStepProps) {
  const { session, getArtifactByType, isGenerating, setGenerating } = useVibeCodeStore()

  const coderPack = getArtifactByType('coder_pack')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!coderPack && session) {
      generateCoderPack()
    }
  }, [])

  const generateCoderPack = async () => {
    setGenerating(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5, 90))
    }, 500)

    try {
      const response = await fetch('/api/vibecode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session!.id,
          type: 'coder_pack',
        }),
      })

      if (!response.ok) throw new Error('Generation failed')
      
      clearInterval(progressInterval)
      setProgress(100)
      
      await useVibeCodeStore.getState().loadArtifacts()
    } catch (error) {
      console.error('Generate error:', error)
    } finally {
      clearInterval(progressInterval)
      setGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 rounded-full bg-green/20 flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-green animate-pulse" />
        </div>
        <h3 className="text-xl font-bold mb-2">Đang tạo Coder Pack...</h3>
        <p className="text-gray-400 mb-6">Thợ xây đang chuẩn bị code cho bạn</p>
        
        {/* Progress bar */}
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan to-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">{progress}%</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">Bước 5: Coder Pack</h2>
          <p className="text-sm text-gray-400">Download hoặc copy code để build</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        {coderPack ? (
          <div className="h-full flex flex-col gap-4">
            {/* Actions */}
            <Card className="p-4">
              <h3 className="font-medium mb-3">🎉 Coder Pack đã sẵn sàng!</h3>
              <ArtifactActions artifact={coderPack} />
            </Card>

            {/* Viewer */}
            <div className="flex-1 overflow-hidden">
              <ArtifactViewer artifact={coderPack} showActions={false} />
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-400 mb-4">Chưa có Coder Pack</p>
            <Button onClick={generateCoderPack}>Tạo Coder Pack</Button>
          </Card>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <Button onClick={onNext}>
          Hoàn thành & Refine
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
```

## 6.13 File: components/vibecode/steps/refine-step.tsx

```typescript
'use client'

import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ChatInterface } from '../chat/chat-interface'
import { ArtifactList } from '../artifacts/artifact-list'
import { Button, Card } from '@/components/ui'
import { ArrowLeft, CheckCircle, Download } from 'lucide-react'
import { useState } from 'react'

interface RefineStepProps {
  onComplete: () => void
  onPrev: () => void
}

export function RefineStep({ onComplete, onPrev }: RefineStepProps) {
  const { session, artifacts, addMessage, setLoading } = useVibeCodeStore()
  const [view, setView] = useState<'chat' | 'artifacts'>('chat')

  const handleSendMessage = async (message: string) => {
    await addMessage({
      session_id: session!.id,
      step: 6,
      role: 'user',
      content: message,
      metadata: {},
    })

    setLoading(true)
    try {
      const response = await fetch('/api/vibecode/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session!.id,
          step: 6,
          message,
        }),
      })

      // Handle streaming...
      // Similar to context step
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadAll = () => {
    // Download all artifacts as zip
    const coderPack = artifacts.find((a) => a.type === 'coder_pack')
    if (coderPack) {
      const blob = new Blob([coderPack.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coder-pack-${session?.project_id}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">Bước 6: Refine</h2>
          <p className="text-sm text-gray-400">Hỗ trợ review, fix bugs, và tinh chỉnh</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'chat' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('chat')}
          >
            Chat
          </Button>
          <Button
            variant={view === 'artifacts' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setView('artifacts')}
          >
            Artifacts
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'chat' ? (
          <ChatInterface step={6} onSendMessage={handleSendMessage} />
        ) : (
          <div className="p-4">
            <ArtifactList
              artifacts={artifacts}
              onDownload={(a) => {
                const blob = new Blob([a.content], { type: 'text/markdown' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${a.type}-v${a.version}.md`
                link.click()
                URL.revokeObjectURL(url)
              }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 flex justify-between">
        <Button variant="ghost" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleDownloadAll}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
          <Button onClick={onComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Hoàn thành Vibecode
          </Button>
        </div>
      </div>
    </div>
  )
}
```

## 6.14 File: components/vibecode/vibecode-wizard.tsx

```typescript
'use client'

import { useEffect } from 'react'
import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { StepIndicator } from './step-indicator'
import { VisionStep } from './steps/vision-step'
import { ContextStep } from './steps/context-step'
import { BlueprintStep } from './steps/blueprint-step'
import { ContractStep } from './steps/contract-step'
import { BuildStep } from './steps/build-step'
import { RefineStep } from './steps/refine-step'
import { Loader2 } from 'lucide-react'
import type { VibeCodeStep } from '@/lib/types/vibecode'

interface VibeCodeWizardProps {
  projectId: string
  userId: string
  onComplete?: () => void
}

export function VibeCodeWizard({ projectId, userId, onComplete }: VibeCodeWizardProps) {
  const {
    session,
    currentStep,
    isLoading,
    error,
    initSession,
    setStep,
    nextStep,
    prevStep,
    updateSession,
  } = useVibeCodeStore()

  // Initialize session on mount
  useEffect(() => {
    initSession(projectId, userId)
  }, [projectId, userId])

  const handleComplete = async () => {
    await updateSession({ status: 'completed', completed_at: new Date().toISOString() })
    onComplete?.()
  }

  // Get completed steps
  const getCompletedSteps = (): VibeCodeStep[] => {
    const completed: VibeCodeStep[] = []
    if (session?.vision_text) completed.push(1)
    if (session?.context_data && Object.keys(session.context_data).length > 0) completed.push(2)
    // Add more logic based on artifacts...
    return completed
  }

  if (isLoading && !session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-cyan mb-4" />
        <p className="text-gray-400">Đang tải Vibecode Kit...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-400 mb-4">Lỗi: {error}</p>
        <button
          onClick={() => initSession(projectId, userId)}
          className="text-cyan hover:underline"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Step Indicator */}
      <div className="p-6 border-b border-white/10 bg-card">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={getCompletedSteps()}
          onStepClick={(step) => {
            if (step <= currentStep) setStep(step)
          }}
        />
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {currentStep === 1 && <VisionStep onNext={nextStep} />}
        {currentStep === 2 && <ContextStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 3 && <BlueprintStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 4 && <ContractStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 5 && <BuildStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 6 && <RefineStep onComplete={handleComplete} onPrev={prevStep} />}
      </div>
    </div>
  )
}
```

## 6.15 File: components/vibecode/index.ts

```typescript
export * from './vibecode-wizard'
export * from './step-indicator'
export * from './chat/chat-interface'
export * from './chat/chat-message'
export * from './chat/chat-input'
export * from './artifacts/artifact-viewer'
export * from './artifacts/artifact-list'
export * from './artifacts/artifact-actions'
export * from './steps/vision-step'
export * from './steps/context-step'
export * from './steps/blueprint-step'
export * from './steps/contract-step'
export * from './steps/build-step'
export * from './steps/refine-step'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 7: PAGE & LAYOUT
# ═══════════════════════════════════════════════════════════════════════════════

## 7.1 File: app/projects/[id]/vibecode/page.tsx

```typescript
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/lib/hooks/use-user'
import { VibeCodeWizard } from '@/components/vibecode'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/lib/types/database'
import { Loader2 } from 'lucide-react'

export default function VibeCodePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const projectId = params.id as string

  useEffect(() => {
    if (!user && !userLoading) {
      router.push('/login')
      return
    }

    if (user && projectId) {
      loadProject()
    }
  }, [user, userLoading, projectId])

  const loadProject = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !data) {
      router.push('/dashboard')
      return
    }

    setProject(data)
    setIsLoading(false)
  }

  const handleComplete = () => {
    router.push(`/projects/${projectId}`)
  }

  if (isLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan" />
      </div>
    )
  }

  if (!user || !project) {
    return null
  }

  return (
    <div className="h-screen bg-background">
      <VibeCodeWizard
        projectId={projectId}
        userId={user.id}
        onComplete={handleComplete}
      />
    </div>
  )
}
```

## 7.2 File: app/projects/[id]/vibecode/layout.tsx

```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vibecode Kit | 1NGUOI',
  description: 'AI-powered product design tool',
}

export default function VibeCodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         STEP 8: INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════════

## 8.1 Update: components/project-hub/project-card.tsx

Thêm menu item "Sử dụng Vibecode Kit" vào dropdown:

```typescript
// Thêm vào dropdown menu của project card

import { Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Trong component ProjectCard, thêm vào dropdown items:
const router = useRouter()

// Menu item mới
<DropdownMenuItem
  onClick={() => router.push(`/projects/${project.id}/vibecode`)}
  className="flex items-center gap-2 text-cyan"
>
  <Wrench className="w-4 h-4" />
  Sử dụng Vibecode Kit
</DropdownMenuItem>
```

## 8.2 Update: lib/types/database.ts

Thêm types nếu chưa có:

```typescript
// Thêm vào file types/database.ts

export type { 
  VibeCodeSession, 
  VibeCodeArtifact, 
  VibeCodeMessage,
  ArtifactType,
  ArtifactStatus,
  VibeCodeStep,
} from './vibecode'
```

## 8.3 Environment Variables

Thêm vào `.env.local`:

```bash
# Anthropic API (shared với Brainstorm4)
ANTHROPIC_API_KEY=your_api_key_here
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         ✅ INSTALLATION GUIDE
# ═══════════════════════════════════════════════════════════════════════════════

## Dependencies cần cài thêm:

```bash
npm install react-markdown react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

## Chạy Migration:

1. Mở Supabase SQL Editor
2. Copy toàn bộ SQL trong Step 1.1
3. Execute

## File Structure sau khi hoàn thành:

```
app/
├── projects/
│   └── [id]/
│       └── vibecode/
│           ├── page.tsx          ✅
│           └── layout.tsx        ✅
├── api/
│   └── vibecode/
│       ├── chat/route.ts         ✅
│       ├── generate/route.ts     ✅
│       └── artifacts/route.ts    ✅

components/
├── vibecode/
│   ├── vibecode-wizard.tsx       ✅
│   ├── step-indicator.tsx        ✅
│   ├── steps/
│   │   ├── vision-step.tsx       ✅
│   │   ├── context-step.tsx      ✅
│   │   ├── blueprint-step.tsx    ✅
│   │   ├── contract-step.tsx     ✅
│   │   ├── build-step.tsx        ✅
│   │   └── refine-step.tsx       ✅
│   ├── chat/
│   │   ├── chat-interface.tsx    ✅
│   │   ├── chat-message.tsx      ✅
│   │   └── chat-input.tsx        ✅
│   ├── artifacts/
│   │   ├── artifact-viewer.tsx   ✅
│   │   ├── artifact-list.tsx     ✅
│   │   └── artifact-actions.tsx  ✅
│   └── index.ts                  ✅

lib/
├── stores/
│   └── vibecode-store.ts         ✅
├── services/
│   └── vibecode-ai.ts            ✅
└── types/
    └── vibecode.ts               ✅
```

---

# 🎉 CODER PACK HOÀN THÀNH!

## Tóm tắt:

| Component | Files | Status |
|-----------|-------|--------|
| Database | 3 tables + RLS | ✅ |
| Types | vibecode.ts | ✅ |
| Store | vibecode-store.ts | ✅ |
| AI Service | vibecode-ai.ts | ✅ |
| API Routes | 3 routes | ✅ |
| UI Components | 15+ components | ✅ |
| Pages | vibecode page + layout | ✅ |
| Integration | Project Hub dropdown | ✅ |

## Cách sử dụng:

1. Copy Coder Pack v1 + v2 → Claude Code / Cursor
2. Chạy migration SQL
3. Cài dependencies
4. Thêm API key vào .env.local
5. Test tại `/projects/[id]/vibecode`

---

# END OF CODER PACK v2
## VIBECODE KIT MODULE
## 1NGUOI.COM Framework
