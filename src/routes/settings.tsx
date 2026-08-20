import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, Field, Hint } from "@/components/head/primitives";
import { StatusBadge } from "@/components/head/status-badge";
import { ROLES, PERMISSION_LIST, can } from "@/lib/head-data";
import { useSession } from "@/components/head/session";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — AiravotoHead" },
      {
        name: "description",
        content: "Platform-wide defaults for AiravotoHead: roles and permissions, grace windows, heartbeat thresholds and audit retention.",
      },
      { property: "og:title", content: "Platform settings — AiravotoHead" },
      { property: "og:description", content: "Roles, grace windows, heartbeat thresholds and audit retention." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const session = useSession();

  return (
    <>
      <PageHeader
        title="Platform settings"
        description="These defaults apply to every cafe tenant. Changing them affects all 100 installations and is recorded in the audit log."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Operational thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Heartbeat warning" value="15 minutes without contact" />
            <Field label="Heartbeat critical" value="2 hours without contact" />
            <Field label="Offline licence grace" value="14 days" />
            <Field label="Sync retry ceiling" value="8 attempts, exponential backoff" />
            <Field label="Backup expectation" value="Daily, verified locally" />
            <Field label="Audit retention" value="Permanent, append-only" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Field label="Active role" value={<StatusBadge status={session.role} tone="brand" />} />
            <Field label="Theme" value={session.theme === "dark" ? "Dark" : "Light"} />
            <Field label="Scope" value="All cafes in this platform tenant" />
            <Hint text="Role switching here is a demo control. In production, roles come from your identity provider and cannot be self-assigned." />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Roles and permissions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Permission</th>
                {ROLES.map((r) => (
                  <th key={r.id} className="px-2 py-2 font-medium">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_LIST.map((p) => (
                <tr key={p} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono text-xs">{p}</td>
                  {ROLES.map((r) => (
                    <td key={r.id} className="px-2 py-2">
                      {can(r.id, p) ? (
                        <span className="text-ok">Allowed</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}