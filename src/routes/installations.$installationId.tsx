import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Field, EmptyState } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { MonitorSmartphone } from "lucide-react";
import { installationById, fmtDateTime, relTime, syncEvents } from "@/lib/head-data";

export const Route = createFileRoute("/installations/$installationId")({
  head: () => ({
    meta: [
      { title: "Installation detail — AiravotoHead" },
      {
        name: "description",
        content: "Deep diagnostics for a single Airavoto POS installation: versions, database checks, clock drift and sync backlog.",
      },
      { property: "og:title", content: "Installation detail — AiravotoHead" },
      { property: "og:description", content: "Deep diagnostics for a single POS installation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstallationDetail,
});

function InstallationDetail() {
  const { installationId } = Route.useParams();
  const inst = installationById(installationId);

  if (!inst) {
    return (
      <EmptyState
        icon={MonitorSmartphone}
        title="Installation not found"
        description="This machine may have been de-registered. Return to the installations list."
      />
    );
  }

  const queue = syncEvents.filter((e) => e.installationId === inst.id).slice(0, 8);

  return (
    <>
      <PageHeader
        title={inst.machineName}
        description={
          <>
            <Mono>{inst.id}</Mono> ·{" "}
            <Link to="/cafes/$cafeId" params={{ cafeId: inst.cafeId }} className="underline underline-offset-2">
              {inst.cafeName}
            </Link>
          </>
        }
        actions={<StatusBadge status={inst.health} />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="App version" value={inst.appVersion} mono />
            <Field label="Service version" value={inst.serviceVersion} mono />
            <Field label="Operating system" value={inst.os} />
            <Field label="Rollout ring" value={inst.ring} />
            <Field label="Mode" value={<StatusBadge status={inst.mode} />} />
            <Field label="Registered" value={fmtDateTime(inst.registeredAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Local health checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Database readable" value={<StatusBadge status={inst.dbReadable ? "Healthy" : "Critical"} />} />
            <Field label="Database writable" value={<StatusBadge status={inst.dbWritable ? "Healthy" : "Critical"} />} />
            <Field label="Local API" value={<StatusBadge status={inst.localApiOk ? "Healthy" : "Critical"} />} />
            <Field label="Migration state" value={<StatusBadge status={inst.migration} />} />
            <Field label="Disk free" value={`${inst.diskFreeGb} GB`} />
            <Field label="Clock drift" value={`${inst.clockDriftMs} ms`} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connectivity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Last heartbeat" value={relTime(inst.lastHeartbeat)} />
            <Field label="Latency" value={`${inst.latencyMs} ms`} />
            <Field label="License token" value={<StatusBadge status={inst.tokenState} />} />
            <Field label="Sync queue depth" value={String(inst.syncQueue)} />
            <Field label="Last backup" value={relTime(inst.lastBackup)} />
            <Field label="Backup result" value={<StatusBadge status={inst.backupOk ? "Healthy" : "Critical"} />} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recent sync events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queued or recent sync events for this machine.</p>
          ) : (
            queue.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 text-sm last:border-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.state} />
                  <Mono>{e.entity}</Mono>
                  <span className="text-muted-foreground">{e.operation}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {e.lastError ?? "No error"} · {relTime(e.createdAt)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}
