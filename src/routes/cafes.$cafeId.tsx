import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Field, EmptyState } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import {
  auditLogs,
  cafeById,
  fmtDate,
  installations,
  licenses,
  relTime,
} from "@/lib/head-data";

export const Route = createFileRoute("/cafes/$cafeId")({
  head: () => ({
    meta: [
      { title: "Cafe detail — AiravotoHead" },
      {
        name: "description",
        content: "Tenant overview for a single cafe: installations, license state, public page status and recent administrative actions.",
      },
      { property: "og:title", content: "Cafe detail — AiravotoHead" },
      { property: "og:description", content: "Tenant overview: installations, license, public page and audit trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CafeDetail,
});

function CafeDetail() {
  const { cafeId } = Route.useParams();
  const cafe = cafeById(cafeId);

  if (!cafe) {
    return (
      <EmptyState
        icon={Building2}
        title="Cafe not found"
        description="This tenant may have been archived. Go back to the cafe directory to search again."
      />
    );
  }

  const insts = installations.filter((i) => i.cafeId === cafe.id);
  const license = licenses.find((l) => l.cafeId === cafe.id);
  const trail = auditLogs.filter((a) => a.cafeId === cafe.id).slice(0, 8);

  return (
    <>
      <PageHeader
        title={cafe.name}
        description={
          <>
            <Mono>{cafe.id}</Mono> · airavoto.cafe/{cafe.slug} · {cafe.city}, {cafe.state}
          </>
        }
        actions={
          <div className="flex gap-2">
            <StatusBadge status={cafe.health} />
            <StatusBadge status={cafe.license} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Owner" value={cafe.owner} />
            <Field label="Owner email" value={cafe.ownerEmail} />
            <Field label="Plan" value={cafe.plan} />
            <Field label="Timezone" value={cafe.timezone} />
            <Field label="Currency" value={cafe.currency} />
            <Field label="Onboarded" value={fmtDate(cafe.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="License ID" value={license?.id ?? "—"} mono />
            <Field label="State" value={<StatusBadge status={cafe.license} />} />
            <Field label="Renewal" value={license ? fmtDate(license.renewalDate) : "—"} />
            <Field label="Installation limit" value={`${insts.length} / ${cafe.installationLimit}`} />
            <Field label="Device limit" value={`${cafe.devices} / ${license?.deviceLimit ?? cafe.seatLimit}`} />
            <Field label="Token version" value={String(license?.tokenVersion ?? 1)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AiravotoCafe page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Public state" value={<StatusBadge status={cafe.publicState} />} />
            <Field label="Online booking" value={cafe.bookingEnabled ? "Enabled" : "Disabled"} />
            <Field label="Profile completion" value={`${cafe.profileCompletion}%`} />
            <Field label="Page visits (30d)" value={cafe.pageVisits30d.toLocaleString()} />
            <Field label="Bookings (30d)" value={cafe.bookings30d.toLocaleString()} />
            <Field label="Last heartbeat" value={cafe.lastHeartbeat ? relTime(cafe.lastHeartbeat) : "Never"} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Installations ({insts.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insts.map((i) => (
              <Link
                key={i.id}
                to="/installations/$installationId"
                params={{ installationId: i.id }}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium">{i.machineName}</span>{" "}
                  <Mono className="text-xs text-muted-foreground">{i.appVersion}</Mono>
                </span>
                <StatusBadge status={i.health} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent administrative actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trail.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recorded actions for this cafe yet.</p>
            ) : (
              trail.map((a) => (
                <div key={a.id} className="border-b pb-2 text-sm last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <Mono>{a.action}</Mono>
                    <span className="text-xs text-muted-foreground">{relTime(a.at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.actor} ({a.actorRole}) — {a.reason}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
