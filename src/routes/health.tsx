import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, KpiCard, EmptyState } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { healthTimeline, incidents, installations, kpis, relTime } from "@/lib/head-data";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Health monitor — AiravotoHead" },
      {
        name: "description",
        content: "Live heartbeat, backup and migration health across every Airavoto POS installation, with open incidents grouped by cafe.",
      },
      { property: "og:title", content: "Health monitor — AiravotoHead" },
      { property: "og:description", content: "Heartbeats, backups, migrations and open incidents across the fleet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  const k = kpis();
  const stale = installations
    .filter((i) => i.health === "Critical" || i.health === "Offline Grace")
    .sort((a, b) => a.lastHeartbeat - b.lastHeartbeat)
    .slice(0, 10);
  const backupFailures = installations.filter((i) => !i.backupOk).slice(0, 10);

  return (
    <>
      <PageHeader
        title="Health monitor"
        description="Health is derived from heartbeats, backup results, migration state and sync backlog reported by each local service."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Connected now" value={String(k.connected)} hint="Heartbeat within 15 minutes" />
        <KpiCard label="Failing sync" value={String(k.failedSync)} hint="Queue stuck or retrying" />
        <KpiCard label="Critical incidents" value={String(k.criticalIncidents)} hint="Needs operator attention" />
        <KpiCard label="Update pending" value={String(k.needUpdate)} hint="Behind the stable channel" />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fleet heartbeat, last 24 hours</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthTimeline}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" width={32} />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--popover-foreground)",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="online" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Longest silence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stale.map((i) => (
              <Link
                key={i.id}
                to="/installations/$installationId"
                params={{ installationId: i.id }}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{i.cafeName}</span>{" "}
                  <Mono className="text-xs text-muted-foreground">{i.machineName}</Mono>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{relTime(i.lastHeartbeat)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup failures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {backupFailures.length === 0 ? (
              <EmptyState icon={Activity} title="All backups healthy" description="Every machine reported a successful local backup." />
            ) : (
              backupFailures.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span className="min-w-0 truncate">{i.cafeName}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{relTime(i.lastBackup)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incidents.slice(0, 10).map((inc) => (
              <div key={inc.id} className="border-b pb-2 text-sm last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={inc.severity} />
                  <span className="text-xs text-muted-foreground">{relTime(inc.openedAt)}</span>
                </div>
                <p className="mt-1 font-medium">{inc.cafeName}</p>
                <p className="text-xs text-muted-foreground">{inc.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
