"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconUsers,
  IconClock,
  IconCode,
  IconArrowRight,
  IconActivity,
  IconHistory,
  IconSearch,
  IconLoader,
  IconVideo,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ── Types ─────────────────────────────────────────────────────────────────
interface Session {
  _id: string;
  callId: string;
  status: "active" | "completed";
  host: { name: string; email: string; image: string; clerkId: string };
  participant?: { name: string; image: string };
  problem: { title: string; slug: string; difficulty: string; tags?: string[] };
  createdAt: string;
}

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

// ── API fns ───────────────────────────────────────────────────────────────
const fetchActiveSessions = async (): Promise<Session[]> => {
  const { data } = await api.get("/sessions/active");
  return data.data;
};

const fetchRecentSessions = async (): Promise<Session[]> => {
  const { data } = await api.get("/sessions/my-recent");
  return data.data;
};

const fetchProblems = async (): Promise<Problem[]> => {
  const { data } = await api.get("/problems", { params: { limit: 50 } });
  return data.data.problems;
};

const createSession = async (problemId: string) => {
  const { data } = await api.post("/sessions", { problemId });
  return data.data;
};

const joinSession = async (id: string) => {
  const { data } = await api.post(`/sessions/${id}/join`);
  return data.data;
};

// ── Difficulty config ─────────────────────────────────────────────────────
const DIFF = {
  easy: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  medium: "text-amber-400 bg-amber-950/60 border-amber-800",
  hard: "text-rose-400 bg-rose-950/60 border-rose-800",
};

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: any;
  accent: string;
}) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-5 overflow-hidden group hover:border-border/80 transition-colors">
      <div
        className={cn(
          "absolute top-0 left-0 h-0.5 w-full opacity-60",
          accent
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            "p-2 rounded-lg border",
            "bg-muted/40 border-border text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

// ── Active Session Card ───────────────────────────────────────────────────
function ActiveSessionCard({
  session,
  onJoin,
  isJoining,
}: {
  session: Session;
  onJoin: (id: string) => void;
  isJoining: boolean;
}) {
  const spotsLeft = session.participant ? 0 : 1;

  return (
    <div className="group rounded-xl border border-border bg-card hover:border-primary/40 transition-all duration-200 overflow-hidden">
      {/* top accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="p-5">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={session.host.image}
              alt={session.host.name}
              className="h-7 w-7 rounded-full ring-1 ring-border shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{session.host.name}</p>
              <p className="text-xs text-muted-foreground font-mono">host</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">live</span>
          </div>
        </div>

        {/* problem */}
        <p className="text-sm font-semibold mb-2 leading-snug line-clamp-1">
          {session.problem.title}
        </p>

        {/* tags row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono border",
              DIFF[session.problem.difficulty as keyof typeof DIFF]
            )}
          >
            {session.problem.difficulty}
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
            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
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

// ── Recent Session Row ────────────────────────────────────────────────────
function RecentSessionRow({ session }: { session: Session }) {
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
        <p className="text-sm font-medium truncate">{session.problem.title}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-mono border shrink-0",
          DIFF[session.problem.difficulty as keyof typeof DIFF]
        )}
      >
        {session.problem.difficulty}
      </Badge>
      <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

// ── Create Session Dialog ─────────────────────────────────────────────────
function CreateSessionDialog({
  open,
  onOpenChange,
  onCreate,
  isCreating,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (problemId: string) => void;
  isCreating: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: problems = [], isLoading } = useQuery({
    queryKey: ["problems-list"],
    queryFn: fetchProblems,
    staleTime: Infinity,
    enabled: open,
  });

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle className="text-base font-semibold">
            New Interview Session
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a problem to practice with your peer
          </p>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 py-3 border-b">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 focus-within:border-primary/50 transition-colors">
            <IconSearch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Problem list */}
        <div className="overflow-y-auto max-h-72">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No problems found
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filtered.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelected(p._id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    selected === p._id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    {p.tags?.length > 0 && (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {p.tags.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-mono border shrink-0",
                      DIFF[p.difficulty]
                    )}
                  >
                    {p.difficulty}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {selected
              ? `Selected: ${problems.find((p) => p._id === selected)?.title}`
              : "No problem selected"}
          </span>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={!selected || isCreating}
            onClick={() => selected && onCreate(selected)}
          >
            {isCreating ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconPlus className="h-3.5 w-3.5" />
            )}
            Create Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: activeSessions = [], isLoading: activeLoading } = useQuery({
    queryKey: ["active-sessions"],
    queryFn: fetchActiveSessions,
    refetchInterval: 15_000, // poll every 15s
  });

  const { data: recentSessions = [], isLoading: recentLoading } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: fetchRecentSessions,
  });

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (session) => {
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      router.push(`/session/${session._id}`);
    },
  });

  const joinMutation = useMutation({
    mutationFn: joinSession,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      router.push(`/session/${id}`);
    },
    onSettled: () => setJoiningId(null),
  });

  const handleJoin = (id: string) => {
    setJoiningId(id);
    joinMutation.mutate(id);
  };

  const stats = [
    {
      label: "Active Now",
      value: activeLoading ? "—" : activeSessions.length,
      icon: IconActivity,
      accent: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    },
    {
      label: "Past Sessions",
      value: recentLoading ? "—" : recentSessions.length,
      icon: IconHistory,
      accent: "bg-gradient-to-r from-blue-500 to-blue-400",
    },
    {
      label: "Problems",
      value: "50+",
      icon: IconCode,
      accent: "bg-gradient-to-r from-violet-500 to-violet-400",
    },
    {
      label: "Peers Online",
      value: activeLoading
        ? "—"
        : activeSessions.reduce(
            (acc, s) => acc + 1 + (s.participant ? 1 : 0),
            0
          ),
      icon: IconUsers,
      accent: "bg-gradient-to-r from-amber-500 to-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded border border-primary/40 bg-primary/10 flex items-center justify-center">
              <IconCode className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-black text-sm tracking-tight">
              RemoteInterview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 hidden sm:flex"
              onClick={() => setCreateOpen(true)}
            >
              <IconPlus className="h-3.5 w-3.5" />
              New Session
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Hero row ── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Practice coding interviews with peers in real time.
            </p>
          </div>
          <Button
            className="h-9 text-sm gap-2 sm:hidden shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <IconPlus className="h-4 w-4" />
            New
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Active sessions — wider col */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Sessions
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {activeSessions.length} live
              </span>
            </div>

            {activeLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-xl" />
                ))}
              </div>
            ) : activeSessions.length === 0 ? (
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
                  onClick={() => setCreateOpen(true)}
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  Create Session
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSessions.map((s) => (
                  <ActiveSessionCard
                    key={s._id}
                    session={s}
                    onJoin={handleJoin}
                    isJoining={joiningId === s._id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent sessions — narrower col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <IconHistory className="h-3.5 w-3.5 text-muted-foreground" />
                Recent Sessions
              </h2>
              <span className="text-xs font-mono text-muted-foreground">
                {recentSessions.length} total
              </span>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {recentLoading ? (
                <div className="p-3 space-y-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="py-12 text-center">
                  <IconClock className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No past sessions yet
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {recentSessions.slice(0, 8).map((s) => (
                    <RecentSessionRow key={s._id} session={s} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Create Dialog ── */}
      <CreateSessionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={(problemId) => createMutation.mutate(problemId)}
        isCreating={createMutation.isPending}
      />
    </div>
  );
}