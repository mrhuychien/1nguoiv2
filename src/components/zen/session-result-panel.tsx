"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  File,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { cn } from "@/lib/utils";
import type { SessionFile } from "@/types/zen";

interface SessionResultPanelProps {
  className?: string;
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  return File;
}

export function SessionResultPanel({ className }: SessionResultPanelProps) {
  const { workLog, updateWorkLogEntry, getLatestWorkLogEntry } = useZenStore();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get today's work log entries
  const today = new Date().toISOString().split("T")[0];
  const todayEntries = workLog.filter((entry) => entry.date === today);

  // Get selected entry or latest
  const selectedEntry = selectedEntryId
    ? workLog.find((e) => e.id === selectedEntryId)
    : getLatestWorkLogEntry();

  // Update notes when selected entry changes
  useEffect(() => {
    if (selectedEntry) {
      setNotes(selectedEntry.notes || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntry?.id]);

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;
    setIsSaving(true);
    updateWorkLogEntry(selectedEntry.id, { notes });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEntry || !e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const newFiles: SessionFile[] = [];

    for (const file of files) {
      // Convert to base64 data URL
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: dataUrl,
        uploadedAt: new Date().toISOString(),
      });
    }

    const existingFiles = selectedEntry.files || [];
    updateWorkLogEntry(selectedEntry.id, {
      files: [...existingFiles, ...newFiles],
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (fileId: string) => {
    if (!selectedEntry) return;
    const updatedFiles = (selectedEntry.files || []).filter((f) => f.id !== fileId);
    updateWorkLogEntry(selectedEntry.id, { files: updatedFiles });
  };

  if (todayEntries.length === 0) {
    return (
      <div className={cn("p-4 rounded-xl bg-surface border border-border", className)}>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-medium text-white text-sm">Kết quả phiên làm việc</h3>
        </div>
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chưa có phiên làm việc nào hôm nay</p>
          <p className="text-xs text-gray-600 mt-1">Bắt đầu timer để ghi nhận kết quả</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-surface border border-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-medium text-white text-sm">Kết quả phiên làm việc</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-gray-800 text-gray-400"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 animate-zen-fade">
          {/* Session selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {todayEntries.slice(0, 5).map((entry) => (
              <button
                key={entry.id}
                onClick={() => setSelectedEntryId(entry.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors",
                  (selectedEntry?.id === entry.id)
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-gray-800/50 text-gray-400 hover:text-white border border-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {entry.taskEmoji && <span>{entry.taskEmoji}</span>}
                  <span className="truncate max-w-[100px]">{entry.taskTitle}</span>
                  <span className="text-gray-500">• {formatTime(entry.durationMinutes)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected session info */}
          {selectedEntry && (
            <>
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {selectedEntry.taskEmoji && (
                        <span className="text-sm">{selectedEntry.taskEmoji}</span>
                      )}
                      <span className="font-medium text-white text-sm truncate" title={selectedEntry.taskTitle}>
                        {selectedEntry.taskTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>{formatTime(selectedEntry.durationMinutes)}</span>
                      {selectedEntry.projectName && (
                        <>
                          <span>•</span>
                          <span
                            className="truncate"
                            style={{ color: selectedEntry.projectColor }}
                          >
                            {selectedEntry.projectName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Ghi chú kết quả</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  placeholder="Ghi chú những gì đã hoàn thành, kết quả đạt được..."
                  className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm placeholder:text-gray-500 outline-none focus:border-cyan-500 resize-none transition-colors"
                  rows={3}
                />
                <div className="flex justify-end mt-1">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </div>
              </div>

              {/* File upload */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Đính kèm file</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload file (ảnh, PDF, doc...)</span>
                </button>

                {/* File list */}
                {selectedEntry.files && selectedEntry.files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {selectedEntry.files.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      const isImage = file.type.startsWith("image/");

                      return (
                        <div
                          key={file.id}
                          className="group flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                        >
                          {isImage ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-10 h-10 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFile(file.id)}
                            className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                            title="Xóa file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
