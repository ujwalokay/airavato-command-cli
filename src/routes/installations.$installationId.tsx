import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Field, EmptyState, ConfirmAction } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { MonitorSmartphone } from "lucide-react";
import { fmtDateTime, relTime } from "@/lib/head-data";
import { useSession } from "@/components/head/session";
import {
  useHeartbeats,
  useInstallation,
  useRevokeInstallation,
  useSendHeartbeat,
  useSyncEvents,
} from "@/lib/head-db";

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
  const session = useSession();
  const { installation: inst, isLoading } = useInstallation(installationId);
  const heartbeats = useHeartbeats(installationId);
  const syncEvents = useSyncEvents();
  const [revokeOpen, setRevokeOpen] = useState(false);

  const actor = { name: session.name, role: session.roleLabel };
  const revokeMutation = useRevokeInstallation(actor);
  const heartbeatMutation = useSendHeartbeat(actor);

  if (isLoading) {
    return (
      <EmptyState
        icon={MonitorSmartphone}
        title="Loading installation…"
        description="Fetching live installation diagnostics."
      />
    );
  }

  if (!inst) {
    return (
      <EmptyState
        icon={MonitorSmartphone}
        title="Installation not found"
        description="This machine may have been de-registered. Return to the installations list."
      />
    );
  }

  const queue = syncEvents.data.filter((e) => e.installationId === inst.id).slice(0, 8);

  const handleHeartbeat = () => {
    void heartbeatMutation.mutateAsync(
      { installation: inst, healthy: inst.dbReadable && inst.dbWritable && inst.localApiOk },
      {
        onSuccess: () => toast.success("Heartbeat sent", { description: `${inst.machineName} checked in.` }),
        onError: (err) => toast.error("Failed to send heartbeat", { description: String(err) }),
      },
    );
  };

  const handleRevoke = (reason: string) => {
    void revokeMutation.mutateAsync(
      { installation: inst, reason },
      {
        onSuccess: () => {
          toast.success("Token revoked", { description: `${inst.machineName} must re-register.` });
          setRevokeOpen(false);
        },
        onError: (err) => toast.error("Failed to revoke token", { description: String(err) }),
      },
    );
  };

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
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={inst.health} />
            <Button variant="outline" size="sm" onClick={handleHeartbeat} disabled={heartbeatMutation.isPending}>
              Send heartbeat
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!session.can("installation.revoke") || inst.tokenState === "Revoked"}
              onClick={() => setRevokeOpen(true)}
            >
              Revoke token
            </Button>
          </div>
        }
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
          <CardTitle>Heartbeat history (24h)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {heartbeats.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading heartbeat history…</p>
          ) : heartbeats.data.length === 0 ? (
            <EmptyState
              icon={MonitorSmartphone}
              title="No heartbeats in the last 24 hours"
              description="This installation has not checked in recently."
            />
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {[...heartbeats.data].reverse().map((h) => (
                <div key={h.at} className="flex items-center justify-between border-b pb-1 text-sm last:border-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={h.healthy ? "Healthy" : "Critical"} />
                    <Mono className="text-xs text-muted-foreground">{h.appVersion}</Mono>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    queue {h.syncQueue} · {fmtDateTime(h.at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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

      <ConfirmAction
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title={`Revoke token for ${inst.machineName}`}
        target={[
          { label: "Installation ID", value: inst.id },
          { label: "Cafe", value: inst.cafeName },
        ]}
        effects={["The installation's license token is revoked immediately.", "The machine must re-register with a new code to sync again."]}
        recovery="A new registration code can be issued from the cafe's installation list."
        actionLabel="Revoke token"
        destructive
        onConfirm={handleRevoke}
      />
    </>
  );
}
