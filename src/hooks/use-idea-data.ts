"use client";

import { useEffect } from "react";
import { useUser } from "./use-user";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";

interface UseIdeaDataOptions {
  useMockData?: boolean;
}

export function useIdeaData(options: UseIdeaDataOptions = {}) {
  const { useMockData = false } = options;
  const { user, isLoading: userLoading } = useUser();
  const {
    nodes,
    links,
    graphId,
    isLoading,
    isInitialized,
    error,
    fetchAll,
    setNodes,
    setLinks,
    setGraphId,
  } = useIdeaStore();

  useEffect(() => {
    // Wait for user auth to complete
    if (userLoading) return;

    // If using mock data (for development/demo)
    if (useMockData) {
      if (nodes.length === 0) {
        setNodes(mockNodes);
        setLinks(mockLinks);
        setGraphId("default");
      }
      return;
    }

    // Fetch data from Supabase
    if (user?.id && !isInitialized) {
      console.log("[Ideas] Fetching ideas for user:", user.id);
      fetchAll(user.id);
    }
  }, [user?.id, userLoading, useMockData, isInitialized, nodes.length, fetchAll, setNodes, setLinks, setGraphId]);

  return {
    nodes,
    links,
    graphId,
    isLoading: isLoading || userLoading,
    isInitialized,
    error,
    userId: user?.id,
  };
}
