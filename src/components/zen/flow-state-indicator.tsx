"use client";

import { Zap, Brain, Coffee, Moon } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { FlowState } from "@/types/zen";
import { cn } from "@/lib/utils";

interface FlowStateIndicatorProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const FLOW_STATES: Record<
  FlowState,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  flow: {
    icon: Zap,
    label: "Flow State",
    color: "text-green-400",
    bgColor: "bg-green-500/20 border-green-500/30",
    description: "You're in the zone!",
  },
  focus: {
    icon: Brain,
    label: "Focusing",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
    description: "Building momentum...",
  },
  break: {
    icon: Coffee,
    label: "Taking Break",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    description: "Recharge time",
  },
  rest: {
    icon: Moon,
    label: "Resting",
    color: "text-gray-400",
    bgColor: "bg-gray-500/20 border-gray-500/30",
    description: "Ready to start",
  },
};

const SIZES = {
  sm: { icon: "w-3 h-3", text: "text-xs", padding: "px-2 py-1" },
  md: { icon: "w-4 h-4", text: "text-sm", padding: "px-3 py-1.5" },
  lg: { icon: "w-5 h-5", text: "text-base", padding: "px-4 py-2" },
};

export function FlowStateIndicator({
  size = "md",
  showLabel = true,
  className,
}: FlowStateIndicatorProps) {
  const { flowState, timerState } = useZenStore();
  const state = FLOW_STATES[flowState];
  const { icon, text, padding } = SIZES[size];
  const Icon = state.icon;

  const isActive = timerState === "running";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border transition-all",
        padding,
        state.bgColor,
        isActive && flowState === "flow" && "animate-flow-glow",
        className
      )}
    >
      <Icon
        className={cn(
          icon,
          state.color,
          isActive && "animate-pulse"
        )}
      />

      {showLabel && (
        <span className={cn(text, "font-medium", state.color)}>
          {state.label}
        </span>
      )}
    </div>
  );
}

// Detailed flow state card
export function FlowStateCard({ className }: { className?: string }) {
  const { flowState, timerState, sessionsCompleted } = useZenStore();
  const state = FLOW_STATES[flowState];
  const Icon = state.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        state.bgColor,
        timerState === "running" && flowState === "flow" && "animate-flow-glow",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg",
              "bg-black/20"
            )}
          >
            <Icon className={cn("w-5 h-5", state.color)} />
          </div>

          <div>
            <h4 className={cn("font-semibold", state.color)}>
              {state.label}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {state.description}
            </p>
          </div>
        </div>

        {/* Sessions counter */}
        <div className="text-right">
          <span className="text-2xl font-bold text-white">
            {sessionsCompleted}
          </span>
          <p className="text-xs text-gray-400">sessions</p>
        </div>
      </div>

      {/* Progress bar for flow state */}
      {timerState === "running" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Flow progress</span>
            <span>
              {flowState === "flow" ? "100%" : flowState === "focus" ? "Building..." : "0%"}
            </span>
          </div>
          <div className="h-1 bg-black/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                flowState === "flow"
                  ? "w-full bg-green-500"
                  : flowState === "focus"
                  ? "w-1/2 bg-cyan-500 animate-pulse"
                  : "w-0 bg-gray-500"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
