"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconActivity, IconPlus } from "@tabler/icons-react";
import type { ISession } from "@/types/model";
import ActiveSessionCard from "@/components/dashboard/active-session-card";

type ActiveSessionsSectionProps = {
  sessions: ISession[];
  isLoading: boolean;
  joiningId: string | null;
  onJoin: (id: string) => void;
  onCreateClick: () => void;
};

export default function ActiveSessionsSection({
  sessions,
  isLoading,
  joiningId,
  onJoin,
  onCreateClick,
}: ActiveSessionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Active Sessions
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          {sessions.length} live
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <IconActivity className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No active sessions
          </p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            Be the first to start one
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={onCreateClick}
          >
            <IconPlus className="h-3.5 w-3.5" />
            Create Session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sessions.map((session) => (
            <ActiveSessionCard
              key={session._id}
              session={session}
              onJoin={onJoin}
              isJoining={joiningId === session._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}