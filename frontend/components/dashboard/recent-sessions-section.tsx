"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowRight, IconClock, IconCode, IconHistory, IconUser } from "@tabler/icons-react";
import type { ISession } from "@/types/model";
import RecentSessionRow from "@/components/dashboard/recent-session-row";
import { cn } from "@/lib/utils";

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

      <div className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <RecentSessionRowSkeleton key={i} />
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
          <div className="space-y-2">
            {sessions.slice(0, 8).map((session) => (
              <RecentSessionRow key={session._id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function RecentSessionRowSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-card px-4 py-3 text-left",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* left icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
          <IconCode className="h-4 w-4 text-muted-foreground/60" />
        </div>

        {/* center content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              {/* title */}
              <Skeleton className="h-5 w-[68%] rounded-md" />
              <Skeleton className="h-3 w-40 rounded-md" />
            </div>

            <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
          </div>

          {/* bottom row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-3.5 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
