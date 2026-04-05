"use client";

import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconCheck, IconClock, IconLoader, IconPlayerPlayFilled, IconRotate, IconSend, IconX } from "@tabler/icons-react";

// ── Language config ───────────────────────────────────────────────────────
const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    monacoId: "javascript",
    defaultCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function solution(nums, target) {
  // your code here
}`,
  },
  python: {
    label: "Python",
    monacoId: "python",
    defaultCode: `def solution(nums: list[int], target: int) -> list[int]:
    # your code here
    pass`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    defaultCode: `class Solution {
    public int[] solution(int[] nums, int target) {
        // your code here
        return new int[]{};
    }
}`,
  },
};

// ── Result status config ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  accepted: {
    label: "Accepted",
    icon: IconCheck,
    className: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
  },
  wrong_answer: {
    label: "Wrong Answer",
    icon: IconX,
    className: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",
  },
  runtime_error: {
    label: "Runtime Error",
    icon: IconX,
    className: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",
  },
  time_limit: {
    label: "Time Limit Exceeded",
    icon: IconClock,
    className: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
  },
};

// ── Monaco editor options ─────────────────────────────────────────────────
const EDITOR_OPTIONS = {
  fontSize: 13,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  padding: { top: 16, bottom: 16 },
  tabSize: 2,
  wordWrap: "on",
  renderLineHighlight: "gutter",
  lineNumbersMinChars: 3,
  folding: true,
  bracketPairColorization: { enabled: true },
  guides: { bracketPairs: true },
  suggest: { preview: true },
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
};

// ── Output panel ──────────────────────────────────────────────────────────
type TestResult = { input: string; expected: string; got: string; passed: boolean };
type OutputResult = {
  status: keyof typeof STATUS_CONFIG;
  stdout?: string;
  error?: string;
  runtime?: string;
  memory?: string;
  testResults?: TestResult[];
};
function OutputPanel({ result, isRunning, isSubmitting }: { result: OutputResult | null; isRunning: boolean; isSubmitting: boolean }) {
  const loading = isRunning || isSubmitting;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <IconLoader className="h-5 w-5 animate-spin" />
        <p className="text-sm">{isSubmitting ? "Submitting..." : "Running..."}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <IconPlayerPlayFilled className="h-6 w-6 opacity-20" />
        <p className="text-sm">Run your code to see output here.</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[result.status];
  const StatusIcon = statusConfig?.icon;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {StatusIcon && (
              <StatusIcon className={`h-4 w-4 ${statusConfig.className}`} />
            )}
            <span className={`text-sm font-medium ${statusConfig?.className}`}>
              {statusConfig?.label ?? result.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result.runtime && (
              <Badge variant="outline" className="text-xs font-mono">
                {result.runtime}
              </Badge>
            )}
            {result.memory && (
              <Badge variant="outline" className="text-xs font-mono">
                {result.memory}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Test case results */}
        {Array.isArray(result.testResults) && result.testResults.length > 0 && (
          <div className="space-y-3">
            {result.testResults.map((tc: TestResult, i: number) => (
              <div
                key={i}
                className={`rounded-md border p-3 space-y-2 text-xs ${
                  tc.passed
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30"
                    : "border-rose-200 bg-rose-50/50 dark:border-rose-800 dark:bg-rose-950/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {tc.passed ? (
                    <IconCheck className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <IconX className="h-3.5 w-3.5 text-rose-500" />
                  )}
                  <span className="font-medium">Case {i + 1}</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 font-mono">
                  <div>
                    <span className="text-muted-foreground">Input: </span>
                    <span>{tc.input}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expected: </span>
                    <span>{tc.expected}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Got: </span>
                    <span className={!tc.passed ? "text-rose-600 dark:text-rose-400" : ""}>
                      {tc.got}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Raw stdout */}
        {result.stdout && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Stdout</p>
            <pre className="text-xs font-mono bg-muted rounded-md p-3 border overflow-x-auto whitespace-pre-wrap">
              {result.stdout}
            </pre>
          </div>
        )}

        {/* Error */}
        {result.error && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Error</p>
            <pre className="text-xs font-mono bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-md p-3 border border-rose-200 dark:border-rose-800 overflow-x-auto whitespace-pre-wrap">
              {result.error}
            </pre>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────
import type { ICodeStub } from "@/types/model";
interface CodeEditorPanelProps {
  problemId: string;
  codeStubs?: ICodeStub[];
  onRun?: (code: string, language: string) => Promise<OutputResult>;
  onSubmit?: (code: string, language: string) => Promise<OutputResult>;
}
export default function CodeEditorPanel({
  problemId,
  codeStubs = [],
  onRun,
  onSubmit,
}: CodeEditorPanelProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef(null);

  const [language, setLanguage]     = useState("javascript");
  const [codes, setCodes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (Object.keys(LANGUAGES) as Array<keyof typeof LANGUAGES>).forEach((lang) => {
      const stub = codeStubs.find((s) => s.language === lang);
      init[lang] = stub?.starterCode ?? LANGUAGES[lang].defaultCode;
    });
    return init;
  });

  const [isRunning, setIsRunning]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult]             = useState<OutputResult | null>(null);
  const [activeTab, setActiveTab]       = useState("output");

  const currentCode = codes[language] ?? LANGUAGES[language as keyof typeof LANGUAGES].defaultCode;

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    // ctrl+enter to run
    editor.addCommand(
      // eslint-disable-next-line no-bitwise
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      handleRun,
    );
  };

  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      setCodes((prev) => ({ ...prev, [language]: value ?? "" }));
    },
    [language],
  );

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setResult(null);
  };

  const handleReset = () => {
    const stub = codeStubs.find((s) => s.language === language);
    setCodes((prev) => ({
      ...prev,
      [language]: stub?.starterCode ?? LANGUAGES[language as keyof typeof LANGUAGES].defaultCode,
    }));
    setResult(null);
  };

  const handleRun = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTab("output");
    try {
      // if no handler provided, show a placeholder result
      const res = onRun
        ? await onRun(currentCode, language)
        : { status: "accepted" as const, stdout: "// connect onRun handler", testResults: [] };
      setResult(res);
    } catch (err) {
      let errorMsg = "Unknown error";
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        errorMsg = (err as any).message;
      }
      setResult({ status: "runtime_error", error: errorMsg });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isRunning || isSubmitting) return;
    setIsSubmitting(true);
    setActiveTab("output");
    try {
      const res = onSubmit
        ? await onSubmit(currentCode, language)
        : { status: "accepted" as const, runtime: "72ms", memory: "41.2MB", testResults: [] };
      setResult(res);
    } catch (err) {
      let errorMsg = "Unknown error";
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        errorMsg = (err as any).message;
      }
      setResult({ status: "runtime_error", error: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-7 w-32 text-xs gap-1 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleReset}
            title="Reset to starter code"
          >
            <IconRotate className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconPlayerPlayFilled className="h-3.5 w-3.5" />
            )}
            Run
            <span className="hidden sm:inline text-muted-foreground ml-0.5">⌘↵</span>
          </Button>

          <Button
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? (
              <IconLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconSend className="h-3.5 w-3.5" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* ── Monaco editor ── */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={LANGUAGES[language as keyof typeof LANGUAGES].monacoId}
          value={currentCode}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme={monacoTheme}
          options={EDITOR_OPTIONS as any}
        />
      </div>
    </div>
  );
}