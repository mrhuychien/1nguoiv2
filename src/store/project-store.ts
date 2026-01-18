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

// Mock data for demo - Project Lifecycle
export const mockProjects: Project[] = [
  // Active Projects (Building, Designing, Testing)
  {
    id: "1",
    user_id: "user-1",
    title: "Cloud Nexus AI",
    description: "Nền tảng AI cho doanh nghiệp nhỏ",
    status: "active",
    lifecycle: "building",
    health: "on-track",
    is_focus: true,
    progress: 78,
    deadline: "2024-05-12",
    last_task: "Tích hợp API Gateway",
    current_task: "Xử lý dữ liệu Real-time",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    user_id: "user-1",
    title: "Mobile Wallet UI",
    description: "Thiết kế giao diện ví điện tử",
    status: "active",
    lifecycle: "designing",
    health: "at-risk",
    is_focus: false,
    progress: 45,
    deadline: "2024-04-15",
    last_task: "User Flow & Wireframes",
    current_task: "Hi-fi UI Design System",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    user_id: "user-1",
    title: "E-commerce API",
    description: "Backend API cho nền tảng thương mại điện tử",
    status: "active",
    lifecycle: "testing",
    health: "on-track",
    is_focus: false,
    progress: 90,
    deadline: "2024-03-30",
    last_task: "Unit Testing - Core Module",
    current_task: "Load Testing & Security",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Ideas
  {
    id: "4",
    user_id: "user-1",
    title: "AI Content Writer",
    description: "Tự động hóa viết nội dung blog dựa trên từ khóa thị trường.",
    status: "active",
    lifecycle: "idea",
    health: "on-track",
    is_focus: false,
    progress: 0,
    deadline: null,
    last_task: null,
    current_task: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    user_id: "user-1",
    title: "Saas Boilerplate",
    description: "Bộ khung hoàn chỉnh cho các dự án React/NodeJS.",
    status: "active",
    lifecycle: "idea",
    health: "on-track",
    is_focus: false,
    progress: 0,
    deadline: null,
    last_task: null,
    current_task: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    user_id: "user-1",
    title: "Fitness App VR",
    description: "Tập luyện trong môi trường ảo cho người dùng tại nhà.",
    status: "active",
    lifecycle: "idea",
    health: "on-track",
    is_focus: false,
    progress: 0,
    deadline: null,
    last_task: null,
    current_task: null,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "7",
    user_id: "user-1",
    title: "Smart Home Hub",
    description: "Điều khiển tất cả thiết bị qua một giao diện thống nhất.",
    status: "active",
    lifecycle: "idea",
    health: "on-track",
    is_focus: false,
    progress: 0,
    deadline: null,
    last_task: null,
    current_task: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Shipped
  {
    id: "8",
    user_id: "user-1",
    title: "Portfolio v2.0",
    description: "Thiết kế lại portfolio cá nhân",
    status: "completed",
    lifecycle: "shipped",
    health: "on-track",
    is_focus: false,
    progress: 100,
    deadline: "2024-03-01",
    last_task: null,
    current_task: null,
    created_at: new Date().toISOString(),
    updated_at: "2024-03-01",
  },
  {
    id: "9",
    user_id: "user-1",
    title: "Beta Launch App",
    description: "Ứng dụng beta testing cho startup",
    status: "completed",
    lifecycle: "shipped",
    health: "on-track",
    is_focus: false,
    progress: 100,
    deadline: "2024-02-20",
    last_task: null,
    current_task: null,
    created_at: new Date().toISOString(),
    updated_at: "2024-02-20",
  },
  // Paused
  {
    id: "10",
    user_id: "user-1",
    title: "Legacy Refactor",
    description: "Tái cấu trúc hệ thống cũ",
    status: "archived",
    lifecycle: "paused",
    health: "blocked",
    is_focus: false,
    progress: 35,
    deadline: null,
    last_task: null,
    current_task: null,
    created_at: new Date().toISOString(),
    updated_at: "2024-01-15",
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
