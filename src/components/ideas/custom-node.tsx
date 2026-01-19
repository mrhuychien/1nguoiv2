"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { useIdeaStore } from "@/store/idea-store";

interface NodeData {
  title: string;
  description: string | null;
  color: string;
  connectionCount?: number;
}

function CustomNodeComponent({ id, data, selected }: NodeProps<NodeData>) {
  const selectNode = useIdeaStore((state) => state.selectNode);
  const selectedNodeId = useIdeaStore((state) => state.selectedNodeId);

  // Obsidian-style: node size based on connection count
  const connectionCount = data.connectionCount || 1;
  const baseSize = 8;
  const maxSize = 24;
  const nodeSize = Math.min(baseSize + connectionCount * 3, maxSize);

  const isActive = selected || selectedNodeId === id;
  const opacity = isActive ? 1 : 0.85;

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer group"
      onClick={() => selectNode(id)}
    >
      {/* Hidden handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-full !h-full !top-0 !left-0 !transform-none !rounded-full !border-0 !bg-transparent"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-full !h-full !bottom-0 !left-0 !transform-none !rounded-full !border-0 !bg-transparent"
      />

      {/* Obsidian-style glow effect - subtle and smooth */}
      <div
        className="absolute rounded-full transition-all duration-500 ease-out"
        style={{
          width: nodeSize * 2.5,
          height: nodeSize * 2.5,
          backgroundColor: data.color,
          opacity: isActive ? 0.25 : 0.1,
          filter: `blur(${nodeSize * 0.8}px)`,
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      />

      {/* Main circular node - Obsidian style filled circle */}
      <div
        className={cn(
          "rounded-full transition-all duration-300 ease-out",
          "hover:scale-110"
        )}
        style={{
          width: nodeSize,
          height: nodeSize,
          backgroundColor: data.color,
          opacity: opacity,
          boxShadow: isActive
            ? `0 0 ${nodeSize}px ${data.color}80, 0 0 ${nodeSize * 2}px ${data.color}40`
            : `0 0 ${nodeSize * 0.5}px ${data.color}30`,
        }}
      />

      {/* Label - Obsidian style: always visible, below node */}
      <div
        className={cn(
          "absolute whitespace-nowrap text-center transition-all duration-300 ease-out pointer-events-none",
          isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
        )}
        style={{
          top: nodeSize / 2 + 8,
        }}
      >
        <span
          className={cn(
            "text-[11px] font-medium tracking-wide",
            isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
          )}
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {data.title}
        </span>
      </div>
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
