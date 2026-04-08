"use client";;
import  "@/app/styles/rich-text.css";

import { useEffect, useState } from "react";
import type { IProblem } from "@/types/model";
import { marked } from "marked";

import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { IconTag } from "@tabler/icons-react";
import rehypeHighlight from "rehype-highlight";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import ProblemPanelSkeleton from "@/components/skeleton/problem-panel-skeleton";
import HintsTabs from "@/components/problem/hint-tabs";

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
      const raw = isHTML ? content : String(await marked.parse(content));

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

interface ProblemPanelProps {
  problem: IProblem | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export default function ProblemPanel({ 
  problem, 
  isLoading, 
  isError, 
  error 
}: ProblemPanelProps) {

  if (isLoading) return <ProblemPanelSkeleton />;

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
            <HintsTabs hints={problem.hints} />
        </div>
    </div>
  );
}