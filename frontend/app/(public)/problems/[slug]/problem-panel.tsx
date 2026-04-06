"use client";;
import  "@/app/styles/rich-text.css";

import { useEffect, useState } from "react";
import type { IProblem } from "@/types/model";
import { useQuery } from "@tanstack/react-query";
import { marked } from "marked";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { IconChevronDown, IconTag } from "@tabler/icons-react";
import rehypeHighlight from "rehype-highlight";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import {api} from "@/lib/api";


// ── API ──────────────────────────────────────────────────────────────────────
async function fetchProblem(slug: string): Promise<IProblem> {
    try{
        const res = await api.get(`/problems/${slug}`);
        return res.data.data.problem;
    } catch(error: any) {
        throw new Error(error.response?.data?.message || `Problem ${slug} not found`);
    }
}

// ── Difficulty config ─────────────────────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy: {
    label: "Easy",
    className:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  },
  medium: {
    label: "Medium",
    className:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
  },
  hard: {
    label: "Hard",
    className:
      "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800",
  },
};

// ── Tiptap read-only renderer ─────────────────────────────────────────────
function RichTextRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!content) return;

    async function process() {
      const isHTML = /<[a-z][\s\S]*>/i.test(content);
      let raw = isHTML ? content : String(await marked.parse(content));

      const file = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(raw);

      setHtml(String(file));
    }

    process();
  }, [content]);

  if (!html) return null;

  return (
    <div
      className="rich-text"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function PanelSkeleton() {
  return (
    <div className="flex flex-col h-full p-5 gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Separator />
      <div className="space-y-3 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-20 w-full rounded-md mt-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ── Hints tab ─────────────────────────────────────────────────────────────
function HintsTab({ hints }: { hints: string[] }) {
  if (!hints?.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No hints available.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {hints.map((hint: string, i: number) => (
        <Collapsible key={i}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between py-3 text-sm text-left">
              <span className="font-semibold">Hint {i + 1}</span>
              <IconChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent
            className="
              overflow-hidden
              transition-all
              duration-300
              data-[state=closed]:animate-collapsible-up
              data-[state=open]:animate-collapsible-down
            "
          >
            <div className="py-3 text-sm text-muted-foreground">
              {hint}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────
export default function ProblemPanel({ problemSlug }: { problemSlug: string }) {
  const { data: problem, isLoading, isError, error } = useQuery({
    queryKey: ["problem", problemSlug],
    queryFn: () => fetchProblem(problemSlug),
    enabled: !!problemSlug,
    staleTime: 5 * 60_000, // 5 min — problem content rarely changes
  });

  if (isLoading) return <PanelSkeleton />;

  if (isError) {
    return (
      <div className="p-5">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message ?? "Failed to load problem."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!problem) return null;

  const diffConfig = DIFFICULTY_CONFIG[problem.difficulty as keyof typeof DIFFICULTY_CONFIG];

  return (
    <div className="flex bg-card flex-col h-full max-h-full overflow-y-auto rounded-none md:rounded-lg overflow-hidden">
      {/* ── Problem header ── */}
      <div className="px-5 pt-5 pb-4 shrink-0 sticky top-0 bg-muted z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-base font-semibold leading-snug">{problem.title}</h2>
          {diffConfig && (
            <Badge
              variant="outline"
              className={`shrink-0 text-xs font-medium ${diffConfig.className}`}
            >
              {diffConfig.label}
            </Badge>
          )}
        </div>

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <IconTag className="h-3 w-3 text-muted-foreground" />
            {problem.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs font-mono">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

        <div className="px-5 py-4">
            <RichTextRenderer content={problem.description} />
            <HintsTab hints={problem.hints} />
        </div>
    </div>
  );
}