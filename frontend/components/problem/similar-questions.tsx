import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SimilarQuestion } from "@/types/problem";
import { IconChevronDown, IconListTree, IconLockFilled } from "@tabler/icons-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

type SimilarQuestionsProps = {
    questions: SimilarQuestion[];
    className?: string;
    defaultOpen?: boolean;
};

const difficultyClass = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d === "easy") return "text-emerald-400";
    if (d === "medium") return "text-amber-400";
    if (d === "hard") return "text-rose-400";
    return "text-muted-foreground";
};

const SimilarQuestions = ({
    questions,
    className,
    defaultOpen = true,
}: SimilarQuestionsProps) => {
    const safeQuestions = useMemo(() => questions ?? [], [questions]);
    const [open, setOpen] = useState(defaultOpen);

    if (!safeQuestions.length) return null;

    return (
        <div className={cn("divide-y", className)}>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between py-3 text-sm text-left">
                        <div className="flex gap-2 items-center">
                            <IconListTree className="size-4" /> {" "}
                            <span className="font-semibold">Similar Questions</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                                ({safeQuestions.length})
                            </span>
                        </div>
                        <IconChevronDown className="chevron  h-4 w-4 transition-transform duration-200" />
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
                                                <div>
                                                    <span className="truncate text-sm font-medium text-foreground hover:underline">
                                                        {q.title}
                                                    </span>
                                                </div>

                                                {q.isPaidOnly && (
                                                    <IconLockFilled className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                                )}
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