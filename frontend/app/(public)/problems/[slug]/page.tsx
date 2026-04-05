"use client";
import ProblemPanel from "./problem-panel"
import { useParams } from "next/navigation"
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditorPanel from "./code-editor-panel";
import OutputPanel from "./output-panel";
import ProblemListSheet from "../problem-list-sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useQuery } from "@tanstack/react-query";
import { UserButton } from "@clerk/nextjs";
import axios from "axios";

// ── API ───────────────────────────────────────────────────────────────────
async function fetchProblemList() {
  const { data } = await axios.get("http://localhost:5000/api/problems", {
    params: { limit: 50 },
  });
  return data.data.problems;
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function ProblemDetailPage() {
  const params = useParams();
  const slug =
    typeof params?.slug === "string"
      ? params.slug
      : Array.isArray(params?.slug)
        ? params.slug[0]
        : "";

  // fetch once here — sheet just receives props
  const { data: problems = [], isLoading: problemsLoading } = useQuery({
    queryKey: ["problems-list"],
    queryFn: fetchProblemList,
    staleTime: Infinity,
    gcTime: Infinity,
  });

const handleRun = async (code: string, language: string): Promise<void> => {
  console.log("Run:", { code, language });
};

const handleSubmit = async (code: string, language: string): Promise<void> => {
  console.log("Submit:", { code, language });
};

  return (
    <div className="flex flex-col h-screen">
      {/* ── Header ── */}
      <header className="flex justify-between items-center px-4 py-1.5 border-b shrink-0">
        <div className="flex items-center gap-2">
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

      {/* ── Panels ── */}
      <Group orientation="horizontal" className="flex-1 p-2 gap-2">
        <Panel defaultSize={40} minSize={30}>
          <div className="h-full rounded-lg border overflow-hidden">
            <ProblemPanel problemSlug={slug} />
          </div>
        </Panel>

        <Separator className="w-1.5 rounded-full bg-border hover:bg-muted-foreground/30 active:bg-primary transition-colors" />

        <Panel defaultSize={60} minSize={30}>
          <Group orientation="vertical" className="gap-2">
            <Panel defaultSize={65} minSize={40}>
              <div className="h-full rounded-lg border overflow-hidden">
                <CodeEditorPanel
                  problemSlug={slug}
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
  );
}