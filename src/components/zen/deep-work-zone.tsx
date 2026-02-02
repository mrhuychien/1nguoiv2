"use client";

import { useState, useMemo } from "react";
import { Target, Zap, TrendingUp, Clock, ListTodo } from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";
import { TaskList } from "./task-list";
import { ProjectTasksPanel } from "./project-tasks-panel";

interface DeepWorkZoneProps {
  className?: string;
}

// Helper functions to calculate real stats
function getStartOfWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start of week
  now.setDate(now.getDate() - diff);
  now.setHours(0, 0, 0, 0);
  return now;
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function DeepWorkZone({ className }: DeepWorkZoneProps) {
  const {
    isDeepWorkMode,
    enterDeepWorkMode,
    timerState,
    activeProjectId,
    sessionsCompleted,
    workLog,
  } = useZenStore();

  const {
    projects,
    tasks,
    getCurrentTemplateTask,
  } = useProjectStore();

  const [showTasksPanel, setShowTasksPanel] = useState(false);

  // Get active project from project-store
  const activeProject = projects.find((p) => p.id === activeProjectId && p.status === "active");
  const hasTemplate =
    activeProject?.template_id && activeProject.template_id !== "blank";
  const currentTask = activeProject
    ? getCurrentTemplateTask(activeProject.id)
    : null;

  // Calculate real stats from workLog (accurate per-session tracking)
  const stats = useMemo(() => {
    const startOfWeek = getStartOfWeek();
    const todayStr = getDateString(new Date());

    // Calculate minutes from workLog entries (accurate tracking)
    let todayMinutes = 0;
    let weekMinutes = 0;
    let tasksCompletedThisWeek = 0;
    const daysWithWork = new Set<string>();

    workLog.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);

      // Today's minutes
      if (entry.date === todayStr) {
        todayMinutes += entry.durationMinutes;
      }

      // This week's minutes
      if (entryDate >= startOfWeek) {
        weekMinutes += entry.durationMinutes;
        daysWithWork.add(entry.date);

        // Count completed tasks this week
        if (entry.status === "completed") {
          tasksCompletedThisWeek++;
        }
      }
    });

    // Also count completed tasks from database for this week (in case workLog is empty)
    if (tasksCompletedThisWeek === 0) {
      tasks.forEach((task) => {
        const completedAt = task.completed_at ? new Date(task.completed_at) : null;
        if (task.completed && completedAt && completedAt >= startOfWeek) {
          tasksCompletedThisWeek++;
        }
      });
    }

    // Calculate streak based on consecutive days with work entries
    // Count how many days this week had work
    const streak = daysWithWork.size > 0 ? daysWithWork.size : Math.min(Math.floor(sessionsCompleted / 2), 7);

    return {
      todayMinutes,
      weekMinutes,
      streak,
      flowSessions: sessionsCompleted,
      tasksCompleted: tasksCompletedThisWeek,
      projectsActive: projects.filter((p) => p.status === "active").length,
    };
  }, [workLog, tasks, projects, sessionsCompleted]);

  // Calculate daily goal progress (8 hours = 480 minutes)
  const dailyGoalMinutes = 480;
  const dailyProgress = Math.min(
    (stats.todayMinutes / dailyGoalMinutes) * 100,
    100
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Deep Work
        </h3>
        <button
          onClick={enterDeepWorkMode}
          disabled={isDeepWorkMode || timerState === "running"}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
            isDeepWorkMode
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : timerState === "running"
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-400 hover:to-purple-400"
          )}
        >
          {isDeepWorkMode ? "In Deep Work" : "Enter Focus Mode"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Focus */}
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Hôm nay</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(stats.todayMinutes / 60)}h {stats.todayMinutes % 60}m
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Mục tiêu: 8h</span>
              <span>{Math.round(dailyProgress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.streak} days
          </div>
          <div className="mt-2 flex gap-0.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-1.5 rounded-full",
                  i < stats.streak % 7
                    ? "bg-amber-400"
                    : "bg-gray-800"
                )}
              />
            ))}
          </div>
        </div>

        {/* Flow Sessions */}
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Flow Sessions</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.flowSessions}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tuần này
          </p>
        </div>

        {/* Week Progress */}
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Tuần này</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(stats.weekMinutes / 60)}h
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.tasksCompleted} tasks hoàn thành
          </p>
        </div>
      </div>

      {/* Active Project */}
      {activeProject && (
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${activeProject.color}20` }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeProject.color || "#00d4ff" }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white">{activeProject.title}</h4>
              <p className="text-xs text-gray-400">
                {hasTemplate ? (
                  <>
                    Phase {activeProject.current_phase || 1} •{" "}
                    {activeProject.completed_tasks || 0}/
                    {activeProject.total_tasks || 0} tasks
                  </>
                ) : (
                  <>
                    {Math.floor((activeProject.completed_minutes || 0) / 60)}h /{" "}
                    {Math.floor((activeProject.total_minutes || 0) / 60)}h
                  </>
                )}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-cyan-400">
                {hasTemplate && activeProject.total_tasks
                  ? Math.round(
                      ((activeProject.completed_tasks || 0) /
                        activeProject.total_tasks) *
                        100
                    )
                  : (activeProject.total_minutes || 0) > 0
                  ? Math.round(
                      ((activeProject.completed_minutes || 0) /
                        (activeProject.total_minutes || 1)) *
                        100
                    )
                  : 0}
                %
              </span>
              {hasTemplate && (
                <button
                  onClick={() => setShowTasksPanel(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <ListTodo className="w-3 h-3" />
                  Tasks
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  hasTemplate && activeProject.total_tasks
                    ? ((activeProject.completed_tasks || 0) /
                        activeProject.total_tasks) *
                      100
                    : (activeProject.total_minutes || 0) > 0
                    ? ((activeProject.completed_minutes || 0) /
                        (activeProject.total_minutes || 1)) *
                      100
                    : 0
                }%`,
                backgroundColor: activeProject.color || "#00d4ff",
              }}
            />
          </div>

          {/* Current Task (for template projects) */}
          {hasTemplate && currentTask && (
            <div className="mt-3 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentTask.emoji}</span>
                <span className="text-xs text-white flex-1 truncate">
                  {currentTask.title}
                </span>
                <span className="text-[10px] text-cyan-400">
                  {currentTask.status === "in_progress"
                    ? "Đang làm"
                    : "Tiếp theo"}
                </span>
              </div>
            </div>
          )}

          {/* Compact Task List (for template projects) */}
          {hasTemplate && (
            <div className="mt-3">
              <TaskList projectId={activeProject.id} compact />
            </div>
          )}
        </div>
      )}

      {/* Tasks Panel */}
      {showTasksPanel && (
        <ProjectTasksPanel onClose={() => setShowTasksPanel(false)} />
      )}
    </div>
  );
}
