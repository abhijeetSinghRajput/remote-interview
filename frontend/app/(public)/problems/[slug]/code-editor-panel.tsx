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
import { IconRotate, IconPlayerPlayFilled, IconSend, IconLoader } from "@tabler/icons-react";

// ── Language config ───────────────────────────────────────────────────────
const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    monacoId: "javascript",
    defaultCode: `function solution(nums, target) {\n  // your code here\n}`,
  },
  python: {
    label: "Python",
    monacoId: "python",
    defaultCode: `def solution(nums: list[int], target: int) -> list[int]:\n    # your code here\n    pass`,
  },
  java: {
    label: "Java",
    monacoId: "java",
    defaultCode: `class Solution {\n  public int[] solution(int[] nums, int target) {\n    // your code here\n    return new int[]{};\n  }\n}`,
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

// ── Main Code Editor Panel ───────────────────────────────────────────────
interface CodeEditorPanelProps {
  problemSlug: string;
  onRun?: (code: string, language: string) => Promise<void>;
  onSubmit?: (code: string, language: string) => Promise<void>;
}

export default function CodeEditorPanel({ problemSlug, onRun, onSubmit }: CodeEditorPanelProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef(null);

  const [language, setLanguage] = useState<keyof typeof LANGUAGES>("javascript");
  const [code, setCode] = useState(() => LANGUAGES[language].defaultCode);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      handleRun
    );
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    setCode(value ?? "");
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as keyof typeof LANGUAGES);
    setCode(LANGUAGES[lang as keyof typeof LANGUAGES].defaultCode);
  };

  const handleReset = () => {
    setCode(LANGUAGES[language].defaultCode);
  };

  const handleRun = async () => {
    if (isRunning || isSubmitting || !onRun) return;
    setIsRunning(true);
    try {
      await onRun(code, language);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isRunning || isSubmitting || !onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(code, language);
    } finally {
      setIsSubmitting(false);
    }
  };

  const monacoTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted shrink-0">
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="h-7 w-32 text-xs gap-1 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([key, { label }]) => (
                <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset */}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset to starter code">
            <IconRotate className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Run / Submit */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={handleRun} disabled={isRunning || isSubmitting}>
            {isRunning ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconPlayerPlayFilled className="h-3.5 w-3.5" />}
            Run
          </Button>

          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSubmit} disabled={isRunning || isSubmitting}>
            {isSubmitting ? <IconLoader className="h-3.5 w-3.5 animate-spin" /> : <IconSend className="h-3.5 w-3.5" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={LANGUAGES[language].monacoId}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          theme={monacoTheme}
          options={EDITOR_OPTIONS as any}
        />
      </div>
    </div>
  );
}