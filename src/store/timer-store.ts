"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedTime: number;
  pausedTime: number;
  projectId: string | null;
  taskId: string | null;
}

interface TimerActions {
  start: (projectId?: string, taskId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  reset: () => void;
}

type TimerStore = TimerState & TimerActions;

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      isPaused: false,
      startTime: null,
      elapsedTime: 0,
      pausedTime: 0,
      projectId: null,
      taskId: null,

      start: (projectId?: string, taskId?: string) => {
        set({
          isRunning: true,
          isPaused: false,
          startTime: Date.now(),
          elapsedTime: 0,
          pausedTime: 0,
          projectId: projectId || null,
          taskId: taskId || null,
        });
      },

      pause: () => {
        const { elapsedTime } = get();
        set({
          isPaused: true,
          pausedTime: elapsedTime,
        });
      },

      resume: () => {
        set({
          isPaused: false,
          startTime: Date.now(),
        });
      },

      stop: () => {
        const { elapsedTime } = get();
        // Only save if elapsed time is at least 60 seconds
        if (elapsedTime >= 60) {
          // Here you would save to Supabase
          // For now, we'll just log
          console.log("Time entry:", {
            duration: elapsedTime,
            projectId: get().projectId,
            taskId: get().taskId,
          });
        }

        set({
          isRunning: false,
          isPaused: false,
          startTime: null,
          elapsedTime: 0,
          pausedTime: 0,
          projectId: null,
          taskId: null,
        });
      },

      tick: () => {
        const { isRunning, isPaused, startTime, pausedTime } = get();
        if (isRunning && !isPaused && startTime) {
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000) + pausedTime;
          set({ elapsedTime: elapsed });
        }
      },

      reset: () => {
        set({
          isRunning: false,
          isPaused: false,
          startTime: null,
          elapsedTime: 0,
          pausedTime: 0,
          projectId: null,
          taskId: null,
        });
      },
    }),
    {
      name: "timer-storage",
      partialize: (state) => ({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
        pausedTime: state.pausedTime,
        projectId: state.projectId,
        taskId: state.taskId,
      }),
    }
  )
);

// Timer tick effect - call this in a useEffect
export function useTimerTick() {
  const { isRunning, isPaused, tick } = useTimerStore();

  if (typeof window !== "undefined") {
    if (isRunning && !isPaused) {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }
}
