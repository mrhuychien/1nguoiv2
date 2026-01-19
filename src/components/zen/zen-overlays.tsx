"use client";

import { useEffect } from "react";
import { X, Coffee, Sparkles, Target, ArrowRight } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
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
    setShowDeepWorkOverlay,
    exitDeepWorkMode,
    activeProjectId,
    projects,
    timerState,
    timerSeconds,
    timerTargetMinutes,
    flowState,
  } = useZenStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  if (!showDeepWorkOverlay) return null;

  // Calculate timer progress
  const totalSeconds = timerTargetMinutes * 60;
  const progress = timerState === "idle" ? 0 : (totalSeconds - timerSeconds) / totalSeconds;

  const handleExit = () => {
    exitDeepWorkMode();
    setShowDeepWorkOverlay(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
      {/* Ambient glow */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] transition-colors duration-1000",
          flowState === "flow"
            ? "bg-green-500/20"
            : flowState === "focus"
            ? "bg-cyan-500/20"
            : "bg-gray-500/10"
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Flow state indicator */}
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full mb-8 transition-all",
            flowState === "flow"
              ? "bg-green-500/20 text-green-400 animate-flow-glow"
              : flowState === "focus"
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-gray-500/20 text-gray-400"
          )}
        >
          {flowState === "flow" ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Target className="w-4 h-4" />
          )}
          <span className="text-sm font-medium uppercase tracking-wider">
            {flowState === "flow"
              ? "In Flow"
              : flowState === "focus"
              ? "Focusing"
              : "Ready"}
          </span>
        </div>

        {/* Timer display */}
        <div className="relative mb-8">
          {/* Ring */}
          <svg width="280" height="280" className="transform -rotate-90">
            <circle
              cx="140"
              cy="140"
              r="130"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-800/50"
            />
            <circle
              cx="140"
              cy="140"
              r="130"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              className={cn(
                "transition-all duration-300",
                flowState === "flow"
                  ? "stroke-green-500"
                  : flowState === "focus"
                  ? "stroke-cyan-500"
                  : "stroke-gray-500"
              )}
              style={{
                strokeDasharray: 130 * 2 * Math.PI,
                strokeDashoffset: 130 * 2 * Math.PI * (1 - progress),
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                "text-6xl font-mono font-bold text-white",
                timerState === "running" &&
                  flowState === "flow" &&
                  "animate-timer-pulse"
              )}
            >
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0")}
              :
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
            {activeProject && (
              <span className="text-sm text-gray-400 mt-2">
                {activeProject.name}
              </span>
            )}
          </div>
        </div>

        {/* Breathing guide */}
        <div
          className={cn(
            "w-4 h-4 rounded-full mb-8",
            flowState === "flow"
              ? "bg-green-400 animate-breathe"
              : flowState === "focus"
              ? "bg-cyan-400 animate-breathe"
              : "bg-gray-400"
          )}
        />

        {/* Exit button */}
        <button
          onClick={handleExit}
          className="px-6 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
        >
          Thoát Deep Work (ESC)
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
