"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Rocket,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Demo data
const demoProject = {
  name: "1nguoi Platform",
  description: "Nền tảng hỗ trợ solopreneur Việt Nam",
  progress: 65,
  phase: "Phase 2: Build",
  tasks: [
    { id: 1, title: "Thiết kế Landing Page", completed: true },
    { id: 2, title: "Xây dựng Dashboard", completed: true },
    { id: 3, title: "Tích hợp AI Combat", completed: true },
    { id: 4, title: "Thêm Brainstorm Module", completed: false },
    { id: 5, title: "Hoàn thiện Zen Focus", completed: false },
  ],
};

const demoIdeas = [
  { id: 1, title: "Thêm dark mode toggle", status: "done", votes: 12 },
  { id: 2, title: "Mobile app version", status: "planned", votes: 28 },
  { id: 3, title: "Team collaboration", status: "exploring", votes: 15 },
  { id: 4, title: "API integration", status: "planned", votes: 9 },
];

const demoStats = {
  totalProjects: 3,
  completedTasks: 24,
  hoursTracked: 156,
  ideasGenerated: 47,
};

export default function DemoPage() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Trang chủ
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <span className="font-semibold text-text-primary">Demo Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted px-3 py-1 rounded-full bg-warning/20 text-warning">
              Chế độ Demo
            </span>
            <Button asChild>
              <Link href="/signup">Đăng ký miễn phí</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Demo Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan" />
              <div>
                <p className="font-medium text-text-primary">
                  Đây là bản demo với dữ liệu mẫu
                </p>
                <p className="text-sm text-text-secondary">
                  Đăng ký để tạo workspace của riêng bạn và lưu trữ dữ liệu thật
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-cyan text-cyan hover:bg-cyan/10">
              <Link href="/signup">Bắt đầu miễn phí →</Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Dự án", value: demoStats.totalProjects, icon: Rocket, color: "text-cyan" },
            { label: "Tasks hoàn thành", value: demoStats.completedTasks, icon: CheckCircle2, color: "text-success" },
            { label: "Giờ làm việc", value: demoStats.hoursTracked, icon: Clock, color: "text-purple" },
            { label: "Ý tưởng", value: demoStats.ideasGenerated, icon: Lightbulb, color: "text-warning" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-background-secondary border border-border"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-sm text-text-muted">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Focus Project */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-background-secondary border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-5 h-5 text-cyan" />
                    <span className="text-sm text-cyan font-medium">Focus Project</span>
                  </div>
                  <h2 className="text-xl font-bold text-text-primary">{demoProject.name}</h2>
                  <p className="text-text-secondary">{demoProject.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple/20 text-purple text-sm">
                  {demoProject.phase}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-muted">Tiến độ</span>
                  <span className="text-sm font-medium text-text-primary">{demoProject.progress}%</span>
                </div>
                <Progress value={demoProject.progress} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary mb-3">Tasks</p>
                {demoProject.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-text-muted" />
                    )}
                    <span className={cn(
                      "text-sm",
                      task.completed ? "text-text-muted line-through" : "text-text-primary"
                    )}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ideas Board */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-background-secondary border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-text-primary">Idea Board</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {demoIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-3 rounded-lg bg-background-tertiary border border-border hover:border-border-hover transition-colors"
                  >
                    <p className="font-medium text-text-primary text-sm mb-2">{idea.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        idea.status === "done" && "bg-success/20 text-success",
                        idea.status === "planned" && "bg-cyan/20 text-cyan",
                        idea.status === "exploring" && "bg-warning/20 text-warning"
                      )}>
                        {idea.status === "done" ? "Hoàn thành" : idea.status === "planned" ? "Kế hoạch" : "Đang xem xét"}
                      </span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {idea.votes}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <Link href="/combatfree" className="block">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 hover:border-green-500/50 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-500 mb-2" />
                  <h4 className="font-medium text-text-primary">Combat Free</h4>
                  <p className="text-xs text-text-muted">Chat với 4 AI miễn phí</p>
                </div>
              </Link>
              <Link href="/brainstorm" className="block">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 hover:border-purple-500/50 transition-colors">
                  <Lightbulb className="w-6 h-6 text-purple-500 mb-2" />
                  <h4 className="font-medium text-text-primary">Brainstorm</h4>
                  <p className="text-xs text-text-muted">Phát triển ý tưởng</p>
                </div>
              </Link>
              <Link href="/zen" className="block">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                  <Target className="w-6 h-6 text-cyan-500 mb-2" />
                  <h4 className="font-medium text-text-primary">Zen Focus</h4>
                  <p className="text-xs text-text-muted">Tập trung làm việc</p>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pomodoro Timer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-background-secondary border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan" />
                <h3 className="font-semibold text-text-primary">Pomodoro Timer</h3>
              </div>
              <div className="text-center">
                <div className="text-5xl font-mono font-bold text-text-primary mb-4">
                  {formatTime(timerSeconds)}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="w-12 h-12 rounded-full"
                  >
                    {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTimerSeconds(25 * 60)}
                    className="w-10 h-10 rounded-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-text-muted mt-3">
                  {timerRunning ? "Đang tập trung..." : "Nhấn play để bắt đầu"}
                </p>
              </div>
            </motion.div>

            {/* Today's Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl bg-background-secondary border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple" />
                <h3 className="font-semibold text-text-primary">Hôm nay</h3>
              </div>
              <div className="space-y-3">
                {[
                  { time: "09:00", task: "Review code", done: true },
                  { time: "10:30", task: "Team sync", done: true },
                  { time: "14:00", task: "Build feature X", done: false },
                  { time: "16:00", task: "Testing", done: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-text-muted w-12">{item.time}</span>
                    <div className={cn(
                      "flex-1 p-2 rounded-lg text-sm",
                      item.done ? "bg-success/10 text-success" : "bg-background-tertiary text-text-primary"
                    )}>
                      {item.task}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30"
            >
              <h3 className="font-semibold text-text-primary mb-2">Thích những gì bạn thấy?</h3>
              <p className="text-sm text-text-secondary mb-4">
                Đăng ký miễn phí để tạo workspace của riêng bạn
              </p>
              <Button asChild className="w-full">
                <Link href="/signup">Bắt đầu ngay</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
