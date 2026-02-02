"use client";

import { useState, useRef } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggablePanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  onDrop?: (draggedId: string, targetId: string) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

export function DraggablePanel({
  id,
  children,
  className,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  isDropTarget,
}: DraggablePanelProps) {
  const [localDragOver, setLocalDragOver] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(id);

    // Add drag image
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(panelRef.current, rect.width / 2, 20);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setLocalDragOver(true);
  };

  const handleDragLeave = () => {
    setLocalDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLocalDragOver(false);
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== id) {
      onDrop?.(draggedId, id);
    }
  };

  return (
    <div
      ref={panelRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative group rounded-2xl bg-gray-900/50 border transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        (isDropTarget || localDragOver) && "border-cyan-500 ring-2 ring-cyan-500/30 scale-[1.02]",
        !isDragging && !isDropTarget && !localDragOver && "border-gray-800",
        className
      )}
    >
      {/* Drag handle - floating */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={cn(
          "absolute -left-3 top-4 z-10 p-1.5 rounded-lg cursor-grab active:cursor-grabbing",
          "bg-gray-800 border border-gray-700 shadow-lg",
          "text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50",
          "opacity-0 group-hover:opacity-100 transition-all duration-200",
          "hover:scale-110"
        )}
        title="Kéo để di chuyển panel"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// Panel container that manages drag state
interface PanelContainerProps {
  panelOrder: string[];
  onReorder: (newOrder: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

export function PanelContainer({
  panelOrder,
  onReorder,
  children,
  className,
}: PanelContainerProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = (draggedId: string, targetId: string) => {
    const newOrder = [...panelOrder];
    const draggedIndex = newOrder.indexOf(draggedId);
    const targetIndex = newOrder.indexOf(targetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      onReorder(newOrder);
    }
    setDraggingId(null);
  };

  // Clone children and pass drag props
  const childrenWithProps = Array.isArray(children)
    ? children.map((child) => {
        if (child && typeof child === 'object' && 'props' in child) {
          const childId = child.props.id;
          return {
            ...child,
            props: {
              ...child.props,
              onDragStart: handleDragStart,
              onDragEnd: handleDragEnd,
              onDrop: handleDrop,
              isDragging: draggingId === childId,
              isDropTarget: draggingId !== null && draggingId !== childId,
            },
          };
        }
        return child;
      })
    : children;

  // Sort children based on panelOrder
  const sortedChildren = panelOrder.map((id) => {
    if (Array.isArray(childrenWithProps)) {
      return childrenWithProps.find(
        (child) => child && typeof child === 'object' && 'props' in child && child.props.id === id
      );
    }
    return null;
  }).filter(Boolean);

  return (
    <div className={cn("space-y-6", className)}>
      {sortedChildren}
    </div>
  );
}
