import {
  IconArrowRight,
  IconCode,
  IconClock,
  IconUser,
  IconCheck,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ISession } from "@/types/model";

const DIFF = {
  easy: "border bg-muted text-foreground",
  medium: "border bg-muted text-foreground",
  hard: "border bg-muted text-foreground",
};



function RecentSessionRow({ session }: { session: ISession }) {
  const problem =
    typeof session.problem === "object" && session.problem !== null
      ? session.problem
      : null;

  const difficulty = problem?.difficulty as keyof typeof DIFF | undefined;

  return (
    <button
      className={cn(
        "group w-full rounded-xl border bg-card px-4 py-3 text-left transition-all",
        "hover:bg-muted/40 hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {/* left icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
          <IconCode className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* center content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {problem?.title || "Problem"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5" />
                  {session.createdAt
                    ? formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                      })
                    : ""}
                </span>

                {session.participant && (
                  <span className="inline-flex items-center gap-1">
                    <IconUser className="h-3.5 w-3.5" />
                    2 participants
                  </span>
                )}
              </div>
            </div>

            <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {difficulty && (
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium capitalize",
                  DIFF[difficulty]
                )}
              >
                {difficulty}
              </Badge>
            )}
            
            {session.updatedAt && (
              <span className="text-[11px] text-muted-foreground">
                Updated{" "}
                {formatDistanceToNow(new Date(session.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default RecentSessionRow;