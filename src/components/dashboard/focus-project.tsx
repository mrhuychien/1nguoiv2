"use client";

import { Target, Clock, ArrowRight, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
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

export function FocusProject() {
  const { isLoading } = useProjectData();
  const { getFocusProject, getProjectTasks } = useProjectStore();

  const focusProject = getFocusProject();

  if (isLoading) {
    return (
      <Card className="border-border border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyan" />
        </CardContent>
      </Card>
    );
  }

  if (!focusProject) {
    return (
      <Card className="border-border border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-text-muted mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Chưa có Focus Project
          </h3>
          <p className="text-text-secondary mb-4 max-w-sm">
            Chọn 1 dự án để tập trung. Focus Project giúp bạn không bị phân tán.
          </p>
          <Button variant="outline">
            Chọn Focus Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  const health = healthConfig[focusProject.health];
  const HealthIcon = health.icon;
  const projectTasks = getProjectTasks(focusProject.id);
  const completedTasks = projectTasks.filter((t) => t.completed).length;

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
              <CardTitle className="text-xl">{focusProject.title}</CardTitle>
            </div>
          </div>
          <Badge variant={health.variant}>
            <HealthIcon className="h-3 w-3 mr-1" />
            {health.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {focusProject.description && (
          <p className="text-text-secondary text-sm">
            {focusProject.description}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Tiến độ</span>
            <span className="font-medium text-text-primary">
              {focusProject.progress}%
            </span>
          </div>
          <Progress value={focusProject.progress} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4" />
            <span>
              Deadline: {focusProject.deadline ? new Date(focusProject.deadline).toLocaleDateString("vi-VN") : "Không có"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckCircle className="h-4 w-4" />
            <span>{completedTasks}/{projectTasks.length} tasks</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/projects/${focusProject.id}`}>
              Làm việc ngay
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline">
            Xem chi tiết
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
