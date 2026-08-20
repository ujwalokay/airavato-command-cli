import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, KpiCard, EmptyState } from "@/components/head/primitives";
import { DataTable, type Column } from "@/components/head/data-table";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { relTime, RINGS, type Cafe } from "@/lib/head-data";
import { useAuditLogs, useHealthTimeline, useIncidents, useKpis, usePlatform } from "@/lib/head-db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — AiravotoHead Operations Console" },
      {
        name: "description",
        content:
          "Platform-wide health of every Airavoto POS installation: cafes, licenses, heartbeats, sync queues and rollout progress.",
      },
      { property: "og:title", content: "Overview — AiravotoHead Operations Console" },
      {
        property: "og:description",
        content: "Platform-wide health of every Airavoto POS installation at a glance.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const navigate = useNavigate();
  const { kpis: k } = useKpis();
  const { data: platform, isLoading: platformLoading } = usePlatform();
  const { data: timeline } = useHealthTimeline();
  const { data: incidents, isLoading: incidentsLoading } = useIncidents();
  const { data: auditLogs, isLoading: auditLoading } = useAuditLogs();

  const { cafes, installations } = platform;

  const columns: Column<Cafe>[] = [
    {
      key: "name",
      header: "Cafe",
      sort: (c) => c.name,
      render: (c) => (
        <div className="leading-tight">
          <span className="font-medium">{c.name}</span>
          <Mono className="block">{c.slug}</Mono>
        </div>
      ),
    },
    { key: "city", header: "City", sort: (c) => c.city, render: (c) => c.city },
    { key: "plan", header: "Plan", sort: (c) => c.plan, render: (c) => c.plan },
    {
      key: "license",
      header: "License",
      sort: (c) => c.license,
      render: (c) => <StatusBadge status={c.license} />,
    },
    {
      key: "pos",
      header: "POS version",
      sort: (c) => c.posVersion,
      render: (c) => <Mono>{c.posVersion}</Mono>,
    },
    {
      key: "public",
      header: "AiravotoCafe",
      sort: (c) => c.publicState,
      render: (c) => <StatusBadge status={c.publicState} />,
    },
    {
      key: "hb",
      header: "Last heartbeat",
      sort: (c) => c.lastHeartbeat ?? 0,
      render: (c) => <span className="text-muted-foreground">{relTime(c.lastHeartbeat)}</span>,
    },
    {
      key: "health",
      header: "Health",
      sort: (c) => c.health,
      render: (c) => <StatusBadge status={c.health} />,
    },
  ];

  const ringCounts = RINGS.map((ring) => ({
    ring,
    count: installations.filter((i) => i.ring === ring).length,
  }));

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Operational state of every locally installed Airavoto POS system and its connected AiravotoCafe page. No customer personal data is shown here."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total cafes" value={k.totalCafes} to="/cafes" hint="All tenants" />
        <KpiCard label="Active cafes" value={k.activeCafes} tone="ok" to="/cafes" hint="Active or trial license" />
        <KpiCard
          label="Offline beyond grace"
          value={k.offlineBeyondGrace}
          tone="danger"
          to="/health"
          hint="No heartbeat > 48h"
        />
        <KpiCard label="Connected installations" value={k.connected} tone="ok" to="/installations" hint="Heartbeat < 3h" />
        <KpiCard label="Needs update" value={k.needUpdate} tone="warn" to="/releases" hint="Not on latest version" />
        <KpiCard label="Suspended licenses" value={k.suspended} tone="danger" to="/licenses" hint="Suspended or revoked" />
        <KpiCard label="Failed sync queues" value={k.failedSync} tone="warn" to="/sync" hint="Failed or conflicted events" />
        <KpiCard
          label="Critical incidents"
          value={k.criticalIncidents}
          tone="danger"
          to="/diagnostics"
          hint="Open support incidents"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Platform health timeline · last 24 hours</CardTitle>
        </CardHeader>
        <CardContent className="h-64 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeline} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" width={36} />
              <RTooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Area
                type="monotone"
                dataKey="connected"
                stackId="1"
                stroke="var(--color-ok)"
                fill="var(--color-ok)"
                fillOpacity={0.22}
              />
              <Area
                type="monotone"
                dataKey="degraded"
                stackId="1"
                stroke="var(--color-warn)"
                fill="var(--color-warn)"
                fillOpacity={0.22}
              />
              <Area
                type="monotone"
                dataKey="offline"
                stackId="1"
                stroke="var(--color-danger)"
                fill="var(--color-danger)"
                fillOpacity={0.22}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Cafe status</h2>
        <DataTable
          rows={cafes}
          columns={columns}
          rowKey={(c) => c.id}
          search={(c) => `${c.name} ${c.slug} ${c.city} ${c.plan} ${c.license}`}
          searchPlaceholder="Search cafes by name, slug or city…"
          exportName="cafe-status"
          onRowClick={(c) => navigate({ to: "/cafes/$cafeId", params: { cafeId: c.id } })}
          empty={
            platformLoading ? (
              <EmptyState title="Loading cafes…" description="Fetching the latest platform data." />
            ) : (
              <EmptyState title="No cafes yet" description="Onboard your first cafe to start receiving heartbeats." />
            )
          }
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incidentsLoading ? (
              <EmptyState title="Loading incidents…" description="Fetching the latest support incidents." />
            ) : incidents.length === 0 ? (
              <EmptyState title="No incidents" description="Nothing has been reported by support agents yet." />
            ) : (
              incidents.slice(0, 6).map((i) => (
                <Link
                  key={i.id}
                  to="/installations/$installationId"
                  params={{ installationId: i.installationId ?? "" }}
                  className="flex items-start justify-between gap-3 rounded-md border p-2.5 hover:bg-accent/40"
                >
                  <span className="space-y-0.5">
                    <span className="block text-sm font-medium">{i.kind}</span>
                    <span className="block text-xs text-muted-foreground">{i.summary}</span>
                    <Mono className="block">
                      {i.cafeName} · {i.installationId}
                    </Mono>
                  </span>
                  <StatusBadge status={i.severity} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rollout progress by ring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {installations.length === 0 ? (
              <EmptyState title="No installations" description="Register an installation to see rollout progress." />
            ) : (
              ringCounts.map((r) => (
                <div key={r.ring} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{r.ring}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {r.count} installations
                    </span>
                  </div>
                  <Progress value={(r.count / installations.length) * 100} className="h-1.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent platform activity</CardTitle>
        </CardHeader>
        <CardContent>
          {auditLoading ? (
            <EmptyState title="Loading activity…" description="Fetching the latest audit records." />
          ) : auditLogs.length === 0 ? (
            <EmptyState title="No activity yet" description="Actions taken across the platform will appear here." />
          ) : (
            <ul className="divide-y text-sm">
              {auditLogs.slice(0, 8).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-2 py-2">
                  <Mono>{a.action}</Mono>
                  <span className="text-muted-foreground">by {a.actor}</span>
                  <span className="text-muted-foreground">· {a.cafeName}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{relTime(a.at)}</span>
                    <StatusBadge status={a.result} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/audit" className="mt-3 inline-block text-sm text-primary hover:underline">
            View all audit records →
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
