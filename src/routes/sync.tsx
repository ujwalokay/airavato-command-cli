import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/head/data-table";
import { PageHeader, EmptyState, KpiCard, Hint } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/components/head/session";
import { relTime, syncEvents, type SyncEvent } from "@/lib/head-data";

export const Route = createFileRoute("/sync")({
  head: () => ({
    meta: [
      { title: "Sync center — AiravotoHead" },
      {
        name: "description",
        content: "Inspect the cloud sync queue: failed events, conflicts, retry counts and protected entities that must be resolved manually.",
      },
      { property: "og:title", content: "Sync center — AiravotoHead" },
      { property: "og:description", content: "Failed events, conflicts, retries and protected entities in the sync queue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SyncPage,
});

function SyncPage() {
  const session = useSession();
  const [state, setState] = useState("all");
  const rows = syncEvents.filter((e) => state === "all" || e.state === state);

  const columns: Column<SyncEvent>[] = [
    {
      key: "id",
      header: "Event",
      render: (e) => (
        <div className="min-w-0">
          <Mono>{e.id}</Mono>
          <div className="truncate text-xs text-muted-foreground">{e.cafeName}</div>
        </div>
      ),
      sort: (e) => e.id,
    },
    { key: "entity", header: "Entity", render: (e) => <Mono>{e.entity}</Mono>, sort: (e) => e.entity },
    { key: "op", header: "Operation", render: (e) => e.operation, sort: (e) => e.operation },
    { key: "state", header: "State", render: (e) => <StatusBadge status={e.state} />, sort: (e) => e.state },
    { key: "retries", header: "Retries", render: (e) => String(e.retries), sort: (e) => e.retries },
    { key: "error", header: "Last error", render: (e) => e.lastError ?? "—" },
    {
      key: "protected",
      header: "Protected",
      render: (e) => (e.protectedEntity ? <StatusBadge status="Warning" /> : "—"),
      defaultHidden: true,
    },
    {
      key: "created",
      header: "Queued",
      render: (e) => <span className="text-muted-foreground">{relTime(e.createdAt)}</span>,
      sort: (e) => e.createdAt,
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <Button
          variant="ghost"
          size="sm"
          disabled={!session.can("sync.retry") || e.state === "Acknowledged"}
          onClick={() => toast.success(`Retry queued for ${e.id}`, { description: "The local service will replay this event on its next poll." })}
        >
          Retry
        </Button>
      ),
    },
  ];

  const failed = syncEvents.filter((e) => e.state === "Failed").length;
  const conflicts = syncEvents.filter((e) => e.state === "Conflict").length;
  const queued = syncEvents.filter((e) => e.state === "Queued" || e.state === "Sending").length;

  return (
    <>
      <PageHeader
        title="Sync center"
        description="Events flow from each local POS to the cloud. Nothing is deleted here: retries are replayed by the local service and conflicts require an explicit resolution."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard label="In flight" value={String(queued)} hint="Queued or sending" />
        <KpiCard label="Failed" value={String(failed)} hint="Retryable transport errors" />
        <KpiCard label="Conflicts" value={String(conflicts)} hint="Need manual resolution" />
      </div>

      <div className="mb-4">
        <Hint text="Retrying a protected entity such as a payment never duplicates records: events are keyed by idempotency ID." />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(e) => e.id}
        search={(e) => `${e.id} ${e.cafeName} ${e.entity} ${e.state} ${e.lastError ?? ""}`}
        searchPlaceholder="Search by event, cafe, entity or error…"
        exportName="airavoto-sync-events"
        filters={
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="h-9 w-48" aria-label="Filter by sync state">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {["all", "Queued", "Sending", "Acknowledged", "Failed", "Conflict", "Ignored", "Manually resolved"].map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All states" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        empty={<EmptyState icon={RefreshCcw} title="Queue is clear" description="No sync events match this filter." />}
      />
    </>
  );
}
