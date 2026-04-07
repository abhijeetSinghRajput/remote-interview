import { ISession } from '@/types/model';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { IconLoader, IconVideo } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const DIFF = {
  easy: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  medium: "text-amber-400 bg-amber-950/60 border-amber-800",
  hard: "text-rose-400 bg-rose-950/60 border-rose-800",
};

function ActiveSessionCard({
  session,
  onJoin,
  isJoining,
}: {
  session: ISession;
  onJoin: (id: string) => void;
  isJoining: boolean;
}) {
  const spotsLeft = session.participant ? 0 : 1;

  return (
    <div className="group rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-200 overflow-hidden">
      {/* top accent */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/40 to-transparent" />

      <div className="p-5">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {typeof session.host === "object" && session.host !== null ? (
              <>
                <img
                  src={session.host.image}
                  alt={session.host.name}
                  className="h-7 w-7 rounded-full ring-1 ring-border shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{session.host.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">host</p>
                </div>
              </>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">Host</p>
                <p className="text-xs text-muted-foreground font-mono">host</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">live</span>
          </div>
        </div>

        {/* problem */}
        <p className="text-sm font-semibold mb-2 leading-snug line-clamp-1">
          {typeof session.problem === "object" && session.problem !== null
            ? session.problem.title
            : "Problem"}
        </p>

        {/* tags row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono border",
              typeof session.problem === "object" && session.problem !== null
                ? DIFF[session.problem.difficulty as keyof typeof DIFF]
                : undefined
            )}
          >
            {typeof session.problem === "object" && session.problem !== null
              ? session.problem.difficulty
              : ""}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {spotsLeft === 0 ? (
              <span className="text-rose-400">full</span>
            ) : (
              <span className="text-emerald-400">1 spot open</span>
            )}
          </span>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-mono">
            {session.createdAt
              ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
              : ""}
          </span>
          <Button
            size="sm"
            variant={spotsLeft === 0 ? "outline" : "default"}
            className="h-7 text-xs gap-1.5"
            disabled={spotsLeft === 0 || isJoining}
            onClick={() => onJoin(session._id)}
          >
            {isJoining ? (
              <IconLoader className="h-3 w-3 animate-spin" />
            ) : (
              <IconVideo className="h-3 w-3" />
            )}
            {spotsLeft === 0 ? "Full" : "Join"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ActiveSessionCard