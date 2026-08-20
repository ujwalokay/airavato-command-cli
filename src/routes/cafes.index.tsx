import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, ExternalLink, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type Column } from "@/components/head/data-table";
import { StatusBadge, Mono } from "@/components/head/status-badge";
import { ConfirmAction, EmptyState, PageHeader } from "@/components/head/primitives";
import { useSession } from "@/components/head/session";
import { cafes, fmtDate, relTime, type Cafe } from "@/lib/head-data";

export const Route = createFileRoute("/cafes/")({
  head: () => ({
    meta: [
      { title: "Cafe Directory — AiravotoHead" },
      {
        name: "description",
        content:
          "Every Airavoto cafe tenant with plan, license state, installation count, heartbeat and public AiravotoCafe status.",
      },
      { property: "og:title", content: "Cafe Directory — AiravotoHead" },
      {
        property: "og:description",
        content: "Manage cafe tenants, licenses and public profiles from one directory.",
      },
    ],
  }),
  component: CafeDirectory,
});

function CafeDirectory() {
  const navigate = useNavigate();
  const session = useSession();
  const [license, setLicense] = useState("all");
  const [health, setHealth] = useState("all");
  const [pending, setPending] = useState<{ cafe: Cafe; kind: "suspend" | "archive" } | null>(null);

  const scoped = session.scopedCafeId
    ? cafes.filter((c) => c.id === session.scopedCafeId)
    : cafes;
  const rows = scoped.filter(
    (c) =>
      (license === "all" || c.license === license) && (health === "all" || c.health === health),
  );

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
    { key: "loc", header: "City / State", sort: (c) => c.city, render: (c) => `${c.city}, ${c.state}` },
    { key: "owner", header: "Owner", sort: (c) => c.owner, render: (c) => c.owner },
    { key: "plan", header: "Plan", sort: (c) => c.plan, render: (c) => c.plan },
    {
      key: "license",
      header: "License",
      sort: (c) => c.license,
      render: (c) => <StatusBadge status={c.license} />,
    },
    {
      key: "inst",
      header: "Installs",
      sort: (c) => c.installations,
      render: (c) => <span className="tabular-nums">{c.installations}</span>,
    },
    {
      key: "hb",
      header: "Last heartbeat",
      sort: (c) => c.lastHeartbeat,
      render: (c) => <span className="text-muted-foreground">{relTime(c.lastHeartbeat)}</span>,
    },
    {
      key: "public",
      header: "AiravotoCafe",
      sort: (c) => c.publicState,
      render: (c) => <StatusBadge status={c.publicState} />,
    },
    {
      key: "pos",
      header: "POS version",
      sort: (c) => c.posVersion,
      render: (c) => <Mono>{c.posVersion}</Mono>,
    },
    {
      key: "created",
      header: "Created",
      sort: (c) => c.createdAt,
      defaultHidden: true,
      render: (c) => fmtDate(c.createdAt),
    },
    {
      key: "attention",
      header: "Attention",
      sort: (c) => (c.attention ? 1 : 0),
      render: (c) =>
        c.attention ? <StatusBadge status="Needs Attention" /> : <StatusBadge status="Healthy" />,
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${c.name}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={() => navigate({ to: "/cafes/$cafeId", params: { cafeId: c.id } })}>
              View cafe
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/installations" })}>
              View installations
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/licenses" })}>
              View license
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/diagnostics" })}>
              View support health
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => toast.info(`Public page: airavoto.cafe/${c.slug}`)}
            >
              <ExternalLink className="size-4" /> Open AiravotoCafe page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {c.license === "Suspended" ? (
              <DropdownMenuItem
                disabled={!session.can("license.reactivate")}
                onSelect={() => setPending({ cafe: c, kind: "suspend" })}
              >
                Reactivate license
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-danger focus:text-danger"
                disabled={!session.can("license.suspend")}
                onSelect={() => setPending({ cafe: c, kind: "suspend" })}
              >
                Suspend license and disable new cloud bookings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              disabled={!session.can("cafe.archive")}
              onSelect={() => setPending({ cafe: c, kind: "archive" })}
            >
              Archive cafe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const suspending = pending?.kind === "suspend" && pending.cafe.license !== "Suspended";
  const reactivating = pending?.kind === "suspend" && pending.cafe.license === "Suspended";

  return (
    <>
      <PageHeader
        title="Cafe directory"
        description="Each cafe is an isolated tenant with its own installations, license, public slug and admin users. Cafe data is never mixed across tenants."
        actions={
          <Button asChild disabled={!session.can("cafe.create")}>
            <Link to="/cafes/new">
              <Plus className="size-4" /> Add cafe
            </Link>
          </Button>
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(c) => c.id}
        search={(c) => `${c.name} ${c.slug} ${c.city} ${c.owner} ${c.plan} ${c.license}`}
        searchPlaceholder="Search by cafe, slug, owner or city…"
        exportName="airavoto-cafes"
        onRowClick={(c) => navigate({ to: "/cafes/$cafeId", params: { cafeId: c.id } })}
        filters={
          <>
            <Select value={license} onValueChange={setLicense}>
              <SelectTrigger className="h-9 w-40" aria-label="Filter by license">
                <SelectValue placeholder="License" />
              </SelectTrigger>
              <SelectContent>
                {["all", "Active", "Trial", "Offline Grace", "Suspended", "Revoked", "Expired"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s === "all" ? "All licenses" : s}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
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
          </>
        }
        empty={
          <EmptyState
            icon={Building2}
            title="No cafes match these filters"
            description="Adjust the license or health filter, or onboard a new cafe with the add cafe wizard."
          />
        }
      />

      {pending && (
        <ConfirmAction
          open
          onOpenChange={(o) => !o && setPending(null)}
          destructive={!reactivating}
          title={
            reactivating
              ? "Reactivate license and restore cloud features"
              : pending.kind === "archive"
                ? "Archive cafe and hide its public page"
                : "Suspend license and disable new cloud bookings"
          }
          target={[
            { label: "Cafe", value: pending.cafe.name },
            { label: "Cafe ID", value: pending.cafe.id },
            { label: "Public slug", value: pending.cafe.slug },
            { label: "Installations", value: String(pending.cafe.installations) },
          ]}
          effects={
            reactivating
              ? [
                  "A new signed license token is issued to every registered installation.",
                  "Cloud sync, public bookings and remote reports are restored.",
                  "The cafe owner is notified by email.",
                ]
              : pending.kind === "archive"
                ? [
                    "The cafe is hidden from the directory and its AiravotoCafe page returns 404.",
                    "Installations stop receiving updates but keep all local data.",
                    "License history and audit records are retained permanently.",
                  ]
                : [
                    "New cloud bookings from AiravotoCafe are rejected.",
                    "The license token is revoked; the POS enters transparent limited mode.",
                    "The cafe owner receives a suspension notice with the reason you enter.",
                  ]
          }
          delayedEffects={
            reactivating
              ? undefined
              : [
                  "Local POS keeps running offline: no data is deleted and existing records stay exportable.",
                  "After the grace period ends, remote reporting and cloud sync stop until reactivation.",
                ]
          }
          recovery={
            reactivating
              ? "If reactivation was made in error, suspend again from the license page — history is preserved."
              : "Reactivate from Licenses at any time. All data, exports and support access remain available."
          }
          confirmWord={
            reactivating ? undefined : pending.kind === "archive" ? "ARCHIVE CAFE" : "SUSPEND CAFE"
          }
          actionLabel={
            reactivating ? "Reactivate license" : pending.kind === "archive" ? "Archive cafe" : "Suspend license"
          }
          onConfirm={() => {
            toast.success(
              `${reactivating ? "Reactivated" : pending.kind === "archive" ? "Archived" : "Suspended"} ${pending.cafe.name}`,
              { description: "Audit record AUD-9F21C written. Cafe owner notified." },
            );
          }}
        />
      )}
    </>
  );
}
