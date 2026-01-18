"use client";

import { CheckCircle2, Circle, Plus, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";

export function DailyFocus() {
  const { getDailyFocusTasks, toggleTaskComplete, projects } = useProjectStore();
  const dailyTasks = getDailyFocusTasks();
  const completedCount = dailyTasks.filter((t) => t.completed).length;

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const project = projects.find((p) => p.id === projectId);
    return project?.title;
  };

  return (
    <Card className="border-border h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            <CardTitle className="text-lg">Daily Focus</CardTitle>
          </div>
          <span className="text-sm text-text-muted">
            {completedCount}/{dailyTasks.length}
          </span>
        </div>
        <p className="text-sm text-text-secondary">
          Tập trung vào 3 tasks quan trọng nhất hôm nay
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {dailyTasks.length === 0 ? (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm mb-3">
              Chưa có task nào cho hôm nay
            </p>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Thêm task
            </Button>
          </div>
        ) : (
          <>
            {dailyTasks.map((task, index) => {
              const projectName = getProjectName(task.project_id);
              return (
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
                    onCheckedChange={() => toggleTaskComplete(task.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.completed
                          ? "text-text-muted line-through"
                          : "text-text-primary"
                      )}
                    >
                      {task.title}
                    </p>
                    {projectName && (
                      <p className="text-xs text-text-muted mt-0.5">
                        {projectName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-text-muted">#{index + 1}</span>
                </div>
              );
            })}

            {dailyTasks.length < 3 && (
              <Button variant="ghost" className="w-full justify-start text-text-muted" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm task ({3 - dailyTasks.length} còn lại)
              </Button>
            )}
          </>
        )}

        {/* Motivational message */}
        {completedCount === dailyTasks.length && dailyTasks.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-sm font-medium text-success">
              Xuất sắc! Bạn đã hoàn thành tất cả tasks!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
