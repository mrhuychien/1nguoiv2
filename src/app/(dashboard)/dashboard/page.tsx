"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { FocusProject } from "@/components/dashboard/focus-project";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { DailyFocus } from "@/components/dashboard/daily-focus";

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <DashboardHeader />
      <DashboardStats />
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <FocusProject />
          <ProjectGrid />
        </div>
        <div>
          <DailyFocus />
        </div>
      </div>
    </div>
  );
}
