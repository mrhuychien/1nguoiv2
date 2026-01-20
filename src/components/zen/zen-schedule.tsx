"use client";

import { useEffect, useState } from "react";
import { Sun, Sunset, Moon, Clock, Settings, Check, X } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { DeepWorkZone as DeepWorkZoneType, ZenScheduleBlock } from "@/types/zen";
import { cn } from "@/lib/utils";

interface ZenScheduleProps {
  className?: string;
}

const ZONE_STYLES: Record<
  DeepWorkZoneType,
  {
    icon: React.ElementType;
    label: string;
    labelVi: string;
    color: string;
    bgColor: string;
    activeColor: string;
  }
> = {
  morning: {
    icon: Sun,
    label: "Morning",
    labelVi: "Sáng sớm",
    color: "text-amber-400",
    bgColor: "bg-amber-500/20 border-amber-500/30",
    activeColor: "bg-amber-500",
  },
  afternoon: {
    icon: Sunset,
    label: "Afternoon",
    labelVi: "Chiều",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20 border-orange-500/30",
    activeColor: "bg-orange-500",
  },
  evening: {
    icon: Moon,
    label: "Evening",
    labelVi: "Tối",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20 border-violet-500/30",
    activeColor: "bg-violet-500",
  },
};

// Helper to check if current time is within a zone
function isInZone(block: ZenScheduleBlock): boolean {
  const hour = new Date().getHours();
  return hour >= block.startHour && hour < block.endHour;
}

// Helper to get current zone from schedule blocks
function getCurrentZoneFromBlocks(blocks: ZenScheduleBlock[]): DeepWorkZoneType | null {
  for (const block of blocks) {
    if (isInZone(block)) {
      return block.zone;
    }
  }
  return null;
}

// Format hours for display
function formatHours(startHour: number, endHour: number): string {
  const formatHour = (h: number) => `${h.toString().padStart(2, "0")}:00`;
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
}

export function ZenSchedule({ className }: ZenScheduleProps) {
  const { currentZone, setCurrentZone, scheduleBlocks, updateScheduleBlock } = useZenStore();
  const [timeString, setTimeString] = useState("--:--");
  const [editingZone, setEditingZone] = useState<DeepWorkZoneType | null>(null);
  const [editStart, setEditStart] = useState(0);
  const [editEnd, setEditEnd] = useState(0);

  // Update current time every minute and check zone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setTimeString(`${hours}:${minutes}`);

      const zone = getCurrentZoneFromBlocks(scheduleBlocks);
      if (zone !== currentZone) {
        setCurrentZone(zone);
      }
    };

    // Initial update
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [currentZone, setCurrentZone, scheduleBlocks]);

  // Start editing a zone
  const handleStartEdit = (zone: DeepWorkZoneType, e: React.MouseEvent) => {
    e.stopPropagation();
    const block = scheduleBlocks.find((b) => b.zone === zone);
    if (block) {
      setEditingZone(zone);
      setEditStart(block.startHour);
      setEditEnd(block.endHour);
    }
  };

  // Save edited zone
  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingZone && editStart < editEnd) {
      const block = scheduleBlocks.find((b) => b.zone === editingZone);
      if (block) {
        updateScheduleBlock(block.id, { startHour: editStart, endHour: editEnd });
      }
    }
    setEditingZone(null);
  };

  // Cancel editing
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingZone(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current time */}
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Bây giờ: {timeString}</span>
      </div>

      {/* Schedule blocks */}
      <div className="space-y-2">
        {scheduleBlocks.map((block) => {
          const style = ZONE_STYLES[block.zone];
          const isActive = currentZone === block.zone;
          const isEditing = editingZone === block.zone;
          const Icon = style.icon;

          return (
            <div
              key={block.id}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                "hover:bg-gray-800/50",
                isActive
                  ? style.bgColor
                  : "bg-gray-900/50 border-gray-800",
                isActive && "shadow-lg"
              )}
              onClick={() => !isEditing && setCurrentZone(block.zone)}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
                    style.activeColor
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
                    isActive ? style.color : "text-gray-500"
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
                    {block.label}
                  </span>
                  {isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-white/10 rounded">
                      Now
                    </span>
                  )}
                </div>

                {/* Time display or edit form */}
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={editStart}
                      onChange={(e) => setEditStart(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">-</span>
                    <select
                      value={editEnd}
                      onChange={(e) => setEditEnd(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, "0")}:00
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 rounded hover:bg-green-500/20 text-green-400"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    {formatHours(block.startHour, block.endHour)}
                  </span>
                )}
              </div>

              {/* Edit button & Zone status */}
              {!isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleStartEdit(block.zone, e)}
                    className="p-1.5 rounded hover:bg-gray-700/50 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isActive
                        ? `${style.activeColor} animate-pulse`
                        : "bg-gray-700"
                    )}
                  />
                </div>
              )}
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
  const { currentZone, scheduleBlocks } = useZenStore();
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

  const style = ZONE_STYLES[currentZone];
  const block = scheduleBlocks.find((b) => b.zone === currentZone);
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full",
        style.bgColor,
        className
      )}
    >
      <Icon className={cn("w-3 h-3", style.color)} />
      <span className={cn("text-xs font-medium", style.color)}>
        {block?.label || style.labelVi}
      </span>
    </div>
  );
}
