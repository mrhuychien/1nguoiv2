"use client";

import { useEffect, useCallback } from "react";
import { useUser } from "./use-user";
import { createClient } from "@/lib/supabase/client";
import { useZenStore } from "@/store/zen-store";
import { ZenProject, ZenTask } from "@/types/zen";
import { Project, Task } from "@/types/database.types";

// Convert database Project to ZenProject
function toZenProject(project: Project, tasks: Task[]): ZenProject {
  const projectTasks = tasks
    .filter(t => t.project_id === project.id)
    .map(toZenTask);

  return {
    id: project.id,
    name: project.title,
    color: project.color || "#00d4ff",
    icon: project.icon || "folder",
    totalMinutes: project.total_minutes || 0,
    completedMinutes: project.completed_minutes || 0,
    tasks: projectTasks,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  };
}

// Convert database Task to ZenTask
function toZenTask(task: Task): ZenTask {
  return {
    id: task.id,
    projectId: task.project_id || "",
    title: task.title,
    status: task.status || "pending",
    estimatedMinutes: task.estimated_minutes || 25,
    actualMinutes: task.actual_minutes || 0,
    priority: task.priority || 1,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
    createdAt: new Date(task.created_at),
  };
}

export function useZenData() {
  const { user, isLoading: userLoading } = useUser();
  const {
    projects,
    stats,
    setProjects,
    setStats,
    isInitialized,
    setIsInitialized,
  } = useZenStore();

  // Fetch projects and tasks from Supabase
  const fetchZenData = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;

      // Fetch active projects
      const { data: projectsData, error: projectsError } = await supabaseAny
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("updated_at", { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch tasks for these projects
      const projectIds = (projectsData as Project[])?.map((p: Project) => p.id) || [];
      let tasksData: Task[] = [];

      if (projectIds.length > 0) {
        const { data: tasks, error: tasksError } = await supabaseAny
          .from("tasks")
          .select("*")
          .in("project_id", projectIds)
          .order("priority", { ascending: true });

        if (tasksError) throw tasksError;
        tasksData = (tasks as Task[]) || [];
      }

      // Convert to ZenProjects
      const zenProjects = ((projectsData as Project[]) || []).map((p: Project) =>
        toZenProject(p, tasksData)
      );

      setProjects(zenProjects);

      // Fetch today's stats
      const today = new Date().toISOString().split('T')[0];
      const { data: statsData } = await supabaseAny
        .from("zen_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (statsData) {
        setStats({
          todayMinutes: statsData.today_minutes || 0,
          weekMinutes: statsData.week_minutes || 0,
          streak: statsData.streak || 0,
          flowSessions: statsData.flow_sessions || 0,
          tasksCompleted: statsData.tasks_completed || 0,
          projectsActive: zenProjects.length,
        });
      }

      setIsInitialized(true);
      console.log("[Zen] Loaded", zenProjects.length, "projects");
    } catch (error) {
      console.error("[Zen] Error fetching data:", error);
      setIsInitialized(true); // Still mark as initialized to prevent infinite loading
    }
  }, [setProjects, setStats, setIsInitialized]);

  // Create a new project in Supabase
  const createProject = useCallback(async (
    name: string,
    color: string,
    icon: string
  ): Promise<ZenProject | null> => {
    if (!user?.id) return null;

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("projects")
        .insert({
          user_id: user.id,
          title: name,
          color,
          icon,
          status: "active",
          lifecycle: "building",
          health: "on-track",
          progress: 0,
          total_minutes: 0,
          completed_minutes: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const zenProject = toZenProject(data as Project, []);
      return zenProject;
    } catch (error) {
      console.error("[Zen] Error creating project:", error);
      return null;
    }
  }, [user?.id]);

  // Create a new task in Supabase
  const createTask = useCallback(async (
    projectId: string,
    title: string,
    estimatedMinutes: number
  ): Promise<ZenTask | null> => {
    if (!user?.id) return null;

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("tasks")
        .insert({
          user_id: user.id,
          project_id: projectId,
          title,
          status: "pending",
          estimated_minutes: estimatedMinutes,
          actual_minutes: 0,
          priority: 1,
          completed: false,
          is_daily_focus: false,
        })
        .select()
        .single();

      if (error) throw error;

      return toZenTask(data as Task);
    } catch (error) {
      console.error("[Zen] Error creating task:", error);
      return null;
    }
  }, [user?.id]);

  // Complete a task in Supabase
  const completeTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from("tasks")
        .update({
          status: "completed",
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[Zen] Error completing task:", error);
      return false;
    }
  }, []);

  // Delete a task in Supabase
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[Zen] Error deleting task:", error);
      return false;
    }
  }, []);

  // Update project minutes
  const updateProjectMinutes = useCallback(async (
    projectId: string,
    minutes: number
  ): Promise<boolean> => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;

      // Get current project data
      const { data: project, error: fetchError } = await supabaseAny
        .from("projects")
        .select("completed_minutes")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;

      const newMinutes = (project?.completed_minutes || 0) + minutes;

      const { error } = await supabaseAny
        .from("projects")
        .update({
          completed_minutes: newMinutes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[Zen] Error updating project minutes:", error);
      return false;
    }
  }, []);

  // Update today's stats
  const updateStats = useCallback(async (
    minutesToAdd: number,
    flowSession: boolean = false,
    taskCompleted: boolean = false
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const today = new Date().toISOString().split('T')[0];

      // Upsert today's stats
      const { error } = await supabaseAny
        .from("zen_stats")
        .upsert({
          user_id: user.id,
          date: today,
          today_minutes: stats.todayMinutes + minutesToAdd,
          week_minutes: stats.weekMinutes + minutesToAdd,
          flow_sessions: stats.flowSessions + (flowSession ? 1 : 0),
          tasks_completed: stats.tasksCompleted + (taskCompleted ? 1 : 0),
          projects_active: projects.length,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,date',
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[Zen] Error updating stats:", error);
      return false;
    }
  }, [user?.id, stats, projects.length]);

  // Save time entry when session ends
  const saveTimeEntry = useCallback(async (
    projectId: string,
    taskId: string | null,
    durationMinutes: number,
    startedAt: Date
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from("time_entries")
        .insert({
          user_id: user.id,
          project_id: projectId,
          task_id: taskId,
          duration: durationMinutes,
          started_at: startedAt.toISOString(),
          ended_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("[Zen] Error saving time entry:", error);
      return false;
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    if (userLoading || !user?.id || isInitialized) return;

    fetchZenData(user.id);
  }, [user?.id, userLoading, isInitialized, fetchZenData]);

  return {
    projects,
    stats,
    isLoading: userLoading || !isInitialized,
    userId: user?.id,
    // Actions
    createProject,
    createTask,
    completeTask,
    deleteTask,
    updateProjectMinutes,
    updateStats,
    saveTimeEntry,
    refetch: () => user?.id && fetchZenData(user.id),
  };
}
