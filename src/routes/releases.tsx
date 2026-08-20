import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageHeader, Field, Hint } from "@/components/head/primitives";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { useSession } from "@/components/head/session";
import { fmtDate, installations, releases, RINGS } from "@/lib/head-data";

export const Route = createFileRoute("/releases")({
  head: () => ({
    meta: [
      { title: "Software releases — AiravotoHead" },
      {
        name: "description",
        content: "Publish Airavoto POS builds ring by ring, track rollout percentage, failed installs and database migration ranges.",
      },
      { property: "og:title", content: "Software releases — AiravotoHead" },
      { property: "og:description", content: "Ring-based rollouts, migration ranges and rollback availability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReleasesPage,
});

function ReleasesPage() {
  const session = useSession();

  return (
    <>
      <PageHeader
        title="Software releases"
        description="Updates roll out in rings. A build only advances when the previous ring reports healthy heartbeats and completed migrations."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {RINGS.map((ring) => {
          const inRing = installations.filter((i) => i.ring === ring);
          return (
            <Card key={ring}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{ring} ring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{inRing.length}</p>
                <p className="text-xs text-muted-foreground">installations targeted</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        {releases.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mono>v{r.version}</Mono>
                  <StatusBadge status={r.channel} />
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!r.rollbackAvailable || !session.can("release.publish")}
                  onClick={() => toast.info(`Rollback prepared for v${r.version}`, { description: "Affected installations revert on their next update check." })}
                >
                  Roll back
                </Button>
                <Button
                  size="sm"
                  disabled={!session.can("release.publish") || r.rolloutPct >= 100}
                  onClick={() => toast.success(`v${r.version} advanced to the next ring`, { description: "Audit record written. Owners are notified before install." })}
                >
                  Advance ring
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-4">
                <Field label="Ring" value={r.ring} />
                <Field label="Migrations" value={r.migrationRange} mono />
                <Field label="Published" value={r.publishedAt ? fmtDate(r.publishedAt) : "Not published"} />
                <Field label="Failed installs" value={String(r.failedInstalls)} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Rollout</span>
                  <span className="tabular-nums">{r.rolloutPct}%</span>
                </div>
                <Progress value={r.rolloutPct} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <Hint text="Database migrations are one-way. A rollback restores the previous binary only when the migration range is unchanged." />
      </div>
    </>
  );
}
