"use client";

import { create } from "zustand";
import { Node, Link } from "@/types/database.types";
import { generateId } from "@/lib/utils";

// Obsidian-style color palette
export const NODE_COLORS = [
  { name: "Purple", value: "#a882ff" },
  { name: "Teal", value: "#6ee7b7" },
  { name: "Blue", value: "#7dd3fc" },
  { name: "Pink", value: "#f9a8d4" },
  { name: "Orange", value: "#fdba74" },
  { name: "Gray", value: "#a1a1aa" },
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
  searchQuery: string;
  searchResults: string[];
  connectMode: boolean;
  connectSourceId: string | null;
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

  // Connect mode actions
  startConnectMode: (sourceId: string) => void;
  cancelConnectMode: () => void;
  completeConnection: (targetId: string) => void;

  // State
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Search
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
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
  searchQuery: "",
  searchResults: [],
  connectMode: false,
  connectSourceId: null,
};

export const useIdeaStore = create<IdeaStore>((set, get) => ({
  ...initialState,

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  setGraphId: (graphId) => set({ graphId }),

  addNode: (x, y) => {
    const randomColor = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)].value;
    const newNode: IdeaNode = {
      id: generateId(),
      graph_id: get().graphId || "default",
      user_id: "user-1",
      title: "Ý tưởng mới",
      description: null,
      color: randomColor,
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

  startConnectMode: (sourceId) => {
    set({ connectMode: true, connectSourceId: sourceId });
  },

  cancelConnectMode: () => {
    set({ connectMode: false, connectSourceId: null });
  },

  completeConnection: (targetId) => {
    const { connectSourceId, links, graphId } = get();

    if (!connectSourceId || connectSourceId === targetId) {
      set({ connectMode: false, connectSourceId: null });
      return;
    }

    // Check for existing link
    const existingLink = links.find(
      (link) =>
        (link.source_id === connectSourceId && link.target_id === targetId) ||
        (link.source_id === targetId && link.target_id === connectSourceId)
    );

    if (existingLink) {
      set({ connectMode: false, connectSourceId: null });
      return;
    }

    const newLink: IdeaLink = {
      id: generateId(),
      graph_id: graphId || "default",
      user_id: "user-1",
      source_id: connectSourceId,
      target_id: targetId,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      links: [...state.links, newLink],
      connectMode: false,
      connectSourceId: null,
    }));
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),

  setSearchQuery: (query) => {
    const { nodes } = get();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      set({ searchQuery: "", searchResults: [] });
      return;
    }

    const results = nodes
      .filter(
        (node) =>
          node.title.toLowerCase().includes(normalizedQuery) ||
          (node.description && node.description.toLowerCase().includes(normalizedQuery))
      )
      .map((node) => node.id);

    set({ searchQuery: query, searchResults: results });
  },

  clearSearch: () => set({ searchQuery: "", searchResults: [] }),

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

// Mock data for demo - Obsidian-style natural cluster layout
export const mockNodes: IdeaNode[] = [
  // Central hub - SaaS Idea
  {
    id: "1",
    graph_id: "default",
    user_id: "user-1",
    title: "SaaS Platform",
    description: "Nền tảng cho solopreneur",
    color: "#a882ff", // Purple - central
    position_x: 450,
    position_y: 320,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Marketing cluster
  {
    id: "2",
    graph_id: "default",
    user_id: "user-1",
    title: "Marketing",
    description: "Chiến lược marketing",
    color: "#f9a8d4", // Pink
    position_x: 680,
    position_y: 180,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "8",
    graph_id: "default",
    user_id: "user-1",
    title: "Content",
    description: "Blog và social media",
    color: "#f9a8d4",
    position_x: 820,
    position_y: 120,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "9",
    graph_id: "default",
    user_id: "user-1",
    title: "SEO",
    description: "Tối ưu tìm kiếm",
    color: "#f9a8d4",
    position_x: 850,
    position_y: 240,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Product cluster
  {
    id: "3",
    graph_id: "default",
    user_id: "user-1",
    title: "MVP Features",
    description: "Các tính năng MVP",
    color: "#6ee7b7", // Teal
    position_x: 200,
    position_y: 400,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    graph_id: "default",
    user_id: "user-1",
    title: "Tech Stack",
    description: "Next.js, Supabase",
    color: "#6ee7b7",
    position_x: 100,
    position_y: 520,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "10",
    graph_id: "default",
    user_id: "user-1",
    title: "Database",
    description: "PostgreSQL schema",
    color: "#6ee7b7",
    position_x: 250,
    position_y: 580,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "11",
    graph_id: "default",
    user_id: "user-1",
    title: "API Design",
    description: "RESTful endpoints",
    color: "#6ee7b7",
    position_x: 50,
    position_y: 350,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Business cluster
  {
    id: "4",
    graph_id: "default",
    user_id: "user-1",
    title: "Target Users",
    description: "Solopreneur VN",
    color: "#7dd3fc", // Blue
    position_x: 700,
    position_y: 420,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    graph_id: "default",
    user_id: "user-1",
    title: "Pricing",
    description: "Freemium model",
    color: "#fdba74", // Orange
    position_x: 220,
    position_y: 180,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "12",
    graph_id: "default",
    user_id: "user-1",
    title: "Revenue",
    description: "Subscription tiers",
    color: "#fdba74",
    position_x: 120,
    position_y: 80,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Launch cluster
  {
    id: "7",
    graph_id: "default",
    user_id: "user-1",
    title: "Launch Plan",
    description: "Ra mắt sản phẩm",
    color: "#a882ff",
    position_x: 600,
    position_y: 550,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "13",
    graph_id: "default",
    user_id: "user-1",
    title: "Beta Users",
    description: "Early adopters",
    color: "#7dd3fc",
    position_x: 780,
    position_y: 520,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Additional nodes for organic feel
  {
    id: "14",
    graph_id: "default",
    user_id: "user-1",
    title: "UI/UX",
    description: "Thiết kế giao diện",
    color: "#a1a1aa", // Gray
    position_x: 350,
    position_y: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "15",
    graph_id: "default",
    user_id: "user-1",
    title: "Analytics",
    description: "Tracking & metrics",
    color: "#a1a1aa",
    position_x: 550,
    position_y: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockLinks: IdeaLink[] = [
  // Central connections
  { id: "l1", graph_id: "default", user_id: "user-1", source_id: "1", target_id: "2", created_at: new Date().toISOString() },
  { id: "l2", graph_id: "default", user_id: "user-1", source_id: "1", target_id: "3", created_at: new Date().toISOString() },
  { id: "l3", graph_id: "default", user_id: "user-1", source_id: "1", target_id: "4", created_at: new Date().toISOString() },
  { id: "l4", graph_id: "default", user_id: "user-1", source_id: "1", target_id: "5", created_at: new Date().toISOString() },
  { id: "l5", graph_id: "default", user_id: "user-1", source_id: "1", target_id: "7", created_at: new Date().toISOString() },

  // Marketing cluster
  { id: "l6", graph_id: "default", user_id: "user-1", source_id: "2", target_id: "8", created_at: new Date().toISOString() },
  { id: "l7", graph_id: "default", user_id: "user-1", source_id: "2", target_id: "9", created_at: new Date().toISOString() },
  { id: "l8", graph_id: "default", user_id: "user-1", source_id: "8", target_id: "9", created_at: new Date().toISOString() },
  { id: "l9", graph_id: "default", user_id: "user-1", source_id: "2", target_id: "15", created_at: new Date().toISOString() },

  // Product cluster
  { id: "l10", graph_id: "default", user_id: "user-1", source_id: "3", target_id: "6", created_at: new Date().toISOString() },
  { id: "l11", graph_id: "default", user_id: "user-1", source_id: "3", target_id: "10", created_at: new Date().toISOString() },
  { id: "l12", graph_id: "default", user_id: "user-1", source_id: "3", target_id: "11", created_at: new Date().toISOString() },
  { id: "l13", graph_id: "default", user_id: "user-1", source_id: "6", target_id: "10", created_at: new Date().toISOString() },
  { id: "l14", graph_id: "default", user_id: "user-1", source_id: "6", target_id: "11", created_at: new Date().toISOString() },
  { id: "l15", graph_id: "default", user_id: "user-1", source_id: "3", target_id: "14", created_at: new Date().toISOString() },

  // Business cluster
  { id: "l16", graph_id: "default", user_id: "user-1", source_id: "5", target_id: "12", created_at: new Date().toISOString() },
  { id: "l17", graph_id: "default", user_id: "user-1", source_id: "4", target_id: "2", created_at: new Date().toISOString() },

  // Launch cluster
  { id: "l18", graph_id: "default", user_id: "user-1", source_id: "7", target_id: "13", created_at: new Date().toISOString() },
  { id: "l19", graph_id: "default", user_id: "user-1", source_id: "7", target_id: "4", created_at: new Date().toISOString() },
  { id: "l20", graph_id: "default", user_id: "user-1", source_id: "13", target_id: "4", created_at: new Date().toISOString() },

  // Cross-cluster connections
  { id: "l21", graph_id: "default", user_id: "user-1", source_id: "14", target_id: "7", created_at: new Date().toISOString() },
  { id: "l22", graph_id: "default", user_id: "user-1", source_id: "15", target_id: "1", created_at: new Date().toISOString() },
  { id: "l23", graph_id: "default", user_id: "user-1", source_id: "5", target_id: "4", created_at: new Date().toISOString() },
];
