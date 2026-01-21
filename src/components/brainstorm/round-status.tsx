"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
import type { BrainstormRound } from "@/lib/types/brainstorm";
import { AGENTS, ROUNDS } from "@/lib/types/brainstorm";

interface RoundStatusProps {
  round: BrainstormRound;
  isActive?: boolean;
  onClick?: () => void;
}

export function RoundStatus({ round, isActive, onClick }: RoundStatusProps) {
  const agent = AGENTS[round.agent_id];
  const roundInfo = ROUNDS.find((r) => r.role === round.role);

  const getStatusIcon = () => {
    switch (round.status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all w-full text-left",
        isActive
          ? "bg-primary/10 border-2 border-primary"
          : "bg-secondary/50 hover:bg-secondary border-2 border-transparent",
        round.status === "error" && "border-destructive/50"
      )}
    >
      {/* Agent Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: agent?.color + "20" }}
      >
        {agent?.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{agent?.name}</span>
          <span className="text-xs text-muted-foreground">Round {round.round_number}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {roundInfo?.name}
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {round.status === "completed" && round.duration_ms > 0 && (
          <span className="text-xs text-muted-foreground">
            {(round.duration_ms / 1000).toFixed(1)}s
          </span>
        )}
        {getStatusIcon()}
      </div>
    </button>
  );
}

interface RoundListProps {
  rounds: BrainstormRound[];
  activeRoundId?: string;
  onRoundSelect?: (round: BrainstormRound) => void;
}

export function RoundList({ rounds, activeRoundId, onRoundSelect }: RoundListProps) {
  return (
    <div className="space-y-2">
      {rounds.map((round) => (
        <RoundStatus
          key={round.id}
          round={round}
          isActive={round.id === activeRoundId}
          onClick={() => onRoundSelect?.(round)}
        />
      ))}
    </div>
  );
}
