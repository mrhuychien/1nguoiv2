# ═══════════════════════════════════════════════════════════════════════════════
#                              🔧 CODER PACK v3
#                         1NGUOI.COM - PHASE 1 MVP
#                  Idea Graph + Project Hub + Time Tracking
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════

---

# STEP 6: IDEA GRAPH

## 6.1 lib/stores/idea-store.ts

```typescript
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Node, Link, Graph } from '@/lib/types/database'

interface IdeaStore {
  graph: Graph | null
  nodes: Node[]
  links: Link[]
  selectedNodeId: string | null
  isLoading: boolean
  loadGraph: (userId: string) => Promise<void>
  addNode: (data: Partial<Node>) => Promise<void>
  updateNode: (id: string, data: Partial<Node>) => Promise<void>
  deleteNode: (id: string) => Promise<void>
  addLink: (source: string, target: string) => Promise<void>
  selectNode: (id: string | null) => void
}

export const useIdeaStore = create<IdeaStore>((set, get) => ({
  graph: null, nodes: [], links: [], selectedNodeId: null, isLoading: false,

  loadGraph: async (userId) => {
    set({ isLoading: true })
    const supabase = createClient()
    let { data: graph } = await supabase.from('graphs').select('*').eq('user_id', userId).single()
    if (!graph) {
      const { data } = await supabase.from('graphs').insert({ user_id: userId, title: 'My Ideas' }).select().single()
      graph = data
    }
    if (graph) {
      const { data: nodes } = await supabase.from('nodes').select('*').eq('graph_id', graph.id)
      const { data: links } = await supabase.from('links').select('*').eq('graph_id', graph.id)
      set({ graph, nodes: nodes || [], links: links || [] })
    }
    set({ isLoading: false })
  },

  addNode: async (data) => {
    const { graph } = get()
    if (!graph) return
    const supabase = createClient()
    const { data: node } = await supabase.from('nodes').insert({
      graph_id: graph.id, title: data.title || 'New Idea', description: data.description || '',
      color: data.color || '#00d4ff', x: data.x || 200, y: data.y || 200, tags: []
    }).select().single()
    if (node) set({ nodes: [...get().nodes, node], selectedNodeId: node.id })
  },

  updateNode: async (id, data) => {
    const supabase = createClient()
    await supabase.from('nodes').update(data).eq('id', id)
    set({ nodes: get().nodes.map(n => n.id === id ? { ...n, ...data } : n) })
  },

  deleteNode: async (id) => {
    const supabase = createClient()
    await supabase.from('links').delete().or(`source_id.eq.${id},target_id.eq.${id}`)
    await supabase.from('nodes').delete().eq('id', id)
    set({
      nodes: get().nodes.filter(n => n.id !== id),
      links: get().links.filter(l => l.source_id !== id && l.target_id !== id),
      selectedNodeId: null
    })
  },

  addLink: async (source, target) => {
    const { graph, links } = get()
    if (!graph || links.some(l => l.source_id === source && l.target_id === target)) return
    const supabase = createClient()
    const { data: link } = await supabase.from('links').insert({ graph_id: graph.id, source_id: source, target_id: target }).select().single()
    if (link) set({ links: [...links, link] })
  },

  selectNode: (id) => set({ selectedNodeId: id }),
}))
```

## 6.2 components/idea-graph/custom-node.tsx

```typescript
'use client'
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { cn } from '@/lib/utils/cn'

export const CustomNode = memo(({ data, selected }: NodeProps<{ title: string; description: string; color: string }>) => (
  <div className={cn('px-4 py-3 rounded-xl border-2 min-w-[150px] max-w-[250px] bg-background-card shadow-lg transition-all', selected ? 'border-white shadow-glow' : 'border-transparent')} style={{ borderColor: selected ? data.color : 'transparent' }}>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white/50" />
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white/50" />
    <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-white/50" />
    <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-white/50" />
    <div className="w-3 h-3 rounded-full absolute -top-1 -right-1" style={{ backgroundColor: data.color }} />
    <h3 className="font-semibold text-foreground text-sm truncate">{data.title}</h3>
    {data.description && <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">{data.description}</p>}
  </div>
))
CustomNode.displayName = 'CustomNode'
```

## 6.3 components/idea-graph/toolbar.tsx

```typescript
'use client'
import { Plus, Trash2, ZoomIn, ZoomOut, Maximize } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface Props { onAdd: () => void; onDelete: () => void; onZoomIn: () => void; onZoomOut: () => void; onFit: () => void; hasSelection: boolean; className?: string }

export function Toolbar({ onAdd, onDelete, onZoomIn, onZoomOut, onFit, hasSelection, className }: Props) {
  return (
    <div className={cn('flex flex-col gap-2 p-2 bg-background-card border border-white/10 rounded-xl', className)}>
      <Button variant="ghost" size="sm" onClick={onAdd} className="!p-2" title="Add (N)"><Plus className="w-5 h-5" /></Button>
      <Button variant="ghost" size="sm" onClick={onDelete} disabled={!hasSelection} className="!p-2" title="Delete"><Trash2 className="w-5 h-5" /></Button>
      <div className="h-px bg-white/10 my-1" />
      <Button variant="ghost" size="sm" onClick={onZoomIn} className="!p-2"><ZoomIn className="w-5 h-5" /></Button>
      <Button variant="ghost" size="sm" onClick={onZoomOut} className="!p-2"><ZoomOut className="w-5 h-5" /></Button>
      <Button variant="ghost" size="sm" onClick={onFit} className="!p-2"><Maximize className="w-5 h-5" /></Button>
    </div>
  )
}
```

## 6.4 components/idea-graph/color-picker.tsx

```typescript
'use client'
import { cn } from '@/lib/utils/cn'

const COLORS = ['#00d4ff', '#a855f7', '#22c55e', '#eab308', '#ef4444', '#ec4899']

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2">
      {COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} className={cn('w-6 h-6 rounded-full transition-all', value === c && 'ring-2 ring-white ring-offset-2 ring-offset-background')} style={{ backgroundColor: c }} />
      ))}
    </div>
  )
}
```

## 6.5 components/idea-graph/node-panel.tsx

```typescript
'use client'
import { useState, useEffect } from 'react'
import { X, Trash2, Rocket } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { ColorPicker } from './color-picker'
import { useIdeaStore } from '@/lib/stores/idea-store'
import type { Node } from '@/lib/types/database'

export function NodePanel({ node, onClose }: { node: Node; onClose: () => void }) {
  const { updateNode, deleteNode } = useIdeaStore()
  const [title, setTitle] = useState(node.title)
  const [desc, setDesc] = useState(node.description || '')
  const [color, setColor] = useState(node.color)

  useEffect(() => { setTitle(node.title); setDesc(node.description || ''); setColor(node.color) }, [node])
  useEffect(() => {
    const t = setTimeout(() => {
      if (title !== node.title || desc !== node.description || color !== node.color)
        updateNode(node.id, { title, description: desc, color })
    }, 500)
    return () => clearTimeout(t)
  }, [title, desc, color])

  return (
    <Card className="w-80 absolute top-4 right-4 z-10">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold text-foreground">Chi tiết Node</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X className="w-5 h-5 text-foreground-secondary" /></button>
      </div>
      <div className="space-y-4">
        <Input label="Tiêu đề" value={title} onChange={e => setTitle(e.target.value)} />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">Mô tả</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-cyan resize-none" />
        </div>
        <div className="space-y-2"><label className="block text-sm font-medium text-foreground">Màu</label><ColorPicker value={color} onChange={setColor} /></div>
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Button variant="secondary" size="sm" className="flex-1"><Rocket className="w-4 h-4 mr-2" />Tạo Project</Button>
          <Button variant="danger" size="sm" onClick={() => { if (confirm('Xóa?')) { deleteNode(node.id); onClose() } }}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
    </Card>
  )
}
```

## 6.6 components/idea-graph/canvas.tsx

```typescript
'use client'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import ReactFlow, { Background, MiniMap, useNodesState, useEdgesState, useReactFlow, ReactFlowProvider, Connection, NodeChange } from 'reactflow'
import 'reactflow/dist/style.css'
import { CustomNode } from './custom-node'
import { Toolbar } from './toolbar'
import { NodePanel } from './node-panel'
import { useIdeaStore } from '@/lib/stores/idea-store'
import { useUser } from '@/lib/hooks/use-user'

const nodeTypes = { custom: CustomNode }

function Canvas() {
  const { user } = useUser()
  const { nodes: sn, links: sl, selectedNodeId, isLoading, loadGraph, addNode, updateNode, deleteNode, addLink, selectNode } = useIdeaStore()
  const rf = useReactFlow()
  const ref = useRef<HTMLDivElement>(null)

  const initNodes = useMemo(() => sn.map(n => ({ id: n.id, type: 'custom', position: { x: n.x, y: n.y }, data: { title: n.title, description: n.description, color: n.color } })), [sn])
  const initEdges = useMemo(() => sl.map(l => ({ id: l.id, source: l.source_id, target: l.target_id, style: { stroke: '#00d4ff', strokeWidth: 2 }, animated: true })), [sl])

  const [nodes, setNodes, onNC] = useNodesState(initNodes)
  const [edges, setEdges, onEC] = useEdgesState(initEdges)

  useEffect(() => { setNodes(initNodes) }, [initNodes])
  useEffect(() => { setEdges(initEdges) }, [initEdges])
  useEffect(() => { if (user?.id) loadGraph(user.id) }, [user?.id])

  const handleNC = useCallback((c: NodeChange[]) => {
    onNC(c)
    c.forEach(ch => { if (ch.type === 'position' && ch.position && !ch.dragging) updateNode(ch.id, { x: ch.position.x, y: ch.position.y }) })
  }, [onNC, updateNode])

  const onConnect = useCallback((c: Connection) => { if (c.source && c.target) addLink(c.source, c.target) }, [addLink])
  const onNodeClick = useCallback((_: any, n: any) => selectNode(n.id), [selectNode])
  const onPaneClick = useCallback(() => selectNode(null), [selectNode])
  const onDblClick = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const b = ref.current.getBoundingClientRect()
    const pos = rf.project({ x: e.clientX - b.left, y: e.clientY - b.top })
    addNode({ x: pos.x, y: pos.y })
  }, [rf, addNode])

  const handleAdd = () => { const v = rf.getViewport(); addNode({ x: -v.x + 400, y: -v.y + 300 }) }
  const handleDel = () => { if (selectedNodeId) deleteNode(selectedNodeId) }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'n') handleAdd()
      if (e.key === 'Delete' || e.key === 'Backspace') handleDel()
      if (e.key === 'f') rf.fitView({ padding: 0.2 })
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [selectedNodeId])

  const sel = sn.find(n => n.id === selectedNodeId)
  if (isLoading) return <div className="w-full h-full flex items-center justify-center text-foreground-secondary">Loading...</div>

  return (
    <div ref={ref} className="w-full h-full relative">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={handleNC} onEdgesChange={onEC} onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick} onDoubleClick={onDblClick} fitView className="bg-background" defaultEdgeOptions={{ style: { stroke: '#00d4ff', strokeWidth: 2 }, animated: true }}>
        <Background color="#333" gap={20} />
        <MiniMap nodeColor={n => n.data?.color || '#00d4ff'} maskColor="rgba(0,0,0,0.8)" className="!bg-background-secondary !border-white/10" />
      </ReactFlow>
      <Toolbar onAdd={handleAdd} onDelete={handleDel} onZoomIn={() => rf.zoomIn()} onZoomOut={() => rf.zoomOut()} onFit={() => rf.fitView({ padding: 0.2 })} hasSelection={!!selectedNodeId} className="absolute top-4 left-4 z-10" />
      {sel && <NodePanel node={sel} onClose={() => selectNode(null)} />}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4 px-4 py-2 bg-background-card border border-white/10 rounded-xl text-sm text-foreground-secondary">
        <span>Nodes: {sn.length}</span><span>Links: {sl.length}</span><span className="text-foreground-muted">Double-click để thêm</span>
      </div>
    </div>
  )
}

export function IdeaGraph() { return <ReactFlowProvider><Canvas /></ReactFlowProvider> }
```

## 6.7 app/(dashboard)/ideas/page.tsx

```typescript
import { Metadata } from 'next'
import { IdeaGraph } from '@/components/idea-graph/canvas'

export const metadata: Metadata = { title: 'Idea Graph - 1nguoi.com' }

export default function IdeasPage() {
  return <div className="h-[calc(100vh-4rem)]"><IdeaGraph /></div>
}
```

---

# STEP 7: PROJECT HUB

## 7.1 lib/stores/project-store.ts

```typescript
import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Project, Task } from '@/lib/types/database'

interface ProjectStore {
  projects: Project[]; tasks: Task[]; dailyTasks: Task[]; isLoading: boolean
  loadProjects: (userId: string) => Promise<void>
  loadTasks: (projectId: string) => Promise<void>
  loadDaily: (userId: string) => Promise<void>
  createProject: (data: Partial<Project>) => Promise<Project | null>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  createTask: (data: Partial<Task>) => Promise<void>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  setDaily: (taskId: string, isDaily: boolean) => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [], tasks: [], dailyTasks: [], isLoading: false,

  loadProjects: async (userId) => {
    set({ isLoading: true })
    const supabase = createClient()
    const { data } = await supabase.from('projects').select('*').eq('user_id', userId).neq('status', 'archived').order('updated_at', { ascending: false })
    set({ projects: data || [], isLoading: false })
  },

  loadTasks: async (projectId) => {
    const supabase = createClient()
    const { data } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('order_index')
    set({ tasks: data || [] })
  },

  loadDaily: async (userId) => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('tasks').select('*, projects(title, color)').eq('is_daily_focus', true).eq('daily_focus_date', today)
    set({ dailyTasks: data || [] })
  },

  createProject: async (data) => {
    const supabase = createClient()
    if (data.status === 'focus') await supabase.from('projects').update({ status: 'active' }).eq('user_id', data.user_id).eq('status', 'focus')
    const { data: p, error } = await supabase.from('projects').insert(data).select().single()
    if (p && !error) set({ projects: [p, ...get().projects] })
    return p || null
  },

  updateProject: async (id, data) => {
    const supabase = createClient()
    await supabase.from('projects').update(data).eq('id', id)
    set({ projects: get().projects.map(p => p.id === id ? { ...p, ...data } : p) })
  },

  deleteProject: async (id) => {
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    set({ projects: get().projects.filter(p => p.id !== id) })
  },

  createTask: async (data) => {
    const supabase = createClient()
    const { data: t } = await supabase.from('tasks').insert(data).select().single()
    if (t) set({ tasks: [...get().tasks, t] })
  },

  updateTask: async (id, data) => {
    const supabase = createClient()
    await supabase.from('tasks').update(data).eq('id', id)
    set({ tasks: get().tasks.map(t => t.id === id ? { ...t, ...data } : t), dailyTasks: get().dailyTasks.map(t => t.id === id ? { ...t, ...data } : t) })
  },

  deleteTask: async (id) => {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', id)
    set({ tasks: get().tasks.filter(t => t.id !== id), dailyTasks: get().dailyTasks.filter(t => t.id !== id) })
  },

  toggleTask: async (id) => {
    const t = get().tasks.find(x => x.id === id) || get().dailyTasks.find(x => x.id === id)
    if (!t) return
    await get().updateTask(id, { done: !t.done, done_at: !t.done ? new Date().toISOString() : null })
  },

  setDaily: async (taskId, isDaily) => {
    if (isDaily && get().dailyTasks.length >= 3) { alert('Max 3 daily tasks!'); return }
    const today = new Date().toISOString().split('T')[0]
    await get().updateTask(taskId, { is_daily_focus: isDaily, daily_focus_date: isDaily ? today : null })
  },
}))
```

## 7.2 components/layout/dashboard-sidebar.tsx

```typescript
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Lightbulb, Settings, LogOut } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { cn } from '@/lib/utils/cn'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/ideas', icon: Lightbulb, label: 'Idea Graph' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function DashboardSidebar() {
  const path = usePathname()
  const { signOut } = useUser()

  return (
    <aside className="w-64 bg-background-secondary border-r border-white/10 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center"><span className="text-white font-bold">1</span></div>
          <span className="text-xl font-bold text-foreground">nguoi</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(i => (
          <Link key={i.href} href={i.href} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl transition-colors', path === i.href ? 'bg-cyan/20 text-cyan' : 'text-foreground-secondary hover:bg-white/5')}>
            <i.icon className="w-5 h-5" /><span>{i.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-foreground-secondary hover:bg-white/5"><LogOut className="w-5 h-5" /><span>Đăng xuất</span></button>
      </div>
    </aside>
  )
}
```

## 7.3 components/layout/dashboard-navbar.tsx

```typescript
'use client'
import { Bell, Search } from 'lucide-react'
import { useUser } from '@/lib/hooks/use-user'
import { TimerMini } from '@/components/project-hub/timer-mini'

export function DashboardNavbar() {
  const { profile } = useUser()
  return (
    <header className="h-16 bg-background-secondary border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 w-80">
        <Search className="w-5 h-5 text-foreground-muted" />
        <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-foreground placeholder:text-foreground-muted w-full" />
      </div>
      <div className="flex items-center gap-4">
        <TimerMini />
        <button className="p-2 hover:bg-white/10 rounded-lg relative"><Bell className="w-5 h-5 text-foreground-secondary" /><span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" /></button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center"><span className="text-white font-semibold text-sm">{profile?.full_name?.charAt(0) || 'U'}</span></div>
          <span className="text-foreground font-medium hidden md:block">{profile?.full_name?.split(' ').pop() || 'User'}</span>
        </div>
      </div>
    </header>
  )
}
```

## 7.4 components/project-hub/dashboard-header.tsx

```typescript
'use client'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useUser } from '@/lib/hooks/use-user'

export function DashboardHeader({ totalTime = 0 }: { totalTime?: number }) {
  const { profile } = useUser()
  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-foreground mb-2">👋 Chào {profile?.full_name?.split(' ').pop() || 'bạn'}!</h1>
      <div className="flex items-center gap-6 text-foreground-secondary">
        <span>📅 {format(new Date(), "EEEE, dd/MM/yyyy", { locale: vi })}</span>
        <span>⏱️ Hôm nay: {fmt(totalTime)}</span>
      </div>
    </div>
  )
}
```

## 7.5 components/project-hub/focus-project.tsx

```typescript
'use client'
import Link from 'next/link'
import { Play, Pause } from 'lucide-react'
import { Card, Progress, Badge, Button } from '@/components/ui'
import { useTimerStore } from '@/lib/stores/timer-store'
import type { Project, Task } from '@/lib/types/database'

const hl = { on_track: '🟢 On Track', at_risk: '🟡 At Risk', blocked: '🔴 Blocked' }
const hc = { on_track: 'success', at_risk: 'warning', blocked: 'danger' } as const

export function FocusProject({ project, nextTask }: { project: Project; nextTask?: Task }) {
  const { isRunning, currentProjectId, startTimer, pauseTimer } = useTimerStore()
  const isCurrent = currentProjectId === project.id
  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">🔥 FOCUS PROJECT</h2>
      <Card className="border-cyan/30 bg-gradient-to-br from-cyan/5 to-purple/5">
        <div className="flex justify-between mb-4">
          <Link href={`/projects/${project.id}`}><h3 className="text-xl font-bold text-foreground hover:text-cyan">📘 {project.title}</h3></Link>
          <Badge variant={hc[project.health]}>{hl[project.health]}</Badge>
        </div>
        {project.description && <p className="text-foreground-secondary mb-4">{project.description}</p>}
        <div className="mb-4"><div className="flex justify-between text-sm mb-2"><span className="text-foreground-secondary">Progress</span><span className="text-foreground">{project.progress}%</span></div><Progress value={project.progress} /></div>
        <div className="border-t border-white/10 pt-4 mb-4"><p className="text-sm text-foreground-secondary mb-2">📋 Next:</p>{nextTask ? <p className="text-foreground">□ {nextTask.title}</p> : <p className="text-foreground-muted italic">No tasks</p>}</div>
        <div className="flex justify-between pt-4 border-t border-white/10">
          <span className="text-foreground-secondary">⏱️ {fmt(project.time_spent)}</span>
          <Button variant={isRunning && isCurrent ? 'secondary' : 'primary'} size="sm" onClick={() => isRunning && isCurrent ? pauseTimer() : startTimer(project.id, nextTask?.id)}>
            {isRunning && isCurrent ? <><Pause className="w-4 h-4 mr-2" />Pause</> : <><Play className="w-4 h-4 mr-2" />Start</>}
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

## 7.6 components/project-hub/project-card.tsx

```typescript
'use client'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { Card, Progress, Button } from '@/components/ui'
import { useTimerStore } from '@/lib/stores/timer-store'
import type { Project } from '@/lib/types/database'

const hc = { on_track: '🟢', at_risk: '🟡', blocked: '🔴' }

export function ProjectCard({ project }: { project: Project }) {
  const { startTimer } = useTimerStore()
  const fmt = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  return (
    <Card className="hover:scale-[1.02] transition-transform">
      <div className="flex justify-between mb-3"><Link href={`/projects/${project.id}`}><h3 className="font-semibold text-foreground hover:text-cyan truncate">{project.title}</h3></Link><span>{hc[project.health]}</span></div>
      <div className="mb-3"><div className="flex justify-between text-xs mb-1"><span className="text-foreground-muted">Progress</span><span className="text-foreground-secondary">{project.progress}%</span></div><Progress value={project.progress} size="sm" /></div>
      <p className="text-sm text-foreground-secondary mb-4 truncate">Next: {project.current_phase || 'No phase'}</p>
      <div className="flex justify-between"><span className="text-xs text-foreground-muted">⏱️ {fmt(project.time_spent)}</span><Button variant="ghost" size="sm" onClick={() => startTimer(project.id)} className="!p-2"><Play className="w-4 h-4" /></Button></div>
    </Card>
  )
}
```

## 7.7 components/project-hub/project-grid.tsx

```typescript
'use client'
import { Plus } from 'lucide-react'
import { ProjectCard } from './project-card'
import { Card, Button } from '@/components/ui'
import type { Project } from '@/lib/types/database'

export function ProjectGrid({ projects, onNew }: { projects: Project[]; onNew: () => void }) {
  const active = projects.filter(p => p.status === 'active')
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-4"><h2 className="text-lg font-semibold text-foreground">⚡ ACTIVE ({active.length}/3)</h2><Button variant="secondary" size="sm" onClick={onNew}><Plus className="w-4 h-4 mr-2" />New</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map(p => <ProjectCard key={p.id} project={p} />)}
        {active.length < 3 && <Card className="flex items-center justify-center min-h-[180px] border-dashed cursor-pointer hover:bg-white/5" onClick={onNew}><div className="text-center"><Plus className="w-8 h-8 text-foreground-muted mx-auto mb-2" /><p className="text-foreground-muted">Add</p></div></Card>}
      </div>
    </div>
  )
}
```

## 7.8 components/project-hub/daily-focus.tsx

```typescript
'use client'
import { Check } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { useProjectStore } from '@/lib/stores/project-store'
import { cn } from '@/lib/utils/cn'
import type { Task } from '@/lib/types/database'

export function DailyFocus({ tasks }: { tasks: (Task & { projects?: { title: string } })[] }) {
  const { toggleTask } = useProjectStore()
  const done = tasks.filter(t => t.done).length
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">📋 DAILY FOCUS</h2>
      <Card>
        {tasks.length === 0 ? <p className="text-foreground-muted text-center py-4">Chưa chọn tasks</p> : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={t.id} className={cn('flex items-center gap-3 p-3 rounded-xl', t.done ? 'bg-success/10' : 'hover:bg-white/5')}>
                <button onClick={() => toggleTask(t.id)} className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center', t.done ? 'bg-success border-success' : 'border-foreground-muted hover:border-cyan')}>{t.done && <Check className="w-4 h-4 text-white" />}</button>
                <span className="text-foreground-muted w-6">{i + 1}.</span>
                <span className={cn('flex-1', t.done ? 'text-foreground-muted line-through' : 'text-foreground')}>{t.title}</span>
                {t.projects && <Badge variant="cyan" size="sm">{t.projects.title}</Badge>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-white/10"><p className="text-foreground-secondary">✅ Done: {done}/{tasks.length}</p></div>
      </Card>
    </div>
  )
}
```

## 7.9 components/project-hub/new-project-modal.tsx

```typescript
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, Button, Input } from '@/components/ui'
import { ColorPicker } from '@/components/idea-graph/color-picker'
import { useProjectStore } from '@/lib/stores/project-store'
import { useUser } from '@/lib/hooks/use-user'

const schema = z.object({ title: z.string().min(1), description: z.string().optional(), status: z.enum(['focus', 'active', 'backlog']), deadline: z.string().optional() })
type Form = z.infer<typeof schema>

export function NewProjectModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useUser()
  const { createProject } = useProjectStore()
  const [color, setColor] = useState('#00d4ff')
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { status: 'active' } })

  const onSubmit = async (data: Form) => {
    if (!user?.id) return
    setLoading(true)
    await createProject({ user_id: user.id, title: data.title, description: data.description || null, color, status: data.status, deadline: data.deadline || null })
    reset(); setColor('#00d4ff'); onOpenChange(false); setLoading(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="🚀 Tạo Project">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Tên *" error={errors.title?.message} {...register('title')} />
        <div><label className="block text-sm font-medium text-foreground">Mô tả</label><textarea {...register('description')} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-cyan resize-none" /></div>
        <div><label className="block text-sm font-medium text-foreground mb-2">Màu</label><ColorPicker value={color} onChange={setColor} /></div>
        <div><label className="block text-sm font-medium text-foreground mb-2">Status</label>
          <div className="space-y-2">{[['focus', '🔥 Focus'], ['active', '⚡ Active'], ['backlog', '📦 Backlog']].map(([v, l]) => <label key={v} className="flex items-center gap-3 cursor-pointer"><input type="radio" value={v} {...register('status')} className="w-4 h-4 text-cyan" /><span className="text-foreground">{l}</span></label>)}</div>
        </div>
        <Input label="Deadline" type="date" {...register('deadline')} />
        <div className="flex gap-3 pt-4"><Button type="button" variant="secondary" className="flex-1" onClick={() => onOpenChange(false)}>Hủy</Button><Button type="submit" className="flex-1" isLoading={loading}>Tạo</Button></div>
      </form>
    </Modal>
  )
}
```

## 7.10 app/(dashboard)/layout.tsx

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardNavbar } from '@/components/layout/dashboard-navbar'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col"><DashboardNavbar /><main className="flex-1 p-6 overflow-auto">{children}</main></div>
    </div>
  )
}
```

## 7.11 app/(dashboard)/dashboard/page.tsx

```typescript
'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/lib/hooks/use-user'
import { useProjectStore } from '@/lib/stores/project-store'
import { useTimerStore } from '@/lib/stores/timer-store'
import { DashboardHeader, FocusProject, ProjectGrid, DailyFocus, NewProjectModal } from '@/components/project-hub'

export default function DashboardPage() {
  const { user } = useUser()
  const { projects, dailyTasks, loadProjects, loadDaily } = useProjectStore()
  const { totalTimeToday } = useTimerStore()
  const [showNew, setShowNew] = useState(false)

  useEffect(() => { if (user?.id) { loadProjects(user.id); loadDaily(user.id) } }, [user?.id])

  const focus = projects.find(p => p.status === 'focus')
  return (
    <div>
      <DashboardHeader totalTime={totalTimeToday} />
      {focus && <FocusProject project={focus} />}
      <ProjectGrid projects={projects} onNew={() => setShowNew(true)} />
      <DailyFocus tasks={dailyTasks} />
      <NewProjectModal open={showNew} onOpenChange={setShowNew} />
    </div>
  )
}
```

---

# STEP 8: TIME TRACKING

## 8.1 lib/stores/timer-store.ts

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

interface TimerStore {
  isRunning: boolean; currentProjectId: string | null; currentTaskId: string | null; startedAt: number | null; elapsedSeconds: number; totalTimeToday: number
  startTimer: (projectId: string, taskId?: string) => void
  pauseTimer: () => void
  stopTimer: () => Promise<void>
  tick: () => void
  loadTodayTotal: (userId: string) => Promise<void>
}

export const useTimerStore = create<TimerStore>()(persist((set, get) => ({
  isRunning: false, currentProjectId: null, currentTaskId: null, startedAt: null, elapsedSeconds: 0, totalTimeToday: 0,

  startTimer: (projectId, taskId) => set({ isRunning: true, currentProjectId: projectId, currentTaskId: taskId || null, startedAt: Date.now() }),

  pauseTimer: () => {
    const { startedAt, elapsedSeconds } = get()
    if (startedAt) set({ isRunning: false, elapsedSeconds: elapsedSeconds + Math.floor((Date.now() - startedAt) / 1000), startedAt: null })
  },

  stopTimer: async () => {
    const { currentProjectId, currentTaskId, startedAt, elapsedSeconds } = get()
    if (!currentProjectId) return
    let total = elapsedSeconds
    if (startedAt) total += Math.floor((Date.now() - startedAt) / 1000)
    if (total < 60) { set({ isRunning: false, currentProjectId: null, currentTaskId: null, startedAt: null, elapsedSeconds: 0 }); return }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const now = new Date()
      await supabase.from('time_entries').insert({ user_id: user.id, project_id: currentProjectId, task_id: currentTaskId, duration: total, started_at: new Date(now.getTime() - total * 1000).toISOString(), ended_at: now.toISOString() })
      set({ totalTimeToday: get().totalTimeToday + total })
    }
    set({ isRunning: false, currentProjectId: null, currentTaskId: null, startedAt: null, elapsedSeconds: 0 })
  },

  tick: () => { if (get().isRunning && get().startedAt) set({}) },

  loadTodayTotal: async (userId) => {
    const supabase = createClient()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const { data } = await supabase.from('time_entries').select('duration').eq('user_id', userId).gte('started_at', today.toISOString())
    set({ totalTimeToday: data?.reduce((s, e) => s + e.duration, 0) || 0 })
  },
}), { name: '1nguoi-timer', partialize: (s) => ({ isRunning: s.isRunning, currentProjectId: s.currentProjectId, currentTaskId: s.currentTaskId, startedAt: s.startedAt, elapsedSeconds: s.elapsedSeconds }) }))
```

## 8.2 components/project-hub/timer-mini.tsx

```typescript
'use client'
import { useEffect } from 'react'
import { Play, Pause, Square } from 'lucide-react'
import { useTimerStore } from '@/lib/stores/timer-store'
import { useProjectStore } from '@/lib/stores/project-store'
import { cn } from '@/lib/utils/cn'

export function TimerMini() {
  const { isRunning, currentProjectId, startedAt, elapsedSeconds, pauseTimer, stopTimer, tick } = useTimerStore()
  const { projects } = useProjectStore()

  useEffect(() => { if (!isRunning) return; const i = setInterval(tick, 1000); return () => clearInterval(i) }, [isRunning, tick])

  if (!currentProjectId) return null

  const project = projects.find(p => p.id === currentProjectId)
  let t = elapsedSeconds
  if (isRunning && startedAt) t += Math.floor((Date.now() - startedAt) / 1000)
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60
  const fmt = h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-background-card border border-white/10 rounded-xl">
      <div className={cn('font-mono text-lg', isRunning ? 'text-cyan' : 'text-foreground')}>{fmt}</div>
      <div className="hidden md:block text-sm text-foreground-secondary max-w-[150px] truncate">{project?.title}</div>
      <div className="flex items-center gap-1">
        {isRunning ? <button onClick={pauseTimer} className="p-1.5 hover:bg-white/10 rounded-lg"><Pause className="w-4 h-4 text-foreground" /></button> : <button onClick={() => useTimerStore.setState({ isRunning: true, startedAt: Date.now() })} className="p-1.5 hover:bg-white/10 rounded-lg"><Play className="w-4 h-4 text-foreground" /></button>}
        <button onClick={stopTimer} className="p-1.5 hover:bg-white/10 rounded-lg"><Square className="w-4 h-4 text-foreground" /></button>
      </div>
    </div>
  )
}
```

## 8.3 lib/stores/index.ts

```typescript
export * from './idea-store'
export * from './project-store'
export * from './timer-store'
```

## 8.4 components/idea-graph/index.ts

```typescript
export * from './canvas'
export * from './custom-node'
export * from './toolbar'
export * from './node-panel'
export * from './color-picker'
```

## 8.5 components/project-hub/index.ts

```typescript
export * from './dashboard-header'
export * from './focus-project'
export * from './project-card'
export * from './project-grid'
export * from './daily-focus'
export * from './new-project-modal'
export * from './timer-mini'
```

## 8.6 components/layout/index.ts

```typescript
export * from './dashboard-sidebar'
export * from './dashboard-navbar'
```

---

# ✅ CODER PACK V3 COMPLETE

## Summary

| Step | Deliverable | Files |
|------|-------------|-------|
| 6 | Idea Graph | idea-store, canvas, custom-node, toolbar, node-panel, color-picker |
| 7 | Project Hub | project-store, dashboard-header, focus-project, project-card, project-grid, daily-focus, new-project-modal |
| 8 | Time Tracking | timer-store, timer-mini |
| - | Layout | dashboard-sidebar, dashboard-navbar |
| - | Pages | dashboard/page, ideas/page, layout |

## Total: ~25 files trong v3

---

# 🎉 PHASE 1 MVP COMPLETE!

**Tất cả 3 Coder Packs:**
- v1: Setup, UI, Supabase, Landing (partial)
- v2: Landing (complete), Auth
- v3: Idea Graph, Project Hub, Time Tracking

**Next Steps:**
1. Copy vào Claude Code / Cursor
2. Setup Supabase
3. `npm install && npm run dev`
4. Test tất cả features

---

# END OF CODER PACK v3
