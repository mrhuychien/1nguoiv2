"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NewSessionDialog, SessionCard, SessionDetail } from "@/components/brainstorm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Brain } from "lucide-react";
import type { BrainstormSession } from "@/lib/types/brainstorm";
import { AGENTS } from "@/lib/types/brainstorm";
import { useSubscription } from "@/hooks/use-subscription";
import { ProFeatureGate } from "@/components/ui/upgrade-prompt";

function BrainstormPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isPro, isLoading: subscriptionLoading } = useSubscription();

  // Get project info from URL params
  const projectId = searchParams.get("projectId");
  const projectTitle = searchParams.get("title");
  const projectDescription = searchParams.get("description");

  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null);

  // Fetch sessions only if user is PRO
  const fetchSessions = useCallback(async () => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/brainstorm");
      const data = await response.json();
      if (response.ok) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isPro]);

  useEffect(() => {
    if (isPro) {
      fetchSessions();
    }
  }, [isPro, fetchSessions]);

  const handleSessionCreated = (session: { id: string }) => {
    fetchSessions();
    setSelectedSessionId(session.id);
    // Clear URL params after creating session
    if (projectId) {
      router.replace("/brainstorm");
    }
  };

  const handleStartSession = async (sessionId: string) => {
    setStartingSessionId(sessionId);
    try {
      const response = await fetch(`/api/brainstorm/${sessionId}/start`, {
        method: "POST",
      });

      if (response.ok) {
        setSelectedSessionId(sessionId);
      }
      await fetchSessions();
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setStartingSessionId(null);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      await fetch(`/api/brainstorm/${sessionId}`, { method: "DELETE" });
      await fetchSessions();
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  return (
    <ProFeatureGate
      isPro={isPro}
      isLoading={subscriptionLoading}
      feature="Brainstorm"
      description="4 AI agents phân tích ý tưởng của bạn từ nhiều góc nhìn: Technical, Business, Creative và Critical."
    >
      {/* Show session detail view */}
      {selectedSessionId ? (
        <div className="p-4 md:p-6">
          <SessionDetail
            sessionId={selectedSessionId}
            onBack={() => {
              setSelectedSessionId(null);
              fetchSessions();
            }}
          />
        </div>
      ) : (
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Brainstorm</h1>
              <p className="text-muted-foreground">
                Let 4 AI agents analyze your ideas
              </p>
            </div>
            <NewSessionDialog
              onSessionCreated={handleSessionCreated}
              projectId={projectId || undefined}
              projectTitle={projectTitle || undefined}
              projectDescription={projectDescription || undefined}
            />
          </div>

          {/* Agents Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(AGENTS).map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: agent.color + "20" }}
                  >
                    {agent.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sessions List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <Brain className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No brainstorm sessions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first session to get AI-powered idea analysis
                </p>
                <NewSessionDialog
                  onSessionCreated={handleSessionCreated}
                  projectId={projectId || undefined}
                  projectTitle={projectTitle || undefined}
                  projectDescription={projectDescription || undefined}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isStarting={startingSessionId === session.id}
                  onStart={() => handleStartSession(session.id)}
                  onView={() => setSelectedSessionId(session.id)}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </ProFeatureGate>
  );
}

export default function BrainstormPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BrainstormPageContent />
    </Suspense>
  );
}
