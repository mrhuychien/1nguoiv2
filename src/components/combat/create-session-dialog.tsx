'use client'

import { useState } from 'react'
import { useCombatStore } from '@/lib/stores/combat-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface CreateSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  projectId,
}: CreateSessionDialogProps) {
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const { createSession, isLoading } = useCombatStore()

  const handleCreate = async () => {
    if (!title.trim()) return

    const session = await createSession(title.trim(), topic.trim() || undefined, projectId)
    if (session) {
      setTitle('')
      setTopic('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Tạo phòng họp mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Tên phòng họp *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thảo luận chiến lược marketing Q1"
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="text-slate-300">
              Chủ đề (tùy chọn)
            </Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Mô tả ngắn về chủ đề cần thảo luận..."
              className="bg-slate-800 border-slate-700 text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isLoading}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo phòng họp'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
