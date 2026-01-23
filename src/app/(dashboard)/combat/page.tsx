'use client'

import { useEffect, useState } from 'react'
import { useCombatStore } from '@/lib/stores/combat-store'
import { CombatRoom } from '@/components/combat/combat-room'
import { CreateSessionDialog } from '@/components/combat/create-session-dialog'
import { SessionList } from '@/components/combat/session-list'
import { Button } from '@/components/ui/button'
import { Plus, Swords } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { ProFeatureGate } from '@/components/ui/upgrade-prompt'

export default function CombatPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { session, sessions, isLoading, loadSessions } = useCombatStore()
  const { isPro, isLoading: subscriptionLoading } = useSubscription()

  useEffect(() => {
    if (isPro) {
      loadSessions()
    }
  }, [loadSessions, isPro])

  return (
    <ProFeatureGate
      isPro={isPro}
      isLoading={subscriptionLoading}
      feature="Combat Pro"
      description="Chat với 4 AI mạnh nhất: GPT-4, Claude, Gemini, Grok. Phân tích vấn đề từ nhiều góc nhìn khác nhau."
    >
      {/* If we have an active session, show the combat room */}
      {session ? (
        <CombatRoom />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                  <Swords className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Combat Pro
                </h1>
              </div>
              <p className="text-slate-400 max-w-lg mx-auto">
                Phòng họp AI - Điều phối cuộc thảo luận giữa 4 AI với những góc nhìn khác nhau
              </p>
            </div>

            {/* Create new session */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo phòng họp mới
              </Button>
            </div>

            {/* Session list */}
            <SessionList sessions={sessions} isLoading={isLoading} />

            {/* Create dialog */}
            <CreateSessionDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
            />
          </div>
        </div>
      )}
    </ProFeatureGate>
  )
}
