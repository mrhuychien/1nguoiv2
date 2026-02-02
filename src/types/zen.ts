// Zen Dashboard Types
// Vibecoder Zen - Golden Rule Dashboard

export type DeepWorkZone = "morning" | "afternoon" | "evening";
export type TaskStatus = "pending" | "in_progress" | "completed" | "blocked" | "skipped";
export type FlowState = "focus" | "flow" | "rest" | "break";
export type TimerState = "idle" | "running" | "paused" | "completed";

// Template types
export type TemplateId =
  | "web-app"
  | "landing-page"
  | "api-service"
  | "mobile-app"
  | "content-project"
  | "ai-automation"
  | "blank";

export type ZoneType = "designing" | "building";

export interface TaskTemplate {
  id: string;
  phase: number;
  title: string;
  emoji: string;
  zone: ZoneType;
  estimatedMinutes: number;
}

export interface ProjectTemplate {
  id: TemplateId;
  name: string;
  emoji: string;
  description: string;
  tasks: TaskTemplate[];
}

export interface ProjectTask {
  id: string;
  projectId: string;
  phase: number;
  title: string;
  emoji: string;
  zone: ZoneType;
  estimatedMinutes: number;
  status: TaskStatus;
  completedAt: string | null;
  timeSpentMinutes: number;
  notes: string;
}

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
  // Template fields
  templateId?: TemplateId;
  currentPhase?: number;
  totalTasks?: number;
  completedTasks?: number;
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
  // Template task fields
  phase?: number;
  emoji?: string;
  zone?: ZoneType;
  notes?: string;
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

// Work log entry for tracking daily work history
export interface WorkLogEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  timestamp: string; // ISO timestamp
  taskId: string;
  taskTitle: string;
  taskEmoji?: string;
  projectId?: string;
  projectName?: string;
  projectColor?: string;
  durationMinutes: number;
  status: "completed" | "in_progress" | "paused";
  zone?: DeepWorkZone;
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
