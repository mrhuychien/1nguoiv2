"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Circle,
  CheckCircle2,
  Clock,
  SkipForward,
  RotateCcw,
  GripVertical,
  X,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { useZenStore } from "@/store/zen-store";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import type { Task, Project } from "@/types/database.types";

type TaskStatus = Task["status"];

const STATUS_CONFIG: Record<TaskStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: {
    icon: Circle,
    label: "Chờ",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
  },
  in_progress: {
    icon: Clock,
    label: "Đang làm",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  completed: {
    icon: CheckCircle2,
    label: "Hoàn thành",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  blocked: {
    icon: Circle,
    label: "Bị chặn",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
  skipped: {
    icon: SkipForward,
    label: "Bỏ qua",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
};

const LIFECYCLE_OPTIONS = [
  { value: "idea", label: "💡 Idea", color: "border-yellow-500 bg-yellow-500/10 text-yellow-400" },
  { value: "designing", label: "📐 Design", color: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { value: "building", label: "🏗️ Build", color: "border-orange-500 bg-orange-500/10 text-orange-400" },
  { value: "launching", label: "🚀 Launch", color: "border-purple-500 bg-purple-500/10 text-purple-400" },
  { value: "growing", label: "📈 Grow", color: "border-green-500 bg-green-500/10 text-green-400" },
];

const COMMON_EMOJIS = ["📝", "💻", "🎨", "📊", "🔧", "📱", "🌐", "📦", "🧪", "📢", "✨", "🎯"];

interface ZenTaskManagerProps {
  project: Project;
  className?: string;
}

export function ZenTaskManager({ project, className }: ZenTaskManagerProps) {
  const { user } = useUser();
  const {
    getTemplateTasks,
    getManualTasks,
    createTask,
    updateTaskInDb,
    deleteTaskFromDb,
    startTemplateTask,
    completeTemplateTask,
    skipTemplateTask,
    resetTemplateTask,
    updateProjectInDb,
  } = useProjectStore();

  const { currentTimerTaskId } = useZenStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress">("all");

  // New task form
  const [newTitle, setNewTitle] = useState("");
  const [newEstimate, setNewEstimate] = useState(25);
  const [newEmoji, setNewEmoji] = useState("📝");

  // Edit task form
  const [editTitle, setEditTitle] = useState("");
  const [editEstimate, setEditEstimate] = useState(25);
  const [editEmoji, setEditEmoji] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Get all tasks
  const templateTasks = getTemplateTasks(project.id);
  const manualTasks = getManualTasks(project.id);
  const allTasks = [...templateTasks, ...manualTasks];

  // Filter tasks
  const activeTasks = allTasks.filter((t) => t.status !== "completed" && t.status !== "skipped");
  const completedTasks = allTasks.filter((t) => t.status === "completed" || t.status === "skipped");

  const displayTasks = filter === "all"
    ? activeTasks
    : activeTasks.filter((t) => t.status === filter);

  // Sort: in_progress first, then by created_at
  const sortedTasks = [...displayTasks].sort((a, b) => {
    if (a.status === "in_progress" && b.status !== "in_progress") return -1;
    if (b.status === "in_progress" && a.status !== "in_progress") return 1;
    // Sort by created_at ascending (oldest first)
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Focus input when add form opens
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const handleAddTask = async () => {
    if (!newTitle.trim() || !user?.id) return;

    await createTask({
      user_id: user.id,
      project_id: project.id,
      title: newTitle.trim(),
      emoji: newEmoji,
      estimated_minutes: newEstimate,
      actual_minutes: 0,
      status: "pending",
      completed: false,
      is_template: false,
    });

    setNewTitle("");
    setNewEstimate(25);
    setNewEmoji("📝");
    setShowAddForm(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditEstimate(task.estimated_minutes);
    setEditEmoji(task.emoji || "📝");
  };

  const handleSaveEdit = async () => {
    if (!editingTaskId || !editTitle.trim()) return;

    await updateTaskInDb(editingTaskId, {
      title: editTitle.trim(),
      estimated_minutes: editEstimate,
      emoji: editEmoji,
    });

    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Bạn có chắc muốn xóa task này?")) {
      await deleteTaskFromDb(taskId);
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (task.is_template) {
      switch (newStatus) {
        case "in_progress":
          await startTemplateTask(task.id);
          break;
        case "completed":
          await completeTemplateTask(task.id);
          break;
        case "skipped":
          await skipTemplateTask(task.id);
          break;
        case "pending":
          await resetTemplateTask(task.id);
          break;
      }
    } else {
      await updateTaskInDb(task.id, {
        status: newStatus,
        completed: newStatus === "completed",
        completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      });
    }
  };

  const handlePhaseChange = async (newPhase: string) => {
    await updateProjectInDb(project.id, {
      lifecycle: newPhase as Project["lifecycle"],
    });
  };

  const handleDragTask = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      taskId: task.id,
      taskType: task.is_template ? "template" : "manual",
      title: task.title,
      emoji: task.emoji,
    }));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Project Phase Selector */}
      <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
        <label className="text-xs text-gray-500 mb-2 block">Phase dự án</label>
        <div className="flex flex-wrap gap-1.5">
          {LIFECYCLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePhaseChange(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border",
                project.lifecycle === opt.value
                  ? opt.color
                  : "border-gray-700 bg-gray-800 text-gray-500 hover:text-gray-300"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
            Tasks ({activeTasks.length})
          </span>
          {/* Filter buttons */}
          <div className="flex gap-1">
            {(["all", "pending", "in_progress"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] transition-colors",
                  filter === f
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-500 hover:text-gray-300"
                )}
              >
                {f === "all" ? "Tất cả" : f === "pending" ? "Chờ" : "Đang làm"}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="p-3 rounded-lg bg-gray-800/50 border border-cyan-500/30 space-y-3 animate-zen-fade">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="Tên task mới..."
            className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 text-sm outline-none focus:border-cyan-500"
          />
          <div className="flex items-center gap-2">
            {/* Emoji selector */}
            <div className="flex gap-1 flex-wrap">
              {COMMON_EMOJIS.slice(0, 6).map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewEmoji(emoji)}
                  className={cn(
                    "w-7 h-7 rounded flex items-center justify-center text-sm transition-colors",
                    newEmoji === emoji ? "bg-cyan-500/20 ring-1 ring-cyan-500" : "hover:bg-gray-700"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {/* Time estimate */}
            <div className="flex items-center gap-1 ml-auto">
              <input
                type="number"
                value={newEstimate}
                onChange={(e) => setNewEstimate(Math.max(5, parseInt(e.target.value) || 25))}
                className="w-14 px-2 py-1 rounded bg-gray-900 border border-gray-700 text-white text-xs text-center outline-none focus:border-cyan-500"
                min={5}
                step={5}
              />
              <span className="text-xs text-gray-500">phút</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleAddTask}
              disabled={!newTitle.trim()}
              className="flex-1 py-2 rounded-lg bg-cyan-500 text-white text-sm hover:bg-cyan-400 disabled:opacity-50 transition-colors"
            >
              Thêm
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {sortedTasks.length === 0 ? (
          <p className="text-xs text-gray-500 p-3 text-center">
            Chưa có task nào
          </p>
        ) : (
          sortedTasks.map((task) => {
            const config = STATUS_CONFIG[task.status];
            const StatusIcon = config.icon;
            const isEditing = editingTaskId === task.id;
            const isCurrentTimer = currentTimerTaskId === task.id;

            return (
              <div
                key={task.id}
                draggable={!isEditing}
                onDragStart={(e) => handleDragTask(e, task)}
                className={cn(
                  "group flex items-start gap-2 p-2.5 rounded-lg transition-all",
                  "border hover:border-gray-600",
                  isCurrentTimer
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "border-transparent hover:bg-gray-800/50",
                  isEditing && "bg-gray-800/70 border-gray-600"
                )}
              >
                {/* Drag handle */}
                {!isEditing && (
                  <GripVertical className="w-3 h-3 text-gray-600 flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {/* Status button */}
                <button
                  onClick={() => {
                    const nextStatus: TaskStatus = task.status === "pending"
                      ? "in_progress"
                      : task.status === "in_progress"
                        ? "completed"
                        : "pending";
                    handleStatusChange(task, nextStatus);
                  }}
                  className={cn("flex-shrink-0 mt-0.5", config.color, "hover:opacity-80")}
                  title={config.label}
                >
                  <StatusIcon className="w-4 h-4" />
                </button>

                {/* Content */}
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      className="w-full px-2 py-1 rounded bg-gray-900 border border-gray-600 text-white text-sm outline-none focus:border-cyan-500"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {COMMON_EMOJIS.slice(0, 6).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setEditEmoji(emoji)}
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-xs",
                              editEmoji === emoji ? "bg-cyan-500/20 ring-1 ring-cyan-500" : "hover:bg-gray-700"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={editEstimate}
                        onChange={(e) => setEditEstimate(Math.max(5, parseInt(e.target.value) || 25))}
                        className="w-12 px-1 py-0.5 rounded bg-gray-900 border border-gray-600 text-white text-[10px] text-center"
                        min={5}
                      />
                      <span className="text-[10px] text-gray-500">phút</span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="p-1 rounded text-gray-400 hover:bg-gray-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 rounded text-green-400 hover:bg-green-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {task.emoji && (
                      <span className="text-sm flex-shrink-0">{task.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0" title={task.title}>
                      <span className={cn(
                        "text-sm block truncate",
                        task.status === "in_progress" ? "text-white" : "text-gray-300"
                      )}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">
                          {task.estimated_minutes}m
                        </span>
                        {task.actual_minutes > 0 && (
                          <span className="text-[10px] text-cyan-400">
                            +{task.actual_minutes}m đã làm
                          </span>
                        )}
                        {task.is_template && (
                          <span className="text-[10px] text-purple-400">Template</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700"
                        title="Sửa"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      {task.status !== "pending" && (
                        <button
                          onClick={() => handleStatusChange(task, "pending")}
                          className="p-1 rounded text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20"
                          title="Reset"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      {task.status !== "skipped" && task.status !== "completed" && (
                        <button
                          onClick={() => handleStatusChange(task, "skipped")}
                          className="p-1 rounded text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20"
                          title="Bỏ qua"
                        >
                          <SkipForward className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                        title="Xóa"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Completed Tasks Toggle */}
      {completedTasks.length > 0 && (
        <div className="border-t border-gray-800 pt-2">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
          >
            {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>Đã hoàn thành ({completedTasks.length})</span>
          </button>

          {showCompleted && (
            <div className="mt-2 space-y-1 animate-zen-fade">
              {completedTasks.map((task) => {
                const config = STATUS_CONFIG[task.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={task.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800/30 transition-colors"
                  >
                    <StatusIcon className={cn("w-4 h-4 flex-shrink-0", config.color)} />
                    {task.emoji && <span className="text-sm opacity-60">{task.emoji}</span>}
                    <span className="text-sm text-gray-500 line-through flex-1 truncate" title={task.title}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleStatusChange(task, "pending")}
                      className="p-1 rounded text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Khôi phục"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Xóa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
