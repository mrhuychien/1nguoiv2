// Zen Dashboard Types
// Vibecoder Zen - Golden Rule Dashboard

export type DeepWorkZone = "morning" | "afternoon" | "evening";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked";
export type FlowState = "focus" | "flow" | "rest" | "break";
export type TimerState = "idle" | "running" | "paused" | "completed";

export interface ZenProject {
  id: string;
  name: string;
  color: string;
  icon: string;
  totalMinutes: number;
  completedMinutes: number;
  tasks: ZenTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ZenTask {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ZenSession {
  id: string;
  projectId: string;
  taskId?: string;
  startTime: Date;
  endTime?: Date;
  durationMinutes: number;
  zone: DeepWorkZone;
  flowState: FlowState;
  notes?: string;
}

export interface ZenScheduleBlock {
  id: string;
  zone: DeepWorkZone;
  label: string;
  startHour: number;
  endHour: number;
  color: string;
  isActive: boolean;
}

export interface ZenStats {
  todayMinutes: number;
  weekMinutes: number;
  streak: number;
  flowSessions: number;
  tasksCompleted: number;
  projectsActive: number;
}

// Timer configuration
export interface ZenTimerConfig {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

// Default schedule blocks based on Golden Rule
export const DEFAULT_SCHEDULE_BLOCKS: ZenScheduleBlock[] = [
  {
    id: "morning",
    zone: "morning",
    label: "Sáng sớm",
    startHour: 5,
    endHour: 9,
    color: "#fbbf24", // amber
    isActive: false,
  },
  {
    id: "afternoon",
    zone: "afternoon",
    label: "Chiều",
    startHour: 13,
    endHour: 17,
    color: "#f97316", // orange
    isActive: false,
  },
  {
    id: "evening",
    zone: "evening",
    label: "Tối",
    startHour: 20,
    endHour: 23,
    color: "#8b5cf6", // violet
    isActive: false,
  },
];

// Default timer config (Pomodoro-style)
export const DEFAULT_TIMER_CONFIG: ZenTimerConfig = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};
