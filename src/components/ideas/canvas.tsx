"use client";

import { useCallback, useEffect, useMemo } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";
import { Toolbar } from "./toolbar";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

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
      storeLinks.map((link) => ({
        id: link.id,
        source: link.source_id,
        target: link.target_id,
        style: { stroke: "#3a3a4c", strokeWidth: 2 },
        animated: false,
      })),
    [storeLinks]
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
  }, [selectNode]);

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
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2a2a3c"
        />
        <Toolbar />
        <MiniMap
          nodeColor={(node) => node.data?.color || "#00d4ff"}
          maskColor="rgba(10, 10, 15, 0.8)"
          style={{
            backgroundColor: "#12121a",
            border: "1px solid #2a2a3c",
          }}
          className="!bottom-4 !right-4"
        />
      </ReactFlow>
    </div>
  );
}
