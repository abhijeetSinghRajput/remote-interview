"use client";
import "@/app/styles/rich-text.css";

import { useEffect } from "react";
import type { IProblem, ITestCase } from "@/types/model";
import { useQuery } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IconBulb, IconChevronDown, IconTag } from "@tabler/icons-react";

// ── API ──────────────────────────────────────────────────────────────────────
async function fetchProblem(id: string): Promise<IProblem> {
  const res = await fetch(`http://localhost:5000/api/problems/${id}`);
  if (!res.ok) throw new Error("Problem not found");
  const json = await res.json();
  return json.data.problem;
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
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor || !content) return;

    // content can be stored as HTML (from tiptap) or markdown
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    const html = isHTML ? content : marked.parse(content);
    editor.commands.setContent(html);
  }, [editor, content]);

  if (!editor) return null;

  return (
    <EditorContent
      editor={editor}
      className="rich-text"
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
    <div className="divide-y border-t">
      {hints.map((hint: string, i: number) => (
        <Collapsible key={i}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between px-4 py-3 text-sm text-left">
              <span>Hint {i + 1}</span>
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
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {hint}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

// ── Test cases tab ────────────────────────────────────────────────────────
function TestCasesTab({ testCases }: { testCases: ITestCase[] }) {
  const visible = testCases?.filter((tc: ITestCase) => !tc.isHidden) ?? [];

  if (!visible.length) {
    return (
      <p className="text-sm text-muted-foreground p-5">No visible test cases.</p>
    );
  }

  return (
    <div className="space-y-3 p-5">
      {visible.map((tc: ITestCase, i: number) => (
        <div key={i} className="rounded-md border bg-muted/30 overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">
              Case {i + 1}
            </span>
          </div>
          <div className="p-3 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Input</p>
              <pre className="text-xs font-mono bg-background rounded p-2 border overflow-x-auto">
                {tc.input}
              </pre>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Output</p>
              <pre className="text-xs font-mono bg-background rounded p-2 border overflow-x-auto">
                {tc.output}
              </pre>
            </div>
            {tc.explanation && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Explanation</p>
                <p className="text-xs text-foreground">{tc.explanation}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────
export default function ProblemPanel({ problemId }: { problemId: string }) {
  const { data: problem, isLoading, isError, error } = useQuery({
    queryKey: ["problem", problemId],
    queryFn: () => fetchProblem(problemId),
    enabled: !!problemId,
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
    <div className="flex bg-card flex-col h-full max-h-full overflow-y-auto rounded-lg overflow-hidden">
      {/* ── Problem header ── */}
      <div className="px-5 pt-5 pb-4 shrink-0">
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

      {/* ── Tabs ── */}
      <Tabs defaultValue="description" className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-5 gap-1 shrink-0">
          <TabsTrigger
            value="description"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm h-full"
          >
            Description
          </TabsTrigger>
          <TabsTrigger
            value="hints"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm h-full"
          >
            Hints
            {problem.hints?.length > 0 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {problem.hints.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Description tab */}
        <TabsContent value="description" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <div className="px-5 py-4">
              <RichTextRenderer content={problem.description} />
            </div>
          </ScrollArea>
        </TabsContent>
        
        {/* Hints tab */}
        <TabsContent value="hints" className="flex-1 min-h-0 mt-0">
          <ScrollArea className="h-full">
            <HintsTab hints={problem.hints} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}