import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PROBLEM_TAGS } from "@/data/problem-tags";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import {
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    Select,
} from "@/components/ui/select";
import { IconAdjustmentsHorizontalFilled, IconGauge, IconRotate, IconTag, IconX } from "@tabler/icons-react";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";

export interface Filters {
    difficulty: "all" | "Easy" | "Medium" | "Hard";
    tags: string[];
    search: string;
}

function FilterPopover({
    filters,
    onApply,
    onReset,
}: {
    filters: Filters;
    onApply: (f: Partial<Filters>) => void;
    onReset: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [local, setLocal] = useState<Filters>(filters);

    useEffect(() => {
        setLocal(filters);
    }, [filters]);

    const isDirty =
        local.difficulty !== "all" || local.tags.length > 0;

    const apply = () => {
        onApply(local);
        setOpen(false);
    };

    const reset = () => {
        const clean: Filters = { difficulty: "all", tags: [], search: "" };
        setLocal(clean);
        onReset();
        setOpen(false);
    };

    const activeCount = [
        filters.difficulty !== "all",
        filters.tags.length > 0,
    ].filter(Boolean).length;

    const toggleTag = (slug: string) => {
        setLocal((prev) => ({
            ...prev,
            tags: prev.tags.includes(slug)
                ? prev.tags.filter((t) => t !== slug)
                : [...prev.tags, slug],
        }));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-2 h-9", activeCount > 0 && "border-primary text-primary")}
                >
                    <IconAdjustmentsHorizontalFilled className="h-3.5 w-3.5" />
                    Filter
                    {activeCount > 0 && (
                        <Badge className="h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                            {activeCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent side="bottom" align="end" className="w-80 p-0" sideOffset={6}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <span className="text-sm font-semibold">Filters</span>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <IconX className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 p-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 w-24 shrink-0">
                            <IconGauge className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Difficulty</span>
                        </div>
                        <Select
                            value={local.difficulty}
                            onValueChange={(v: Filters["difficulty"]) =>
                                setLocal((f) => ({ ...f, difficulty: v }))
                            }
                        >
                            <SelectTrigger className="h-8 flex-1 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All levels</SelectItem>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 w-24 shrink-0 pt-1">
                            <IconTag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">Topics</span>
                        </div>

                        <div className="flex-1 rounded-md border max-h-56 overflow-y-auto">
                            {PROBLEM_TAGS.map((tag) => {
                                const checked = local.tags.includes(tag.slug);

                                return (
                                    <label
                                        key={tag.slug}
                                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs hover:bg-muted/40 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Checkbox checked={checked} onCheckedChange={() => toggleTag(tag.slug)} />
                                            <span className="truncate">{tag.name}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">
                                            {tag.count}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-t px-4 py-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={reset}
                        className="gap-1.5 text-muted-foreground"
                    >
                        <IconRotate className="h-3 w-3" />
                        Reset
                    </Button>
                    <Button size="sm" className="ml-auto" onClick={apply} disabled={!isDirty && activeCount === 0}>
                        Apply
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export default FilterPopover;