"use client";

import { create } from "zustand";
import { Node, Link } from "@/types/database.types";
import { generateId } from "@/lib/utils";

export const NODE_COLORS = [
  { name: "Cyan", value: "#00d4ff" },
  { name: "Purple", value: "#a855f7" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#eab308" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
] as const;

type IdeaNode = Node;

type IdeaLink = Link;

interface IdeaState {
  nodes: IdeaNode[];
  links: IdeaLink[];
  selectedNodeId: string | null;
  graphId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface IdeaActions {
  setNodes: (nodes: IdeaNode[]) => void;
  setLinks: (links: IdeaLink[]) => void;
  setGraphId: (graphId: string) => void;

  // Node actions
  addNode: (x: number, y: number) => void;
  updateNode: (id: string, updates: Partial<IdeaNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  moveNode: (id: string, x: number, y: number) => void;

  // Link actions
  addLink: (sourceId: string, targetId: string) => void;
  deleteLink: (id: string) => void;

  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

interface IdeaGetters {
  getSelectedNode: () => IdeaNode | undefined;
  getNodeLinks: (nodeId: string) => IdeaLink[];
}

type IdeaStore = IdeaState & IdeaActions & IdeaGetters;

const initialState: IdeaState = {
  nodes: [],
  links: [],
  selectedNodeId: null,
  graphId: null,
  isLoading: false,
  error: null,
};

export const useIdeaStore = create<IdeaStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  setGraphId: (graphId) => set({ graphId }),

  addNode: (x, y) => {
    const newNode: IdeaNode = {
      id: generateId(),
      graph_id: get().graphId || "default",
      user_id: "user-1", // Will be replaced with actual user id
      title: "Ý tưởng mới",
      description: null,
      color: NODE_COLORS[0].value,
      position_x: x,
      position_y: y,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
    }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, ...updates, updated_at: new Date().toISOString() }
          : node
      ),
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      links: state.links.filter(
        (link) => link.source_id !== id && link.target_id !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  moveNode: (id, x, y) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, position_x: x, position_y: y }
          : node
      ),
    }));
  },

  addLink: (sourceId, targetId) => {
    // Don't create duplicate links or self-links
    const existingLink = get().links.find(
      (link) =>
        (link.source_id === sourceId && link.target_id === targetId) ||
        (link.source_id === targetId && link.target_id === sourceId)
    );

    if (existingLink || sourceId === targetId) return;

    const newLink: IdeaLink = {
      id: generateId(),
      graph_id: get().graphId || "default",
      user_id: "user-1",
      source_id: sourceId,
      target_id: targetId,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      links: [...state.links, newLink],
    }));
  },

  deleteLink: (id) => {
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),

  // Getters
  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((node) => node.id === selectedNodeId);
  },

  getNodeLinks: (nodeId) => {
    return get().links.filter(
      (link) => link.source_id === nodeId || link.target_id === nodeId
    );
  },
}));

// Mock data for demo - Obsidian-style spread layout
export const mockNodes: IdeaNode[] = [
  {
    id: "1",
    graph_id: "default",
    user_id: "user-1",
    title: "SaaS Idea",
    description: "Xây dựng một SaaS cho solopreneur",
    color: "#00d4ff",
    position_x: 400,
    position_y: 300,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    graph_id: "default",
    user_id: "user-1",
    title: "Marketing",
    description: "Chiến lược marketing",
    color: "#a855f7",
    position_x: 650,
    position_y: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    graph_id: "default",
    user_id: "user-1",
    title: "MVP Features",
    description: "Các tính năng cần có cho MVP",
    color: "#22c55e",
    position_x: 200,
    position_y: 450,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    graph_id: "default",
    user_id: "user-1",
    title: "Target Users",
    description: "Đối tượng người dùng mục tiêu",
    color: "#eab308",
    position_x: 700,
    position_y: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    graph_id: "default",
    user_id: "user-1",
    title: "Pricing",
    description: "Chiến lược giá cả",
    color: "#ec4899",
    position_x: 150,
    position_y: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    graph_id: "default",
    user_id: "user-1",
    title: "Tech Stack",
    description: "Công nghệ sử dụng: Next.js, Supabase",
    color: "#ef4444",
    position_x: 500,
    position_y: 550,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    graph_id: "default",
    user_id: "user-1",
    title: "Launch Strategy",
    description: "Kế hoạch ra mắt sản phẩm",
    color: "#a855f7",
    position_x: 850,
    position_y: 250,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    graph_id: "default",
    user_id: "user-1",
    title: "Content",
    description: "Nội dung và blog posts",
    color: "#22c55e",
    position_x: 550,
    position_y: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockLinks: IdeaLink[] = [
  {
    id: "l1",
    graph_id: "default",
    user_id: "user-1",
    source_id: "1",
    target_id: "2",
    created_at: new Date().toISOString(),
  },
  {
    id: "l2",
    graph_id: "default",
    user_id: "user-1",
    source_id: "1",
    target_id: "3",
    created_at: new Date().toISOString(),
  },
  {
    id: "l3",
    graph_id: "default",
    user_id: "user-1",
    source_id: "2",
    target_id: "4",
    created_at: new Date().toISOString(),
  },
  {
    id: "l4",
    graph_id: "default",
    user_id: "user-1",
    source_id: "3",
    target_id: "4",
    created_at: new Date().toISOString(),
  },
  {
    id: "l5",
    graph_id: "default",
    user_id: "user-1",
    source_id: "1",
    target_id: "5",
    created_at: new Date().toISOString(),
  },
  {
    id: "l6",
    graph_id: "default",
    user_id: "user-1",
    source_id: "3",
    target_id: "6",
    created_at: new Date().toISOString(),
  },
  {
    id: "l7",
    graph_id: "default",
    user_id: "user-1",
    source_id: "2",
    target_id: "7",
    created_at: new Date().toISOString(),
  },
  {
    id: "l8",
    graph_id: "default",
    user_id: "user-1",
    source_id: "2",
    target_id: "8",
    created_at: new Date().toISOString(),
  },
  {
    id: "l9",
    graph_id: "default",
    user_id: "user-1",
    source_id: "7",
    target_id: "4",
    created_at: new Date().toISOString(),
  },
  {
    id: "l10",
    graph_id: "default",
    user_id: "user-1",
    source_id: "5",
    target_id: "4",
    created_at: new Date().toISOString(),
  },
];
