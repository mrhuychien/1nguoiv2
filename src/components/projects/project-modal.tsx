"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@/types/database.types";
import { TemplateSelector } from "@/components/zen/template-selector";
import { TemplatePreview } from "@/components/zen/template-preview";
import type { TemplateId } from "@/types/zen";
import {
  getTemplateEstimatedTime,
  formatMinutesToHours,
  PROJECT_TEMPLATES,
} from "@/lib/data/project-templates";
import {
  Lightbulb,
  Ruler,
  Hammer,
  FlaskConical,
  Rocket,
  PauseCircle,
  ListTodo,
} from "lucide-react";

type Lifecycle = "idea" | "designing" | "building" | "testing" | "shipped" | "paused";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project> & { templateId?: TemplateId }) => Promise<boolean>;
  project?: Project | null;
  mode: "create" | "edit";
}

const lifecycleOptions: { value: Lifecycle; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "idea", label: "Idea", icon: Lightbulb, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  { value: "designing", label: "Designing", icon: Ruler, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  { value: "building", label: "Building", icon: Hammer, color: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
  { value: "testing", label: "Testing", icon: FlaskConical, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  { value: "shipped", label: "Shipped", icon: Rocket, color: "text-green-500 bg-green-500/10 border-green-500/30" },
  { value: "paused", label: "Paused", icon: PauseCircle, color: "text-slate-500 bg-slate-500/10 border-slate-500/30" },
];

export function ProjectModal({ isOpen, onClose, onSave, project, mode }: ProjectModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lifecycle, setLifecycle] = useState<Lifecycle>("idea");
  const [deadline, setDeadline] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("web-app");
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project && mode === "edit") {
      setTitle(project.title);
      setDescription(project.description || "");
      setLifecycle(project.lifecycle);
      setDeadline(project.deadline || "");
      setProgress(project.progress);
      setCurrentTask(project.current_task || "");
    } else {
      // Reset form for create mode
      setTitle("");
      setDescription("");
      setLifecycle("idea");
      setDeadline("");
      setProgress(0);
      setCurrentTask("");
      setTemplateId("web-app");
      setStep(1);
      setShowPreview(false);
    }
  }, [project, mode, isOpen]);

  const handleNext = () => {
    if (step === 1 && title.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) return;

    setIsSaving(true);
    setError(null);

    const data: Partial<Project> & { templateId?: TemplateId } = {
      title: title.trim(),
      description: description.trim() || null,
      lifecycle,
      deadline: deadline || null,
      progress,
      current_task: currentTask.trim() || null,
      status: lifecycle === "shipped" ? "completed" : lifecycle === "paused" ? "archived" : "active",
    };

    // Add templateId for create mode
    if (mode === "create") {
      data.templateId = templateId;
    }

    if (project && mode === "edit") {
      data.id = project.id;
    }

    try {
      const success = await onSave(data);
      if (success) {
        handleClose();
      } else {
        setError("Không thể lưu dự án. Vui lòng thử lại.");
      }
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setShowPreview(false);
    onClose();
  };

  const totalTime = getTemplateEstimatedTime(templateId);
  const selectedTemplate = PROJECT_TEMPLATES.find(t => t.id === templateId);

  // For edit mode, show single-step form
  if (mode === "edit") {
    return (
      <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Chỉnh sửa dự án</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tên dự án *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tên dự án..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về dự án..."
                rows={3}
              />
            </div>

            {/* Lifecycle Status */}
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <div className="grid grid-cols-3 gap-2">
                {lifecycleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = lifecycle === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLifecycle(option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? option.color + " border-current"
                          : "bg-background-secondary border-border text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Progress (only for non-idea projects) */}
            {lifecycle !== "idea" && (
              <div className="space-y-2">
                <Label htmlFor="progress">Tiến độ: {progress}%</Label>
                <input
                  type="range"
                  id="progress"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-cyan"
                />
              </div>
            )}

            {/* Current Task */}
            {lifecycle !== "idea" && lifecycle !== "shipped" && (
              <div className="space-y-2">
                <Label htmlFor="currentTask">Việc đang làm</Label>
                <Input
                  id="currentTask"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="Task hiện tại..."
                />
              </div>
            )}

            {/* Deadline */}
            {lifecycle !== "shipped" && lifecycle !== "paused" && (
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={isSaving}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    );
  }

  // Create mode - 2-step wizard
  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>
            {step === 1 ? "🚀 Dự án mới - Bước 1/2" : "📂 Chọn Template - Bước 2/2"}
          </ModalTitle>
        </ModalHeader>

        {step === 1 ? (
          // STEP 1: Basic Info
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Tên dự án *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: SaaS Product, Landing Page..."
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả (không bắt buộc)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về dự án..."
                rows={2}
              />
            </div>

            {/* Lifecycle Status */}
            <div className="space-y-2">
              <Label>Bắt đầu từ giai đoạn</Label>
              <div className="grid grid-cols-3 gap-2">
                {lifecycleOptions.slice(0, 3).map((option) => {
                  const Icon = option.icon;
                  const isSelected = lifecycle === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLifecycle(option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? option.color + " border-current"
                          : "bg-background-secondary border-border text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (không bắt buộc)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1"
                disabled={!title.trim()}
              >
                Tiếp →
              </Button>
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
                className="text-xs text-cyan hover:text-cyan/80 flex items-center gap-1"
              >
                <ListTodo className="w-3 h-3" />
                {showPreview ? "▼ Ẩn xem trước tasks" : "▶ Xem trước tasks"}
              </button>
              {totalTime > 0 && (
                <span className="text-xs text-text-muted">
                  {selectedTemplate?.tasks.length || 0} tasks • ~{formatMinutesToHours(totalTime)}
                </span>
              )}
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                <TemplatePreview templateId={templateId} />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1" disabled={isSaving}>
                ← Quay lại
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? "Đang tạo..." : "Tạo dự án"}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
