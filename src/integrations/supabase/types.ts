export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          actor_role: string
          after_summary: string
          at: string
          before_summary: string
          cafe_id: string | null
          cafe_name: string | null
          context: string
          id: string
          reason: string
          result: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor?: string
          actor_role?: string
          after_summary?: string
          at?: string
          before_summary?: string
          cafe_id?: string | null
          cafe_name?: string | null
          context?: string
          id?: string
          reason?: string
          result?: string
          target_id?: string
          target_type?: string
        }
        Update: {
          action?: string
          actor?: string
          actor_role?: string
          after_summary?: string
          at?: string
          before_summary?: string
          cafe_id?: string | null
          cafe_name?: string | null
          context?: string
          id?: string
          reason?: string
          result?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      cafes: {
        Row: {
          active_sessions: number
          address: string | null
          amenities: string[]
          archived: boolean
          booking_enabled: boolean
          bookings_30d: number
          city: string
          created_at: string
          currency: string
          description: string | null
          devices: number
          id: string
          installation_limit: number
          inventory_items: number
          legal_name: string | null
          license_state: string
          name: string
          owner_email: string
          owner_name: string
          owner_phone: string | null
          page_visits_30d: number
          plan: string
          pos_version: string
          profile_completion: number
          public_state: string
          seat_limit: number
          slug: string
          staff: number
          state: string
          timezone: string
          updated_at: string
        }
        Insert: {
          active_sessions?: number
          address?: string | null
          amenities?: string[]
          archived?: boolean
          booking_enabled?: boolean
          bookings_30d?: number
          city?: string
          created_at?: string
          currency?: string
          description?: string | null
          devices?: number
          id?: string
          installation_limit?: number
          inventory_items?: number
          legal_name?: string | null
          license_state?: string
          name: string
          owner_email?: string
          owner_name?: string
          owner_phone?: string | null
          page_visits_30d?: number
          plan?: string
          pos_version?: string
          profile_completion?: number
          public_state?: string
          seat_limit?: number
          slug: string
          staff?: number
          state?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          active_sessions?: number
          address?: string | null
          amenities?: string[]
          archived?: boolean
          booking_enabled?: boolean
          bookings_30d?: number
          city?: string
          created_at?: string
          currency?: string
          description?: string | null
          devices?: number
          id?: string
          installation_limit?: number
          inventory_items?: number
          legal_name?: string | null
          license_state?: string
          name?: string
          owner_email?: string
          owner_name?: string
          owner_phone?: string | null
          page_visits_30d?: number
          plan?: string
          pos_version?: string
          profile_completion?: number
          public_state?: string
          seat_limit?: number
          slug?: string
          staff?: number
          state?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      heartbeats: {
        Row: {
          app_version: string | null
          at: string
          cafe_id: string
          healthy: boolean
          id: string
          installation_id: string
          payload: Json
          sync_queue: number
        }
        Insert: {
          app_version?: string | null
          at?: string
          cafe_id: string
          healthy?: boolean
          id?: string
          installation_id: string
          payload?: Json
          sync_queue?: number
        }
        Update: {
          app_version?: string | null
          at?: string
          cafe_id?: string
          healthy?: boolean
          id?: string
          installation_id?: string
          payload?: Json
          sync_queue?: number
        }
        Relationships: [
          {
            foreignKeyName: "heartbeats_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heartbeats_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          app_version: string
          backup_ok: boolean
          cafe_id: string
          clock_drift_ms: number
          created_at: string
          db_readable: boolean
          db_writable: boolean
          disk_free_gb: number
          id: string
          last_backup: string | null
          last_heartbeat: string | null
          latency_ms: number
          local_api_ok: boolean
          machine_name: string
          migration_state: string
          mode: string
          os: string
          registered_at: string | null
          registration_code: string | null
          revoked_at: string | null
          ring: string
          service_version: string
          sync_queue: number
          token_state: string
          updated_at: string
        }
        Insert: {
          app_version?: string
          backup_ok?: boolean
          cafe_id: string
          clock_drift_ms?: number
          created_at?: string
          db_readable?: boolean
          db_writable?: boolean
          disk_free_gb?: number
          id: string
          last_backup?: string | null
          last_heartbeat?: string | null
          latency_ms?: number
          local_api_ok?: boolean
          machine_name?: string
          migration_state?: string
          mode?: string
          os?: string
          registered_at?: string | null
          registration_code?: string | null
          revoked_at?: string | null
          ring?: string
          service_version?: string
          sync_queue?: number
          token_state?: string
          updated_at?: string
        }
        Update: {
          app_version?: string
          backup_ok?: boolean
          cafe_id?: string
          clock_drift_ms?: number
          created_at?: string
          db_readable?: boolean
          db_writable?: boolean
          disk_free_gb?: number
          id?: string
          last_backup?: string | null
          last_heartbeat?: string | null
          latency_ms?: number
          local_api_ok?: boolean
          machine_name?: string
          migration_state?: string
          mode?: string
          os?: string
          registered_at?: string | null
          registration_code?: string | null
          revoked_at?: string | null
          ring?: string
          service_version?: string
          sync_queue?: number
          token_state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "installations_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          cafe_id: string
          created_at: string
          device_limit: number
          features: string[]
          grace_ends: string | null
          id: string
          installation_limit: number
          last_validation: string | null
          plan: string
          reactivations: number
          renewal_date: string | null
          start_date: string
          state: string
          suspension_reason: string | null
          token_version: number
          updated_at: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          device_limit?: number
          features?: string[]
          grace_ends?: string | null
          id?: string
          installation_limit?: number
          last_validation?: string | null
          plan?: string
          reactivations?: number
          renewal_date?: string | null
          start_date?: string
          state?: string
          suspension_reason?: string | null
          token_version?: number
          updated_at?: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          device_limit?: number
          features?: string[]
          grace_ends?: string | null
          id?: string
          installation_limit?: number
          last_validation?: string | null
          plan?: string
          reactivations?: number
          renewal_date?: string | null
          start_date?: string
          state?: string
          suspension_reason?: string | null
          token_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: true
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          audit_retention_days: number
          backup_warning_hours: number
          grace_period_days: number
          heartbeat_interval_min: number
          id: number
          notify_email: boolean
          notify_in_app: boolean
          offline_threshold_hours: number
          public_booking_default: boolean
          rollout_failure_threshold_pct: number
          support_email: string
          support_phone: string
          supported_versions: string[]
          updated_at: string
        }
        Insert: {
          audit_retention_days?: number
          backup_warning_hours?: number
          grace_period_days?: number
          heartbeat_interval_min?: number
          id?: number
          notify_email?: boolean
          notify_in_app?: boolean
          offline_threshold_hours?: number
          public_booking_default?: boolean
          rollout_failure_threshold_pct?: number
          support_email?: string
          support_phone?: string
          supported_versions?: string[]
          updated_at?: string
        }
        Update: {
          audit_retention_days?: number
          backup_warning_hours?: number
          grace_period_days?: number
          heartbeat_interval_min?: number
          id?: number
          notify_email?: boolean
          notify_in_app?: boolean
          offline_threshold_hours?: number
          public_booking_default?: boolean
          rollout_failure_threshold_pct?: number
          support_email?: string
          support_phone?: string
          supported_versions?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      software_releases: {
        Row: {
          channel: string
          created_at: string
          failed_installs: number
          id: string
          migration_range: string
          notes: string
          published_at: string | null
          ring: string
          rollback_available: boolean
          rollout_pct: number
          updated_at: string
          version: string
        }
        Insert: {
          channel?: string
          created_at?: string
          failed_installs?: number
          id?: string
          migration_range?: string
          notes?: string
          published_at?: string | null
          ring?: string
          rollback_available?: boolean
          rollout_pct?: number
          updated_at?: string
          version: string
        }
        Update: {
          channel?: string
          created_at?: string
          failed_installs?: number
          id?: string
          migration_range?: string
          notes?: string
          published_at?: string | null
          ring?: string
          rollback_available?: boolean
          rollout_pct?: number
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      support_incidents: {
        Row: {
          cafe_id: string
          id: string
          installation_id: string | null
          kind: string
          opened_at: string
          resolved_at: string | null
          severity: string
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          cafe_id: string
          id?: string
          installation_id?: string | null
          kind: string
          opened_at?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Update: {
          cafe_id?: string
          id?: string
          installation_id?: string | null
          kind?: string
          opened_at?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_incidents_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_incidents_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_events: {
        Row: {
          cafe_id: string
          created_at: string
          entity: string
          id: string
          installation_id: string | null
          last_error: string | null
          operation: string
          protected_entity: boolean
          resolution_reason: string | null
          retries: number
          state: string
          updated_at: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          entity: string
          id?: string
          installation_id?: string | null
          last_error?: string | null
          operation?: string
          protected_entity?: boolean
          resolution_reason?: string | null
          retries?: number
          state?: string
          updated_at?: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          entity?: string
          id?: string
          installation_id?: string | null
          last_error?: string | null
          operation?: string
          protected_entity?: boolean
          resolution_reason?: string | null
          retries?: number
          state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_events_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_events_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
