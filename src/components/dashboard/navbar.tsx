"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimerMini } from "./timer-mini";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Navbar({ title, onMenuClick }: NavbarProps) {
  return (
    <header className="h-14 md:h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left side - Menu button for mobile + Title */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {title && (
            <h1 className="text-lg md:text-xl font-semibold text-text-primary truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search - hidden on mobile */}
          <div className="hidden lg:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="search"
              placeholder="Tìm kiếm... (⌘K)"
              className="pl-9 w-64 h-9 bg-background"
            />
          </div>

          {/* Search icon for mobile */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Timer - smaller on mobile */}
          <div className="hidden sm:block">
            <TimerMini />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
}
