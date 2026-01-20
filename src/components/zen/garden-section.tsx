"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Trash2,
  Sprout,
  SkipForward,
  Play,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { Task } from "@/types/database.types";
import { cn } from "@/lib/utils";

type TaskStatus = Task["status"];

interface GardenSectionProps {
  className?: string;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  pending: {
    icon: Circle,
    color: "text-gray-400",
    label: "Chờ xử lý",
  },
  in_progress: {
    icon: Clock,
    color: "text-cyan-400",
    label: "Đang làm",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    label: "Hoàn thành",
  },
  blocked: {
    icon: Circle,
    color: "text-red-400",
    label: "Blocked",
  },
  skipped: {
    icon: SkipForward,
    color: "text-gray-500",
    label: "Bỏ qua",
  },
};

// Unified task type for display
interface DisplayTask {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedMinutes: number;
  emoji?: string;
  isTemplate: boolean;
  zone?: string;
  phase?: number;
}

export function GardenSection({ className }: GardenSectionProps) {
  // Get unified project/task data from project-store
  const {
    tasks: allDbTasks,
    completeTemplateTask: completeTemplateTaskInDb,
    skipTemplateTask: skipTemplateTaskInDb,
    startTemplateTask: startTemplateTaskInDb,
    toggleTaskCompleteInDb,
  } = useProjectStore();

  // Get UI state from zen-store (including garden task IDs)
  const {
    activeTaskId,
    setActiveTask,
    setTimerTask,
    gardenTaskIds,
    addToGarden,
    removeFromGarden,
    clearGarden,
  } = useZenStore();

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Only get tasks that are in the garden (dropped by user)
  const gardenTasks: DisplayTask[] = gardenTaskIds
    .map((taskId) => {
      const task = allDbTasks.find((t) => t.id === taskId);
      if (!task) return null;
      return {
        id: task.id,
        title: task.title,
        status: task.status,
        estimatedMinutes: task.estimated_minutes,
        emoji: task.emoji || undefined,
        isTemplate: task.is_template || false,
        zone: task.zone || undefined,
        phase: task.phase || undefined,
      } as DisplayTask;
    })
    .filter((t): t is DisplayTask => t !== null);

  // Sort tasks: in_progress first, then pending, then completed/skipped
  const sortedTasks = [...gardenTasks].sort((a, b) => {
    const order: Record<TaskStatus, number> = {
      in_progress: 0,
      pending: 1,
      completed: 2,
      blocked: 3,
      skipped: 4,
    };
    return order[a.status] - order[b.status];
  });

  const handleCompleteTask = (task: DisplayTask) => {
    if (task.isTemplate) {
      completeTemplateTaskInDb(task.id);
    } else {
      toggleTaskCompleteInDb(task.id);
    }
    // Remove from garden after completing
    removeFromGarden(task.id);
  };

  const handleStartTask = (task: DisplayTask) => {
    if (task.isTemplate) {
      startTemplateTaskInDb(task.id);
    }
    // Also set it as the timer task
    setTimerTask(task.id, task.isTemplate ? "template" : "manual");
  };

  const handleSkipTask = (task: DisplayTask) => {
    if (task.isTemplate) {
      skipTemplateTaskInDb(task.id);
    }
    // Remove from garden after skipping
    removeFromGarden(task.id);
  };

  const handleRemoveFromGarden = (task: DisplayTask) => {
    removeFromGarden(task.id);
    setExpandedTaskId(null);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.taskId && data.taskType) {
        // Add to garden
        addToGarden(data.taskId);
        // Set the dropped task as active
        setActiveTask(data.taskId);
        // Also set it as timer task (like Timer does)
        setTimerTask(data.taskId, data.taskType);
        // Start template task if applicable
        if (data.taskType === "template") {
          startTemplateTaskInDb(data.taskId);
        }
      }
    } catch {
      // Invalid data
    }
  };

  const activeTasks = sortedTasks.filter((t) => t.status !== "completed" && t.status !== "skipped");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Garden Tasks
          </h3>
          {activeTasks.length > 0 && (
            <span className="text-xs text-gray-500">
              ({activeTasks.length})
            </span>
          )}
        </div>
        {gardenTasks.length > 0 && (
          <button
            onClick={clearGarden}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Task list - Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar rounded-lg transition-all p-1",
          isDragOver && "ring-2 ring-green-500/50 bg-green-500/5"
        )}
      >
        {/* Drop hint when dragging */}
        {isDragOver && (
          <div className="p-3 rounded-lg border border-dashed border-green-500 bg-green-500/10 text-center animate-pulse">
            <Sprout className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-green-400">Thả task vào đây</p>
          </div>
        )}
        {sortedTasks.map((task) => {
          const status = STATUS_CONFIG[task.status];
          const StatusIcon = status.icon;
          const isActive = activeTaskId === task.id;
          const isExpanded = expandedTaskId === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                "group relative rounded-lg border transition-all cursor-pointer",
                isActive
                  ? "bg-cyan-500/10 border-cyan-500/30"
                  : task.status === "completed" || task.status === "skipped"
                  ? "bg-gray-900/30 border-gray-800/50 opacity-60"
                  : "bg-gray-900/50 border-gray-800 hover:bg-gray-800/50"
              )}
              onClick={() => setActiveTask(task.id)}
            >
              <div className="flex items-center gap-3 p-3">
                {/* Status icon / checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.status !== "completed" && task.status !== "skipped") {
                      handleCompleteTask(task);
                    }
                  }}
                  className={cn(
                    "flex-shrink-0 transition-transform hover:scale-110",
                    task.status === "completed"
                      ? "text-green-400"
                      : task.status === "skipped"
                      ? "text-gray-500"
                      : "text-gray-400 hover:text-cyan-400"
                  )}
                >
                  <StatusIcon className="w-5 h-5" />
                </button>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {task.emoji && (
                      <span className="text-sm">{task.emoji}</span>
                    )}
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        task.status === "completed" || task.status === "skipped"
                          ? "text-gray-500 line-through"
                          : "text-white"
                      )}
                    >
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.estimatedMinutes > 0 && (
                      <span className="text-xs text-gray-500">
                        {task.estimatedMinutes}m
                      </span>
                    )}
                    {task.isTemplate && task.zone && (
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded",
                        task.zone === "designing"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-orange-500/10 text-orange-400"
                      )}>
                        {task.zone === "designing" ? "Design" : "Build"}
                      </span>
                    )}
                    {task.isTemplate && (
                      <span className="text-[10px] text-purple-400">
                        Template
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedTaskId(isExpanded ? null : task.id);
                  }}
                  className="flex-shrink-0 p-1 rounded text-gray-500 hover:text-white hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded actions */}
              {isExpanded && (
                <div className="px-3 pb-3 flex items-center gap-2 animate-zen-fade">
                  {task.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTask(task);
                        setExpandedTaskId(null);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Bắt đầu
                    </button>
                  )}
                  {task.isTemplate && task.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkipTask(task);
                        setExpandedTaskId(null);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:bg-gray-500/10 rounded transition-colors"
                    >
                      <SkipForward className="w-3 h-3" />
                      Bỏ qua
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromGarden(task);
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Gỡ khỏi Garden
                  </button>
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l-lg" />
              )}
            </div>
          );
        })}

        {/* Empty state - always show when no tasks in garden */}
        {!isDragOver && gardenTasks.length === 0 && (
          <div className="p-6 rounded-lg bg-gray-900/30 border border-dashed border-gray-800 text-center">
            <Sprout className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Kéo task từ Project thả vào đây
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Garden là nơi tập trung các task bạn muốn làm
            </p>
          </div>
        )}
      </div>

      {/* Task summary */}
      {gardenTasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
          <span>
            {gardenTasks.filter((t) => t.status === "completed").length} /{" "}
            {gardenTasks.length} hoàn thành
          </span>
          <span>
            {gardenTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)}m tổng
          </span>
        </div>
      )}
    </div>
  );
}
