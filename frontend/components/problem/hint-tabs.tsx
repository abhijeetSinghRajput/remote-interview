"use client";
import  "@/app/styles/rich-text.css";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { IconChevronDown } from "@tabler/icons-react";

function HintsTabs({ hints }: { hints: string[] }) {
    if (!hints?.length) {
        return (
            <div className="py-10 text-center text-sm text-muted-foreground">
                No hints available.
            </div>
        );
    }

    return (
        <div className="divide-y">
            {hints.map((hint: string, i: number) => (
                <Collapsible key={i}>
                    <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between py-3 text-sm text-left">
                            <span className="font-semibold">Hint {i + 1}</span>
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
                        <div className="py-3 text-sm text-muted-foreground">
                            {hint}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
}


export default HintsTabs;