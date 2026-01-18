"use client";

import { create } from "zustand";
import { Project, Task } from "@/types/database.types";

interface ProjectState {
  projects: Project[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  setFocusProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface ProjectGetters {
  getFocusProject: () => Project | undefined;
  getActiveProjects: () => Project[];
  getDailyFocusTasks: () => Task[];
  getProjectTasks: (projectId: string) => Task[];
}

type ProjectStore = ProjectState & ProjectActions & ProjectGetters;

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  tasks: [],
  isLoading: false,
  error: null,

  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      tasks: state.tasks.filter((t) => t.project_id !== id),
    })),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleTaskComplete: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })),

  setFocusProject: (id) =>
    set((state) => ({
      projects: state.projects.map((p) => ({
        ...p,
        is_focus: p.id === id,
      })),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Getters
  getFocusProject: () => get().projects.find((p) => p.is_focus),

  getActiveProjects: () =>
    get()
      .projects.filter((p) => p.status === "active" && !p.is_focus)
      .slice(0, 3),

  getDailyFocusTasks: () =>
    get()
      .tasks.filter((t) => t.is_daily_focus)
      .slice(0, 3),

  getProjectTasks: (projectId) =>
    get().tasks.filter((t) => t.project_id === projectId),
}));

// Mock data for demo
export const mockProjects: Project[] = [
  {
    id: "1",
    user_id: "user-1",
    title: "SaaS MVP",
    description: "Xây dựng MVP cho sản phẩm SaaS đầu tiên",
    status: "active",
    health: "on-track",
    is_focus: true,
    progress: 65,
    deadline: "2024-03-01",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    title: "Landing Page Redesign",
    description: "Thiết kế lại landing page để tăng conversion",
    status: "active",
    health: "at-risk",
    is_focus: false,
    progress: 30,
    deadline: "2024-02-15",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "user-1",
    title: "Content Marketing",
    description: "Viết 10 bài blog về productivity",
    status: "active",
    health: "on-track",
    is_focus: false,
    progress: 40,
    deadline: "2024-02-28",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockTasks: Task[] = [
  {
    id: "1",
    user_id: "user-1",
    project_id: "1",
    title: "Hoàn thành API authentication",
    description: null,
    completed: false,
    is_daily_focus: true,
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    project_id: "1",
    title: "Review PR từ backend",
    description: null,
    completed: true,
    is_daily_focus: true,
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "user-1",
    project_id: "2",
    title: "Thiết kế hero section",
    description: null,
    completed: false,
    is_daily_focus: true,
    due_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
