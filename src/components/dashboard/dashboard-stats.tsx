"use client";

import { useMemo, useEffect } from "react";
import {
  Lightbulb,
  FolderKanban,
  ListTodo,
  Clock,
  CheckCircle2,
  TrendingUp,
  Flame,
  Target,
} from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { useIdeaStore } from "@/store/idea-store";
import { useZenStore } from "@/store/zen-store";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon, label, value, subValue, color, bgColor }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", bgColor)}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
        {subValue && (
          <p className="text-xs text-text-muted mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours} giờ`;
  return `${hours}h ${mins}m`;
}

export function DashboardStats() {
  const { user } = useUser();

  const {
    projects,
    tasks,
    isInitialized: projectsInitialized,
    fetchAll: fetchProjects,
  } = useProjectStore();

  const {
    nodes: ideas,
    isInitialized: ideasInitialized,
    fetchAll: fetchIdeas,
  } = useIdeaStore();

  const { workLog, sessionsCompleted } = useZenStore();

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      if (!projectsInitialized) {
        fetchProjects(user.id);
      }
      if (!ideasInitialized) {
        fetchIdeas(user.id);
      }
    }
  }, [user?.id, projectsInitialized, ideasInitialized, fetchProjects, fetchIdeas]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Ideas
    const totalIdeas = ideas.length;

    // Projects
    const activeProjects = projects.filter((p) => p.status === "active").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;

    // Tasks
    const pendingTasks = tasks.filter((t) => !t.completed && t.status !== "in_progress").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
    const completedTasks = tasks.filter((t) => t.completed || t.status === "completed").length;
    const totalTasks = tasks.length;

    // Work time from work log (this week)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekEntries = workLog.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfWeek;
    });

    const weekMinutes = weekEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const weekSessions = weekEntries.filter((e) => e.status === "completed").length;

    // Today's work
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const todayEntries = workLog.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfDay;
    });

    const todayMinutes = todayEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const todaySessions = todayEntries.filter((e) => e.status === "completed").length;

    // Total all time
    const totalMinutes = workLog.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalSessions = workLog.filter((e) => e.status === "completed").length;

    // Calculate streak (consecutive days with work)
    let streak = 0;
    const checkDate = new Date();
    const dailyData: Record<string, number> = {};

    workLog.forEach((entry) => {
      const dateKey = entry.date;
      dailyData[dateKey] = (dailyData[dateKey] || 0) + entry.durationMinutes;
    });

    const today = checkDate.toISOString().split("T")[0];

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dailyData[dateStr] && dailyData[dateStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalIdeas,
      activeProjects,
      completedProjects,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      totalTasks,
      todayMinutes,
      todaySessions,
      weekMinutes,
      weekSessions,
      totalMinutes,
      totalSessions,
      sessionsCompleted,
      streak,
    };
  }, [ideas, projects, tasks, workLog, sessionsCompleted]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Tổng quan</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Ideas */}
        <StatCard
          icon={<Lightbulb className="w-5 h-5" />}
          label="Ý tưởng"
          value={stats.totalIdeas}
          color="text-yellow-400"
          bgColor="bg-yellow-400/10"
        />

        {/* Projects */}
        <StatCard
          icon={<FolderKanban className="w-5 h-5" />}
          label="Dự án đang thực hiện"
          value={stats.activeProjects}
          subValue={stats.completedProjects > 0 ? `${stats.completedProjects} đã hoàn thành` : undefined}
          color="text-purple-400"
          bgColor="bg-purple-400/10"
        />

        {/* Tasks */}
        <StatCard
          icon={<ListTodo className="w-5 h-5" />}
          label="Tasks"
          value={stats.totalTasks}
          subValue={`${stats.completedTasks} hoàn thành, ${stats.inProgressTasks} đang làm`}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />

        {/* Streak */}
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Chuỗi ngày làm việc"
          value={stats.streak}
          subValue="ngày liên tiếp"
          color="text-orange-400"
          bgColor="bg-orange-400/10"
        />
      </div>

      {/* Work time stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Today's work */}
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Hôm nay"
          value={formatMinutes(stats.todayMinutes)}
          subValue={`${stats.todaySessions} phiên làm việc`}
          color="text-cyan-400"
          bgColor="bg-cyan-400/10"
        />

        {/* This week */}
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Tuần này"
          value={formatMinutes(stats.weekMinutes)}
          subValue={`${stats.weekSessions} phiên làm việc`}
          color="text-green-400"
          bgColor="bg-green-400/10"
        />

        {/* Total sessions */}
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Tổng phiên hoàn thành"
          value={stats.totalSessions}
          subValue={formatMinutes(stats.totalMinutes)}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
        />

        {/* Completion rate */}
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Tỷ lệ hoàn thành task"
          value={
            stats.totalTasks > 0
              ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`
              : "0%"
          }
          subValue={`${stats.completedTasks}/${stats.totalTasks} tasks`}
          color="text-pink-400"
          bgColor="bg-pink-400/10"
        />
      </div>
    </div>
  );
}
