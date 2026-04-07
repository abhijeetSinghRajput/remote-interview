"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IProblem } from "@/types/model";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { IconLoader, IconPlus, IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { fetchProblemList } from "@/services/problem.service";
import { Skeleton } from "../ui/skeleton";

const DIFF = {
  easy: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
  medium: "text-amber-400 bg-amber-950/60 border-amber-800",
  hard: "text-rose-400 bg-rose-950/60 border-rose-800",
};

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
    queryFn: () => fetchProblemList({ page: 1, limit: 10 }),
    staleTime: Infinity,
    enabled: open,
  });

  const filtered = problems.filter((p: IProblem) =>
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
              {filtered.map((p: IProblem) => (
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
                      DIFF[p.difficulty as keyof typeof DIFF]
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
              ? `Selected: ${problems.find((p: IProblem) => p._id === selected)?.title}`
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

export default CreateSessionDialog;