"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/navbar";
import { DeepModeMini } from "@/components/zen";
import { useTimerStore } from "@/store/timer-store";
import { useZenStore } from "@/store/zen-store";
import { usePathname } from "next/navigation";
import { UserProvider } from "@/contexts/user-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRunning, isPaused, tick } = useTimerStore();
  const { timerState, tickTimer, toggleMiniTimer } = useZenStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Timer tick effect (old timer store)
  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, tick]);

  // Zen timer tick effect
  useEffect(() => {
    if (timerState === "running") {
      const interval = setInterval(tickTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState, tickTimer]);

  // Global keyboard shortcut for Mini Timer (M key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "KeyM") {
        toggleMiniTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleMiniTimer]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleMobileClose = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsMobileSidebarOpen(true);
  }, []);

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/ideas") return "Idea Graph";
    if (pathname === "/projects") return "Quản lý Dự án";
    if (pathname === "/settings") return "Cài đặt";
    return "";
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileClose}
        />
        {/* Main content - responsive margin */}
        <main className="md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
          <Navbar title={getPageTitle()} onMenuClick={handleMenuClick} />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Global Mini Timer - floating on all pages */}
        <DeepModeMini />
      </div>
    </UserProvider>
  );
}
