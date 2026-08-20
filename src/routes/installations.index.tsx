import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MonitorSmartphone } from "lucide-react";
import { DataTable, type Column } from "@/components/head/data-table";
import { PageHeader, EmptyState } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { relTime, type Installation } from "@/lib/head-data";
import { usePlatform } from "@/lib/head-db";

export const Route = createFileRoute("/installations/")({
  head: () => ({
    meta: [
      { title: "Installations — AiravotoHead" },
      {
        name: "description",
        content:
          "Every registered Airavoto POS installation with app version, heartbeat, backup status, sync queue depth and token state.",
      },
      { property: "og:title", content: "Installations — AiravotoHead" },
      {
        property: "og:description",
        content: "Registered POS machines with versions, heartbeats, backups and token state.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InstallationsPage,
});

function InstallationsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = usePlatform();
  const [health, setHealth] = useState("all");
  const [ring, setRing] = useState("all");

  const rows = data.installations.filter(
    (i) => (health === "all" || i.health === health) && (ring === "all" || i.ring === ring),
  );

  const columns: Column<Installation>[] = [
    {
      key: "machine",
      header: "Machine",
      render: (i) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{i.machineName}</div>
          <Mono className="text-xs text-muted-foreground">{i.id}</Mono>
        </div>
      ),
      sort: (i) => i.machineName,
    },
    { key: "cafe", header: "Cafe", render: (i) => i.cafeName, sort: (i) => i.cafeName },
    { key: "health", header: "Health", render: (i) => <StatusBadge status={i.health} />, sort: (i) => i.health },
    { key: "version", header: "App", render: (i) => <Mono>{i.appVersion}</Mono>, sort: (i) => i.appVersion },
    { key: "ring", header: "Ring", render: (i) => i.ring, sort: (i) => i.ring },
    { key: "mode", header: "Mode", render: (i) => <StatusBadge status={i.mode} />, sort: (i) => i.mode },
    { key: "token", header: "Token", render: (i) => <StatusBadge status={i.tokenState} />, sort: (i) => i.tokenState },
    {
      key: "queue",
      header: "Sync queue",
      render: (i) => <span className={i.syncQueue > 20 ? "text-warn" : ""}>{i.syncQueue}</span>,
      sort: (i) => i.syncQueue,
    },
    {
      key: "backup",
      header: "Backup",
      render: (i) => <StatusBadge status={i.backupOk ? "Healthy" : "Critical"} />,
      sort: (i) => String(i.backupOk),
    },
    {
      key: "hb",
      header: "Heartbeat",
      render: (i) => <span className="text-muted-foreground">{relTime(i.lastHeartbeat)}</span>,
      sort: (i) => i.lastHeartbeat ?? 0,
    },
    { key: "os", header: "OS", render: (i) => i.os, sort: (i) => i.os, defaultHidden: true },
  ];

  return (
    <>
      <PageHeader
        title="Installations"
        description="Locally installed POS machines. Heartbeats, backups and sync queues are reported by the local service; no cafe data is stored centrally."
      />
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(i) => i.id}
        loading={isLoading}
        search={(i) => `${i.machineName} ${i.cafeName} ${i.id} ${i.appVersion} ${i.os}`}
        searchPlaceholder="Search machine, cafe or version…"
        exportName="airavoto-installations"
        onRowClick={(i) => navigate({ to: "/installations/$installationId", params: { installationId: i.id } })}
        filters={
          <>
            <Select value={health} onValueChange={setHealth}>
              <SelectTrigger className="h-9 w-40" aria-label="Filter by health">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Healthy", "Warning", "Critical", "Offline Grace", "Suspended"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All health states" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ring} onValueChange={setRing}>
              <SelectTrigger className="h-9 w-36" aria-label="Filter by ring">
                <SelectValue placeholder="Ring" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Canary", "Early", "Regional", "General"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All rings" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        empty={
          <EmptyState
            icon={MonitorSmartphone}
            title="No installations match these filters"
            description="Try a different health state or rollout ring."
          />
        }
      />
    </>
  );
}
