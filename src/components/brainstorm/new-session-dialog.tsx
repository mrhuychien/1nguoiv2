"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";

interface NewSessionDialogProps {
  onSessionCreated?: (session: { id: string }) => void;
  projectId?: string;
  projectTitle?: string;
  projectDescription?: string;
  trigger?: React.ReactNode;
}

export function NewSessionDialog({
  onSessionCreated,
  projectId,
  projectTitle,
  projectDescription,
  trigger
}: NewSessionDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [originalIdea, setOriginalIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill when opening with project data
  useEffect(() => {
    if (open && projectTitle && !title) {
      setTitle(projectTitle);
    }
    if (open && projectDescription && !originalIdea) {
      setOriginalIdea(projectDescription);
    }
  }, [open, projectTitle, projectDescription, title, originalIdea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          originalIdea: originalIdea.trim(),
          projectId: projectId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      setOpen(false);
      setTitle("");
      setOriginalIdea("");
      onSessionCreated?.(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Brainstorm
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Start New Brainstorm</DialogTitle>
            <DialogDescription>
              Enter your idea and let 4 AI agents analyze it from different perspectives.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                placeholder="e.g., SaaS for freelancers"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="idea">Your Idea</Label>
              <Textarea
                id="idea"
                placeholder="Describe your business idea in detail. The more context you provide, the better the analysis will be."
                value={originalIdea}
                onChange={(e) => setOriginalIdea(e.target.value)}
                rows={5}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title.trim() || !originalIdea.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
