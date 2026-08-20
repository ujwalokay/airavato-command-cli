import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, KpiCard, EmptyState } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { relTime } from "@/lib/head-data";
import { useHealthTimeline, useIncidents, useKpis, usePlatform } from "@/lib/head-db";

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
  const { kpis: k, isLoading: kpisLoading } = useKpis();
  const { data: platform, isLoading: platformLoading } = usePlatform();
  const timeline = useHealthTimeline();
  const incidents = useIncidents();

  const stale = [...platform.installations]
    .filter((i) => i.health === "Critical" || i.health === "Offline Grace")
    .sort((a, b) => (a.lastHeartbeat ?? 0) - (b.lastHeartbeat ?? 0))
    .slice(0, 10);
  const backupFailures = platform.installations.filter((i) => !i.backupOk).slice(0, 10);

  return (
    <>
      <PageHeader
        title="Health monitor"
        description="Health is derived from heartbeats, backup results, migration state and sync backlog reported by each local service."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Connected now" value={kpisLoading ? "—" : String(k.connected)} hint="Heartbeat within 3 hours" />
        <KpiCard label="Failing sync" value={kpisLoading ? "—" : String(k.failedSync)} hint="Queue stuck or retrying" />
        <KpiCard label="Critical incidents" value={kpisLoading ? "—" : String(k.criticalIncidents)} hint="Needs operator attention" />
        <KpiCard label="Update pending" value={kpisLoading ? "—" : String(k.needUpdate)} hint="Behind the stable channel" />
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Fleet heartbeat, last 24 hours</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {timeline.isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading timeline…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} className="text-xs" />
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
                <Area type="monotone" dataKey="connected" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Longest silence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {platformLoading ? (
              <p className="text-sm text-muted-foreground">Loading installations…</p>
            ) : stale.length === 0 ? (
              <EmptyState icon={Activity} title="No stale installations" description="Every machine has checked in recently." />
            ) : (
              stale.map((i) => (
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
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup failures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {platformLoading ? (
              <p className="text-sm text-muted-foreground">Loading installations…</p>
            ) : backupFailures.length === 0 ? (
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
            {incidents.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading incidents…</p>
            ) : incidents.data.length === 0 ? (
              <EmptyState icon={Activity} title="No open incidents" description="Support has no active tickets right now." />
            ) : (
              incidents.data.slice(0, 10).map((inc) => (
                <div key={inc.id} className="border-b pb-2 text-sm last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={inc.severity} />
                    <span className="text-xs text-muted-foreground">{relTime(inc.openedAt)}</span>
                  </div>
                  <p className="mt-1 font-medium">{inc.cafeName}</p>
                  <p className="text-xs text-muted-foreground">{inc.summary}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
