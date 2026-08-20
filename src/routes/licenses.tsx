import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/head/data-table";
import { PageHeader, EmptyState, KpiCard, ConfirmAction } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/components/head/session";
import { fmtDate, relTime, type License } from "@/lib/head-data";
import { useLicenseAction, usePlatform } from "@/lib/head-db";

export const Route = createFileRoute("/licenses")({
  head: () => ({
    meta: [
      { title: "Licenses — AiravotoHead" },
      {
        name: "description",
        content: "License lifecycle for every cafe: trials, renewals, offline grace windows, suspensions and token rotations.",
      },
      { property: "og:title", content: "Licenses — AiravotoHead" },
      { property: "og:description", content: "Trials, renewals, grace windows, suspensions and token rotations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LicensesPage,
});

type PendingAction = { license: License; kind: "suspend" | "reactivate" | "rotate" };

function LicensesPage() {
  const session = useSession();
  const { data, isLoading } = usePlatform();
  const [state, setState] = useState("all");
  const [pending, setPending] = useState<PendingAction | null>(null);

  const actor = { name: session.name, role: session.roleLabel };
  const licenseAction = useLicenseAction(actor);

  const licenses = data.licenses;
  const rows = licenses.filter((l) => state === "all" || l.state === state);

  const runAction = (reason: string) => {
    if (!pending) return;
    const { license, kind } = pending;
    void licenseAction.mutateAsync(
      {
        kind,
        input: {
          cafe: { id: license.cafeId, name: license.cafeName },
          licenseId: license.id,
          reason,
          previousState: license.state,
          tokenVersion: license.tokenVersion,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            kind === "suspend"
              ? `License suspended for ${license.cafeName}`
              : kind === "reactivate"
                ? `License reactivated for ${license.cafeName}`
                : `Token rotated for ${license.cafeName}`,
            {
              description:
                kind === "rotate"
                  ? `New token v${license.tokenVersion + 1} will be picked up on the next heartbeat.`
                  : undefined,
            },
          );
          setPending(null);
        },
        onError: (err) => toast.error("Action failed", { description: String(err) }),
      },
    );
  };

  const columns: Column<License>[] = [
    {
      key: "id",
      header: "License",
      render: (l) => (
        <div className="min-w-0">
          <Mono>{l.id}</Mono>
          <div className="truncate text-xs text-muted-foreground">{l.cafeName}</div>
        </div>
      ),
      sort: (l) => l.id,
    },
    { key: "plan", header: "Plan", render: (l) => l.plan, sort: (l) => l.plan },
    { key: "state", header: "State", render: (l) => <StatusBadge status={l.state} />, sort: (l) => l.state },
    { key: "renewal", header: "Renewal", render: (l) => fmtDate(l.renewalDate), sort: (l) => l.renewalDate ?? 0 },
    { key: "grace", header: "Grace ends", render: (l) => fmtDate(l.graceEnds), sort: (l) => l.graceEnds ?? 0, defaultHidden: true },
    { key: "limits", header: "Limits", render: (l) => `${l.installationLimit} inst · ${l.deviceLimit} dev` },
    { key: "token", header: "Token", render: (l) => <Mono>v{l.tokenVersion}</Mono>, sort: (l) => l.tokenVersion },
    {
      key: "validated",
      header: "Last validation",
      render: (l) => <span className="text-muted-foreground">{relTime(l.lastValidation)}</span>,
      sort: (l) => l.lastValidation ?? 0,
    },
    {
      key: "reason",
      header: "Suspension reason",
      render: (l) => l.suspensionReason ?? "—",
      defaultHidden: true,
    },
    {
      key: "actions",
      header: "",
      render: (l) => (
        <div className="flex items-center gap-1">
          {(l.state === "Suspended" || l.state === "Revoked") ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={!session.can("license.reactivate")}
              onClick={() => setPending({ license: l, kind: "reactivate" })}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={!session.can("license.suspend")}
              onClick={() => setPending({ license: l, kind: "suspend" })}
            >
              Suspend
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            disabled={!session.can("license.rotate")}
            onClick={() => setPending({ license: l, kind: "rotate" })}
          >
            Rotate token
          </Button>
        </div>
      ),
    },
  ];

  const active = licenses.filter((l) => l.state === "Active").length;
  const grace = licenses.filter((l) => l.state === "Offline Grace").length;
  const suspended = licenses.filter((l) => l.state === "Suspended").length;
  const trials = licenses.filter((l) => l.state === "Trial").length;

  return (
    <>
      <PageHeader
        title="Licenses"
        description="Signed license tokens are validated by each local POS. Offline machines keep working through a grace window before cloud features pause."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active" value={String(active)} hint="Fully licensed cafes" />
        <KpiCard label="Trials" value={String(trials)} hint="Converting within 30 days" />
        <KpiCard label="Offline grace" value={String(grace)} hint="Awaiting revalidation" />
        <KpiCard label="Suspended" value={String(suspended)} hint="Cloud features paused" />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(l) => l.id}
        loading={isLoading}
        search={(l) => `${l.id} ${l.cafeName} ${l.plan} ${l.state}`}
        searchPlaceholder="Search by license, cafe or plan…"
        exportName="airavoto-licenses"
        filters={
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="h-9 w-44" aria-label="Filter by license state">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {["all", "Active", "Trial", "Offline Grace", "Suspended", "Revoked", "Expired"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All states" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        empty={<EmptyState icon={ShieldCheck} title="No licenses match" description="Adjust the state filter." />}
      />

      <ConfirmAction
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={
          pending?.kind === "suspend"
            ? `Suspend license for ${pending.license.cafeName}`
            : pending?.kind === "reactivate"
              ? `Reactivate license for ${pending.license.cafeName}`
              : `Rotate token for ${pending?.license.cafeName ?? ""}`
        }
        target={
          pending
            ? [
                { label: "License ID", value: pending.license.id },
                { label: "Cafe", value: pending.license.cafeName },
              ]
            : []
        }
        effects={
          pending?.kind === "suspend"
            ? ["Cloud features pause immediately.", "All installations for this cafe have their tokens revoked."]
            : pending?.kind === "reactivate"
              ? ["License state returns to Active.", "A fresh token is issued to all installations."]
              : ["Token version is incremented.", "Installations pick up the new token on next heartbeat."]
        }
        recovery="This action is reversible from the licenses page and is recorded in the audit log."
        actionLabel={
          pending?.kind === "suspend" ? "Suspend license" : pending?.kind === "reactivate" ? "Reactivate license" : "Rotate token"
        }
        destructive={pending?.kind === "suspend"}
        onConfirm={runAction}
      />
    </>
  );
}
