"use client";
import "@/app/styles/rich-text.css";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { IconBulbFilled, IconChevronDown } from "@tabler/icons-react";

function HintsTabs({ hints, className }: { hints: string[]; className?: string }) {
    if (!hints?.length) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                No hints available.
            </div>
        );
    }

    return (
        <div className={cn("divide-y", className)}>
            {hints.map((hint: string, i: number) => (
                <Collapsible key={i}>
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between py-3 text-sm text-left">
                            <div className="flex gap-2 items-center">

                                <IconBulbFilled className="size-4" /> {" "}
                                <span className="font-semibold">Hint {i + 1}</span>
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
                        <div
                            dangerouslySetInnerHTML={{ __html: hint }}
                            className="rich-text py-3 text-sm text-muted-foreground" />
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
}


export default HintsTabs;