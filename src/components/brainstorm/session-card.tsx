"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Eye, Trash2, Clock, DollarSign, Loader2 } from "lucide-react";
import type { BrainstormSession } from "@/lib/types/brainstorm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface SessionCardProps {
  session: BrainstormSession;
  onStart?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  isStarting?: boolean;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "danger" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  running: { label: "Running", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  error: { label: "Error", variant: "danger" },
};

export function SessionCard({ session, onStart, onView, onDelete, isStarting }: SessionCardProps) {
  const status = statusConfig[session.status] || statusConfig.draft;
  const progress = session.total_rounds > 0
    ? Math.round((session.current_round / session.total_rounds) * 100)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{session.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {session.original_idea}
            </CardDescription>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar for running sessions */}
        {session.status === "running" && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Round {session.current_round}/{session.total_rounds}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(session.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
          {session.total_cost > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${session.total_cost.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {session.status === "draft" && (
            <Button size="sm" onClick={onStart} disabled={isStarting}>
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start
            </Button>
          )}
          {(session.status === "running" || session.status === "completed") && (
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
