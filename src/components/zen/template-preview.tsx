"use client";

import {
  getTemplateById,
  formatMinutesToHours,
} from "@/lib/data/project-templates";
import type { TemplateId } from "@/types/zen";
import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  templateId: TemplateId;
  className?: string;
}

export function TemplatePreview({ templateId, className }: TemplatePreviewProps) {
  const template = getTemplateById(templateId);

  if (!template || template.tasks.length === 0) {
    return (
      <div
        className={cn(
          "p-4 bg-gray-800/30 rounded-xl border border-gray-700",
          className
        )}
      >
        <p className="text-sm text-gray-500 text-center">
          Không có tasks định sẵn
        </p>
      </div>
    );
  }

  const designingTasks = template.tasks.filter((t) => t.zone === "designing");
  const buildingTasks = template.tasks.filter((t) => t.zone === "building");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Designing Phase */}
      {designingTasks.length > 0 && (
        <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
          <h5 className="text-[10px] font-black text-cyan-400 uppercase tracking-wider mb-2">
            🎨 Thiết kế ({designingTasks.length} tasks)
          </h5>
          <div className="space-y-1.5">
            {designingTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-4">{i + 1}.</span>
                <span>{task.emoji}</span>
                <span className="text-gray-300 flex-1 truncate">
                  {task.title}
                </span>
                <span className="text-gray-600 text-[10px]">
                  {formatMinutesToHours(task.estimatedMinutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Building Phase */}
      {buildingTasks.length > 0 && (
        <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/20">
          <h5 className="text-[10px] font-black text-purple-400 uppercase tracking-wider mb-2">
            ⚡ Xây dựng ({buildingTasks.length} tasks)
          </h5>
          <div className="space-y-1.5">
            {buildingTasks.map((task, i) => (
              <div key={task.id} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-4">
                  {designingTasks.length + i + 1}.
                </span>
                <span>{task.emoji}</span>
                <span className="text-gray-300 flex-1 truncate">
                  {task.title}
                </span>
                <span className="text-gray-600 text-[10px]">
                  {formatMinutesToHours(task.estimatedMinutes)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
