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
import { useProjectData } from "@/hooks/use-project-data";
import { cn } from "@/lib/utils";
import { Task } from "@/types/database.types";

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

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const project = getProjectById(projectId);
  const tasks = getProjectTasks(projectId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  // Project not found
  if (!project) {
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

  const config = lifecycleConfig[project.lifecycle];
  const Icon = config.icon;
  const health = healthConfig[project.health];
  const HealthIcon = health.icon;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const handleMoveToNextStage = async () => {
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
    await updateProjectInDb(project.id, {
      lifecycle: "paused",
      status: "archived",
    });
  };

  const handleDeleteProject = async () => {
    if (confirm("Bạn có chắc muốn xóa dự án này?")) {
      await deleteProjectFromDb(project.id);
      router.push("/projects");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !userId) return;

    setIsAddingTask(true);
    await createTask({
      user_id: userId,
      project_id: project.id,
      title: newTaskTitle.trim(),
      completed: false,
      is_daily_focus: false,
    });
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
                {completedTasks}/{tasks.length}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Tasks ({completedTasks}/{tasks.length})
            </CardTitle>
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
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">
                Chưa có task nào. Thêm task đầu tiên!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors group",
                    task.completed
                      ? "bg-success/5 border-success/20"
                      : "bg-background-secondary border-border hover:border-border-hover"
                  )}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompleteInDb(task.id)}
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      task.completed
                        ? "text-text-muted line-through"
                        : "text-text-primary"
                    )}
                  >
                    {task.title}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-xs",
                        task.is_daily_focus
                          ? "text-warning bg-warning/10"
                          : "text-text-muted"
                      )}
                      onClick={() => handleToggleDailyFocus(task)}
                    >
                      {task.is_daily_focus ? "★" : "☆"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-danger hover:text-danger hover:bg-danger/10"
                      onClick={() => deleteTaskFromDb(task.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
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
