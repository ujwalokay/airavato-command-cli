import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileClock } from "lucide-react";
import { DataTable, type Column } from "@/components/head/data-table";
import { PageHeader, EmptyState, Hint } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auditLogs, fmtDateTime, type AuditRecord } from "@/lib/head-data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit logs — AiravotoHead" },
      {
        name: "description",
        content: "Immutable record of every administrative action across cafes, licenses, installations and releases, with actor, reason and before/after values.",
      },
      { property: "og:title", content: "Audit logs — AiravotoHead" },
      { property: "og:description", content: "Immutable actor, reason and before/after trail for every administrative action." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [target, setTarget] = useState("all");
  const [result, setResult] = useState("all");
  const rows = auditLogs.filter(
    (a) => (target === "all" || a.targetType === target) && (result === "all" || a.result === result),
  );

  const columns: Column<AuditRecord>[] = [
    { key: "at", header: "When", render: (a) => fmtDateTime(a.at), sort: (a) => a.at },
    {
      key: "actor",
      header: "Actor",
      render: (a) => (
        <div>
          <div className="font-medium">{a.actor}</div>
          <div className="text-xs text-muted-foreground">{a.actorRole}</div>
        </div>
      ),
      sort: (a) => a.actor,
    },
    { key: "action", header: "Action", render: (a) => <Mono>{a.action}</Mono>, sort: (a) => a.action },
    {
      key: "targetType",
      header: "Target",
      render: (a) => (
        <div>
          <div>{a.targetType}</div>
          <Mono className="text-xs text-muted-foreground">{a.targetId}</Mono>
        </div>
      ),
      sort: (a) => a.targetType,
    },
    { key: "cafe", header: "Cafe", render: (a) => a.cafeName ?? "—", sort: (a) => a.cafeName ?? "" },
    { key: "reason", header: "Reason", render: (a) => a.reason },
    { key: "before", header: "Before", render: (a) => <Mono>{a.before}</Mono>, defaultHidden: true },
    { key: "after", header: "After", render: (a) => <Mono>{a.after}</Mono>, defaultHidden: true },
    { key: "context", header: "Context", render: (a) => a.context, defaultHidden: true },
    { key: "result", header: "Result", render: (a) => <StatusBadge status={a.result} />, sort: (a) => a.result },
  ];

  return (
    <>
      <PageHeader
        title="Audit logs"
        description="Records are append-only and retained permanently. Every high-stakes action stores the operator, their reason and the exact before and after values."
      />

      <div className="mb-4">
        <Hint text="Exports include hidden columns. Share audit extracts only with authorised reviewers." />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(a) => a.id}
        search={(a) => `${a.actor} ${a.action} ${a.targetId} ${a.cafeName ?? ""} ${a.reason}`}
        searchPlaceholder="Search by actor, action, target or reason…"
        exportName="airavoto-audit"
        pageSize={15}
        dense
        filters={
          <>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="h-9 w-40" aria-label="Filter by target type">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Cafe", "License", "Installation", "Release", "SyncEvent", "Settings", "Support"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All targets" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={result} onValueChange={setResult}>
              <SelectTrigger className="h-9 w-36" aria-label="Filter by result">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Success", "Failed", "Denied"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All results" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        empty={<EmptyState icon={FileClock} title="No audit records match" description="Widen the target or result filter." />}
      />
    </>
  );
}
