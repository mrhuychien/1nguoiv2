"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  BackgroundVariant,
  NodeDragHandler,
  ConnectionLineType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { CustomNode } from "./custom-node";
import { Toolbar } from "./toolbar";
import { useIdeaStore, mockNodes, mockLinks } from "@/store/idea-store";
import { useForceLayout, ForceNode, ForceLink } from "@/hooks/use-force-layout";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Obsidian-style edge colors
const EDGE_COLOR_DEFAULT = "rgba(136, 136, 136, 0.3)";
const EDGE_COLOR_CONNECTED = "rgba(200, 200, 200, 0.8)";

function CanvasInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });
  const { fitView } = useReactFlow();

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

  // Get container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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

  // Prepare data for force simulation
  const forceNodes: ForceNode[] = useMemo(
    () =>
      storeNodes.map((node) => ({
        id: node.id,
        x: node.position_x,
        y: node.position_y,
      })),
    [storeNodes]
  );

  const forceLinks: ForceLink[] = useMemo(
    () =>
      storeLinks.map((link) => ({
        id: link.id,
        source: link.source_id,
        target: link.target_id,
      })),
    [storeLinks]
  );

  // State for simulated positions
  const [simulatedPositions, setSimulatedPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Force simulation callback
  const handleTick = useCallback((updatedNodes: ForceNode[]) => {
    const positions: Record<string, { x: number; y: number }> = {};
    updatedNodes.forEach((node) => {
      if (node.x !== undefined && node.y !== undefined) {
        positions[node.id] = { x: node.x, y: node.y };
      }
    });
    setSimulatedPositions(positions);
  }, []);

  // Setup force layout
  const { onDragStart, onDrag, onDragEnd, reheat } = useForceLayout({
    nodes: forceNodes,
    links: forceLinks,
    width: dimensions.width,
    height: dimensions.height,
    onTick: handleTick,
    strength: {
      charge: -400,
      link: 0.15,
      center: 0.03,
      collision: 60,
    },
  });

  // Convert store data to React Flow format with simulated positions
  const flowNodes: Node[] = useMemo(
    () =>
      storeNodes.map((node) => {
        const simPos = simulatedPositions[node.id];
        return {
          id: node.id,
          type: "custom",
          position: simPos
            ? { x: simPos.x, y: simPos.y }
            : { x: node.position_x, y: node.position_y },
          data: {
            title: node.title,
            description: node.description,
            color: node.color,
            connectionCount: connectionCountMap[node.id] || 1,
          },
          selected: node.id === selectedNodeId,
        };
      }),
    [storeNodes, selectedNodeId, connectionCountMap, simulatedPositions]
  );

  // Obsidian-style edges: gray, no arrows, subtle
  const flowEdges: Edge[] = useMemo(
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
        };
      }),
    [storeLinks, hoveredNodeId, selectedNodeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Load mock data on mount
  useEffect(() => {
    if (storeNodes.length === 0) {
      setStoreNodes(mockNodes);
      setStoreLinks(mockLinks);
    }
  }, [storeNodes.length, setStoreNodes, setStoreLinks]);

  // Sync React Flow nodes with simulated positions
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  // Fit view after initial simulation settles
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.3, duration: 500 });
    }, 1500);
    return () => clearTimeout(timer);
  }, [fitView]);

  // Handle drag start
  const handleDragStart: NodeDragHandler = useCallback(
    (_, node) => {
      onDragStart(node.id);
    },
    [onDragStart]
  );

  // Handle dragging
  const handleDrag: NodeDragHandler = useCallback(
    (_, node) => {
      onDrag(node.id, node.position.x, node.position.y);
    },
    [onDrag]
  );

  // Handle drag end
  const handleDragStop: NodeDragHandler = useCallback(
    (_, node) => {
      onDragEnd(node.id);
      // Update store with final position
      moveNode(node.id, node.position.x, node.position.y);
    },
    [onDragEnd, moveNode]
  );

  // Handle connection (creating edges)
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addLink(params.source, params.target);
        reheat();
      }
    },
    [addLink, reheat]
  );

  // Handle double-click to create new node
  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      addNode(x, y);
      reheat();
    },
    [addNode, reheat]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "n":
          addNode(dimensions.width / 2, dimensions.height / 2);
          reheat();
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
        case " ":
          event.preventDefault();
          reheat();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addNode, deleteNode, selectNode, selectedNodeId, dimensions, reheat]);

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
    <div ref={containerRef} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeDragStart={handleDragStart}
        onNodeDrag={handleDrag}
        onNodeDragStop={handleDragStop}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.Straight}
        connectionLineStyle={{ stroke: "rgba(136, 136, 136, 0.5)", strokeWidth: 1 }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        style={{
          background: "#0a0a0f",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={50}
          size={0.5}
          color="rgba(255, 255, 255, 0.03)"
        />
        <Toolbar />
      </ReactFlow>

      {/* Graph stats overlay - Obsidian style */}
      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded text-[11px] text-gray-500 flex items-center gap-3">
        <span>{storeNodes.length} nodes · {storeLinks.length} connections</span>
        <button
          onClick={reheat}
          className="text-gray-400 hover:text-white transition-colors"
          title="Reheat simulation (Space)"
        >
          ↻
        </button>
      </div>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
