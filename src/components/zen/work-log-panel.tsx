"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Pause,
  PlayCircle,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { WorkLogEntry } from "@/types/zen";
import { cn } from "@/lib/utils";

interface WorkLogPanelProps {
  className?: string;
}

// Format timestamp to readable time
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Get status config
const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    label: "Hoàn thành",
  },
  in_progress: {
    icon: PlayCircle,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    label: "Đang làm",
  },
  paused: {
    icon: Pause,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    label: "Tạm dừng",
  },
};

export function WorkLogPanel({ className }: WorkLogPanelProps) {
  const { getTodayWorkLog } = useZenStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const todayLog = getTodayWorkLog();

  // Calculate today's total time
  const totalMinutes = todayLog.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const completedCount = todayLog.filter((e) => e.status === "completed").length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Work Log
          </h3>
          {todayLog.length > 0 && (
            <span className="text-xs text-gray-500">
              ({todayLog.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalMinutes > 0 && (
            <span className="text-xs text-purple-400">
              {formatDuration(totalMinutes)}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          )}
        </div>
      </button>

      {/* Summary stats */}
      {isExpanded && todayLog.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{completedCount} tasks done</span>
          <span>•</span>
          <span>{formatDuration(totalMinutes)} tổng</span>
        </div>
      )}

      {/* Log entries */}
      {isExpanded && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {todayLog.length === 0 ? (
            <div className="p-4 rounded-lg bg-gray-900/30 border border-dashed border-gray-800 text-center">
              <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chưa có hoạt động nào</p>
              <p className="text-xs text-gray-500 mt-1">
                Hoàn thành timer session để ghi log
              </p>
            </div>
          ) : (
            todayLog.map((entry) => (
              <WorkLogEntryCard key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Work log entry card
function WorkLogEntryCard({ entry }: { entry: WorkLogEntry }) {
  const status = STATUS_CONFIG[entry.status];
  const StatusIcon = status.icon;

  return (
    <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "p-1.5 rounded-lg",
            status.bgColor
          )}
        >
          <StatusIcon className={cn("w-4 h-4", status.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {entry.taskEmoji && (
              <span className="text-sm">{entry.taskEmoji}</span>
            )}
            <p className="text-sm font-medium text-white truncate">
              {entry.taskTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Time */}
            <span className="text-xs text-gray-500">
              {formatTime(entry.timestamp)}
            </span>

            {/* Duration */}
            <span className="text-xs text-purple-400 font-medium">
              +{formatDuration(entry.durationMinutes)}
            </span>

            {/* Project */}
            {entry.projectName && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${entry.projectColor || "#6b7280"}20`,
                  color: entry.projectColor || "#6b7280",
                }}
              >
                {entry.projectName}
              </span>
            )}

            {/* Zone */}
            {entry.zone && (
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                entry.zone === "morning" && "bg-amber-500/10 text-amber-400",
                entry.zone === "afternoon" && "bg-orange-500/10 text-orange-400",
                entry.zone === "evening" && "bg-violet-500/10 text-violet-400"
              )}>
                {entry.zone === "morning" ? "Sáng" : entry.zone === "afternoon" ? "Chiều" : "Tối"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
