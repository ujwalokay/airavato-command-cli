/**
 * Domain model, roles and formatting helpers for the AiravotoHead operations console.
 * All records now come from the live platform database (see head-db.ts);
 * this module only owns types, policy and derivation rules.
 */

export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

export type Role =
  | "platform_owner"
  | "support_agent"
  | "operations_manager"
  | "cafe_owner"
  | "auditor";

export const ROLES: { id: Role; label: string; blurb: string }[] = [
  {
    id: "platform_owner",
    label: "Platform Owner",
    blurb: "Full control across cafes, licenses, releases and administrators.",
  },
  {
    id: "operations_manager",
    label: "Operations Manager",
    blurb: "Onboards cafes, approves installations, manages rollout rings.",
  },
  {
    id: "support_agent",
    label: "Support Agent",
    blurb: "Read-only diagnostics, safe sync retries, no destructive actions.",
  },
  { id: "cafe_owner", label: "Cafe Owner", blurb: "Sees only their own cafe and installation." },
  { id: "auditor", label: "Read-Only Auditor", blurb: "Dashboards and audit logs, no changes." },
];

export type Permission =
  | "cafe.create"
  | "cafe.archive"
  | "license.suspend"
  | "license.reactivate"
  | "license.rotate"
  | "installation.register"
  | "installation.revoke"
  | "sync.retry"
  | "sync.resolve"
  | "release.publish"
  | "settings.write"
  | "audit.export"
  | "support.bundle";

const PERMISSIONS: Record<Role, Permission[]> = {
  platform_owner: [
    "cafe.create",
    "cafe.archive",
    "license.suspend",
    "license.reactivate",
    "license.rotate",
    "installation.register",
    "installation.revoke",
    "sync.retry",
    "sync.resolve",
    "release.publish",
    "settings.write",
    "audit.export",
    "support.bundle",
  ],
  operations_manager: [
    "cafe.create",
    "license.reactivate",
    "installation.register",
    "installation.revoke",
    "sync.retry",
    "sync.resolve",
    "release.publish",
    "support.bundle",
  ],
  support_agent: ["sync.retry", "support.bundle"],
  cafe_owner: [],
  auditor: ["audit.export"],
};

export const PERMISSION_LIST: Permission[] = [
  "cafe.create",
  "cafe.archive",
  "license.suspend",
  "license.reactivate",
  "license.rotate",
  "installation.register",
  "installation.revoke",
  "sync.retry",
  "sync.resolve",
  "release.publish",
  "settings.write",
  "audit.export",
  "support.bundle",
];

export const can = (role: Role, p: Permission) => PERMISSIONS[role].includes(p);

export type LicenseState =
  | "Active"
  | "Trial"
  | "Offline Grace"
  | "Limited"
  | "Suspended"
  | "Revoked"
  | "Expired"
  | "Archived";

export const LICENSE_STATES: LicenseState[] = [
  "Active",
  "Trial",
  "Offline Grace",
  "Limited",
  "Suspended",
  "Revoked",
  "Expired",
  "Archived",
];

export type HealthState = "Healthy" | "Warning" | "Critical" | "Offline Grace" | "Suspended";

export const PLANS = ["Starter", "Growth", "Pro", "Enterprise"] as const;
export type Plan = (typeof PLANS)[number];

export const RINGS = [
  "Internal",
  "Pilot",
  "Small Commercial",
  "Regional",
  "General Availability",
] as const;
export type Ring = (typeof RINGS)[number];

export const FEATURES = [
  "public_booking",
  "cloud_sync",
  "inventory",
  "loyalty",
  "multi_shift",
  "remote_reports",
];

export type Cafe = {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  owner: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: Plan;
  license: LicenseState;
  installations: number;
  lastHeartbeat: number | null;
  publicState: "Live" | "Hidden" | "Draft" | "Disabled";
  posVersion: string;
  createdAt: number;
  health: HealthState;
  attention: boolean;
  timezone: string;
  currency: string;
  description: string;
  amenities: string[];
  devices: number;
  bookings30d: number;
  activeSessions: number;
  inventoryItems: number;
  staff: number;
  pageVisits30d: number;
  bookingEnabled: boolean;
  profileCompletion: number;
  seatLimit: number;
  installationLimit: number;
  archived: boolean;
};

export type Installation = {
  id: string;
  cafeId: string;
  cafeName: string;
  machineName: string;
  appVersion: string;
  serviceVersion: string;
  os: string;
  lastHeartbeat: number | null;
  lastBackup: number | null;
  backupOk: boolean;
  syncQueue: number;
  tokenState: "Valid" | "Rotating" | "Expired" | "Revoked";
  health: HealthState;
  ring: Ring;
  registeredAt: number | null;
  registrationCode: string | null;
  mode: "Local only" | "Connected" | "Sync enabled";
  clockDriftMs: number;
  diskFreeGb: number;
  latencyMs: number;
  dbReadable: boolean;
  dbWritable: boolean;
  localApiOk: boolean;
  migration: "Up to date" | "Pending" | "Failed";
};

export type License = {
  id: string;
  cafeId: string;
  cafeName: string;
  plan: Plan;
  state: LicenseState;
  startDate: number;
  renewalDate: number | null;
  graceEnds: number | null;
  installationLimit: number;
  deviceLimit: number;
  features: string[];
  tokenVersion: number;
  lastValidation: number | null;
  suspensionReason?: string | undefined;
  reactivations: number;
};

export type SyncEvent = {
  id: string;
  cafeId: string;
  cafeName: string;
  installationId: string | null;
  entity: string;
  operation: "create" | "update" | "delete";
  createdAt: number;
  retries: number;
  lastError?: string | undefined;
  state:
    | "Queued"
    | "Sending"
    | "Acknowledged"
    | "Failed"
    | "Conflict"
    | "Ignored"
    | "Manually resolved";
  protectedEntity: boolean;
};

export type Release = {
  id: string;
  version: string;
  channel: "Stable" | "Beta" | "Internal";
  notes: string;
  migrationRange: string;
  publishedAt: number | null;
  rolloutPct: number;
  failedInstalls: number;
  rollbackAvailable: boolean;
  ring: Ring;
};

export type Incident = {
  id: string;
  cafeId: string;
  cafeName: string;
  installationId: string | null;
  kind: string;
  severity: "Critical" | "Warning";
  openedAt: number;
  status: "Open" | "Investigating" | "Resolved";
  summary: string;
};

export type AuditRecord = {
  id: string;
  at: number;
  actor: string;
  actorRole: string;
  action: string;
  targetType: "Cafe" | "License" | "Installation" | "Release" | "SyncEvent" | "Settings" | "Support";
  targetId: string;
  cafeId?: string | undefined;
  cafeName?: string | undefined;
  reason: string;
  before: string;
  after: string;
  context: string;
  result: "Success" | "Failed" | "Denied";
};

export type PlatformSettings = {
  gracePeriodDays: number;
  heartbeatIntervalMin: number;
  offlineThresholdHours: number;
  backupWarningHours: number;
  supportedVersions: string[];
  publicBookingDefault: boolean;
  rolloutFailureThresholdPct: number;
  supportEmail: string;
  supportPhone: string;
  auditRetentionDays: number;
  notifyEmail: boolean;
  notifyInApp: boolean;
};

/** Deterministic health rule shared by installations, cafes and the health monitor. */
export function deriveHealth(input: {
  license: LicenseState;
  lastHeartbeat: number | null;
  backupOk?: boolean;
  now?: number;
}): HealthState {
  const now = input.now ?? Date.now();
  if (input.license === "Suspended" || input.license === "Revoked") return "Suspended";
  if (input.license === "Offline Grace") return "Offline Grace";
  if (input.lastHeartbeat == null) return "Warning";
  const age = now - input.lastHeartbeat;
  if (input.backupOk === false || age > 2 * DAY) return "Critical";
  if (age > 3 * HOUR) return "Warning";
  return "Healthy";
}

export function relTime(ts: number | null | undefined): string {
  if (ts == null) return "never";
  const d = Date.now() - ts;
  if (d < 0) return "scheduled";
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function fmtDate(ts: number | null | undefined) {
  if (ts == null) return "—";
  return new Date(ts).toISOString().slice(0, 10);
}

export function fmtDateTime(ts: number | null | undefined) {
  if (ts == null) return "—";
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
