"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import { useTimerStore } from "@/store/timer-store";

export function TimerMini() {
  const { isRunning, isPaused, elapsedTime, start, pause, resume, stop } = useTimerStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show consistent UI on server and initial client render
  if (!isMounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        disabled
      >
        <Play className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Bắt đầu</span>
      </Button>
    );
  }

  if (!isRunning && elapsedTime === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => start()}
        className="gap-2"
      >
        <Play className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Bắt đầu</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
      <span className="font-mono text-sm text-cyan min-w-[60px]">
        {formatTime(elapsedTime)}
      </span>
      <div className="flex items-center gap-1">
        {isPaused ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={resume}
          >
            <Play className="h-3.5 w-3.5 text-success" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={pause}
          >
            <Pause className="h-3.5 w-3.5 text-warning" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={stop}
        >
          <Square className="h-3.5 w-3.5 text-danger" />
        </Button>
      </div>
    </div>
  );
}
