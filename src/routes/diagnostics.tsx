import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Field, Hint, ConfirmAction, PermissionDenied } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { useSession } from "@/components/head/session";
import { installations, relTime } from "@/lib/head-data";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Support diagnostics — AiravotoHead" },
      {
        name: "description",
        content: "Run read-only diagnostics against a single Airavoto POS installation and request time-boxed support access with a recorded reason.",
      },
      { property: "og:title", content: "Support diagnostics — AiravotoHead" },
      { property: "og:description", content: "Read-only machine diagnostics and time-boxed support access requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosticsPage,
});

function DiagnosticsPage() {
  const session = useSession();
  const [id, setId] = useState(installations[0]?.id ?? "");
  const [asking, setAsking] = useState(false);
  const inst = installations.find((i) => i.id === id);

  if (!session.can("support.bundle")) return <PermissionDenied what="run support diagnostics" />;

  return (
    <>
      <PageHeader
        title="Support diagnostics"
        description="Diagnostics are read-only and never expose cafe business data. Elevated support access is time-boxed and always audited."
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Select an installation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Select value={id} onValueChange={setId}>
            <SelectTrigger className="w-full max-w-md" aria-label="Installation">
              <SelectValue placeholder="Choose an installation" />
            </SelectTrigger>
            <SelectContent>
              {installations.slice(0, 60).map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.cafeName} — {i.machineName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            onClick={() => toast.success("Diagnostic bundle requested", { description: "The local service uploads logs on its next heartbeat." })}
          >
            Request log bundle
          </Button>
          <Button variant="ghost" onClick={() => setAsking(true)}>
            Request support access
          </Button>
        </CardContent>
      </Card>

      {inst && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Mono>{inst.id}</Mono> · {inst.machineName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Field label="Cafe" value={inst.cafeName} />
              <Field label="Health" value={<StatusBadge status={inst.health} />} />
              <Field label="App / service" value={`${inst.appVersion} / ${inst.serviceVersion}`} mono />
              <Field label="Last heartbeat" value={relTime(inst.lastHeartbeat)} />
              <Field label="Latency" value={`${inst.latencyMs} ms`} />
              <Field label="Clock drift" value={`${inst.clockDriftMs} ms`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated checks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Field label="Database readable" value={<StatusBadge status={inst.dbReadable ? "Healthy" : "Critical"} />} />
              <Field label="Database writable" value={<StatusBadge status={inst.dbWritable ? "Healthy" : "Critical"} />} />
              <Field label="Local API reachable" value={<StatusBadge status={inst.localApiOk ? "Healthy" : "Critical"} />} />
              <Field label="Migration state" value={<StatusBadge status={inst.migration} />} />
              <Field label="Disk free" value={`${inst.diskFreeGb} GB`} />
              <Field label="Sync backlog" value={String(inst.syncQueue)} />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-4">
        <Hint text="Support access grants a read-only session for 60 minutes. The cafe owner is notified and the reason is written to the audit log." />
      </div>

      {asking && inst && (
        <ConfirmAction
          open
          onOpenChange={(o) => !o && setAsking(false)}
          title="Request time-boxed support access"
          target={[
            { label: "Cafe", value: inst.cafeName },
            { label: "Machine", value: inst.machineName },
            { label: "Installation ID", value: inst.id },
          ]}
          effects={[
            "A read-only support session is opened for 60 minutes.",
            "The cafe owner receives an email naming you and your reason.",
            "Every screen you open is recorded in the audit log.",
          ]}
          recovery="Access expires automatically; you can end it early from this page."
          actionLabel="Request access"
          onConfirm={() => {
            toast.success("Support access granted for 60 minutes");
            setAsking(false);
          }}
        />
      )}
    </>
  );
}
