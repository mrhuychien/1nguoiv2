"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useProjectData } from "@/hooks/use-project-data";
import { ProjectModal } from "@/components/projects/project-modal";
import { NewProjectModal } from "@/components/zen/project-sidebar";
import { Project } from "@/types/database.types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Plus,
  MoreHorizontal,
  Lightbulb,
  Ruler,
  Hammer,
  FlaskConical,
  Rocket,
  PauseCircle,
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Zap,
  Pencil,
  Trash2,
  Play,
  ArrowRight,
  Eye,
  Brain,
} from "lucide-react";

type LifecycleFilter = "all" | "idea" | "designing" | "building" | "testing" | "shipped" | "paused";

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
  },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 14) return "1 tuần trước";
  return `${Math.floor(diffDays / 7)} tuần trước`;
}

interface ProjectMenuProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMoveNext: () => void;
  onPause: () => void;
  onResume: () => void;
}

function ProjectMenu({ project, onEdit, onDelete, onMoveNext, onPause, onResume }: ProjectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = lifecycleConfig[project.lifecycle];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-text-muted hover:text-text-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-background-secondary border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden">
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-background-tertiary flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Chỉnh sửa
            </button>

            {/* Brainstorm AI for idea stage projects */}
            {project.lifecycle === "idea" && (
              <Link
                href={`/brainstorm?projectId=${project.id}&title=${encodeURIComponent(project.title)}&description=${encodeURIComponent(project.description || '')}`}
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-purple-500/10 flex items-center gap-2 text-purple-500"
              >
                <Brain className="h-4 w-4" />
                Brainstorm AI
              </Link>
            )}

            {config.next && project.lifecycle !== "paused" && (
              <button
                onClick={() => { onMoveNext(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-background-tertiary flex items-center gap-2 text-cyan"
              >
                <ArrowRight className="h-4 w-4" />
                Chuyển sang {lifecycleConfig[config.next].label}
              </button>
            )}

            {project.lifecycle !== "paused" && project.lifecycle !== "shipped" && (
              <button
                onClick={() => { onPause(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-background-tertiary flex items-center gap-2 text-slate-500"
              >
                <PauseCircle className="h-4 w-4" />
                Tạm dừng
              </button>
            )}

            {project.lifecycle === "paused" && (
              <button
                onClick={() => { onResume(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-background-tertiary flex items-center gap-2 text-green-500"
              >
                <Play className="h-4 w-4" />
                Tiếp tục
              </button>
            )}

            <hr className="my-1 border-border" />

            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/10 flex items-center gap-2 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Xóa dự án
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ActiveProjectCard({
  project,
  onEdit,
  onDelete,
  onMoveNext,
  onPause,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMoveNext: () => void;
  onPause: () => void;
}) {
  const config = lifecycleConfig[project.lifecycle];
  const Icon = config.icon;

  return (
    <Card className="p-6 flex flex-col gap-6 hover:shadow-xl hover:shadow-cyan/5 transition-all group relative overflow-hidden border-border">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center ${config.color} border ${config.border}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-cyan transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 ${config.bg} ${config.color} text-[10px] font-bold uppercase tracking-wider rounded border ${config.border} flex items-center gap-1.5`}>
                <Icon className="h-3 w-3" />
                {config.emoji} {config.label}
              </span>
            </div>
          </div>
        </div>
        <ProjectMenu
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveNext={onMoveNext}
          onPause={onPause}
          onResume={() => {}}
        />
      </div>

      {/* Tasks */}
      <div className="grid grid-cols-1 gap-3">
        {project.last_task && (
          <div className="bg-background-tertiary/30 rounded-xl p-3 border border-border/50">
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              VỪA XONG
            </p>
            <p className="text-sm font-medium text-text-secondary italic line-through decoration-text-muted/50">
              {project.last_task}
            </p>
          </div>
        )}
        {project.current_task && (
          <div className="bg-cyan/5 rounded-xl p-4 border border-cyan/10 ring-1 ring-cyan/5">
            <p className="text-[10px] font-bold text-cyan uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              VIỆC CẦN LÀM
            </p>
            <p className="text-sm font-semibold text-text-primary">
              {project.current_task}
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Tiến độ</span>
          <span className="font-bold">{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-background-tertiary rounded-full overflow-hidden">
          <div
            className={`h-full ${config.progress} rounded-full transition-all`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        {project.deadline ? (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}</span>
          </div>
        ) : (
          <div />
        )}
        <Link
          href={`/projects/${project.id}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan hover:underline underline-offset-4"
        >
          <Eye className="h-3.5 w-3.5" />
          Xem chi tiết
        </Link>
      </div>
    </Card>
  );
}

function IdeaCard({
  project,
  onEdit,
  onDelete,
  onMoveNext,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMoveNext: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 hover:border-yellow-500 transition-all group cursor-pointer relative">
      <div className="flex items-center justify-between mb-3">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <h4 className="font-semibold text-sm truncate">{project.title}</h4>
        </Link>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-background-secondary border border-border rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-background-tertiary flex items-center gap-2"
                >
                  <Pencil className="h-3 w-3" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => { onMoveNext(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-background-tertiary flex items-center gap-2 text-blue-500"
                >
                  <ArrowRight className="h-3 w-3" />
                  Bắt đầu thiết kế
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-500/10 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Link href={`/projects/${project.id}`}>
        <p className="text-xs text-text-muted line-clamp-2 mb-3">
          {project.description || "Chưa có mô tả"}
        </p>
      </Link>
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <span className="text-[10px] font-bold text-yellow-500">💡 IDEA</span>
        <span className="text-[10px] text-text-muted">
          {formatRelativeTime(project.created_at)}
        </span>
      </div>
    </Card>
  );
}

function ShippedCard({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-5 flex items-center justify-between group">
      <Link href={`/projects/${project.id}`} className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
          <Rocket className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm">{project.title}</h4>
          <p className="text-xs text-text-muted">
            Hoàn thành: {project.deadline ? new Date(project.deadline).toLocaleDateString("vi-VN") : "N/A"}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-bold rounded uppercase">
          🚀 SHIPPED
        </span>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-background-secondary border border-border rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-500/10 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function PausedCard({
  project,
  onDelete,
  onResume,
}: {
  project: Project;
  onDelete: () => void;
  onResume: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-5 flex items-center justify-between opacity-70 group hover:opacity-100 transition-opacity">
      <Link href={`/projects/${project.id}`} className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500">
          <PauseCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm">{project.title}</h4>
          <p className="text-xs text-text-muted">
            Tạm dừng từ: {project.updated_at ? new Date(project.updated_at).toLocaleDateString("vi-VN") : "N/A"}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 bg-slate-500/10 text-slate-500 text-[9px] font-bold rounded uppercase">
          ⏸️ PAUSED
        </span>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 w-36 bg-background-secondary border border-border rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { onResume(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-background-tertiary flex items-center gap-2 text-green-500"
                >
                  <Play className="h-3 w-3" />
                  Tiếp tục
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-red-500/10 flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Xóa
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ProjectsPage() {
  const { projects, isLoading } = useProjectData();
  const { updateProjectInDb, deleteProjectFromDb } = useProjectStore();
  const [filter, setFilter] = useState<LifecycleFilter>("all");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Handlers
  const handleCreateProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleSaveProject = async (data: Partial<Project>): Promise<boolean> => {
    if (!editingProject) return false;

    try {
      await updateProjectInDb(editingProject.id, data);
      return true;
    } catch (error) {
      console.error("Error saving project:", error);
      return false;
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa dự án này?")) {
      await deleteProjectFromDb(id);
    }
  };

  const handleMoveToNextStage = async (project: Project) => {
    const config = lifecycleConfig[project.lifecycle];
    if (config.next) {
      await updateProjectInDb(project.id, {
        lifecycle: config.next,
        status: config.next === "shipped" ? "completed" : "active",
        last_task: project.current_task,
        current_task: null,
      });
    }
  };

  const handlePauseProject = async (project: Project) => {
    await updateProjectInDb(project.id, {
      lifecycle: "paused",
      status: "archived",
    });
  };

  const handleResumeProject = async (project: Project) => {
    await updateProjectInDb(project.id, {
      lifecycle: "building", // Resume to building by default
      status: "active",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan" />
      </div>
    );
  }

  // Filter projects by lifecycle
  const activeProjects = projects.filter(
    (p) => ["building", "designing", "testing"].includes(p.lifecycle) &&
      (filter === "all" || p.lifecycle === filter)
  );

  const ideaProjects = projects.filter(
    (p) => p.lifecycle === "idea" && (filter === "all" || filter === "idea")
  );

  const shippedProjects = projects.filter(
    (p) => p.lifecycle === "shipped" && (filter === "all" || filter === "shipped")
  );

  const pausedProjects = projects.filter(
    (p) => p.lifecycle === "paused" && (filter === "all" || filter === "paused")
  );

  const filterButtons: { key: LifecycleFilter; label: string; icon: React.ComponentType<{ className?: string }>; emoji: string }[] = [
    { key: "all", label: "TẤT CẢ", icon: LayoutGrid, emoji: "" },
    { key: "idea", label: "IDEA", icon: Lightbulb, emoji: "💡" },
    { key: "designing", label: "DESIGNING", icon: Ruler, emoji: "📐" },
    { key: "building", label: "BUILDING", icon: Hammer, emoji: "🏗️" },
    { key: "testing", label: "TESTING", icon: FlaskConical, emoji: "🧪" },
    { key: "shipped", label: "SHIPPED", icon: Rocket, emoji: "🚀" },
    { key: "paused", label: "PAUSED", icon: PauseCircle, emoji: "⏸️" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Lifecycle</h2>
            <p className="text-text-muted mt-1">
              Theo dõi tiến trình từ ý tưởng đến khi ra mắt
            </p>
          </div>
          <Button className="shadow-lg shadow-cyan/20" onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm mới
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {filterButtons.map((item) => {
            const Icon = item.icon;
            const isActive = filter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-cyan text-white shadow-md shadow-cyan/20"
                    : "bg-background-secondary border border-border hover:border-cyan/50 text-text-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.emoji && <span>{item.emoji}</span>}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Active Projects */}
        {activeProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h3 className="text-xl font-bold">Active Projects</h3>
              <span className="px-2 py-0.5 bg-background-tertiary rounded-full text-xs font-bold text-text-muted">
                {activeProjects.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <ActiveProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onMoveNext={() => handleMoveToNextStage(project)}
                  onPause={() => handlePauseProject(project)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ideas Repository */}
        {ideaProjects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full" />
                <h3 className="text-xl font-bold">Ideas Repository</h3>
                <span className="px-2 py-0.5 bg-background-tertiary rounded-full text-xs font-bold text-text-muted">
                  {ideaProjects.length}
                </span>
              </div>
              <button className="text-sm font-medium text-cyan hover:text-cyan/80">
                Xem tất cả ý tưởng →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ideaProjects.slice(0, 4).map((project) => (
                <IdeaCard
                  key={project.id}
                  project={project}
                  onEdit={() => handleEditProject(project)}
                  onDelete={() => handleDeleteProject(project.id)}
                  onMoveNext={() => handleMoveToNextStage(project)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Shipped & On Hold */}
        {(shippedProjects.length > 0 || pausedProjects.length > 0) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recently Shipped */}
            {shippedProjects.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-green-500 rounded-full" />
                  <h3 className="text-xl font-bold">Recently Shipped</h3>
                </div>
                <div className="space-y-4">
                  {shippedProjects.map((project) => (
                    <ShippedCard
                      key={project.id}
                      project={project}
                      onDelete={() => handleDeleteProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* On Hold */}
            {pausedProjects.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-slate-500 rounded-full" />
                  <h3 className="text-xl font-bold">On Hold</h3>
                </div>
                <div className="space-y-4">
                  {pausedProjects.map((project) => (
                    <PausedCard
                      key={project.id}
                      project={project}
                      onDelete={() => handleDeleteProject(project.id)}
                      onResume={() => handleResumeProject(project)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Chưa có dự án nào
            </h3>
            <p className="text-text-secondary mb-4">
              Tạo dự án đầu tiên để bắt đầu
            </p>
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án mới
            </Button>
          </div>
        )}

        {/* New Project Modal (unified) */}
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
        />

        {/* Edit Project Modal */}
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProject}
          project={editingProject}
          mode="edit"
        />
      </div>
  );
}
