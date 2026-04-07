import { cn } from '@/lib/utils';

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
        <div className="relative rounded-xl border border-border bg-card p-5 overflow-hidden group hover:border-border/80 transition-colors">
            <div className="absolute top-0 left-0 h-0.5 w-full opacity-60 bg-accent" />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                        {label}
                    </p>
                    <p className="text-3xl font-black tracking-tight">{value}</p>
                </div>
                <div
                    className={cn(
                        "p-2 rounded-lg border",
                        "bg-muted/40 border-border text-muted-foreground"
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
}

export default SessionStatCard;