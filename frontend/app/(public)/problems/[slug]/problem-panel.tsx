"use client";

import "@/app/styles/rich-text.css";
import { useEffect, useState } from "react";
import type { ProblemDetail } from "@/types/problem";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { IconTag } from "@tabler/icons-react";
import ProblemPanelSkeleton from "@/components/skeleton/problem-panel-skeleton";
import HintsTabs from "@/components/problem/hint-tabs";
import SimilarQuestions from "@/components/problem/similar-questions";
import { cn } from "@/lib/utils";

// ── Difficulty config ─────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  Easy: {
    label: "Easy",
    className:
      "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800",
  },
  Medium: {
    label: "Medium",
    className:
      "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800",
  },
  Hard: {
    label: "Hard",
    className:
      "text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-800",
  },
} as const;

// ── Rich-text renderer ────────────────────────────────────────────────────────

function RichTextRenderer({ content }: { content: string }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!content) {
      setHtml("");
      return;
    }

    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(content)
      .then((file) => setHtml(String(file)));
  }, [content]);

  if (!html) return null;

  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProblemPanelProps {
  problem: ProblemDetail | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ProblemPanel({
  problem,
  isLoading,
  isError,
  error,
  onRetry,
}: ProblemPanelProps) {
  if (isLoading) return <ProblemPanelSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col gap-4 p-5">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message ?? "Failed to load problem."}
          </AlertDescription>
        </Alert>

        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!problem) return null;

  const diffConfig =
    problem.difficulty ? DIFFICULTY_CONFIG[problem.difficulty] : undefined;

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-10 shrink-0 bg-card px-5 pb-4 pt-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold leading-snug">
            {problem.questionFrontendId ? (
              <span className="mr-2 font-mono text-sm text-muted-foreground">
                {problem.questionFrontendId}.
              </span>
            ) : null}
            {problem.title}
          </h2>

          {diffConfig ? (
            <Badge
              variant="outline"
              className={cn("shrink-0 text-xs font-medium", diffConfig.className)}
            >
              {diffConfig.label}
            </Badge>
          ) : null}
        </div>

        {problem.topicTags && problem.topicTags.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <IconTag className="h-3 w-3 text-muted-foreground" />
            {problem.topicTags.map((tag) => (
              <Badge key={tag.slug} variant="secondary" className="font-mono text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <RichTextRenderer content={problem.content || problem.description || ""} />

        {problem.constraints && problem.constraints.length > 0 ? (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Constraints</p>
            <ul className="space-y-1 pl-4">
              {problem.constraints.map((c, i) => (
                <li
                  key={i}
                  className="font-mono text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: c }}
                />
              ))}
            </ul>
          </div>
        ) : null}

        {problem.hints && problem.hints.length > 0 ? (
          <HintsTabs hints={problem.hints} className="py-8" />
        ) : null}

        {problem.similarQuestions && problem.similarQuestions.length > 0 ? (
          <SimilarQuestions questions={problem.similarQuestions} />
        ) : null}
      </div>
    </div>
  );
}
