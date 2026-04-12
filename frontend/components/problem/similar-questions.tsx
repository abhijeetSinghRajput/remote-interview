import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProblemDifficulty, SimilarProblem } from "@/types/problem";
import {
  IconChevronDown,
  IconListTree,
  IconLockFilled,
} from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

type SimilarQuestionsProps = {
  questions?: SimilarProblem[] | null;
  className?: string;
  defaultOpen?: boolean;
};

const difficultyClass = (difficulty: ProblemDifficulty) => {
  switch (difficulty) {
    case "Easy":
      return "text-emerald-400";
    case "Medium":
      return "text-amber-400";
    case "Hard":
      return "text-rose-400";
    default:
      return "text-muted-foreground";
  }
};

const SimilarQuestions = ({
  questions,
  className,
  defaultOpen = true,
}: SimilarQuestionsProps) => {
  const safeQuestions = useMemo<SimilarProblem[]>(() => questions ?? [], [questions]);
  const [open, setOpen] = useState(defaultOpen);

  if (safeQuestions.length === 0) return null;

  return (
    <div className={cn("divide-y", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between py-3 text-left text-sm"
          >
            <div className="flex items-center gap-2">
              <IconListTree className="size-4" />
              <span className="font-semibold">Similar Questions</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({safeQuestions.length})
              </span>
            </div>

            <IconChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent
          className="
            overflow-hidden
            transition-all
            duration-200
            data-[state=closed]:animate-collapsible-up
            data-[state=open]:animate-collapsible-down
          "
        >
          <div className="border-t border-border/60">
            <ul className="divide-y divide-border/40">
              {safeQuestions.map((q, idx) => (
                <li key={`${q.titleSlug}-${idx}`}>
                  <Link
                    href={`/problems/${q.titleSlug}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/35"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground hover:underline">
                          {q.title}
                        </span>

                        {q.isPaidOnly ? (
                          <IconLockFilled className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        ) : null}
                      </div>
                    </div>

                    <span
                      className={cn(
                        "shrink-0 text-sm font-medium",
                        difficultyClass(q.difficulty)
                      )}
                    >
                      {q.difficulty}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SimilarQuestions;