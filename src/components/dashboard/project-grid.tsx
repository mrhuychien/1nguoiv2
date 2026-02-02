"use client";

import { MoreHorizontal, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/project-store";
import { useProjectData } from "@/hooks/use-project-data";

const healthConfig = {
  "on-track": {
    label: "Đúng tiến độ",
    variant: "success" as const,
    icon: CheckCircle,
  },
  "at-risk": {
    label: "Có rủi ro",
    variant: "warning" as const,
    icon: AlertTriangle,
  },
  blocked: {
    label: "Bị chặn",
    variant: "danger" as const,
    icon: AlertTriangle,
  },
};

export function ProjectGrid() {
  const { isLoading } = useProjectData();
  const { getActiveProjects } = useProjectStore();
  const activeProjects = getActiveProjects();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Dự án đang hoạt động
          </h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan" />
        </div>
      </div>
    );
  }

  if (activeProjects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Dự án đang hoạt động
        </h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">Xem tất cả</Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeProjects.map((project) => {
          const health = healthConfig[project.health];
          const HealthIcon = health.icon;

          return (
            <Card key={project.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">
                    {project.title}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Health badge */}
                <Badge variant={health.variant} className="text-xs">
                  <HealthIcon className="h-3 w-3 mr-1" />
                  {health.label}
                </Badge>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Tiến độ</span>
                    <span className="text-text-secondary">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                {/* Deadline */}
                {project.deadline && (
                  <p className="text-xs text-text-muted">
                    Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
