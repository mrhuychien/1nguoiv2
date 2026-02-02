"use client";

import { useState } from "react";
import {
  Check,
  SkipForward,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { formatMinutesToHours } from "@/lib/data/project-templates";
import type { ProjectTask } from "@/types/zen";
import { cn } from "@/lib/utils";

interface TaskListProps {
  projectId: string;
  compact?: boolean;
}

export function TaskList({ projectId, compact = false }: TaskListProps) {
  const {
    getProjectTemplateTasks,
    completeTemplateTask,
    skipTemplateTask,
    startTemplateTask,
  } = useZenStore();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const tasks = getProjectTemplateTasks(projectId);
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Không có tasks - Đây là dự án trống
      </div>
    );
  }

  if (compact) {
    return (
      <CompactTaskList tasks={tasks} onComplete={completeTemplateTask} />
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {completedCount}/{tasks.length} công việc
          </span>
          <span className="text-xs text-gray-500">({progressPercent}%)</span>
        </div>
        <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Task Items */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isExpanded={expandedTaskId === task.id}
            onToggleExpand={() =>
              setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
            }
            onComplete={() => completeTemplateTask(task.id)}
            onSkip={() => skipTemplateTask(task.id)}
            onStart={() => startTemplateTask(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// TASK ITEM COMPONENT
// ============================================

interface TaskItemProps {
  task: ProjectTask;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onStart: () => void;
}

function TaskItem({
  task,
  isExpanded,
  onToggleExpand,
  onComplete,
  onSkip,
  onStart,
}: TaskItemProps) {
  const isCompleted = task.status === "completed";
  const isSkipped = task.status === "skipped";
  const isInProgress = task.status === "in_progress";
  const isPending = task.status === "pending";

  const zoneColor = task.zone === "designing" ? "cyan" : "purple";

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isCompleted && "bg-green-500/5 border-green-500/20 opacity-60",
        isSkipped && "bg-gray-800/30 border-gray-700 opacity-40",
        isInProgress &&
          (zoneColor === "cyan"
            ? "bg-cyan-500/10 border-cyan-500/30 ring-2 ring-cyan-500/20"
            : "bg-purple-500/10 border-purple-500/30 ring-2 ring-purple-500/20"),
        isPending && "bg-gray-800/50 border-gray-700 hover:border-gray-600"
      )}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Status Icon */}
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0",
            isCompleted && "bg-green-500/20 text-green-400",
            isSkipped && "bg-gray-700 text-gray-500",
            isInProgress &&
              (zoneColor === "cyan"
                ? "bg-cyan-500/20 text-cyan-400"
                : "bg-purple-500/20 text-purple-400"),
            isPending && "bg-gray-700/50 text-gray-400"
          )}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : task.emoji}
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                isCompleted || isSkipped
                  ? "line-through text-gray-500"
                  : "text-white"
              )}
            >
              {task.title}
            </span>
            {isInProgress && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[9px] font-black uppercase rounded",
                  zoneColor === "cyan"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "bg-purple-500/20 text-purple-400"
                )}
              >
                Đang làm
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500">
            <span
              className={
                task.zone === "designing"
                  ? "text-cyan-500/70"
                  : "text-purple-500/70"
              }
            >
              {task.zone === "designing" ? "🎨 Thiết kế" : "⚡ Xây dựng"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatMinutesToHours(task.estimatedMinutes)}
            </span>
            {task.timeSpentMinutes > 0 && (
              <span className="text-green-500/70">
                ✓ Đã làm {formatMinutesToHours(task.timeSpentMinutes)}
              </span>
            )}
          </div>
        </div>

        {/* Expand Arrow */}
        <div className="text-gray-500">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex items-center gap-2 pt-3 border-t border-gray-700/50">
            {isPending && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  zoneColor === "cyan"
                    ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                    : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                )}
              >
                <Play className="w-3 h-3" />
                Bắt đầu
              </button>
            )}
            {(isPending || isInProgress) && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Hoàn thành
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
                >
                  <SkipForward className="w-3 h-3" />
                  Bỏ qua
                </button>
              </>
            )}
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="mt-3 p-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1">
                <MessageSquare className="w-3 h-3" />
                Ghi chú
              </div>
              <p className="text-xs text-gray-400">{task.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPACT TASK LIST (for sidebar/widget)
// ============================================

interface CompactTaskListProps {
  tasks: ProjectTask[];
  onComplete: (taskId: string) => void;
}

function CompactTaskList({ tasks, onComplete }: CompactTaskListProps) {
  const currentTask =
    tasks.find((t) => t.status === "in_progress") ||
    tasks.find((t) => t.status === "pending");
  const nextTasks = tasks
    .filter((t) => t.status === "pending" && t.id !== currentTask?.id)
    .slice(0, 2);

  return (
    <div className="space-y-2">
      {/* Current Task */}
      {currentTask && (
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <div className="flex items-center gap-2">
            <span>{currentTask.emoji}</span>
            <span className="text-xs text-white flex-1 truncate">
              {currentTask.title}
            </span>
            <button
              onClick={() => onComplete(currentTask.id)}
              className="p-1 hover:bg-green-500/20 rounded text-green-400"
            >
              <Check className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Next Tasks */}
      {nextTasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 px-2 py-1.5 text-gray-500"
        >
          <span className="text-xs">{task.emoji}</span>
          <span className="text-[11px] truncate">{task.title}</span>
        </div>
      ))}
    </div>
  );
}
