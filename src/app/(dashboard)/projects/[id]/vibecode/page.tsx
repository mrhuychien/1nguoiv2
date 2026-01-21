'use client'

import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'
import { VibeCodeWizard } from '@/components/vibecode'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VibeCodePage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading } = useUser()

  const projectId = params.id as string

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Vibecode Kit
          </h1>
          <p className="text-xs text-gray-400">
            AI-powered product design wizard
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div className="flex-1 overflow-hidden">
        <VibeCodeWizard projectId={projectId} userId={user.id} />
      </div>
    </div>
  )
}
