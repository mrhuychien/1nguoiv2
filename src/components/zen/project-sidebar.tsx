"use client";

import { useState } from "react";
import {
  Plus,
  Folder,
  ChevronRight,
  Rocket,
  Pen,
  Book,
  Briefcase,
  Code,
  Palette,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  className?: string;
}

const ICONS: Record<string, React.ElementType> = {
  rocket: Rocket,
  pen: Pen,
  book: Book,
  briefcase: Briefcase,
  code: Code,
  palette: Palette,
  folder: Folder,
};

const COLORS = [
  "#00d4ff", // cyan
  "#a855f7", // purple
  "#22c55e", // green
  "#f97316", // orange
  "#ec4899", // pink
  "#eab308", // yellow
];

export function ProjectSidebar({ className }: ProjectSidebarProps) {
  const {
    projects,
    activeProjectId,
    setActiveProject,
    setShowNewProjectModal,
  } = useZenStore();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Projects
        </h3>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Project list */}
      <div className="space-y-1">
        {projects.map((project) => {
          const isActive = activeProjectId === project.id;
          const Icon = ICONS[project.icon] || Folder;
          const completedTasks = project.tasks.filter(
            (t) => t.status === "completed"
          ).length;
          const totalTasks = project.tasks.length;
          const progress =
            project.totalMinutes > 0
              ? (project.completedMinutes / project.totalMinutes) * 100
              : 0;

          return (
            <button
              key={project.id}
              onClick={() => setActiveProject(project.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                isActive
                  ? "bg-gray-800/80 border border-gray-700"
                  : "hover:bg-gray-800/50"
              )}
            >
              {/* Icon */}
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: `${project.color}20` }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: project.color }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium truncate",
                      isActive ? "text-white" : "text-gray-300"
                    )}
                  >
                    {project.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                  {/* Progress bar */}
                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Arrow */}
              {isActive && (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="p-6 rounded-lg bg-gray-900/30 border border-dashed border-gray-800 text-center">
          <Folder className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Chưa có project nào</p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
          >
            + Tạo project đầu tiên
          </button>
        </div>
      )}
    </div>
  );
}

// New Project Modal
export function NewProjectModal() {
  const { showNewProjectModal, setShowNewProjectModal, addProject } =
    useZenStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("rocket");

  if (!showNewProjectModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject(name.trim(), color, icon);
    setName("");
    setColor(COLORS[0]);
    setIcon("rocket");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowNewProjectModal(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md p-6 mx-4 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl animate-scale-in">
        <h2 className="text-xl font-bold text-white mb-6">
          Tạo Project mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Tên project
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: SaaS Product"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 outline-none focus:border-cyan-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Màu sắc
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-10 h-10 rounded-lg transition-all",
                    color === c && "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Icon
            </label>
            <div className="flex gap-2">
              {Object.entries(ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    icon === key
                      ? "bg-gray-700 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(false)}
              className="flex-1 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Tạo project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
