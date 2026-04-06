"use client";;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { IconCircle, IconRotate, IconSearch } from "@tabler/icons-react";
import { api } from "@/lib/api";
import { IProblem } from "@/types/model";

// ── API ──────────────────────────────────────────────────────────────────────
interface FetchProblemsArgs {
  page: number;
  limit: number;
  difficulty?: string;
  tag?: string;
  search?: string;
}
async function fetchProblems({ page, limit, difficulty, tag, search }: FetchProblemsArgs) {
  const params: Record<string, string | number> = { page, limit };
  if (difficulty && difficulty !== "all") params.difficulty = difficulty;
  if (tag && tag !== "all") params.tag = tag;
  if (search) params.search = search;

  try {
    const res = await api.get("/problems", { params });
    return res.data.data;
  } catch (error) {
    throw new Error("Failed to fetch problems");
  }
}

// ── Constants ─────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  easy:   { label: "Easy",   className: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800" },
  medium: { label: "Medium", className: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800" },
  hard:   { label: "Hard",   className: "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800" },
} as const;

type Difficulty = keyof typeof DIFFICULTY_CONFIG;

const POPULAR_TAGS = [
  "all", "array", "hash-map", "string", "stack", "linked-list",
  "tree", "binary-search", "recursion", "javascript", "promises",
  "design", "dfs", "bfs",
];

const LIMITS = [10, 20, 50];


// ── Types ────────────────────────────────────────────────────────────────
interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const isDifficulty = (d: string): d is Difficulty => ["easy", "medium", "hard"].includes(d);
  if (!isDifficulty(difficulty)) return null;
  const config = DIFFICULTY_CONFIG[difficulty];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <Badge variant="secondary" className="text-xs font-mono">
      {tag}
    </Badge>
  );
}

function SkeletonRows({ count = 10 }: { count?: number }) {
  return Array.from({ length: count }).map((_, i) => (
    <TableRow key={i}>
      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    </TableRow>
  ));
}

interface PaginationBarProps {
  pagination: Pagination;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}
function PaginationBar({ pagination, page, setPage }: PaginationBarProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { totalPages, hasPrev, hasNext } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => hasPrev && setPage((p) => p - 1)}
            className={!hasPrev ? "pointer-events-none opacity-40" : "cursor-pointer"}
          />
        </PaginationItem>

        {getPageNumbers().map((p, i) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={() => typeof p === "number" && setPage(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => hasNext && setPage((p) => p + 1)}
            className={!hasNext ? "pointer-events-none opacity-40" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ProblemsPage() {
  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(10);
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag]               = useState("all");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");

  const resetFilters = () => {
    setDifficulty("all");
    setTag("all");
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const hasActiveFilters = difficulty !== "all" || tag !== "all" || search !== "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["problems", page, limit, difficulty, tag, search],
    queryFn: () => fetchProblems({ page, limit, difficulty, tag, search }),
    placeholderData: (prev) => prev, // keep previous data while fetching (like keepPreviousData)
  });

  const problems   = data?.problems   ?? [];
  const pagination: Pagination | null = data?.pagination ?? null;

  const startIndex = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endIndex   = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Problems</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination
              ? `${pagination.total} problems available`
              : "Browse and solve coding challenges"}
          </p>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  setPage(1);
                }
              }}
              className="pl-9"
            />
          </div>

<div className="flex gap-2 items-center">

          {/* Difficulty */}
          <Select
            value={difficulty}
            onValueChange={(v) => { setDifficulty(v); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag */}
          <Select
            value={tag}
            onValueChange={(v) => { setTag(v); setPage(1); }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_TAGS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All tags" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
</div>

          {/* Reset */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={resetFilters} className="shrink-0">
              <IconRotate className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {difficulty !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {difficulty}
                <button onClick={() => { setDifficulty("all"); setPage(1); }} className="ml-1 hover:text-foreground text-muted-foreground">×</button>
              </Badge>
            )}
            {tag !== "all" && (
              <Badge variant="secondary" className="gap-1 font-mono">
                {tag}
                <button onClick={() => { setTag("all"); setPage(1); }} className="ml-1 hover:text-foreground text-muted-foreground">×</button>
              </Badge>
            )}
            {search && (
              <Badge variant="secondary" className="gap-1">
                "{search}"
                <button onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="ml-1 hover:text-foreground text-muted-foreground">×</button>
              </Badge>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error?.message ?? "Something went wrong. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* ── Table ── */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-xs">#</TableHead>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs w-24">Difficulty</TableHead>
                <TableHead className="text-xs">Tags</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <SkeletonRows count={limit} />
              ) : problems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <IconCircle className="h-8 w-8 opacity-20" />
                      <p className="text-sm">No problems found</p>
                      {hasActiveFilters && (
                        <Button variant="link" size="sm" onClick={resetFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                problems.map((problem: IProblem, idx: number) => (
                  <TableRow
                    key={problem.slug}
                    className="cursor-pointer group"
                    onClick={() => window.location.href = `/problems/${problem.slug}`}
                  >
                    {/* Index */}
                    <TableCell className="text-muted-foreground text-sm font-mono">
                      {startIndex + idx}
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">
                          {problem.title}
                        </span>
                      </div>
                    </TableCell>

                    {/* Difficulty */}
                    <TableCell>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </TableCell>

                    {/* Tags */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 3).map((t: string) => (
                          <TagBadge key={t} tag={t} />
                        ))}
                        {problem.tags?.length > 3 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{problem.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer: pagination + per-page ── */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Result count */}
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            {pagination && !isLoading
              ? `Showing ${startIndex}–${endIndex} of ${pagination.total} problems`
              : ""}
          </p>

          {/* Pagination */}
          <div className="order-1 sm:order-2">
            {pagination && (
              <PaginationBar
                pagination={pagination}
                page={page}
                setPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              />
            )}
          </div>

          {/* Per page */}
          <div className="flex items-center gap-2 order-3 text-xs text-muted-foreground">
            <span>Rows</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}
            >
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMITS.map((l) => (
                  <SelectItem key={l} value={String(l)} className="text-xs">
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}