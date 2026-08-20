/**
 * Deterministic mock dataset for the AiravotoHead operations console.
 * All values derive from a fixed seed + fixed epoch so SSR and client render identically.
 */

export const NOW = Date.parse("2026-08-20T06:00:00.000Z");
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const pick = <T,>(r: () => number, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!;

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

export type HealthState = "Healthy" | "Warning" | "Critical" | "Offline Grace" | "Suspended";

export type Cafe = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  owner: string;
  ownerEmail: string;
  plan: "Starter" | "Growth" | "Pro" | "Enterprise";
  license: LicenseState;
  installations: number;
  lastHeartbeat: number;
  publicState: "Live" | "Hidden" | "Draft" | "Disabled";
  posVersion: string;
  createdAt: number;
  health: HealthState;
  attention: boolean;
  timezone: string;
  currency: string;
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
};

const CITIES: [string, string][] = [
  ["Bengaluru", "Karnataka"],
  ["Hyderabad", "Telangana"],
  ["Pune", "Maharashtra"],
  ["Mumbai", "Maharashtra"],
  ["Chennai", "Tamil Nadu"],
  ["Kochi", "Kerala"],
  ["Jaipur", "Rajasthan"],
  ["Indore", "Madhya Pradesh"],
  ["Delhi", "Delhi"],
  ["Ahmedabad", "Gujarat"],
  ["Kolkata", "West Bengal"],
  ["Chandigarh", "Punjab"],
];

const NAME_A = [
  "Nexus",
  "Vortex",
  "Pixel",
  "Arena",
  "Frag",
  "Orbit",
  "Titan",
  "Echo",
  "Cyber",
  "Storm",
  "Quantum",
  "Neon",
  "Iron",
  "Zenith",
  "Apex",
  "Cobalt",
  "Rogue",
  "Halo",
  "Fusion",
  "Rift",
];
const NAME_B = [
  "Gaming Lounge",
  "Esports Arena",
  "Cyber Cafe",
  "Game Hub",
  "LAN House",
  "Play Station",
  "Battlegrounds",
  "Game Point",
];
const OWNERS = [
  "Rahul Menon",
  "Aditi Sharma",
  "Vikram Rao",
  "Sana Qureshi",
  "Karthik Iyer",
  "Neha Gupta",
  "Imran Sheikh",
  "Pooja Nair",
  "Dev Patel",
  "Anjali Verma",
  "Rohit Das",
  "Meera Krishnan",
];
const VERSIONS = ["3.4.2", "3.4.0", "3.3.6", "3.3.1", "3.2.8"];
const PLANS = ["Starter", "Growth", "Pro", "Enterprise"] as const;
export const RINGS = [
  "Internal",
  "Pilot",
  "Small Commercial",
  "Regional",
  "General Availability",
] as const;
export type Ring = (typeof RINGS)[number];

function buildCafes(): Cafe[] {
  const r = rng(20260820);
  const out: Cafe[] = [];
  for (let i = 0; i < 100; i++) {
    const [city, state] = CITIES[i % CITIES.length]!;
    const name = `${NAME_A[i % NAME_A.length]} ${pick(r, NAME_B)}`;
    const slug = `${name.toLowerCase().replace(/[^a-z]+/g, "-")}-${city.toLowerCase()}-${100 + i}`;
    const roll = r();
    const license: LicenseState =
      roll > 0.94
        ? "Suspended"
        : roll > 0.9
          ? "Trial"
          : roll > 0.86
            ? "Offline Grace"
            : roll > 0.83
              ? "Expired"
              : roll > 0.81
                ? "Revoked"
                : "Active";
    const hbAgo =
      license === "Suspended"
        ? r() * 20 * DAY
        : roll > 0.7
          ? r() * 5 * DAY
          : r() * 40 * 60 * 1000;
    const health: HealthState =
      license === "Suspended"
        ? "Suspended"
        : license === "Offline Grace"
          ? "Offline Grace"
          : hbAgo > 2 * DAY
            ? "Critical"
            : hbAgo > 3 * HOUR
              ? "Warning"
              : "Healthy";
    out.push({
      id: `cafe_${(1000 + i).toString(36)}${i}`,
      name,
      slug,
      city,
      state,
      owner: pick(r, OWNERS),
      ownerEmail: `owner${i}@${slug.split("-")[0]}.in`,
      plan: pick(r, PLANS),
      license,
      installations: 1 + Math.floor(r() * 4),
      lastHeartbeat: NOW - hbAgo,
      publicState:
        license === "Suspended"
          ? "Disabled"
          : r() > 0.85
            ? "Hidden"
            : r() > 0.8
              ? "Draft"
              : "Live",
      posVersion: pick(r, VERSIONS),
      createdAt: NOW - (30 + r() * 700) * DAY,
      health,
      attention: health === "Critical" || health === "Warning" || license === "Suspended",
      timezone: "Asia/Kolkata",
      currency: "INR",
      devices: 8 + Math.floor(r() * 60),
      bookings30d: 120 + Math.floor(r() * 3000),
      activeSessions: Math.floor(r() * 24),
      inventoryItems: 20 + Math.floor(r() * 200),
      staff: 2 + Math.floor(r() * 12),
      pageVisits30d: Math.floor(r() * 9000),
      bookingEnabled: r() > 0.3,
      profileCompletion: 45 + Math.floor(r() * 55),
      seatLimit: 20 + Math.floor(r() * 80),
      installationLimit: 2 + Math.floor(r() * 4),
    });
  }
  return out;
}

export const cafes = buildCafes();
export const cafeById = (id: string) => cafes.find((c) => c.id === id);

export type Installation = {
  id: string;
  cafeId: string;
  cafeName: string;
  machineName: string;
  appVersion: string;
  serviceVersion: string;
  os: string;
  lastHeartbeat: number;
  lastBackup: number;
  backupOk: boolean;
  syncQueue: number;
  tokenState: "Valid" | "Rotating" | "Expired" | "Revoked";
  health: HealthState;
  ring: Ring;
  registeredAt: number;
  mode: "Local only" | "Connected" | "Sync enabled";
  clockDriftMs: number;
  diskFreeGb: number;
  latencyMs: number;
  dbReadable: boolean;
  dbWritable: boolean;
  localApiOk: boolean;
  migration: "Up to date" | "Pending" | "Failed";
};

const OSES = ["Windows 11 Pro 23H2", "Windows 11 Pro 24H2", "Windows 10 Pro 22H2"];

function buildInstallations(): Installation[] {
  const r = rng(778899);
  const out: Installation[] = [];
  cafes.forEach((c, ci) => {
    for (let k = 0; k < c.installations; k++) {
      const hbAgo = c.lastHeartbeat === 0 ? DAY : NOW - c.lastHeartbeat + r() * HOUR;
      const backupOk = r() > 0.12;
      const health: HealthState =
        c.license === "Suspended"
          ? "Suspended"
          : c.license === "Offline Grace"
            ? "Offline Grace"
            : !backupOk || hbAgo > 2 * DAY
              ? "Critical"
              : hbAgo > 3 * HOUR
                ? "Warning"
                : "Healthy";
      out.push({
        id: `INST-${(ci + 1).toString().padStart(3, "0")}-${String.fromCharCode(65 + k)}${Math.floor(r() * 9000 + 1000)}`,
        cafeId: c.id,
        cafeName: c.name,
        machineName: `${c.slug.split("-")[0]!.toUpperCase()}-COUNTER-${k + 1}`,
        appVersion: k === 0 ? c.posVersion : pick(r, VERSIONS),
        serviceVersion: `1.${8 + Math.floor(r() * 3)}.${Math.floor(r() * 6)}`,
        os: pick(r, OSES),
        lastHeartbeat: NOW - hbAgo,
        lastBackup: NOW - (backupOk ? r() * 20 * HOUR : (3 + r() * 9) * DAY),
        backupOk,
        syncQueue: health === "Healthy" ? Math.floor(r() * 6) : Math.floor(r() * 400),
        tokenState:
          c.license === "Suspended"
            ? "Revoked"
            : c.license === "Expired"
              ? "Expired"
              : r() > 0.95
                ? "Rotating"
                : "Valid",
        health,
        ring: RINGS[Math.min(RINGS.length - 1, Math.floor(r() * 5))]!,
        registeredAt: c.createdAt + r() * 10 * DAY,
        mode: r() > 0.75 ? "Local only" : r() > 0.4 ? "Connected" : "Sync enabled",
        clockDriftMs: Math.floor((r() - 0.5) * 9000),
        diskFreeGb: Math.floor(6 + r() * 400),
        latencyMs: Math.floor(30 + r() * 400),
        dbReadable: true,
        dbWritable: health !== "Critical" || r() > 0.4,
        localApiOk: health !== "Critical",
        migration: health === "Critical" && r() > 0.7 ? "Failed" : r() > 0.9 ? "Pending" : "Up to date",
      });
    }
  });
  return out;
}

export const installations = buildInstallations();
export const installationById = (id: string) => installations.find((i) => i.id === id);

export type License = {
  id: string;
  cafeId: string;
  cafeName: string;
  plan: Cafe["plan"];
  state: LicenseState;
  startDate: number;
  renewalDate: number;
  graceEnds: number;
  installationLimit: number;
  deviceLimit: number;
  features: string[];
  tokenVersion: number;
  lastValidation: number;
  suspensionReason?: string | undefined;
  reactivations: number;
};

const FEATURES = [
  "public_booking",
  "cloud_sync",
  "inventory",
  "loyalty",
  "multi_shift",
  "remote_reports",
];

export const licenses: License[] = cafes.map((c, i) => {
  const r = rng(4242 + i);
  return {
    id: `LIC-${(1000 + i).toString()}`,
    cafeId: c.id,
    cafeName: c.name,
    plan: c.plan,
    state: c.license,
    startDate: c.createdAt,
    renewalDate: NOW + (r() * 300 - 40) * DAY,
    graceEnds: NOW + (r() * 14 - 3) * DAY,
    installationLimit: c.installationLimit,
    deviceLimit: c.seatLimit,
    features: FEATURES.filter(() => r() > 0.35),
    tokenVersion: 1 + Math.floor(r() * 7),
    lastValidation: c.lastHeartbeat,
    suspensionReason:
      c.license === "Suspended"
        ? pick(r, ["Payment overdue 45 days", "Terms violation under review", "Owner requested hold"])
        : undefined,
    reactivations: Math.floor(r() * 3),
  };
});

export type SyncEvent = {
  id: string;
  cafeId: string;
  cafeName: string;
  installationId: string;
  entity: string;
  operation: "create" | "update" | "delete";
  createdAt: number;
  retries: number;
  lastError?: string | undefined;
  state: "Queued" | "Sending" | "Acknowledged" | "Failed" | "Conflict" | "Ignored" | "Manually resolved";
  protectedEntity: boolean;
};

const ENTITIES = ["booking", "session", "payment", "inventory_item", "member", "shift_report", "device"];
const ERRORS = [
  "HTTP 409 revision mismatch",
  "Timeout after 30s",
  "Schema version 41 not accepted",
  "Token rotated mid-flight",
  "Duplicate idempotency key",
];

export const syncEvents: SyncEvent[] = Array.from({ length: 320 }, (_, i) => {
  const r = rng(90001 + i * 7);
  const inst = installations[Math.floor(r() * installations.length)]!;
  const state = pick(r, [
    "Queued",
    "Sending",
    "Acknowledged",
    "Failed",
    "Conflict",
    "Ignored",
    "Manually resolved",
    "Acknowledged",
    "Failed",
  ] as const);
  const entity = pick(r, ENTITIES);
  return {
    id: `EVT-${(500000 + i).toString(36).toUpperCase()}`,
    cafeId: inst.cafeId,
    cafeName: inst.cafeName,
    installationId: inst.id,
    entity,
    operation: pick(r, ["create", "update", "delete"] as const),
    createdAt: NOW - r() * 6 * DAY,
    retries: state === "Failed" || state === "Conflict" ? 1 + Math.floor(r() * 8) : 0,
    lastError: state === "Failed" || state === "Conflict" ? pick(r, ERRORS) : undefined,
    state,
    protectedEntity: entity === "payment" || entity === "booking",
  };
});

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

export const releases: Release[] = [
  {
    id: "rel_342",
    version: "3.4.2",
    channel: "Stable",
    notes: "Timer accuracy fix, faster shift close, offline receipt queue hardening.",
    migrationRange: "db 38 → 41",
    publishedAt: NOW - 6 * DAY,
    rolloutPct: 62,
    failedInstalls: 3,
    rollbackAvailable: true,
    ring: "Regional",
  },
  {
    id: "rel_350b",
    version: "3.5.0-beta.2",
    channel: "Beta",
    notes: "New sync engine with conflict envelopes. Pilot cafes only.",
    migrationRange: "db 41 → 43",
    publishedAt: NOW - 2 * DAY,
    rolloutPct: 8,
    failedInstalls: 1,
    rollbackAvailable: true,
    ring: "Pilot",
  },
  {
    id: "rel_340",
    version: "3.4.0",
    channel: "Stable",
    notes: "Inventory batch edits, printer driver updates.",
    publishedAt: NOW - 28 * DAY,
    migrationRange: "db 36 → 38",
    rolloutPct: 100,
    failedInstalls: 7,
    rollbackAvailable: false,
    ring: "General Availability",
  },
  {
    id: "rel_351i",
    version: "3.5.1-internal",
    channel: "Internal",
    notes: "Diagnostics bundle v2, clock-drift correction.",
    migrationRange: "db 43 → 43",
    publishedAt: null,
    rolloutPct: 0,
    failedInstalls: 0,
    rollbackAvailable: true,
    ring: "Internal",
  },
];

export type Incident = {
  id: string;
  cafeId: string;
  cafeName: string;
  installationId: string;
  kind: "Sync failure" | "Backup failure" | "Migration failure" | "License suspended" | "Heartbeat lost";
  severity: "Critical" | "Warning";
  openedAt: number;
  status: "Open" | "Investigating" | "Resolved";
  summary: string;
};

export const incidents: Incident[] = installations
  .filter((i) => i.health === "Critical" || i.health === "Suspended")
  .slice(0, 18)
  .map((i, idx) => {
    const r = rng(31337 + idx);
    const kind = !i.backupOk
      ? "Backup failure"
      : i.migration === "Failed"
        ? "Migration failure"
        : i.health === "Suspended"
          ? "License suspended"
          : i.syncQueue > 100
            ? "Sync failure"
            : "Heartbeat lost";
    return {
      id: `INC-${2400 + idx}`,
      cafeId: i.cafeId,
      cafeName: i.cafeName,
      installationId: i.id,
      kind,
      severity: i.health === "Critical" ? "Critical" : "Warning",
      openedAt: NOW - r() * 4 * DAY,
      status: pick(r, ["Open", "Investigating", "Resolved"] as const),
      summary:
        kind === "Backup failure"
          ? "Nightly backup job has not completed for 3 consecutive nights."
          : kind === "Migration failure"
            ? "Database migration 41 rolled back on install; POS pinned to previous version."
            : kind === "License suspended"
              ? "License suspended by an administrator; POS running in limited mode."
              : kind === "Sync failure"
                ? "Sync queue exceeding threshold with repeated 409 responses."
                : "No heartbeat received beyond the offline threshold.",
    };
  });

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

const ACTORS: [string, string][] = [
  ["arjun.k", "Platform Owner"],
  ["ops.priya", "Operations Manager"],
  ["support.dan", "Support Agent"],
  ["audit.ravi", "Read-Only Auditor"],
];
const ACTIONS: [string, AuditRecord["targetType"]][] = [
  ["cafe.create", "Cafe"],
  ["cafe.archive", "Cafe"],
  ["owner.invite", "Cafe"],
  ["license.activate", "License"],
  ["license.suspend", "License"],
  ["license.reactivate", "License"],
  ["license.rotate_token", "License"],
  ["installation.register", "Installation"],
  ["installation.revoke", "Installation"],
  ["release.publish", "Release"],
  ["sync.retry", "SyncEvent"],
  ["support.access", "Support"],
  ["settings.update", "Settings"],
];

export const auditLogs: AuditRecord[] = Array.from({ length: 240 }, (_, i) => {
  const r = rng(55501 + i * 13);
  const [actor, actorRole] = pick(r, ACTORS);
  const [action, targetType] = pick(r, ACTIONS);
  const cafe = cafes[Math.floor(r() * cafes.length)]!;
  const result = r() > 0.94 ? (r() > 0.5 ? "Failed" : "Denied") : "Success";
  return {
    id: `AUD-${(700000 + i).toString(36).toUpperCase()}`,
    at: NOW - r() * 30 * DAY,
    actor,
    actorRole,
    action,
    targetType,
    targetId:
      targetType === "Cafe"
        ? cafe.id
        : targetType === "License"
          ? `LIC-${1000 + (i % 100)}`
          : targetType === "Installation"
            ? installations[i % installations.length]!.id
            : targetType === "Release"
              ? "rel_342"
              : targetType === "SyncEvent"
                ? syncEvents[i % syncEvents.length]!.id
                : "platform",
    cafeId: cafe.id,
    cafeName: cafe.name,
    reason: pick(r, [
      "Scheduled operation",
      "Payment overdue",
      "Owner support request",
      "Pilot onboarding",
      "Incident remediation",
      "Routine rotation",
    ]),
    before: pick(r, ["state=Active", "state=Suspended", "rollout=8%", "version=3.4.0", "—"]),
    after: pick(r, ["state=Suspended", "state=Active", "rollout=62%", "version=3.4.2", "created"]),
    context: `ip 10.${Math.floor(r() * 250)}.${Math.floor(r() * 250)}.${Math.floor(r() * 250)}`,
    result: result as AuditRecord["result"],
  };
}).sort((a, b) => b.at - a.at);

export const healthTimeline = Array.from({ length: 24 }, (_, i) => {
  const r = rng(9090 + i);
  const offline = 4 + Math.floor(r() * 9);
  const degraded = 6 + Math.floor(r() * 14);
  return {
    hour: `${String((i + 7) % 24).padStart(2, "0")}:00`,
    connected: installations.length - offline - degraded,
    degraded,
    offline,
  };
});

export const kpis = () => {
  const activeCafes = cafes.filter((c) => c.license === "Active" || c.license === "Trial").length;
  const offlineBeyondGrace = cafes.filter((c) => NOW - c.lastHeartbeat > 2 * DAY).length;
  const connected = installations.filter((i) => NOW - i.lastHeartbeat < 3 * HOUR).length;
  const needUpdate = installations.filter((i) => i.appVersion !== "3.4.2").length;
  const suspended = licenses.filter((l) => l.state === "Suspended" || l.state === "Revoked").length;
  const failedSync = syncEvents.filter((e) => e.state === "Failed" || e.state === "Conflict").length;
  const criticalIncidents = incidents.filter(
    (i) => i.severity === "Critical" && i.status !== "Resolved",
  ).length;
  return {
    totalCafes: cafes.length,
    activeCafes,
    offlineBeyondGrace,
    connected,
    needUpdate,
    suspended,
    failedSync,
    criticalIncidents,
  };
};

export function relTime(ts: number): string {
  const d = NOW - ts;
  if (d < 0) return `in ${relTime(NOW * 2 - ts)}`;
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function fmtDate(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function fmtDateTime(ts: number) {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}
