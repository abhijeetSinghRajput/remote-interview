"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProblemListItem } from "@/types/problem";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { IconLoader, IconPlus, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { fetchProblemList } from "@/services/problem.service";
import { Skeleton } from "../ui/skeleton";

const DIFF = {
  Easy: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  Medium: "text-amber-400 bg-amber-950/60 border-amber-800",
  Hard: "text-rose-400 bg-rose-950/60 border-rose-800",
} as const;

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

  const { data, isLoading } = useQuery({
    queryKey: ["problems-list-for-session"],
    queryFn: () => fetchProblemList({ skip: 0, limit: 10 }),
    staleTime: Infinity,
    enabled: open,
  });

  const problems: ProblemListItem[] = data?.problems ?? [];

  const filtered = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-5 pb-4 pt-5">
          <DialogTitle className="text-base font-semibold">
            New Interview Session
          </DialogTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a problem to practice with your peer
          </p>
        </DialogHeader>

        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 transition-colors focus-within:border-primary/50">
            <IconSearch className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No problems found
            </div>
          ) : (
            <div className="space-y-0.5 p-2">
              {filtered.map((p) => (
                <button
                  key={p.titleSlug}
                  onClick={() => setSelected(p.titleSlug)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    selected === p.titleSlug
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    {p.topicTags.length > 0 ? (
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {p.topicTags.slice(0, 3).map((tag) => tag.name).join(" · ")}
                      </p>
                    ) : null}
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0 border text-xs font-mono",
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

        <div className="flex items-center justify-between gap-3 border-t px-5 py-4">
          <span className="font-mono text-xs text-muted-foreground">
            {selected
              ? `Selected: ${problems.find((p) => p.titleSlug === selected)?.title ?? ""}`
              : "No problem selected"}
          </span>

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={!selected || isCreating}
            onClick={() => {
              const chosen = problems.find((p) => p.titleSlug === selected);
              if (chosen) onCreate(chosen.titleSlug);
            }}
          >
            {isCreating ? (
              <IconLoader className="size-3.5 animate-spin" />
            ) : (
              <IconPlus className="size-3.5" />
            )}
            Create Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSessionDialog;