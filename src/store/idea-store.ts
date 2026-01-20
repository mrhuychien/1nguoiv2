"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { Node, Link, NodeInsert, LinkInsert, Graph } from "@/types/database.types";

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
  graphs: Graph[];
  selectedNodeId: string | null;
  graphId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: string[];
  connectMode: boolean;
  connectSourceId: string | null;
}

interface IdeaActions {
  // Supabase operations
  fetchAll: (userId: string) => Promise<void>;
  fetchGraphs: (userId: string) => Promise<void>;
  fetchNodesAndLinks: (graphId: string) => Promise<void>;
  createGraph: (userId: string, title: string) => Promise<Graph | null>;
  getOrCreateDefaultGraph: (userId: string) => Promise<Graph | null>;

  // Node database operations
  createNodeInDb: (node: Omit<NodeInsert, "id" | "created_at" | "updated_at">) => Promise<Node | null>;
  updateNodeInDb: (id: string, updates: Partial<Node>) => Promise<void>;
  deleteNodeInDb: (id: string) => Promise<void>;

  // Link database operations
  createLinkInDb: (link: Omit<LinkInsert, "id" | "created_at">) => Promise<Link | null>;
  deleteLinkInDb: (id: string) => Promise<void>;

  // Local state setters
  setNodes: (nodes: IdeaNode[]) => void;
  setLinks: (links: IdeaLink[]) => void;
  setGraphId: (graphId: string) => void;

  // Node actions (local + db)
  addNode: (x: number, y: number, userId: string) => Promise<void>;
  updateNode: (id: string, updates: Partial<IdeaNode>) => void;
  deleteNode: (id: string) => Promise<void>;
  selectNode: (id: string | null) => void;
  moveNode: (id: string, x: number, y: number) => void;
  saveNodePosition: (id: string) => Promise<void>;

  // Link actions (local + db)
  addLink: (sourceId: string, targetId: string, userId: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  // Connect mode actions
  startConnectMode: (sourceId: string) => void;
  cancelConnectMode: () => void;
  completeConnection: (targetId: string, userId: string) => Promise<void>;

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
  graphs: [],
  selectedNodeId: null,
  graphId: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  searchQuery: "",
  searchResults: [],
  connectMode: false,
  connectSourceId: null,
};

export const useIdeaStore = create<IdeaStore>((set, get) => ({
  ...initialState,

  // ========== SUPABASE OPERATIONS ==========

  fetchAll: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // First get or create default graph
      const graph = await get().getOrCreateDefaultGraph(userId);
      if (!graph) {
        throw new Error("Failed to get or create default graph");
      }

      // Then fetch nodes and links for that graph
      await get().fetchNodesAndLinks(graph.id);

      set({ isInitialized: true });
    } catch (error) {
      console.error("[Ideas] Error fetching:", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGraphs: async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("graphs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ graphs: data || [] });
    } catch (error) {
      console.error("[Ideas] Error fetching graphs:", error);
      set({ error: (error as Error).message });
    }
  },

  fetchNodesAndLinks: async (graphId: string) => {
    try {
      const supabase = createClient();

      const [nodesResult, linksResult] = await Promise.all([
        supabase
          .from("nodes")
          .select("*")
          .eq("graph_id", graphId)
          .order("created_at", { ascending: true }),
        supabase
          .from("links")
          .select("*")
          .eq("graph_id", graphId)
      ]);

      if (nodesResult.error) throw nodesResult.error;
      if (linksResult.error) throw linksResult.error;

      console.log("[Ideas] Loaded", nodesResult.data?.length || 0, "nodes,", linksResult.data?.length || 0, "links");

      set({
        nodes: nodesResult.data || [],
        links: linksResult.data || [],
        graphId,
      });
    } catch (error) {
      console.error("[Ideas] Error fetching nodes/links:", error);
      set({ error: (error as Error).message });
    }
  },

  createGraph: async (userId: string, title: string) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("graphs")
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({ graphs: [data, ...state.graphs] }));
      }
      return data;
    } catch (error) {
      console.error("[Ideas] Error creating graph:", error);
      set({ error: (error as Error).message });
      return null;
    }
  },

  getOrCreateDefaultGraph: async (userId: string) => {
    try {
      const supabase = createClient();

      // Try to find existing graph
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data: existingGraphs, error: fetchError } = await supabaseAny
        .from("graphs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingGraphs && existingGraphs.length > 0) {
        set({ graphId: existingGraphs[0].id, graphs: existingGraphs });
        return existingGraphs[0] as Graph;
      }

      // Create new default graph
      const newGraph = await get().createGraph(userId, "Ý tưởng của tôi");
      if (newGraph) {
        set({ graphId: newGraph.id });
      }
      return newGraph;
    } catch (error) {
      console.error("[Ideas] Error getting/creating default graph:", error);
      set({ error: (error as Error).message });
      return null;
    }
  },

  // Node database operations
  createNodeInDb: async (nodeData) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("nodes")
        .insert(nodeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[Ideas] Error creating node:", error);
      set({ error: (error as Error).message });
      return null;
    }
  },

  updateNodeInDb: async (id: string, updates: Partial<Node>) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from("nodes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("[Ideas] Error updating node:", error);
      set({ error: (error as Error).message });
    }
  },

  deleteNodeInDb: async (id: string) => {
    try {
      const supabase = createClient();

      // Delete associated links first
      await supabase
        .from("links")
        .delete()
        .or(`source_id.eq.${id},target_id.eq.${id}`);

      // Then delete the node
      const { error } = await supabase
        .from("nodes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("[Ideas] Error deleting node:", error);
      set({ error: (error as Error).message });
    }
  },

  // Link database operations
  createLinkInDb: async (linkData) => {
    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("links")
        .insert(linkData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("[Ideas] Error creating link:", error);
      set({ error: (error as Error).message });
      return null;
    }
  },

  deleteLinkInDb: async (id: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("[Ideas] Error deleting link:", error);
      set({ error: (error as Error).message });
    }
  },

  // ========== LOCAL STATE SETTERS ==========

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  setGraphId: (graphId) => set({ graphId }),

  // ========== NODE ACTIONS ==========

  addNode: async (x, y, userId) => {
    const { graphId } = get();
    if (!graphId) {
      console.error("[Ideas] No graphId set");
      return;
    }

    const randomColor = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)].value;

    // Create node in database
    const newNode = await get().createNodeInDb({
      graph_id: graphId,
      user_id: userId,
      title: "Ý tưởng mới",
      description: null,
      color: randomColor,
      position_x: x,
      position_y: y,
    });

    if (newNode) {
      set((state) => ({
        nodes: [...state.nodes, newNode],
        selectedNodeId: newNode.id,
      }));
    }
  },

  updateNode: (id, updates) => {
    // Optimistic update
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, ...updates, updated_at: new Date().toISOString() }
          : node
      ),
    }));

    // Persist to database
    get().updateNodeInDb(id, updates);
  },

  deleteNode: async (id) => {
    // Optimistic update
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      links: state.links.filter(
        (link) => link.source_id !== id && link.target_id !== id
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    }));

    // Delete from database
    await get().deleteNodeInDb(id);
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  moveNode: (id, x, y) => {
    // Local update only (for dragging)
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, position_x: x, position_y: y }
          : node
      ),
    }));
  },

  saveNodePosition: async (id) => {
    const node = get().nodes.find((n) => n.id === id);
    if (node) {
      await get().updateNodeInDb(id, {
        position_x: node.position_x,
        position_y: node.position_y,
      });
    }
  },

  // ========== LINK ACTIONS ==========

  addLink: async (sourceId, targetId, userId) => {
    const { graphId, links } = get();
    if (!graphId) return;

    // Don't create duplicate links or self-links
    const existingLink = links.find(
      (link) =>
        (link.source_id === sourceId && link.target_id === targetId) ||
        (link.source_id === targetId && link.target_id === sourceId)
    );

    if (existingLink || sourceId === targetId) return;

    // Create link in database
    const newLink = await get().createLinkInDb({
      graph_id: graphId,
      user_id: userId,
      source_id: sourceId,
      target_id: targetId,
    });

    if (newLink) {
      set((state) => ({
        links: [...state.links, newLink],
      }));
    }
  },

  deleteLink: async (id) => {
    // Optimistic update
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    }));

    // Delete from database
    await get().deleteLinkInDb(id);
  },

  // ========== CONNECT MODE ==========

  startConnectMode: (sourceId) => {
    set({ connectMode: true, connectSourceId: sourceId });
  },

  cancelConnectMode: () => {
    set({ connectMode: false, connectSourceId: null });
  },

  completeConnection: async (targetId, userId) => {
    const { connectSourceId, links, graphId } = get();

    if (!connectSourceId || !graphId || connectSourceId === targetId) {
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

    // Create link in database
    const newLink = await get().createLinkInDb({
      graph_id: graphId,
      user_id: userId,
      source_id: connectSourceId,
      target_id: targetId,
    });

    if (newLink) {
      set((state) => ({
        links: [...state.links, newLink],
        connectMode: false,
        connectSourceId: null,
      }));
    } else {
      set({ connectMode: false, connectSourceId: null });
    }
  },

  // ========== STATE ==========

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState),

  // ========== SEARCH ==========

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

  // ========== GETTERS ==========

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
