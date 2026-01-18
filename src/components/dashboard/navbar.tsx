"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TimerMini } from "./timer-mini";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-background-secondary/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-6">
        {/* Title */}
        <div>
          {title && (
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="search"
              placeholder="Tìm kiếm... (⌘K)"
              className="pl-9 w-64 h-9 bg-background"
            />
          </div>

          {/* Timer */}
          <TimerMini />

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
