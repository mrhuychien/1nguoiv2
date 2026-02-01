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
  FileText,
  Paperclip,
  File,
  X,
  Download,
  ZoomIn,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { WorkLogEntry, SessionFile } from "@/types/zen";
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
  const [viewingFile, setViewingFile] = useState<SessionFile | null>(null);

  const todayLog = getTodayWorkLog();

  const handleViewFile = (file: SessionFile) => {
    if (file.type.startsWith("image/")) {
      setViewingFile(file);
    } else {
      handleDownloadFile(file);
    }
  };

  const handleDownloadFile = (file: SessionFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <WorkLogEntryCard
                key={entry.id}
                entry={entry}
                onViewFile={handleViewFile}
              />
            ))
          )}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingFile && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={() => setViewingFile(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={() => setViewingFile(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors"
              title="Đóng"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <img
              src={viewingFile.url}
              alt={viewingFile.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* File info */}
            <div className="absolute -bottom-10 left-0 right-0 flex items-center justify-between text-sm text-white/70">
              <span className="truncate max-w-[60%]">{viewingFile.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(viewingFile);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Work log entry card
interface WorkLogEntryCardProps {
  entry: WorkLogEntry;
  onViewFile: (file: SessionFile) => void;
}

function WorkLogEntryCard({ entry, onViewFile }: WorkLogEntryCardProps) {
  const status = STATUS_CONFIG[entry.status];
  const StatusIcon = status.icon;
  const hasNotes = entry.notes && entry.notes.trim().length > 0;
  const hasFiles = entry.files && entry.files.length > 0;

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
            <p className="text-sm font-medium text-white truncate" title={entry.taskTitle}>
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

            {/* Notes indicator */}
            {hasNotes && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Ghi chú
              </span>
            )}

            {/* Files indicator */}
            {hasFiles && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {entry.files!.length} file
              </span>
            )}
          </div>

          {/* Notes preview */}
          {hasNotes && (
            <div className="mt-2 p-2 rounded bg-gray-800/50 border border-gray-700">
              <p className="text-xs text-gray-400 line-clamp-2">{entry.notes}</p>
            </div>
          )}

          {/* Files preview */}
          {hasFiles && (
            <div className="mt-2 flex gap-1.5 flex-wrap">
              {entry.files!.slice(0, 3).map((file) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <button
                    key={file.id}
                    onClick={() => onViewFile(file)}
                    className="relative group"
                    title={isImage ? "Xem ảnh" : "Tải xuống"}
                  >
                    {isImage ? (
                      <>
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-10 h-10 rounded object-cover border border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center border border-gray-600 hover:bg-gray-600 transition-colors">
                        <File className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}
              {entry.files!.length > 3 && (
                <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center border border-gray-600 text-xs text-gray-400">
                  +{entry.files!.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
