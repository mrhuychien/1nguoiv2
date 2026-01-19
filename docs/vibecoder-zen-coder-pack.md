# ═══════════════════════════════════════════════════════════════════════════════
#                        🔧 CODER PACK - VIBECODER ZEN
#                          Golden Rule Dashboard
#                           Vibecode Kit v4.0
# ═══════════════════════════════════════════════════════════════════════════════
#
#  Tính năng:
#  • Deep Work Zones (DESIGNING & BUILDING) - Max 1 project/zone
#  • Daily Zen Schedule với time blocks
#  • Garden Tasks (IDEAS, TESTING, SHIPPED, PAUSED)
#  • Focus Timer với countdown & circular progress
#  • Deep Work Mode - Dim surroundings khi active
#  • Flow State indicator với glow effect
#  • Zen Bell notification với volume control
#
# ═══════════════════════════════════════════════════════════════════════════════

---

# STEP 1: TYPES & STORE

## 1.1 File: lib/types/zen.ts

```typescript
export type ZoneType = 'designing' | 'building'
export type GardenCategory = 'ideas' | 'testing' | 'shipped' | 'paused'
export type ProjectHealth = 'on_track' | 'at_risk' | 'blocked'

export interface ZenProject {
  id: string
  title: string
  zone: ZoneType
  aiStatus?: string
  aiWorkers?: number
  suggestedDuration: number // minutes
  health: ProjectHealth
  createdAt: string
}

export interface GardenItem {
  id: string
  title: string
  category: GardenCategory
  createdAt: string
}

export interface FocusBlock {
  id: string
  startTime: string // "09:00"
  endTime: string // "10:30"
  label: string
  linkedZone?: ZoneType
  isActive: boolean
}

export interface TimerState {
  isRunning: boolean
  zone: ZoneType | null
  projectId: string | null
  remainingSeconds: number
  totalSeconds: number
  isComplete: boolean
}

export interface ZenBellSettings {
  enabled: boolean
  volume: number // 0-100
}
```

## 1.2 File: lib/stores/zen-store.ts

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
  GardenCategory 
} from '@/lib/types/zen'

interface ZenStore {
  // State
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

  // Actions - Projects
  setZoneProject: (zone: ZoneType, project: ZenProject | null) => void
  clearZone: (zone: ZoneType) => void
  
  // Actions - Garden
  addGardenItem: (item: Omit<GardenItem, 'id' | 'createdAt'>) => void
  removeGardenItem: (id: string) => void
  moveToZone: (itemId: string, zone: ZoneType) => void
  
  // Actions - Focus Blocks
  setFocusBlocks: (blocks: FocusBlock[]) => void
  setActiveBlock: (blockId: string) => void
  
  // Actions - Timer
  startTimer: (zone: ZoneType, projectId: string, duration: number) => void
  stopTimer: () => void
  pauseTimer: () => void
  resumeTimer: () => void
  tick: () => void
  completeTimer: () => void
  acknowledgeComplete: () => void
  
  // Actions - Zen Bell
  setZenBellVolume: (zone: ZoneType, volume: number) => void
  toggleZenBell: (zone: ZoneType) => void
  
  // Actions - Deep Work Mode
  enterDeepWork: (zone: ZoneType) => void
  exitDeepWork: () => void
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

      // Project Actions
      setZoneProject: (zone, project) => {
        if (zone === 'designing') {
          set({ designingProject: project })
        } else {
          set({ buildingProject: project })
        }
      },

      clearZone: (zone) => {
        if (zone === 'designing') {
          set({ designingProject: null })
        } else {
          set({ buildingProject: null })
        }
      },

      // Garden Actions
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

        // Check if zone is already occupied
        const existingProject = zone === 'designing' 
          ? get().designingProject 
          : get().buildingProject
        
        if (existingProject) {
          console.warn('Zone is locked - cannot add more projects')
          return
        }

        // Create project from garden item
        const project: ZenProject = {
          id: crypto.randomUUID(),
          title: item.title,
          zone,
          suggestedDuration: zone === 'designing' ? 90 : 120,
          health: 'on_track',
          createdAt: new Date().toISOString(),
        }

        // Move to zone and remove from garden
        get().setZoneProject(zone, project)
        get().removeGardenItem(itemId)
      },

      // Focus Block Actions
      setFocusBlocks: (blocks) => set({ focusBlocks: blocks }),

      setActiveBlock: (blockId) => {
        const blocks = get().focusBlocks.map(b => ({
          ...b,
          isActive: b.id === blockId,
        }))
        set({ focusBlocks: blocks })
      },

      // Timer Actions
      startTimer: (zone, projectId, duration) => {
        const seconds = duration * 60
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
        
        // Play zen bell sound if enabled
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

      // Zen Bell Actions
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

      // Deep Work Actions
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
      }),
    }
  )
)

// Zen Bell Sound Player
function playZenBell(volume: number) {
  // Using Web Audio API for a simple bell sound
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 528 // Solfeggio frequency
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

# STEP 2: UI COMPONENTS

## 2.1 File: components/zen/zen-schedule.tsx

```typescript
'use client'

import { useZenStore } from '@/lib/stores/zen-store'
import { cn } from '@/lib/utils/cn'

export function ZenSchedule() {
  const { focusBlocks } = useZenStore()

  return (
    <div className="px-6 py-4">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
        Daily Zen Schedule
      </h3>
      <div className="space-y-4">
        {focusBlocks.map((block) => (
          <div
            key={block.id}
            className={cn(
              'relative pl-6 py-2 transition-all duration-300',
              block.isActive
                ? 'border-l-2 border-cyan-500 bg-cyan-500/5 rounded-r-lg'
                : 'border-l border-slate-700'
            )}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                'absolute top-3 w-2.5 h-2.5 rounded-full transition-all',
                block.isActive
                  ? '-left-[6px] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : '-left-[5px] bg-slate-600'
              )}
            />
            
            {/* Time */}
            <p
              className={cn(
                'text-[10px] font-medium',
                block.isActive ? 'text-cyan-500 font-bold' : 'text-slate-500'
              )}
            >
              {block.startTime} - {block.endTime}
            </p>
            
            {/* Label */}
            <p
              className={cn(
                'text-xs font-semibold',
                block.isActive ? 'text-white' : 'text-slate-400'
              )}
            >
              {block.label}
            </p>
            
            {/* Active Phase */}
            {block.isActive && block.linkedZone && (
              <p className="text-[10px] text-cyan-500/80 mt-1 italic capitalize">
                {block.linkedZone} Phase Active
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 2.2 File: components/zen/timer-ring.tsx

```typescript
'use client'

import { cn } from '@/lib/utils/cn'

interface TimerRingProps {
  remainingSeconds: number
  totalSeconds: number
  size?: number
  color?: 'cyan' | 'amber' | 'purple'
  isRunning?: boolean
}

export function TimerRing({ 
  remainingSeconds, 
  totalSeconds, 
  size = 56,
  color = 'cyan',
  isRunning = false
}: TimerRingProps) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) : 1
  const offset = circumference * (1 - progress)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const colorClasses = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    purple: 'text-purple-500',
  }

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        isRunning && 'animate-pulse-slow'
      )}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90">
        {/* Background ring */}
        <circle
          className="text-slate-800"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
        />
        {/* Progress ring */}
        <circle
          className={cn(colorClasses[color], 'transition-all duration-1000')}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-white">
        {formatTime(remainingSeconds)}
      </span>
    </div>
  )
}
```

## 2.3 File: components/zen/zen-bell.tsx

```typescript
'use client'

import { Bell, BellOff } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import type { ZoneType } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface ZenBellProps {
  zone: ZoneType
  isRinging?: boolean
}

export function ZenBell({ zone, isRinging = false }: ZenBellProps) {
  const { zenBell, setZenBellVolume, toggleZenBell } = useZenStore()
  const settings = zenBell[zone]

  const colorClasses = zone === 'designing' 
    ? 'text-cyan-400' 
    : 'text-amber-400'

  return (
    <div className="flex items-center gap-3 bg-slate-900/60 py-1.5 px-3 rounded-full border border-white/10">
      {/* Bell Icon with Ripple */}
      <button
        onClick={() => toggleZenBell(zone)}
        className={cn(
          'relative flex items-center justify-center w-6 h-6 transition-transform hover:scale-110',
          colorClasses
        )}
      >
        {settings.enabled ? (
          <Bell className={cn('w-4 h-4', isRinging && 'animate-bell-ring')} />
        ) : (
          <BellOff className="w-4 h-4 opacity-50" />
        )}
        
        {/* Ripple Effect */}
        {settings.enabled && (
          <div className="absolute inset-0 opacity-40">
            <span className="absolute inset-0 rounded-full border border-current animate-ripple" />
          </div>
        )}
      </button>

      {/* Volume Slider */}
      {settings.enabled && (
        <input
          type="range"
          min="0"
          max="100"
          value={settings.volume}
          onChange={(e) => setZenBellVolume(zone, parseInt(e.target.value))}
          className={cn(
            'w-12 h-1 appearance-none bg-transparent cursor-pointer',
            '[&::-webkit-slider-runnable-track]:bg-slate-700 [&::-webkit-slider-runnable-track]:h-0.5 [&::-webkit-slider-runnable-track]:rounded',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-1',
            zone === 'designing' 
              ? '[&::-webkit-slider-thumb]:bg-cyan-400' 
              : '[&::-webkit-slider-thumb]:bg-amber-400'
          )}
        />
      )}
    </div>
  )
}
```

## 2.4 File: components/zen/flow-state-indicator.tsx

```typescript
'use client'

import { cn } from '@/lib/utils/cn'
import type { ZoneType } from '@/lib/types/zen'

interface FlowStateIndicatorProps {
  zone: ZoneType
  isActive: boolean
}

export function FlowStateIndicator({ zone, isActive }: FlowStateIndicatorProps) {
  if (!isActive) return null

  const colorClasses = zone === 'designing'
    ? 'bg-cyan-400 text-cyan-400'
    : 'bg-amber-400 text-amber-400'

  return (
    <div className="flex items-center gap-1.5">
      <span 
        className={cn(
          'w-1.5 h-1.5 rounded-full animate-flow-glow',
          colorClasses.split(' ')[0]
        )} 
      />
      <span 
        className={cn(
          'text-[9px] font-black uppercase tracking-widest',
          colorClasses.split(' ')[1]
        )}
      >
        Flow State
      </span>
    </div>
  )
}
```

## 2.5 File: components/zen/session-complete-overlay.tsx

```typescript
'use client'

import { Bell } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import type { ZoneType } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface SessionCompleteOverlayProps {
  zone: ZoneType
  isVisible: boolean
}

export function SessionCompleteOverlay({ zone, isVisible }: SessionCompleteOverlayProps) {
  const { acknowledgeComplete } = useZenStore()

  if (!isVisible) return null

  const colorClasses = zone === 'designing'
    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-500'
    : 'border-purple-500/50 bg-purple-500/10 text-purple-500'

  return (
    <div 
      className={cn(
        'absolute inset-0 backdrop-blur-sm rounded-2xl z-20',
        'flex flex-col items-center justify-center',
        'border-2 transition-opacity duration-300',
        colorClasses,
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Animated Bell */}
      <div className="relative">
        <Bell className="w-12 h-12 animate-bell-ring" />
        <div className="absolute inset-0 opacity-30">
          <span className="absolute inset-0 rounded-full border border-current animate-ripple" />
        </div>
      </div>
      
      <p className="font-black uppercase tracking-widest text-sm mt-4">
        Session Complete
      </p>
      
      <button
        onClick={acknowledgeComplete}
        className={cn(
          'mt-4 text-[10px] font-bold text-white px-4 py-2 rounded-lg transition-transform hover:scale-105',
          zone === 'designing' ? 'bg-cyan-500' : 'bg-purple-500'
        )}
      >
        Acknowledge
      </button>
    </div>
  )
}
```

## 2.6 File: components/zen/deep-work-zone.tsx

```typescript
'use client'

import { useEffect } from 'react'
import { Compass, Terminal, Timer, StopCircle, Zap, Lock } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import { TimerRing } from './timer-ring'
import { ZenBell } from './zen-bell'
import { FlowStateIndicator } from './flow-state-indicator'
import { SessionCompleteOverlay } from './session-complete-overlay'
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
    tick 
  } = useZenStore()

  const isDesigning = zone === 'designing'
  const isActiveZone = activeZone === zone
  const isTimerRunning = timer.isRunning && timer.zone === zone
  const isSessionComplete = timer.isComplete && timer.zone === zone

  // Timer tick effect
  useEffect(() => {
    if (!isTimerRunning) return
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isTimerRunning, tick])

  // Colors based on zone
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
      startTimer(zone, project.id, project.suggestedDuration)
    }
  }

  return (
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
                Active Block: Focus Block {isDesigning ? '1' : '2'}
              </p>
            )}
          </div>
        </div>
        
        {/* Slot Indicator */}
        <div className={cn('text-[10px] font-black px-3 py-1 rounded-full border', zoneColors.badge)}>
          {project ? '1 / 1 SLOTS' : '0 / 1 SLOTS'}
        </div>
      </div>

      {/* Project Card or Empty State */}
      {project ? (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative">
          {/* Session Complete Overlay */}
          <SessionCompleteOverlay zone={zone} isVisible={isSessionComplete} />

          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-bold text-white">{project.title}</h4>
              {project.aiWorkers && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', zoneColors.badge)}>
                    {project.aiWorkers} AI Workers Active
                  </span>
                </div>
              )}
              {project.aiStatus && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-500 text-[9px] font-black uppercase tracking-wider rounded border border-cyan-500/20">
                    {project.aiStatus}
                  </span>
                </div>
              )}
            </div>
            
            {/* Timer & Bell Controls */}
            <div className="flex flex-col items-end gap-3">
              <ZenBell zone={zone} isRinging={isSessionComplete} />
              
              <TimerRing
                remainingSeconds={timer.zone === zone ? timer.remainingSeconds : project.suggestedDuration * 60}
                totalSeconds={timer.zone === zone ? timer.totalSeconds : project.suggestedDuration * 60}
                color={zoneColors.timerColor}
                isRunning={isTimerRunning}
              />
              
              <FlowStateIndicator zone={zone} isActive={isTimerRunning} />
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Duration Suggestion
              </p>
              <p className={cn('text-[11px] font-bold', zoneColors.accent)}>
                {project.suggestedDuration} Min Focus Block
              </p>
            </div>
            <div className={cn('p-3 rounded-xl border', zoneColors.badge)}>
              <p className={cn('text-[8px] font-black uppercase tracking-widest mb-1', zoneColors.accent)}>
                Zen Bell Status
              </p>
              <p className="text-[11px] font-bold text-white">
                Notification enabled
              </p>
            </div>
          </div>

          {/* Start/Stop Button */}
          <div className="flex flex-col items-center gap-2">
            {isTimerRunning ? (
              <button
                onClick={stopTimer}
                className={cn(
                  'group relative overflow-hidden bg-slate-900 border border-slate-700 px-8 py-3 rounded-2xl transition-all duration-300',
                  'hover:border-red-500'
                )}
              >
                <div className="flex items-center gap-3">
                  <StopCircle className={cn('w-5 h-5', zoneColors.accent)} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">
                    End Session
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
                    Start Focus Session
                  </span>
                </div>
                <div className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity',
                  isDesigning ? 'bg-cyan-500' : 'bg-amber-400'
                )} />
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
              <p className="text-sm font-bold text-red-500/70">Focus Locked</p>
              <p className="text-xs text-slate-500 mt-1">Zone đã có project - Hoàn thành trước khi thêm mới</p>
            </>
          ) : (
            <>
              <Icon className={cn('w-8 h-8 mb-3 opacity-30', zoneColors.accent)} />
              <p className="text-sm font-medium text-slate-500">Kéo project từ Garden vào đây</p>
              <p className="text-xs text-slate-600 mt-1">Tối đa 1 project mỗi zone</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

## 2.7 File: components/zen/garden-section.tsx

```typescript
'use client'

import { useState } from 'react'
import { Lightbulb, FlaskConical, Rocket, Pause, Plus, GripVertical, Trash2 } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import type { GardenCategory, GardenItem } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

const categoryConfig: Record<GardenCategory, { icon: typeof Lightbulb; emoji: string; label: string }> = {
  ideas: { icon: Lightbulb, emoji: '💡', label: 'Ideas' },
  testing: { icon: FlaskConical, emoji: '🧪', label: 'Testing' },
  shipped: { icon: Rocket, emoji: '🚀', label: 'Shipped' },
  paused: { icon: Pause, emoji: '⏸️', label: 'Paused' },
}

export function GardenSection() {
  const { gardenItems, addGardenItem, removeGardenItem, moveToZone } = useZenStore()
  const [newItemTitle, setNewItemTitle] = useState('')
  const [activeCategory, setActiveCategory] = useState<GardenCategory>('ideas')

  const itemsByCategory = (category: GardenCategory) =>
    gardenItems.filter((item) => item.category === category)

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      addGardenItem({ title: newItemTitle.trim(), category: activeCategory })
      setNewItemTitle('')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2">
          <span>🌱</span>
          The Garden
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.keys(categoryConfig) as GardenCategory[]).map((category) => {
          const config = categoryConfig[category]
          const items = itemsByCategory(category)

          return (
            <div
              key={category}
              className="bg-slate-900/30 rounded-2xl p-5 border border-slate-800 flex flex-col gap-4"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config.emoji}</span>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {config.label}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-600">
                  {items.length}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2 min-h-[60px]">
                {items.map((item) => (
                  <GardenItemCard
                    key={item.id}
                    item={item}
                    onDelete={() => removeGardenItem(item.id)}
                    onMoveToDesigning={() => moveToZone(item.id, 'designing')}
                    onMoveToBuilding={() => moveToZone(item.id, 'building')}
                  />
                ))}
              </div>

              {/* Add New (only for Ideas) */}
              {category === 'ideas' && (
                <div className="flex gap-2 mt-auto">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    placeholder="New idea..."
                    className="flex-1 bg-white/5 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={handleAddItem}
                    className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface GardenItemCardProps {
  item: GardenItem
  onDelete: () => void
  onMoveToDesigning: () => void
  onMoveToBuilding: () => void
}

function GardenItemCard({ item, onDelete, onMoveToDesigning, onMoveToBuilding }: GardenItemCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className="group bg-white/5 p-3 rounded-lg border border-transparent hover:border-slate-700 transition-all cursor-pointer relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-xs font-semibold text-slate-300 flex-1">{item.title}</p>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={onMoveToDesigning}
            className="p-1 hover:bg-cyan-500/20 rounded text-cyan-400 transition-colors"
            title="Move to Designing"
          >
            <span className="text-[10px]">D</span>
          </button>
          <button
            onClick={onMoveToBuilding}
            className="p-1 hover:bg-purple-500/20 rounded text-purple-400 transition-colors"
            title="Move to Building"
          >
            <span className="text-[10px]">B</span>
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}
```

---

# STEP 3: MAIN DASHBOARD

## 3.1 File: components/zen/zen-sidebar.tsx

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles } from 'lucide-react'
import { ZenSchedule } from './zen-schedule'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/zen', icon: LayoutDashboard, label: 'Zen Dashboard' },
  { href: '/zen/garden', icon: Sparkles, label: 'Garden Ideas' },
]

export function ZenSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-slate-800 flex-shrink-0 flex flex-col bg-[#080b11] hidden md:flex">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
          V
        </div>
        <span className="text-lg font-bold tracking-tight text-white">Vibecoder Zen</span>
      </div>

      {/* Zen Schedule */}
      <ZenSchedule />

      {/* Navigation */}
      <nav className="px-4 mt-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

## 3.2 File: components/zen/zen-header.tsx

```typescript
'use client'

import { Plus, Moon, Sun } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import { cn } from '@/lib/utils/cn'

interface ZenHeaderProps {
  onNewProject?: () => void
}

export function ZenHeader({ onNewProject }: ZenHeaderProps) {
  const { isDeepWorkMode } = useZenStore()

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Golden Rule Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Focus is the key to mastery. One project at a time.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full border transition-colors',
          isDeepWorkMode 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            : 'bg-slate-800/50 border-slate-700 text-slate-400'
        )}>
          <span className={cn(
            'w-2 h-2 rounded-full',
            isDeepWorkMode ? 'bg-amber-400 animate-pulse' : 'bg-green-400'
          )} />
          <span className="text-xs font-medium">
            {isDeepWorkMode ? 'Deep Work Active' : 'System Calm'}
          </span>
        </div>

        {/* New Project Button */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>
    </header>
  )
}
```

## 3.3 File: components/zen/deep-work-overlay.tsx

```typescript
'use client'

import { useZenStore } from '@/lib/stores/zen-store'
import { cn } from '@/lib/utils/cn'

export function DeepWorkOverlay() {
  const { isDeepWorkMode } = useZenStore()

  return (
    <div
      className={cn(
        'fixed inset-0 bg-[#05070a]/90 backdrop-blur-md transition-opacity duration-700 z-40',
        isDeepWorkMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    />
  )
}
```

## 3.4 File: app/(dashboard)/zen/page.tsx

```typescript
'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useZenStore } from '@/lib/stores/zen-store'
import { ZenSidebar } from '@/components/zen/zen-sidebar'
import { ZenHeader } from '@/components/zen/zen-header'
import { DeepWorkZone } from '@/components/zen/deep-work-zone'
import { GardenSection } from '@/components/zen/garden-section'
import { DeepWorkOverlay } from '@/components/zen/deep-work-overlay'
import { NewProjectModal } from '@/components/zen/new-project-modal'
import { cn } from '@/lib/utils/cn'

export default function ZenDashboardPage() {
  const { 
    designingProject, 
    buildingProject, 
    isDeepWorkMode,
    activeZone 
  } = useZenStore()
  
  const [showNewProject, setShowNewProject] = useState(false)

  // Check if both zones are occupied
  const isDesigningLocked = !!designingProject
  const isBuildingLocked = !!buildingProject

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 flex">
      {/* Deep Work Overlay */}
      <DeepWorkOverlay />

      {/* Sidebar */}
      <ZenSidebar />

      {/* Main Content */}
      <main className={cn(
        'flex-1 p-8 overflow-y-auto transition-all duration-500',
        isDeepWorkMode && 'relative z-50'
      )}>
        <ZenHeader onNewProject={() => setShowNewProject(true)} />

        {/* Deep Work Zones Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-2">
              <span>✨</span>
              Deep Work Zones
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <Lock className="w-3 h-3" />
              Strict Limit Enforced
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DeepWorkZone
              zone="designing"
              project={designingProject}
              isLocked={false}
            />
            <DeepWorkZone
              zone="building"
              project={buildingProject}
              isLocked={false}
            />
          </div>
        </section>

        {/* Garden Section */}
        <GardenSection />
      </main>

      {/* New Project Modal */}
      <NewProjectModal 
        open={showNewProject} 
        onOpenChange={setShowNewProject} 
      />
    </div>
  )
}
```

## 3.5 File: components/zen/new-project-modal.tsx

```typescript
'use client'

import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { useZenStore } from '@/lib/stores/zen-store'
import type { ZoneType } from '@/lib/types/zen'
import { cn } from '@/lib/utils/cn'

interface NewProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const { designingProject, buildingProject, setZoneProject, addGardenItem } = useZenStore()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState<ZoneType | 'garden'>('garden')

  const isDesigningAvailable = !designingProject
  const isBuildingAvailable = !buildingProject

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (destination === 'garden') {
      addGardenItem({ title: title.trim(), category: 'ideas' })
    } else {
      const project = {
        id: crypto.randomUUID(),
        title: title.trim(),
        zone: destination,
        suggestedDuration: destination === 'designing' ? 90 : 120,
        health: 'on_track' as const,
        createdAt: new Date().toISOString(),
      }
      setZoneProject(destination, project)
    }

    setTitle('')
    setDestination('garden')
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="🚀 New Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Wellness Dashboard, E-commerce API..."
          autoFocus
        />

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Destination
          </label>

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
                  🎨 Designing Zone
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  For strategy & design work
                </p>
              </div>
              {!isDesigningAvailable && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  LOCKED
                </span>
              )}
            </div>
          </button>

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
                  ⚡ Building Zone
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  For development & coding
                </p>
              </div>
              {!isBuildingAvailable && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">
                  LOCKED
                </span>
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
              🌱 Garden (Ideas)
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Nurture later - no pressure
            </p>
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!title.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
```

## 3.6 File: components/zen/index.ts

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
```

---

# STEP 4: TAILWIND CONFIG ADDITIONS

## 4.1 Add to tailwind.config.ts

```typescript
// Add these to your existing tailwind.config.ts

module.exports = {
  // ... existing config
  theme: {
    extend: {
      // ... existing extends
      colors: {
        // ... existing colors
        zen: '#a855f7',
        focus: '#22d3ee',
        'amber-zen': '#fbbf24',
      },
      animation: {
        // ... existing animations
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow-glow': 'flow-glow 3s ease-in-out infinite',
        'bell-ring': 'bell-ring 1.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite',
        'ripple': 'ripple 2s linear infinite',
      },
      keyframes: {
        // ... existing keyframes
        'flow-glow': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'bell-ring': {
          '0%, 100%': { transform: 'rotate(0)' },
          '20%, 60%': { transform: 'rotate(15deg)' },
          '40%, 80%': { transform: 'rotate(-15deg)' },
        },
        'ripple': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
}
```

---

# STEP 5: GLOBAL CSS ADDITIONS

## 5.1 Add to app/globals.css

```css
/* Zen Dashboard Styles */
.zen-timer-ring {
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s linear;
}

.zen-bell-ripple::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1px solid currentColor;
  animation: ripple 2s linear infinite;
}

.deep-work-zone {
  background: linear-gradient(145deg, rgba(6, 182, 212, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
}

.active-glow {
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
}

.garden-section {
  background: rgba(15, 23, 42, 0.3);
}

/* Audio Slider Custom Styles */
.audio-slider {
  -webkit-appearance: none;
  background: transparent;
}

.audio-slider::-webkit-slider-runnable-track {
  background: #334155;
  height: 2px;
  border-radius: 1px;
}

.audio-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background: currentColor;
  margin-top: -4px;
  cursor: pointer;
}
```

---

# ═══════════════════════════════════════════════════════════════════════════════
#                         ✅ CODER PACK COMPLETE
# ═══════════════════════════════════════════════════════════════════════════════

## Summary - Files trong pack:

```
lib/
├── types/
│   └── zen.ts                    ✅ Types & Interfaces
├── stores/
│   └── zen-store.ts              ✅ Zustand Store

components/zen/
├── zen-sidebar.tsx               ✅ Sidebar với schedule
├── zen-header.tsx                ✅ Header với status
├── zen-schedule.tsx              ✅ Daily Zen Schedule widget
├── deep-work-zone.tsx            ✅ Main zone component
├── garden-section.tsx            ✅ Garden Tasks area
├── timer-ring.tsx                ✅ Circular timer
├── zen-bell.tsx                  ✅ Bell notification control
├── flow-state-indicator.tsx      ✅ Flow state glow
├── session-complete-overlay.tsx  ✅ Session complete UI
├── deep-work-overlay.tsx         ✅ Dim background overlay
├── new-project-modal.tsx         ✅ Create project modal
└── index.ts                      ✅ Exports

app/(dashboard)/zen/
└── page.tsx                      ✅ Main Zen Dashboard page
```

## Key Features Implemented:

| Feature | Status |
|---------|--------|
| Deep Work Zones (1 project/zone limit) | ✅ |
| Focus Locked indicator | ✅ |
| Daily Zen Schedule widget | ✅ |
| Active block highlighting | ✅ |
| Garden Tasks (IDEAS, TESTING, SHIPPED, PAUSED) | ✅ |
| Focus Timer với circular progress | ✅ |
| Deep Work Mode (dim overlay) | ✅ |
| Flow State indicator (glow) | ✅ |
| Zen Bell với volume control | ✅ |
| Session Complete overlay | ✅ |
| Move items from Garden to Zones | ✅ |

---

## Usage:

```bash
# Thêm vào project 1nguoi.com
# Copy các files theo đường dẫn
# Add tailwind config & global CSS
# Navigate to /zen
```

---

# END OF CODER PACK
## VIBECODER ZEN - GOLDEN RULE DASHBOARD
