'use client'

import { useState } from 'react'
import { useCombatFreeStore } from '@/lib/stores/combatfree-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MessageSquare, Trash2, X, CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CombatFreeSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CombatFreeSidebar({ isOpen, onClose }: CombatFreeSidebarProps) {
  const [showNewSession, setShowNewSession] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTopic, setNewTopic] = useState('')

  const {
    sessions,
    currentSessionId,
    createSession,
    loadSession,
    endSession,
    deleteSession,
  } = useCombatFreeStore()

  const handleCreateSession = () => {
    if (!newTitle.trim()) return
    createSession(newTitle.trim(), newTopic.trim() || undefined)
    setNewTitle('')
    setNewTopic('')
    setShowNewSession(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      {/* Backdrop for mobile */}
      <div
        className="absolute inset-0 bg-black/50 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="absolute left-0 top-0 h-full w-80 bg-slate-900 border-r border-slate-700/50 flex flex-col md:relative md:w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Cuộc họp</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* New Session Form */}
        {showNewSession ? (
          <div className="p-4 border-b border-slate-700/50 space-y-3">
            <Input
              placeholder="Tiêu đề cuộc họp *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              autoFocus
            />
            <Input
              placeholder="Chủ đề (tùy chọn)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateSession}
                disabled={!newTitle.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Tạo
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewSession(false)
                  setNewTitle('')
                  setNewTopic('')
                }}
                className="text-slate-400 hover:text-white"
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-slate-700/50">
            <Button
              onClick={() => setShowNewSession(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cuộc họp mới
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có cuộc họp nào</p>
              <p className="text-sm">Tạo cuộc họp mới để bắt đầu</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'p-3 cursor-pointer hover:bg-slate-800/50 transition-colors',
                    currentSessionId === session.id && 'bg-slate-800'
                  )}
                  onClick={() => loadSession(session.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {session.status === 'active' ? (
                          <Circle className="w-3 h-3 text-green-400 fill-green-400 shrink-0" />
                        ) : (
                          <CheckCircle className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <h3 className="font-medium text-white truncate">
                          {session.title}
                        </h3>
                      </div>
                      {session.topic && (
                        <p className="text-sm text-slate-400 truncate mt-1">
                          {session.topic}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{session.messages.length} tin nhắn</span>
                        <span>•</span>
                        <span>{formatDate(session.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {session.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-orange-400"
                          onClick={(e) => {
                            e.stopPropagation()
                            endSession(session.id)
                          }}
                          title="Kết thúc cuộc họp"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-400 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Xóa cuộc họp này?')) {
                            deleteSession(session.id)
                          }
                        }}
                        title="Xóa cuộc họp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/50 text-xs text-slate-500 text-center">
          Lưu trữ tối đa 20 cuộc họp gần nhất
        </div>
      </div>
    </div>
  )
}
