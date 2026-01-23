"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Lightbulb,
  FolderKanban,
  Sparkles,
  Brain,
  Swords,
  ChevronLeft,
  ChevronRight,
  Target,
  ArrowRight,
  CheckCircle,
  Star,
  Plus,
  MoreHorizontal,
  AlertTriangle,
  Calendar,
  Menu,
  X,
  LogOut,
  Play,
  Pause,
  RotateCcw,
  Hammer,
  Rocket,
  FlaskConical,
  Ruler,
  Send,
  Network,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Demo nav items
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "zen", label: "Zen Focus", icon: Sparkles },
  { id: "ideas", label: "Idea Graph", icon: Lightbulb },
  { id: "brainstorm", label: "Brainstorm", icon: Brain },
  { id: "combat", label: "Combat Pro", icon: Swords },
  { id: "projects", label: "Projects", icon: FolderKanban },
];

// Demo data
const demoFocusProject = {
  id: "demo-1",
  title: "1nguoi Platform",
  description: "Nền tảng hỗ trợ solopreneur Việt Nam",
  progress: 65,
  health: "on-track" as const,
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
};

const demoTasks = [
  { id: "t1", title: "Thiết kế Landing Page", completed: true, project: "1nguoi Platform" },
  { id: "t2", title: "Xây dựng Dashboard", completed: true, project: "1nguoi Platform" },
  { id: "t3", title: "Tích hợp AI Combat", completed: false, project: "1nguoi Platform" },
];

const demoProjects = [
  { id: "p1", title: "1nguoi Platform", progress: 65, lifecycle: "building" as const, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), currentTask: "Tích hợp AI Combat", lastTask: "Xây dựng Dashboard" },
  { id: "p2", title: "Mobile App", progress: 25, lifecycle: "designing" as const, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), currentTask: "Wireframe UX", lastTask: null },
  { id: "p3", title: "Marketing Campaign", progress: 80, lifecycle: "testing" as const, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), currentTask: "A/B Testing", lastTask: "Viết content" },
];

const demoIdeas = [
  { id: "i1", title: "App học tiếng Anh", description: "Ứng dụng học tiếng Anh với AI", x: 100, y: 100 },
  { id: "i2", title: "Duolingo Clone", description: "Gamification cho học ngoại ngữ", x: 300, y: 150, parent: "i1" },
  { id: "i3", title: "Voice Recognition", description: "Nhận dạng giọng nói", x: 200, y: 280, parent: "i1" },
  { id: "i4", title: "AI Chatbot", description: "Chat với AI native speaker", x: 400, y: 280, parent: "i1" },
];

const demoBrainstormSession = {
  topic: "Ứng dụng học tiếng Anh với AI",
  agents: [
    { id: "visionary", name: "Visionary", emoji: "🔮", color: "from-purple-500 to-pink-500", response: "Tôi thấy một ứng dụng kết hợp AI để tạo conversation partner thực tế. Người dùng có thể luyện speaking với AI..." },
    { id: "analyst", name: "Analyst", emoji: "📊", color: "from-blue-500 to-cyan-500", response: "Thị trường EdTech Việt Nam đang tăng trưởng 20%/năm. Duolingo có 500M users. Cơ hội ở phân khúc premium..." },
    { id: "critic", name: "Critic", emoji: "🔍", color: "from-red-500 to-orange-500", response: "Cần giải quyết: 1) Chi phí API AI cao, 2) Độ chính xác nhận dạng giọng Việt, 3) Cạnh tranh với Elsa, Duolingo..." },
    { id: "innovator", name: "Innovator", emoji: "💡", color: "from-yellow-500 to-amber-500", response: "Unique selling point: Kết hợp cultural context Việt Nam. Học tiếng Anh qua ngữ cảnh thực tế người Việt..." },
  ],
};

const demoCombatMessages = [
  { id: "m1", role: "user" as const, content: "Tôi muốn tạo app học tiếng Anh, có nên dùng AI không?" },
  { id: "m2", role: "assistant" as const, agent: "spark", content: "Tuyệt vời! AI có thể personalize bài học, tạo conversation practice với native speaker ảo, và điều chỉnh độ khó theo trình độ người dùng. Bạn nên tập trung vào speaking practice - đây là điểm yếu của các app hiện tại." },
  { id: "m3", role: "assistant" as const, agent: "devil", content: "Nhưng chi phí API AI không hề rẻ đâu. Với 10K users active, bạn có thể tốn $5-10K/tháng cho API costs. Và Duolingo, Elsa đã có hàng triệu users - điểm khác biệt của bạn là gì?" },
  { id: "m4", role: "assistant" as const, agent: "lens", content: "Phân tích thị trường: EdTech Việt Nam ~$2B năm 2024, CAGR 15%. Phân khúc học tiếng Anh chiếm 40%. Người Việt chi trung bình 200-500K/tháng cho học ngoại ngữ. Cơ hội ở phân khúc B2B (doanh nghiệp) đang bỏ ngỏ." },
];

const combatAgents = {
  spark: { name: "Spark", emoji: "⚡", color: "from-yellow-500 to-amber-500", role: "Ideator" },
  lens: { name: "Lens", emoji: "🔍", color: "from-cyan-500 to-blue-500", role: "Analyst" },
  radar: { name: "Radar", emoji: "📡", color: "from-green-500 to-emerald-500", role: "Researcher" },
  devil: { name: "Devil", emoji: "😈", color: "from-red-500 to-orange-500", role: "Challenger" },
};

const lifecycleConfig = {
  idea: { label: "IDEA", icon: Lightbulb, emoji: "💡", color: "text-yellow-500", bg: "bg-yellow-500/10", progress: "bg-yellow-500" },
  designing: { label: "DESIGNING", icon: Ruler, emoji: "📐", color: "text-blue-500", bg: "bg-blue-500/10", progress: "bg-blue-500" },
  building: { label: "BUILDING", icon: Hammer, emoji: "🏗️", color: "text-orange-500", bg: "bg-orange-500/10", progress: "bg-orange-500" },
  testing: { label: "TESTING", icon: FlaskConical, emoji: "🧪", color: "text-purple-500", bg: "bg-purple-500/10", progress: "bg-purple-500" },
  shipped: { label: "SHIPPED", icon: Rocket, emoji: "🚀", color: "text-green-500", bg: "bg-green-500/10", progress: "bg-green-500" },
};

const healthConfig = {
  "on-track": { label: "Đúng tiến độ", variant: "success" as const, icon: CheckCircle },
  "at-risk": { label: "Có rủi ro", variant: "warning" as const, icon: AlertTriangle },
  blocked: { label: "Bị chặn", variant: "danger" as const, icon: AlertTriangle },
};

// Demo Sidebar Component
function DemoSidebar({
  isMobileOpen,
  onMobileClose,
  activeTab,
  onTabChange
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-background-secondary border-r border-border flex flex-col transition-all duration-300",
          "hidden md:flex",
          isCollapsed ? "md:w-16" : "md:w-64",
          isMobileOpen && "flex w-72 md:w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4",
          isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-semibold text-lg text-text-primary">
                1nguoi <span className="text-xs text-warning">(Demo)</span>
              </span>
            )}
          </Link>

          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-md hover:bg-background-tertiary text-text-muted hover:text-text-secondary transition-colors md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {!isCollapsed && !isMobileOpen && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-md hover:bg-background-tertiary text-text-muted hover:text-text-secondary transition-colors hidden md:block"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isCollapsed && !isMobileOpen && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-2 rounded-lg hover:bg-background-tertiary text-text-muted hover:text-text-secondary transition-colors flex items-center justify-center mb-2 hidden md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            const linkContent = (
              <button
                onClick={() => {
                  onTabChange(item.id);
                  onMobileClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-cyan/10 text-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary",
                  isCollapsed && !isMobileOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );

            if (isCollapsed && !isMobileOpen) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.id}>{linkContent}</div>;
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-border">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg",
              isCollapsed && !isMobileOpen && "justify-center"
            )}
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">Demo User</p>
                <p className="text-xs text-text-muted truncate">demo@1nguoi.com</p>
              </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
                    <Link href="/signup">
                      <LogOut className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đăng ký tài khoản</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}

// Demo Navbar Component
function DemoNavbar({ onMenuClick, title }: { onMenuClick: () => void; title: string }) {
  return (
    <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-text-muted px-3 py-1 rounded-full bg-warning/20 text-warning">
          Chế độ Demo
        </span>
        <Button asChild size="sm">
          <Link href="/signup">Đăng ký miễn phí</Link>
        </Button>
      </div>
    </header>
  );
}

// Dashboard Tab
function DashboardTab() {
  const [greeting, setGreeting] = useState("Xin chào");
  const [dateString, setDateString] = useState("");
  const [tasks, setTasks] = useState(demoTasks);
  const completedCount = tasks.filter((t) => t.completed).length;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    setDateString(new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const health = healthConfig[demoFocusProject.health];
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{greeting}, Solopreneur!</h2>
          <p className="text-text-secondary flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {dateString}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo dự án mới
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Focus Project */}
          <Card className="border-cyan/30 bg-gradient-to-br from-cyan/5 to-transparent">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-cyan font-medium uppercase tracking-wider">Focus Project</p>
                    <CardTitle className="text-xl">{demoFocusProject.title}</CardTitle>
                  </div>
                </div>
                <Badge variant={health.variant}>
                  <HealthIcon className="h-3 w-3 mr-1" />
                  {health.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-text-secondary text-sm">{demoFocusProject.description}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Tiến độ</span>
                  <span className="font-medium text-text-primary">{demoFocusProject.progress}%</span>
                </div>
                <Progress value={demoFocusProject.progress} />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button className="flex-1">
                  Làm việc ngay
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline">Xem chi tiết</Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Dự án đang hoạt động</h3>
              <Button variant="ghost" size="sm">Xem tất cả</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoProjects.map((project) => {
                const config = lifecycleConfig[project.lifecycle];
                const Icon = config.icon;
                return (
                  <Card key={project.id} className="card-hover">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base line-clamp-1">{project.title}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Badge className={cn("text-xs", config.bg, config.color)}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.emoji} {config.label}
                      </Badge>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">Tiến độ</span>
                          <span className="text-text-secondary">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Focus */}
        <div>
          <Card className="border-border h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning" />
                  <CardTitle className="text-lg">Daily Focus</CardTitle>
                </div>
                <span className="text-sm text-text-muted">{completedCount}/{tasks.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    task.completed
                      ? "bg-success/5 border-success/20"
                      : "bg-background-secondary border-border hover:border-border-hover"
                  )}
                  onClick={() => toggleTask(task.id)}
                >
                  <Checkbox checked={task.completed} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.completed ? "text-text-muted line-through" : "text-text-primary")}>
                      {task.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{task.project}</p>
                  </div>
                  <span className="text-xs text-text-muted">#{index + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Zen Focus Tab
function ZenFocusTab() {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask] = useState<string | null>("Tích hợp AI Combat");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((25 * 60 - timerSeconds) / (25 * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left - Projects */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-cyan" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {demoProjects.map((project) => (
                <div key={project.id} className="p-3 rounded-lg bg-background-tertiary hover:bg-background-secondary cursor-pointer transition-colors">
                  <p className="font-medium text-sm">{project.title}</p>
                  <Progress value={project.progress} className="h-1 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center - Timer */}
        <div className="lg:col-span-6">
          <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="flex flex-col items-center">
              {/* Current Task */}
              {currentTask && (
                <div className="flex items-center gap-2 px-4 py-2 mb-6 rounded-lg bg-cyan/10 border border-cyan/30">
                  <Target className="w-4 h-4 text-cyan" />
                  <span className="text-sm font-medium text-white">{currentTask}</span>
                </div>
              )}

              {/* Timer Ring */}
              <div className="relative w-64 h-64 mb-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                    className="transition-all duration-300"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-mono font-bold text-white">{formatTime(timerSeconds)}</span>
                  <span className="text-sm text-slate-400 mt-2">Focus Time</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setTimerSeconds(25 * 60)}
                  className="rounded-full"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsRunning(!isRunning)}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                >
                  <CheckCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right - Schedule */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple" />
                Hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { time: "09:00", task: "Review code", done: true },
                { time: "10:30", task: "Team sync", done: true },
                { time: "14:00", task: "Build feature", done: false },
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Idea Graph Tab
function IdeaGraphTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Idea Graph</h2>
          <p className="text-text-muted">Kết nối và phát triển ý tưởng</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm ý tưởng
        </Button>
      </div>

      {/* Graph Preview */}
      <Card className="h-[500px] relative overflow-hidden bg-slate-900/50">
        <div className="absolute inset-0 p-8">
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line x1="150" y1="120" x2="350" y2="170" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="150" y1="120" x2="250" y2="300" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="150" y1="120" x2="450" y2="300" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5,5" />
          </svg>

          {/* Nodes */}
          {demoIdeas.map((idea) => (
            <div
              key={idea.id}
              className="absolute p-4 rounded-xl bg-background-secondary border border-border hover:border-cyan/50 cursor-pointer transition-all hover:scale-105 w-48"
              style={{ left: idea.x, top: idea.y }}
            >
              <h4 className="font-semibold text-sm mb-1">{idea.title}</h4>
              <p className="text-xs text-text-muted">{idea.description}</p>
            </div>
          ))}
        </div>

        {/* Floating controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Network className="h-4 w-4 mr-2" />
            Auto-layout
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Brainstorm Tab
function BrainstormTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Brainstorm</h2>
          <p className="text-text-muted">Để 4 AI agents phân tích ý tưởng của bạn</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Phiên mới
        </Button>
      </div>

      {/* Agents Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {demoBrainstormSession.agents.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-2xl", agent.color)}>
                {agent.emoji}
              </div>
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-text-muted">{agent.id.charAt(0).toUpperCase() + agent.id.slice(1)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Session Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple" />
                {demoBrainstormSession.topic}
              </CardTitle>
              <p className="text-sm text-text-muted mt-1">4 AI agents đã phân tích</p>
            </div>
            <Button variant="outline" size="sm">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Xem chi tiết
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoBrainstormSession.agents.map((agent) => (
            <div key={agent.id} className="flex gap-3">
              <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0", agent.color)}>
                {agent.emoji}
              </div>
              <div className="flex-1 p-3 rounded-lg bg-background-tertiary">
                <p className="font-medium text-sm mb-1">{agent.name}</p>
                <p className="text-sm text-text-secondary">{agent.response}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Combat Pro Tab
function CombatProTab() {
  const [inputMessage, setInputMessage] = useState("");

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
            <Swords className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Combat Pro</h2>
            <p className="text-sm text-text-muted">Phòng họp AI - 4 AI với góc nhìn khác nhau</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(combatAgents).map(([id, agent]) => (
            <Tooltip key={id}>
              <TooltipTrigger>
                <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-sm", agent.color)}>
                  {agent.emoji}
                </div>
              </TooltipTrigger>
              <TooltipContent>{agent.name} - {agent.role}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {demoCombatMessages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[70%] p-4 rounded-2xl rounded-tr-sm bg-cyan/20 text-cyan-100">
                  {message.content}
                </div>
              </div>
            );
          }
          const agent = combatAgents[message.agent as keyof typeof combatAgents];
          return (
            <div key={message.id} className="flex gap-3">
              <div className={cn("w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-lg shrink-0", agent.color)}>
                {agent.emoji}
              </div>
              <div className="max-w-[70%] p-4 rounded-2xl rounded-tl-sm bg-slate-800/50">
                <p className={cn("font-medium text-sm mb-1", agent.color.includes("yellow") ? "text-yellow-400" : agent.color.includes("red") ? "text-red-400" : "text-cyan-400")}>
                  {agent.name}
                </p>
                <p className="text-sm text-slate-200">{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border">
        <div className="flex gap-3">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập câu hỏi hoặc @mention AI cụ thể..."
            className="resize-none"
            rows={2}
          />
          <Button className="px-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Projects Tab
function ProjectsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Lifecycle</h2>
          <p className="text-text-muted">Theo dõi tiến trình từ ý tưởng đến khi ra mắt</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "TẤT CẢ", icon: LayoutDashboard },
          { key: "idea", label: "💡 IDEA", icon: Lightbulb },
          { key: "designing", label: "📐 DESIGNING", icon: Ruler },
          { key: "building", label: "🏗️ BUILDING", icon: Hammer },
          { key: "testing", label: "🧪 TESTING", icon: FlaskConical },
          { key: "shipped", label: "🚀 SHIPPED", icon: Rocket },
        ].map((item, index) => (
          <Button
            key={item.key}
            variant={index === 0 ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <h3 className="text-lg font-bold">Active Projects</h3>
          <Badge variant="secondary">{demoProjects.length}</Badge>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {demoProjects.map((project) => {
            const config = lifecycleConfig[project.lifecycle];
            const Icon = config.icon;
            return (
              <Card key={project.id} className="p-6 hover:shadow-xl hover:shadow-cyan/5 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", config.bg, config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{project.title}</h3>
                      <Badge className={cn("text-xs", config.bg, config.color)}>
                        {config.emoji} {config.label}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {project.currentTask && (
                  <div className="bg-cyan/5 rounded-xl p-4 border border-cyan/10 mb-4">
                    <p className="text-[10px] font-bold text-cyan uppercase tracking-widest mb-1">VIỆC CẦN LÀM</p>
                    <p className="text-sm font-semibold">{project.currentTask}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Tiến độ</span>
                    <span className="font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-background-tertiary rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", config.progress)} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}</span>
                  </div>
                  <Button variant="link" size="sm" className="text-cyan">
                    Xem chi tiết →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const getTabTitle = () => {
    const item = navItems.find(n => n.id === activeTab);
    return item?.label || "Dashboard";
  };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "zen":
        return <ZenFocusTab />;
      case "ideas":
        return <IdeaGraphTab />;
      case "brainstorm":
        return <BrainstormTab />;
      case "combat":
        return <CombatProTab />;
      case "projects":
        return <ProjectsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <DemoSidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <main className="md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
          <DemoNavbar
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            title={getTabTitle()}
          />

          <div className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              {/* Demo Banner */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-cyan" />
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
              </div>

              {renderTab()}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
