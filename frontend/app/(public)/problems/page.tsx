"use client";

import "@/app/styles/rich-text.css";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";

import type { IProblem, ITestCase } from "@/types/model";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react";
import { api } from "@/lib/api";

// ───────────────── API ─────────────────
async function fetchProblemBySlug(slug: string): Promise<IProblem> {
  try {
    const res = await api.get(`/problems/${slug}`);
    return res.data.data.problem;
  } catch (error) {
    throw new Error("Failed to fetch problem");
  }
}

async function fetchProblems(params: any) {
  try {
    const res = await api.get("/problems", { params });
    return res.data.data;
  } catch (error) {
    throw new Error("Failed to fetch problems");
  }
}

// ───────────── Difficulty ─────────────
const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", className: "text-emerald-500" },
  medium: { label: "Medium", className: "text-amber-500" },
  hard: { label: "Hard", className: "text-rose-500" },
};

// ───────────── Rich Text ─────────────
function RichTextRenderer({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || !content) return;
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    const html = isHTML ? content : marked.parse(content);
    editor.commands.setContent(html);
  }, [editor, content]);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}

// ───────────── Navigation Hook ─────────────
function useProblemNavigation(currentSlug: string, params: any) {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["problems", params],
    queryFn: () => fetchProblems(params),
  });

  const { prev, next } = useMemo(() => {
    if (!data?.problems) return { prev: null, next: null };

    const index = data.problems.findIndex(
      (p: IProblem) => p.slug === currentSlug
    );

    return {
      prev: data.problems[index - 1] || null,
      next: data.problems[index + 1] || null,
    };
  }, [data, currentSlug]);

  return {
    prev,
    next,
    goTo: (slug: string) => router.push(`/problems/${slug}`),
  };
}

// ───────────── Hints ─────────────
function HintsInline({ hints }: { hints: string[] }) {
  if (!hints?.length) return null;

  return (
    <div className="border-t">
      <div className="px-5 py-3 text-xs uppercase text-muted-foreground">
        Hints
      </div>

      <div className="divide-y">
        {hints.map((hint, i) => (
          <Collapsible key={i}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex justify-between px-5 py-3 text-sm">
                Hint {i + 1}
                <IconChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
              <div className="px-5 pb-4 text-sm text-muted-foreground">
                {hint}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}

// ───────────── MAIN ─────────────
export default function ProblemPanel({
  slug,
  params,
}: {
  slug: string;
  params: any;
}) {
  const { data: problem } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblemBySlug(slug),
  });

  const { prev, next, goTo } = useProblemNavigation(slug, params);

  if (!problem) return null;

  const diff =
    DIFFICULTY_CONFIG[
      problem.difficulty as keyof typeof DIFFICULTY_CONFIG
    ];

  return (
    <div className="flex flex-col h-full bg-background">

      {/* HEADER */}
      <div className="px-5 py-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-base font-semibold">{problem.title}</h1>

          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={diff.className}>
              {diff.label}
            </Badge>

            {problem.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* NAV */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!prev}
            onClick={() => prev && goTo(prev.slug)}
          >
            <IconChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!next}
            onClick={() => next && goTo(next.slug)}
          >
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CONTENT */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto">

          {/* DESCRIPTION */}
          <div className="px-5 py-6">
            <RichTextRenderer content={problem.description} />
          </div>

          <Separator />

          {/* HINTS */}
          <HintsInline hints={problem.hints} />

          <Separator />

          {/* TEST CASES */}
          <div className="px-5 py-5">
            <div className="text-xs uppercase text-muted-foreground mb-3">
              Test Cases
            </div>

            <div className="space-y-3">
              {problem.testCases
                .filter((tc: ITestCase) => !tc.isHidden)
                .map((tc: ITestCase, i: number) => (
                  <div key={i} className="border p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Input</p>
                    <pre className="text-xs">{tc.input}</pre>

                    <p className="text-xs text-muted-foreground mt-2">
                      Output
                    </p>
                    <pre className="text-xs">{tc.output}</pre>

                    {tc.explanation && (
                      <p className="text-xs mt-2 text-muted-foreground">
                        {tc.explanation}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}