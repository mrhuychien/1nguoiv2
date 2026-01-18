"use client";

import { memo } from "react";
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

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl border-2 bg-background-secondary min-w-[120px] max-w-[200px] cursor-pointer transition-all",
        selected
          ? "border-cyan shadow-glow-cyan"
          : "border-border hover:border-border-hover"
      )}
      style={{
        borderColor: selected ? data.color : undefined,
        boxShadow: selected ? `0 0 20px ${data.color}40` : undefined,
      }}
      onClick={() => selectNode(id)}
    >
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full absolute -top-1.5 -right-1.5 border-2 border-background-secondary"
        style={{ backgroundColor: data.color }}
      />

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-text-muted !border-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-text-muted !border-0"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-text-muted !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-text-muted !border-0"
      />

      {/* Content */}
      <div className="space-y-1">
        <h4 className="font-medium text-sm text-text-primary line-clamp-2">
          {data.title}
        </h4>
        {data.description && (
          <p className="text-xs text-text-muted line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
