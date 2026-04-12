"use client";;
import { useState } from "react";
import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { IconSearch, IconLayoutList, IconExternalLink } from "@tabler/icons-react";
import { ProblemItem } from "@/types/problem";

interface ProblemListSheetProps {
  currentSlug?: string; // highlights active problem
  problems: ProblemItem[];
  isLoading: boolean;
}


// ── Config ────────────────────────────────────────────────────────────────
const DIFF = {
  Easy: { label: "Easy", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  Medium: { label: "Medium", dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  Hard: { label: "Hard", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

// ── Skeleton ──────────────────────────────────────────────────────────────
function ListSkeleton() {
  return (
    <div className="space-y-1 p-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="h-3 w-3 rounded-full shrink-0" />
          <Skeleton className="h-4" style={{ width: `${50 + (i % 5) * 8}%` }} />
          <Skeleton className="h-3 w-8 ml-auto shrink-0" />
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function ProblemListSheet({ currentSlug, problems, isLoading }: ProblemListSheetProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const counts = {
    Easy: problems.filter((p) => p.difficulty === "Easy").length,
    Medium: problems.filter((p) => p.difficulty === "Medium").length,
    Hard: problems.filter((p) => p.difficulty === "Hard").length,
  };

  return (
    <div className="flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <IconLayoutList className="size-3.5" />
            Problem List
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <SheetTitle className="text-sm pr-8 font-semibold flex items-center justify-between">
              <span>All Problems</span>
              {!isLoading && (
                <span className="text-xs font-normal text-muted-foreground">
                  {problems.length} total
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Search */}
          <div className="px-3 py-2 border-b shrink-0">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b shrink-0">
            {(["All", "Easy", "Medium", "Hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full border transition-colors",
                  diffFilter === d
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                )}
              >
                {d === "All" ? (
                  "All"
                ) : (
                  <span className="flex items-center gap-1">
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                    <span className="opacity-60">{counts[d]}</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <ScrollArea className="flex-1 min-h-0">
            {isLoading ? (
              <ListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <p className="text-sm">No problems found</p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs underline underline-offset-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filtered.map((p) => {
                  const cfg = DIFF[p.difficulty];
                  const isActive = p.titleSlug === currentSlug;

                  return (
                    <Link
                      key={p.titleSlug}
                      href={`/problems/${p.titleSlug}`}
                      onClick={() => setOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 transition-colors group",
                          isActive ? "bg-accent" : "hover:bg-muted/60"
                        )}
                      >
                        {/* Index */}
                        <span className="text-[11px] text-muted-foreground font-mono w-5 text-right shrink-0">
                          {p.questionFrontendId}
                        </span>

                        {/* Difficulty dot */}
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />

                        {/* Title */}
                        <span
                          className={cn(
                            "text-xs flex-1 truncate leading-snug",
                            isActive
                              ? "font-medium text-foreground"
                              : "text-muted-foreground group-hover:text-foreground transition-colors"
                          )}
                        >
                          {p.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t shrink-0">
              <p className="text-[10px] text-muted-foreground">
                {filtered.length === problems.length
                  ? `${problems.length} problems`
                  : `${filtered.length} of ${problems.length} problems`}
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Button 
        variant="outline" 
        size="icon" 
        asChild
      >
        <Link href="/problems" className="flex items-center gap-1">
          <IconExternalLink />
        </Link>
      </Button>
    </div>
  );
}