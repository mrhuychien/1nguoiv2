"use client";

import { useEffect } from "react";
import { Play, Pause, X, Maximize2 } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";

export default function MiniTimerPage() {
  const {
    activeProjectId,
    timerState,
    timerSeconds,
    timerTargetMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    tickTimer,
    currentTimerTaskId,
    setTimerTarget,
  } = useZenStore();

  const { projects, tasks } = useProjectStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentTask = currentTimerTaskId
    ? tasks.find((t) => t.id === currentTimerTaskId)
    : null;

  // Timer tick effect
  useEffect(() => {
    if (timerState === "running") {
      const interval = setInterval(tickTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState, tickTimer]);

  // Calculate progress
  const totalSeconds = timerTargetMinutes * 60;
  const progress = totalSeconds > 0 ? timerSeconds / totalSeconds : 0;

  const handlePlayPause = () => {
    if (timerState === "running") {
      pauseTimer();
    } else if (timerState === "paused") {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleOpenMain = () => {
    window.open("/zen", "_blank");
  };

  const handleClose = () => {
    window.close();
  };

  const handleTimePreset = (minutes: number) => {
    setTimerTarget(minutes);
    if (timerState === "idle") {
      startTimer(minutes);
    }
  };

  const TIME_PRESETS = [15, 25, 45, 60];

  return (
    <div className="min-h-screen bg-[#0d0d12] flex flex-col select-none">
      {/* Draggable title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-gray-900/80 border-b border-gray-800"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <span className="text-xs text-gray-400 font-medium">Focus Timer</span>
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={handleOpenMain}
            className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Mở Zen Focus"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Project badge */}
        {activeProject && (
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs mb-4"
            style={{
              backgroundColor: `${activeProject.color}20`,
              color: activeProject.color,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeProject.color }}
            />
            <span className="truncate max-w-[180px]">{activeProject.title}</span>
          </div>
        )}

        {/* Timer Ring */}
        <div className="relative mb-4">
          <svg width="140" height="140" className="transform -rotate-90">
            <circle
              cx="70"
              cy="70"
              r="60"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-800"
            />
            <circle
              cx="70"
              cy="70"
              r="60"
              strokeWidth="4"
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
                strokeDasharray: 60 * 2 * Math.PI,
                strokeDashoffset: 60 * 2 * Math.PI * (1 - progress),
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-light text-white tracking-wider">
              {Math.floor(timerSeconds / 60)
                .toString()
                .padStart(2, "0")}
              <span className="text-gray-500">:</span>
              {(timerSeconds % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Current task */}
        {currentTask && (
          <div className="flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700">
            {currentTask.emoji && (
              <span className="text-sm">{currentTask.emoji}</span>
            )}
            <span className="text-xs text-gray-300 truncate max-w-[150px]" title={currentTask.title}>
              {currentTask.title}
            </span>
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all",
            timerState === "running"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400"
              : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
          )}
        >
          {timerState === "running" ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>

        {/* Time Presets */}
        <div className="flex items-center gap-1.5">
          {TIME_PRESETS.map((minutes) => (
            <button
              key={minutes}
              onClick={() => handleTimePreset(minutes)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all",
                timerTargetMinutes === minutes
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "bg-transparent text-gray-500 hover:text-white hover:bg-gray-800/50 border border-transparent"
              )}
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 text-center border-t border-gray-800">
        <p className="text-[10px] text-gray-600">
          Tip: Bật &quot;Always on Top&quot; trong trình duyệt để luôn hiển thị
        </p>
      </div>
    </div>
  );
}
