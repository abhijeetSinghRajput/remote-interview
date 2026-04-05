
"use client";
import ProblemPanel from "./problem-panel"
import { useParams } from "next/navigation"
import { Group, Panel, Separator } from "react-resizable-panels";
import CodeEditorPanel from "./code-editor-panel";
import OutputPanel from "./output-panel";

export default function ProblemDetailPage() {
  const params = useParams()
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : ""

    const handleRun = async (code: string, language: string) => {
      console.log("Run code:", { code, language });
      // Return a dummy OutputResult for now
      return {
        status: "accepted" as const,
        stdout: "// run output",
        testResults: []
      };
    };
    const handleSubmit = async (code: string, language: string) => {
      console.log("Submit code:", { code, language });
      // Return a dummy OutputResult for now
      return {
        status: "accepted" as const,
        runtime: "0ms",
        memory: "0MB",
        testResults: []
      };
    };

  return (
    <div className="border h-svh p-2">
      <Group orientation="horizontal">
        <Panel>
          <ProblemPanel problemId={id} />
        </Panel>
        <Separator className="w-2 bg-background data-[separator=hover]:bg-muted data-[separator=active]:bg-primary" />
        <Panel>
          <Group orientation="vertical">
            <Panel>
              <CodeEditorPanel
                problemId={id}
                onRun={handleRun}
                onSubmit={handleSubmit}
              />
            </Panel>
            {/* data-separator="active":bg-primary */}
            <Separator className="h-2 bg-background data-[separator=hover]:bg-muted data-[separator=active]:bg-primary" />
            <Panel>
              <OutputPanel/>
            </Panel>
          </Group>
        </Panel>
      </Group>
    </div>
  )
}
