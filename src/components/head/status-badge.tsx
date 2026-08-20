import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        ok: "border-ok/35 bg-ok/12 text-ok",
        info: "border-info/35 bg-info/12 text-info",
        warn: "border-warn/40 bg-warn/15 text-warn",
        danger: "border-danger/40 bg-danger/12 text-danger",
        neutral: "border-border bg-muted text-muted-foreground",
        brand: "border-primary/40 bg-primary/12 text-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type Tone = NonNullable<VariantProps<typeof badge>["tone"]>;

const MAP: Record<string, Tone> = {
  Active: "ok",
  Connected: "ok",
  Healthy: "ok",
  Synced: "ok",
  Licensed: "ok",
  Acknowledged: "ok",
  Live: "ok",
  Valid: "ok",
  Resolved: "ok",
  Success: "ok",
  "Up to date": "ok",
  Pending: "info",
  Updating: "info",
  "In Progress": "info",
  Trial: "info",
  Queued: "info",
  Sending: "info",
  Investigating: "info",
  Beta: "info",
  Rotating: "info",
  "Offline Grace": "warn",
  Warning: "warn",
  Delayed: "warn",
  "Needs Attention": "warn",
  Limited: "warn",
  Conflict: "warn",
  Draft: "warn",
  Hidden: "warn",
  Open: "warn",
  Suspended: "danger",
  Failed: "danger",
  Critical: "danger",
  Revoked: "danger",
  Expired: "danger",
  Denied: "danger",
  Archived: "neutral",
  Disabled: "neutral",
  Unknown: "neutral",
  Ignored: "neutral",
  "Local only": "neutral",
  "Manually resolved": "brand",
  Stable: "brand",
  Internal: "neutral",
};

export function StatusBadge({
  status,
  tone,
  className,
}: {
  status: string;
  tone?: Tone;
  className?: string;
}) {
  const resolved = tone ?? MAP[status] ?? "neutral";
  return (
    <span className={cn(badge({ tone: resolved }), className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("mono-id", className)}>{children}</span>;
}
