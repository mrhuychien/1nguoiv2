"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  FolderKanban,
  Settings,
  Sparkles,
  Brain,
  Swords,
  ChevronLeft,
  ChevronRight,
  Target,
  Clock,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Demo nav items
const navItems = [
  { href: "/demo", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo#zen", label: "Zen Focus", icon: Sparkles },
  { href: "/demo#ideas", label: "Idea Graph", icon: Lightbulb },
  { href: "/demo#brainstorm", label: "Brainstorm", icon: Brain },
  { href: "/demo#combat", label: "Combat", icon: Swords },
  { href: "/demo#projects", label: "Projects", icon: FolderKanban },
  { href: "/demo#settings", label: "Cai dat", icon: Settings },
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
  { id: "p1", title: "1nguoi Platform", progress: 65, health: "on-track" as const, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "p2", title: "Mobile App", progress: 25, health: "at-risk" as const, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "p3", title: "Marketing Campaign", progress: 80, health: "on-track" as const, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
];

const healthConfig = {
  "on-track": { label: "Đúng tiến độ", variant: "success" as const, icon: CheckCircle },
  "at-risk": { label: "Có rủi ro", variant: "warning" as const, icon: AlertTriangle },
  blocked: { label: "Bị chặn", variant: "danger" as const, icon: AlertTriangle },
};

// Demo Sidebar Component
function DemoSidebar({ isMobileOpen, onMobileClose }: { isMobileOpen?: boolean; onMobileClose?: () => void }) {
  const pathname = usePathname();
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
          <Link href="/demo" className="flex items-center gap-2" onClick={onMobileClose}>
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
            const isActive = pathname === item.href || (item.href === "/demo" && pathname === "/demo");
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-cyan/10 text-cyan"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary",
                  isCollapsed && !isMobileOpen && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobileOpen) && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );

            if (isCollapsed && !isMobileOpen) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
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
function DemoNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-16 border-b border-border bg-background px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-background-secondary text-text-secondary md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
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

// Demo Dashboard Header
function DemoDashboardHeader() {
  const [greeting, setGreeting] = useState("Xin chào");
  const [dateString, setDateString] = useState("");

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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          {greeting}, Solopreneur!
        </h2>
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
  );
}

// Demo Focus Project
function DemoFocusProject() {
  const health = healthConfig[demoFocusProject.health];
  const HealthIcon = health.icon;

  return (
    <Card className="border-cyan/30 bg-gradient-to-br from-cyan/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-cyan" />
            </div>
            <div>
              <p className="text-xs text-cyan font-medium uppercase tracking-wider">
                Focus Project
              </p>
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

        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>Deadline: {new Date(demoFocusProject.deadline).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckCircle className="h-4 w-4" />
            <span>2/3 tasks</span>
          </div>
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
  );
}

// Demo Project Grid
function DemoProjectGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Dự án đang hoạt động</h3>
        <Button variant="ghost" size="sm">Xem tất cả</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoProjects.map((project) => {
          const health = healthConfig[project.health];
          const HealthIcon = health.icon;

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
                <Badge variant={health.variant} className="text-xs">
                  <HealthIcon className="h-3 w-3 mr-1" />
                  {health.label}
                </Badge>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Tiến độ</span>
                    <span className="text-text-secondary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                <p className="text-xs text-text-muted">
                  Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Demo Daily Focus
function DemoDailyFocus() {
  const [tasks, setTasks] = useState(demoTasks);
  const completedCount = tasks.filter((t) => t.completed).length;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <Card className="border-border h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Daily Focus</CardTitle>
          </div>
          <span className="text-sm text-text-muted">{completedCount}/{tasks.length}</span>
        </div>
        <p className="text-sm text-text-secondary">
          Tập trung vào 3 tasks quan trọng nhất hôm nay
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              task.completed
                ? "bg-success/5 border-success/20"
                : "bg-background-secondary border-border hover:border-border-hover"
            )}
          >
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  task.completed ? "text-text-muted line-through" : "text-text-primary"
                )}
              >
                {task.title}
              </p>
              <p className="text-xs text-text-muted mt-0.5">{task.project}</p>
            </div>
            <span className="text-xs text-text-muted">#{index + 1}</span>
          </div>
        ))}

        {completedCount === tasks.length && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">
              Xuất sắc! Bạn đã hoàn thành tất cả tasks!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DemoPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DemoSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
        <DemoNavbar onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6">
            {/* Demo Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30">
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

            <DemoDashboardHeader />

            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <DemoFocusProject />
                <DemoProjectGrid />
              </div>
              <div>
                <DemoDailyFocus />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
