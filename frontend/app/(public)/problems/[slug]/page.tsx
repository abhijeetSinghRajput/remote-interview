"use client";

import ProblemPanel from "./problem-panel";
import { useParams } from "next/navigation";
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditorPanel from "./code-editor-panel";
import OutputPanel from "./output-panel";
import ProblemListSheet from "../problem-list-sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useQuery } from "@tanstack/react-query";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { IconFileText, IconCode, IconTerminal2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { fetchProblemDetail, fetchProblemList } from "@/services/problem.service";
import type { IProblemDetail } from "@/types/problem.types";
import type { ProblemItem } from "@/services/problem.service";

// ── Mobile tab config ──────────────────────────────────────────────────────────

const TABS = [
  { id: "problem", label: "Problem", icon: IconFileText },
  { id: "code", label: "Code", icon: IconCode },
  { id: "output", label: "Output", icon: IconTerminal2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProblemDetailPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const [activeTab, setActiveTab] = useState<TabId>("problem");

  // Lightweight list for the sidebar sheet
  const { data: listData, isLoading: problemsLoading } = useQuery({
    queryKey: ["problems-list"],
    queryFn: () => fetchProblemList({ limit: 100, skip: 0 }),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const problems: ProblemItem[] = listData?.problems ?? [];

  // Full problem detail (content, snippets, hints, examples…)
  const {
    data: problem,
    isLoading,
    isError,
    error,
  } = useQuery<IProblemDetail>({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblemDetail(slug),
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });

  const handleRun = async (code: string, language: string): Promise<void> => {
    console.log("Run:", { code, language });
    setActiveTab("output");
  };

  const handleSubmit = async (code: string, language: string): Promise<void> => {
    console.log("Submit:", { code, language });
    setActiveTab("output");
  };

  return (
    <div className="flex h-dvh flex-col">

      {/* ── Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b px-4 py-1.5">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
          >
            R
          </Link>
          <ProblemListSheet
            currentSlug={slug}
            problems={problems}
            isLoading={problemsLoading}
          />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        </div>
      </header>

      {/* ── Desktop: Resizable Panels ── */}
      <div className="hidden flex-1 min-h-0 md:flex">
        <Group orientation="horizontal" className="flex-1 gap-2 p-2">

          {/* Problem panel */}
          <Panel defaultSize={40} minSize={28}>
            <div className="h-full overflow-hidden rounded-lg border">
              <ProblemPanel
                problem={problem ?? null}
                isLoading={isLoading}
                isError={isError}
                error={error as Error | null}
              />
            </div>
          </Panel>

          <Separator className="w-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

          {/* Code + Output */}
          <Panel defaultSize={60} minSize={30}>
            <Group orientation="vertical" className="h-full gap-2">

              <Panel defaultSize={65} minSize={35}>
                <div className="h-full overflow-hidden rounded-lg border">
                  <CodeEditorPanel
                    codeSnippets={problem?.codeSnippets}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </Panel>

              <Separator className="h-1.5 rounded-full bg-border transition-colors hover:bg-muted-foreground/30 active:bg-primary" />

              <Panel defaultSize={35} minSize={15}>
                <div className="h-full overflow-hidden rounded-lg border">
                  <OutputPanel />
                </div>
              </Panel>

            </Group>
          </Panel>

        </Group>
      </div>

      {/* ── Mobile: Tab Layout ── */}
      <div className="flex flex-1 min-h-0 flex-col md:hidden">

        {/* Active pane */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className={cn("h-full", activeTab !== "problem" && "hidden")}>
            <ProblemPanel
              problem={problem ?? null}
              isLoading={isLoading}
              isError={isError}
              error={error as Error | null}
            />
          </div>
          <div className={cn("h-full", activeTab !== "code" && "hidden")}>
            <CodeEditorPanel
              codeSnippets={problem?.codeSnippets}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>
          <div className={cn("h-full", activeTab !== "output" && "hidden")}>
            <OutputPanel />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="flex shrink-0 border-t bg-background">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                activeTab === id
                  ? "-mt-px border-t-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}