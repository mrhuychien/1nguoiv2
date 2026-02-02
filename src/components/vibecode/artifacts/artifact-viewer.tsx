'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { VibeCodeArtifact } from '@/lib/types/vibecode'
import { Copy, Download, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArtifactViewerProps {
  artifact: VibeCodeArtifact
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function ArtifactViewer({
  artifact,
  className,
  collapsible = false,
  defaultExpanded = true,
}: ArtifactViewerProps) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(defaultExpanded)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, '-')}-v${artifact.version}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const typeLabels = {
    blueprint: 'Blueprint',
    contract: 'Contract',
    coder_pack: 'Coder Pack',
  }

  const typeColors = {
    blueprint: 'from-blue-500 to-cyan-500',
    contract: 'from-purple-500 to-pink-500',
    coder_pack: 'from-green-500 to-emerald-500',
  }

  return (
    <div className={cn('bg-white/5 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b border-white/10',
          collapsible && 'cursor-pointer hover:bg-white/5'
        )}
        onClick={() => collapsible && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white',
              typeColors[artifact.type]
            )}
          >
            {typeLabels[artifact.type]}
          </div>
          <div>
            <h3 className="font-medium">{artifact.title}</h3>
            <p className="text-xs text-gray-400">
              Version {artifact.version} • {artifact.status}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!collapsible && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
          {collapsible && (
            expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )
          )}
        </div>
      </div>

      {/* Content */}
      {(!collapsible || expanded) && (
        <div className="p-4">
          {collapsible && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          <div className="prose prose-invert prose-sm max-w-none">
            <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap">
              {artifact.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
