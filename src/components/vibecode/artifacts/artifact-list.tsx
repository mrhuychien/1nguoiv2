'use client'

import { useVibeCodeStore } from '@/lib/stores/vibecode-store'
import { ArtifactViewer } from './artifact-viewer'
import type { ArtifactType } from '@/lib/types/vibecode'
import { cn } from '@/lib/utils'
import { FileText, ScrollText, Package } from 'lucide-react'

interface ArtifactListProps {
  filterType?: ArtifactType
  className?: string
}

export function ArtifactList({ filterType, className }: ArtifactListProps) {
  const { artifacts } = useVibeCodeStore()

  const filteredArtifacts = filterType
    ? artifacts.filter((a) => a.type === filterType && a.status !== 'archived')
    : artifacts.filter((a) => a.status !== 'archived')

  if (filteredArtifacts.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          {filterType === 'blueprint' && <FileText className="w-8 h-8 text-gray-500" />}
          {filterType === 'contract' && <ScrollText className="w-8 h-8 text-gray-500" />}
          {filterType === 'coder_pack' && <Package className="w-8 h-8 text-gray-500" />}
          {!filterType && <FileText className="w-8 h-8 text-gray-500" />}
        </div>
        <p className="text-gray-400">
          {filterType
            ? `Chưa có ${filterType === 'blueprint' ? 'Blueprint' : filterType === 'contract' ? 'Contract' : 'Coder Pack'} nào`
            : 'Chưa có artifact nào'}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {filteredArtifacts.map((artifact) => (
        <ArtifactViewer
          key={artifact.id}
          artifact={artifact}
          collapsible
          defaultExpanded={filteredArtifacts.length === 1}
        />
      ))}
    </div>
  )
}
