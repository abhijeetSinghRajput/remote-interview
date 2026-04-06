"use client";;
import ProblemPanel from "./problem-panel";
import { useParams } from "next/navigation";
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditorPanel from "./code-editor-panel";
import type { IProblem } from "@/types/model";
import OutputPanel from "./output-panel";
import ProblemListSheet from "../problem-list-sheet";
import type { ProblemListItem } from "../problem-list-sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useQuery } from "@tanstack/react-query";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { IconFileText, IconCode, IconTerminal2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { fetchProblemDetail, fetchProblemList } from "@/services/problem.service";


// ── Mobile tab config ─────────────────────────────────────────────────────
const TABS = [
  { id: "problem", label: "Problem", icon: IconFileText },
  { id: "code", label: "Code", icon: IconCode },
  { id: "output", label: "Output", icon: IconTerminal2 },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProblemDetailPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  const [activeTab, setActiveTab] = useState<TabId>("problem");

  // fetch once here — sheet just receives props
  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: ["problems-list"],
    queryFn: () => fetchProblemList({}),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // fetch current problem for code stubs
  const { data: currentProblem , isLoading, isError, error} = useQuery<IProblem>({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblemDetail(slug),
    enabled: !!slug,
    staleTime: 5 * 60_000,
  });
  

  const handleRun = async (code: string, language: string): Promise<void> => {
    console.log("Run:", { code, language });
    // After running, switch to output tab on mobile
    setActiveTab("output");
  };

  const handleSubmit = async (code: string, language: string): Promise<void> => {
    console.log("Submit:", { code, language });
    setActiveTab("output");
  };

  return (
    <div className="flex flex-col h-dvh">
      {/* ── Header ── */}
      <header className="flex justify-between items-center px-4 py-1.5 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold">
              R
            </Link>
          </div>
          <ProblemListSheet
            currentSlug={slug}
            problems={problems as ProblemListItem[]}
            isLoading={problemsLoading}
          />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        </div>
      </header>

      {/* ── Desktop: Resizable Panels ── */}
      <div className="hidden md:flex flex-1 min-h-0">
      <Group orientation="horizontal" className="flex-1 p-2 gap-2">
        <Panel defaultSize={40} minSize={30}>
          <div className="h-full rounded-lg border overflow-hidden">
            <ProblemPanel problem={currentProblem ?? null} isLoading={isLoading} isError={isError} error={error} />
          </div>
        </Panel>

        <Separator className="w-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

        <Panel defaultSize={60} minSize={30}>
          <Group orientation="vertical" className="gap-2">
            <Panel defaultSize={65} minSize={40}>
              <div className="h-full rounded-lg border overflow-hidden">
                <CodeEditorPanel
                  codeStubs={currentProblem?.codeStubs}
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                />
              </div>
            </Panel>

            <Separator className="h-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

            <Panel defaultSize={35} minSize={15}>
              <div className="h-full rounded-lg border overflow-hidden">
                <OutputPanel />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>
      </div>

      {/* ── Mobile: Tab Layout ── */}
      <div className="flex md:hidden flex-col flex-1 min-h-0">
        {/* Tab panels — only active one is visible */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Problem tab */}
          <div className={cn("h-full overflow-hidden", activeTab !== "problem" && "hidden")}>
            <ProblemPanel
              problem={currentProblem ?? null}
              isLoading={isLoading}
              isError={isError}
              error={error}
            />
          </div>

          {/* Code tab */}
          <div className={cn("h-full overflow-hidden", activeTab !== "code" && "hidden")}>
            <CodeEditorPanel
              codeStubs={currentProblem?.codeStubs}
              onRun={handleRun}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Output tab */}
          <div className={cn("h-full overflow-hidden", activeTab !== "output" && "hidden")}>
            <OutputPanel />
          </div>
        </div>

        {/* Bottom tab bar */}
        <nav className="shrink-0 flex border-t bg-background">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors",
                activeTab === id
                  ? "text-primary border-t-2 border-primary -mt-px"
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