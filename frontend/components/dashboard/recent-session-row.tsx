import { IconArrowRight, IconCode } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ISession } from '@/types/model';
import { useRouter } from 'next/navigation';

const DIFF = {
  easy: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  medium: "text-amber-400 bg-amber-950/60 border-amber-800",
  hard: "text-rose-400 bg-rose-950/60 border-rose-800",
};

function RecentSessionRow({ session }: { session: ISession }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/session/${session._id}`)}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
    >
      <div className="h-8 w-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center shrink-0">
        <IconCode className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{typeof session.problem === "object" && session.problem !== null ? session.problem.title : "Problem"}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {session.createdAt
            ? formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })
            : ""}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-mono border shrink-0",
          typeof session.problem === "object" && session.problem !== null
            ? DIFF[session.problem.difficulty as keyof typeof DIFF]
            : undefined
        )}
      >
        {typeof session.problem === "object" && session.problem !== null
          ? session.problem.difficulty
          : ""}
      </Badge>
      <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

export default RecentSessionRow;