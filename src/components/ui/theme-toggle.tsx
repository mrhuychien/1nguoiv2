"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: "default" | "sm" | "lg";
}

export function ThemeToggle({ className, showLabel = false, size = "default" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "sm" : size === "lg" ? "lg" : "icon"}
      onClick={toggleTheme}
      className={cn(
        "relative overflow-hidden transition-colors",
        showLabel && "gap-2 px-3",
        className
      )}
      title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
    >
      <div className="relative">
        <Sun
          className={cn(
            iconSize,
            "transition-all duration-300",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "rotate-90 scale-0 opacity-0 absolute"
          )}
        />
        <Moon
          className={cn(
            iconSize,
            "transition-all duration-300",
            theme === "light"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          )}
        />
      </div>
      {showLabel && (
        <span className="text-sm">
          {theme === "dark" ? "Sáng" : "Tối"}
        </span>
      )}
    </Button>
  );
}

// Larger toggle for settings page
export function ThemeToggleLarge() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 p-1 bg-background-tertiary rounded-xl">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium",
          theme === "light"
            ? "bg-background-secondary text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
      >
        <Sun className="h-4 w-4" />
        Sáng
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium",
          theme === "dark"
            ? "bg-background-secondary text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
      >
        <Moon className="h-4 w-4" />
        Tối
      </button>
    </div>
  );
}
