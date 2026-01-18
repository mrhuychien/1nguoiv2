"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useTimerStore } from "@/store/timer-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRunning, isPaused, tick } = useTimerStore();

  // Timer tick effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, tick]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
