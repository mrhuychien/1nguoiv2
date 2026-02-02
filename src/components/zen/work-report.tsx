"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { useZenStore } from "@/store/zen-store";
import { cn } from "@/lib/utils";

type Period = "day" | "week" | "month" | "year";

interface WorkReportProps {
  className?: string;
}

// Helper functions
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function getEndOfPeriod(date: Date, period: Period): Date {
  const d = new Date(date);
  switch (period) {
    case "day":
      d.setHours(23, 59, 59, 999);
      return d;
    case "week":
      const startOfWeek = getStartOfWeek(d);
      startOfWeek.setDate(startOfWeek.getDate() + 6);
      startOfWeek.setHours(23, 59, 59, 999);
      return startOfWeek;
    case "month":
      return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    case "year":
      return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  }
}

function formatPeriodLabel(date: Date, period: Period): string {
  const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Ho_Chi_Minh" };

  switch (period) {
    case "day":
      return date.toLocaleDateString("vi-VN", { ...options, weekday: "long", day: "numeric", month: "long" });
    case "week": {
      const endOfWeek = new Date(date);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${date.toLocaleDateString("vi-VN", { ...options, day: "numeric", month: "short" })} - ${endOfWeek.toLocaleDateString("vi-VN", { ...options, day: "numeric", month: "short" })}`;
    }
    case "month":
      return date.toLocaleDateString("vi-VN", { ...options, month: "long", year: "numeric" });
    case "year":
      return `Năm ${date.getFullYear()}`;
  }
}

function navigatePeriod(date: Date, period: Period, direction: number): Date {
  const d = new Date(date);
  switch (period) {
    case "day":
      d.setDate(d.getDate() + direction);
      break;
    case "week":
      d.setDate(d.getDate() + direction * 7);
      break;
    case "month":
      d.setMonth(d.getMonth() + direction);
      break;
    case "year":
      d.setFullYear(d.getFullYear() + direction);
      break;
  }
  return d;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} giờ`;
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function WorkReport({ className }: WorkReportProps) {
  const { workLog } = useZenStore();
  const [period, setPeriod] = useState<Period>("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate period start based on current date and period type
  const periodStart = useMemo(() => {
    switch (period) {
      case "day":
        return getStartOfDay(currentDate);
      case "week":
        return getStartOfWeek(currentDate);
      case "month":
        return getStartOfMonth(currentDate);
      case "year":
        return getStartOfYear(currentDate);
    }
  }, [currentDate, period]);

  const periodEnd = useMemo(() => getEndOfPeriod(periodStart, period), [periodStart, period]);

  // Filter work log entries for current period
  const periodEntries = useMemo(() => {
    return workLog.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= periodStart && entryDate <= periodEnd;
    });
  }, [workLog, periodStart, periodEnd]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMinutes = periodEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const completedSessions = periodEntries.filter((e) => e.status === "completed").length;
    const uniqueProjects = new Set(periodEntries.filter((e) => e.projectId).map((e) => e.projectId));
    const uniqueTasks = new Set(periodEntries.map((e) => e.taskId));

    // Daily breakdown for charts
    const dailyData: Record<string, number> = {};
    periodEntries.forEach((entry) => {
      const dateKey = entry.date;
      dailyData[dateKey] = (dailyData[dateKey] || 0) + entry.durationMinutes;
    });

    // Find best day
    let bestDay = "";
    let bestDayMinutes = 0;
    Object.entries(dailyData).forEach(([date, minutes]) => {
      if (minutes > bestDayMinutes) {
        bestDay = date;
        bestDayMinutes = minutes;
      }
    });

    // Calculate streak (consecutive days with work)
    const today = getDateString(new Date());
    let streak = 0;
    const checkDate = new Date();

    while (true) {
      const dateStr = getDateString(checkDate);
      if (dailyData[dateStr] && dailyData[dateStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        // Today might not have work yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalMinutes,
      completedSessions,
      uniqueProjects: uniqueProjects.size,
      uniqueTasks: uniqueTasks.size,
      dailyData,
      bestDay,
      bestDayMinutes,
      streak,
      avgMinutesPerDay: Object.keys(dailyData).length > 0
        ? Math.round(totalMinutes / Object.keys(dailyData).length)
        : 0,
    };
  }, [periodEntries]);

  // Generate chart data
  const chartData = useMemo(() => {
    const data: { label: string; value: number; date: string }[] = [];

    if (period === "day") {
      // Hourly breakdown for day view
      for (let hour = 0; hour < 24; hour++) {
        const hourEntries = periodEntries.filter((e) => {
          const entryHour = new Date(e.timestamp).getHours();
          return entryHour === hour;
        });
        const minutes = hourEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
        data.push({
          label: `${hour}:00`,
          value: minutes,
          date: `${hour}:00`,
        });
      }
    } else if (period === "week") {
      // Daily breakdown for week
      const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(periodStart);
        d.setDate(d.getDate() + i);
        const dateStr = getDateString(d);
        data.push({
          label: days[i],
          value: stats.dailyData[dateStr] || 0,
          date: dateStr,
        });
      }
    } else if (period === "month") {
      // Daily breakdown for month
      const daysInMonth = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(periodStart.getFullYear(), periodStart.getMonth(), i);
        const dateStr = getDateString(d);
        data.push({
          label: `${i}`,
          value: stats.dailyData[dateStr] || 0,
          date: dateStr,
        });
      }
    } else {
      // Monthly breakdown for year
      const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(periodStart.getFullYear(), i, 1);
        const monthEnd = new Date(periodStart.getFullYear(), i + 1, 0);
        const monthEntries = workLog.filter((e) => {
          const entryDate = new Date(e.timestamp);
          return entryDate >= monthStart && entryDate <= monthEnd;
        });
        const minutes = monthEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
        data.push({
          label: months[i],
          value: minutes,
          date: `${periodStart.getFullYear()}-${String(i + 1).padStart(2, "0")}`,
        });
      }
    }

    return data;
  }, [period, periodStart, periodEntries, stats.dailyData, workLog]);

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  const handleNavigate = (direction: number) => {
    setCurrentDate(navigatePeriod(periodStart, period, direction));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Báo cáo làm việc
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Thống kê chi tiết hoạt động của bạn
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded-lg">
          {(["day", "week", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                period === p
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {p === "day" ? "Ngày" : p === "week" ? "Tuần" : p === "month" ? "Tháng" : "Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => handleNavigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">
            {formatPeriodLabel(periodStart, period)}
          </h3>
          <button
            onClick={handleToday}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Hôm nay
          </button>
        </div>

        <button
          onClick={() => handleNavigate(1)}
          className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Tổng thời gian"
          value={formatDuration(stats.totalMinutes)}
          color="cyan"
        />
        <StatCard
          icon={Target}
          label="Phiên hoàn thành"
          value={`${stats.completedSessions}`}
          color="green"
        />
        <StatCard
          icon={Flame}
          label="Streak"
          value={`${stats.streak} ngày`}
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          label="Trung bình/ngày"
          value={formatDuration(stats.avgMinutesPerDay)}
          color="purple"
        />
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Biểu đồ thời gian làm việc
        </h4>

        <div className="h-48 flex items-end gap-1">
          {chartData.map((item, index) => {
            const height = maxChartValue > 0 ? (item.value / maxChartValue) * 100 : 0;
            const isToday = item.date === getDateString(new Date());

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end h-36">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t transition-all duration-300",
                      isToday ? "bg-cyan-500" : "bg-purple-500/70",
                      item.value > 0 && "hover:opacity-80"
                    )}
                    style={{ height: `${Math.max(height, item.value > 0 ? 4 : 0)}%` }}
                    title={`${item.label}: ${formatDuration(item.value)}`}
                  />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[10px] transition-colors",
                  isToday ? "text-cyan-400 font-medium" : "text-gray-500",
                  period === "month" && index % 5 !== 0 && "opacity-0"
                )}>
                  {item.label}
                </span>

                {/* Tooltip on hover */}
                {item.value > 0 && (
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatDuration(item.value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Best Day */}
        {stats.bestDay && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Ngày làm việc tốt nhất</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(stats.bestDay).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <p className="text-xs text-green-400">{formatDuration(stats.bestDayMinutes)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects & Tasks */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <FolderOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Dự án & Tasks</p>
              <p className="text-sm font-semibold text-white">
                {stats.uniqueProjects} dự án • {stats.uniqueTasks} tasks
              </p>
              <p className="text-xs text-purple-400">
                {stats.completedSessions} phiên Pomodoro
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {periodEntries.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Hoạt động gần đây
          </h4>

          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {periodEntries.slice(0, 10).map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {entry.taskEmoji && <span className="text-sm">{entry.taskEmoji}</span>}
                  <span className="text-sm text-white truncate">{entry.taskTitle}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-cyan-400">+{entry.durationMinutes}m</span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {periodEntries.length === 0 && (
        <div className="p-8 rounded-xl bg-gray-900/30 border border-dashed border-gray-700 text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Chưa có dữ liệu trong khoảng thời gian này</p>
          <p className="text-sm text-gray-500 mt-1">
            Hoàn thành các phiên Pomodoro để xem báo cáo
          </p>
        </div>
      )}
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "cyan" | "green" | "orange" | "purple";
}) {
  const colorClasses = {
    cyan: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400",
    green: "from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-400",
    orange: "from-orange-500/10 to-amber-500/10 border-orange-500/20 text-orange-400",
    purple: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400",
  };

  const iconBg = {
    cyan: "bg-cyan-500/20",
    green: "bg-green-500/20",
    orange: "bg-orange-500/20",
    purple: "bg-purple-500/20",
  };

  return (
    <div className={cn(
      "p-4 rounded-xl bg-gradient-to-br border",
      colorClasses[color]
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", iconBg[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
