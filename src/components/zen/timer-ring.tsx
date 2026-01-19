"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { useZenStore, formatZenTime } from "@/store/zen-store";
import { cn } from "@/lib/utils";

interface TimerRingProps {
  size?: "sm" | "md" | "lg";
  showControls?: boolean;
  className?: string;
}

const SIZES = {
  sm: { ring: 120, stroke: 4, text: "text-xl" },
  md: { ring: 180, stroke: 6, text: "text-3xl" },
  lg: { ring: 240, stroke: 8, text: "text-4xl" },
};

export function TimerRing({
  size = "md",
  showControls = true,
  className,
}: TimerRingProps) {
  const {
    timerState,
    timerSeconds,
    timerTargetMinutes,
    flowState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    tickTimer,
  } = useZenStore();

  const { ring, stroke, text } = SIZES[size];
  const radius = (ring - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;

  // Calculate progress
  const totalSeconds = timerTargetMinutes * 60;
  const progress = timerState === "idle" ? 0 : (totalSeconds - timerSeconds) / totalSeconds;
  const strokeDashoffset = circumference - progress * circumference;

  // Timer tick effect
  useEffect(() => {
    if (timerState !== "running") return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState, tickTimer]);

  // Colors based on flow state
  const getFlowColor = () => {
    switch (flowState) {
      case "flow":
        return "stroke-green-500";
      case "focus":
        return "stroke-cyan-500";
      case "break":
        return "stroke-amber-500";
      default:
        return "stroke-gray-500";
    }
  };

  const getGlowStyle = () => {
    if (timerState !== "running") return {};

    const colors = {
      flow: "rgba(34, 197, 94, 0.4)",
      focus: "rgba(0, 212, 255, 0.4)",
      break: "rgba(251, 191, 36, 0.4)",
      rest: "rgba(107, 114, 128, 0.3)",
    };

    return {
      filter: `drop-shadow(0 0 20px ${colors[flowState]})`,
    };
  };

  const handlePlayPause = () => {
    if (timerState === "idle" || timerState === "completed") {
      startTimer();
    } else if (timerState === "running") {
      pauseTimer();
    } else if (timerState === "paused") {
      resumeTimer();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Timer Ring */}
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg
          width={ring}
          height={ring}
          className={cn(
            "transform -rotate-90 transition-all duration-300",
            timerState === "running" && flowState === "flow" && "animate-breathe"
          )}
          style={getGlowStyle()}
        >
          {/* Background ring */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-gray-800/50"
          />

          {/* Progress ring */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            className={cn(
              "transition-all duration-300",
              getFlowColor()
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-mono font-bold text-white transition-all",
              text,
              timerState === "running" && flowState === "flow" && "animate-timer-pulse"
            )}
          >
            {formatZenTime(timerState === "idle" ? timerTargetMinutes * 60 : timerSeconds)}
          </span>

          {/* Flow state indicator */}
          {timerState === "running" && (
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider mt-1 transition-colors",
                flowState === "flow" && "text-green-400",
                flowState === "focus" && "text-cyan-400",
                flowState === "break" && "text-amber-400"
              )}
            >
              {flowState === "flow" ? "In Flow" : flowState === "focus" ? "Focusing" : "Break"}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={handlePlayPause}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all",
              "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400",
              "shadow-lg hover:shadow-glow-cyan",
              timerState === "running" && "animate-pulse-glow"
            )}
          >
            {timerState === "running" ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>

          {/* Stop button */}
          {(timerState === "running" || timerState === "paused") && (
            <button
              onClick={stopTimer}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                "bg-gray-800 hover:bg-gray-700 border border-gray-700",
                "text-gray-400 hover:text-white"
              )}
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Reset button */}
          {timerState === "completed" && (
            <button
              onClick={resetTimer}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full transition-all",
                "bg-gray-800 hover:bg-gray-700 border border-gray-700",
                "text-gray-400 hover:text-white"
              )}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Timer presets */}
      {timerState === "idle" && showControls && (
        <div className="flex items-center gap-2 mt-2">
          {[15, 25, 45, 60].map((minutes) => (
            <button
              key={minutes}
              onClick={() => useZenStore.getState().setTimerTarget(minutes)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                timerTargetMinutes === minutes
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600"
              )}
            >
              {minutes}m
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
