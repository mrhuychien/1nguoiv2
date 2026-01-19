"use client";

import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { cn } from "@/lib/utils";

interface ZenBellProps {
  className?: string;
}

export function ZenBell({ className }: ZenBellProps) {
  const { bellEnabled, toggleBell, ringBell } = useZenStore();
  const [isRinging, setIsRinging] = useState(false);

  const handleClick = () => {
    if (bellEnabled) {
      // Ring the bell
      setIsRinging(true);
      ringBell();
      setTimeout(() => setIsRinging(false), 500);
    } else {
      // Toggle bell on
      toggleBell();
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBell();
  };

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleRightClick}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all",
        "hover:bg-gray-800/50",
        bellEnabled
          ? "text-amber-400 hover:text-amber-300"
          : "text-gray-500 hover:text-gray-400",
        className
      )}
      title={bellEnabled ? "Click to ring, right-click to mute" : "Click to enable bell"}
    >
      {/* Ripple effect when ringing */}
      {isRinging && (
        <>
          <span className="absolute inset-0 rounded-full bg-amber-400/30 animate-ripple" />
          <span
            className="absolute inset-0 rounded-full bg-amber-400/20 animate-ripple"
            style={{ animationDelay: "0.1s" }}
          />
        </>
      )}

      {bellEnabled ? (
        <Bell
          className={cn(
            "w-5 h-5 transition-transform",
            isRinging && "animate-bell-ring"
          )}
        />
      ) : (
        <BellOff className="w-5 h-5" />
      )}

      {/* Status dot */}
      <span
        className={cn(
          "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full transition-colors",
          bellEnabled ? "bg-amber-400" : "bg-gray-600"
        )}
      />
    </button>
  );
}

// Standalone Bell Icon for overlay animations
export function BellAnimation({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ripple" />
      <div
        className="absolute inset-0 rounded-full bg-amber-400/10 animate-ripple"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="absolute inset-0 rounded-full bg-amber-400/5 animate-ripple"
        style={{ animationDelay: "0.4s" }}
      />

      {/* Bell icon */}
      <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
        <Bell className="w-10 h-10 text-white animate-bell-ring" />
      </div>
    </div>
  );
}
