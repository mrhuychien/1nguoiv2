"use client";

import { useState } from "react";
import {
  Plus,
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
import { TaskStatus } from "@/types/zen";
import { cn } from "@/lib/utils";

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
  const {
    projects,
    activeProjectId,
    activeTaskId,
    setActiveTask,
    completeTask,
    deleteTask,
    addTask,
    // Template task actions
    getProjectTemplateTasks,
    completeTemplateTask,
    skipTemplateTask,
    startTemplateTask,
  } = useZenStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "template" | "manual">("all");

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Get regular tasks
  const regularTasks: DisplayTask[] = (activeProject?.tasks || []).map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    estimatedMinutes: t.estimatedMinutes,
    isTemplate: false,
  }));

  // Get template tasks for this project
  const templateTasks: DisplayTask[] = activeProjectId
    ? getProjectTemplateTasks(activeProjectId).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        estimatedMinutes: t.estimatedMinutes,
        emoji: t.emoji,
        isTemplate: true,
        zone: t.zone,
        phase: t.phase,
      }))
    : [];

  // Combine tasks based on view mode
  let allTasks: DisplayTask[] = [];
  if (viewMode === "all") {
    allTasks = [...templateTasks, ...regularTasks];
  } else if (viewMode === "template") {
    allTasks = templateTasks;
  } else {
    allTasks = regularTasks;
  }

  // Sort tasks: in_progress first, then pending, then completed/skipped
  const sortedTasks = [...allTasks].sort((a, b) => {
    const order: Record<TaskStatus, number> = {
      in_progress: 0,
      pending: 1,
      completed: 2,
      blocked: 3,
      skipped: 4,
    };
    return order[a.status] - order[b.status];
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !activeProjectId) return;

    addTask(activeProjectId, newTaskTitle.trim(), 30);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const handleCompleteTask = (task: DisplayTask) => {
    if (!activeProjectId) return;
    if (task.isTemplate) {
      completeTemplateTask(task.id);
    } else {
      completeTask(activeProjectId, task.id);
    }
  };

  const handleStartTask = (task: DisplayTask) => {
    if (task.isTemplate) {
      startTemplateTask(task.id);
    }
  };

  const handleSkipTask = (task: DisplayTask) => {
    if (task.isTemplate) {
      skipTemplateTask(task.id);
    }
  };

  const handleDeleteTask = (task: DisplayTask) => {
    if (!activeProjectId || task.isTemplate) return;
    deleteTask(activeProjectId, task.id);
    setExpandedTaskId(null);
  };

  const hasTemplateTasks = templateTasks.length > 0;
  const hasRegularTasks = regularTasks.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Garden Tasks
          </h3>
          {allTasks.length > 0 && (
            <span className="text-xs text-gray-500">
              ({sortedTasks.filter((t) => t.status !== "completed" && t.status !== "skipped").length})
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className={cn(
            "p-1.5 rounded-lg transition-all",
            showAddTask
              ? "bg-cyan-500/20 text-cyan-400"
              : "text-gray-400 hover:bg-gray-800 hover:text-white"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* View Mode Tabs */}
      {activeProject && (hasTemplateTasks || hasRegularTasks) && (
        <div className="flex gap-1 p-1 bg-gray-900/50 rounded-lg">
          <button
            onClick={() => setViewMode("all")}
            className={cn(
              "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors",
              viewMode === "all"
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            Tất cả ({templateTasks.length + regularTasks.length})
          </button>
          {hasTemplateTasks && (
            <button
              onClick={() => setViewMode("template")}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                viewMode === "template"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Template ({templateTasks.length})
            </button>
          )}
          {hasRegularTasks && (
            <button
              onClick={() => setViewMode("manual")}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                viewMode === "manual"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              Thủ công ({regularTasks.length})
            </button>
          )}
        </div>
      )}

      {/* Add task input */}
      {showAddTask && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/50 border border-gray-800 animate-zen-fade">
          <input
            type="text"
            placeholder="Thêm task mới..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
            autoFocus
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="px-3 py-1 text-xs font-medium rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thêm
          </button>
        </div>
      )}

      {/* Project selector hint */}
      {!activeProject && (
        <div className="p-4 rounded-lg bg-gray-900/50 border border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            Chọn một project để xem tasks
          </p>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
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
                  {task.isTemplate && task.status === "pending" && (
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
                  {!task.isTemplate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  )}
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l-lg" />
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {activeProject && sortedTasks.length === 0 && (
          <div className="p-6 rounded-lg bg-gray-900/30 border border-dashed border-gray-800 text-center">
            <Sprout className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Chưa có task nào
            </p>
            <button
              onClick={() => setShowAddTask(true)}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
            >
              + Thêm task đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Task summary */}
      {activeProject && allTasks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-800">
          <span>
            {allTasks.filter((t) => t.status === "completed").length} /{" "}
            {allTasks.length} hoàn thành
          </span>
          <span>
            {allTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)}m tổng
          </span>
        </div>
      )}
    </div>
  );
}
