"use client";

import { useEffect } from "react";
import { X, Coffee, Play, Pause, CheckCircle2, ArrowRight } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { BellAnimation } from "./zen-bell";
import { cn } from "@/lib/utils";

// Session Complete Overlay
export function SessionCompleteOverlay() {
  const {
    showSessionComplete,
    setShowSessionComplete,
    sessionsCompleted,
    timerConfig,
    startTimer,
    resetTimer,
  } = useZenStore();

  // Auto-close after 10 seconds
  useEffect(() => {
    if (showSessionComplete) {
      const timer = setTimeout(() => {
        setShowSessionComplete(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showSessionComplete, setShowSessionComplete]);

  if (!showSessionComplete) return null;

  const isLongBreak = sessionsCompleted % timerConfig.sessionsUntilLongBreak === 0;
  const breakDuration = isLongBreak
    ? timerConfig.longBreakDuration
    : timerConfig.shortBreakDuration;

  const handleTakeBreak = () => {
    setShowSessionComplete(false);
    // Could start a break timer here
  };

  const handleContinue = () => {
    setShowSessionComplete(false);
    resetTimer();
    startTimer();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setShowSessionComplete(false)}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl animate-scale-in">
        {/* Close button */}
        <button
          onClick={() => setShowSessionComplete(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Bell animation */}
        <div className="flex justify-center mb-6">
          <BellAnimation />
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Session hoàn thành!
          </h2>
          <p className="text-gray-400">
            Bạn đã hoàn thành {sessionsCompleted} sessions hôm nay
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">
              {sessionsCompleted}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Sessions
            </div>
          </div>
          <div className="w-px h-12 bg-gray-700" />
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {sessionsCompleted * 25}m
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">
              Focus time
            </div>
          </div>
        </div>

        {/* Break suggestion */}
        <div
          className={cn(
            "p-4 rounded-xl mb-6",
            isLongBreak
              ? "bg-amber-500/10 border border-amber-500/20"
              : "bg-cyan-500/10 border border-cyan-500/20"
          )}
        >
          <div className="flex items-center gap-3">
            <Coffee
              className={cn(
                "w-5 h-5",
                isLongBreak ? "text-amber-400" : "text-cyan-400"
              )}
            />
            <div>
              <p className="text-sm font-medium text-white">
                {isLongBreak ? "Nghỉ dài" : "Nghỉ ngắn"} {breakDuration} phút
              </p>
              <p className="text-xs text-gray-400">
                {isLongBreak
                  ? "Bạn đã làm việc chăm chỉ! Hãy nghỉ ngơi."
                  : "Nghỉ giải lao để duy trì năng lượng."}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleTakeBreak}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
          >
            <Coffee className="w-4 h-4" />
            Nghỉ {breakDuration}m
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-medium transition-colors"
          >
            Tiếp tục
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Deep Work Mode Overlay
export function DeepWorkOverlay() {
  const {
    showDeepWorkOverlay,
    exitDeepWorkMode,
    activeProjectId,
    timerState,
    timerSeconds,
    timerTargetMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    setTimerTarget,
    currentTimerTaskId,
    currentTimerTaskType,
    clearTimerTask,
  } = useZenStore();

  const { projects, tasks, completeTemplateTask, updateTaskInDb } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Get current task
  const currentTask = currentTimerTaskId
    ? tasks.find((t) => t.id === currentTimerTaskId)
    : null;

  if (!showDeepWorkOverlay) return null;

  // Calculate timer progress
  const totalSeconds = timerTargetMinutes * 60;
  const progress = timerState === "idle" ? 0 : (totalSeconds - timerSeconds) / totalSeconds;

  const handleExit = () => {
    exitDeepWorkMode();
  };

  const handlePlayPause = () => {
    if (timerState === "running") {
      pauseTimer();
    } else if (timerState === "paused") {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleCompleteTask = () => {
    if (currentTimerTaskId && currentTimerTaskType) {
      if (currentTimerTaskType === "template") {
        completeTemplateTask(currentTimerTaskId);
      } else {
        updateTaskInDb(currentTimerTaskId, {
          status: "completed",
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
      clearTimerTask();
    }
  };

  const handleClearTask = () => {
    clearTimerTask();
  };

  const handleTimePreset = (minutes: number) => {
    setTimerTarget(minutes);
    if (timerState === "idle") {
      startTimer(minutes);
    }
  };

  const TIME_PRESETS = [15, 25, 45, 60];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center animate-fade-in">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-4">
        {/* Project badge */}
        {activeProject && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${activeProject.color}15` }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeProject.color }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: activeProject.color }}
            >
              {activeProject.title}
            </span>
          </div>
        )}

        {/* Current Task */}
        {currentTask ? (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-8 rounded-xl bg-gray-800/50 border border-gray-700 animate-zen-fade">
            <button
              onClick={handleCompleteTask}
              className="text-cyan-400 hover:text-green-400 transition-colors"
              title="Hoàn thành task"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
            {currentTask.emoji && (
              <span className="text-base">{currentTask.emoji}</span>
            )}
            <span className="text-sm font-medium text-white max-w-[200px] truncate" title={currentTask.title}>
              {currentTask.title}
            </span>
            <button
              onClick={handleClearTask}
              className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ml-1"
              title="Gỡ task"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-8 rounded-xl border border-dashed border-gray-700 text-gray-500">
            <span className="text-sm">Không có task được chọn</span>
          </div>
        )}

        {/* Timer Ring */}
        <div className="relative mb-8">
          <svg width="280" height="280" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="140"
              cy="140"
              r="120"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className={cn(
                "transition-all duration-300",
                timerState === "running"
                  ? "stroke-cyan-500"
                  : timerState === "paused"
                  ? "stroke-yellow-500"
                  : "stroke-gray-600"
              )}
              style={{
                strokeDasharray: 120 * 2 * Math.PI,
                strokeDashoffset: 120 * 2 * Math.PI * (1 - progress),
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-light text-white tracking-wider">
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0")}
              <span className="text-gray-400 mx-1">:</span>
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all",
            timerState === "running"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
              : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
          )}
        >
          {timerState === "running" ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </button>

        {/* Time Presets */}
        <div className="flex items-center gap-2 mb-8">
          {TIME_PRESETS.map((minutes) => (
            <button
              key={minutes}
              onClick={() => handleTimePreset(minutes)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                timerTargetMinutes === minutes
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-transparent text-gray-500 hover:text-white hover:bg-gray-800/50 border border-transparent"
              )}
            >
              {minutes}m
            </button>
          ))}
        </div>

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="px-6 py-2.5 text-sm text-gray-500 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
        >
          Thoát (ESC)
        </button>
      </div>

      {/* Keyboard shortcut listener */}
      <KeyboardHandler onEscape={handleExit} />
    </div>
  );
}

// Keyboard handler component
function KeyboardHandler({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return null;
}
