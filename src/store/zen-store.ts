"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ZenProject,
  ZenTask,
  ZenSession,
  ZenScheduleBlock,
  ZenStats,
  ZenTimerConfig,
  FlowState,
  TimerState,
  DeepWorkZone,
  DEFAULT_SCHEDULE_BLOCKS,
  DEFAULT_TIMER_CONFIG,
} from "@/types/zen";
import { generateId } from "@/lib/utils";

interface ZenStoreState {
  // Projects & Tasks
  projects: ZenProject[];
  activeProjectId: string | null;
  activeTaskId: string | null;

  // Timer
  timerState: TimerState;
  timerSeconds: number;
  timerTargetMinutes: number;
  timerConfig: ZenTimerConfig;
  sessionsCompleted: number;

  // Flow & Focus
  flowState: FlowState;
  isDeepWorkMode: boolean;
  currentZone: DeepWorkZone | null;

  // Schedule
  scheduleBlocks: ZenScheduleBlock[];

  // Sessions history
  sessions: ZenSession[];

  // Stats
  stats: ZenStats;

  // UI State
  showSessionComplete: boolean;
  showDeepWorkOverlay: boolean;
  showNewProjectModal: boolean;
  bellEnabled: boolean;
}

interface ZenStoreActions {
  // Project actions
  addProject: (name: string, color: string, icon: string) => void;
  updateProject: (id: string, updates: Partial<ZenProject>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // Task actions
  addTask: (projectId: string, title: string, estimatedMinutes: number) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<ZenTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  completeTask: (projectId: string, taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;

  // Timer actions
  startTimer: (minutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;
  setTimerTarget: (minutes: number) => void;

  // Flow actions
  setFlowState: (state: FlowState) => void;
  enterDeepWorkMode: () => void;
  exitDeepWorkMode: () => void;

  // Schedule actions
  updateScheduleBlock: (id: string, updates: Partial<ZenScheduleBlock>) => void;
  setCurrentZone: (zone: DeepWorkZone | null) => void;

  // Session actions
  startSession: () => void;
  endSession: (notes?: string) => void;

  // UI actions
  setShowSessionComplete: (show: boolean) => void;
  setShowDeepWorkOverlay: (show: boolean) => void;
  setShowNewProjectModal: (show: boolean) => void;
  toggleBell: () => void;
  ringBell: () => void;

  // Stats
  updateStats: () => void;
  resetDaily: () => void;
}

type ZenStore = ZenStoreState & ZenStoreActions;

// Mock projects for demo
const mockProjects: ZenProject[] = [
  {
    id: "p1",
    name: "1nguoi.com",
    color: "#00d4ff",
    icon: "rocket",
    totalMinutes: 480,
    completedMinutes: 245,
    tasks: [
      {
        id: "t1",
        projectId: "p1",
        title: "Hoàn thành Zen Dashboard",
        status: "in_progress",
        estimatedMinutes: 120,
        actualMinutes: 45,
        priority: 1,
        createdAt: new Date(),
      },
      {
        id: "t2",
        projectId: "p1",
        title: "Tích hợp Supabase Auth",
        status: "completed",
        estimatedMinutes: 60,
        actualMinutes: 55,
        priority: 2,
        completedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: "t3",
        projectId: "p1",
        title: "Thiết kế Landing Page",
        status: "pending",
        estimatedMinutes: 90,
        actualMinutes: 0,
        priority: 3,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p2",
    name: "Blog cá nhân",
    color: "#a855f7",
    icon: "pen",
    totalMinutes: 240,
    completedMinutes: 120,
    tasks: [
      {
        id: "t4",
        projectId: "p2",
        title: "Viết bài về Solopreneur",
        status: "pending",
        estimatedMinutes: 45,
        actualMinutes: 0,
        priority: 1,
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "p3",
    name: "Học TypeScript",
    color: "#22c55e",
    icon: "book",
    totalMinutes: 180,
    completedMinutes: 90,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const initialState: ZenStoreState = {
  projects: mockProjects,
  activeProjectId: "p1",
  activeTaskId: "t1",

  timerState: "idle",
  timerSeconds: 0,
  timerTargetMinutes: 25,
  timerConfig: DEFAULT_TIMER_CONFIG,
  sessionsCompleted: 0,

  flowState: "rest",
  isDeepWorkMode: false,
  currentZone: null,

  scheduleBlocks: DEFAULT_SCHEDULE_BLOCKS,
  sessions: [],

  stats: {
    todayMinutes: 125,
    weekMinutes: 840,
    streak: 7,
    flowSessions: 12,
    tasksCompleted: 5,
    projectsActive: 3,
  },

  showSessionComplete: false,
  showDeepWorkOverlay: false,
  showNewProjectModal: false,
  bellEnabled: true,
};

export const useZenStore = create<ZenStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Project actions
      addProject: (name, color, icon) => {
        const newProject: ZenProject = {
          id: generateId(),
          name,
          color,
          icon,
          totalMinutes: 0,
          completedMinutes: 0,
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          showNewProjectModal: false,
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      // Task actions
      addTask: (projectId, title, estimatedMinutes) => {
        const newTask: ZenTask = {
          id: generateId(),
          projectId,
          title,
          status: "pending",
          estimatedMinutes,
          actualMinutes: 0,
          priority: 1,
          createdAt: new Date(),
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: [...p.tasks, newTask], updatedAt: new Date() }
              : p
          ),
        }));
      },

      updateTask: (projectId, taskId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...updates } : t
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      deleteTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.filter((t) => t.id !== taskId),
                  updatedAt: new Date(),
                }
              : p
          ),
          activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
        }));
      },

      completeTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  tasks: p.tasks.map((t) =>
                    t.id === taskId
                      ? { ...t, status: "completed" as const, completedAt: new Date() }
                      : t
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
          stats: {
            ...state.stats,
            tasksCompleted: state.stats.tasksCompleted + 1,
          },
        }));
      },

      setActiveTask: (taskId) => set({ activeTaskId: taskId }),

      // Timer actions
      startTimer: (minutes) => {
        const targetMinutes = minutes || get().timerTargetMinutes;
        set({
          timerState: "running",
          timerSeconds: targetMinutes * 60,
          timerTargetMinutes: targetMinutes,
          flowState: "focus",
        });
      },

      pauseTimer: () => set({ timerState: "paused" }),

      resumeTimer: () => set({ timerState: "running" }),

      stopTimer: () => {
        const { timerTargetMinutes, timerSeconds } = get();
        const elapsedMinutes = timerTargetMinutes - Math.floor(timerSeconds / 60);

        if (elapsedMinutes > 0) {
          get().updateStats();
        }

        set({
          timerState: "idle",
          timerSeconds: 0,
          flowState: "rest",
        });
      },

      tickTimer: () => {
        const { timerState, timerSeconds, bellEnabled } = get();
        if (timerState !== "running") return;

        if (timerSeconds <= 1) {
          // Timer completed
          set({
            timerState: "completed",
            timerSeconds: 0,
            sessionsCompleted: get().sessionsCompleted + 1,
            showSessionComplete: true,
            flowState: "rest",
          });

          if (bellEnabled) {
            get().ringBell();
          }
        } else {
          // Check for flow state transition (after 10 minutes of focus)
          const elapsedMinutes = get().timerTargetMinutes - Math.floor(timerSeconds / 60);
          if (elapsedMinutes >= 10 && get().flowState === "focus") {
            set({ flowState: "flow" });
          }

          set({ timerSeconds: timerSeconds - 1 });
        }
      },

      resetTimer: () => {
        set({
          timerState: "idle",
          timerSeconds: 0,
          flowState: "rest",
        });
      },

      setTimerTarget: (minutes) => set({ timerTargetMinutes: minutes }),

      // Flow actions
      setFlowState: (flowState) => set({ flowState }),

      enterDeepWorkMode: () => {
        set({
          isDeepWorkMode: true,
          showDeepWorkOverlay: true,
        });
        // Start timer automatically in deep work mode
        get().startTimer();
      },

      exitDeepWorkMode: () => {
        set({
          isDeepWorkMode: false,
          showDeepWorkOverlay: false,
        });
        get().stopTimer();
      },

      // Schedule actions
      updateScheduleBlock: (id, updates) => {
        set((state) => ({
          scheduleBlocks: state.scheduleBlocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
      },

      setCurrentZone: (zone) => {
        set((state) => ({
          currentZone: zone,
          scheduleBlocks: state.scheduleBlocks.map((block) => ({
            ...block,
            isActive: block.zone === zone,
          })),
        }));
      },

      // Session actions
      startSession: () => {
        const { activeProjectId, activeTaskId, currentZone, flowState } = get();
        if (!activeProjectId) return;

        const newSession: ZenSession = {
          id: generateId(),
          projectId: activeProjectId,
          taskId: activeTaskId || undefined,
          startTime: new Date(),
          durationMinutes: 0,
          zone: currentZone || "morning",
          flowState,
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
        }));
      },

      endSession: (notes) => {
        set((state) => {
          const sessions = [...state.sessions];
          const lastSession = sessions[sessions.length - 1];
          if (lastSession && !lastSession.endTime) {
            lastSession.endTime = new Date();
            lastSession.durationMinutes = Math.floor(
              (lastSession.endTime.getTime() - lastSession.startTime.getTime()) / 60000
            );
            lastSession.notes = notes;
          }
          return { sessions };
        });
      },

      // UI actions
      setShowSessionComplete: (show) => set({ showSessionComplete: show }),
      setShowDeepWorkOverlay: (show) => set({ showDeepWorkOverlay: show }),
      setShowNewProjectModal: (show) => set({ showNewProjectModal: show }),

      toggleBell: () => set((state) => ({ bellEnabled: !state.bellEnabled })),

      ringBell: () => {
        // Play bell sound
        if (typeof window !== "undefined") {
          try {
            const audio = new Audio("/sounds/zen-bell.mp3");
            audio.volume = 0.5;
            audio.play().catch(() => {
              // Audio play failed, possibly due to autoplay policy
            });
          } catch {
            // Audio not available
          }
        }
      },

      // Stats
      updateStats: () => {
        const { timerTargetMinutes, timerSeconds, activeProjectId } = get();
        const elapsedMinutes = timerTargetMinutes - Math.floor(timerSeconds / 60);

        set((state) => ({
          stats: {
            ...state.stats,
            todayMinutes: state.stats.todayMinutes + elapsedMinutes,
            weekMinutes: state.stats.weekMinutes + elapsedMinutes,
            flowSessions: state.flowState === "flow"
              ? state.stats.flowSessions + 1
              : state.stats.flowSessions,
          },
          projects: state.projects.map((p) =>
            p.id === activeProjectId
              ? { ...p, completedMinutes: p.completedMinutes + elapsedMinutes }
              : p
          ),
        }));
      },

      resetDaily: () => {
        set((state) => ({
          stats: {
            ...state.stats,
            todayMinutes: 0,
          },
        }));
      },
    }),
    {
      name: "zen-storage",
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
        timerConfig: state.timerConfig,
        scheduleBlocks: state.scheduleBlocks,
        stats: state.stats,
        bellEnabled: state.bellEnabled,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);

// Timer tick hook
export function useZenTimerTick() {
  const { timerState, tickTimer } = useZenStore();

  if (typeof window !== "undefined" && timerState === "running") {
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }
}

// Get current zone based on time
export function getCurrentZone(): DeepWorkZone | null {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 9) return "morning";
  if (hour >= 13 && hour < 17) return "afternoon";
  if (hour >= 20 && hour < 23) return "evening";

  return null;
}

// Format time for display
export function formatZenTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
