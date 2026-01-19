"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
  OnNodesChange,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";
import { Toolbar } from "./toolbar";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Obsidian-style edge colors
const EDGE_COLOR_DEFAULT = "rgba(136, 136, 136, 0.3)";
const EDGE_COLOR_CONNECTED = "rgba(200, 200, 200, 0.8)";

export function Canvas() {
  const {
    nodes: storeNodes,
    links: storeLinks,
    setNodes: setStoreNodes,
    setLinks: setStoreLinks,
    addLink,
    moveNode,
    addNode,
    deleteNode,
    selectNode,
    selectedNodeId,
  } = useIdeaStore();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Calculate connection count for each node
  const connectionCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    storeNodes.forEach((node) => {
      map[node.id] = 0;
    });
    storeLinks.forEach((link) => {
      if (map[link.source_id] !== undefined) map[link.source_id]++;
      if (map[link.target_id] !== undefined) map[link.target_id]++;
    });
    return map;
  }, [storeNodes, storeLinks]);

  // Convert store data to React Flow format
  const initialNodes: Node[] = useMemo(
    () =>
      storeNodes.map((node) => ({
        id: node.id,
        type: "custom",
        position: { x: node.position_x, y: node.position_y },
        data: {
          title: node.title,
          description: node.description,
          color: node.color,
          connectionCount: connectionCountMap[node.id] || 1,
        },
        selected: node.id === selectedNodeId,
      })),
    [storeNodes, selectedNodeId, connectionCountMap]
  );

  // Obsidian-style edges: gray, no arrows, subtle
  const initialEdges: Edge[] = useMemo(
    () =>
      storeLinks.map((link) => {
        const activeId = hoveredNodeId || selectedNodeId;
        const isConnectedToActive =
          activeId === link.source_id || activeId === link.target_id;

        let strokeColor = EDGE_COLOR_DEFAULT;
        let strokeWidth = 1;

        if (activeId) {
          if (isConnectedToActive) {
            strokeColor = EDGE_COLOR_CONNECTED;
            strokeWidth = 1.5;
          } else {
            strokeColor = "rgba(136, 136, 136, 0.1)";
            strokeWidth = 0.5;
          }
        }

        return {
          id: link.id,
          source: link.source_id,
          target: link.target_id,
          type: "default",
          style: {
            stroke: strokeColor,
            strokeWidth: strokeWidth,
            transition: "stroke 0.3s ease, stroke-width 0.3s ease",
          },
          // No arrows - Obsidian style
        };
      }),
    [storeLinks, hoveredNodeId, selectedNodeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load mock data on mount
  useEffect(() => {
    if (storeNodes.length === 0) {
      setStoreNodes(mockNodes);
      setStoreLinks(mockLinks);
    }
  }, [storeNodes.length, setStoreNodes, setStoreLinks]);

  // Sync React Flow nodes with store
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle node changes (position updates)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Update store with position changes
      changes.forEach((change) => {
        if (change.type === "position" && change.position && change.dragging === false) {
          moveNode(change.id, change.position.x, change.position.y);
        }
      });
    },
    [onNodesChange, moveNode]
  );

  // Handle connection (creating edges)
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addLink(params.source, params.target);
      }
    },
    [addLink]
  );

  // Handle double-click to create new node
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      addNode(x, y);
    },
    [addNode]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "n":
          // Add new node at center
          addNode(400, 300);
          break;
        case "delete":
        case "backspace":
          if (selectedNodeId) {
            deleteNode(selectedNodeId);
          }
          break;
        case "escape":
          selectNode(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addNode, deleteNode, selectNode, selectedNodeId]);

  // Deselect on pane click
  const onPaneClick = useCallback(() => {
    selectNode(null);
    setHoveredNodeId(null);
  }, [selectNode]);

  // Handle node mouse enter/leave for edge highlighting
  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Straight}
        connectionLineStyle={{ stroke: "rgba(136, 136, 136, 0.5)", strokeWidth: 1 }}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        style={{
          background: "#0a0a0f",
        }}
      >
        {/* Obsidian uses very subtle or no background pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={50}
          size={0.5}
          color="rgba(255, 255, 255, 0.03)"
        />
        <Toolbar />
      </ReactFlow>

      {/* Graph stats overlay - Obsidian style */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[11px] text-gray-500">
        {storeNodes.length} nodes · {storeLinks.length} connections
      </div>
    </div>
  );
}
