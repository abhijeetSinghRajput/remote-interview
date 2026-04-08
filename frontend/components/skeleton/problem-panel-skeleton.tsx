import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const ProblemPanelSkeleton = () => {
  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden rounded-none bg-card md:rounded-lg">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 shrink-0 bg-muted px-5 pt-5 pb-4">
        {/* Title + difficulty */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-52 max-w-[70%]" />
          <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-11 rounded-full" />
          <Skeleton className="h-5 w-11 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <Separator />

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-0">
          {/* h2 */}
          <Skeleton className="mb-4 h-8 w-56" />

          {/* paragraph 1 */}
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-[92%]" />
          <Skeleton className="mb-4 h-4 w-[55%]" />

          {/* paragraph 2 */}
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-[95%]" />
          <Skeleton className="mb-6 h-4 w-[72%]" />

          {/* h3 Constraints */}
          <Skeleton className="mb-4 h-6 w-24" />

          {/* ul list */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-[78%]" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-[62%]" />
            </div>
          </div>

          {/* h3 Examples */}
          <Skeleton className="mb-4 h-6 w-20" />

          {/* Example 1 label */}
          <Skeleton className="mb-3 h-4 w-24" />

          {/* code block 1 */}
          <div className="mb-5 rounded-lg border bg-muted/30">
            <div className="space-y-2 px-5 py-4">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Example 2 label */}
          <Skeleton className="mb-3 h-4 w-24" />

          {/* code block 2 */}
          <div className="mb-6 rounded-lg border bg-muted/30">
            <div className="space-y-2 px-5 py-4">
              <Skeleton className="h-4 w-[52%]" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* Hint rows */}
        <div className="divide-y">
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between py-3">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPanelSkeleton;