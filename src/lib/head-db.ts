/**
 * Live data layer for AiravotoHead.
 * Reads and writes the real platform database and maps rows onto the domain
 * types in head-data.ts. Every high-impact write also appends an audit record.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DAY,
  HOUR,
  deriveHealth,
  type AuditRecord,
  type Cafe,
  type HealthState,
  type Incident,
  type Installation,
  type License,
  type LicenseState,
  type Plan,
  type PlatformSettings,
  type Release,
  type Ring,
  type SyncEvent,
} from "@/lib/head-data";

const ms = (v: string | null) => (v ? Date.parse(v) : null);
const iso = (v: number | null | undefined) => (v == null ? null : new Date(v).toISOString());

/* ------------------------------------------------------------------ types */

type CafeRow = Record<string, never>;

/* ------------------------------------------------------------------ core query */

export type Platform = {
  cafes: Cafe[];
  installations: Installation[];
  licenses: License[];
};

async function fetchPlatform(): Promise<Platform> {
  const [cafeRes, instRes, licRes] = await Promise.all([
    supabase.from("cafes").select("*").order("created_at", { ascending: false }),
    supabase.from("installations").select("*"),
    supabase.from("licenses").select("*"),
  ]);
  if (cafeRes.error) throw cafeRes.error;
  if (instRes.error) throw instRes.error;
  if (licRes.error) throw licRes.error;

  const cafeRows = cafeRes.data ?? [];
  const instRows = instRes.data ?? [];
  const licRows = licRes.data ?? [];

  const nameById = new Map(cafeRows.map((c) => [c.id as string, c.name as string]));
  const licenseByCafe = new Map(licRows.map((l) => [l.cafe_id as string, l]));

  const installations: Installation[] = instRows.map((i) => {
    const lic = licenseByCafe.get(i.cafe_id as string);
    const license = (lic?.state ?? "Trial") as LicenseState;
    const lastHeartbeat = ms(i.last_heartbeat);
    return {
      id: i.id as string,
      cafeId: i.cafe_id as string,
      cafeName: nameById.get(i.cafe_id as string) ?? "—",
      machineName: i.machine_name as string,
      appVersion: i.app_version as string,
      serviceVersion: i.service_version as string,
      os: i.os as string,
      lastHeartbeat,
      lastBackup: ms(i.last_backup),
      backupOk: i.backup_ok as boolean,
      syncQueue: i.sync_queue as number,
      tokenState: i.token_state as Installation["tokenState"],
      health: deriveHealth({ license, lastHeartbeat, backupOk: i.backup_ok as boolean }),
      ring: i.ring as Ring,
      registeredAt: ms(i.registered_at),
      registrationCode: (i.registration_code as string | null) ?? null,
      mode: i.mode as Installation["mode"],
      clockDriftMs: i.clock_drift_ms as number,
      diskFreeGb: i.disk_free_gb as number,
      latencyMs: i.latency_ms as number,
      dbReadable: i.db_readable as boolean,
      dbWritable: i.db_writable as boolean,
      localApiOk: i.local_api_ok as boolean,
      migration: i.migration_state as Installation["migration"],
    };
  });

  const cafes: Cafe[] = cafeRows.map((c) => {
    const mine = installations.filter((i) => i.cafeId === c.id);
    const lastHeartbeat = mine.reduce<number | null>(
      (acc, i) => (i.lastHeartbeat != null && (acc == null || i.lastHeartbeat > acc) ? i.lastHeartbeat : acc),
      null,
    );
    const license = (licenseByCafe.get(c.id as string)?.state ?? c.license_state) as LicenseState;
    const health = deriveHealth(
      mine.length
        ? { license, lastHeartbeat, backupOk: mine.every((i) => i.backupOk) }
        : { license, lastHeartbeat },
    );
    return {
      id: c.id as string,
      name: c.name as string,
      legalName: (c.legal_name as string | null) ?? "",
      slug: c.slug as string,
      address: (c.address as string | null) ?? "",
      city: c.city as string,
      state: c.state as string,
      owner: c.owner_name as string,
      ownerEmail: c.owner_email as string,
      ownerPhone: (c.owner_phone as string | null) ?? "",
      plan: c.plan as Plan,
      license,
      installations: mine.length,
      lastHeartbeat,
      publicState: c.public_state as Cafe["publicState"],
      posVersion: mine[0]?.appVersion ?? (c.pos_version as string),
      createdAt: Date.parse(c.created_at as string),
      health,
      attention: health !== "Healthy",
      timezone: c.timezone as string,
      currency: c.currency as string,
      description: (c.description as string | null) ?? "",
      amenities: (c.amenities as string[] | null) ?? [],
      devices: c.devices as number,
      bookings30d: c.bookings_30d as number,
      activeSessions: c.active_sessions as number,
      inventoryItems: c.inventory_items as number,
      staff: c.staff as number,
      pageVisits30d: c.page_visits_30d as number,
      bookingEnabled: c.booking_enabled as boolean,
      profileCompletion: c.profile_completion as number,
      seatLimit: c.seat_limit as number,
      installationLimit: c.installation_limit as number,
      archived: c.archived as boolean,
    };
  });

  const licenses: License[] = licRows.map((l) => ({
    id: l.id as string,
    cafeId: l.cafe_id as string,
    cafeName: nameById.get(l.cafe_id as string) ?? "—",
    plan: l.plan as Plan,
    state: l.state as LicenseState,
    startDate: Date.parse(l.start_date as string),
    renewalDate: ms(l.renewal_date),
    graceEnds: ms(l.grace_ends),
    installationLimit: l.installation_limit as number,
    deviceLimit: l.device_limit as number,
    features: (l.features as string[] | null) ?? [],
    tokenVersion: l.token_version as number,
    lastValidation: ms(l.last_validation),
    suspensionReason: (l.suspension_reason as string | null) ?? undefined,
    reactivations: l.reactivations as number,
  }));

  return { cafes, installations, licenses };
}

const EMPTY: Platform = { cafes: [], installations: [], licenses: [] };

export function usePlatform() {
  const q = useQuery({ queryKey: ["platform"], queryFn: fetchPlatform });
  return { ...q, data: q.data ?? EMPTY };
}

export function useCafe(cafeId: string) {
  const { data, isLoading, error } = usePlatform();
  return {
    isLoading,
    error,
    cafe: data.cafes.find((c) => c.id === cafeId) ?? null,
    installations: data.installations.filter((i) => i.cafeId === cafeId),
    license: data.licenses.find((l) => l.cafeId === cafeId) ?? null,
  };
}

export function useInstallation(installationId: string) {
  const { data, isLoading, error } = usePlatform();
  const installation = data.installations.find((i) => i.id === installationId) ?? null;
  return {
    isLoading,
    error,
    installation,
    cafe: installation ? (data.cafes.find((c) => c.id === installation.cafeId) ?? null) : null,
  };
}

/* ------------------------------------------------------------------ other reads */

export function useSyncEvents() {
  const platform = usePlatform();
  const q = useQuery({
    queryKey: ["sync_events"],
    queryFn: async (): Promise<Omit<SyncEvent, "cafeName">[]> => {
      const { data, error } = await supabase
        .from("sync_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []).map((e) => ({
        id: e.id as string,
        cafeId: e.cafe_id as string,
        installationId: (e.installation_id as string | null) ?? null,
        entity: e.entity as string,
        operation: e.operation as SyncEvent["operation"],
        createdAt: Date.parse(e.created_at as string),
        retries: e.retries as number,
        lastError: (e.last_error as string | null) ?? undefined,
        state: e.state as SyncEvent["state"],
        protectedEntity: e.protected_entity as boolean,
      }));
    },
  });
  const names = new Map(platform.data.cafes.map((c) => [c.id, c.name]));
  const events: SyncEvent[] = (q.data ?? []).map((e) => ({
    ...e,
    cafeName: names.get(e.cafeId) ?? "—",
  }));
  return { ...q, data: events, isLoading: q.isLoading || platform.isLoading };
}

export function useIncidents() {
  const platform = usePlatform();
  const q = useQuery({
    queryKey: ["support_incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_incidents")
        .select("*")
        .order("opened_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
  const names = new Map(platform.data.cafes.map((c) => [c.id, c.name]));
  const incidents: Incident[] = (q.data ?? []).map((i) => ({
    id: i.id as string,
    cafeId: i.cafe_id as string,
    cafeName: names.get(i.cafe_id as string) ?? "—",
    installationId: (i.installation_id as string | null) ?? null,
    kind: i.kind as string,
    severity: i.severity as Incident["severity"],
    openedAt: Date.parse(i.opened_at as string),
    status: i.status as Incident["status"],
    summary: i.summary as string,
  }));
  return { ...q, data: incidents, isLoading: q.isLoading || platform.isLoading };
}

export function useReleases() {
  const q = useQuery({
    queryKey: ["releases"],
    queryFn: async (): Promise<Release[]> => {
      const { data, error } = await supabase
        .from("software_releases")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id as string,
        version: r.version as string,
        channel: r.channel as Release["channel"],
        notes: r.notes as string,
        migrationRange: r.migration_range as string,
        publishedAt: ms(r.published_at),
        rolloutPct: r.rollout_pct as number,
        failedInstalls: r.failed_installs as number,
        rollbackAvailable: r.rollback_available as boolean,
        ring: r.ring as Ring,
      }));
    },
  });
  return { ...q, data: q.data ?? [] };
}

export function useAuditLogs() {
  const q = useQuery({
    queryKey: ["audit_logs"],
    queryFn: async (): Promise<AuditRecord[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []).map((a) => ({
        id: a.id as string,
        at: Date.parse(a.at as string),
        actor: a.actor as string,
        actorRole: a.actor_role as string,
        action: a.action as string,
        targetType: a.target_type as AuditRecord["targetType"],
        targetId: a.target_id as string,
        cafeId: (a.cafe_id as string | null) ?? undefined,
        cafeName: (a.cafe_name as string | null) ?? undefined,
        reason: a.reason as string,
        before: a.before_summary as string,
        after: a.after_summary as string,
        context: a.context as string,
        result: a.result as AuditRecord["result"],
      }));
    },
  });
  return { ...q, data: q.data ?? [] };
}

export function useHeartbeats(installationId: string) {
  const q = useQuery({
    queryKey: ["heartbeats", installationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heartbeats")
        .select("*")
        .eq("installation_id", installationId)
        .gte("at", new Date(Date.now() - DAY).toISOString())
        .order("at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((h) => ({
        at: Date.parse(h.at as string),
        healthy: h.healthy as boolean,
        syncQueue: h.sync_queue as number,
        appVersion: (h.app_version as string | null) ?? "—",
      }));
    },
  });
  return { ...q, data: q.data ?? [] };
}

export function useSettings() {
  const q = useQuery({
    queryKey: ["platform_settings"],
    queryFn: async (): Promise<PlatformSettings> => {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return {
        gracePeriodDays: data.grace_period_days,
        heartbeatIntervalMin: data.heartbeat_interval_min,
        offlineThresholdHours: data.offline_threshold_hours,
        backupWarningHours: data.backup_warning_hours,
        supportedVersions: data.supported_versions ?? [],
        publicBookingDefault: data.public_booking_default,
        rolloutFailureThresholdPct: data.rollout_failure_threshold_pct,
        supportEmail: data.support_email,
        supportPhone: data.support_phone,
        auditRetentionDays: data.audit_retention_days,
        notifyEmail: data.notify_email,
        notifyInApp: data.notify_in_app,
      };
    },
  });
  return q;
}

/** 24h platform health timeline derived from real heartbeats. */
export function useHealthTimeline() {
  const q = useQuery({
    queryKey: ["health_timeline"],
    queryFn: async () => {
      const since = new Date(Date.now() - DAY).toISOString();
      const { data, error } = await supabase
        .from("heartbeats")
        .select("at, healthy, installation_id")
        .gte("at", since);
      if (error) throw error;
      return data ?? [];
    },
  });
  const buckets = Array.from({ length: 24 }, (_, idx) => {
    const start = Date.now() - (23 - idx) * HOUR;
    return {
      hour: `${String(new Date(start).getUTCHours()).padStart(2, "0")}:00`,
      connected: 0,
      degraded: 0,
      offline: 0,
    };
  });
  for (const h of q.data ?? []) {
    const age = Date.now() - Date.parse(h.at as string);
    const idx = 23 - Math.min(23, Math.floor(age / HOUR));
    const b = buckets[idx];
    if (!b) continue;
    if (h.healthy) b.connected += 1;
    else b.degraded += 1;
  }
  return { ...q, data: buckets };
}

export function useKpis() {
  const { data, isLoading } = usePlatform();
  const sync = useSyncEvents();
  const incidents = useIncidents();
  const now = Date.now();
  return {
    isLoading: isLoading || sync.isLoading || incidents.isLoading,
    kpis: {
      totalCafes: data.cafes.length,
      activeCafes: data.cafes.filter((c) => c.license === "Active" || c.license === "Trial").length,
      offlineBeyondGrace: data.cafes.filter(
        (c) => c.lastHeartbeat == null || now - c.lastHeartbeat > 2 * DAY,
      ).length,
      connected: data.installations.filter(
        (i) => i.lastHeartbeat != null && now - i.lastHeartbeat < 3 * HOUR,
      ).length,
      needUpdate: data.installations.filter((i) => i.appVersion !== latestVersion(data)).length,
      suspended: data.licenses.filter((l) => l.state === "Suspended" || l.state === "Revoked")
        .length,
      failedSync: sync.data.filter((e) => e.state === "Failed" || e.state === "Conflict").length,
      criticalIncidents: incidents.data.filter(
        (i) => i.severity === "Critical" && i.status !== "Resolved",
      ).length,
    },
  };
}

function latestVersion(p: Platform) {
  const versions = p.installations.map((i) => i.appVersion).filter((v) => v && v !== "—");
  return versions.sort().at(-1) ?? "—";
}

/* ------------------------------------------------------------------ writes */

export type AuditInput = {
  actor: string;
  actorRole: string;
  action: string;
  targetType: AuditRecord["targetType"];
  targetId: string;
  cafeId?: string | null;
  cafeName?: string | null;
  reason?: string;
  before?: string;
  after?: string;
  result?: AuditRecord["result"];
};

export async function writeAudit(entry: AuditInput) {
  const { error } = await supabase.from("audit_logs").insert({
    actor: entry.actor,
    actor_role: entry.actorRole,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId,
    cafe_id: entry.cafeId ?? null,
    cafe_name: entry.cafeName ?? null,
    reason: entry.reason ?? "",
    before_summary: entry.before ?? "—",
    after_summary: entry.after ?? "—",
    context: "AiravotoHead console",
    result: entry.result ?? "Success",
  });
  if (error) throw error;
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["platform"] });
    void qc.invalidateQueries({ queryKey: ["audit_logs"] });
    void qc.invalidateQueries({ queryKey: ["sync_events"] });
    void qc.invalidateQueries({ queryKey: ["support_incidents"] });
    void qc.invalidateQueries({ queryKey: ["releases"] });
    void qc.invalidateQueries({ queryKey: ["platform_settings"] });
  };
}

export type Actor = { name: string; role: string };

export type NewCafeInput = {
  name: string;
  legalName: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  timezone: string;
  currency: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: Plan;
  seatLimit: number;
  installationLimit: number;
  gracePeriodDays: number;
  features: string[];
  description: string;
  amenities: string[];
  bookingEnabled: boolean;
  machineName: string;
};

export function randomCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

export function useCreateCafe(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: NewCafeInput) => {
      const { data: cafe, error } = await supabase
        .from("cafes")
        .insert({
          name: input.name,
          legal_name: input.legalName || null,
          slug: input.slug,
          address: input.address || null,
          city: input.city,
          state: input.state,
          timezone: input.timezone,
          currency: input.currency,
          owner_name: input.ownerName,
          owner_email: input.ownerEmail,
          owner_phone: input.ownerPhone || null,
          plan: input.plan,
          license_state: "Trial",
          public_state: "Draft",
          booking_enabled: input.bookingEnabled,
          description: input.description || null,
          amenities: input.amenities,
          seat_limit: input.seatLimit,
          installation_limit: input.installationLimit,
          profile_completion: input.description ? 70 : 40,
        })
        .select()
        .single();
      if (error) throw error;

      const graceEnds = new Date(Date.now() + input.gracePeriodDays * DAY).toISOString();
      const { error: licErr } = await supabase.from("licenses").insert({
        cafe_id: cafe.id,
        plan: input.plan,
        state: "Trial",
        renewal_date: new Date(Date.now() + 30 * DAY).toISOString(),
        grace_ends: graceEnds,
        installation_limit: input.installationLimit,
        device_limit: input.seatLimit,
        features: input.features,
      });
      if (licErr) throw licErr;

      const code = randomCode();
      const installationId = `INST-${cafe.slug.slice(0, 6).toUpperCase()}-${code.slice(0, 4)}`;
      const { error: instErr } = await supabase.from("installations").insert({
        id: installationId,
        cafe_id: cafe.id,
        machine_name: input.machineName || `${input.slug.slice(0, 8).toUpperCase()}-COUNTER-1`,
        registration_code: code,
        token_state: "Valid",
        ring: "Pilot",
        mode: "Local only",
      });
      if (instErr) throw instErr;

      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "cafe.create",
        targetType: "Cafe",
        targetId: cafe.id,
        cafeId: cafe.id,
        cafeName: cafe.name,
        reason: "Cafe onboarding wizard",
        before: "—",
        after: `cafe=${cafe.slug} plan=${input.plan} license=Trial`,
      });
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "installation.register",
        targetType: "Installation",
        targetId: installationId,
        cafeId: cafe.id,
        cafeName: cafe.name,
        reason: "One-time registration code issued during onboarding",
        after: `installation=${installationId} awaiting first heartbeat`,
      });

      return { cafeId: cafe.id as string, installationId, code };
    },
    onSuccess: invalidate,
  });
}

export function useSlugAvailable(slug: string) {
  return useQuery({
    queryKey: ["slug", slug],
    enabled: slug.length > 2,
    queryFn: async () => {
      const { data, error } = await supabase.from("cafes").select("id").eq("slug", slug).limit(1);
      if (error) throw error;
      return (data ?? []).length === 0;
    },
  });
}

type LicenseActionInput = {
  cafe: { id: string; name: string };
  licenseId: string;
  reason: string;
};

export function useLicenseAction(actor: Actor) {
  const invalidate = useInvalidate();

  const run = async (
    kind: "suspend" | "reactivate" | "rotate",
    input: LicenseActionInput & { previousState?: LicenseState; tokenVersion?: number },
  ) => {
    if (kind === "suspend") {
      const { error } = await supabase
        .from("licenses")
        .update({ state: "Suspended", suspension_reason: input.reason })
        .eq("id", input.licenseId);
      if (error) throw error;
      await supabase.from("cafes").update({ license_state: "Suspended", public_state: "Disabled" }).eq("id", input.cafe.id);
      await supabase.from("installations").update({ token_state: "Revoked" }).eq("cafe_id", input.cafe.id);
    } else if (kind === "reactivate") {
      const { error } = await supabase
        .from("licenses")
        .update({
          state: "Active",
          suspension_reason: null,
          token_version: (input.tokenVersion ?? 1) + 1,
          last_validation: new Date().toISOString(),
        })
        .eq("id", input.licenseId);
      if (error) throw error;
      await supabase.from("cafes").update({ license_state: "Active", public_state: "Live" }).eq("id", input.cafe.id);
      await supabase.from("installations").update({ token_state: "Valid" }).eq("cafe_id", input.cafe.id);
    } else {
      const { error } = await supabase
        .from("licenses")
        .update({
          token_version: (input.tokenVersion ?? 1) + 1,
          last_validation: new Date().toISOString(),
        })
        .eq("id", input.licenseId);
      if (error) throw error;
      await supabase.from("installations").update({ token_state: "Rotating" }).eq("cafe_id", input.cafe.id);
    }

    await writeAudit({
      actor: actor.name,
      actorRole: actor.role,
      action:
        kind === "suspend"
          ? "license.suspend"
          : kind === "reactivate"
            ? "license.reactivate"
            : "license.rotate_token",
      targetType: "License",
      targetId: input.licenseId,
      cafeId: input.cafe.id,
      cafeName: input.cafe.name,
      reason: input.reason,
      before: `state=${input.previousState ?? "unknown"}`,
      after:
        kind === "suspend"
          ? "state=Suspended token=revoked"
          : kind === "reactivate"
            ? "state=Active token=reissued"
            : "token=rotated",
    });
  };

  return useMutation({
    mutationFn: (args: {
      kind: "suspend" | "reactivate" | "rotate";
      input: LicenseActionInput & { previousState?: LicenseState; tokenVersion?: number };
    }) => run(args.kind, args.input),
    onSuccess: invalidate,
  });
}

export function useArchiveCafe(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { cafe: { id: string; name: string }; reason: string }) => {
      const { error } = await supabase
        .from("cafes")
        .update({ archived: true, public_state: "Disabled", license_state: "Archived" })
        .eq("id", input.cafe.id);
      if (error) throw error;
      await supabase.from("licenses").update({ state: "Archived" }).eq("cafe_id", input.cafe.id);
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "cafe.archive",
        targetType: "Cafe",
        targetId: input.cafe.id,
        cafeId: input.cafe.id,
        cafeName: input.cafe.name,
        reason: input.reason,
        before: "archived=false",
        after: "archived=true public=Disabled",
      });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateCafe(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      cafe: { id: string; name: string };
      patch: Record<string, unknown>;
      action: string;
      after: string;
      reason?: string;
    }) => {
      const { error } = await supabase.from("cafes").update(input.patch as never).eq("id", input.cafe.id);
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: input.action,
        targetType: "Cafe",
        targetId: input.cafe.id,
        cafeId: input.cafe.id,
        cafeName: input.cafe.name,
        reason: input.reason ?? "Console update",
        after: input.after,
      });
    },
    onSuccess: invalidate,
  });
}

export function useRegisterInstallation(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { cafe: { id: string; name: string; slug: string }; machineName: string; ring: Ring }) => {
      const code = randomCode();
      const id = `INST-${input.cafe.slug.slice(0, 6).toUpperCase()}-${code.slice(0, 4)}`;
      const { error } = await supabase.from("installations").insert({
        id,
        cafe_id: input.cafe.id,
        machine_name: input.machineName,
        registration_code: code,
        ring: input.ring,
        mode: "Local only",
      });
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "installation.register",
        targetType: "Installation",
        targetId: id,
        cafeId: input.cafe.id,
        cafeName: input.cafe.name,
        reason: "New POS machine registered",
        after: `installation=${id} code issued`,
      });
      return { id, code };
    },
    onSuccess: invalidate,
  });
}

export function useRevokeInstallation(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      installation: Installation;
      reason: string;
    }) => {
      const { error } = await supabase
        .from("installations")
        .update({ token_state: "Revoked", revoked_at: new Date().toISOString() })
        .eq("id", input.installation.id);
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "installation.revoke",
        targetType: "Installation",
        targetId: input.installation.id,
        cafeId: input.installation.cafeId,
        cafeName: input.installation.cafeName,
        reason: input.reason,
        before: `token=${input.installation.tokenState}`,
        after: "token=Revoked",
      });
    },
    onSuccess: invalidate,
  });
}

export function useSyncAction(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      event: SyncEvent;
      kind: "retry" | "ignore" | "resolve";
      reason: string;
    }) => {
      const state =
        input.kind === "retry" ? "Queued" : input.kind === "ignore" ? "Ignored" : "Manually resolved";
      const { error } = await supabase
        .from("sync_events")
        .update({
          state,
          resolution_reason: input.reason,
          retries: input.kind === "retry" ? input.event.retries + 1 : input.event.retries,
        })
        .eq("id", input.event.id);
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: `sync.${input.kind}`,
        targetType: "SyncEvent",
        targetId: input.event.id,
        cafeId: input.event.cafeId,
        cafeName: input.event.cafeName,
        reason: input.reason,
        before: `state=${input.event.state}`,
        after: `state=${state}`,
      });
    },
    onSuccess: invalidate,
  });
}

export function useReleaseAction(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { release: Release; ring: Ring; rolloutPct: number; reason: string }) => {
      const { error } = await supabase
        .from("software_releases")
        .update({
          published_at: input.release.publishedAt
            ? new Date(input.release.publishedAt).toISOString()
            : new Date().toISOString(),
          ring: input.ring,
          rollout_pct: input.rolloutPct,
        })
        .eq("id", input.release.id);
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "release.publish",
        targetType: "Release",
        targetId: input.release.id,
        reason: input.reason,
        before: `ring=${input.release.ring} rollout=${input.release.rolloutPct}%`,
        after: `ring=${input.ring} rollout=${input.rolloutPct}%`,
      });
    },
    onSuccess: invalidate,
  });
}

export function useCreateRelease(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      version: string;
      channel: Release["channel"];
      notes: string;
      migrationRange: string;
    }) => {
      const { data, error } = await supabase
        .from("software_releases")
        .insert({
          version: input.version,
          channel: input.channel,
          notes: input.notes,
          migration_range: input.migrationRange,
          ring: "Internal",
        })
        .select()
        .single();
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "release.create",
        targetType: "Release",
        targetId: data.id as string,
        reason: "New build registered",
        after: `version=${input.version} channel=${input.channel} ring=Internal`,
      });
    },
    onSuccess: invalidate,
  });
}

export function useSaveSettings(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("platform_settings").update(patch as never).eq("id", 1);
      if (error) throw error;
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "settings.update",
        targetType: "Settings",
        targetId: "platform",
        reason: "Platform settings updated",
        after: Object.entries(patch)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(" "),
      });
    },
    onSuccess: invalidate,
  });
}

/** Simulated agent check-in so the console can be exercised end to end. */
export function useSendHeartbeat(actor: Actor) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: { installation: Installation; healthy: boolean }) => {
      const at = new Date().toISOString();
      const { error } = await supabase.from("heartbeats").insert({
        installation_id: input.installation.id,
        cafe_id: input.installation.cafeId,
        at,
        app_version: input.installation.appVersion,
        sync_queue: input.installation.syncQueue,
        healthy: input.healthy,
      });
      if (error) throw error;
      await supabase
        .from("installations")
        .update({
          last_heartbeat: at,
          local_api_ok: input.healthy,
          registered_at: input.installation.registeredAt
            ? new Date(input.installation.registeredAt).toISOString()
            : at,
        })
        .eq("id", input.installation.id);
      await writeAudit({
        actor: actor.name,
        actorRole: actor.role,
        action: "installation.heartbeat",
        targetType: "Installation",
        targetId: input.installation.id,
        cafeId: input.installation.cafeId,
        cafeName: input.installation.cafeName,
        reason: "Manual check-in from the console",
        after: `heartbeat=${at} healthy=${input.healthy}`,
      });
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export type { CafeRow, HealthState };
