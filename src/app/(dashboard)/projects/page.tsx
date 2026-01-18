"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProjectStore, mockProjects, mockTasks } from "@/store/project-store";
import { Plus, MoreHorizontal, CheckCircle, AlertTriangle, Target } from "lucide-react";

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

export default function ProjectsPage() {
  const { projects, setProjects, setTasks, setFocusProject } = useProjectStore();
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "archived">("all");

  useEffect(() => {
    if (projects.length === 0) {
      setProjects(mockProjects);
      setTasks(mockTasks);
    }
  }, [projects.length, setProjects, setTasks]);

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <>
      <Navbar title="Dự án" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Tất cả dự án
            </h2>
            <p className="text-text-secondary">
              Quản lý và theo dõi tất cả dự án của bạn
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo dự án mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Tất cả" },
            { key: "active", label: "Đang hoạt động" },
            { key: "completed", label: "Hoàn thành" },
            { key: "archived", label: "Lưu trữ" },
          ].map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(item.key as typeof filter)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const health = healthConfig[project.health];
            const HealthIcon = health.icon;

            return (
              <Card
                key={project.id}
                className={`card-hover ${
                  project.is_focus ? "border-cyan/30 bg-cyan/5" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {project.is_focus && (
                        <Target className="h-5 w-5 text-cyan mt-0.5" />
                      )}
                      <CardTitle className="text-lg line-clamp-2">
                        {project.title}
                      </CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Health badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant={health.variant}>
                      <HealthIcon className="h-3 w-3 mr-1" />
                      {health.label}
                    </Badge>
                    {project.is_focus && (
                      <Badge variant="default">Focus</Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Tiến độ</span>
                      <span className="text-text-secondary">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  {/* Deadline */}
                  {project.deadline && (
                    <p className="text-xs text-text-muted">
                      Deadline: {new Date(project.deadline).toLocaleDateString("vi-VN")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Xem chi tiết
                    </Button>
                    {!project.is_focus && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFocusProject(project.id)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Chưa có dự án nào
            </h3>
            <p className="text-text-secondary mb-4">
              Tạo dự án đầu tiên để bắt đầu
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án mới
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
