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
  ProjectTask,
  TemplateId,
  TaskStatus,
  WorkLogEntry,
} from "@/types/zen";
import { generateId } from "@/lib/utils";
import {
  generateTasksFromTemplate,
  getTemplateById,
} from "@/lib/data/project-templates";

interface ZenStoreState {
  // Data loading
  isInitialized: boolean;

  // Projects & Tasks
  projects: ZenProject[];
  activeProjectId: string | null;
  activeTaskId: string | null;

  // Template Tasks (separate from project tasks)
  templateTasks: ProjectTask[];

  // Garden Tasks - only task IDs that have been dropped into the garden
  gardenTaskIds: string[];

  // Current Timer Task
  currentTimerTaskId: string | null;
  currentTimerTaskType: "template" | "manual" | null;

  // Timer
  timerState: TimerState;
  timerSeconds: number;
  timerTargetMinutes: number;
  timerConfig: ZenTimerConfig;
  sessionsCompleted: number;
  timerStartedAt: number | null; // Timestamp when timer started
  timerPausedAt: number | null;  // Timestamp when timer was paused (to track pause duration)

  // Flow & Focus
  flowState: FlowState;
  isDeepWorkMode: boolean;
  currentZone: DeepWorkZone | null;

  // Schedule
  scheduleBlocks: ZenScheduleBlock[];

  // Sessions history
  sessions: ZenSession[];

  // Work log - daily work history
  workLog: WorkLogEntry[];

  // Panel order for customizable layout
  centerPanelOrder: string[];
  rightPanelOrder: string[];

  // Stats
  stats: ZenStats;

  // UI State
  showSessionComplete: boolean;
  showTaskCompleteDialog: boolean;
  showDeepWorkOverlay: boolean;
  showNewProjectModal: boolean;
  bellEnabled: boolean;
}

interface ZenStoreActions {
  // Data setters (for Supabase sync)
  setProjects: (projects: ZenProject[]) => void;
  setStats: (stats: ZenStats) => void;
  setIsInitialized: (initialized: boolean) => void;

  // Project actions
  addProject: (name: string, color: string, icon: string) => void;
  addProjectWithTemplate: (
    name: string,
    color: string,
    icon: string,
    templateId: TemplateId
  ) => void;
  updateProject: (id: string, updates: Partial<ZenProject>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // Task actions
  addTask: (projectId: string, title: string, estimatedMinutes: number) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<ZenTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  completeTask: (projectId: string, taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;

  // Template Task actions
  getProjectTemplateTasks: (projectId: string) => ProjectTask[];
  getCurrentTemplateTask: (projectId: string) => ProjectTask | null;
  updateTemplateTaskStatus: (taskId: string, status: TaskStatus) => void;
  completeTemplateTask: (taskId: string) => void;
  skipTemplateTask: (taskId: string) => void;
  startTemplateTask: (taskId: string) => void;
  resetTemplateTask: (taskId: string) => void;
  updateTemplateTaskNotes: (taskId: string, notes: string) => void;
  addTemplateTaskTime: (taskId: string, minutes: number) => void;

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

  // Timer Task actions
  setTimerTask: (taskId: string, taskType: "template" | "manual") => void;
  clearTimerTask: () => void;
  getCurrentTimerTask: () => { id: string; title: string; emoji?: string } | null;

  // Garden Task actions
  addToGarden: (taskId: string) => void;
  removeFromGarden: (taskId: string) => void;
  clearGarden: () => void;

  // Work Log actions
  addWorkLogEntry: (entry: Omit<WorkLogEntry, "id" | "date" | "timestamp">) => void;
  updateWorkLogEntry: (id: string, updates: Partial<WorkLogEntry>) => void;
  getLatestWorkLogEntry: () => WorkLogEntry | null;
  getTodayWorkLog: () => WorkLogEntry[];
  getWorkLogByDate: (date: string) => WorkLogEntry[];
  clearWorkLog: () => void;

  // Panel order actions
  setCenterPanelOrder: (order: string[]) => void;
  setRightPanelOrder: (order: string[]) => void;
  resetPanelOrder: () => void;

  // UI actions
  setShowSessionComplete: (show: boolean) => void;
  setShowTaskCompleteDialog: (show: boolean) => void;
  setShowDeepWorkOverlay: (show: boolean) => void;
  setShowNewProjectModal: (show: boolean) => void;
  toggleBell: () => void;
  ringBell: () => void;

  // Stats
  updateStats: () => void;
  resetDaily: () => void;
}

type ZenStore = ZenStoreState & ZenStoreActions;

const initialState: ZenStoreState = {
  isInitialized: false,

  projects: [],
  activeProjectId: null,
  activeTaskId: null,

  templateTasks: [],

  gardenTaskIds: [],

  currentTimerTaskId: null,
  currentTimerTaskType: null,

  timerState: "idle",
  timerSeconds: 0,
  timerTargetMinutes: 25,
  timerConfig: DEFAULT_TIMER_CONFIG,
  sessionsCompleted: 0,
  timerStartedAt: null,
  timerPausedAt: null,

  flowState: "rest",
  isDeepWorkMode: false,
  currentZone: null,

  scheduleBlocks: DEFAULT_SCHEDULE_BLOCKS,
  sessions: [],

  workLog: [],

  // Default panel order
  centerPanelOrder: ["garden", "worklog"],
  rightPanelOrder: ["schedule", "session-result", "stats"],

  stats: {
    todayMinutes: 0,
    weekMinutes: 0,
    streak: 0,
    flowSessions: 0,
    tasksCompleted: 0,
    projectsActive: 0,
  },

  showSessionComplete: false,
  showTaskCompleteDialog: false,
  showDeepWorkOverlay: false,
  showNewProjectModal: false,
  bellEnabled: true,
};

export const useZenStore = create<ZenStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Data setters (for Supabase sync)
      setProjects: (projects) => {
        set({ projects });
        // Set first project as active if none selected
        if (projects.length > 0 && !get().activeProjectId) {
          set({ activeProjectId: projects[0].id });
          // Set first task as active if available
          const firstTask = projects[0].tasks[0];
          if (firstTask && !get().activeTaskId) {
            set({ activeTaskId: firstTask.id });
          }
        }
      },

      setStats: (stats) => set({ stats }),

      setIsInitialized: (initialized) => set({ isInitialized: initialized }),

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

      addProjectWithTemplate: (name, color, icon, templateId) => {
        const template = getTemplateById(templateId);
        const projectId = generateId();
        const totalMinutes = template
          ? template.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)
          : 0;

        const newProject: ZenProject = {
          id: projectId,
          name,
          color,
          icon,
          totalMinutes,
          completedMinutes: 0,
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          templateId,
          currentPhase: 1,
          totalTasks: template?.tasks.length || 0,
          completedTasks: 0,
        };

        // Generate template tasks
        const newTasks = generateTasksFromTemplate(projectId, templateId);

        set((state) => ({
          projects: [...state.projects, newProject],
          templateTasks: [...state.templateTasks, ...newTasks],
          activeProjectId: projectId,
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

      // Template Task actions
      getProjectTemplateTasks: (projectId) => {
        return get()
          .templateTasks.filter((t) => t.projectId === projectId)
          .sort((a, b) => a.phase - b.phase);
      },

      getCurrentTemplateTask: (projectId) => {
        const tasks = get().getProjectTemplateTasks(projectId);
        return (
          tasks.find((t) => t.status === "in_progress") ||
          tasks.find((t) => t.status === "pending") ||
          null
        );
      },

      updateTemplateTaskStatus: (taskId, status) => {
        set({
          templateTasks: get().templateTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status,
                  completedAt:
                    status === "completed" ? new Date().toISOString() : t.completedAt,
                }
              : t
          ),
        });

        // Update project progress
        const task = get().templateTasks.find((t) => t.id === taskId);
        if (task) {
          const projectTasks = get().getProjectTemplateTasks(task.projectId);
          const completedCount = projectTasks.filter(
            (t) => t.status === "completed"
          ).length;
          const currentPhase =
            projectTasks.find(
              (t) => t.status === "in_progress" || t.status === "pending"
            )?.phase || projectTasks.length;

          const completedMinutes = projectTasks
            .filter((t) => t.status === "completed")
            .reduce((sum, t) => sum + t.timeSpentMinutes, 0);

          // Update the project
          set({
            projects: get().projects.map((p) =>
              p.id === task.projectId
                ? {
                    ...p,
                    completedTasks: completedCount,
                    currentPhase,
                    completedMinutes,
                    updatedAt: new Date(),
                  }
                : p
            ),
          });
        }
      },

      completeTemplateTask: (taskId) => {
        get().updateTemplateTaskStatus(taskId, "completed");
      },

      skipTemplateTask: (taskId) => {
        get().updateTemplateTaskStatus(taskId, "skipped");
      },

      startTemplateTask: (taskId) => {
        // Set all other in_progress tasks to pending first
        const task = get().templateTasks.find((t) => t.id === taskId);
        if (!task) return;

        set({
          templateTasks: get().templateTasks.map((t) => ({
            ...t,
            status:
              t.projectId === task.projectId && t.status === "in_progress"
                ? "pending"
                : t.status,
          })),
        });

        get().updateTemplateTaskStatus(taskId, "in_progress");
      },

      resetTemplateTask: (taskId) => {
        // Reset task back to pending status
        const task = get().templateTasks.find((t) => t.id === taskId);
        if (!task) return;

        set({
          templateTasks: get().templateTasks.map((t) =>
            t.id === taskId
              ? { ...t, status: "pending" as TaskStatus, completedAt: null }
              : t
          ),
        });

        // Update project progress
        const projectTasks = get().getProjectTemplateTasks(task.projectId);
        const completedCount = projectTasks.filter(
          (t) => t.id !== taskId && t.status === "completed"
        ).length;
        const currentPhase =
          projectTasks.find(
            (t) => t.status === "in_progress" || t.status === "pending"
          )?.phase || 1;

        const completedMinutes = projectTasks
          .filter((t) => t.id !== taskId && t.status === "completed")
          .reduce((sum, t) => sum + t.timeSpentMinutes, 0);

        set({
          projects: get().projects.map((p) =>
            p.id === task.projectId
              ? {
                  ...p,
                  completedTasks: completedCount,
                  currentPhase,
                  completedMinutes,
                  updatedAt: new Date(),
                }
              : p
          ),
        });
      },

      updateTemplateTaskNotes: (taskId, notes) => {
        set({
          templateTasks: get().templateTasks.map((t) =>
            t.id === taskId ? { ...t, notes } : t
          ),
        });
      },

      addTemplateTaskTime: (taskId, minutes) => {
        set({
          templateTasks: get().templateTasks.map((t) =>
            t.id === taskId
              ? { ...t, timeSpentMinutes: t.timeSpentMinutes + minutes }
              : t
          ),
        });
      },

      // Timer actions - using timestamps for accurate timing even when tab is in background
      startTimer: (minutes) => {
        const targetMinutes = minutes || get().timerTargetMinutes;
        const now = Date.now();
        set({
          timerState: "running",
          timerSeconds: targetMinutes * 60,
          timerTargetMinutes: targetMinutes,
          timerStartedAt: now,
          timerPausedAt: null,
          flowState: "focus",
        });
      },

      pauseTimer: () => {
        const now = Date.now();
        set({
          timerState: "paused",
          timerPausedAt: now,
        });
      },

      resumeTimer: () => {
        const { timerStartedAt, timerPausedAt } = get();
        const now = Date.now();

        // Adjust start time to account for pause duration
        if (timerStartedAt && timerPausedAt) {
          const pauseDuration = now - timerPausedAt;
          set({
            timerState: "running",
            timerStartedAt: timerStartedAt + pauseDuration,
            timerPausedAt: null,
          });
        } else {
          set({ timerState: "running", timerPausedAt: null });
        }
      },

      stopTimer: () => {
        const { timerTargetMinutes, timerSeconds } = get();
        const elapsedMinutes = timerTargetMinutes - Math.floor(timerSeconds / 60);

        if (elapsedMinutes > 0) {
          get().updateStats();
        }

        set({
          timerState: "idle",
          timerSeconds: 0,
          timerStartedAt: null,
          timerPausedAt: null,
          flowState: "rest",
        });
      },

      tickTimer: () => {
        const { timerState, timerStartedAt, timerTargetMinutes, bellEnabled } = get();
        if (timerState !== "running" || !timerStartedAt) return;

        const now = Date.now();
        const totalSeconds = timerTargetMinutes * 60;
        const elapsedSeconds = Math.floor((now - timerStartedAt) / 1000);
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        if (remainingSeconds <= 0) {
          // Timer completed
          set({
            timerState: "completed",
            timerSeconds: 0,
            timerStartedAt: null,
            timerPausedAt: null,
            sessionsCompleted: get().sessionsCompleted + 1,
            showSessionComplete: true,
            flowState: "rest",
          });

          if (bellEnabled) {
            get().ringBell();
          }
        } else {
          // Check for flow state transition (after 10 minutes of focus)
          const elapsedMinutes = Math.floor(elapsedSeconds / 60);
          if (elapsedMinutes >= 10 && get().flowState === "focus") {
            set({ flowState: "flow" });
          }

          set({ timerSeconds: remainingSeconds });
        }
      },

      resetTimer: () => {
        set({
          timerState: "idle",
          timerSeconds: 0,
          timerStartedAt: null,
          timerPausedAt: null,
          flowState: "rest",
        });
      },

      setTimerTarget: (minutes) => set({ timerTargetMinutes: minutes }),

      // Flow actions
      setFlowState: (flowState) => set({ flowState }),

      enterDeepWorkMode: () => {
        const { timerState } = get();
        set({
          isDeepWorkMode: true,
          showDeepWorkOverlay: true,
        });
        // Start timer automatically in deep work mode if not already running
        if (timerState !== "running") {
          get().startTimer();
        }
      },

      exitDeepWorkMode: () => {
        // Only toggle overlay, timer continues running
        set({
          isDeepWorkMode: false,
          showDeepWorkOverlay: false,
        });
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

      // Timer Task actions
      setTimerTask: (taskId, taskType) => {
        set({ currentTimerTaskId: taskId, currentTimerTaskType: taskType });
      },

      clearTimerTask: () => {
        set({ currentTimerTaskId: null, currentTimerTaskType: null });
      },

      getCurrentTimerTask: () => {
        const { currentTimerTaskId, currentTimerTaskType, templateTasks, projects, activeProjectId } = get();
        if (!currentTimerTaskId || !currentTimerTaskType) return null;

        if (currentTimerTaskType === "template") {
          const task = templateTasks.find((t) => t.id === currentTimerTaskId);
          if (task) {
            return { id: task.id, title: task.title, emoji: task.emoji };
          }
        } else {
          // Manual task
          const project = projects.find((p) => p.id === activeProjectId);
          const task = project?.tasks.find((t) => t.id === currentTimerTaskId);
          if (task) {
            return { id: task.id, title: task.title };
          }
        }
        return null;
      },

      // Garden Task actions
      addToGarden: (taskId) => {
        set((state) => ({
          gardenTaskIds: state.gardenTaskIds.includes(taskId)
            ? state.gardenTaskIds
            : [...state.gardenTaskIds, taskId],
        }));
      },

      removeFromGarden: (taskId) => {
        set((state) => ({
          gardenTaskIds: state.gardenTaskIds.filter((id) => id !== taskId),
        }));
      },

      clearGarden: () => {
        set({ gardenTaskIds: [] });
      },

      // Work Log actions
      addWorkLogEntry: (entry) => {
        const now = new Date();
        const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
        const newEntry: WorkLogEntry = {
          ...entry,
          id: generateId(),
          date,
          timestamp: now.toISOString(),
        };
        set((state) => ({
          workLog: [newEntry, ...state.workLog],
        }));
      },

      updateWorkLogEntry: (id, updates) => {
        set((state) => ({
          workLog: state.workLog.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
        }));
      },

      getLatestWorkLogEntry: () => {
        const { workLog } = get();
        return workLog.length > 0 ? workLog[0] : null;
      },

      getTodayWorkLog: () => {
        const today = new Date().toISOString().split("T")[0];
        return get().workLog.filter((entry) => entry.date === today);
      },

      getWorkLogByDate: (date) => {
        return get().workLog.filter((entry) => entry.date === date);
      },

      clearWorkLog: () => {
        set({ workLog: [] });
      },

      // Panel order actions
      setCenterPanelOrder: (order) => {
        set({ centerPanelOrder: order });
      },

      setRightPanelOrder: (order) => {
        set({ rightPanelOrder: order });
      },

      resetPanelOrder: () => {
        set({
          centerPanelOrder: ["garden", "worklog"],
          rightPanelOrder: ["schedule", "session-result", "stats"],
        });
      },

      // UI actions
      setShowSessionComplete: (show) => set({ showSessionComplete: show }),
      setShowTaskCompleteDialog: (show) => set({ showTaskCompleteDialog: show }),
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
        templateTasks: state.templateTasks,
        gardenTaskIds: state.gardenTaskIds,
        workLog: state.workLog,
        centerPanelOrder: state.centerPanelOrder,
        rightPanelOrder: state.rightPanelOrder,
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
