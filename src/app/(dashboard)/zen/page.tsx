"use client";

import { useEffect, useState } from "react";
import { Settings, HelpCircle, Loader2, Target, X, CheckCircle2, RotateCcw } from "lucide-react";
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
  WorkLogPanel,
} from "@/components/zen";
import { useZenStore, getCurrentZone } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

export default function ZenPage() {
  const { user } = useUser();

  // Get projects and task operations from unified project-store (Supabase)
  const {
    projects,
    tasks: allTasks,
    isInitialized: projectsInitialized,
    isLoading: projectsLoading,
    fetchAll,
    completeTemplateTask: completeTemplateTaskInDb,
    startTemplateTask: startTemplateTaskInDb,
    addTemplateTaskTime: addTemplateTaskTimeInDb,
    updateTaskInDb,
    getTemplateTasks,
  } = useProjectStore();

  // Keep UI and timer state in zen-store
  const {
    setCurrentZone,
    activeProjectId,
    isInitialized: zenInitialized,
    timerState,
    showTaskCompleteDialog,
    setShowTaskCompleteDialog,
    currentTimerTaskId,
    currentTimerTaskType,
    setTimerTask,
    clearTimerTask,
    timerTargetMinutes,
    currentZone,
    addWorkLogEntry,
  } = useZenStore();

  const isInitialized = projectsInitialized || zenInitialized;
  const isLoading = projectsLoading;

  // Load data from Supabase on mount
  useEffect(() => {
    if (user?.id && !projectsInitialized) {
      fetchAll(user.id);
    }
  }, [user?.id, projectsInitialized, fetchAll]);

  const [isDragOver, setIsDragOver] = useState(false);

  // Find active project from unified store
  const activeProject = projects.find((p) => p.id === activeProjectId && p.status === "active");

  // Get current timer task from project-store (unified)
  const currentTask = currentTimerTaskId
    ? (() => {
        const task = allTasks.find((t) => t.id === currentTimerTaskId);
        if (task) {
          return { id: task.id, title: task.title, emoji: task.emoji || undefined };
        }
        return null;
      })()
    : null;

  // Show task complete dialog when timer completes
  useEffect(() => {
    if (timerState === "completed" && currentTimerTaskId) {
      setShowTaskCompleteDialog(true);
      // Add time to the task
      if (currentTimerTaskType === "template") {
        addTemplateTaskTimeInDb(currentTimerTaskId, timerTargetMinutes);
      }
    }
  }, [timerState, currentTimerTaskId, currentTimerTaskType, timerTargetMinutes, addTemplateTaskTimeInDb, setShowTaskCompleteDialog]);

  // Handle drag events for timer drop zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.taskId && data.taskType) {
        setTimerTask(data.taskId, data.taskType);
        // If template task, also start it
        if (data.taskType === "template") {
          startTemplateTaskInDb(data.taskId);
        }
      }
    } catch {
      // Invalid data
    }
  };

  // Log work entry helper
  const logWorkEntry = (status: "completed" | "in_progress" | "paused") => {
    if (!currentTask) return;

    addWorkLogEntry({
      taskId: currentTask.id,
      taskTitle: currentTask.title,
      taskEmoji: currentTask.emoji,
      projectId: activeProject?.id,
      projectName: activeProject?.title,
      projectColor: activeProject?.color || undefined,
      durationMinutes: timerTargetMinutes,
      status,
      zone: currentZone || undefined,
    });
  };

  // Handle task completion
  const handleCompleteTask = () => {
    if (!currentTimerTaskId || !currentTimerTaskType) return;

    // Log work entry
    logWorkEntry("completed");

    if (currentTimerTaskType === "template") {
      completeTemplateTaskInDb(currentTimerTaskId);
    } else {
      // For manual tasks, update status to completed
      updateTaskInDb(currentTimerTaskId, {
        status: "completed",
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    clearTimerTask();
    setShowTaskCompleteDialog(false);
  };

  // Handle continue working
  const handleContinueTask = () => {
    // Log work entry as in_progress
    logWorkEntry("in_progress");

    setShowTaskCompleteDialog(false);
    // Timer will be reset, user can start another session
  };

  // Get next task after current one (for template tasks)
  const getNextTask = () => {
    if (!currentTimerTaskId || currentTimerTaskType !== "template" || !activeProjectId) return null;

    const templateTasks = getTemplateTasks(activeProjectId);
    const currentIndex = templateTasks.findIndex(t => t.id === currentTimerTaskId);

    // Find next pending task
    for (let i = currentIndex + 1; i < templateTasks.length; i++) {
      if (templateTasks[i].status === "pending") {
        return {
          id: templateTasks[i].id,
          title: templateTasks[i].title,
          emoji: templateTasks[i].emoji || undefined,
        };
      }
    }
    return null;
  };

  const nextTask = getNextTask();

  // Handle next phase - complete current task and move to next
  const handleNextPhase = () => {
    if (!currentTimerTaskId || !currentTimerTaskType) return;

    // Log work entry
    logWorkEntry("completed");

    // Complete current task
    if (currentTimerTaskType === "template") {
      completeTemplateTaskInDb(currentTimerTaskId);
    } else {
      updateTaskInDb(currentTimerTaskId, {
        status: "completed",
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }

    // Start next task if available
    if (nextTask) {
      setTimerTask(nextTask.id, "template");
      startTemplateTaskInDb(nextTask.id);
    } else {
      clearTimerTask();
    }

    setShowTaskCompleteDialog(false);
  };

  // Clear current task
  const handleClearTask = () => {
    clearTimerTask();
  };

  // Set initial zone on mount
  useEffect(() => {
    const zone = getCurrentZone();
    setCurrentZone(zone);
  }, [setCurrentZone]);

  // Show loading state while fetching data
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan" />
          <p className="text-gray-400">Đang tải dữ liệu Zen...</p>
        </div>
      </div>
    );
  }

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
                {/* Timer Section - Drop Zone */}
                <section
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border-2 transition-all duration-300",
                    isDragOver
                      ? "border-cyan-500 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                      : "border-gray-700"
                  )}
                >
                  <div className="flex flex-col items-center">
                    {/* Project name */}
                    {activeProject && (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
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
                          {activeProject.title}
                        </span>
                      </div>
                    )}

                    {/* Current Task Indicator */}
                    {currentTask ? (
                      <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 animate-zen-fade">
                        <Target className="w-4 h-4 text-cyan-400" />
                        {currentTask.emoji && (
                          <span className="text-sm">{currentTask.emoji}</span>
                        )}
                        <span className="text-sm font-medium text-white">
                          {currentTask.title}
                        </span>
                        {timerState === "idle" && (
                          <button
                            onClick={handleClearTask}
                            className="ml-2 p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border border-dashed transition-colors",
                        isDragOver
                          ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                          : "border-gray-600 text-gray-500"
                      )}>
                        <Target className="w-4 h-4" />
                        <span className="text-sm">
                          {isDragOver ? "Thả task vào đây!" : "Kéo task vào đây để tính giờ"}
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

                {/* Work Log Section */}
                <section className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                  <WorkLogPanel />
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

      {/* Task Complete Dialog */}
      {showTaskCompleteDialog && currentTask && (
        <TaskCompleteDialog
          task={currentTask}
          nextTask={nextTask}
          timeSpent={timerTargetMinutes}
          onComplete={handleCompleteTask}
          onContinue={handleContinueTask}
          onNextPhase={handleNextPhase}
        />
      )}

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

// Task Complete Dialog
interface TaskCompleteDialogProps {
  task: { id: string; title: string; emoji?: string };
  nextTask: { id: string; title: string; emoji?: string } | null;
  timeSpent: number;
  onComplete: () => void;
  onContinue: () => void;
  onNextPhase: () => void;
}

function TaskCompleteDialog({ task, nextTask, timeSpent, onComplete, onContinue, onNextPhase }: TaskCompleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md p-6 mx-4 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl animate-scale-in">
        {/* Celebration icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center animate-breathe">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Hết giờ! 🎉
        </h2>

        {/* Current task */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {task.emoji && <span className="text-lg">{task.emoji}</span>}
          <span className="text-gray-300 text-center">{task.title}</span>
        </div>

        {/* Time spent */}
        <p className="text-center text-cyan-400 text-sm mb-4">
          +{timeSpent} phút
        </p>

        {/* Question */}
        <p className="text-center text-gray-400 mb-4">
          Bạn đã hoàn thành task này chưa?
        </p>

        {/* Next task preview */}
        {nextTask && (
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 mb-4">
            <p className="text-xs text-gray-500 mb-1">Task tiếp theo:</p>
            <div className="flex items-center gap-2">
              {nextTask.emoji && <span className="text-sm">{nextTask.emoji}</span>}
              <span className="text-sm text-gray-300">{nextTask.title}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {/* Primary actions */}
          <div className="flex gap-2">
            <button
              onClick={onContinue}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Làm tiếp
            </button>
            <button
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium hover:from-green-400 hover:to-emerald-400 transition-colors text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>

          {/* Next phase button - only show if there's a next task */}
          {nextTask && (
            <button
              onClick={onNextPhase}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:from-cyan-400 hover:to-purple-400 transition-colors text-sm"
            >
              Done & Tiếp tục Phase mới →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
