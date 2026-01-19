"use client";

import { useEffect, useState } from "react";
import { Sun, Sunset, Moon, Clock } from "lucide-react";
import { useZenStore, getCurrentZone } from "@/store/zen-store";
import { DeepWorkZone } from "@/types/zen";
import { cn } from "@/lib/utils";

interface ZenScheduleProps {
  className?: string;
}

const ZONE_CONFIG: Record<
  DeepWorkZone,
  {
    icon: React.ElementType;
    label: string;
    labelVi: string;
    color: string;
    bgColor: string;
    hours: string;
  }
> = {
  morning: {
    icon: Sun,
    label: "Morning",
    labelVi: "Sáng sớm",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    hours: "5:00 - 9:00",
  },
  afternoon: {
    icon: Sunset,
    label: "Afternoon",
    labelVi: "Chiều",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
    hours: "13:00 - 17:00",
  },
  evening: {
    icon: Moon,
    label: "Evening",
    labelVi: "Tối",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20 border-violet-500/30",
    hours: "20:00 - 23:00",
  },
};

export function ZenSchedule({ className }: ZenScheduleProps) {
  const { currentZone, setCurrentZone } = useZenStore();
  const [isMounted, setIsMounted] = useState(false);
  const [timeString, setTimeString] = useState("--:--");

  // Update current time every minute
  useEffect(() => {
    setIsMounted(true);

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTimeString(`${hours}:${minutes}`);

      const zone = getCurrentZone();
      if (zone !== currentZone) {
        setCurrentZone(zone);
      }
    };

    // Initial update
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [currentZone, setCurrentZone]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current time */}
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Bây giờ: {timeString}</span>
      </div>

      {/* Schedule blocks */}
      <div className="space-y-2">
        {(Object.keys(ZONE_CONFIG) as DeepWorkZone[]).map((zone) => {
          const config = ZONE_CONFIG[zone];
          const isActive = currentZone === zone;
          const Icon = config.icon;

          return (
            <div
              key={zone}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                "hover:bg-gray-800/50",
                isActive
                  ? config.bgColor
                  : "bg-gray-900/50 border-gray-800",
                isActive && "shadow-lg"
              )}
              onClick={() => setCurrentZone(zone)}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                    zone === "morning" && "bg-amber-500",
                    zone === "afternoon" && "bg-orange-500",
                    zone === "evening" && "bg-violet-500"
                  )}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg",
                  isActive ? "bg-black/20" : "bg-gray-800"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? config.color : "text-gray-500"
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      isActive ? "text-white" : "text-gray-400"
                    )}
                  >
                    {config.labelVi}
                  </span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-white/10 rounded">
                      Now
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{config.hours}</span>
              </div>

              {/* Zone status */}
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isActive
                    ? zone === "morning"
                      ? "bg-amber-400 animate-pulse"
                      : zone === "afternoon"
                      ? "bg-orange-400 animate-pulse"
                      : "bg-violet-400 animate-pulse"
                    : "bg-gray-700"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Off-hours message */}
      {!currentZone && (
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            Ngoài khung giờ Deep Work
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Hãy nghỉ ngơi và nạp lại năng lượng
          </p>
        </div>
      )}
    </div>
  );
}

// Compact schedule indicator for header
export function ZenScheduleIndicator({ className }: { className?: string }) {
  const { currentZone } = useZenStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className={cn("flex items-center gap-1.5 text-gray-500", className)}>
        <div className="w-2 h-2 rounded-full bg-gray-600" />
        <span className="text-xs">...</span>
      </div>
    );
  }

  if (!currentZone) {
    return (
      <div className={cn("flex items-center gap-1.5 text-gray-500", className)}>
        <div className="w-2 h-2 rounded-full bg-gray-600" />
        <span className="text-xs">Off hours</span>
      </div>
    );
  }

  const config = ZONE_CONFIG[currentZone];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full",
        config.bgColor,
        className
      )}
    >
      <Icon className={cn("w-3 h-3", config.color)} />
      <span className={cn("text-xs font-medium", config.color)}>
        {config.labelVi}
      </span>
    </div>
  );
}
