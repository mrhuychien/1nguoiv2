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
    fetchAll,
    setProjects,
    setTasks,
  } = useProjectStore();

  useEffect(() => {
    console.log("[ProjectData Debug] Effect running:", { userLoading, userId: user?.id, isInitialized, useMockData });

    if (userLoading) {
      console.log("[ProjectData Debug] User still loading, waiting...");
      return;
    }

    // If using mock data (for development/demo)
    if (useMockData) {
      if (projects.length === 0) {
        setProjects(mockProjects);
        setTasks(mockTasks);
      }
      return;
    }

    // Fetch projects and tasks in parallel from Supabase
    if (user?.id && !isInitialized) {
      console.log("[ProjectData Debug] Calling fetchAll for user:", user.id);
      fetchAll(user.id);
    } else {
      console.log("[ProjectData Debug] Not fetching:", { hasUserId: !!user?.id, isInitialized });
    }
  }, [user?.id, userLoading, useMockData, isInitialized, projects.length, fetchAll, setProjects, setTasks]);

  return {
    projects,
    tasks,
    isLoading: isLoading || userLoading,
    isInitialized,
    error,
    userId: user?.id,
  };
}
