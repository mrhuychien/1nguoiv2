"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  Ruler,
  Hammer,
  FlaskConical,
  Rocket,
  PauseCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Play,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/project-store";
import { useZenStore } from "@/store/zen-store";
import { useProjectData } from "@/hooks/use-project-data";
import { cn } from "@/lib/utils";
import { Task } from "@/types/database.types";
import { TaskStatus } from "@/types/zen";

const lifecycleConfig = {
  idea: {
    label: "IDEA",
    icon: Lightbulb,
    emoji: "💡",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    progress: "bg-yellow-500",
    next: "designing" as const,
    nextLabel: "Start Designing",
  },
  designing: {
    label: "DESIGNING",
    icon: Ruler,
    emoji: "📐",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    progress: "bg-blue-500",
    next: "building" as const,
    nextLabel: "Start Building",
  },
  building: {
    label: "BUILDING",
    icon: Hammer,
    emoji: "🏗️",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    progress: "bg-orange-500",
    next: "testing" as const,
    nextLabel: "Start Testing",
  },
  testing: {
    label: "TESTING",
    icon: FlaskConical,
    emoji: "🧪",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    progress: "bg-purple-500",
    next: "shipped" as const,
    nextLabel: "Ship It!",
  },
  shipped: {
    label: "SHIPPED",
    icon: Rocket,
    emoji: "🚀",
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    progress: "bg-green-500",
    next: null,
    nextLabel: null,
  },
  paused: {
    label: "PAUSED",
    icon: PauseCircle,
    emoji: "⏸️",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    progress: "bg-slate-500",
    next: null,
    nextLabel: "Resume Project",
  },
};

const healthConfig = {
  "on-track": {
    label: "Đúng tiến độ",
    variant: "success" as const,
    icon: CheckCircle,
  },
  "at-risk": {
    label: "Có rủi ro",
    variant: "warning" as const,
    icon: AlertTriangle,
  },
  blocked: {
    label: "Bị chặn",
    variant: "danger" as const,
    icon: AlertTriangle,
  },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { isLoading, userId } = useProjectData();
  const {
    getProjectById,
    getProjectTasks,
    updateProjectInDb,
    deleteProjectFromDb,
    createTask,
    toggleTaskCompleteInDb,
    deleteTaskFromDb,
    updateTaskInDb,
  } = useProjectStore();

  // Get zen-store data for Zen Focus projects
  const {
    projects: zenProjects,
    getProjectTemplateTasks,
    completeTemplateTask,
    skipTemplateTask,
    startTemplateTask,
    deleteProject: deleteZenProject,
    addTask: addZenTask,
  } = useZenStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "template" | "manual">("all");

  // Try to find project in project-store first, then zen-store
  const projectFromStore = getProjectById(projectId);
  const zenProject = zenProjects.find((p) => p.id === projectId);

  // Determine which project system we're using
  const isZenProject = !projectFromStore && !!zenProject;
  const manualTasks = getProjectTasks(projectId);
  const templateTasks = getProjectTemplateTasks(projectId);

  // Get zen project's manual tasks (stored in ZenProject.tasks)
  const zenManualTasks = zenProject?.tasks || [];

  // Unified task type for display
  interface DisplayTask {
    id: string;
    title: string;
    completed: boolean;
    status: TaskStatus;
    emoji?: string;
    estimatedMinutes?: number;
    timeSpentMinutes?: number;
    zone?: string;
    phase?: number;
    isTemplate: boolean;
  }

  // Combine tasks for display
  const allTasks: DisplayTask[] = [
    // Template tasks from zen-store
    ...templateTasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.status === "completed",
      status: t.status,
      emoji: t.emoji,
      estimatedMinutes: t.estimatedMinutes,
      timeSpentMinutes: t.timeSpentMinutes,
      zone: t.zone,
      phase: t.phase,
      isTemplate: true,
    })),
    // Manual tasks from project-store (for regular projects)
    ...manualTasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      status: t.completed ? "completed" as TaskStatus : "pending" as TaskStatus,
      emoji: undefined,
      estimatedMinutes: undefined,
      timeSpentMinutes: undefined,
      zone: undefined,
      phase: undefined,
      isTemplate: false,
    })),
    // Manual tasks from zen-store (for zen projects)
    ...zenManualTasks.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.status === "completed",
      status: t.status,
      emoji: t.emoji,
      estimatedMinutes: t.estimatedMinutes,
      timeSpentMinutes: t.actualMinutes,
      zone: t.zone,
      phase: t.phase,
      isTemplate: false,
    })),
  ];

  // Filter based on view mode
  const displayTasks = viewMode === "all"
    ? allTasks
    : viewMode === "template"
    ? allTasks.filter((t) => t.isTemplate)
    : allTasks.filter((t) => !t.isTemplate);

  // manualTasks is used directly as 'tasks' for backward compatibility with handleToggleDailyFocus

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  // Project not found in either store
  if (!projectFromStore && !zenProject) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Không tìm thấy dự án
          </h2>
          <p className="text-text-secondary mb-4">
            Dự án bạn tìm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // For Zen projects, create a compatible project object
  const project = projectFromStore || (zenProject ? {
    id: zenProject.id,
    title: zenProject.name,
    description: "",
    lifecycle: "building" as const,
    status: "active" as const,
    health: "on-track" as const,
    progress: zenProject.totalMinutes > 0
      ? Math.round((zenProject.completedMinutes / zenProject.totalMinutes) * 100)
      : 0,
    deadline: null,
    current_task: null,
    last_task: null,
    created_at: zenProject.createdAt.toString(),
    updated_at: zenProject.updatedAt.toString(),
    user_id: userId || "",
    color: zenProject.color,
    icon: zenProject.icon,
    templateId: zenProject.templateId,
  } : null);

  if (!project) {
    return null;
  }

  const config = lifecycleConfig[project.lifecycle];
  const Icon = config.icon;
  const health = healthConfig[project.health];
  const HealthIcon = health.icon;
  const completedTasks = allTasks.filter((t) => t.completed || t.status === "completed" || t.status === "skipped").length;
  const totalTaskCount = allTasks.length;

  const handleMoveToNextStage = async () => {
    if (isZenProject) {
      // Zen projects don't have lifecycle stages yet
      return;
    }
    if (config.next) {
      await updateProjectInDb(project.id, {
        lifecycle: config.next,
        status: config.next === "shipped" ? "completed" : "active",
        last_task: project.current_task,
        current_task: null,
      });
    } else if (project.lifecycle === "paused") {
      await updateProjectInDb(project.id, {
        lifecycle: "building",
        status: "active",
      });
    }
  };

  const handlePauseProject = async () => {
    if (isZenProject) return;
    await updateProjectInDb(project.id, {
      lifecycle: "paused",
      status: "archived",
    });
  };

  const handleDeleteProject = async () => {
    if (confirm("Bạn có chắc muốn xóa dự án này?")) {
      if (isZenProject) {
        deleteZenProject(project.id);
      } else {
        await deleteProjectFromDb(project.id);
      }
      router.push(isZenProject ? "/zen" : "/projects");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    if (isZenProject) {
      // Add task to zen-store
      addZenTask(project.id, newTaskTitle.trim(), 25); // Default 25 minutes
    } else if (userId) {
      await createTask({
        user_id: userId,
        project_id: project.id,
        title: newTaskTitle.trim(),
        completed: false,
        is_daily_focus: false,
      });
    }
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleToggleDailyFocus = async (task: Task) => {
    await updateTaskInDb(task.id, {
      is_daily_focus: !task.is_daily_focus,
    });
  };

  const handleUpdateProgress = async (newProgress: number) => {
    await updateProjectInDb(project.id, {
      progress: Math.min(100, Math.max(0, newProgress)),
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {config.next && project.lifecycle !== "shipped" && (
            <Button onClick={handleMoveToNextStage} className="shadow-lg shadow-cyan/20">
              <ArrowRight className="h-4 w-4 mr-2" />
              {config.nextLabel || lifecycleConfig[config.next]?.label}
            </Button>
          )}
          {project.lifecycle === "paused" && (
            <Button onClick={handleMoveToNextStage} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Tiếp tục
            </Button>
          )}
          {project.lifecycle !== "paused" && project.lifecycle !== "shipped" && (
            <Button variant="outline" onClick={handlePauseProject}>
              <PauseCircle className="h-4 w-4 mr-2" />
              Tạm dừng
            </Button>
          )}
          <Button variant="danger" size="icon" onClick={handleDeleteProject}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <Card className={cn("border-2", config.border)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  config.bg,
                  config.color,
                  "border",
                  config.border
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                      config.bg,
                      config.color,
                      "border",
                      config.border
                    )}
                  >
                    {config.emoji} {config.label}
                  </span>
                  <Badge variant={health.variant}>
                    <HealthIcon className="h-3 w-3 mr-1" />
                    {health.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {project.description && (
            <p className="text-text-secondary">{project.description}</p>
          )}

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Tiến độ</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleUpdateProgress(project.progress - 10)}
                  disabled={project.progress <= 0}
                >
                  -
                </Button>
                <span className="font-bold text-lg w-12 text-center">
                  {project.progress}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleUpdateProgress(project.progress + 10)}
                  disabled={project.progress >= 100}
                >
                  +
                </Button>
              </div>
            </div>
            <Progress value={project.progress} className={config.progress} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-background-secondary rounded-xl p-4 text-center">
              <Calendar className="h-5 w-5 text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted mb-1">Deadline</p>
              <p className="font-semibold text-sm">
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString("vi-VN")
                  : "Chưa đặt"}
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4 text-center">
              <CheckCircle2 className="h-5 w-5 text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted mb-1">Tasks</p>
              <p className="font-semibold text-sm">
                {completedTasks}/{totalTaskCount}
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4 text-center">
              <Clock className="h-5 w-5 text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted mb-1">Tạo ngày</p>
              <p className="font-semibold text-sm">
                {new Date(project.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="bg-background-secondary rounded-xl p-4 text-center">
              <Clock className="h-5 w-5 text-text-muted mx-auto mb-2" />
              <p className="text-xs text-text-muted mb-1">Cập nhật</p>
              <p className="font-semibold text-sm">
                {new Date(project.updated_at).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg">
              Tasks ({completedTasks}/{totalTaskCount})
            </CardTitle>
            {/* View Mode Tabs */}
            {(templateTasks.length > 0 || manualTasks.length > 0) && (
              <div className="flex items-center gap-1 p-1 bg-background-secondary rounded-lg">
                <button
                  onClick={() => setViewMode("all")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    viewMode === "all"
                      ? "bg-cyan text-white"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  Tất cả ({allTasks.length})
                </button>
                {templateTasks.length > 0 && (
                  <button
                    onClick={() => setViewMode("template")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      viewMode === "template"
                        ? "bg-purple-500 text-white"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    Template ({templateTasks.length})
                  </button>
                )}
                {manualTasks.length > 0 && (
                  <button
                    onClick={() => setViewMode("manual")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      viewMode === "manual"
                        ? "bg-orange-500 text-white"
                        : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    Thủ công ({manualTasks.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input
              placeholder="Thêm task mới..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={isAddingTask}
            />
            <Button type="submit" disabled={!newTaskTitle.trim() || isAddingTask}>
              {isAddingTask ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* Task List */}
          {displayTasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">
                {viewMode === "all"
                  ? "Chưa có task nào. Thêm task đầu tiên!"
                  : viewMode === "template"
                  ? "Chưa có template task nào."
                  : "Chưa có task thủ công nào."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayTasks.map((task) => {
                const isCompleted = task.completed || task.status === "completed";
                const isSkipped = task.status === "skipped";
                const isInProgress = task.status === "in_progress";

                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors group",
                      isCompleted
                        ? "bg-success/5 border-success/20"
                        : isSkipped
                        ? "bg-slate-500/5 border-slate-500/20"
                        : isInProgress
                        ? "bg-cyan/5 border-cyan/20"
                        : "bg-background-secondary border-border hover:border-border-hover"
                    )}
                  >
                    {/* Checkbox or Status Icon */}
                    {task.isTemplate ? (
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : isSkipped ? (
                          <Circle className="h-5 w-5 text-slate-500" />
                        ) : isInProgress ? (
                          <Clock className="h-5 w-5 text-cyan animate-pulse" />
                        ) : (
                          <Circle className="h-5 w-5 text-text-muted" />
                        )}
                      </div>
                    ) : (
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompleteInDb(task.id)}
                      />
                    )}

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {task.emoji && (
                          <span className="text-base">{task.emoji}</span>
                        )}
                        <span
                          className={cn(
                            "text-sm truncate",
                            isCompleted || isSkipped
                              ? "text-text-muted line-through"
                              : isInProgress
                              ? "text-cyan font-medium"
                              : "text-text-primary"
                          )}
                        >
                          {task.title}
                        </span>
                        {task.isTemplate && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-400 border-purple-500/30">
                            Template
                          </Badge>
                        )}
                        {task.zone && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            {task.zone === "design" ? "📐" : "🔨"} {task.zone}
                          </Badge>
                        )}
                      </div>
                      {task.isTemplate && task.estimatedMinutes && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                          <span>⏱️ {task.estimatedMinutes}m dự kiến</span>
                          {(task.timeSpentMinutes ?? 0) > 0 && (
                            <span className="text-cyan">• {task.timeSpentMinutes}m đã làm</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.isTemplate ? (
                        <>
                          {!isCompleted && !isSkipped && !isInProgress && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-cyan hover:bg-cyan/10"
                              onClick={() => startTemplateTask(task.id)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Bắt đầu
                            </Button>
                          )}
                          {isInProgress && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-success hover:bg-success/10"
                                onClick={() => completeTemplateTask(task.id)}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Xong
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-text-muted hover:bg-slate-500/10"
                                onClick={() => skipTemplateTask(task.id)}
                              >
                                Bỏ qua
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-7 px-2 text-xs",
                              manualTasks.find((t) => t.id === task.id)?.is_daily_focus
                                ? "text-warning bg-warning/10"
                                : "text-text-muted"
                            )}
                            onClick={() => {
                              const originalTask = manualTasks.find((t) => t.id === task.id);
                              if (originalTask) handleToggleDailyFocus(originalTask);
                            }}
                          >
                            {manualTasks.find((t) => t.id === task.id)?.is_daily_focus ? "★" : "☆"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-danger hover:text-danger hover:bg-danger/10"
                            onClick={() => deleteTaskFromDb(task.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Task & Last Task */}
      <div className="grid md:grid-cols-2 gap-4">
        {project.current_task && (
          <Card className="border-cyan/20 bg-cyan/5">
            <CardHeader className="pb-2">
              <p className="text-xs font-bold text-cyan uppercase tracking-wider">
                Việc đang làm
              </p>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{project.current_task}</p>
            </CardContent>
          </Card>
        )}
        {project.last_task && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Vừa hoàn thành
              </p>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-text-secondary line-through">
                {project.last_task}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
