"use client";

import { X } from "lucide-react";
import { TaskList } from "./task-list";
import { useZenStore } from "@/store/zen-store";

interface ProjectTasksPanelProps {
  onClose: () => void;
}

export function ProjectTasksPanel({ onClose }: ProjectTasksPanelProps) {
  const { activeProjectId, projects } = useZenStore();
  const project = projects.find((p) => p.id === activeProjectId);

  if (!project) return null;

  const hasTemplate = project.templateId && project.templateId !== "blank";
  const progressPercent =
    project.totalTasks && project.totalTasks > 0
      ? Math.round(((project.completedTasks || 0) / project.totalTasks) * 100)
      : 0;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-50 shadow-2xl animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">{project.name}</h3>
            <p className="text-xs mt-1 text-cyan-400">
              {project.templateId
                ? `Template: ${project.templateId}`
                : "Dự án tự tạo"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        {hasTemplate && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Tiến độ</span>
              <span className="text-white">
                {project.completedTasks || 0}/{project.totalTasks || 0} công
                việc
              </span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="p-4 overflow-y-auto h-[calc(100%-140px)] custom-scrollbar">
        {hasTemplate ? (
          <TaskList projectId={project.id} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">Dự án này không có template tasks</p>
            <p className="text-xs mt-2">
              Bạn có thể thêm tasks thủ công từ sidebar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
