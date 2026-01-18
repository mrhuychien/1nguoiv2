"use client";

import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

export function DashboardHeader() {
  const { profile } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Solopreneur"}!
        </h2>
        <p className="text-text-secondary flex items-center gap-2 mt-1">
          <Calendar className="h-4 w-4" />
          {formatDate()}
        </p>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Tạo dự án mới
      </Button>
    </div>
  );
}
