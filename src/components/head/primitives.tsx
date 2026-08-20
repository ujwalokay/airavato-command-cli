import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info, Lock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: ReactNode;
  actions?: ReactNode | undefined;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div className="max-w-2xl space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  tone = "neutral",
  to,
  search,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "ok" | "warn" | "danger" | "brand";
  to?: string;
  search?: Record<string, string>;
}) {
  const toneCls = {
    neutral: "text-foreground",
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
    brand: "text-primary",
  }[tone];

  const body = (
    <Card className="h-full gap-1 rounded-lg border p-4 shadow-xs transition-colors hover:border-primary/50">
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className={cn("text-2xl font-semibold tabular-nums", toneCls)}>{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Card>
  );

  if (!to) return body;
  return (
    <Link to={to} search={search as never} className="block focus-visible:rounded-lg">
      {body}
    </Link>
  );
}

export function EmptyState({
  icon: Icon = Info,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="rounded-lg border bg-surface p-2.5 text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PermissionDenied({ what }: { what: string }) {
  return (
    <EmptyState
      icon={Lock}
      title="Permission denied"
      description={`Your role cannot ${what}. Nothing was changed. Ask a Platform Owner or Operations Manager to perform this action, or request elevated access in Platform Settings.`}
    />
  );
}

export function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className={cn("text-sm", mono && "mono-id text-foreground")}>{value}</dd>
    </div>
  );
}

export function Hint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={text}
          className="text-muted-foreground hover:text-foreground"
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

/** High-impact action dialog: target, effects, reason, typed confirmation, audit link. */
export function ConfirmAction({
  open,
  onOpenChange,
  title,
  target,
  effects,
  delayedEffects,
  recovery,
  confirmWord,
  actionLabel,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  target: { label: string; value: string }[];
  effects: string[];
  delayedEffects?: string[] | undefined;
  recovery: string;
  confirmWord?: string | undefined;
  actionLabel: string;
  destructive?: boolean | undefined;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const ready = reason.trim().length >= 8 && (!confirmWord || typed === confirmWord);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setReason("");
          setTyped("");
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {destructive && <AlertTriangle className="size-4 text-danger" />}
            {title}
          </DialogTitle>
          <DialogDescription>
            Review the exact target and consequences before continuing. This action is recorded in
            the audit log.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-surface p-3">
          {target.map((t) => (
            <Field key={t.label} label={t.label} value={t.value} mono={t.label.includes("ID")} />
          ))}
        </dl>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Immediate effects</p>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {effects.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {delayedEffects && delayedEffects.length > 0 && (
            <>
              <p className="font-medium">Delayed effects</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {delayedEffects.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}
          <p className="rounded-md border border-info/30 bg-info/10 p-2 text-xs text-foreground">
            Recovery path: {recovery}
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason (required, stored in audit log)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Payment overdue 45 days, owner notified on 14 Aug"
              rows={2}
            />
          </div>
          {confirmWord && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm">
                Type <span className="mono-id text-foreground">{confirmWord}</span> to confirm
              </Label>
              <Input id="confirm" value={typed} onChange={(e) => setTyped(e.target.value)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={!ready}
            onClick={() => {
              onConfirm(reason);
              onOpenChange(false);
              setReason("");
              setTyped("");
            }}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
