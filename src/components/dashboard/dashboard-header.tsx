"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

export function DashboardHeader() {
  const { profile, isLoading } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [greeting, setGreeting] = useState("Xin chào");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    setIsMounted(true);

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");

    // Set formatted date
    setDateString(new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }));
  }, []);

  const displayName = isMounted && !isLoading
    ? (profile?.full_name?.split(" ")[0] || "Solopreneur")
    : "...";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          {greeting}, {displayName}!
        </h2>
        <p className="text-text-secondary flex items-center gap-2 mt-1">
          <Calendar className="h-4 w-4" />
          {isMounted ? dateString : "Đang tải..."}
        </p>
      </div>
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Tạo dự án mới
      </Button>
    </div>
  );
}
