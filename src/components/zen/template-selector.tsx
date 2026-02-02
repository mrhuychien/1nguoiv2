"use client";

import { Check } from "lucide-react";
import {
  PROJECT_TEMPLATES,
  getTemplateEstimatedTime,
  formatMinutesToHours,
} from "@/lib/data/project-templates";
import type { TemplateId } from "@/types/zen";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  value: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">
        Chọn Template
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PROJECT_TEMPLATES.map((template) => {
          const isSelected = value === template.id;
          const totalTime = getTemplateEstimatedTime(template.id);
          const taskCount = template.tasks.length;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={cn(
                "relative p-4 rounded-xl border text-left transition-all",
                "hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/20"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              )}
            >
              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Emoji */}
              <div className="text-2xl mb-2">{template.emoji}</div>

              {/* Name */}
              <h4
                className={cn(
                  "font-semibold text-sm",
                  isSelected ? "text-cyan-400" : "text-white"
                )}
              >
                {template.name}
              </h4>

              {/* Stats */}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
                <span>{taskCount} tasks</span>
                {totalTime > 0 && (
                  <>
                    <span>•</span>
                    <span>~{formatMinutesToHours(totalTime)}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Template Description */}
      {value && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400">
            {PROJECT_TEMPLATES.find((t) => t.id === value)?.description}
          </p>
        </div>
      )}
    </div>
  );
}
