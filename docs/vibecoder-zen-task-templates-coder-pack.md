# ═══════════════════════════════════════════════════════════════════════════════
#                     🔧 CODER PACK - TASK TEMPLATES
#                          Vibecoder Zen Dashboard
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  Tính năng:
#  • 7 Project Templates (Web App, Landing Page, API, Mobile, Content, AI, Blank)
#  • Auto-generate tasks khi tạo project
#  • Task progress tracking
#  • Zone-based task organization (DESIGNING / BUILDING)
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# STEP 1: TYPES

## 1.1 File: lib/types/zen.ts (UPDATED - thêm vào file cũ)

```typescript
// ============================================
// THÊM VÀO FILE lib/types/zen.ts HIỆN TẠI
// ============================================

export type TemplateId = 
  | 'web-app' 
  | 'landing-page' 
  | 'api-service' 
  | 'mobile-app' 
  | 'content-project' 
  | 'ai-automation' 
  | 'blank'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface TaskTemplate {
  id: string
  phase: number
  title: string
  emoji: string
  zone: ZoneType
  estimatedMinutes: number
}

export interface ProjectTemplate {
  id: TemplateId
  name: string
  emoji: string
  description: string
  tasks: TaskTemplate[]
}

export interface ProjectTask {
  id: string
  projectId: string
  phase: number
  title: string
  emoji: string
  zone: ZoneType
  estimatedMinutes: number
  status: TaskStatus
  completedAt: string | null
  timeSpentMinutes: number
  notes: string
}

// Update ZenProject interface
export interface ZenProject {
  id: string
  title: string
  zone: ZoneType
  templateId: TemplateId
  aiStatus?: string
  aiWorkers?: number
  suggestedDuration: number
  health: ProjectHealth
  createdAt: string
  // NEW
  currentPhase: number
  totalTasks: number
  completedTasks: number
}
```

---

# STEP 2: TEMPLATE DATA

## 2.1 File: lib/data/project-templates.ts

```typescript
import type { ProjectTemplate, TaskTemplate } from '@/lib/types/zen'

// ============================================
// WEB APP / SAAS TEMPLATE
// ============================================
const webAppTasks: TaskTemplate[] = [
  { id: 'wa-1', phase: 1, title: 'Nghiên cứu & Xác định vấn đề', emoji: '🔍', zone: 'designing', estimatedMinutes: 90 },
  { id: 'wa-2', phase: 2, title: 'Liệt kê tính năng chính (Tối đa 3)', emoji: '📝', zone: 'designing', estimatedMinutes: 60 },
  { id: 'wa-3', phase: 3, title: 'Vẽ wireframe các màn hình chính', emoji: '🎨', zone: 'designing', estimatedMinutes: 90 },
  { id: 'wa-4', phase: 4, title: 'Khởi tạo dự án & Tech Stack', emoji: '⚙️', zone: 'building', estimatedMinutes: 60 },
  { id: 'wa-5', phase: 5, title: 'Thiết kế cấu trúc Database', emoji: '🗄️', zone: 'building', estimatedMinutes: 60 },
  { id: 'wa-6', phase: 6, title: 'Xây dựng Auth & Hệ thống User', emoji: '🔐', zone: 'building', estimatedMinutes: 120 },
  { id: 'wa-7', phase: 7, title: 'Xây dựng Tính năng #1 (Core)', emoji: '⭐', zone: 'building', estimatedMinutes: 120 },
  { id: 'wa-8', phase: 8, title: 'Xây dựng Tính năng #2', emoji: '⭐', zone: 'building', estimatedMinutes: 120 },
  { id: 'wa-9', phase: 9, title: 'Xây dựng Tính năng #3', emoji: '⭐', zone: 'building', estimatedMinutes: 120 },
  { id: 'wa-10', phase: 10, title: 'Hoàn thiện UI & UX', emoji: '🎨', zone: 'building', estimatedMinutes: 90 },
  { id: 'wa-11', phase: 11, title: 'Test & Sửa lỗi', emoji: '🧪', zone: 'building', estimatedMinutes: 60 },
  { id: 'wa-12', phase: 12, title: 'Triển khai MVP', emoji: '🚀', zone: 'building', estimatedMinutes: 60 },
]

// ============================================
// LANDING PAGE TEMPLATE
// ============================================
const landingPageTasks: TaskTemplate[] = [
  { id: 'lp-1', phase: 1, title: 'Xác định Mục tiêu & CTA', emoji: '🎯', zone: 'designing', estimatedMinutes: 45 },
  { id: 'lp-2', phase: 2, title: 'Viết nội dung & Tiêu đề', emoji: '📝', zone: 'designing', estimatedMinutes: 60 },
  { id: 'lp-3', phase: 3, title: 'Thiết kế Layout & Sections', emoji: '🎨', zone: 'designing', estimatedMinutes: 90 },
  { id: 'lp-4', phase: 4, title: 'Khởi tạo dự án', emoji: '⚙️', zone: 'building', estimatedMinutes: 30 },
  { id: 'lp-5', phase: 5, title: 'Xây dựng phần Hero', emoji: '🏗️', zone: 'building', estimatedMinutes: 60 },
  { id: 'lp-6', phase: 6, title: 'Xây dựng phần Tính năng/Lợi ích', emoji: '🏗️', zone: 'building', estimatedMinutes: 60 },
  { id: 'lp-7', phase: 7, title: 'Xây dựng phần Social Proof', emoji: '🏗️', zone: 'building', estimatedMinutes: 45 },
  { id: 'lp-8', phase: 8, title: 'Xây dựng CTA & Footer', emoji: '🏗️', zone: 'building', estimatedMinutes: 45 },
  { id: 'lp-9', phase: 9, title: 'Tối ưu Mobile Responsive', emoji: '📱', zone: 'building', estimatedMinutes: 60 },
  { id: 'lp-10', phase: 10, title: 'Triển khai & Cài Analytics', emoji: '🚀', zone: 'building', estimatedMinutes: 30 },
]

// ============================================
// API / BACKEND SERVICE TEMPLATE
// ============================================
const apiServiceTasks: TaskTemplate[] = [
  { id: 'api-1', phase: 1, title: 'Định nghĩa Endpoints & Luồng dữ liệu', emoji: '📋', zone: 'designing', estimatedMinutes: 60 },
  { id: 'api-2', phase: 2, title: 'Thiết kế Data Models', emoji: '📊', zone: 'designing', estimatedMinutes: 60 },
  { id: 'api-3', phase: 3, title: 'Khởi tạo dự án & Config', emoji: '⚙️', zone: 'building', estimatedMinutes: 45 },
  { id: 'api-4', phase: 4, title: 'Cài đặt Database', emoji: '🗄️', zone: 'building', estimatedMinutes: 60 },
  { id: 'api-5', phase: 5, title: 'Xây dựng Auth & Middleware', emoji: '🔐', zone: 'building', estimatedMinutes: 90 },
  { id: 'api-6', phase: 6, title: 'Xây dựng CRUD Endpoints', emoji: '🛠️', zone: 'building', estimatedMinutes: 120 },
  { id: 'api-7', phase: 7, title: 'Xây dựng Business Logic', emoji: '🛠️', zone: 'building', estimatedMinutes: 120 },
  { id: 'api-8', phase: 8, title: 'Viết tài liệu API', emoji: '📝', zone: 'building', estimatedMinutes: 45 },
  { id: 'api-9', phase: 9, title: 'Testing & Validation', emoji: '🧪', zone: 'building', estimatedMinutes: 60 },
  { id: 'api-10', phase: 10, title: 'Triển khai & Giám sát', emoji: '🚀', zone: 'building', estimatedMinutes: 45 },
]

// ============================================
// MOBILE APP TEMPLATE
// ============================================
const mobileAppTasks: TaskTemplate[] = [
  { id: 'ma-1', phase: 1, title: 'Định nghĩa User Flow', emoji: '🔍', zone: 'designing', estimatedMinutes: 60 },
  { id: 'ma-2', phase: 2, title: 'Thiết kế các màn hình chính', emoji: '🎨', zone: 'designing', estimatedMinutes: 90 },
  { id: 'ma-3', phase: 3, title: 'Kiến trúc Component', emoji: '📐', zone: 'designing', estimatedMinutes: 45 },
  { id: 'ma-4', phase: 4, title: 'Khởi tạo dự án & Navigation', emoji: '⚙️', zone: 'building', estimatedMinutes: 60 },
  { id: 'ma-5', phase: 5, title: 'Xây dựng Auth Flow', emoji: '🔐', zone: 'building', estimatedMinutes: 90 },
  { id: 'ma-6', phase: 6, title: 'Xây dựng các màn hình chính', emoji: '📱', zone: 'building', estimatedMinutes: 120 },
  { id: 'ma-7', phase: 7, title: 'Tích hợp API', emoji: '🔗', zone: 'building', estimatedMinutes: 90 },
  { id: 'ma-8', phase: 8, title: 'Local Storage & Chế độ Offline', emoji: '💾', zone: 'building', estimatedMinutes: 60 },
  { id: 'ma-9', phase: 9, title: 'Hoàn thiện & Animation', emoji: '✨', zone: 'building', estimatedMinutes: 60 },
  { id: 'ma-10', phase: 10, title: 'Build & Submit lên Store', emoji: '🚀', zone: 'building', estimatedMinutes: 60 },
]

// ============================================
// CONTENT PROJECT TEMPLATE
// ============================================
const contentProjectTasks: TaskTemplate[] = [
  { id: 'cp-1', phase: 1, title: 'Xác định Đối tượng & Mục tiêu', emoji: '🎯', zone: 'designing', estimatedMinutes: 45 },
  { id: 'cp-2', phase: 2, title: 'Tạo Outline nội dung', emoji: '📋', zone: 'designing', estimatedMinutes: 60 },
  { id: 'cp-3', phase: 3, title: 'Nghiên cứu & Thu thập tài liệu', emoji: '🔍', zone: 'designing', estimatedMinutes: 90 },
  { id: 'cp-4', phase: 4, title: 'Viết bản nháp - Phần 1', emoji: '✍️', zone: 'building', estimatedMinutes: 120 },
  { id: 'cp-5', phase: 5, title: 'Viết bản nháp - Phần 2', emoji: '✍️', zone: 'building', estimatedMinutes: 120 },
  { id: 'cp-6', phase: 6, title: 'Viết bản nháp - Phần 3', emoji: '✍️', zone: 'building', estimatedMinutes: 120 },
  { id: 'cp-7', phase: 7, title: 'Chỉnh sửa & Hoàn thiện', emoji: '✏️', zone: 'building', estimatedMinutes: 90 },
  { id: 'cp-8', phase: 8, title: 'Thêm hình ảnh/Media', emoji: '🎨', zone: 'building', estimatedMinutes: 60 },
  { id: 'cp-9', phase: 9, title: 'Review lần cuối', emoji: '📝', zone: 'building', estimatedMinutes: 45 },
  { id: 'cp-10', phase: 10, title: 'Xuất bản & Quảng bá', emoji: '🚀', zone: 'building', estimatedMinutes: 30 },
]

// ============================================
// AI / AUTOMATION TOOL TEMPLATE
// ============================================
const aiAutomationTasks: TaskTemplate[] = [
  { id: 'ai-1', phase: 1, title: 'Xác định Use Case & Input/Output', emoji: '🎯', zone: 'designing', estimatedMinutes: 60 },
  { id: 'ai-2', phase: 2, title: 'Thiết kế Prompt Templates', emoji: '📝', zone: 'designing', estimatedMinutes: 60 },
  { id: 'ai-3', phase: 3, title: 'Vẽ Workflow & Xử lý Edge Cases', emoji: '🔄', zone: 'designing', estimatedMinutes: 45 },
  { id: 'ai-4', phase: 4, title: 'Khởi tạo dự án & API Keys', emoji: '⚙️', zone: 'building', estimatedMinutes: 30 },
  { id: 'ai-5', phase: 5, title: 'Xây dựng Core AI Logic', emoji: '🤖', zone: 'building', estimatedMinutes: 120 },
  { id: 'ai-6', phase: 6, title: 'Xử lý Input', emoji: '🔗', zone: 'building', estimatedMinutes: 60 },
  { id: 'ai-7', phase: 7, title: 'Format Output', emoji: '📤', zone: 'building', estimatedMinutes: 60 },
  { id: 'ai-8', phase: 8, title: 'Xây dựng UI đơn giản', emoji: '🎨', zone: 'building', estimatedMinutes: 90 },
  { id: 'ai-9', phase: 9, title: 'Test & Tối ưu Prompts', emoji: '🧪', zone: 'building', estimatedMinutes: 60 },
  { id: 'ai-10', phase: 10, title: 'Triển khai', emoji: '🚀', zone: 'building', estimatedMinutes: 30 },
]

// ============================================
// ALL TEMPLATES EXPORT
// ============================================
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'web-app',
    name: 'Ứng dụng Web / SaaS',
    emoji: '🌐',
    description: 'Ứng dụng web full-stack với auth, database và các tính năng chính',
    tasks: webAppTasks,
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    emoji: '📄',
    description: 'Trang marketing với hero, tính năng, social proof và CTA',
    tasks: landingPageTasks,
  },
  {
    id: 'api-service',
    name: 'API / Backend',
    emoji: '🔌',
    description: 'REST API với endpoints, auth và tài liệu',
    tasks: apiServiceTasks,
  },
  {
    id: 'mobile-app',
    name: 'Ứng dụng Mobile',
    emoji: '📱',
    description: 'App iOS/Android với navigation, màn hình và tích hợp API',
    tasks: mobileAppTasks,
  },
  {
    id: 'content-project',
    name: 'Dự án Nội dung',
    emoji: '📚',
    description: 'Blog, khóa học, tài liệu hoặc ebook',
    tasks: contentProjectTasks,
  },
  {
    id: 'ai-automation',
    name: 'AI / Tự động hóa',
    emoji: '🤖',
    description: 'AI wrapper, script tự động hoặc chatbot',
    tasks: aiAutomationTasks,
  },
  {
    id: 'blank',
    name: 'Dự án Trống',
    emoji: '✨',
    description: 'Bắt đầu từ đầu, không có tasks sẵn',
    tasks: [],
  },
]

// Helper function to get template by ID
export function getTemplateById(id: TemplateId): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id)
}

// Helper to generate tasks for a project
export function generateTasksFromTemplate(
  projectId: string,
  templateId: TemplateId
): ProjectTask[] {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.tasks.map(t => ({
    id: `${projectId}-${t.id}`,
    projectId,
    phase: t.phase,
    title: t.title,
    emoji: t.emoji,
    zone: t.zone,
    estimatedMinutes: t.estimatedMinutes,
    status: 'pending' as const,
    completedAt: null,
    timeSpentMinutes: 0,
    notes: '',
  }))
}

// Calculate total estimated time
export function getTemplateEstimatedTime(templateId: TemplateId): number {
  const template = getTemplateById(templateId)
  if (!template) return 0
  return template.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
}

// Format minutes to hours
export function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}
```

---

# STEP 3: UPDATED STORE

## 3.1 File: lib/stores/zen-store.ts (UPDATED - thêm task management)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  ZenProject, 
  GardenItem, 
  FocusBlock, 
  TimerState, 
  ZenBellSettings,
  ZoneType,
  ProjectTask,
  TemplateId,
  TaskStatus
} from '@/lib/types/zen'
import { generateTasksFromTemplate, getTemplateById } from '@/lib/data/project-templates'

interface ZenStore {
  // Existing State
  designingProject: ZenProject | null
  buildingProject: ZenProject | null
  gardenItems: GardenItem[]
  focusBlocks: FocusBlock[]
  timer: TimerState
  zenBell: {
    designing: ZenBellSettings
    building: ZenBellSettings
  }
  isDeepWorkMode: boolean
  activeZone: ZoneType | null

  // NEW: Tasks State
  tasks: ProjectTask[]

  // Existing Actions...
  setZoneProject: (zone: ZoneType, project: ZenProject | null) => void
  clearZone: (zone: ZoneType) => void
  addGardenItem: (item: Omit<GardenItem, 'id' | 'createdAt'>) => void
  removeGardenItem: (id: string) => void
  moveToZone: (itemId: string, zone: ZoneType) => void
  setFocusBlocks: (blocks: FocusBlock[]) => void
  setActiveBlock: (blockId: string) => void
  startTimer: (zone: ZoneType, projectId: string, duration: number) => void
  stopTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  tick: () => void
  completeTimer: () => void
  acknowledgeComplete: () => void
  setZenBellVolume: (zone: ZoneType, volume: number) => void
  toggleZenBell: (zone: ZoneType) => void
  enterDeepWork: (zone: ZoneType) => void
  exitDeepWork: () => void

  // NEW: Project Actions with Template
  createProjectWithTemplate: (
    title: string,
    zone: ZoneType,
    templateId: TemplateId
  ) => ZenProject

  // NEW: Task Actions
  getProjectTasks: (projectId: string) => ProjectTask[]
  getCurrentTask: (projectId: string) => ProjectTask | null
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  completeTask: (taskId: string) => void
  skipTask: (taskId: string) => void
  startTask: (taskId: string) => void
  updateTaskNotes: (taskId: string, notes: string) => void
  addTaskTime: (taskId: string, minutes: number) => void
}

// Default focus blocks
const defaultFocusBlocks: FocusBlock[] = [
  { id: '1', startTime: '09:00', endTime: '10:30', label: 'Focus Block 1', linkedZone: 'designing', isActive: false },
  { id: '2', startTime: '14:00', endTime: '16:00', label: 'Focus Block 2', linkedZone: 'building', isActive: true },
]

export const useZenStore = create<ZenStore>()(
  persist(
    (set, get) => ({
      // Initial State
      designingProject: null,
      buildingProject: null,
      gardenItems: [],
      focusBlocks: defaultFocusBlocks,
      timer: {
        isRunning: false,
        zone: null,
        projectId: null,
        remainingSeconds: 0,
        totalSeconds: 0,
        isComplete: false,
      },
      zenBell: {
        designing: { enabled: true, volume: 70 },
        building: { enabled: true, volume: 40 },
      },
      isDeepWorkMode: false,
      activeZone: null,
      tasks: [],

      // ============================================
      // PROJECT ACTIONS
      // ============================================

      setZoneProject: (zone, project) => {
        if (zone === 'designing') {
          set({ designingProject: project })
        } else {
          set({ buildingProject: project })
        }
      },

      clearZone: (zone) => {
        const project = zone === 'designing' 
          ? get().designingProject 
          : get().buildingProject

        // Remove tasks associated with this project
        if (project) {
          set({ 
            tasks: get().tasks.filter(t => t.projectId !== project.id)
          })
        }

        if (zone === 'designing') {
          set({ designingProject: null })
        } else {
          set({ buildingProject: null })
        }
      },

      // NEW: Create project with template
      createProjectWithTemplate: (title, zone, templateId) => {
        const template = getTemplateById(templateId)
        const projectId = crypto.randomUUID()

        // Create project
        const project: ZenProject = {
          id: projectId,
          title,
          zone,
          templateId,
          suggestedDuration: zone === 'designing' ? 90 : 120,
          health: 'on_track',
          createdAt: new Date().toISOString(),
          currentPhase: 1,
          totalTasks: template?.tasks.length || 0,
          completedTasks: 0,
        }

        // Generate tasks from template
        const newTasks = generateTasksFromTemplate(projectId, templateId)

        // Update state
        set({ 
          tasks: [...get().tasks, ...newTasks]
        })

        // Set project to zone
        get().setZoneProject(zone, project)

        return project
      },

      // ============================================
      // GARDEN ACTIONS
      // ============================================

      addGardenItem: (item) => {
        const newItem: GardenItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set({ gardenItems: [...get().gardenItems, newItem] })
      },

      removeGardenItem: (id) => {
        set({ gardenItems: get().gardenItems.filter(i => i.id !== id) })
      },

      moveToZone: (itemId, zone) => {
        const item = get().gardenItems.find(i => i.id === itemId)
        if (!item) return

        const existingProject = zone === 'designing' 
          ? get().designingProject 
          : get().buildingProject
        
        if (existingProject) {
          console.warn('Zone is locked')
          return
        }

        // Create project with blank template
        get().createProjectWithTemplate(item.title, zone, 'blank')
        get().removeGardenItem(itemId)
      },

      // ============================================
      // TASK ACTIONS
      // ============================================

      getProjectTasks: (projectId) => {
        return get().tasks
          .filter(t => t.projectId === projectId)
          .sort((a, b) => a.phase - b.phase)
      },

      getCurrentTask: (projectId) => {
        const tasks = get().getProjectTasks(projectId)
        return tasks.find(t => t.status === 'in_progress') || 
               tasks.find(t => t.status === 'pending') || 
               null
      },

      updateTaskStatus: (taskId, status) => {
        set({
          tasks: get().tasks.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  status,
                  completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt
                } 
              : t
          )
        })

        // Update project progress
        const task = get().tasks.find(t => t.id === taskId)
        if (task) {
          const projectTasks = get().getProjectTasks(task.projectId)
          const completedCount = projectTasks.filter(t => t.status === 'completed').length
          const currentPhase = projectTasks.find(t => t.status === 'in_progress' || t.status === 'pending')?.phase || projectTasks.length

          // Update the project
          const { designingProject, buildingProject } = get()
          if (designingProject?.id === task.projectId) {
            set({
              designingProject: {
                ...designingProject,
                completedTasks: completedCount,
                currentPhase,
              }
            })
          }
          if (buildingProject?.id === task.projectId) {
            set({
              buildingProject: {
                ...buildingProject,
                completedTasks: completedCount,
                currentPhase,
              }
            })
          }
        }
      },

      completeTask: (taskId) => {
        get().updateTaskStatus(taskId, 'completed')
      },

      skipTask: (taskId) => {
        get().updateTaskStatus(taskId, 'skipped')
      },

      startTask: (taskId) => {
        // Set all other in_progress tasks to pending first
        const task = get().tasks.find(t => t.id === taskId)
        if (!task) return

        set({
          tasks: get().tasks.map(t => ({
            ...t,
            status: t.projectId === task.projectId && t.status === 'in_progress' 
              ? 'pending' 
              : t.status
          }))
        })

        get().updateTaskStatus(taskId, 'in_progress')
      },

      updateTaskNotes: (taskId, notes) => {
        set({
          tasks: get().tasks.map(t => 
            t.id === taskId ? { ...t, notes } : t
          )
        })
      },

      addTaskTime: (taskId, minutes) => {
        set({
          tasks: get().tasks.map(t => 
            t.id === taskId 
              ? { ...t, timeSpentMinutes: t.timeSpentMinutes + minutes } 
              : t
          )
        })
      },

      // ============================================
      // FOCUS BLOCK ACTIONS
      // ============================================

      setFocusBlocks: (blocks) => set({ focusBlocks: blocks }),

      setActiveBlock: (blockId) => {
        const blocks = get().focusBlocks.map(b => ({
          ...b,
          isActive: b.id === blockId,
        }))
        set({ focusBlocks: blocks })
      },

      // ============================================
      // TIMER ACTIONS
      // ============================================

      startTimer: (zone, projectId, duration) => {
        const seconds = duration * 60

        // Find and start the current task
        const currentTask = get().getCurrentTask(projectId)
        if (currentTask && currentTask.status === 'pending') {
          get().startTask(currentTask.id)
        }

        set({
          timer: {
            isRunning: true,
            zone,
            projectId,
            remainingSeconds: seconds,
            totalSeconds: seconds,
            isComplete: false,
          },
          isDeepWorkMode: true,
          activeZone: zone,
        })
      },

      stopTimer: () => {
        const { timer } = get()
        
        // Add time spent to current task
        if (timer.projectId) {
          const currentTask = get().getCurrentTask(timer.projectId)
          if (currentTask) {
            const minutesSpent = Math.round((timer.totalSeconds - timer.remainingSeconds) / 60)
            get().addTaskTime(currentTask.id, minutesSpent)
          }
        }

        set({
          timer: {
            isRunning: false,
            zone: null,
            projectId: null,
            remainingSeconds: 0,
            totalSeconds: 0,
            isComplete: false,
          },
          isDeepWorkMode: false,
          activeZone: null,
        })
      },

      pauseTimer: () => {
        set((state) => ({
          timer: { ...state.timer, isRunning: false },
        }))
      },

      resumeTimer: () => {
        set((state) => ({
          timer: { ...state.timer, isRunning: true },
        }))
      },

      tick: () => {
        const { timer } = get()
        if (!timer.isRunning || timer.remainingSeconds <= 0) return

        const newRemaining = timer.remainingSeconds - 1
        
        if (newRemaining <= 0) {
          get().completeTimer()
        } else {
          set({
            timer: { ...timer, remainingSeconds: newRemaining },
          })
        }
      },

      completeTimer: () => {
        const { timer, zenBell } = get()
        
        // Add time to task
        if (timer.projectId) {
          const currentTask = get().getCurrentTask(timer.projectId)
          if (currentTask) {
            const minutesSpent = Math.round(timer.totalSeconds / 60)
            get().addTaskTime(currentTask.id, minutesSpent)
          }
        }

        // Play zen bell
        if (timer.zone && zenBell[timer.zone].enabled) {
          playZenBell(zenBell[timer.zone].volume)
        }

        set({
          timer: { ...timer, isRunning: false, remainingSeconds: 0, isComplete: true },
        })
      },

      acknowledgeComplete: () => {
        set({
          timer: {
            isRunning: false,
            zone: null,
            projectId: null,
            remainingSeconds: 0,
            totalSeconds: 0,
            isComplete: false,
          },
          isDeepWorkMode: false,
          activeZone: null,
        })
      },

      // ============================================
      // ZEN BELL ACTIONS
      // ============================================

      setZenBellVolume: (zone, volume) => {
        set((state) => ({
          zenBell: {
            ...state.zenBell,
            [zone]: { ...state.zenBell[zone], volume },
          },
        }))
      },

      toggleZenBell: (zone) => {
        set((state) => ({
          zenBell: {
            ...state.zenBell,
            [zone]: { ...state.zenBell[zone], enabled: !state.zenBell[zone].enabled },
          },
        }))
      },

      // ============================================
      // DEEP WORK ACTIONS
      // ============================================

      enterDeepWork: (zone) => {
        set({ isDeepWorkMode: true, activeZone: zone })
      },

      exitDeepWork: () => {
        set({ isDeepWorkMode: false, activeZone: null })
      },
    }),
    {
      name: 'vibecoder-zen',
      partialize: (state) => ({
        designingProject: state.designingProject,
        buildingProject: state.buildingProject,
        gardenItems: state.gardenItems,
        focusBlocks: state.focusBlocks,
        zenBell: state.zenBell,
        tasks: state.tasks,
      }),
    }
  )
)

// Zen Bell Sound Player
function playZenBell(volume: number) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 528
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(volume / 100 * 0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 3)
  } catch (e) {
    console.log('Audio not supported')
  }
}
```

---

# STEP 4: UI COMPONENTS

## 4.1 File: components/zen/template-selector.tsx

```typescript
'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PROJECT_TEMPLATES, getTemplateEstimatedTime, formatMinutesToHours } from '@/lib/data/project-templates'
import type { TemplateId } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface TemplateSelectorProps {
  value: TemplateId
  onChange: (templateId: TemplateId) => void
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        📂 Chọn Template
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PROJECT_TEMPLATES.map((template) => {
          const isSelected = value === template.id
          const totalTime = getTemplateEstimatedTime(template.id)
          const taskCount = template.tasks.length

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={cn(
                'relative p-4 rounded-xl border text-left transition-all',
                'hover:scale-[1.02] active:scale-[0.98]',
                isSelected
                  ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/20'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              )}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Emoji */}
              <div className="text-2xl mb-2">{template.emoji}</div>

              {/* Name */}
              <h4 className={cn(
                'font-semibold text-sm',
                isSelected ? 'text-cyan-400' : 'text-white'
              )}>
                {template.name}
              </h4>

              {/* Stats */}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                <span>{taskCount} tasks</span>
                {totalTime > 0 && (
                  <>
                    <span>•</span>
                    <span>~{formatMinutesToHours(totalTime)}</span>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Template Description */}
      {value && (
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">
            {PROJECT_TEMPLATES.find(t => t.id === value)?.description}
          </p>
        </div>
      )}
    </div>
  )
}
```

## 4.2 File: components/zen/template-preview.tsx

```typescript
'use client'

import { getTemplateById, formatMinutesToHours } from '@/lib/data/project-templates'
import type { TemplateId } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface TemplatePreviewProps {
  templateId: TemplateId
  className?: string
}

export function TemplatePreview({ templateId, className }: TemplatePreviewProps) {
  const template = getTemplateById(templateId)
  
  if (!template || template.tasks.length === 0) {
    return (
      <div className={cn('p-4 bg-slate-800/30 rounded-xl border border-slate-700', className)}>
        <p className="text-sm text-slate-500 text-center">Không có tasks định sẵn</p>
      </div>
    )
  }

  const designingTasks = template.tasks.filter(t => t.zone === 'designing')
  const buildingTasks = template.tasks.filter(t => t.zone === 'building')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Designing Phase */}
      {designingTasks.length > 0 && (
        <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
          <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-2">
            🎨 Thiết kế ({designingTasks.length} tasks)
          </h5>
          <div className="space-y-1.5">
            {designingTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-4">{i + 1}.</span>
                <span>{task.emoji}</span>
                <span className="text-slate-300 flex-1 truncate">{task.title}</span>
                <span className="text-slate-600 text-[10px]">
                  {formatMinutesToHours(task.estimatedMinutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Building Phase */}
      {buildingTasks.length > 0 && (
        <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/20">
          <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-2">
            ⚡ Xây dựng ({buildingTasks.length} tasks)
          </h5>
          <div className="space-y-1.5">
            {buildingTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 w-4">{designingTasks.length + i + 1}.</span>
                <span>{task.emoji}</span>
                <span className="text-slate-300 flex-1 truncate">{task.title}</span>
                <span className="text-slate-600 text-[10px]">
                  {formatMinutesToHours(task.estimatedMinutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## 4.3 File: components/zen/task-list.tsx

```typescript
'use client'

import { useState } from 'react'
import { Check, SkipForward, Play, ChevronDown, ChevronUp, Clock, MessageSquare } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import { formatMinutesToHours } from '@/lib/data/project-templates'
import type { ProjectTask } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface TaskListProps {
  projectId: string
  compact?: boolean
}

export function TaskList({ projectId, compact = false }: TaskListProps) {
  const { getProjectTasks, completeTask, skipTask, startTask } = useZenStore()
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  
  const tasks = getProjectTasks(projectId)
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Không có tasks - Đây là dự án trống
      </div>
    )
  }

  if (compact) {
    return <CompactTaskList tasks={tasks} onComplete={completeTask} />
  }

  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {completedCount}/{tasks.length} công việc
          </span>
          <span className="text-xs text-slate-500">({progressPercent}%)</span>
        </div>
        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task Items */}
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index + 1}
            isExpanded={expandedTaskId === task.id}
            onToggleExpand={() => setExpandedTaskId(
              expandedTaskId === task.id ? null : task.id
            )}
            onComplete={() => completeTask(task.id)}
            onSkip={() => skipTask(task.id)}
            onStart={() => startTask(task.id)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// TASK ITEM COMPONENT
// ============================================

interface TaskItemProps {
  task: ProjectTask
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  onComplete: () => void
  onSkip: () => void
  onStart: () => void
}

function TaskItem({ 
  task, 
  index, 
  isExpanded, 
  onToggleExpand,
  onComplete, 
  onSkip, 
  onStart 
}: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  const isSkipped = task.status === 'skipped'
  const isInProgress = task.status === 'in_progress'
  const isPending = task.status === 'pending'

  const zoneColor = task.zone === 'designing' ? 'cyan' : 'purple'

  return (
    <div 
      className={cn(
        'rounded-xl border transition-all',
        isCompleted && 'bg-green-500/5 border-green-500/20 opacity-60',
        isSkipped && 'bg-slate-800/30 border-slate-700 opacity-40',
        isInProgress && `bg-${zoneColor}-500/10 border-${zoneColor}-500/30 ring-2 ring-${zoneColor}-500/20`,
        isPending && 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      )}
    >
      {/* Main Row */}
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Status Icon */}
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0',
          isCompleted && 'bg-green-500/20 text-green-400',
          isSkipped && 'bg-slate-700 text-slate-500',
          isInProgress && `bg-${zoneColor}-500/20 text-${zoneColor}-400`,
          isPending && 'bg-slate-700/50 text-slate-400'
        )}>
          {isCompleted ? <Check className="w-4 h-4" /> : task.emoji}
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-medium',
              isCompleted || isSkipped ? 'line-through text-slate-500' : 'text-white'
            )}>
              {task.title}
            </span>
            {isInProgress && (
              <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase bg-${zoneColor}-500/20 text-${zoneColor}-400 rounded`}>
                Đang làm
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
            <span className={task.zone === 'designing' ? 'text-cyan-500/70' : 'text-purple-500/70'}>
              {task.zone === 'designing' ? '🎨 Thiết kế' : '⚡ Xây dựng'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatMinutesToHours(task.estimatedMinutes)}
            </span>
            {task.timeSpentMinutes > 0 && (
              <span className="text-green-500/70">
                ✓ Đã làm {formatMinutesToHours(task.timeSpentMinutes)}
              </span>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <div className="text-slate-500">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex items-center gap-2 pt-3 border-t border-slate-700/50">
            {isPending && (
              <button
                onClick={(e) => { e.stopPropagation(); onStart(); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-${zoneColor}-500/20 text-${zoneColor}-400 hover:bg-${zoneColor}-500/30 transition-colors`}
              >
                <Play className="w-3 h-3" />
                Bắt đầu
              </button>
            )}
            {(isPending || isInProgress) && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onComplete(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Hoàn thành
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSkip(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                >
                  <SkipForward className="w-3 h-3" />
                  Bỏ qua
                </button>
              </>
            )}
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="mt-3 p-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                <MessageSquare className="w-3 h-3" />
                Ghi chú
              </div>
              <p className="text-xs text-slate-400">{task.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// COMPACT TASK LIST (for sidebar/widget)
// ============================================

interface CompactTaskListProps {
  tasks: ProjectTask[]
  onComplete: (taskId: string) => void
}

function CompactTaskList({ tasks, onComplete }: CompactTaskListProps) {
  const currentTask = tasks.find(t => t.status === 'in_progress') || 
                      tasks.find(t => t.status === 'pending')
  const nextTasks = tasks
    .filter(t => t.status === 'pending' && t.id !== currentTask?.id)
    .slice(0, 2)

  return (
    <div className="space-y-2">
      {/* Current Task */}
      {currentTask && (
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <span>{currentTask.emoji}</span>
            <span className="text-xs text-white flex-1 truncate">{currentTask.title}</span>
            <button
              onClick={() => onComplete(currentTask.id)}
              className="p-1 hover:bg-green-500/20 rounded text-green-400"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Next Tasks */}
      {nextTasks.map(task => (
        <div key={task.id} className="flex items-center gap-2 px-2 py-1.5 text-slate-500">
          <span className="text-xs">{task.emoji}</span>
          <span className="text-[11px] truncate">{task.title}</span>
        </div>
      ))}
    </div>
  )
}
```

## 4.4 File: components/zen/new-project-modal.tsx (UPDATED)

```typescript
'use client'

import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { TemplateSelector } from './template-selector'
import { TemplatePreview } from './template-preview'
import { useZenStore } from '@/lib/stores/zen-store'
import { getTemplateEstimatedTime, formatMinutesToHours } from '@/lib/data/project-templates'
import type { ZoneType, TemplateId } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const { designingProject, buildingProject, createProjectWithTemplate, addGardenItem } = useZenStore()
  
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState('')
  const [templateId, setTemplateId] = useState<TemplateId>('web-app')
  const [destination, setDestination] = useState<ZoneType | 'garden'>('building')
  const [showPreview, setShowPreview] = useState(false)

  const isDesigningAvailable = !designingProject
  const isBuildingAvailable = !buildingProject

  const handleNext = () => {
    if (step === 1 && title.trim()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  const handleSubmit = () => {
    if (!title.trim()) return

    if (destination === 'garden') {
      addGardenItem({ title: title.trim(), category: 'ideas' })
    } else {
      createProjectWithTemplate(title.trim(), destination, templateId)
    }

    // Reset
    setTitle('')
    setTemplateId('web-app')
    setDestination('building')
    setStep(1)
    setShowPreview(false)
    onOpenChange(false)
  }

  const handleClose = () => {
    setTitle('')
    setTemplateId('web-app')
    setDestination('building')
    setStep(1)
    setShowPreview(false)
    onOpenChange(false)
  }

  const totalTime = getTemplateEstimatedTime(templateId)

  return (
    <Modal 
      open={open} 
      onOpenChange={handleClose} 
      title={step === 1 ? '🚀 Dự án mới - Bước 1/2' : '📂 Chọn Template - Bước 2/2'}
    >
      {step === 1 ? (
        // STEP 1: Project Name & Destination
        <div className="space-y-6">
          <Input
            label="Tên dự án *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Wellness Dashboard, E-commerce API..."
            autoFocus
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Đích đến
            </label>

            {/* Building Zone */}
            <button
              type="button"
              onClick={() => isBuildingAvailable && setDestination('building')}
              disabled={!isBuildingAvailable}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                destination === 'building'
                  ? 'border-purple-500 bg-purple-500/10'
                  : isBuildingAvailable
                    ? 'border-slate-700 hover:border-purple-500/50'
                    : 'border-slate-800 opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('font-semibold', destination === 'building' ? 'text-purple-400' : 'text-white')}>
                    ⚡ Vùng Xây dựng
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Phát triển & coding</p>
                </div>
                {!isBuildingAvailable && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">ĐÃ KHÓA</span>
                )}
              </div>
            </button>

            {/* Designing Zone */}
            <button
              type="button"
              onClick={() => isDesigningAvailable && setDestination('designing')}
              disabled={!isDesigningAvailable}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                destination === 'designing'
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : isDesigningAvailable
                    ? 'border-slate-700 hover:border-cyan-500/50'
                    : 'border-slate-800 opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn('font-semibold', destination === 'designing' ? 'text-cyan-400' : 'text-white')}>
                    🎨 Vùng Thiết kế
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Chiến lược & thiết kế</p>
                </div>
                {!isDesigningAvailable && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">ĐÃ KHÓA</span>
                )}
              </div>
            </button>

            {/* Garden */}
            <button
              type="button"
              onClick={() => setDestination('garden')}
              className={cn(
                'w-full p-4 rounded-xl border text-left transition-all',
                destination === 'garden'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-700 hover:border-green-500/50'
              )}
            >
              <p className={cn('font-semibold', destination === 'garden' ? 'text-green-400' : 'text-white')}>
                🌱 Vườn Ý tưởng
              </p>
              <p className="text-xs text-slate-500 mt-1">Lưu lại sau - không có template</p>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
              Hủy
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleNext}
              disabled={!title.trim()}
            >
              {destination === 'garden' ? 'Tạo' : 'Tiếp →'}
            </Button>
          </div>
        </div>
      ) : (
        // STEP 2: Template Selection
        <div className="space-y-6">
          <TemplateSelector value={templateId} onChange={setTemplateId} />

          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-cyan-400 hover:text-cyan-300"
            >
              {showPreview ? '▼ Ẩn xem trước tasks' : '▶ Xem trước tasks'}
            </button>
            {totalTime > 0 && (
              <span className="text-xs text-slate-500">
                Tổng: ~{formatMinutesToHours(totalTime)}
              </span>
            )}
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              <TemplatePreview templateId={templateId} />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleBack}>
              ← Quay lại
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Tạo dự án
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
```

## 4.5 File: components/zen/project-tasks-panel.tsx

```typescript
'use client'

import { X } from 'lucide-react'
import { TaskList } from './task-list'
import { Card } from '@/components/ui'
import { useZenStore } from '@/lib/stores/zen-store'
import type { ZoneType } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface ProjectTasksPanelProps {
  zone: ZoneType
  onClose: () => void
}

export function ProjectTasksPanel({ zone, onClose }: ProjectTasksPanelProps) {
  const { designingProject, buildingProject } = useZenStore()
  const project = zone === 'designing' ? designingProject : buildingProject

  if (!project) return null

  const zoneColor = zone === 'designing' ? 'cyan' : 'purple'

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-50 shadow-2xl">
      {/* Header */}
      <div className={cn(
        'p-4 border-b',
        zone === 'designing' ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-purple-500/20 bg-purple-500/5'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">{project.title}</h3>
            <p className={cn(
              'text-xs mt-1',
              zone === 'designing' ? 'text-cyan-400' : 'text-purple-400'
            )}>
              {zone === 'designing' ? '🎨 Vùng Thiết kế' : '⚡ Vùng Xây dựng'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Tiến độ</span>
            <span className="text-white">
              {project.completedTasks}/{project.totalTasks} công việc
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-500',
                zone === 'designing' ? 'bg-cyan-500' : 'bg-purple-500'
              )}
              style={{ 
                width: project.totalTasks > 0 
                  ? `${(project.completedTasks / project.totalTasks) * 100}%` 
                  : '0%' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
        <TaskList projectId={project.id} />
      </div>
    </div>
  )
}
```

## 4.6 File: components/zen/deep-work-zone.tsx (UPDATED - thêm task info)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Compass, Terminal, Timer, StopCircle, Zap, Lock, ListTodo } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import { TimerRing } from './timer-ring'
import { ZenBell } from './zen-bell'
import { FlowStateIndicator } from './flow-state-indicator'
import { SessionCompleteOverlay } from './session-complete-overlay'
import { TaskList } from './task-list'
import { ProjectTasksPanel } from './project-tasks-panel'
import type { ZoneType, ZenProject } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface DeepWorkZoneProps {
  zone: ZoneType
  project: ZenProject | null
  isLocked?: boolean
}

export function DeepWorkZone({ zone, project, isLocked = false }: DeepWorkZoneProps) {
  const { 
    timer, 
    isDeepWorkMode, 
    activeZone,
    startTimer, 
    stopTimer, 
    tick,
    getCurrentTask,
  } = useZenStore()

  const [showTasksPanel, setShowTasksPanel] = useState(false)

  const isDesigning = zone === 'designing'
  const isActiveZone = activeZone === zone
  const isTimerRunning = timer.isRunning && timer.zone === zone
  const isSessionComplete = timer.isComplete && timer.zone === zone

  // Get current task
  const currentTask = project ? getCurrentTask(project.id) : null

  // Timer tick effect
  useEffect(() => {
    if (!isTimerRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, tick])

  // Colors
  const zoneColors = isDesigning
    ? {
        border: 'border-cyan-500/20',
        bg: 'from-cyan-500/5 to-purple-500/5',
        accent: 'text-cyan-400',
        badge: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        glow: 'shadow-[0_0_50px_rgba(6,182,212,0.2)]',
        timerColor: 'cyan' as const,
      }
    : {
        border: 'border-purple-500/20',
        bg: 'from-purple-500/5 to-amber-500/5',
        accent: 'text-purple-500',
        badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        glow: 'shadow-[0_0_50px_rgba(168,85,247,0.2)]',
        timerColor: 'purple' as const,
      }

  const Icon = isDesigning ? Compass : Terminal

  const handleStartSession = () => {
    if (project) {
      const duration = currentTask?.estimatedMinutes || project.suggestedDuration
      startTimer(zone, project.id, duration)
    }
  }

  return (
    <>
      <div
        className={cn(
          'relative rounded-[2rem] border-2 p-8 flex flex-col gap-6 transition-all duration-500',
          'bg-gradient-to-br',
          zoneColors.border,
          zoneColors.bg,
          isActiveZone && isDeepWorkMode && zoneColors.glow,
          isActiveZone && isDeepWorkMode && 'z-50'
        )}
      >
        {/* Zone Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', zoneColors.badge)}>
              <Icon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-xl tracking-tight text-white uppercase">
                {isDesigning ? 'Designing' : 'Building'}
              </h3>
              {project && (
                <p className={cn('text-xs font-bold italic', zoneColors.accent)}>
                  Phase {project.currentPhase} • {project.completedTasks}/{project.totalTasks} tasks
                </p>
              )}
            </div>
          </div>
          
          <div className={cn('text-[10px] font-black px-3 py-1 rounded-full border', zoneColors.badge)}>
            {project ? '1 / 1 SLOTS' : '0 / 1 SLOTS'}
          </div>
        </div>

        {/* Project Card */}
        {project ? (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative">
            <SessionCompleteOverlay zone={zone} isVisible={isSessionComplete} />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-white">{project.title}</h4>
                
                {/* Current Task Badge */}
                {currentTask && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', zoneColors.badge)}>
                      {currentTask.emoji} {currentTask.title}
                    </span>
                  </div>
                )}

                {project.aiWorkers && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', zoneColors.badge)}>
                      {project.aiWorkers} AI Workers
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <ZenBell zone={zone} isRinging={isSessionComplete} />
                
                <TimerRing
                  remainingSeconds={timer.zone === zone ? timer.remainingSeconds : (currentTask?.estimatedMinutes || project.suggestedDuration) * 60}
                  totalSeconds={timer.zone === zone ? timer.totalSeconds : (currentTask?.estimatedMinutes || project.suggestedDuration) * 60}
                  color={zoneColors.timerColor}
                  isRunning={isTimerRunning}
                />
                
                <FlowStateIndicator zone={zone} isActive={isTimerRunning} />
              </div>
            </div>

            {/* Task Preview (Compact) */}
            {project.totalTasks > 0 && (
              <div className="mb-4">
                <TaskList projectId={project.id} compact />
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Task hiện tại
                </p>
                <p className={cn('text-[11px] font-bold', zoneColors.accent)}>
                  {currentTask ? `${currentTask.estimatedMinutes} phút tập trung` : 'Không có tasks'}
                </p>
              </div>
              <button
                onClick={() => setShowTasksPanel(true)}
                className={cn('p-3 rounded-xl border text-left hover:opacity-80 transition-opacity', zoneColors.badge)}
              >
                <p className={cn('text-[8px] font-black uppercase tracking-widest mb-1', zoneColors.accent)}>
                  Tất cả Tasks
                </p>
                <p className="text-[11px] font-bold text-white flex items-center gap-1">
                  <ListTodo className="w-3 h-3" />
                  Xem {project.totalTasks} tasks
                </p>
              </button>
            </div>

            {/* Start/Stop Button */}
            <div className="flex flex-col items-center gap-2">
              {isTimerRunning ? (
                <button
                  onClick={stopTimer}
                  className="group relative overflow-hidden bg-slate-900 border border-slate-700 hover:border-red-500 px-8 py-3 rounded-2xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <StopCircle className={cn('w-5 h-5', zoneColors.accent)} />
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      Kết thúc phiên
                    </span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={handleStartSession}
                  className={cn(
                    'group relative overflow-hidden bg-slate-900 border border-slate-700 px-8 py-3 rounded-2xl transition-all duration-300',
                    isDesigning ? 'hover:border-cyan-500' : 'hover:border-amber-400'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isDesigning ? (
                      <Timer className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <Zap className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="text-xs font-black text-white uppercase tracking-widest">
                      Bắt đầu tập trung
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Locked State */
          <div className={cn(
            'rounded-2xl p-8 border border-dashed flex flex-col items-center justify-center min-h-[200px]',
            isLocked 
              ? 'border-red-500/30 bg-red-500/5' 
              : 'border-slate-700 bg-white/5'
          )}>
            {isLocked ? (
              <>
                <Lock className="w-8 h-8 text-red-500/50 mb-3" />
                <p className="text-sm font-bold text-red-500/70">Đã khóa tập trung</p>
                <p className="text-xs text-slate-500 mt-1">Hoàn thành dự án hiện tại trước</p>
              </>
            ) : (
              <>
                <Icon className={cn('w-8 h-8 mb-3 opacity-30', zoneColors.accent)} />
                <p className="text-sm font-medium text-slate-500">Nhấn "Dự án mới" để bắt đầu</p>
                <p className="text-xs text-slate-600 mt-1">Tối đa 1 dự án mỗi vùng</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tasks Panel Slide-out */}
      {showTasksPanel && project && (
        <ProjectTasksPanel 
          zone={zone} 
          onClose={() => setShowTasksPanel(false)} 
        />
      )}
    </>
  )
}
```

---

# STEP 5: INDEX EXPORTS

## 5.1 File: components/zen/index.ts (UPDATED)

```typescript
export * from './zen-sidebar'
export * from './zen-header'
export * from './zen-schedule'
export * from './deep-work-zone'
export * from './garden-section'
export * from './timer-ring'
export * from './zen-bell'
export * from './flow-state-indicator'
export * from './session-complete-overlay'
export * from './deep-work-overlay'
export * from './new-project-modal'
// NEW
export * from './template-selector'
export * from './template-preview'
export * from './task-list'
export * from './project-tasks-panel'
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         ✅ CODER PACK COMPLETE
# ═══════════════════════════════════════════════════════════════════════════════

## Summary - Files trong pack:

```
lib/
├── types/zen.ts                    ✅ UPDATED (thêm Task types)
├── data/
│   └── project-templates.ts        ✅ NEW (7 templates + helpers)
├── stores/
│   └── zen-store.ts                ✅ UPDATED (task management)

components/zen/
├── template-selector.tsx           ✅ NEW (grid chọn template)
├── template-preview.tsx            ✅ NEW (preview tasks)
├── task-list.tsx                   ✅ NEW (full + compact view)
├── project-tasks-panel.tsx         ✅ NEW (slide-out panel)
├── new-project-modal.tsx           ✅ UPDATED (2-step wizard)
├── deep-work-zone.tsx              ✅ UPDATED (task integration)
└── index.ts                        ✅ UPDATED
```

## Templates Included:

| Template | Tasks | Est. Time |
|----------|-------|-----------|
| 🌐 Web App / SaaS | 12 | ~15h |
| 📄 Landing Page | 10 | ~8h |
| 🔌 API / Backend | 10 | ~11h |
| 📱 Mobile App | 10 | ~12h |
| 📚 Content Project | 10 | ~13h |
| 🤖 AI / Automation | 10 | ~9h |
| ✨ Blank Project | 0 | - |

## Key Features:

| Feature | Status |
|---------|--------|
| 7 Project Templates | ✅ |
| Auto-generate tasks from template | ✅ |
| Task progress tracking | ✅ |
| Current task indicator | ✅ |
| Complete / Skip / Start task | ✅ |
| Compact task preview in zone | ✅ |
| Full task list panel (slide-out) | ✅ |
| Time tracking per task | ✅ |
| 2-step create project wizard | ✅ |
| Template preview before create | ✅ |

---

# END OF CODER PACK
## VIBECODER ZEN - TASK TEMPLATES
