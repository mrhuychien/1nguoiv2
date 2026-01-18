"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { useIdeaStore } from "@/store/idea-store";

interface NodeData {
  title: string;
  description: string | null;
  color: string;
}

function CustomNodeComponent({ id, data, selected }: NodeProps<NodeData>) {
  const selectNode = useIdeaStore((state) => state.selectNode);
  const [isHovered, setIsHovered] = useState(false);

  const nodeSize = selected ? 20 : isHovered ? 18 : 14;
  const glowIntensity = selected ? 0.8 : isHovered ? 0.5 : 0.3;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

      {/* Glow effect */}
      <div
        className="absolute rounded-full transition-all duration-300 ease-out"
        style={{
          width: nodeSize * 3,
          height: nodeSize * 3,
          backgroundColor: data.color,
          opacity: glowIntensity * 0.15,
          filter: `blur(${nodeSize}px)`,
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      />

      {/* Outer ring (shows on hover/selected) */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-300 ease-out border-2",
          (selected || isHovered) ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: nodeSize + 10,
          height: nodeSize + 10,
          borderColor: data.color,
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      />

      {/* Main circular node */}
      <div
        className={cn(
          "rounded-full cursor-pointer transition-all duration-300 ease-out",
          "border-2 border-transparent"
        )}
        style={{
          width: nodeSize,
          height: nodeSize,
          backgroundColor: data.color,
          boxShadow: `0 0 ${nodeSize * 2}px ${data.color}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')}`,
        }}
      />

      {/* Label (shows on hover or selected) */}
      <div
        className={cn(
          "absolute whitespace-nowrap text-center transition-all duration-300 ease-out pointer-events-none",
          (selected || isHovered) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        )}
        style={{
          top: nodeSize / 2 + 12,
          maxWidth: 150,
        }}
      >
        <div
          className="px-2 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: `${data.color}20`,
            color: data.color,
            border: `1px solid ${data.color}40`,
          }}
        >
          {data.title}
        </div>
        {isHovered && data.description && (
          <div className="mt-1 px-2 py-1 rounded-md text-xs text-text-muted bg-background-secondary/90 border border-border max-w-[150px] truncate">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
