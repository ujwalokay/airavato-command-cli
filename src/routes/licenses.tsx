import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/head/data-table";
import { PageHeader, EmptyState, KpiCard } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/components/head/session";
import { fmtDate, licenses, relTime, type License } from "@/lib/head-data";

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

function LicensesPage() {
  const session = useSession();
  const [state, setState] = useState("all");
  const rows = licenses.filter((l) => state === "all" || l.state === state);

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
    { key: "renewal", header: "Renewal", render: (l) => fmtDate(l.renewalDate), sort: (l) => l.renewalDate },
    { key: "grace", header: "Grace ends", render: (l) => fmtDate(l.graceEnds), sort: (l) => l.graceEnds, defaultHidden: true },
    { key: "limits", header: "Limits", render: (l) => `${l.installationLimit} inst · ${l.deviceLimit} dev` },
    { key: "token", header: "Token", render: (l) => <Mono>v{l.tokenVersion}</Mono>, sort: (l) => l.tokenVersion },
    {
      key: "validated",
      header: "Last validation",
      render: (l) => <span className="text-muted-foreground">{relTime(l.lastValidation)}</span>,
      sort: (l) => l.lastValidation,
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
        <Button
          variant="ghost"
          size="sm"
          disabled={!session.can("license.rotate")}
          onClick={() =>
            toast.success(`Token rotated for ${l.cafeName}`, {
              description: `New token v${l.tokenVersion + 1} will be picked up on the next heartbeat.`,
            })
          }
        >
          Rotate token
        </Button>
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
    </>
  );
}
