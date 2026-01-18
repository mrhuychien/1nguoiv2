"use client";

import { Navbar } from "@/components/dashboard/navbar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FocusProject } from "@/components/dashboard/focus-project";
import { ProjectGrid } from "@/components/dashboard/project-grid";
import { DailyFocus } from "@/components/dashboard/daily-focus";

export default function DashboardPage() {
  return (
    <>
      <Navbar title="Dashboard" />
      <div className="p-6 space-y-6">
        <DashboardHeader />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FocusProject />
            <ProjectGrid />
          </div>
          <div>
            <DailyFocus />
          </div>
        </div>
      </div>
    </>
  );
}
