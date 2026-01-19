"use client";

import { useEffect } from "react";
import { Settings, HelpCircle } from "lucide-react";
import {
  TimerRing,
  ZenBell,
  FlowStateCard,
  ZenSchedule,
  ZenScheduleIndicator,
  DeepWorkZone,
  GardenSection,
  ProjectSidebar,
  NewProjectModal,
  SessionCompleteOverlay,
  DeepWorkOverlay,
} from "@/components/zen";
import { useZenStore, getCurrentZone } from "@/store/zen-store";

export default function ZenPage() {
  const {
    setCurrentZone,
    activeProjectId,
    projects,
  } = useZenStore();

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Set initial zone on mount
  useEffect(() => {
    const zone = getCurrentZone();
    setCurrentZone(zone);
  }, [setCurrentZone]);

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Zen Dashboard</h1>
              <ZenScheduleIndicator />
            </div>

            <div className="flex items-center gap-2">
              <ZenBell />
              <button className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-6">
              {/* Left sidebar - Projects */}
              <aside className="col-span-12 lg:col-span-3 space-y-6">
                <ProjectSidebar />
              </aside>

              {/* Center - Timer and Tasks */}
              <div className="col-span-12 lg:col-span-6 space-y-6">
                {/* Timer Section */}
                <section className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                  <div className="flex flex-col items-center">
                    {/* Project name */}
                    {activeProject && (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                        style={{ backgroundColor: `${activeProject.color}20` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: activeProject.color }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: activeProject.color }}
                        >
                          {activeProject.name}
                        </span>
                      </div>
                    )}

                    {/* Timer */}
                    <TimerRing size="lg" />

                    {/* Flow state */}
                    <div className="mt-6 w-full max-w-sm">
                      <FlowStateCard />
                    </div>
                  </div>
                </section>

                {/* Tasks Section */}
                <section className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <GardenSection />
                </section>
              </div>

              {/* Right sidebar - Schedule and Stats */}
              <aside className="col-span-12 lg:col-span-3 space-y-6">
                {/* Schedule */}
                <section className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                    Deep Work Zones
                  </h3>
                  <ZenSchedule />
                </section>

                {/* Stats */}
                <section className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <DeepWorkZone />
                </section>
              </aside>
            </div>
          </div>
        </main>

        {/* Floating action hint */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-gray-900/90 border border-gray-700 backdrop-blur-sm">
            <span className="text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">
                Space
              </kbd>{" "}
              Start/Pause
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">
                D
              </kbd>{" "}
              Deep Work
            </span>
            <span className="text-gray-700">|</span>
            <span className="text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-[10px]">
                N
              </kbd>{" "}
              New Task
            </span>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <NewProjectModal />
      <SessionCompleteOverlay />
      <DeepWorkOverlay />

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts />
    </>
  );
}

// Keyboard shortcuts handler
function KeyboardShortcuts() {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    enterDeepWorkMode,
    isDeepWorkMode,
    setShowNewProjectModal,
  } = useZenStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (timerState === "running") {
            pauseTimer();
          } else if (timerState === "paused") {
            resumeTimer();
          } else {
            startTimer();
          }
          break;

        case "KeyD":
          if (!isDeepWorkMode && timerState !== "running") {
            enterDeepWorkMode();
          }
          break;

        case "KeyN":
          if (e.shiftKey) {
            setShowNewProjectModal(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    enterDeepWorkMode,
    isDeepWorkMode,
    setShowNewProjectModal,
  ]);

  return null;
}
