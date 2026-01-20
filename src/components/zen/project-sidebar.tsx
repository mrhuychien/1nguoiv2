"use client";

import { useState } from "react";
import {
  Plus,
  Folder,
  ChevronRight,
  ChevronDown,
  Rocket,
  Pen,
  Book,
  Briefcase,
  Code,
  Palette,
  ListTodo,
  Circle,
  CheckCircle2,
  Clock,
  SkipForward,
  GripVertical,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { cn } from "@/lib/utils";
import { TemplateSelector } from "./template-selector";
import { TemplatePreview } from "./template-preview";
import type { TemplateId, TaskStatus } from "@/types/zen";
import {
  getTemplateEstimatedTime,
  formatMinutesToHours,
} from "@/lib/data/project-templates";

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

const STATUS_ICONS: Record<TaskStatus, React.ElementType> = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  blocked: Circle,
  skipped: SkipForward,
};

// Unified task type for display
interface DisplayTask {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedMinutes: number;
  emoji?: string;
  isTemplate: boolean;
}

export function ProjectSidebar({ className }: ProjectSidebarProps) {
  const {
    projects,
    activeProjectId,
    setActiveProject,
    setShowNewProjectModal,
    getProjectTemplateTasks,
  } = useZenStore();

  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

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
          const isExpanded = expandedProjectId === project.id;
          const Icon = ICONS[project.icon] || Folder;

          // Get both template and manual tasks
          const templateTasks = getProjectTemplateTasks(project.id);
          const manualTasks = project.tasks || [];

          // Combine into display tasks
          const allTasks: DisplayTask[] = [
            ...templateTasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              estimatedMinutes: t.estimatedMinutes,
              emoji: t.emoji,
              isTemplate: true,
            })),
            ...manualTasks.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              estimatedMinutes: t.estimatedMinutes,
              isTemplate: false,
            })),
          ];

          const completedCount = allTasks.filter(
            (t) => t.status === "completed" || t.status === "skipped"
          ).length;
          const totalTasks = allTasks.length;
          const progress =
            totalTasks > 0
              ? (completedCount / totalTasks) * 100
              : 0;

          // Filter active tasks for display (pending + in_progress)
          const activeTasks = allTasks.filter(
            (t) => t.status === "pending" || t.status === "in_progress"
          ).sort((a, b) => {
            // in_progress first
            if (a.status === "in_progress" && b.status !== "in_progress") return -1;
            if (b.status === "in_progress" && a.status !== "in_progress") return 1;
            return 0;
          });

          const handleProjectClick = () => {
            setActiveProject(project.id);
            setExpandedProjectId(isExpanded ? null : project.id);
          };

          const handleDragStart = (e: React.DragEvent, task: DisplayTask) => {
            e.dataTransfer.setData("application/json", JSON.stringify({
              taskId: task.id,
              taskType: task.isTemplate ? "template" : "manual",
              title: task.title,
              emoji: task.emoji,
            }));
            e.dataTransfer.effectAllowed = "move";
          };

          return (
            <div key={project.id}>
              <button
                onClick={handleProjectClick}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                  isActive
                    ? "bg-gray-800/80 border border-gray-700"
                    : "hover:bg-gray-800/50"
                )}
              >
                {/* Expand/collapse icon */}
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </div>

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
                      {completedCount}/{totalTasks} tasks
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
              </button>

              {/* Expandable Task List */}
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-1 animate-zen-fade">
                  {activeTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 p-2 pl-6">
                      Không có task nào
                    </p>
                  ) : (
                    activeTasks.slice(0, 5).map((task) => {
                      const StatusIcon = STATUS_ICONS[task.status];
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all",
                            "border border-transparent hover:border-gray-700 hover:bg-gray-800/50",
                            task.status === "in_progress" && "bg-cyan-500/10 border-cyan-500/30"
                          )}
                        >
                          <GripVertical className="w-3 h-3 text-gray-600 flex-shrink-0" />
                          <StatusIcon
                            className={cn(
                              "w-4 h-4 flex-shrink-0",
                              task.status === "in_progress" ? "text-cyan-400" : "text-gray-500"
                            )}
                          />
                          {task.emoji && (
                            <span className="text-sm flex-shrink-0">{task.emoji}</span>
                          )}
                          <span className={cn(
                            "text-sm truncate flex-1",
                            task.status === "in_progress" ? "text-white" : "text-gray-400"
                          )}>
                            {task.title}
                          </span>
                          <span className="text-[10px] text-gray-600 flex-shrink-0">
                            {task.estimatedMinutes}m
                          </span>
                        </div>
                      );
                    })
                  )}
                  {activeTasks.length > 5 && (
                    <p className="text-xs text-gray-500 p-2 pl-6">
                      +{activeTasks.length - 5} tasks khác
                    </p>
                  )}
                </div>
              )}
            </div>
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

// New Project Modal with Template Support
export function NewProjectModal() {
  const {
    showNewProjectModal,
    setShowNewProjectModal,
    addProject,
    addProjectWithTemplate,
  } = useZenStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("rocket");
  const [templateId, setTemplateId] = useState<TemplateId>("web-app");
  const [showPreview, setShowPreview] = useState(false);

  if (!showNewProjectModal) return null;

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (templateId === "blank") {
      addProject(name.trim(), color, icon);
    } else {
      addProjectWithTemplate(name.trim(), color, icon, templateId);
    }

    // Reset
    setName("");
    setColor(COLORS[0]);
    setIcon("rocket");
    setTemplateId("web-app");
    setStep(1);
    setShowPreview(false);
  };

  const handleClose = () => {
    setName("");
    setColor(COLORS[0]);
    setIcon("rocket");
    setTemplateId("web-app");
    setStep(1);
    setShowPreview(false);
    setShowNewProjectModal(false);
  };

  const totalTime = getTemplateEstimatedTime(templateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg p-6 mx-4 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {step === 1 ? "🚀 Dự án mới - Bước 1/2" : "📂 Chọn Template - Bước 2/2"}
        </h2>

        {step === 1 ? (
          // STEP 1: Project Name, Color & Icon
          <div className="space-y-5">
            {/* Name input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Tên project *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: SaaS Product, Landing Page..."
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
                      color === c &&
                        "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Icon picker */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Icon</label>
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
                onClick={handleClose}
                className="flex-1 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:from-cyan-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp →
              </button>
            </div>
          </div>
        ) : (
          // STEP 2: Template Selection
          <div className="space-y-5">
            <TemplateSelector value={templateId} onChange={setTemplateId} />

            {/* Preview Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <ListTodo className="w-3 h-3" />
                {showPreview ? "▼ Ẩn xem trước tasks" : "▶ Xem trước tasks"}
              </button>
              {totalTime > 0 && (
                <span className="text-xs text-gray-500">
                  Tổng: ~{formatMinutesToHours(totalTime)}
                </span>
              )}
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                <TemplatePreview templateId={templateId} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:from-cyan-400 hover:to-purple-400 transition-colors"
              >
                Tạo dự án
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
