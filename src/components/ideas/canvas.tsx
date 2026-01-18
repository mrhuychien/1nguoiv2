"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
  OnNodesChange,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";
import { Toolbar } from "./toolbar";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Custom edge style for Obsidian-like appearance
const getEdgeStyle = (sourceColor: string, isHighlighted: boolean) => ({
  stroke: isHighlighted ? sourceColor : `${sourceColor}60`,
  strokeWidth: isHighlighted ? 2.5 : 1.5,
  transition: "stroke 0.3s ease, stroke-width 0.3s ease",
});

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

  // Get node color map
  const nodeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    storeNodes.forEach((node) => {
      map[node.id] = node.color;
    });
    return map;
  }, [storeNodes]);

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
        },
        selected: node.id === selectedNodeId,
      })),
    [storeNodes, selectedNodeId]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      storeLinks.map((link) => {
        const activeId = hoveredNodeId || selectedNodeId;
        const isHighlighted = activeId === link.source_id || activeId === link.target_id;
        const sourceColor = nodeColorMap[link.source_id] || "#00d4ff";

        return {
          id: link.id,
          source: link.source_id,
          target: link.target_id,
          type: "default",
          style: getEdgeStyle(sourceColor, isHighlighted),
          animated: isHighlighted,
          markerEnd: {
            type: MarkerType.Arrow,
            width: 15,
            height: 15,
            color: isHighlighted ? sourceColor : `${sourceColor}60`,
          },
        };
      }),
    [storeLinks, hoveredNodeId, selectedNodeId, nodeColorMap]
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
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#00d4ff", strokeWidth: 2 }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={3}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
        style={{
          background: "radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0a0a0f 100%)"
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={1}
          color="#2a2a3c40"
        />
        <Toolbar />
        <MiniMap
          nodeColor={(node) => node.data?.color || "#00d4ff"}
          nodeStrokeColor={(node) => node.data?.color || "#00d4ff"}
          nodeStrokeWidth={2}
          maskColor="rgba(10, 10, 15, 0.9)"
          style={{
            backgroundColor: "#0a0a0f",
            border: "1px solid #2a2a3c",
            borderRadius: "8px",
          }}
          className="!bottom-4 !right-4"
        />
      </ReactFlow>

      {/* Graph stats overlay */}
      <div className="absolute bottom-4 left-4 px-3 py-2 bg-background-secondary/80 backdrop-blur-sm rounded-lg border border-border text-xs text-text-muted">
        <span className="text-cyan">{storeNodes.length}</span> nodes · <span className="text-purple">{storeLinks.length}</span> connections
      </div>
    </div>
  );
}
