"use client";

import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Maximize2, GripHorizontal } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";

export function DeepModeMini() {
  const {
    showMiniTimer,
    setShowMiniTimer,
    miniTimerPosition,
    setMiniTimerPosition,
    activeProjectId,
    timerState,
    timerSeconds,
    timerTargetMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    currentTimerTaskId,
    enterDeepWorkMode,
  } = useZenStore();

  const { projects, tasks } = useProjectStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentTask = currentTimerTaskId
    ? tasks.find((t) => t.id === currentTimerTaskId)
    : null;

  // Calculate progress
  const totalSeconds = timerTargetMinutes * 60;
  const progress = totalSeconds > 0 ? timerSeconds / totalSeconds : 0;

  // Set initial position on first show
  useEffect(() => {
    if (showMiniTimer && typeof window !== "undefined") {
      // If position is at default (1000, 500), move to bottom right
      if (miniTimerPosition.x === 1000 && miniTimerPosition.y === 500) {
        setMiniTimerPosition({
          x: window.innerWidth - 280,
          y: window.innerHeight - 180,
        });
      }
    }
  }, [showMiniTimer, miniTimerPosition.x, miniTimerPosition.y, setMiniTimerPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 120, e.clientY - dragOffset.y));
        setMiniTimerPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, setMiniTimerPosition]);

  const handlePlayPause = () => {
    if (timerState === "running") {
      pauseTimer();
    } else if (timerState === "paused") {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleExpandToFullscreen = () => {
    setShowMiniTimer(false);
    enterDeepWorkMode();
  };

  if (!showMiniTimer) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed z-50 w-[250px] rounded-2xl bg-gray-900/95 border border-gray-700 shadow-2xl backdrop-blur-sm",
        isDragging && "cursor-grabbing"
      )}
      style={{
        left: miniTimerPosition.x,
        top: miniTimerPosition.y,
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 border-b border-gray-800 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-400 font-medium">Focus Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExpandToFullscreen}
            className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Mở rộng (D)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowMiniTimer(false)}
            className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Đóng (M)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Project badge */}
        {activeProject && (
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs mb-3"
            style={{
              backgroundColor: `${activeProject.color}20`,
              color: activeProject.color,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeProject.color }}
            />
            <span className="truncate max-w-[150px]">{activeProject.title}</span>
          </div>
        )}

        {/* Timer display */}
        <div className="flex items-center gap-3">
          {/* Mini ring */}
          <div className="relative">
            <svg width="56" height="56" className="transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
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
                  strokeDasharray: 24 * 2 * Math.PI,
                  strokeDashoffset: 24 * 2 * Math.PI * (1 - progress),
                }}
              />
            </svg>
            {/* Play/pause button in center */}
            <button
              onClick={handlePlayPause}
              className={cn(
                "absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center transition-all",
                timerState === "running"
                  ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  : "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              )}
            >
              {timerState === "running" ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>

          {/* Time and task */}
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-light text-white tracking-wide">
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0")}
              <span className="text-gray-500">:</span>
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </div>
            {currentTask ? (
              <div className="flex items-center gap-1 mt-0.5">
                {currentTask.emoji && (
                  <span className="text-xs">{currentTask.emoji}</span>
                )}
                <span className="text-xs text-gray-400 truncate max-w-[120px]" title={currentTask.title}>
                  {currentTask.title}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">Không có task</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
