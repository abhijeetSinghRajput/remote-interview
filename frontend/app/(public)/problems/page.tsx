"use client";;
import { useState, useRef, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProblemList } from "@/services/problem.service";
import { IconArrowDown, IconLoader, IconLockFilled, IconSearch, IconX } from "@tabler/icons-react";
import { ProblemItem } from "@/types/problem";
import FilterPopover from "@/components/problem/filter-popover";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 100;

const DIFFICULTY_MAP = {
  Easy: "text-emerald-500",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
} as const;

const ALL_TAGS = [
  "array", "string", "hash-table", "dynamic-programming", "math",
  "sorting", "greedy", "depth-first-search", "binary-search",
  "breadth-first-search", "tree", "matrix", "two-pointers",
  "binary-tree", "bit-manipulation", "heap-priority-queue",
  "stack", "graph", "prefix-sum", "simulation", "sliding-window",
  "backtracking", "linked-list", "divide-and-conquer", "union-find",
  "trie", "recursion", "monotonic-stack", "queue",
];

// ─── Difficulty Badge ─────────────────────────────────────────────────────────

function DiffBadge({ d }: { d: string }) {
  const color = DIFFICULTY_MAP[d as keyof typeof DIFFICULTY_MAP] ?? "text-muted-foreground";
  return <span className={cn("text-xs font-medium tabular-nums", color)}>{d}</span>;
}

// ─── Row item ─────────────────────────────────────────────────────────────────

const ROW_HEIGHT = 44;

function ProblemRow({
  problem,
  index,
  style,
  onClick,
}: {
  problem: ProblemItem;
  index: number;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  return (
    <div
      style={style}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-4 cursor-pointer select-none",
        "border-b border-border/50 transition-colors duration-100",
        "hover:bg-muted/60 group",
        index % 2 === 0 ? "bg-background" : "bg-muted/20"
      )}
    >
      {/* # */}
      <div className="flex gap-1">
        <div className="w-5 shrink-0 flex items-center justify-center">
          {problem.isPaidOnly ? (
            <IconLockFilled className="size-4 text-amber-600" />
          ) : null}
        </div>
        <span className="w-7 shrink-0 text-xs text-muted-foreground/60 font-mono text-right">
          {problem.questionFrontendId}
        </span>
      </div>

      {/* Title */}
      <span className="flex-1 text-sm font-medium truncate group-hover:text-primary transition-colors">
        {problem.title}
      </span>

      {/* Tags — first 2 only */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {problem.topicTags.slice(0, 2).map((t) => (
          <span
            key={t.slug}
            className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
          >
            {t.name}
          </span>
        ))}
        {problem.topicTags.length > 2 && (
          <span className="text-[10px] text-muted-foreground/50">
            +{problem.topicTags.length - 2}
          </span>
        )}
      </div>

      {/* Difficulty */}
      <div className="w-16 text-right shrink-0">
        <DiffBadge d={problem.difficulty} />
      </div>
    </div>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRow({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style} className="flex items-center gap-4 pl-2 pr-4 border-b border-border/50">
      <Skeleton className="h-3 w-8 shrink-0" />
      <Skeleton className="h-3 flex-1 max-w-xs" />
      <Skeleton className="h-3 w-24 hidden sm:block" />
      <Skeleton className="h-3 w-12 shrink-0" />
    </div>
  );
}


// ─── Active filter pills ──────────────────────────────────────────────────────

function ActivePills({
  filters,
  onRemove,
}: {
  filters: Filters;
  onRemove: (key: keyof Filters) => void;
}) {
  const pills = [
    filters.difficulty !== "all" && { key: "difficulty" as const, label: filters.difficulty },
    filters.tag !== "all" && { key: "tag" as const, label: filters.tag },
    filters.search && { key: "search" as const, label: `"${filters.search}"` },
  ].filter(Boolean) as { key: keyof Filters; label: string }[];

  if (!pills.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pills.map(({ key, label }) => (
        <Badge
          key={key}
          variant="secondary"
          className="gap-1 pl-2.5 pr-1.5 py-0.5 text-xs font-mono rounded-full"
        >
          {label}
          <button
            onClick={() => onRemove(key)}
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 transition-colors"
          >
            <IconX className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

// ─── Load More Button (appears on scroll) ─────────────────────────────────────

function LoadMoreButton({
  visible,
  loading,
  hasMore,
  onClick,
}: {
  visible: boolean;
  loading: boolean;
  hasMore: boolean;
  onClick: () => void;
}) {
  if (!hasMore) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <Button
        onClick={onClick}
        disabled={loading}
        className="gap-2 shadow-lg rounded-full px-5 h-10"
      >
        {loading
          ? <IconLoader className="h-4 w-4 animate-spin" />
          : <IconArrowDown className="h-4 w-4" />}
        {loading ? "Loading…" : "Load more"}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  const router = useRouter();

  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>({
    difficulty: "all",
    tags: [],
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  // ── Accumulated problems (all loaded batches) ──────────────────────────────
  const [allProblems, setAllProblems] = useState<ProblemItem[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [total, setTotal] = useState<number | null>(null);

  // ── Load-more button visibility (appears after scrolling) ─────────────────
  const [showLoadMore, setShowLoadMore] = useState(false);
  // ── Virtualizer parent ────────────────────────────────────────────────────
  const parentRef = useRef<HTMLDivElement>(null);

  // ── Reset on filter change ─────────────────────────────────────────────────
  const resetList = useCallback((newFilters: Filters) => {
    setAllProblems([]);
    setSkip(0);
    setHasMore(true);
    setTotal(null);
    setFilters(newFilters);
  }, []);

  // ── First/subsequent fetches ───────────────────────────────────────────────
  const queryKey = ["problems", filters, skip];

  const { data, isFetching, isError } = useQuery({
    queryKey,
    queryFn: () =>
      fetchProblemList({
        skip,
        limit: PAGE_SIZE,
        difficulty: filters.difficulty,
        tags: filters.tag,
        search: filters.search,
      }),
    staleTime: 60_000,
  });

  // Append results when data changes
  useEffect(() => {
    if (!data) return;
    setTotal(data.meta.total);
    setHasMore(data.meta.hasMore);
    setAllProblems((prev) =>
      skip === 0 ? data.problems : [...prev, ...data.problems]
    );
    setIsLoadingMore(false);
  }, [data]);

  // ── Virtualizer ───────────────────────────────────────────────────────────
  const rowVirtualizer = useVirtualizer({
    count: allProblems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // ── Show load-more button after scrolling 30% ──────────────────────────────
  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const onScroll = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setShowLoadMore(pct > 0.3 && hasMore);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isFetching) return;
    setIsLoadingMore(true);
    setSkip((s) => s + PAGE_SIZE);
  }, [isLoadingMore, hasMore, isFetching]);

  // ── Filter handlers ────────────────────────────────────────────────────────
  const applyFilters = (partial: Partial<Filters>) => {
    resetList({ ...filters, ...partial });
  };

  const removeFilter = (key: keyof Filters) => {
    const defaults = { difficulty: "all", tags: [], search: "" };
    const next = { ...filters, [key]: defaults[key] };
    if (key === "search") setSearchInput("");
    resetList(next);
  };

  const resetAll = () => {
    setSearchInput("");
    resetList({ difficulty: "all", tags: [], search: "" });
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters({ search: searchInput.trim() });
    }
  };

  const isInitialLoading = isFetching && allProblems.length === 0;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* ── Topbar ── */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur-sm pl-2 pr-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search questions…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-9 h-9 text-sm"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); if (filters.search) applyFilters({ search: "" }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter panel */}
          <FilterPopover
            filters={filters}
            onApply={(f) => applyFilters(f)}
            onReset={resetAll}
          />

          {/* Total count */}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums hidden sm:block">
            {total !== null ? `${total.toLocaleString()} problems` : ""}
          </span>
        </div>

        {/* Active pills */}
        {(filters.difficulty !== "all" || filters.tag !== "all" || filters.search) && (
          <div className="max-w-5xl mx-auto mt-2">
            <ActivePills filters={filters} onRemove={removeFilter} />
          </div>
        )}
      </div>
      {/* ── Column header ── */}
      <div className="shrink-0 border-b bg-muted/30 pl-2 pr-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4 py-2">
          <span className="w-10 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">#</span>
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Title</span>
          <span className="hidden sm:block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Tags</span>
          <span className="w-16 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Level</span>
        </div>
      </div>
      {/* ── Virtual list ── */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {isInitialLoading ? (
          // Skeleton initial load
          (<div className="max-w-5xl mx-auto">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonRow
                key={i}
                style={{ height: ROW_HEIGHT, display: "flex", alignItems: "center" }}
              />
            ))}
          </div>)
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <p className="text-sm">Failed to load problems</p>
            <Button variant="outline" size="sm" onClick={() => resetList(filters)}>
              Retry
            </Button>
          </div>
        ) : allProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
            <p className="text-sm">No problems found</p>
            <Button variant="link" size="sm" onClick={resetAll}>Clear filters</Button>
          </div>
        ) : (
          /* Virtualizer container */
          (<div
            className="max-w-5xl mx-auto relative"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {virtualItems.map((virtualRow) => {
              const problem = allProblems[virtualRow.index];
              return (
                <ProblemRow
                  key={virtualRow.key}
                  problem={problem}
                  index={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  onClick={() => router.push(`/problems/${problem.titleSlug}`)}
                />
              );
            })}
            {/* Inline loading spinner at bottom while fetching more */}
            {isLoadingMore && (
              <div
                style={{
                  position: "absolute",
                  top: rowVirtualizer.getTotalSize(),
                  left: 0,
                  right: 0,
                }}
                className="flex items-center justify-center py-6"
              >
                <IconLoader className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>)
        )}
      </div>
      {/* ── Status bar ── */}
      <div className="shrink-0 border-t bg-muted/20 pl-2 pr-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {allProblems.length > 0 && total !== null
              ? `Showing ${allProblems.length} of ${total.toLocaleString()} problems`
              : ""}
          </span>
          {hasMore && allProblems.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {total !== null ? `${(total - allProblems.length).toLocaleString()} more available` : ""}
            </span>
          )}
        </div>
      </div>
      {/* ── Floating load-more ── */}
      <LoadMoreButton
        visible={showLoadMore}
        loading={isLoadingMore || isFetching}
        hasMore={hasMore}
        onClick={loadMore}
      />
    </div>
  );
}