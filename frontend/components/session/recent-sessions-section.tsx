"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IconClock, IconHistory } from "@tabler/icons-react";
import type { ISession } from "@/types/model";
import RecentSessionRow from "@/components/session/recent-session-row";

type RecentSessionsSectionProps = {
  sessions: ISession[];
  isLoading: boolean;
};

export default function RecentSessionsSection({
  sessions,
  isLoading,
}: RecentSessionsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <IconHistory className="h-3.5 w-3.5 text-muted-foreground" />
          Past Sessions
        </h2>
        <span className="text-xs font-mono text-muted-foreground">
          {sessions.length} total
        </span>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-3 space-y-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-12 text-center">
            <IconClock className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No past sessions yet
            </p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.slice(0, 8).map((session) => (
              <RecentSessionRow key={session._id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}