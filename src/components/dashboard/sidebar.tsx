"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Lightbulb, FolderKanban, Settings, LogOut, ChevronLeft, ChevronRight, X, Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect } from "react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/zen",
    label: "Zen Focus",
    icon: Sparkles,
  },
  {
    href: "/ideas",
    label: "Idea Graph",
    icon: Lightbulb,
  },
  {
    href: "/brainstorm",
    label: "Brainstorm",
    icon: Brain,
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { userInfo, signOut, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering user content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname, onMobileClose]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut();
    if (onMobileClose) onMobileClose();
  };

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-background-secondary border-r border-border flex flex-col transition-all duration-300",
          // Desktop styles
          "hidden md:flex",
          isCollapsed ? "md:w-16" : "md:w-64",
          // Mobile styles - slide in from left
          isMobileOpen && "flex w-72 md:w-64"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border px-4",
          isCollapsed && !isMobileOpen ? "justify-center" : "justify-between"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onMobileClose}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-semibold text-lg text-text-primary">
                1nguoi
              </span>
            )}
          </Link>

          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-md hover:bg-background-tertiary text-text-muted hover:text-text-secondary transition-colors md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Desktop collapse button */}
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
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              {isMounted && <AvatarImage src={userInfo?.avatarUrl || ""} />}
              <AvatarFallback>
                {isMounted ? getInitials(userInfo?.fullName || userInfo?.email || null) : "U"}
              </AvatarFallback>
            </Avatar>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {isMounted && !isLoading
                    ? (userInfo?.fullName || userInfo?.email?.split('@')[0] || "User")
                    : "..."}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {isMounted && !isLoading ? userInfo?.email : ""}
                </p>
              </div>
            )}
            {(!isCollapsed || isMobileOpen) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="flex-shrink-0"
                    disabled={!isMounted}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đăng xuất</TooltipContent>
              </Tooltip>
            )}
          </div>
          {isCollapsed && !isMobileOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="w-full mt-2"
                  disabled={!isMounted}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Đăng xuất</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
