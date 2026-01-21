"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Loader2, RefreshCw } from "lucide-react";
import { RoundList } from "./round-status";
import { AGENTS, ROUNDS } from "@/lib/types/brainstorm";
import type { BrainstormSession, BrainstormRound } from "@/lib/types/brainstorm";

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const [session, setSession] = useState<BrainstormSession | null>(null);
  const [rounds, setRounds] = useState<BrainstormRound[]>([]);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/brainstorm/${sessionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch session");
      }

      setSession(data.session);
      setRounds(data.rounds);

      // Auto-select the running or first completed round
      const runningRound = data.rounds.find((r: BrainstormRound) => r.status === "running");
      const lastCompletedRound = [...data.rounds]
        .reverse()
        .find((r: BrainstormRound) => r.status === "completed");
      setActiveRoundId(runningRound?.id || lastCompletedRound?.id || data.rounds[0]?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch session");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // SSE connection for real-time updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    if (session?.status === "running") {
      eventSource = new EventSource(`/api/brainstorm/${sessionId}/stream`);

      eventSource.addEventListener("update", (event) => {
        const data = JSON.parse(event.data);
        setSession(data.session);
        setRounds(data.rounds);

        // Auto-select running round
        const runningRound = data.rounds.find((r: BrainstormRound) => r.status === "running");
        if (runningRound) {
          setActiveRoundId(runningRound.id);
        }
      });

      eventSource.addEventListener("complete", (event) => {
        const data = JSON.parse(event.data);
        setSession(data.session);
        setRounds(data.rounds);
        eventSource?.close();
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    }

    return () => {
      eventSource?.close();
    };
  }, [session?.status, sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleStart = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch(`/api/brainstorm/${sessionId}/start`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start session");
      }

      // Refresh data
      await fetchSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session");
    } finally {
      setIsStarting(false);
    }
  };

  const activeRound = rounds.find((r) => r.id === activeRoundId);
  const activeAgent = activeRound ? AGENTS[activeRound.agent_id] : null;
  const activeRoundInfo = activeRound ? ROUNDS.find((r) => r.role === activeRound.role) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <p className="text-muted-foreground text-sm line-clamp-1">{session.original_idea}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.status === "draft" && (
            <Button onClick={handleStart} disabled={isStarting}>
              {isStarting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Analysis
            </Button>
          )}
          {session.status === "error" && (
            <Button variant="outline" onClick={fetchSession}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          <Badge
            variant={
              session.status === "completed"
                ? "outline"
                : session.status === "running"
                  ? "default"
                  : session.status === "error"
                    ? "danger"
                    : "secondary"
            }
          >
            {session.status}
          </Badge>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rounds list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Rounds</CardTitle>
            <CardDescription>
              {session.current_round}/{session.total_rounds} completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoundList
              rounds={rounds}
              activeRoundId={activeRoundId || undefined}
              onRoundSelect={(round) => setActiveRoundId(round.id)}
            />
          </CardContent>
        </Card>

        {/* Round detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              {activeAgent && (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: activeAgent.color + "20" }}
                >
                  {activeAgent.icon}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {activeAgent?.name} - {activeRoundInfo?.name}
                </CardTitle>
                <CardDescription>{activeRoundInfo?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeRound?.status === "running" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}

            {activeRound?.status === "pending" && (
              <p className="text-muted-foreground">Waiting to start...</p>
            )}

            {activeRound?.status === "error" && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{activeRound.error}</p>
              </div>
            )}

            {activeRound?.status === "completed" && activeRound.output && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm">{activeRound.output}</div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span>Tokens: {activeRound.tokens_input + activeRound.tokens_output}</span>
                  <span>Cost: ${activeRound.cost.toFixed(4)}</span>
                  <span>Duration: {(activeRound.duration_ms / 1000).toFixed(1)}s</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
