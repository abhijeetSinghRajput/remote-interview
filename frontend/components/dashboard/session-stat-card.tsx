import { cn } from "@/lib/utils";

function SessionStatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: any;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-4",
        "transition-all hover:-translate-y-[1px] hover:shadow-sm"
      )}
    >
      {/* subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-muted/40 via-transparent to-accent/20 opacity-60" />

      {/* BACKDROP ICON */}
      <Icon
        className={cn(
          "pointer-events-none absolute",
          "bottom-[2%] right-[2%]",
          "size-2/3",
          "text-muted-foreground/10",
          "stroke-2.5"
        )}
      />

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>

        <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {value}
        </p>
      </div>

      {/* bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-accent/50" />
    </div>
  );
}

export default SessionStatCard;