-- helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- CAFES
CREATE TABLE public.cafes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  legal_name text,
  slug text NOT NULL UNIQUE,
  address text,
  city text NOT NULL DEFAULT '',
  state text NOT NULL DEFAULT '',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  currency text NOT NULL DEFAULT 'INR',
  owner_name text NOT NULL DEFAULT '',
  owner_email text NOT NULL DEFAULT '',
  owner_phone text,
  plan text NOT NULL DEFAULT 'Starter',
  license_state text NOT NULL DEFAULT 'Trial',
  public_state text NOT NULL DEFAULT 'Draft',
  pos_version text NOT NULL DEFAULT '—',
  booking_enabled boolean NOT NULL DEFAULT false,
  profile_completion integer NOT NULL DEFAULT 0,
  description text,
  amenities text[] NOT NULL DEFAULT '{}',
  devices integer NOT NULL DEFAULT 0,
  bookings_30d integer NOT NULL DEFAULT 0,
  active_sessions integer NOT NULL DEFAULT 0,
  inventory_items integer NOT NULL DEFAULT 0,
  staff integer NOT NULL DEFAULT 0,
  page_visits_30d integer NOT NULL DEFAULT 0,
  seat_limit integer NOT NULL DEFAULT 40,
  installation_limit integer NOT NULL DEFAULT 2,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER cafes_updated BEFORE UPDATE ON public.cafes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LICENSES
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid NOT NULL UNIQUE REFERENCES public.cafes(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'Starter',
  state text NOT NULL DEFAULT 'Trial',
  start_date timestamptz NOT NULL DEFAULT now(),
  renewal_date timestamptz,
  grace_ends timestamptz,
  installation_limit integer NOT NULL DEFAULT 2,
  device_limit integer NOT NULL DEFAULT 40,
  features text[] NOT NULL DEFAULT '{}',
  token_version integer NOT NULL DEFAULT 1,
  last_validation timestamptz,
  suspension_reason text,
  reactivations integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER licenses_updated BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- INSTALLATIONS
CREATE TABLE public.installations (
  id text PRIMARY KEY,
  cafe_id uuid NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  machine_name text NOT NULL DEFAULT '',
  app_version text NOT NULL DEFAULT '—',
  service_version text NOT NULL DEFAULT '—',
  os text NOT NULL DEFAULT '—',
  last_heartbeat timestamptz,
  last_backup timestamptz,
  backup_ok boolean NOT NULL DEFAULT false,
  sync_queue integer NOT NULL DEFAULT 0,
  token_state text NOT NULL DEFAULT 'Valid',
  ring text NOT NULL DEFAULT 'Pilot',
  mode text NOT NULL DEFAULT 'Local only',
  clock_drift_ms integer NOT NULL DEFAULT 0,
  disk_free_gb integer NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  db_readable boolean NOT NULL DEFAULT true,
  db_writable boolean NOT NULL DEFAULT true,
  local_api_ok boolean NOT NULL DEFAULT true,
  migration_state text NOT NULL DEFAULT 'Up to date',
  registration_code text,
  registered_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX installations_cafe_idx ON public.installations(cafe_id);
CREATE TRIGGER installations_updated BEFORE UPDATE ON public.installations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HEARTBEATS
CREATE TABLE public.heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id text NOT NULL REFERENCES public.installations(id) ON DELETE CASCADE,
  cafe_id uuid NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  app_version text,
  sync_queue integer NOT NULL DEFAULT 0,
  healthy boolean NOT NULL DEFAULT true,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX heartbeats_inst_at_idx ON public.heartbeats(installation_id, at DESC);

-- SYNC EVENTS
CREATE TABLE public.sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  installation_id text REFERENCES public.installations(id) ON DELETE SET NULL,
  entity text NOT NULL,
  operation text NOT NULL DEFAULT 'create',
  retries integer NOT NULL DEFAULT 0,
  last_error text,
  state text NOT NULL DEFAULT 'Queued',
  protected_entity boolean NOT NULL DEFAULT false,
  resolution_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sync_events_cafe_idx ON public.sync_events(cafe_id);
CREATE TRIGGER sync_events_updated BEFORE UPDATE ON public.sync_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SOFTWARE RELEASES
CREATE TABLE public.software_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  channel text NOT NULL DEFAULT 'Stable',
  notes text NOT NULL DEFAULT '',
  migration_range text NOT NULL DEFAULT '',
  published_at timestamptz,
  rollout_pct integer NOT NULL DEFAULT 0,
  failed_installs integer NOT NULL DEFAULT 0,
  rollback_available boolean NOT NULL DEFAULT true,
  ring text NOT NULL DEFAULT 'Internal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER releases_updated BEFORE UPDATE ON public.software_releases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SUPPORT INCIDENTS
CREATE TABLE public.support_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid NOT NULL REFERENCES public.cafes(id) ON DELETE CASCADE,
  installation_id text REFERENCES public.installations(id) ON DELETE SET NULL,
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'Warning',
  status text NOT NULL DEFAULT 'Open',
  summary text NOT NULL DEFAULT '',
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX incidents_cafe_idx ON public.support_incidents(cafe_id);
CREATE TRIGGER incidents_updated BEFORE UPDATE ON public.support_incidents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AUDIT LOGS (append only)
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL DEFAULT 'system',
  actor_role text NOT NULL DEFAULT 'system',
  action text NOT NULL,
  target_type text NOT NULL DEFAULT 'Settings',
  target_id text NOT NULL DEFAULT 'platform',
  cafe_id uuid REFERENCES public.cafes(id) ON DELETE SET NULL,
  cafe_name text,
  reason text NOT NULL DEFAULT '',
  before_summary text NOT NULL DEFAULT '—',
  after_summary text NOT NULL DEFAULT '—',
  context text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT 'Success'
);
CREATE INDEX audit_logs_at_idx ON public.audit_logs(at DESC);

-- PLATFORM SETTINGS
CREATE TABLE public.platform_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  grace_period_days integer NOT NULL DEFAULT 14,
  heartbeat_interval_min integer NOT NULL DEFAULT 15,
  offline_threshold_hours integer NOT NULL DEFAULT 48,
  backup_warning_hours integer NOT NULL DEFAULT 36,
  supported_versions text[] NOT NULL DEFAULT ARRAY['3.4.2','3.4.0','3.3.6'],
  public_booking_default boolean NOT NULL DEFAULT true,
  rollout_failure_threshold_pct integer NOT NULL DEFAULT 5,
  support_email text NOT NULL DEFAULT 'support@airavoto.com',
  support_phone text NOT NULL DEFAULT '',
  audit_retention_days integer NOT NULL DEFAULT 730,
  notify_email boolean NOT NULL DEFAULT true,
  notify_in_app boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.platform_settings (id) VALUES (1);
CREATE TRIGGER settings_updated BEFORE UPDATE ON public.platform_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- GRANTS (no login yet: the portal talks to these tables anonymously)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cafes, public.licenses, public.installations,
  public.heartbeats, public.sync_events, public.software_releases, public.support_incidents,
  public.platform_settings TO anon, authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.cafes, public.licenses, public.installations, public.heartbeats,
  public.sync_events, public.software_releases, public.support_incidents,
  public.platform_settings, public.audit_logs TO service_role;

ALTER TABLE public.cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo open access" ON public.cafes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.licenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.installations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.heartbeats FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.sync_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.software_releases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.support_incidents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "demo open access" ON public.platform_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "audit read" ON public.audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "audit append" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);