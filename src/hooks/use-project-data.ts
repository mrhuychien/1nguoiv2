"use client";

import { useEffect } from "react";
import { useUser } from "./use-user";
import { useProjectStore, mockProjects, mockTasks } from "@/store/project-store";

interface UseProjectDataOptions {
  useMockData?: boolean;
}

export function useProjectData(options: UseProjectDataOptions = {}) {
  const { useMockData = false } = options;
  const { user, isLoading: userLoading } = useUser();
  const {
    projects,
    tasks,
    isLoading,
    isInitialized,
    error,
    fetchProjects,
    fetchTasks,
    setProjects,
    setTasks,
  } = useProjectStore();

  useEffect(() => {
    if (userLoading) return;

    // If using mock data (for development/demo)
    if (useMockData) {
      if (projects.length === 0) {
        setProjects(mockProjects);
        setTasks(mockTasks);
      }
      return;
    }

    // Fetch from Supabase
    if (user?.id && !isInitialized) {
      fetchProjects(user.id);
      fetchTasks(user.id);
    }
  }, [user?.id, userLoading, useMockData, isInitialized, projects.length, fetchProjects, fetchTasks, setProjects, setTasks]);

  return {
    projects,
    tasks,
    isLoading: isLoading || userLoading,
    isInitialized,
    error,
    userId: user?.id,
  };
}
