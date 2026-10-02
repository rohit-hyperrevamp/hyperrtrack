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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      _schema_restore_log: {
        Row: {
          at: string | null
          err: string | null
          id: number
          stmt: string | null
        }
        Insert: {
          at?: string | null
          err?: string | null
          id?: number
          stmt?: string | null
        }
        Update: {
          at?: string | null
          err?: string | null
          id?: number
          stmt?: string | null
        }
        Relationships: []
      }
      _schema_restore_queue: {
        Row: {
          done: boolean
          err: string | null
          q: string
          seq: number
        }
        Insert: {
          done?: boolean
          err?: string | null
          q: string
          seq: number
        }
        Update: {
          done?: boolean
          err?: string | null
          q?: string
          seq?: number
        }
        Relationships: []
      }
      addition_types: {
        Row: {
          code: string
          counts_in_t_days: boolean
          created_at: string
          default_amount: number | null
          formula: Json
          id: string
          is_active: boolean
          name: string
          qty_unit: string | null
          rate_source: string
          sort_order: number
          t_days_bucket: string | null
          updated_at: string
        }
        Insert: {
          code: string
          counts_in_t_days?: boolean
          created_at?: string
          default_amount?: number | null
          formula?: Json
          id?: string
          is_active?: boolean
          name: string
          qty_unit?: string | null
          rate_source?: string
          sort_order?: number
          t_days_bucket?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          counts_in_t_days?: boolean
          created_at?: string
          default_amount?: number | null
          formula?: Json
          id?: string
          is_active?: boolean
          name?: string
          qty_unit?: string | null
          rate_source?: string
          sort_order?: number
          t_days_bucket?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      additions: {
        Row: {
          addition_date: string
          addition_name: string
          addition_type_id: string
          affects_days_for: string[]
          amount: number
          calculation_type: string
          candidate_id: string
          computed_amount: number | null
          created_at: string
          days: number | null
          description: string
          entry_mode: string
          id: string
          include_in_total_days: boolean
          installments: number
          per_day_amount: number | null
          qty: number | null
          source_kind: string
          source_ref: string
          status: string
          updated_at: string
        }
        Insert: {
          addition_date: string
          addition_name: string
          addition_type_id: string
          affects_days_for?: string[]
          amount: number
          calculation_type: string
          candidate_id: string
          computed_amount?: number | null
          created_at?: string
          days?: number | null
          description?: string
          entry_mode?: string
          id?: string
          include_in_total_days?: boolean
          installments?: number
          per_day_amount?: number | null
          qty?: number | null
          source_kind?: string
          source_ref?: string
          status?: string
          updated_at?: string
        }
        Update: {
          addition_date?: string
          addition_name?: string
          addition_type_id?: string
          affects_days_for?: string[]
          amount?: number
          calculation_type?: string
          candidate_id?: string
          computed_amount?: number | null
          created_at?: string
          days?: number | null
          description?: string
          entry_mode?: string
          id?: string
          include_in_total_days?: boolean
          installments?: number
          per_day_amount?: number | null
          qty?: number | null
          source_kind?: string
          source_ref?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      alertcheckin_cron_keys: {
        Row: {
          created_at: string
          key_hash: string
        }
        Insert: {
          created_at?: string
          key_hash: string
        }
        Update: {
          created_at?: string
          key_hash?: string
        }
        Relationships: []
      }
      alertcheckin_site_map: {
        Row: {
          ac_site_name: string
          created_at: string
          unit_id: string
        }
        Insert: {
          ac_site_name: string
          created_at?: string
          unit_id: string
        }
        Update: {
          ac_site_name?: string
          created_at?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertcheckin_site_map_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "alertcheckin_site_map_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      alertcheckin_staff_map: {
        Row: {
          ac_site_name: string
          candidate_id: string
          created_at: string
          staff_name: string
        }
        Insert: {
          ac_site_name: string
          candidate_id: string
          created_at?: string
          staff_name: string
        }
        Update: {
          ac_site_name?: string
          candidate_id?: string
          created_at?: string
          staff_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertcheckin_staff_map_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      alertcheckin_sync_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          inserted: number | null
          rows_read: number | null
          skipped: number | null
          source: string
          started_at: string
          sync_date: string
          unmatched: number | null
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          inserted?: number | null
          rows_read?: number | null
          skipped?: number | null
          source?: string
          started_at?: string
          sync_date: string
          unmatched?: number | null
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          inserted?: number | null
          rows_read?: number | null
          skipped?: number | null
          source?: string
          started_at?: string
          sync_date?: string
          unmatched?: number | null
        }
        Relationships: []
      }
      alertcheckin_unmatched: {
        Row: {
          ac_site_name: string
          created_at: string
          hours: number | null
          id: string
          reason: string
          source: string
          staff_name: string
          sync_date: string
          unit_id: string | null
        }
        Insert: {
          ac_site_name: string
          created_at?: string
          hours?: number | null
          id?: string
          reason: string
          source?: string
          staff_name: string
          sync_date: string
          unit_id?: string | null
        }
        Update: {
          ac_site_name?: string
          created_at?: string
          hours?: number | null
          id?: string
          reason?: string
          source?: string
          staff_name?: string
          sync_date?: string
          unit_id?: string | null
        }
        Relationships: []
      }
      allowance_types: {
        Row: {
          base_components: Json
          calc_type: string
          cap_amount: number | null
          cap_flat_amount: number | null
          counts_in_t_days: boolean
          created_at: string
          day_driver: string
          display_name: string
          earning_type: string
          enabled: boolean
          fixed_calc_method: string
          fixed_duty_components: string[]
          fixed_duty_divisor: string | null
          formula: Json
          formula_expression: string | null
          formula_mode: string
          formula_version: number
          id: string
          include_in_ot: boolean
          is_default: boolean
          name: string
          percentage: number
          short_code: string
          short_name: string
          updated_at: string
        }
        Insert: {
          base_components?: Json
          calc_type?: string
          cap_amount?: number | null
          cap_flat_amount?: number | null
          counts_in_t_days?: boolean
          created_at?: string
          day_driver?: string
          display_name?: string
          earning_type?: string
          enabled?: boolean
          fixed_calc_method?: string
          fixed_duty_components?: string[]
          fixed_duty_divisor?: string | null
          formula?: Json
          formula_expression?: string | null
          formula_mode?: string
          formula_version?: number
          id?: string
          include_in_ot?: boolean
          is_default?: boolean
          name: string
          percentage?: number
          short_code?: string
          short_name?: string
          updated_at?: string
        }
        Update: {
          base_components?: Json
          calc_type?: string
          cap_amount?: number | null
          cap_flat_amount?: number | null
          counts_in_t_days?: boolean
          created_at?: string
          day_driver?: string
          display_name?: string
          earning_type?: string
          enabled?: boolean
          fixed_calc_method?: string
          fixed_duty_components?: string[]
          fixed_duty_divisor?: string | null
          formula?: Json
          formula_expression?: string | null
          formula_mode?: string
          formula_version?: number
          id?: string
          include_in_ot?: boolean
          is_default?: boolean
          name?: string
          percentage?: number
          short_code?: string
          short_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          category: string
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      attendance_codes: {
        Row: {
          code: string
          color: string
          counts_as_present: boolean
          created_at: string
          day_value: number
          description: string
          enabled: boolean
          id: string
          is_leave: boolean
          is_paid: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          color?: string
          counts_as_present?: boolean
          created_at?: string
          day_value?: number
          description?: string
          enabled?: boolean
          id?: string
          is_leave?: boolean
          is_paid?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          color?: string
          counts_as_present?: boolean
          created_at?: string
          day_value?: number
          description?: string
          enabled?: boolean
          id?: string
          is_leave?: boolean
          is_paid?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      attendance_entries: {
        Row: {
          candidate_id: string
          code: string
          created_at: string
          designation_id: string | null
          entry_date: string
          id: string
          is_reliever: boolean
          ot_hours: number
          shift_hours: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          code?: string
          created_at?: string
          designation_id?: string | null
          entry_date: string
          id?: string
          is_reliever?: boolean
          ot_hours?: number
          shift_hours?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          code?: string
          created_at?: string
          designation_id?: string | null
          entry_date?: string
          id?: string
          is_reliever?: boolean
          ot_hours?: number
          shift_hours?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_entries_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_location_overrides: {
        Row: {
          candidate_id: string
          mode: string
          notes: string | null
          require_selfie: boolean | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          candidate_id: string
          mode: string
          notes?: string | null
          require_selfie?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          candidate_id?: string
          mode?: string
          notes?: string | null
          require_selfie?: boolean | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_location_overrides_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_location_policies: {
        Row: {
          capture_missing_coords: boolean
          mode: string
          radius_m: number
          require_selfie: boolean
          role_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          capture_missing_coords?: boolean
          mode: string
          radius_m?: number
          require_selfie?: boolean
          role_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          capture_missing_coords?: boolean
          mode?: string
          radius_m?: number
          require_selfie?: boolean
          role_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      attendance_scan_jobs: {
        Row: {
          created_by: string | null
          error: string | null
          estimate_seconds: number | null
          eta_seconds: number | null
          finished_at: string | null
          heartbeat_at: string
          id: string
          kind: string
          period_end: string
          period_start: string
          progress: number
          started_at: string
          status: string
          summary: string | null
          unit_id: string
        }
        Insert: {
          created_by?: string | null
          error?: string | null
          estimate_seconds?: number | null
          eta_seconds?: number | null
          finished_at?: string | null
          heartbeat_at?: string
          id?: string
          kind?: string
          period_end: string
          period_start: string
          progress?: number
          started_at?: string
          status?: string
          summary?: string | null
          unit_id: string
        }
        Update: {
          created_by?: string | null
          error?: string | null
          estimate_seconds?: number | null
          eta_seconds?: number | null
          finished_at?: string | null
          heartbeat_at?: string
          id?: string
          kind?: string
          period_end?: string
          period_start?: string
          progress?: number
          started_at?: string
          status?: string
          summary?: string | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_scan_jobs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "attendance_scan_jobs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sheet_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          period_end: string
          period_start: string
          reason: string
          snapshot: Json
          status: string
          unit_id: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end: string
          period_start: string
          reason?: string
          snapshot?: Json
          status?: string
          unit_id: string
          updated_at?: string
          version: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          period_end?: string
          period_start?: string
          reason?: string
          snapshot?: Json
          status?: string
          unit_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      attendance_sheets: {
        Row: {
          amendment_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          current_version: number
          id: string
          period_end: string
          period_start: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          review_proof_url: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          tally_invoice_name: string | null
          tally_invoice_path: string | null
          tally_invoice_uploaded_at: string | null
          tally_invoice_uploaded_by: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          amendment_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_version?: number
          id?: string
          period_end: string
          period_start: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_proof_url?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tally_invoice_name?: string | null
          tally_invoice_path?: string | null
          tally_invoice_uploaded_at?: string | null
          tally_invoice_uploaded_by?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          amendment_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          current_version?: number
          id?: string
          period_end?: string
          period_start?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          review_proof_url?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          tally_invoice_name?: string | null
          tally_invoice_path?: string | null
          tally_invoice_uploaded_at?: string | null
          tally_invoice_uploaded_by?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      billing_day_bases: {
        Row: {
          code: string
          created_at: string
          description: string | null
          enabled: boolean
          fixed_days: number | null
          id: string
          included_weekdays: number[] | null
          is_default: boolean
          method: string
          name: string
          sort_order: number
          updated_at: string
          weekly_off_day: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          fixed_days?: number | null
          id?: string
          included_weekdays?: number[] | null
          is_default?: boolean
          method?: string
          name: string
          sort_order?: number
          updated_at?: string
          weekly_off_day?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          fixed_days?: number | null
          id?: string
          included_weekdays?: number[] | null
          is_default?: boolean
          method?: string
          name?: string
          sort_order?: number
          updated_at?: string
          weekly_off_day?: number | null
        }
        Relationships: []
      }
      billing_types: {
        Row: {
          code: string | null
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          code: string
          corporate_address: string | null
          created_at: string
          description: string
          gst_state_code: string | null
          gst_state_name: string | null
          gstin: string | null
          id: string
          is_gst_billing_branch: boolean
          is_gst_default: boolean
          name: string
          registered_address: string | null
          state_id: string
          updated_at: string
        }
        Insert: {
          code: string
          corporate_address?: string | null
          created_at?: string
          description?: string
          gst_state_code?: string | null
          gst_state_name?: string | null
          gstin?: string | null
          id?: string
          is_gst_billing_branch?: boolean
          is_gst_default?: boolean
          name?: string
          registered_address?: string | null
          state_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          corporate_address?: string | null
          created_at?: string
          description?: string
          gst_state_code?: string | null
          gst_state_name?: string | null
          gstin?: string | null
          id?: string
          is_gst_billing_branch?: boolean
          is_gst_default?: boolean
          name?: string
          registered_address?: string | null
          state_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: true
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_designations: {
        Row: {
          candidate_id: string
          created_at: string
          designation_id: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_primary: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          designation_id: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          designation_id?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_primary?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_designations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_designations_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_reporting_managers: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          is_primary: boolean
          manager_id: string
          source: string
          unit_id: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          manager_id: string
          source?: string
          unit_id?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          manager_id?: string
          source?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_reporting_managers_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_reporting_managers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_reporting_managers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "candidate_reporting_managers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_units: {
        Row: {
          candidate_id: string
          created_at: string
          designation_id: string | null
          id: string
          is_primary: boolean
          is_reliever: boolean
          shift_hours: number | null
          sort_order: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          designation_id?: string | null
          id?: string
          is_primary?: boolean
          is_reliever?: boolean
          shift_hours?: number | null
          sort_order?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          designation_id?: string | null
          id?: string
          is_primary?: boolean
          is_reliever?: boolean
          shift_hours?: number | null
          sort_order?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_units_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          aadhaar_image_url: string
          aadhaar_number: string
          alt_mobile: string
          application_date: string
          approved_at: string | null
          assigned_asset_ids: string[]
          bank_account_holder: string
          bank_account_number: string
          bank_account_type: string
          bank_branch: string
          bank_ifsc: string
          bank_name: string
          birthplace: string
          candidate_code: string
          caste_category: string
          compliance: Json
          contacts: Json
          created_at: string
          created_by: string | null
          criminal_history: Json
          date_of_birth: string | null
          department_id: string | null
          designation_id: string | null
          documents: Json
          educations: Json
          email: string
          emergency_contact_mobile: string
          emergency_contact_name: string
          emergency_contact_relation: string
          employee_code: string
          esic_card_uploaded_at: string | null
          esic_card_uploaded_by: string | null
          esic_card_url: string | null
          ex_service_id: string | null
          experiences: Json
          extra_curricular: Json
          full_name: string
          gender: string
          id: string
          identification_proofs: Json
          is_disabled: boolean
          is_enabled: boolean
          is_ex_service: boolean
          kyc_completed: boolean
          languages: Json
          marital_status: string
          mobile: string
          no_hire: boolean
          nominations: Json
          non_billable: boolean
          offboarded_at: string | null
          offboarding_details: Json
          offboarding_reason_id: string | null
          onboarding_details: Json
          other_info: Json
          pan_image_url: string
          pan_number: string
          permanent_address1: string
          permanent_address2: string
          permanent_city: string
          permanent_country: string
          permanent_district: string
          permanent_landmark: string
          permanent_pincode: string
          permanent_police_station: string
          permanent_state: string
          personal_mobile: string | null
          photo_url: string
          physical_health: Json
          preferred_joining_date: string | null
          preferred_language: string | null
          present_address1: string
          present_address2: string
          present_city: string
          present_country: string
          present_district: string
          present_landmark: string
          present_pincode: string
          present_police_station: string
          present_state: string
          references: Json
          rejected_at: string | null
          rejection_reason: string
          religion: string
          reports_to: string | null
          role_key: string
          same_as_permanent: boolean
          signature_url: string
          status: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          aadhaar_image_url?: string
          aadhaar_number?: string
          alt_mobile?: string
          application_date?: string
          approved_at?: string | null
          assigned_asset_ids?: string[]
          bank_account_holder?: string
          bank_account_number?: string
          bank_account_type?: string
          bank_branch?: string
          bank_ifsc?: string
          bank_name?: string
          birthplace?: string
          candidate_code?: string
          caste_category?: string
          compliance?: Json
          contacts?: Json
          created_at?: string
          created_by?: string | null
          criminal_history?: Json
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          documents?: Json
          educations?: Json
          email?: string
          emergency_contact_mobile?: string
          emergency_contact_name?: string
          emergency_contact_relation?: string
          employee_code?: string
          esic_card_uploaded_at?: string | null
          esic_card_uploaded_by?: string | null
          esic_card_url?: string | null
          ex_service_id?: string | null
          experiences?: Json
          extra_curricular?: Json
          full_name?: string
          gender?: string
          id?: string
          identification_proofs?: Json
          is_disabled?: boolean
          is_enabled?: boolean
          is_ex_service?: boolean
          kyc_completed?: boolean
          languages?: Json
          marital_status?: string
          mobile?: string
          no_hire?: boolean
          nominations?: Json
          non_billable?: boolean
          offboarded_at?: string | null
          offboarding_details?: Json
          offboarding_reason_id?: string | null
          onboarding_details?: Json
          other_info?: Json
          pan_image_url?: string
          pan_number?: string
          permanent_address1?: string
          permanent_address2?: string
          permanent_city?: string
          permanent_country?: string
          permanent_district?: string
          permanent_landmark?: string
          permanent_pincode?: string
          permanent_police_station?: string
          permanent_state?: string
          personal_mobile?: string | null
          photo_url?: string
          physical_health?: Json
          preferred_joining_date?: string | null
          preferred_language?: string | null
          present_address1?: string
          present_address2?: string
          present_city?: string
          present_country?: string
          present_district?: string
          present_landmark?: string
          present_pincode?: string
          present_police_station?: string
          present_state?: string
          references?: Json
          rejected_at?: string | null
          rejection_reason?: string
          religion?: string
          reports_to?: string | null
          role_key?: string
          same_as_permanent?: boolean
          signature_url?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          aadhaar_image_url?: string
          aadhaar_number?: string
          alt_mobile?: string
          application_date?: string
          approved_at?: string | null
          assigned_asset_ids?: string[]
          bank_account_holder?: string
          bank_account_number?: string
          bank_account_type?: string
          bank_branch?: string
          bank_ifsc?: string
          bank_name?: string
          birthplace?: string
          candidate_code?: string
          caste_category?: string
          compliance?: Json
          contacts?: Json
          created_at?: string
          created_by?: string | null
          criminal_history?: Json
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          documents?: Json
          educations?: Json
          email?: string
          emergency_contact_mobile?: string
          emergency_contact_name?: string
          emergency_contact_relation?: string
          employee_code?: string
          esic_card_uploaded_at?: string | null
          esic_card_uploaded_by?: string | null
          esic_card_url?: string | null
          ex_service_id?: string | null
          experiences?: Json
          extra_curricular?: Json
          full_name?: string
          gender?: string
          id?: string
          identification_proofs?: Json
          is_disabled?: boolean
          is_enabled?: boolean
          is_ex_service?: boolean
          kyc_completed?: boolean
          languages?: Json
          marital_status?: string
          mobile?: string
          no_hire?: boolean
          nominations?: Json
          non_billable?: boolean
          offboarded_at?: string | null
          offboarding_details?: Json
          offboarding_reason_id?: string | null
          onboarding_details?: Json
          other_info?: Json
          pan_image_url?: string
          pan_number?: string
          permanent_address1?: string
          permanent_address2?: string
          permanent_city?: string
          permanent_country?: string
          permanent_district?: string
          permanent_landmark?: string
          permanent_pincode?: string
          permanent_police_station?: string
          permanent_state?: string
          personal_mobile?: string | null
          photo_url?: string
          physical_health?: Json
          preferred_joining_date?: string | null
          preferred_language?: string | null
          present_address1?: string
          present_address2?: string
          present_city?: string
          present_country?: string
          present_district?: string
          present_landmark?: string
          present_pincode?: string
          present_police_station?: string
          present_state?: string
          references?: Json
          rejected_at?: string | null
          rejection_reason?: string
          religion?: string
          reports_to?: string | null
          role_key?: string
          same_as_permanent?: boolean
          signature_url?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contracts: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          billing_type_id: string | null
          company_signature_data: string
          contract_code: string | null
          created_at: string
          created_by: string | null
          description: string
          end_date: string | null
          expiry_date: string | null
          gst_option: string
          id: string
          is_internal: boolean
          original_start_date: string | null
          payroll_window_id: string | null
          promoted_at: string | null
          prospect_code: string | null
          prospect_stage: string
          record_type: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string
          renewal_count: number
          service_type_id: string | null
          signed_at: string | null
          signed_pdf_url: string
          start_date: string | null
          status: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          billing_type_id?: string | null
          company_signature_data?: string
          contract_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          expiry_date?: string | null
          gst_option?: string
          id?: string
          is_internal?: boolean
          original_start_date?: string | null
          payroll_window_id?: string | null
          promoted_at?: string | null
          prospect_code?: string | null
          prospect_stage?: string
          record_type?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string
          renewal_count?: number
          service_type_id?: string | null
          signed_at?: string | null
          signed_pdf_url?: string
          start_date?: string | null
          status?: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          billing_type_id?: string | null
          company_signature_data?: string
          contract_code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string | null
          expiry_date?: string | null
          gst_option?: string
          id?: string
          is_internal?: boolean
          original_start_date?: string | null
          payroll_window_id?: string | null
          promoted_at?: string | null
          prospect_code?: string | null
          prospect_stage?: string
          record_type?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string
          renewal_count?: number
          service_type_id?: string | null
          signed_at?: string | null
          signed_pdf_url?: string
          start_date?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contracts_billing_type_id_fkey"
            columns: ["billing_type_id"]
            isOneToOne: false
            referencedRelation: "billing_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contracts_payroll_window_id_fkey"
            columns: ["payroll_window_id"]
            isOneToOne: false
            referencedRelation: "payroll_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contracts_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "client_contracts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      company_document_templates: {
        Row: {
          body: string
          created_at: string
          doc_type: string
          id: string
          is_active: boolean
          is_archived: boolean
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body?: string
          created_at?: string
          doc_type: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          title?: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          created_at?: string
          doc_type?: string
          id?: string
          is_active?: boolean
          is_archived?: boolean
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      contract_resources: {
        Row: {
          benefits: Json
          components: Json
          contract_id: string
          created_at: string
          deductions: Json
          designation_id: string | null
          employer_contributions: Json
          gross: number
          id: string
          payroll_day_base_id: string | null
          quantity: number
          role_key: string | null
          service_type_id: string | null
          shift_hours: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          benefits?: Json
          components?: Json
          contract_id: string
          created_at?: string
          deductions?: Json
          designation_id?: string | null
          employer_contributions?: Json
          gross?: number
          id?: string
          payroll_day_base_id?: string | null
          quantity?: number
          role_key?: string | null
          service_type_id?: string | null
          shift_hours?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          benefits?: Json
          components?: Json
          contract_id?: string
          created_at?: string
          deductions?: Json
          designation_id?: string | null
          employer_contributions?: Json
          gross?: number
          id?: string
          payroll_day_base_id?: string | null
          quantity?: number
          role_key?: string | null
          service_type_id?: string | null
          shift_hours?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_resources_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "client_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_resources_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      cost_components: {
        Row: {
          amount: number | null
          base_components: Json
          calc_type: string
          cap_amount: number | null
          cap_flat_amount: number | null
          code: string
          created_at: string
          day_driver: string
          deduction_calc_type: string
          description: string | null
          enabled: boolean
          fixed_calc_method: string
          fixed_duty_components: string[]
          fixed_duty_divisor: string | null
          formula: Json
          formula_expression: string | null
          formula_mode: string
          formula_version: number
          id: string
          name: string
          notes: string
          party: string
          percentage: number
          sort_order: number
          state: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          base_components?: Json
          calc_type?: string
          cap_amount?: number | null
          cap_flat_amount?: number | null
          code?: string
          created_at?: string
          day_driver?: string
          deduction_calc_type?: string
          description?: string | null
          enabled?: boolean
          fixed_calc_method?: string
          fixed_duty_components?: string[]
          fixed_duty_divisor?: string | null
          formula?: Json
          formula_expression?: string | null
          formula_mode?: string
          formula_version?: number
          id?: string
          name: string
          notes?: string
          party?: string
          percentage?: number
          sort_order?: number
          state?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          base_components?: Json
          calc_type?: string
          cap_amount?: number | null
          cap_flat_amount?: number | null
          code?: string
          created_at?: string
          day_driver?: string
          deduction_calc_type?: string
          description?: string | null
          enabled?: boolean
          fixed_calc_method?: string
          fixed_duty_components?: string[]
          fixed_duty_divisor?: string | null
          formula?: Json
          formula_expression?: string | null
          formula_mode?: string
          formula_version?: number
          id?: string
          name?: string
          notes?: string
          party?: string
          percentage?: number
          sort_order?: number
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          activity_type: string
          completed: boolean
          created_at: string
          created_by: string | null
          created_by_name: string
          details: string
          id: string
          lead_id: string
          scheduled_at: string | null
          subject: string
        }
        Insert: {
          activity_type?: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          details?: string
          id?: string
          lead_id: string
          scheduled_at?: string | null
          subject?: string
        }
        Update: {
          activity_type?: string
          completed?: boolean
          created_at?: string
          created_by?: string | null
          created_by_name?: string
          details?: string
          id?: string
          lead_id?: string
          scheduled_at?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_requirements: {
        Row: {
          created_at: string
          designation_id: string | null
          designation_label: string
          id: string
          lead_id: string
          notes: string
          quantity: number
          shift_hours: number
        }
        Insert: {
          created_at?: string
          designation_id?: string | null
          designation_label?: string
          id?: string
          lead_id: string
          notes?: string
          quantity?: number
          shift_hours?: number
        }
        Update: {
          created_at?: string
          designation_id?: string | null
          designation_label?: string
          id?: string
          lead_id?: string
          notes?: string
          quantity?: number
          shift_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_requirements_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_requirements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          address: string
          city: string
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string
          contact_title: string
          converted_at: string | null
          converted_contract_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          estimated_monthly_value: number
          expected_close_date: string | null
          id: string
          industry: string
          lead_code: string | null
          lost_reason: string
          next_follow_up_at: string | null
          notes: string
          owner_id: string | null
          owner_name: string
          pincode: string
          probability: number | null
          service_type: string
          source: string
          stage_changed_at: string
          stage_key: string
          state: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          company_name: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contact_title?: string
          converted_at?: string | null
          converted_contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_monthly_value?: number
          expected_close_date?: string | null
          id?: string
          industry?: string
          lead_code?: string | null
          lost_reason?: string
          next_follow_up_at?: string | null
          notes?: string
          owner_id?: string | null
          owner_name?: string
          pincode?: string
          probability?: number | null
          service_type?: string
          source?: string
          stage_changed_at?: string
          stage_key?: string
          state?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          contact_title?: string
          converted_at?: string | null
          converted_contract_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          estimated_monthly_value?: number
          expected_close_date?: string | null
          id?: string
          industry?: string
          lead_code?: string | null
          lost_reason?: string
          next_follow_up_at?: string | null
          notes?: string
          owner_id?: string | null
          owner_name?: string
          pincode?: string
          probability?: number | null
          service_type?: string
          source?: string
          stage_changed_at?: string
          stage_key?: string
          state?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_converted_contract_id_fkey"
            columns: ["converted_contract_id"]
            isOneToOne: false
            referencedRelation: "client_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_stage_key_fkey"
            columns: ["stage_key"]
            isOneToOne: false
            referencedRelation: "crm_stages"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "crm_leads_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "crm_leads_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lost_reasons: {
        Row: {
          id: string
          is_active: boolean
          label: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      crm_quote_lines: {
        Row: {
          billing_rate: number
          designation_id: string | null
          designation_label: string
          gross_salary: number
          id: string
          notes: string
          paid_days: number
          quantity: number
          quote_id: string
          shift_hours: number
          sort_order: number
        }
        Insert: {
          billing_rate?: number
          designation_id?: string | null
          designation_label?: string
          gross_salary?: number
          id?: string
          notes?: string
          paid_days?: number
          quantity?: number
          quote_id: string
          shift_hours?: number
          sort_order?: number
        }
        Update: {
          billing_rate?: number
          designation_id?: string | null
          designation_label?: string
          gross_salary?: number
          id?: string
          notes?: string
          paid_days?: number
          quantity?: number
          quote_id?: string
          shift_hours?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_quote_lines_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "crm_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_quotes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          lead_id: string
          notes: string
          quote_no: string
          sent_at: string | null
          signed_at: string | null
          status: string
          total_monthly: number
          updated_at: string
          valid_until: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id: string
          notes?: string
          quote_no?: string
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          total_monthly?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          lead_id?: string
          notes?: string
          quote_no?: string
          sent_at?: string | null
          signed_at?: string | null
          status?: string
          total_monthly?: number
          updated_at?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_stages: {
        Row: {
          created_at: string
          is_active: boolean
          is_lost: boolean
          is_won: boolean
          key: string
          label: string
          probability: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          is_active?: boolean
          is_lost?: boolean
          is_won?: boolean
          key: string
          label: string
          probability?: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          is_active?: boolean
          is_lost?: boolean
          is_won?: boolean
          key?: string
          label?: string
          probability?: number
          sort_order?: number
        }
        Relationships: []
      }
      customer_gst_numbers: {
        Row: {
          created_at: string
          customer_id: string
          gstin: string
          id: string
          label: string
          state_code: string
          state_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          gstin: string
          id?: string
          label?: string
          state_code?: string
          state_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          gstin?: string
          id?: string
          label?: string
          state_code?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_gst_numbers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          billing_address1: string
          billing_address2: string
          billing_city: string
          billing_country: string
          billing_district: string
          billing_email: string
          billing_fax: string
          billing_name: string
          billing_phone: string
          billing_pincode: string
          billing_salutation: string
          billing_state: string
          code: string
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string
          description: string
          id: string
          industry_type: string
          logo_url: string
          name: string
          phone: string
          shipping_address1: string
          shipping_address2: string
          shipping_city: string
          shipping_country: string
          shipping_district: string
          shipping_email: string
          shipping_fax: string
          shipping_name: string
          shipping_phone: string
          shipping_pincode: string
          shipping_salutation: string
          shipping_same_as_billing: boolean
          shipping_state: string
          short_name: string
          status: Database["public"]["Enums"]["customer_status"]
          updated_at: string
          website: string
        }
        Insert: {
          address?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_country?: string
          billing_district?: string
          billing_email?: string
          billing_fax?: string
          billing_name?: string
          billing_phone?: string
          billing_pincode?: string
          billing_salutation?: string
          billing_state?: string
          code: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          description?: string
          id?: string
          industry_type?: string
          logo_url?: string
          name: string
          phone?: string
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_country?: string
          shipping_district?: string
          shipping_email?: string
          shipping_fax?: string
          shipping_name?: string
          shipping_phone?: string
          shipping_pincode?: string
          shipping_salutation?: string
          shipping_same_as_billing?: boolean
          shipping_state?: string
          short_name?: string
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          website?: string
        }
        Update: {
          address?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_country?: string
          billing_district?: string
          billing_email?: string
          billing_fax?: string
          billing_name?: string
          billing_phone?: string
          billing_pincode?: string
          billing_salutation?: string
          billing_state?: string
          code?: string
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string
          description?: string
          id?: string
          industry_type?: string
          logo_url?: string
          name?: string
          phone?: string
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_country?: string
          shipping_district?: string
          shipping_email?: string
          shipping_fax?: string
          shipping_name?: string
          shipping_phone?: string
          shipping_pincode?: string
          shipping_salutation?: string
          shipping_same_as_billing?: boolean
          shipping_state?: string
          short_name?: string
          status?: Database["public"]["Enums"]["customer_status"]
          updated_at?: string
          website?: string
        }
        Relationships: []
      }
      deduction_types: {
        Row: {
          code: string
          created_at: string
          default_amount: number | null
          formula: Json
          id: string
          is_active: boolean
          name: string
          rate_source: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          default_amount?: number | null
          formula?: Json
          id?: string
          is_active?: boolean
          name: string
          rate_source?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          default_amount?: number | null
          formula?: Json
          id?: string
          is_active?: boolean
          name?: string
          rate_source?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      deductions: {
        Row: {
          affects_days_for: string[]
          amount: number
          calculation_type: string
          candidate_id: string
          computed_amount: number | null
          created_at: string
          days: number | null
          deduction_date: string
          deduction_name: string
          deduction_type_id: string
          description: string
          emi_group_id: string | null
          emi_index: number | null
          emi_total: number | null
          entry_mode: string
          id: string
          include_in_total_days: boolean
          installments: number
          max_duty: number
          min_duty: number
          per_day_amount: number | null
          qty: number | null
          source_kind: string
          source_ref: string
          status: string
          updated_at: string
        }
        Insert: {
          affects_days_for?: string[]
          amount: number
          calculation_type: string
          candidate_id: string
          computed_amount?: number | null
          created_at?: string
          days?: number | null
          deduction_date: string
          deduction_name: string
          deduction_type_id: string
          description?: string
          emi_group_id?: string | null
          emi_index?: number | null
          emi_total?: number | null
          entry_mode?: string
          id?: string
          include_in_total_days?: boolean
          installments?: number
          max_duty?: number
          min_duty?: number
          per_day_amount?: number | null
          qty?: number | null
          source_kind?: string
          source_ref?: string
          status?: string
          updated_at?: string
        }
        Update: {
          affects_days_for?: string[]
          amount?: number
          calculation_type?: string
          candidate_id?: string
          computed_amount?: number | null
          created_at?: string
          days?: number | null
          deduction_date?: string
          deduction_name?: string
          deduction_type_id?: string
          description?: string
          emi_group_id?: string | null
          emi_index?: number | null
          emi_total?: number | null
          entry_mode?: string
          id?: string
          include_in_total_days?: boolean
          installments?: number
          max_duty?: number
          min_duty?: number
          per_day_amount?: number | null
          qty?: number | null
          source_kind?: string
          source_ref?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deductions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deductions_deduction_type_id_fkey"
            columns: ["deduction_type_id"]
            isOneToOne: false
            referencedRelation: "deduction_types"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      designations: {
        Row: {
          billable: boolean
          code: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          billable?: boolean
          code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          billable?: boolean
          code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_push_tokens: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      digilocker_sessions: {
        Row: {
          client_id: string
          created_at: string
          profile: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          profile?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          profile?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      duties: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          hours: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          hours?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          hours?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_scope_assignments: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          scope_id: string
          scope_label: string
          scope_type: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          scope_id: string
          scope_label?: string
          scope_type: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          scope_id?: string
          scope_label?: string
          scope_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_signed_documents: {
        Row: {
          candidate_id: string
          company_signature_data: string
          created_at: string
          doc_type: string
          employee_signature_data: string
          id: string
          rendered_body: string
          signed_at: string | null
          template_id: string
          updated_at: string
          version: number
        }
        Insert: {
          candidate_id: string
          company_signature_data?: string
          created_at?: string
          doc_type: string
          employee_signature_data?: string
          id?: string
          rendered_body?: string
          signed_at?: string | null
          template_id: string
          updated_at?: string
          version: number
        }
        Update: {
          candidate_id?: string
          company_signature_data?: string
          created_at?: string
          doc_type?: string
          employee_signature_data?: string
          id?: string
          rendered_body?: string
          signed_at?: string | null
          template_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      employee_wages: {
        Row: {
          benefits: Json
          candidate_id: string
          components: Json
          created_at: string
          deductions: Json
          department_id: string | null
          designation_id: string | null
          employer_contributions: Json
          gross: number
          id: string
          payroll_day_base_id: string | null
          shift_hours: number
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          benefits?: Json
          candidate_id: string
          components?: Json
          created_at?: string
          deductions?: Json
          department_id?: string | null
          designation_id?: string | null
          employer_contributions?: Json
          gross?: number
          id?: string
          payroll_day_base_id?: string | null
          shift_hours?: number
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          benefits?: Json
          candidate_id?: string
          components?: Json
          created_at?: string
          deductions?: Json
          department_id?: string | null
          designation_id?: string | null
          employer_contributions?: Json
          gross?: number
          id?: string
          payroll_day_base_id?: string | null
          shift_hours?: number
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_wages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_wages_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_wages_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_wages_payroll_day_base_id_fkey"
            columns: ["payroll_day_base_id"]
            isOneToOne: false
            referencedRelation: "payroll_day_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_wages_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "employee_wages_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_contributions: {
        Row: {
          amount: number
          candidate_id: string
          contribution_date: string
          contribution_name: string
          created_at: string
          frequency: string
          id: string
          notes: string
          payroll_run_id: string | null
          period_end: string | null
          period_start: string | null
          source_kind: string
          source_ref: string
          status: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          candidate_id: string
          contribution_date?: string
          contribution_name: string
          created_at?: string
          frequency?: string
          id?: string
          notes?: string
          payroll_run_id?: string | null
          period_end?: string | null
          period_start?: string | null
          source_kind?: string
          source_ref?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          candidate_id?: string
          contribution_date?: string
          contribution_name?: string
          created_at?: string
          frequency?: string
          id?: string
          notes?: string
          payroll_run_id?: string | null
          period_end?: string | null
          period_start?: string | null
          source_kind?: string
          source_ref?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_contributions_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      esic_branches: {
        Row: {
          created_at: string
          enabled: boolean
          esic_code: string
          id: string
          location: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          esic_code: string
          id?: string
          location: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          esic_code?: string
          id?: string
          location?: string
          updated_at?: string
        }
        Relationships: []
      }
      ex_services: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      field_track_points: {
        Row: {
          accuracy: number | null
          candidate_id: string
          created_at: string
          id: string
          lat: number
          lng: number
          recorded_at: string
          track_date: string
          visit_id: string | null
        }
        Insert: {
          accuracy?: number | null
          candidate_id: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          track_date?: string
          visit_id?: string | null
        }
        Update: {
          accuracy?: number | null
          candidate_id?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          track_date?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_track_points_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_track_points_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "field_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      field_visit_requests: {
        Row: {
          acknowledged_at: string | null
          candidate_id: string
          completed_at: string | null
          created_at: string
          id: string
          priority: string
          reason: string
          requested_by: string | null
          status: string
          unit_id: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          candidate_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          reason?: string
          requested_by?: string | null
          status?: string
          unit_id: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          candidate_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          priority?: string
          reason?: string
          requested_by?: string | null
          status?: string
          unit_id?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_visit_requests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visit_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "field_visit_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visit_requests_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "field_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      field_visits: {
        Row: {
          candidate_id: string
          check_in_accuracy: number | null
          check_in_at: string
          check_in_lat: number | null
          check_in_lng: number | null
          check_out_at: string | null
          check_out_lat: number | null
          check_out_lng: number | null
          client_name: string | null
          client_photo_url: string | null
          client_signature_url: string | null
          created_at: string
          customer_rating: number | null
          distance_from_prev_m: number | null
          id: string
          unit_id: string
          updated_at: string
          visit_date: string
          visit_notes: string | null
          visit_seq: number
        }
        Insert: {
          candidate_id: string
          check_in_accuracy?: number | null
          check_in_at?: string
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          client_name?: string | null
          client_photo_url?: string | null
          client_signature_url?: string | null
          created_at?: string
          customer_rating?: number | null
          distance_from_prev_m?: number | null
          id?: string
          unit_id: string
          updated_at?: string
          visit_date?: string
          visit_notes?: string | null
          visit_seq?: number
        }
        Update: {
          candidate_id?: string
          check_in_accuracy?: number | null
          check_in_at?: string
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_out_at?: string | null
          check_out_lat?: number | null
          check_out_lng?: number | null
          client_name?: string | null
          client_photo_url?: string | null
          client_signature_url?: string | null
          created_at?: string
          customer_rating?: number | null
          distance_from_prev_m?: number | null
          id?: string
          unit_id?: string
          updated_at?: string
          visit_date?: string
          visit_notes?: string | null
          visit_seq?: number
        }
        Relationships: [
          {
            foreignKeyName: "field_visits_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_visits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "field_visits_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      final_invoice_units: {
        Row: {
          created_at: string
          final_invoice_id: string
          id: string
          period_end: string
          period_start: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          final_invoice_id: string
          id?: string
          period_end: string
          period_start: string
          unit_id: string
        }
        Update: {
          created_at?: string
          final_invoice_id?: string
          id?: string
          period_end?: string
          period_start?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_invoice_units_final_invoice_id_fkey"
            columns: ["final_invoice_id"]
            isOneToOne: false
            referencedRelation: "final_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_invoice_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "final_invoice_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      final_invoices: {
        Row: {
          billing_state: string | null
          client_token: string | null
          created_at: string
          customer_id: string | null
          fiscal_year: string
          generated_by: string | null
          id: string
          invoice_date: string
          invoice_no: string
          month_code: string
          party_name: string | null
          period_end: string
          period_start: string
          registry_id: string | null
          sequence: number
          state_code: string
          tax_total: number
          taxable_value: number
          total_value: number
          updated_at: string
        }
        Insert: {
          billing_state?: string | null
          client_token?: string | null
          created_at?: string
          customer_id?: string | null
          fiscal_year: string
          generated_by?: string | null
          id?: string
          invoice_date: string
          invoice_no: string
          month_code: string
          party_name?: string | null
          period_end: string
          period_start: string
          registry_id?: string | null
          sequence: number
          state_code: string
          tax_total?: number
          taxable_value?: number
          total_value?: number
          updated_at?: string
        }
        Update: {
          billing_state?: string | null
          client_token?: string | null
          created_at?: string
          customer_id?: string | null
          fiscal_year?: string
          generated_by?: string | null
          id?: string
          invoice_date?: string
          invoice_no?: string
          month_code?: string
          party_name?: string | null
          period_end?: string
          period_start?: string
          registry_id?: string | null
          sequence?: number
          state_code?: string
          tax_total?: number
          taxable_value?: number
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_invoices_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "invoice_number_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      indian_states: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          id: string
          kind: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          id?: string
          kind?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          id?: string
          kind?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inv_adjustment_lines: {
        Row: {
          adjustment_id: string
          created_at: string
          id: string
          item_id: string
          notes: string
          qty_change: number
          size_value: string
        }
        Insert: {
          adjustment_id: string
          created_at?: string
          id?: string
          item_id: string
          notes?: string
          qty_change?: number
          size_value?: string
        }
        Update: {
          adjustment_id?: string
          created_at?: string
          id?: string
          item_id?: string
          notes?: string
          qty_change?: number
          size_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_adjustment_lines_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "inv_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_adjustment_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_adjustments: {
        Row: {
          adjustment_date: string
          adjustment_number: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          location_id: string
          location_type: string
          notes: string
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          adjustment_date?: string
          adjustment_number: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_id: string
          location_type: string
          notes?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Update: {
          adjustment_date?: string
          adjustment_number?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string
          location_type?: string
          notes?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      inv_caps: {
        Row: {
          created_at: string
          id: string
          max_value: number
          min_value: number
          scope_id: string | null
          scope_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_value?: number
          min_value?: number
          scope_id?: string | null
          scope_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_value?: number
          min_value?: number
          scope_id?: string | null
          scope_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inv_demand_lines: {
        Row: {
          created_at: string
          demand_id: string
          fulfilled_qty: number
          id: string
          item_id: string
          requested_qty: number
          size_value: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          demand_id: string
          fulfilled_qty?: number
          id?: string
          item_id: string
          requested_qty?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          demand_id?: string
          fulfilled_qty?: number
          id?: string
          item_id?: string
          requested_qty?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_demand_lines_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "inv_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_demand_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_demands: {
        Row: {
          branch_id: string | null
          cancelled_at: string | null
          created_at: string
          demand_date: string
          demand_number: string
          fulfilled_at: string | null
          fulfillment_source: string
          id: string
          notes: string
          requester_candidate_id: string | null
          requester_id: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          branch_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          demand_date?: string
          demand_number: string
          fulfilled_at?: string | null
          fulfillment_source?: string
          id?: string
          notes?: string
          requester_candidate_id?: string | null
          requester_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          branch_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          demand_date?: string
          demand_number?: string
          fulfilled_at?: string | null
          fulfillment_source?: string
          id?: string
          notes?: string
          requester_candidate_id?: string | null
          requester_id?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inv_demands_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_demands_requester_candidate_id_fkey"
            columns: ["requester_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_demands_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "inv_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_goods_receipt_lines: {
        Row: {
          accepted_qty: number
          created_at: string
          grn_id: string
          id: string
          item_id: string
          ordered_qty: number
          po_line_id: string | null
          received_qty: number
          rejected_qty: number
          rejection_reason: string
          size_value: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          accepted_qty?: number
          created_at?: string
          grn_id: string
          id?: string
          item_id: string
          ordered_qty?: number
          po_line_id?: string | null
          received_qty?: number
          rejected_qty?: number
          rejection_reason?: string
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          accepted_qty?: number
          created_at?: string
          grn_id?: string
          id?: string
          item_id?: string
          ordered_qty?: number
          po_line_id?: string | null
          received_qty?: number
          rejected_qty?: number
          rejection_reason?: string
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_goods_receipt_lines_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "inv_goods_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipt_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipt_lines_po_line_id_fkey"
            columns: ["po_line_id"]
            isOneToOne: false
            referencedRelation: "inv_po_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_goods_receipts: {
        Row: {
          attachments: Json
          branch_id: string | null
          created_at: string
          demand_id: string | null
          grn_number: string
          id: string
          kind: string
          notes: string
          po_id: string | null
          receipt_date: string
          received_at: string | null
          received_by: string | null
          status: string
          transfer_id: string | null
          updated_at: string
          vehicle_number: string
          vendor_challan_number: string
          vendor_id: string | null
          vendor_invoice_number: string
          vendor_invoice_url: string | null
          warehouse_id: string | null
        }
        Insert: {
          attachments?: Json
          branch_id?: string | null
          created_at?: string
          demand_id?: string | null
          grn_number: string
          id?: string
          kind?: string
          notes?: string
          po_id?: string | null
          receipt_date?: string
          received_at?: string | null
          received_by?: string | null
          status?: string
          transfer_id?: string | null
          updated_at?: string
          vehicle_number?: string
          vendor_challan_number?: string
          vendor_id?: string | null
          vendor_invoice_number?: string
          vendor_invoice_url?: string | null
          warehouse_id?: string | null
        }
        Update: {
          attachments?: Json
          branch_id?: string | null
          created_at?: string
          demand_id?: string | null
          grn_number?: string
          id?: string
          kind?: string
          notes?: string
          po_id?: string | null
          receipt_date?: string
          received_at?: string | null
          received_by?: string | null
          status?: string
          transfer_id?: string | null
          updated_at?: string
          vehicle_number?: string
          vendor_challan_number?: string
          vendor_id?: string | null
          vendor_invoice_number?: string
          vendor_invoice_url?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inv_goods_receipts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipts_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "inv_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "inv_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipts_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "inv_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "inv_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_goods_receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "inv_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_issuance_lines: {
        Row: {
          condition: string
          created_at: string
          id: string
          issuance_id: string
          item_id: string
          notes: string
          qty: number
          size_value: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          condition?: string
          created_at?: string
          id?: string
          issuance_id: string
          item_id: string
          notes?: string
          qty?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          condition?: string
          created_at?: string
          id?: string
          issuance_id?: string
          item_id?: string
          notes?: string
          qty?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_issuance_lines_issuance_id_fkey"
            columns: ["issuance_id"]
            isOneToOne: false
            referencedRelation: "inv_issuances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_issuance_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_issuances: {
        Row: {
          ack_method: string
          ack_otp_verified: boolean
          ack_photo_url: string
          ack_signature_url: string
          acknowledged_at: string | null
          collected_at: string | null
          collected_by: string | null
          created_at: string
          demand_id: string | null
          destination_id: string
          destination_type: string
          id: string
          issuance_date: string
          issuance_number: string
          issuance_type: string
          issued_at: string | null
          issued_by: string | null
          notes: string
          otp_code: string | null
          received_at: string | null
          received_by: string | null
          source_id: string
          source_type: string
          status: string
          updated_at: string
        }
        Insert: {
          ack_method?: string
          ack_otp_verified?: boolean
          ack_photo_url?: string
          ack_signature_url?: string
          acknowledged_at?: string | null
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          demand_id?: string | null
          destination_id: string
          destination_type: string
          id?: string
          issuance_date?: string
          issuance_number: string
          issuance_type: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string
          otp_code?: string | null
          received_at?: string | null
          received_by?: string | null
          source_id: string
          source_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          ack_method?: string
          ack_otp_verified?: boolean
          ack_photo_url?: string
          ack_signature_url?: string
          acknowledged_at?: string | null
          collected_at?: string | null
          collected_by?: string | null
          created_at?: string
          demand_id?: string | null
          destination_id?: string
          destination_type?: string
          id?: string
          issuance_date?: string
          issuance_number?: string
          issuance_type?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string
          otp_code?: string | null
          received_at?: string | null
          received_by?: string | null
          source_id?: string
          source_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_issuances_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "inv_demands"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_item_categories: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      inv_item_sizes: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          item_id: string
          reorder_level: number
          size_value: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id: string
          reorder_level?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id?: string
          reorder_level?: number
          size_value?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_item_sizes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_items: {
        Row: {
          category_id: string | null
          co2e_kg_per_unit: number | null
          created_at: string
          default_reorder_level: number
          description: string
          dilution_ratio: string | null
          enabled: boolean
          hazard_class: string | null
          hsn_code: string
          id: string
          image_url: string
          is_concentrate: boolean
          is_serialized: boolean
          is_sized: boolean
          item_code: string
          last_purchase_at: string | null
          last_purchase_price: number | null
          last_purchase_vendor_id: string | null
          msds_path: string | null
          name: string
          rail_category: string | null
          size_chart_id: string | null
          standard_cost: number
          standard_issue_price: number
          unit: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          co2e_kg_per_unit?: number | null
          created_at?: string
          default_reorder_level?: number
          description?: string
          dilution_ratio?: string | null
          enabled?: boolean
          hazard_class?: string | null
          hsn_code?: string
          id?: string
          image_url?: string
          is_concentrate?: boolean
          is_serialized?: boolean
          is_sized?: boolean
          item_code: string
          last_purchase_at?: string | null
          last_purchase_price?: number | null
          last_purchase_vendor_id?: string | null
          msds_path?: string | null
          name: string
          rail_category?: string | null
          size_chart_id?: string | null
          standard_cost?: number
          standard_issue_price?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          co2e_kg_per_unit?: number | null
          created_at?: string
          default_reorder_level?: number
          description?: string
          dilution_ratio?: string | null
          enabled?: boolean
          hazard_class?: string | null
          hsn_code?: string
          id?: string
          image_url?: string
          is_concentrate?: boolean
          is_serialized?: boolean
          is_sized?: boolean
          item_code?: string
          last_purchase_at?: string | null
          last_purchase_price?: number | null
          last_purchase_vendor_id?: string | null
          msds_path?: string | null
          name?: string
          rail_category?: string | null
          size_chart_id?: string | null
          standard_cost?: number
          standard_issue_price?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inv_item_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_items_size_chart_id_fkey"
            columns: ["size_chart_id"]
            isOneToOne: false
            referencedRelation: "inv_size_charts"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_po_lines: {
        Row: {
          accepted_qty: number
          created_at: string
          id: string
          item_id: string
          line_total: number
          notes: string
          ordered_qty: number
          po_id: string
          received_qty: number
          size_value: string
          sort_order: number
          tax_percent: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          accepted_qty?: number
          created_at?: string
          id?: string
          item_id: string
          line_total?: number
          notes?: string
          ordered_qty?: number
          po_id: string
          received_qty?: number
          size_value?: string
          sort_order?: number
          tax_percent?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          accepted_qty?: number
          created_at?: string
          id?: string
          item_id?: string
          line_total?: number
          notes?: string
          ordered_qty?: number
          po_id?: string
          received_qty?: number
          size_value?: string
          sort_order?: number
          tax_percent?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_po_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_po_lines_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "inv_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_purchase_orders: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          destination_branch_id: string | null
          destination_warehouse_id: string | null
          expected_date: string | null
          grand_total: number
          id: string
          notes: string
          po_date: string
          po_number: string
          po_type: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string
          requesting_branch_id: string | null
          requires_approval: boolean
          source_warehouse_id: string | null
          status: string
          subtotal: number
          tax_total: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          destination_branch_id?: string | null
          destination_warehouse_id?: string | null
          expected_date?: string | null
          grand_total?: number
          id?: string
          notes?: string
          po_date?: string
          po_number: string
          po_type?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string
          requesting_branch_id?: string | null
          requires_approval?: boolean
          source_warehouse_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          destination_branch_id?: string | null
          destination_warehouse_id?: string | null
          expected_date?: string | null
          grand_total?: number
          id?: string
          notes?: string
          po_date?: string
          po_number?: string
          po_type?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string
          requesting_branch_id?: string | null
          requires_approval?: boolean
          source_warehouse_id?: string | null
          status?: string
          subtotal?: number
          tax_total?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inv_purchase_orders_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_purchase_orders_destination_warehouse_id_fkey"
            columns: ["destination_warehouse_id"]
            isOneToOne: false
            referencedRelation: "inv_warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_purchase_orders_requesting_branch_id_fkey"
            columns: ["requesting_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_purchase_orders_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "inv_warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "inv_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_settings: {
        Row: {
          description: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      inv_size_charts: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          size_type: string
          updated_at: string
          values: Json
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          size_type?: string
          updated_at?: string
          values?: Json
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          size_type?: string
          updated_at?: string
          values?: Json
        }
        Relationships: []
      }
      inv_stock_balances: {
        Row: {
          id: string
          item_id: string
          location_id: string
          location_type: string
          qty: number
          size_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          location_id: string
          location_type: string
          qty?: number
          size_value?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          location_id?: string
          location_type?: string
          qty?: number
          size_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_stock_balances_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          location_id: string
          location_type: string
          movement_date: string
          movement_type: string
          notes: string
          qty_change: number
          reference_id: string | null
          reference_type: string
          size_value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          location_id: string
          location_type: string
          movement_date?: string
          movement_type: string
          notes?: string
          qty_change: number
          reference_id?: string | null
          reference_type?: string
          size_value?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          location_id?: string
          location_type?: string
          movement_date?: string
          movement_type?: string
          notes?: string
          qty_change?: number
          reference_id?: string | null
          reference_type?: string
          size_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_transfer_lines: {
        Row: {
          created_at: string
          dispatched_qty: number
          id: string
          item_id: string
          received_qty: number
          size_value: string
          sort_order: number
          transfer_id: string
          updated_at: string
          variance_reason: string
        }
        Insert: {
          created_at?: string
          dispatched_qty?: number
          id?: string
          item_id: string
          received_qty?: number
          size_value?: string
          sort_order?: number
          transfer_id: string
          updated_at?: string
          variance_reason?: string
        }
        Update: {
          created_at?: string
          dispatched_qty?: number
          id?: string
          item_id?: string
          received_qty?: number
          size_value?: string
          sort_order?: number
          transfer_id?: string
          updated_at?: string
          variance_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_transfer_lines_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "inv_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_transfers: {
        Row: {
          acknowledgement: Json
          created_at: string
          demand_id: string | null
          destination_id: string
          destination_type: string
          dispatched_at: string | null
          dispatched_by: string | null
          driver_name: string
          driver_phone: string
          id: string
          linked_po_id: string | null
          notes: string
          received_at: string | null
          received_by: string | null
          source_id: string
          source_type: string
          status: string
          transfer_date: string
          transfer_number: string
          updated_at: string
          vehicle_number: string
        }
        Insert: {
          acknowledgement?: Json
          created_at?: string
          demand_id?: string | null
          destination_id: string
          destination_type: string
          dispatched_at?: string | null
          dispatched_by?: string | null
          driver_name?: string
          driver_phone?: string
          id?: string
          linked_po_id?: string | null
          notes?: string
          received_at?: string | null
          received_by?: string | null
          source_id: string
          source_type: string
          status?: string
          transfer_date?: string
          transfer_number: string
          updated_at?: string
          vehicle_number?: string
        }
        Update: {
          acknowledgement?: Json
          created_at?: string
          demand_id?: string | null
          destination_id?: string
          destination_type?: string
          dispatched_at?: string | null
          dispatched_by?: string | null
          driver_name?: string
          driver_phone?: string
          id?: string
          linked_po_id?: string | null
          notes?: string
          received_at?: string | null
          received_by?: string | null
          source_id?: string
          source_type?: string
          status?: string
          transfer_date?: string
          transfer_number?: string
          updated_at?: string
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_transfers_demand_id_fkey"
            columns: ["demand_id"]
            isOneToOne: false
            referencedRelation: "inv_demands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_transfers_linked_po_id_fkey"
            columns: ["linked_po_id"]
            isOneToOne: false
            referencedRelation: "inv_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_vendor_rate_cards: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          item_id: string
          lead_time_days: number
          min_order_qty: number
          notes: string
          size_value: string
          tax_percent: number
          unit_price: number
          updated_at: string
          valid_from: string | null
          valid_to: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id: string
          lead_time_days?: number
          min_order_qty?: number
          notes?: string
          size_value?: string
          tax_percent?: number
          unit_price?: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          item_id?: string
          lead_time_days?: number
          min_order_qty?: number
          notes?: string
          size_value?: string
          tax_percent?: number
          unit_price?: number
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_vendor_rate_cards_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inv_vendor_rate_cards_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "inv_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      inv_vendors: {
        Row: {
          address1: string
          address2: string
          bank_details: Json
          city: string
          contact_person: string
          country: string
          created_at: string
          email: string
          enabled: boolean
          gstin: string
          id: string
          name: string
          notes: string
          pan: string
          payment_terms: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          vendor_code: string
        }
        Insert: {
          address1?: string
          address2?: string
          bank_details?: Json
          city?: string
          contact_person?: string
          country?: string
          created_at?: string
          email?: string
          enabled?: boolean
          gstin?: string
          id?: string
          name: string
          notes?: string
          pan?: string
          payment_terms?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          vendor_code: string
        }
        Update: {
          address1?: string
          address2?: string
          bank_details?: Json
          city?: string
          contact_person?: string
          country?: string
          created_at?: string
          email?: string
          enabled?: boolean
          gstin?: string
          id?: string
          name?: string
          notes?: string
          pan?: string
          payment_terms?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          vendor_code?: string
        }
        Relationships: []
      }
      inv_warehouses: {
        Row: {
          address1: string
          address2: string
          city: string
          country: string
          created_at: string
          enabled: boolean
          id: string
          in_charge_candidate_id: string | null
          is_default: boolean
          name: string
          notes: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          warehouse_code: string
        }
        Insert: {
          address1?: string
          address2?: string
          city?: string
          country?: string
          created_at?: string
          enabled?: boolean
          id?: string
          in_charge_candidate_id?: string | null
          is_default?: boolean
          name: string
          notes?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          warehouse_code: string
        }
        Update: {
          address1?: string
          address2?: string
          city?: string
          country?: string
          created_at?: string
          enabled?: boolean
          id?: string
          in_charge_candidate_id?: string | null
          is_default?: boolean
          name?: string
          notes?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          warehouse_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "inv_warehouses_in_charge_candidate_id_fkey"
            columns: ["in_charge_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_extra_charges: {
        Row: {
          contract_id: string | null
          created_at: string
          description: string
          enabled: boolean
          hsn_sac: string
          id: string
          per_label: string
          period_end: string | null
          period_start: string | null
          quantity: number
          rate: number
          sort_order: number
          unit_id: string
          updated_at: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          description: string
          enabled?: boolean
          hsn_sac?: string
          id?: string
          per_label?: string
          period_end?: string | null
          period_start?: string | null
          quantity?: number
          rate?: number
          sort_order?: number
          unit_id: string
          updated_at?: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          description?: string
          enabled?: boolean
          hsn_sac?: string
          id?: string
          per_label?: string
          period_end?: string | null
          period_start?: string | null
          quantity?: number
          rate?: number
          sort_order?: number
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_extra_charges_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "client_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_extra_charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "invoice_extra_charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_client_tokens: {
        Row: {
          created_at: string
          customer_id: string | null
          enabled: boolean
          id: string
          sample_party_name: string | null
          state_code: string
          token: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          enabled?: boolean
          id?: string
          sample_party_name?: string | null
          state_code: string
          token: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          enabled?: boolean
          id?: string
          sample_party_name?: string | null
          state_code?: string
          token?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_number_client_tokens_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_number_client_tokens_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "invoice_number_client_tokens_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_registry: {
        Row: {
          client_token: string | null
          created_at: string
          created_by: string | null
          fiscal_year: string
          id: string
          invoice_no: string
          irn_date_text: string | null
          irn_number: string | null
          issued_on: string | null
          month_code: string
          party_name: string | null
          remarks: string | null
          sequence: number
          source: string
          state_code: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          client_token?: string | null
          created_at?: string
          created_by?: string | null
          fiscal_year: string
          id?: string
          invoice_no: string
          irn_date_text?: string | null
          irn_number?: string | null
          issued_on?: string | null
          month_code: string
          party_name?: string | null
          remarks?: string | null
          sequence: number
          source?: string
          state_code: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          client_token?: string | null
          created_at?: string
          created_by?: string | null
          fiscal_year?: string
          id?: string
          invoice_no?: string
          irn_date_text?: string | null
          irn_number?: string | null
          issued_on?: string | null
          month_code?: string
          party_name?: string | null
          remarks?: string | null
          sequence?: number
          source?: string
          state_code?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_number_registry_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "invoice_number_registry_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_series: {
        Row: {
          created_at: string
          enabled: boolean
          fiscal_year: string
          id: string
          last_sequence: number
          notes: string | null
          number_prefix: string | null
          seq_padding: number
          state_code: string
          state_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          fiscal_year: string
          id?: string
          last_sequence?: number
          notes?: string | null
          number_prefix?: string | null
          seq_padding?: number
          state_code: string
          state_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          fiscal_year?: string
          id?: string
          last_sequence?: number
          notes?: string | null
          number_prefix?: string | null
          seq_padding?: number
          state_code?: string
          state_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      labour_welfare_funds: {
        Row: {
          created_at: string
          deduction_months: number[]
          employee_contribution: number
          employer_contribution: number
          enabled: boolean
          frequency: string
          id: string
          notes: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deduction_months?: number[]
          employee_contribution?: number
          employer_contribution?: number
          enabled?: boolean
          frequency?: string
          id?: string
          notes?: string
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deduction_months?: number[]
          employee_contribution?: number
          employer_contribution?: number
          enabled?: boolean
          frequency?: string
          id?: string
          notes?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      mis_template_columns: {
        Row: {
          client_attribute: boolean
          created_at: string
          enabled: boolean
          header: string
          id: string
          sort_order: number
          source: string
          system_key: string | null
          template_id: string
          updated_at: string
        }
        Insert: {
          client_attribute?: boolean
          created_at?: string
          enabled?: boolean
          header: string
          id?: string
          sort_order?: number
          source?: string
          system_key?: string | null
          template_id: string
          updated_at?: string
        }
        Update: {
          client_attribute?: boolean
          created_at?: string
          enabled?: boolean
          header?: string
          id?: string
          sort_order?: number
          source?: string
          system_key?: string | null
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mis_template_columns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mis_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      mis_templates: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          enabled: boolean
          id: string
          mis_applicable: boolean
          name: string
          row_grain: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          enabled?: boolean
          id?: string
          mis_applicable?: boolean
          name: string
          row_grain?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          enabled?: boolean
          id?: string
          mis_applicable?: boolean
          name?: string
          row_grain?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mis_templates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      mis_unit_values: {
        Row: {
          column_id: string
          created_at: string
          id: string
          template_id: string
          unit_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          column_id: string
          created_at?: string
          id?: string
          template_id: string
          unit_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          column_id?: string
          created_at?: string
          id?: string
          template_id?: string
          unit_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mis_unit_values_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "mis_template_columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mis_unit_values_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mis_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mis_unit_values_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "mis_unit_values_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          link: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          link?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          link?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      offboarding_reasons: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      org_settings: {
        Row: {
          bank_account_no: string | null
          bank_branch: string | null
          bank_ifsc: string | null
          bank_name: string | null
          cin: string | null
          company_gstin: string | null
          company_name: string | null
          company_state: string | null
          company_state_code: string | null
          corporate_address: string | null
          created_at: string
          default_hsn_sac: string | null
          email: string | null
          esic_number: string | null
          id: string
          invoice_declaration: string | null
          invoice_note: string | null
          msme_udyam_no: string | null
          pan: string | null
          pf_number: string | null
          phone: string | null
          registered_address: string | null
          singleton: boolean
          supplier_type: string | null
          updated_at: string
        }
        Insert: {
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          cin?: string | null
          company_gstin?: string | null
          company_name?: string | null
          company_state?: string | null
          company_state_code?: string | null
          corporate_address?: string | null
          created_at?: string
          default_hsn_sac?: string | null
          email?: string | null
          esic_number?: string | null
          id?: string
          invoice_declaration?: string | null
          invoice_note?: string | null
          msme_udyam_no?: string | null
          pan?: string | null
          pf_number?: string | null
          phone?: string | null
          registered_address?: string | null
          singleton?: boolean
          supplier_type?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          cin?: string | null
          company_gstin?: string | null
          company_name?: string | null
          company_state?: string | null
          company_state_code?: string | null
          corporate_address?: string | null
          created_at?: string
          default_hsn_sac?: string | null
          email?: string | null
          esic_number?: string | null
          id?: string
          invoice_declaration?: string | null
          invoice_note?: string | null
          msme_udyam_no?: string | null
          pan?: string | null
          pf_number?: string | null
          phone?: string | null
          registered_address?: string | null
          singleton?: boolean
          supplier_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payroll_day_bases: {
        Row: {
          code: string
          created_at: string
          description: string
          enabled: boolean
          fixed_days: number | null
          id: string
          included_weekdays: number[] | null
          is_default: boolean
          method: string
          name: string
          sort_order: number
          updated_at: string
          weekly_off_day: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          enabled?: boolean
          fixed_days?: number | null
          id?: string
          included_weekdays?: number[] | null
          is_default?: boolean
          method: string
          name: string
          sort_order?: number
          updated_at?: string
          weekly_off_day?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          enabled?: boolean
          fixed_days?: number | null
          id?: string
          included_weekdays?: number[] | null
          is_default?: boolean
          method?: string
          name?: string
          sort_order?: number
          updated_at?: string
          weekly_off_day?: number | null
        }
        Relationships: []
      }
      payroll_processing_holds: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string | null
          id: string
          payroll_run_id: string
          reason: string
          status: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          payroll_run_id: string
          reason?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          payroll_run_id?: string
          reason?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_processing_holds_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_run_snapshots: {
        Row: {
          additions: Json
          candidate_id: string
          created_at: string
          deductions: Json
          earnings: Json
          ed_days: number
          employee_code: string
          employer_contributions: Json
          full_name: string
          gross: number
          id: string
          net_pay: number
          on_hold: boolean
          paid_days: number
          payroll_run_id: string
          posted_at: string
          posted_by: string | null
          total_deductions: number
          total_employer: number
          unit_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          additions?: Json
          candidate_id: string
          created_at?: string
          deductions?: Json
          earnings?: Json
          ed_days?: number
          employee_code?: string
          employer_contributions?: Json
          full_name?: string
          gross?: number
          id?: string
          net_pay?: number
          on_hold?: boolean
          paid_days?: number
          payroll_run_id: string
          posted_at?: string
          posted_by?: string | null
          total_deductions?: number
          total_employer?: number
          unit_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          additions?: Json
          candidate_id?: string
          created_at?: string
          deductions?: Json
          earnings?: Json
          ed_days?: number
          employee_code?: string
          employer_contributions?: Json
          full_name?: string
          gross?: number
          id?: string
          net_pay?: number
          on_hold?: boolean
          paid_days?: number
          payroll_run_id?: string
          posted_at?: string
          posted_by?: string | null
          total_deductions?: number
          total_employer?: number
          unit_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_run_snapshots_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          invoice_processed_at: string | null
          invoice_processed_by: string | null
          invoice_status: string
          payroll_processed_at: string | null
          payroll_processed_by: string | null
          payroll_status: string
          period_end: string
          period_start: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          submitted_by: string | null
          unit_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          invoice_processed_at?: string | null
          invoice_processed_by?: string | null
          invoice_status?: string
          payroll_processed_at?: string | null
          payroll_processed_by?: string | null
          payroll_status?: string
          period_end: string
          period_start: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          unit_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          invoice_processed_at?: string | null
          invoice_processed_by?: string | null
          invoice_status?: string
          payroll_processed_at?: string | null
          payroll_processed_by?: string | null
          payroll_status?: string
          period_end?: string
          period_start?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "payroll_runs_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_windows: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          label: string
          processing_day: number
          updated_at: string
          window_end_day: number
          window_start_day: number
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          processing_day: number
          updated_at?: string
          window_end_day: number
          window_start_day: number
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          processing_day?: number
          updated_at?: string
          window_end_day?: number
          window_start_day?: number
        }
        Relationships: []
      }
      pincode_ranges: {
        Row: {
          created_at: string
          id: string
          is_excluded: boolean
          notes: string
          range_end: number
          range_start: number
          region_label: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_excluded?: boolean
          notes?: string
          range_end: number
          range_start: number
          region_label?: string
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_excluded?: boolean
          notes?: string
          range_end?: number
          range_start?: number
          region_label?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          additional_cover: number | null
          created_at: string
          description: string
          document_name: string | null
          document_path: string | null
          enabled: boolean
          end_date: string | null
          id: string
          name: string
          policy_number: string
          provider: string
          start_date: string | null
          sum_assured: number | null
          ttd_enabled: boolean
          updated_at: string
        }
        Insert: {
          additional_cover?: number | null
          created_at?: string
          description?: string
          document_name?: string | null
          document_path?: string | null
          enabled?: boolean
          end_date?: string | null
          id?: string
          name: string
          policy_number?: string
          provider?: string
          start_date?: string | null
          sum_assured?: number | null
          ttd_enabled?: boolean
          updated_at?: string
        }
        Update: {
          additional_cover?: number | null
          created_at?: string
          description?: string
          document_name?: string | null
          document_path?: string | null
          enabled?: boolean
          end_date?: string | null
          id?: string
          name?: string
          policy_number?: string
          provider?: string
          start_date?: string | null
          sum_assured?: number | null
          ttd_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      professional_tax_slabs: {
        Row: {
          created_at: string
          gender: string
          id: string
          period: string
          pincode_coverage: string
          region_label: string
          salary_max: number | null
          salary_min: number
          state: string
          tax_per_month: number
          updated_at: string
          working_days: string
        }
        Insert: {
          created_at?: string
          gender?: string
          id?: string
          period?: string
          pincode_coverage?: string
          region_label?: string
          salary_max?: number | null
          salary_min?: number
          state: string
          tax_per_month?: number
          updated_at?: string
          working_days?: string
        }
        Update: {
          created_at?: string
          gender?: string
          id?: string
          period?: string
          pincode_coverage?: string
          region_label?: string
          salary_max?: number | null
          salary_min?: number
          state?: string
          tax_per_month?: number
          updated_at?: string
          working_days?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address1: string | null
          address2: string | null
          carpet_area_sqft: number | null
          city: string | null
          configuration: string | null
          created_at: string
          current_value: number | null
          enabled: boolean
          house_number: string
          id: string
          name: string | null
          notes: string | null
          owner: string | null
          pincode: string | null
          property_tax_id: string | null
          purchase_date: string | null
          purchase_value: number | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          carpet_area_sqft?: number | null
          city?: string | null
          configuration?: string | null
          created_at?: string
          current_value?: number | null
          enabled?: boolean
          house_number: string
          id?: string
          name?: string | null
          notes?: string | null
          owner?: string | null
          pincode?: string | null
          property_tax_id?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          carpet_area_sqft?: number | null
          city?: string | null
          configuration?: string | null
          created_at?: string
          current_value?: number | null
          enabled?: boolean
          house_number?: string
          id?: string
          name?: string | null
          notes?: string | null
          owner?: string | null
          pincode?: string | null
          property_tax_id?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          enabled: boolean
          expense_date: string
          id: string
          notes: string | null
          payment_mode: string | null
          property_id: string
          receipt_url: string | null
          updated_at: string
          vendor_name: string | null
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          enabled?: boolean
          expense_date: string
          id?: string
          notes?: string | null
          payment_mode?: string | null
          property_id: string
          receipt_url?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          enabled?: boolean
          expense_date?: string
          id?: string
          notes?: string | null
          payment_mode?: string | null
          property_id?: string
          receipt_url?: string | null
          updated_at?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_loans: {
        Row: {
          created_at: string
          emi_amount: number | null
          enabled: boolean
          end_date: string | null
          id: string
          interest_rate: number | null
          lender_name: string
          loan_account_number: string | null
          notes: string | null
          outstanding_amount: number | null
          property_id: string
          sanctioned_amount: number | null
          start_date: string | null
          status: string
          tenure_months: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          emi_amount?: number | null
          enabled?: boolean
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          lender_name: string
          loan_account_number?: string | null
          notes?: string | null
          outstanding_amount?: number | null
          property_id: string
          sanctioned_amount?: number | null
          start_date?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          emi_amount?: number | null
          enabled?: boolean
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          lender_name?: string
          loan_account_number?: string | null
          notes?: string | null
          outstanding_amount?: number | null
          property_id?: string
          sanctioned_amount?: number | null
          start_date?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_loans_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          created_at: string
          enabled: boolean
          holiday_day: number
          holiday_month: number
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          holiday_day: number
          holiday_month: number
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          holiday_day?: number
          holiday_month?: number
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      rail_acwp_runs: {
        Row: {
          coaches: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          fresh_litres: number | null
          id: string
          kwh: number | null
          location_id: string | null
          recycled_litres: number | null
          run_date: string
          run_minutes: number | null
          source_file: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coaches: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fresh_litres?: number | null
          id?: string
          kwh?: number | null
          location_id?: string | null
          recycled_litres?: number | null
          run_date: string
          run_minutes?: number | null
          source_file?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coaches?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          fresh_litres?: number | null
          id?: string
          kwh?: number | null
          location_id?: string | null
          recycled_litres?: number | null
          run_date?: string
          run_minutes?: number | null
          source_file?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_acwp_runs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_ai_photo_scores: {
        Row: {
          area: string | null
          coach_number: string | null
          coach_type: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          issues: Json
          model: string
          photo_path: string
          score: number
          scored_by: string | null
          summary: string | null
          updated_at: string
          updated_by: string | null
          verdict: string
        }
        Insert: {
          area?: string | null
          coach_number?: string | null
          coach_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issues?: Json
          model: string
          photo_path: string
          score: number
          scored_by?: string | null
          summary?: string | null
          updated_at?: string
          updated_by?: string | null
          verdict: string
        }
        Update: {
          area?: string | null
          coach_number?: string | null
          coach_type?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issues?: Json
          model?: string
          photo_path?: string
          score?: number
          scored_by?: string | null
          summary?: string | null
          updated_at?: string
          updated_by?: string | null
          verdict?: string
        }
        Relationships: []
      }
      rail_ai_settings: {
        Row: {
          areas: string[]
          attention_score: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          pass_score: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          areas?: string[]
          attention_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          pass_score?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          areas?: string[]
          attention_score?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          pass_score?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_alert_rules: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          enabled: boolean
          id: string
          name: string
          notify_roles: string[]
          threshold_minutes: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          name: string
          notify_roles?: string[]
          threshold_minutes?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          enabled?: boolean
          id?: string
          name?: string
          notify_roles?: string[]
          threshold_minutes?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_alerts: {
        Row: {
          ack_at: string | null
          ack_by: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          link: string | null
          location_id: string | null
          message: string
          rule_code: string
          severity: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ack_at?: string | null
          ack_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          link?: string | null
          location_id?: string | null
          message: string
          rule_code: string
          severity?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ack_at?: string | null
          ack_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          link?: string | null
          location_id?: string | null
          message?: string
          rule_code?: string
          severity?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_asset_custody: {
        Row: {
          asset_id: string
          checked_in_at: string | null
          checked_out_at: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          due_back_at: string | null
          id: string
          in_condition: string | null
          location_id: string | null
          out_condition: string
          person_id: string
          photo_path: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_id: string
          checked_in_at?: string | null
          checked_out_at?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_back_at?: string | null
          id?: string
          in_condition?: string | null
          location_id?: string | null
          out_condition?: string
          person_id: string
          photo_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_id?: string
          checked_in_at?: string | null
          checked_out_at?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          due_back_at?: string | null
          id?: string
          in_condition?: string | null
          location_id?: string | null
          out_condition?: string
          person_id?: string
          photo_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_asset_custody_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "rail_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_asset_custody_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "rail_people"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_asset_maintenance: {
        Row: {
          asset_id: string
          closed_at: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          downtime_hours: number | null
          due_on: string | null
          id: string
          kind: string
          location_id: string | null
          opened_at: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_id: string
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          downtime_hours?: number | null
          due_on?: string | null
          id?: string
          kind?: string
          location_id?: string | null
          opened_at?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_id?: string
          closed_at?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          downtime_hours?: number | null
          due_on?: string | null
          id?: string
          kind?: string
          location_id?: string | null
          opened_at?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_asset_maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "rail_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_assets: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          custodian_person_id: string | null
          deleted_at: string | null
          id: string
          last_pm_on: string | null
          location_id: string | null
          name: string
          pm_every_days: number | null
          pm_every_hours: number | null
          purchase_date: string | null
          qr_tag: string
          run_hours: number
          serial_no: string | null
          status: string
          updated_at: string
          updated_by: string | null
          value: number | null
          warranty_until: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          custodian_person_id?: string | null
          deleted_at?: string | null
          id?: string
          last_pm_on?: string | null
          location_id?: string | null
          name: string
          pm_every_days?: number | null
          pm_every_hours?: number | null
          purchase_date?: string | null
          qr_tag: string
          run_hours?: number
          serial_no?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          value?: number | null
          warranty_until?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          custodian_person_id?: string | null
          deleted_at?: string | null
          id?: string
          last_pm_on?: string | null
          location_id?: string | null
          name?: string
          pm_every_days?: number | null
          pm_every_hours?: number | null
          purchase_date?: string | null
          qr_tag?: string
          run_hours?: number
          serial_no?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          value?: number | null
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_assets_custodian_person_id_fkey"
            columns: ["custodian_person_id"]
            isOneToOne: false
            referencedRelation: "rail_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_assets_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          hours: number | null
          id: string
          location_id: string | null
          person_id: string
          shift_id: string | null
          updated_at: string
          updated_by: string | null
          work_date: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hours?: number | null
          id?: string
          location_id?: string | null
          person_id: string
          shift_id?: string | null
          updated_at?: string
          updated_by?: string | null
          work_date: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          hours?: number | null
          id?: string
          location_id?: string | null
          person_id?: string
          shift_id?: string | null
          updated_at?: string
          updated_by?: string | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "rail_attendance_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "rail_people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_attendance_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "rail_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_audit_trail: {
        Row: {
          action: string
          actor: string | null
          at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor?: string | null
          at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor?: string | null
          at?: string
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      rail_bill_lines: {
        Row: {
          amount: number
          bill_id: string
          billing_unit: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          dup_key: string | null
          event_coach_id: string | null
          event_id: string | null
          id: string
          qty: number
          rate: number
          rate_line_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          billing_unit: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          dup_key?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          qty: number
          rate: number
          rate_line_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          billing_unit?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          dup_key?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          qty?: number
          rate?: number
          rate_line_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_bill_lines_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "rail_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_bill_signoffs: {
        Row: {
          bill_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          file_sha256: string | null
          id: string
          signed_at: string
          signer: string | null
          signer_mobile: string | null
          stage: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bill_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_sha256?: string | null
          id?: string
          signed_at?: string
          signer?: string | null
          signer_mobile?: string | null
          stage: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bill_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_sha256?: string | null
          id?: string
          signed_at?: string
          signer?: string | null
          signer_mobile?: string | null
          stage?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_bill_signoffs_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "rail_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_bills: {
        Row: {
          annexure_sha256: string | null
          bill_month: string
          bill_no: string | null
          certified_at: string | null
          certified_by: string | null
          checker_signed_at: string | null
          checker_signed_by: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          credit_total: number
          deleted_at: string | null
          gross: number
          gst_amount: number
          gst_percent: number
          id: string
          net_total: number
          paid_at: string | null
          paid_ref: string | null
          penalty_total: number
          status: string
          submitted_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          annexure_sha256?: string | null
          bill_month: string
          bill_no?: string | null
          certified_at?: string | null
          certified_by?: string | null
          checker_signed_at?: string | null
          checker_signed_by?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          credit_total?: number
          deleted_at?: string | null
          gross?: number
          gst_amount?: number
          gst_percent?: number
          id?: string
          net_total?: number
          paid_at?: string | null
          paid_ref?: string | null
          penalty_total?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          annexure_sha256?: string | null
          bill_month?: string
          bill_no?: string | null
          certified_at?: string | null
          certified_by?: string | null
          checker_signed_at?: string | null
          checker_signed_by?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          credit_total?: number
          deleted_at?: string | null
          gross?: number
          gst_amount?: number
          gst_percent?: number
          id?: string
          net_total?: number
          paid_at?: string | null
          paid_ref?: string | null
          penalty_total?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_bills_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_checklist_items: {
        Row: {
          ai_check: boolean
          area: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          label_en: string
          label_hi: string | null
          label_mr: string | null
          photo_required: boolean
          sort_order: number
          template_id: string
          updated_at: string
          updated_by: string | null
          weight: number
        }
        Insert: {
          ai_check?: boolean
          area: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label_en: string
          label_hi?: string | null
          label_mr?: string | null
          photo_required?: boolean
          sort_order?: number
          template_id: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Update: {
          ai_check?: boolean
          area?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label_en?: string
          label_hi?: string | null
          label_mr?: string | null
          photo_required?: boolean
          sort_order?: number
          template_id?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "rail_checklist_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "rail_checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_checklist_templates: {
        Row: {
          coach_type_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          service_type_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name: string
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_checklist_templates_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_checklist_templates_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "rail_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_coach_families: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_coach_types: {
        Row: {
          area_m2: number | null
          berths: number | null
          billable: boolean
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          family_id: string | null
          icon: string | null
          id: string
          name: string
          seats: number | null
          toilet_count: number
          toilet_type: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_m2?: number | null
          berths?: number | null
          billable?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          name: string
          seats?: number | null
          toilet_count?: number
          toilet_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_m2?: number | null
          berths?: number | null
          billable?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          seats?: number | null
          toilet_count?: number
          toilet_type?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_coach_types_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_families"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_coaches: {
        Row: {
          coach_number: string
          coach_type_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          last_intensive_on: string | null
          owning_depot_id: string | null
          qr_code: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coach_number: string
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          last_intensive_on?: string | null
          owning_depot_id?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coach_number?: string
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          last_intensive_on?: string | null
          owning_depot_id?: string | null
          qr_code?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_coaches_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_coaches_owning_depot_id_fkey"
            columns: ["owning_depot_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_complaints: {
        Row: {
          assigned_to: string | null
          category: string
          coach_number: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          location_id: string | null
          ref_no: string | null
          resolved_at: string | null
          sla_due: string | null
          source: string
          status: string
          train_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          coach_number?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          ref_no?: string | null
          resolved_at?: string | null
          sla_due?: string | null
          source?: string
          status?: string
          train_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          coach_number?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          location_id?: string | null
          ref_no?: string | null
          resolved_at?: string | null
          sla_due?: string | null
          source?: string
          status?: string
          train_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_complaints_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "rail_trains"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_compliance_docs: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          doc_type: string
          file_path: string | null
          id: string
          month: string
          reference: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_type: string
          file_path?: string | null
          id?: string
          month: string
          reference?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_type?: string
          file_path?: string | null
          id?: string
          month?: string
          reference?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_compliance_docs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_consumption_norms: {
        Row: {
          coach_type_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          item_id: string
          qty_per_coach: number
          service_type_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          item_id: string
          qty_per_coach: number
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          item_id?: string
          qty_per_coach?: number
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_consumption_norms_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_consumption_norms_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_consumption_norms_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "rail_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_contract_items: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          item_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          item_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          item_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_contract_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_contract_sites: {
        Row: {
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          location_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_contract_sites_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_contract_sites_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_contracts: {
        Row: {
          client_location_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_date: string | null
          gem_ref: string | null
          gst_percent: number
          id: string
          loa_number: string
          partial_clean_rule: string
          start_date: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
          value: number | null
        }
        Insert: {
          client_location_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string | null
          gem_ref?: string | null
          gst_percent?: number
          id?: string
          loa_number: string
          partial_clean_rule?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Update: {
          client_location_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_date?: string | null
          gem_ref?: string | null
          gst_percent?: number
          id?: string
          loa_number?: string
          partial_clean_rule?: string
          start_date?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_contracts_client_location_id_fkey"
            columns: ["client_location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_credit_notes: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          reason: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          reason: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          reason?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_credit_notes_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "rail_bills"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_custom_fields: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          entity: string
          field: string
          field_type: string
          id: string
          options: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity: string
          field: string
          field_type?: string
          id?: string
          options?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          entity?: string
          field?: string
          field_type?: string
          id?: string
          options?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_deployment_norms: {
        Row: {
          contract_site_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          min_count: number
          role_key: string
          shift_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_site_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          min_count?: number
          role_key: string
          shift_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_site_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          min_count?: number
          role_key?: string
          shift_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_deployment_norms_contract_site_id_fkey"
            columns: ["contract_site_id"]
            isOneToOne: false
            referencedRelation: "rail_contract_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_deployment_norms_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "rail_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_emission_factors: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          factor: number
          id: string
          resource: string
          source_note: string | null
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          factor: number
          id?: string
          resource: string
          source_note?: string | null
          unit: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          factor?: number
          id?: string
          resource?: string
          source_note?: string | null
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_esg_reports: {
        Row: {
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          file_hash: string | null
          id: string
          month: string
          signed_at: string | null
          signed_by: string | null
          summary: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_hash?: string | null
          id?: string
          month: string
          signed_at?: string | null
          signed_by?: string | null
          summary?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          file_hash?: string | null
          id?: string
          month?: string
          signed_at?: string | null
          signed_by?: string | null
          summary?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_esg_reports_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_event_coaches: {
        Row: {
          ai_score: number | null
          approved_at: string | null
          approved_by: string | null
          coach_id: string | null
          coach_type_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_id: string
          first_pass: boolean | null
          id: string
          location_id: string | null
          position: number
          rate_fraction: number
          removed_reason: string | null
          rework_count: number
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          ai_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          coach_id?: string | null
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_id: string
          first_pass?: boolean | null
          id?: string
          location_id?: string | null
          position: number
          rate_fraction?: number
          removed_reason?: string | null
          rework_count?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          ai_score?: number | null
          approved_at?: string | null
          approved_by?: string | null
          coach_id?: string | null
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_id?: string
          first_pass?: boolean | null
          id?: string
          location_id?: string | null
          position?: number
          rate_fraction?: number
          removed_reason?: string | null
          rework_count?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_event_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "rail_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_event_coaches_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_event_coaches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "rail_events"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_event_tasks: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          ai_score: number | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          completed_offline: boolean
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_coach_id: string
          event_id: string | null
          id: string
          location_id: string | null
          offline_id: string | null
          photo_path: string | null
          standard_minutes: number
          started_at: string | null
          status: string
          task_name: string
          task_template_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          ai_score?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completed_offline?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id: string
          event_id?: string | null
          id?: string
          location_id?: string | null
          offline_id?: string | null
          photo_path?: string | null
          standard_minutes?: number
          started_at?: string | null
          status?: string
          task_name: string
          task_template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          ai_score?: number | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          completed_offline?: boolean
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string
          event_id?: string | null
          id?: string
          location_id?: string | null
          offline_id?: string | null
          photo_path?: string | null
          standard_minutes?: number
          started_at?: string | null
          status?: string
          task_name?: string
          task_template_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_event_tasks_event_coach_id_fkey"
            columns: ["event_coach_id"]
            isOneToOne: false
            referencedRelation: "rail_event_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_event_tasks_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "rail_task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_events: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_date: string
          id: string
          location_id: string
          notes: string | null
          placed_at: string | null
          planned_end: string | null
          planned_start: string | null
          released_at: string | null
          service_type_id: string
          shift_id: string | null
          status: string
          supervisor_id: string | null
          train_id: string
          updated_at: string
          updated_by: string | null
          wash_method: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_date: string
          id?: string
          location_id: string
          notes?: string | null
          placed_at?: string | null
          planned_end?: string | null
          planned_start?: string | null
          released_at?: string | null
          service_type_id: string
          shift_id?: string | null
          status?: string
          supervisor_id?: string | null
          train_id: string
          updated_at?: string
          updated_by?: string | null
          wash_method?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_date?: string
          id?: string
          location_id?: string
          notes?: string | null
          placed_at?: string | null
          planned_end?: string | null
          planned_start?: string | null
          released_at?: string | null
          service_type_id?: string
          shift_id?: string | null
          status?: string
          supervisor_id?: string | null
          train_id?: string
          updated_at?: string
          updated_by?: string | null
          wash_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "rail_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_events_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "rail_service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_events_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "rail_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_events_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "rail_trains"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_feature_flags: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          enabled: boolean
          id: string
          key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_inspections: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_coach_id: string | null
          event_id: string | null
          id: string
          inspector_id: string | null
          inspector_role: string | null
          location_id: string | null
          reason_code: string | null
          remarks: string | null
          result: string
          score: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          inspector_id?: string | null
          inspector_role?: string | null
          location_id?: string | null
          reason_code?: string | null
          remarks?: string | null
          result: string
          score?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          inspector_id?: string | null
          inspector_role?: string | null
          location_id?: string | null
          reason_code?: string | null
          remarks?: string | null
          result?: string
          score?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_inspections_event_coach_id_fkey"
            columns: ["event_coach_id"]
            isOneToOne: false
            referencedRelation: "rail_event_coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_item_batches: {
        Row: {
          batch_no: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          expiry_date: string | null
          id: string
          item_id: string
          location_id: string | null
          qty_on_hand: number
          unit_cost: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          batch_no: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id: string
          location_id?: string | null
          qty_on_hand?: number
          unit_cost?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          batch_no?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string
          location_id?: string | null
          qty_on_hand?: number
          unit_cost?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_item_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_item_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_job_consumption: {
        Row: {
          cleaner_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_coach_id: string
          event_id: string | null
          id: string
          item_id: string
          location_id: string | null
          norm_qty: number
          qty: number
          source: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cleaner_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id: string
          event_id?: string | null
          id?: string
          item_id: string
          location_id?: string | null
          norm_qty?: number
          qty: number
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cleaner_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string
          event_id?: string | null
          id?: string
          item_id?: string
          location_id?: string | null
          norm_qty?: number
          qty?: number
          source?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_job_consumption_event_coach_id_fkey"
            columns: ["event_coach_id"]
            isOneToOne: false
            referencedRelation: "rail_event_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_job_consumption_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_kit_issues: {
        Row: {
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          issue_date: string
          item_id: string
          location_id: string | null
          qty_issued: number
          qty_returned: number
          returned_at: string | null
          shift_id: string | null
          supervisor_person_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issue_date?: string
          item_id: string
          location_id?: string | null
          qty_issued: number
          qty_returned?: number
          returned_at?: string | null
          shift_id?: string | null
          supervisor_person_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issue_date?: string
          item_id?: string
          location_id?: string | null
          qty_issued?: number
          qty_returned?: number
          returned_at?: string | null
          shift_id?: string | null
          supervisor_person_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_kit_issues_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_kit_issues_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_kit_issues_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_kit_issues_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "rail_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_kit_issues_supervisor_person_id_fkey"
            columns: ["supervisor_person_id"]
            isOneToOne: false
            referencedRelation: "rail_people"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_labels: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          key: string
          language: string
          text: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          key: string
          language?: string
          text: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          key?: string
          language?: string
          text?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_locations: {
        Row: {
          area_class: string | null
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          geofence: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          parent_id: string | null
          type: string
          unit_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          area_class?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          geofence?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          parent_id?: string | null
          type: string
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          area_class?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          geofence?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          parent_id?: string | null
          type?: string
          unit_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_meter_readings: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_id: string | null
          id: string
          location_id: string | null
          meter_id: string
          photo_path: string | null
          read_at: string
          reader_id: string | null
          reading: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          meter_id: string
          photo_path?: string | null
          read_at?: string
          reader_id?: string | null
          reading: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          meter_id?: string
          photo_path?: string | null
          read_at?: string
          reader_id?: string | null
          reading?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_meter_readings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "rail_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_meter_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "rail_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_meters: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          location_id: string | null
          name: string
          resource: string
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location_id?: string | null
          name: string
          resource: string
          unit: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          location_id?: string | null
          name?: string
          resource?: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_meters_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_pay_structures: {
        Row: {
          bonus_pct: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          esic_emp_pct: number
          esic_er_pct: number
          esic_gross_limit: number
          hra_pct: number
          id: string
          is_placeholder: boolean
          label: string
          leave_pct: number
          lwf_monthly: number
          pf_emp_pct: number
          pf_er_pct: number
          pf_wage_cap: number
          pt_monthly: number
          role_key: string
          skill: string
          uniform_pct: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          bonus_pct?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          esic_emp_pct?: number
          esic_er_pct?: number
          esic_gross_limit?: number
          hra_pct?: number
          id?: string
          is_placeholder?: boolean
          label: string
          leave_pct?: number
          lwf_monthly?: number
          pf_emp_pct?: number
          pf_er_pct?: number
          pf_wage_cap?: number
          pt_monthly?: number
          role_key: string
          skill?: string
          uniform_pct?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          bonus_pct?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          esic_emp_pct?: number
          esic_er_pct?: number
          esic_gross_limit?: number
          hra_pct?: number
          id?: string
          is_placeholder?: boolean
          label?: string
          leave_pct?: number
          lwf_monthly?: number
          pf_emp_pct?: number
          pf_er_pct?: number
          pf_wage_cap?: number
          pt_monthly?: number
          role_key?: string
          skill?: string
          uniform_pct?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_penalties: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_coach_id: string | null
          event_id: string | null
          id: string
          location_id: string | null
          penalty_date: string
          qty: number
          reason: string | null
          rule_code: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          penalty_date?: string
          qty?: number
          reason?: string | null
          rule_code: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          location_id?: string | null
          penalty_date?: string
          qty?: number
          reason?: string | null
          rule_code?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_penalties_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_penalties_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "rail_events"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_penalty_rules: {
        Row: {
          amount: number
          basis: string
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          basis?: string
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          basis?: string
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_people: {
        Row: {
          candidate_id: string | null
          created_at: string
          created_by: string | null
          daily_wage: number | null
          deleted_at: string | null
          enabled: boolean
          full_name: string
          home_location_id: string | null
          id: string
          language: string
          mobile: string
          role_key: string
          scope_contract_id: string | null
          scope_location_id: string | null
          scope_type: string
          skill: string
          updated_at: string
          updated_by: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          created_by?: string | null
          daily_wage?: number | null
          deleted_at?: string | null
          enabled?: boolean
          full_name: string
          home_location_id?: string | null
          id?: string
          language?: string
          mobile: string
          role_key: string
          scope_contract_id?: string | null
          scope_location_id?: string | null
          scope_type?: string
          skill?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          created_by?: string | null
          daily_wage?: number | null
          deleted_at?: string | null
          enabled?: boolean
          full_name?: string
          home_location_id?: string | null
          id?: string
          language?: string
          mobile?: string
          role_key?: string
          scope_contract_id?: string | null
          scope_location_id?: string | null
          scope_type?: string
          skill?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_people_home_location_id_fkey"
            columns: ["home_location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_people_scope_contract_id_fkey"
            columns: ["scope_contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_people_scope_location_id_fkey"
            columns: ["scope_location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_permissions: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          module_key: string
          role_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          module_key: string
          role_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          module_key?: string
          role_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_ppe_issues: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          issued_on: string
          item_name: string
          location_id: string | null
          next_due: string | null
          person_id: string
          replace_every_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issued_on?: string
          item_name: string
          location_id?: string | null
          next_due?: string | null
          person_id: string
          replace_every_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          issued_on?: string
          item_name?: string
          location_id?: string | null
          next_due?: string | null
          person_id?: string
          replace_every_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_ppe_issues_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "rail_people"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          decision_note: string | null
          deleted_at: string | null
          expected_on: string | null
          grn_at: string | null
          grn_batch: string | null
          grn_expiry: string | null
          grn_qty: number | null
          id: string
          item_id: string
          location_id: string | null
          ordered_at: string | null
          po_number: string | null
          qty: number
          reason: string | null
          requested_by: string | null
          status: string
          unit_price: number | null
          updated_at: string
          updated_by: string | null
          vendor_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          deleted_at?: string | null
          expected_on?: string | null
          grn_at?: string | null
          grn_batch?: string | null
          grn_expiry?: string | null
          grn_qty?: number | null
          id?: string
          item_id: string
          location_id?: string | null
          ordered_at?: string | null
          po_number?: string | null
          qty: number
          reason?: string | null
          requested_by?: string | null
          status?: string
          unit_price?: number | null
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          decision_note?: string | null
          deleted_at?: string | null
          expected_on?: string | null
          grn_at?: string | null
          grn_batch?: string | null
          grn_expiry?: string | null
          grn_qty?: number | null
          id?: string
          item_id?: string
          location_id?: string | null
          ordered_at?: string | null
          po_number?: string | null
          qty?: number
          reason?: string | null
          requested_by?: string | null
          status?: string
          unit_price?: number | null
          updated_at?: string
          updated_by?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_purchase_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_purchase_requests_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_purchase_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "rail_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_rate_lines: {
        Row: {
          billing_unit: string
          category_id: string | null
          coach_type_id: string | null
          contract_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          rate: number
          service_type_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          billing_unit?: string
          category_id?: string | null
          coach_type_id?: string | null
          contract_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          rate: number
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          billing_unit?: string
          category_id?: string | null
          coach_type_id?: string | null
          contract_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          rate?: number
          service_type_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_rate_lines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rail_train_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_rate_lines_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_rate_lines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "rail_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_rate_lines_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "rail_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_reason_codes: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          label: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          applies_to?: string
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          label?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_resource_ledger: {
        Row: {
          co2e_kg: number
          created_at: string
          created_by: string | null
          deleted_at: string | null
          event_coach_id: string | null
          event_id: string | null
          id: string
          ledger_date: string
          location_id: string | null
          metered: boolean
          method: string | null
          qty: number
          resource: string
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          co2e_kg?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          ledger_date?: string
          location_id?: string | null
          metered?: boolean
          method?: string | null
          qty: number
          resource: string
          unit: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          co2e_kg?: number
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          event_coach_id?: string | null
          event_id?: string | null
          id?: string
          ledger_date?: string
          location_id?: string | null
          metered?: boolean
          method?: string | null
          qty?: number
          resource?: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_resource_ledger_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "rail_events"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_resource_norms: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          method: string
          qty_per_coach: number
          resource: string
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          method: string
          qty_per_coach: number
          resource: string
          unit: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          method?: string
          qty_per_coach?: number
          resource?: string
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          hide_costs: boolean
          id: string
          is_external: boolean
          key: string
          name: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          hide_costs?: boolean
          id?: string
          is_external?: boolean
          key: string
          name: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          hide_costs?: boolean
          id?: string
          is_external?: boolean
          key?: string
          name?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_service_types: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          default_window_minutes: number
          deleted_at: string | null
          id: string
          mode: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          default_window_minutes?: number
          deleted_at?: string | null
          id?: string
          mode?: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          default_window_minutes?: number
          deleted_at?: string | null
          id?: string
          mode?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_settings_kv: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          effective_from: string
          effective_to: string | null
          id: string
          key: string
          text_value: string | null
          updated_at: string
          updated_by: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          key: string
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          key?: string
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
          value?: number | null
        }
        Relationships: []
      }
      rail_shifts: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_time: string
          id: string
          name: string
          start_time: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_time: string
          id?: string
          name: string
          start_time: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_time?: string
          id?: string
          name?: string
          start_time?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_standard_compositions: {
        Row: {
          coach_type_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          position: number
          train_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coach_type_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          position: number
          train_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coach_type_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          position?: number
          train_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_standard_compositions_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_standard_compositions_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "rail_trains"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_stock_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dispatched_at: string | null
          from_location_id: string
          id: string
          item_id: string
          note: string | null
          qty: number
          received_at: string | null
          refuse_reason: string | null
          request_id: string | null
          requested_by: string | null
          status: string
          to_location_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dispatched_at?: string | null
          from_location_id: string
          id?: string
          item_id: string
          note?: string | null
          qty: number
          received_at?: string | null
          refuse_reason?: string | null
          request_id?: string | null
          requested_by?: string | null
          status?: string
          to_location_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dispatched_at?: string | null
          from_location_id?: string
          id?: string
          item_id?: string
          note?: string | null
          qty?: number
          received_at?: string | null
          refuse_reason?: string | null
          request_id?: string | null
          requested_by?: string | null
          status?: string
          to_location_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_stock_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_stock_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inv_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_stock_transfers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rail_purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_stock_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_task_templates: {
        Row: {
          coach_type_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          service_type_id: string | null
          skill: string | null
          standard_minutes: number
          task_name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          service_type_id?: string | null
          skill?: string | null
          standard_minutes?: number
          task_name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          coach_type_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          service_type_id?: string | null
          skill?: string | null
          standard_minutes?: number
          task_name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_task_templates_coach_type_id_fkey"
            columns: ["coach_type_id"]
            isOneToOne: false
            referencedRelation: "rail_coach_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_task_templates_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "rail_service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_train_categories: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          name: string
          quality_weight: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name: string
          quality_weight?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          name?: string
          quality_weight?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_train_schedules: {
        Row: {
          arrival: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          departure: string | null
          dwell_minutes: number | null
          id: string
          location_id: string
          service_type_ids: string[]
          train_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          arrival?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          departure?: string | null
          dwell_minutes?: number | null
          id?: string
          location_id: string
          service_type_ids?: string[]
          train_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          arrival?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          departure?: string | null
          dwell_minutes?: number | null
          id?: string
          location_id?: string
          service_type_ids?: string[]
          train_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_train_schedules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_train_schedules_train_id_fkey"
            columns: ["train_id"]
            isOneToOne: false
            referencedRelation: "rail_trains"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_trains: {
        Row: {
          base_depot_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          days_of_run: number[]
          deleted_at: string | null
          id: string
          name: string
          number: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_depot_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          days_of_run?: number[]
          deleted_at?: string | null
          id?: string
          name: string
          number: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_depot_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          days_of_run?: number[]
          deleted_at?: string | null
          id?: string
          name?: string
          number?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rail_trains_base_depot_id_fkey"
            columns: ["base_depot_id"]
            isOneToOne: false
            referencedRelation: "rail_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rail_trains_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rail_train_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      rail_user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          role_key: string
          scope_contract_id: string | null
          scope_location_id: string | null
          scope_type: string
          updated_at: string
          updated_by: string | null
          user_id: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          role_key: string
          scope_contract_id?: string | null
          scope_location_id?: string | null
          scope_type?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          role_key?: string
          scope_contract_id?: string | null
          scope_location_id?: string | null
          scope_type?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      rail_vendors: {
        Row: {
          contact_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          gstin: string | null
          id: string
          lead_days: number
          name: string
          phone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          lead_days?: number
          name: string
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          lead_days?: number
          name?: string
          phone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      rail_wage_rules: {
        Row: {
          area_class: string
          basic_per_day: number
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          effective_from: string
          effective_to: string | null
          id: string
          skill: string
          total_per_day: number | null
          updated_at: string
          updated_by: string | null
          vda_per_day: number
        }
        Insert: {
          area_class: string
          basic_per_day: number
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from: string
          effective_to?: string | null
          id?: string
          skill: string
          total_per_day?: number | null
          updated_at?: string
          updated_by?: string | null
          vda_per_day: number
        }
        Update: {
          area_class?: string
          basic_per_day?: number
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          skill?: string
          total_per_day?: number | null
          updated_at?: string
          updated_by?: string | null
          vda_per_day?: number
        }
        Relationships: []
      }
      rec_candidates: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_ctc: number
          current_location: string
          email: string
          employee_candidate_id: string | null
          expected_ctc: number
          experience_years: number
          full_name: string
          id: string
          lost_reason: string
          mobile: string
          notes: string
          notice_days: number
          offer: Json
          onboarded_at: string | null
          opening_id: string | null
          referred_by: string
          resume_name: string
          resume_path: string
          rounds_cleared: number
          source: string
          stage: string
          stage_changed_at: string
          total_rounds: number
          updated_at: string
        }
        Insert: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_ctc?: number
          current_location?: string
          email?: string
          employee_candidate_id?: string | null
          expected_ctc?: number
          experience_years?: number
          full_name: string
          id?: string
          lost_reason?: string
          mobile?: string
          notes?: string
          notice_days?: number
          offer?: Json
          onboarded_at?: string | null
          opening_id?: string | null
          referred_by?: string
          resume_name?: string
          resume_path?: string
          rounds_cleared?: number
          source?: string
          stage?: string
          stage_changed_at?: string
          total_rounds?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_ctc?: number
          current_location?: string
          email?: string
          employee_candidate_id?: string | null
          expected_ctc?: number
          experience_years?: number
          full_name?: string
          id?: string
          lost_reason?: string
          mobile?: string
          notes?: string
          notice_days?: number
          offer?: Json
          onboarded_at?: string | null
          opening_id?: string | null
          referred_by?: string
          resume_name?: string
          resume_path?: string
          rounds_cleared?: number
          source?: string
          stage?: string
          stage_changed_at?: string
          total_rounds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rec_candidates_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "rec_openings"
            referencedColumns: ["id"]
          },
        ]
      }
      rec_events: {
        Row: {
          actor_id: string | null
          candidate_id: string
          created_at: string
          details: string
          event: string
          id: string
        }
        Insert: {
          actor_id?: string | null
          candidate_id: string
          created_at?: string
          details?: string
          event: string
          id?: string
        }
        Update: {
          actor_id?: string | null
          candidate_id?: string
          created_at?: string
          details?: string
          event?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rec_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "rec_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      rec_interviews: {
        Row: {
          candidate_id: string
          created_at: string
          created_by: string | null
          decided_at: string | null
          feedback: string
          id: string
          interviewer_id: string
          location: string
          mode: string
          rating: number | null
          round_name: string
          round_no: number
          scheduled_at: string
          status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          feedback?: string
          id?: string
          interviewer_id: string
          location?: string
          mode?: string
          rating?: number | null
          round_name?: string
          round_no: number
          scheduled_at: string
          status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          created_by?: string | null
          decided_at?: string | null
          feedback?: string
          id?: string
          interviewer_id?: string
          location?: string
          mode?: string
          rating?: number | null
          round_name?: string
          round_no?: number
          scheduled_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rec_interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "rec_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      rec_onboarding_requests: {
        Row: {
          candidate_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string
          employee_candidate_id: string | null
          id: string
          offer: Json
          requested_by: string | null
          status: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string
          employee_candidate_id?: string | null
          id?: string
          offer?: Json
          requested_by?: string | null
          status?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string
          employee_candidate_id?: string | null
          id?: string
          offer?: Json
          requested_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rec_onboarding_requests_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "rec_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      rec_opening_rounds: {
        Row: {
          default_interviewer_id: string | null
          id: string
          name: string
          opening_id: string
          round_no: number
        }
        Insert: {
          default_interviewer_id?: string | null
          id?: string
          name?: string
          opening_id: string
          round_no: number
        }
        Update: {
          default_interviewer_id?: string | null
          id?: string
          name?: string
          opening_id?: string
          round_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "rec_opening_rounds_opening_id_fkey"
            columns: ["opening_id"]
            isOneToOne: false
            referencedRelation: "rec_openings"
            referencedColumns: ["id"]
          },
        ]
      }
      rec_openings: {
        Row: {
          billing_class: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          department_id: string | null
          description: string
          designation_id: string | null
          id: string
          positions: number
          salary_max: number
          salary_min: number
          status: string
          title: string
          updated_at: string
          workforce_class: string
        }
        Insert: {
          billing_class?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string
          designation_id?: string | null
          id?: string
          positions?: number
          salary_max?: number
          salary_min?: number
          status?: string
          title?: string
          updated_at?: string
          workforce_class?: string
        }
        Update: {
          billing_class?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          department_id?: string | null
          description?: string
          designation_id?: string | null
          id?: string
          positions?: number
          salary_max?: number
          salary_min?: number
          status?: string
          title?: string
          updated_at?: string
          workforce_class?: string
        }
        Relationships: []
      }
      rehire_request_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          actor_role_key: string
          created_at: string
          id: string
          notes: string
          request_id: string
          step_name: string
          step_order: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          actor_role_key?: string
          created_at?: string
          id?: string
          notes?: string
          request_id: string
          step_name?: string
          step_order?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          actor_role_key?: string
          created_at?: string
          id?: string
          notes?: string
          request_id?: string
          step_name?: string
          step_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "rehire_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rehire_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rehire_requests: {
        Row: {
          aadhaar_number: string
          completed_at: string | null
          created_at: string
          current_step_order: number
          designation_id: string | null
          full_name: string
          id: string
          id_card_url: string
          mobile: string
          new_candidate_id: string | null
          new_employee_code: string
          notes: string
          previous_candidate_id: string | null
          rejection_reason: string
          request_number: string | null
          requested_by: string | null
          requested_by_candidate_id: string | null
          resignation_url: string
          role_key: string
          status: string
          unit_id: string | null
          updated_at: string
          workflow_key: string
        }
        Insert: {
          aadhaar_number: string
          completed_at?: string | null
          created_at?: string
          current_step_order?: number
          designation_id?: string | null
          full_name?: string
          id?: string
          id_card_url?: string
          mobile?: string
          new_candidate_id?: string | null
          new_employee_code?: string
          notes?: string
          previous_candidate_id?: string | null
          rejection_reason?: string
          request_number?: string | null
          requested_by?: string | null
          requested_by_candidate_id?: string | null
          resignation_url?: string
          role_key?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          workflow_key?: string
        }
        Update: {
          aadhaar_number?: string
          completed_at?: string | null
          created_at?: string
          current_step_order?: number
          designation_id?: string | null
          full_name?: string
          id?: string
          id_card_url?: string
          mobile?: string
          new_candidate_id?: string | null
          new_employee_code?: string
          notes?: string
          previous_candidate_id?: string | null
          rejection_reason?: string
          request_number?: string | null
          requested_by?: string | null
          requested_by_candidate_id?: string | null
          resignation_url?: string
          role_key?: string
          status?: string
          unit_id?: string | null
          updated_at?: string
          workflow_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "rehire_requests_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehire_requests_new_candidate_id_fkey"
            columns: ["new_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehire_requests_previous_candidate_id_fkey"
            columns: ["previous_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehire_requests_requested_by_candidate_id_fkey"
            columns: ["requested_by_candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rehire_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "rehire_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_approve: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module_key: string
          role_key: string
          sub_module_key: string
          updated_at: string
        }
        Insert: {
          can_approve?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_key: string
          role_key: string
          sub_module_key?: string
          updated_at?: string
        }
        Update: {
          can_approve?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module_key?: string
          role_key?: string
          sub_module_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_key_fkey"
            columns: ["role_key"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["key"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          is_system: boolean
          key: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          is_system?: boolean
          key: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          is_system?: boolean
          key?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      self_attendance_punches: {
        Row: {
          battery_charging: boolean | null
          battery_pct: number | null
          candidate_id: string
          check_in_accuracy: number | null
          check_in_at: string | null
          check_in_face_verified: boolean
          check_in_lat: number | null
          check_in_lng: number | null
          check_in_photo_path: string | null
          check_in_place: string | null
          check_out_accuracy: number | null
          check_out_at: string | null
          check_out_face_verified: boolean
          check_out_lat: number | null
          check_out_lng: number | null
          check_out_photo_path: string | null
          check_out_place: string | null
          created_at: string
          distance_km: number | null
          id: string
          last_accuracy: number | null
          last_lat: number | null
          last_lng: number | null
          last_seen_at: string | null
          network_type: string | null
          notes: string | null
          punch_date: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          battery_charging?: boolean | null
          battery_pct?: number | null
          candidate_id: string
          check_in_accuracy?: number | null
          check_in_at?: string | null
          check_in_face_verified?: boolean
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_path?: string | null
          check_in_place?: string | null
          check_out_accuracy?: number | null
          check_out_at?: string | null
          check_out_face_verified?: boolean
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_photo_path?: string | null
          check_out_place?: string | null
          created_at?: string
          distance_km?: number | null
          id?: string
          last_accuracy?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_seen_at?: string | null
          network_type?: string | null
          notes?: string | null
          punch_date: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          battery_charging?: boolean | null
          battery_pct?: number | null
          candidate_id?: string
          check_in_accuracy?: number | null
          check_in_at?: string | null
          check_in_face_verified?: boolean
          check_in_lat?: number | null
          check_in_lng?: number | null
          check_in_photo_path?: string | null
          check_in_place?: string | null
          check_out_accuracy?: number | null
          check_out_at?: string | null
          check_out_face_verified?: boolean
          check_out_lat?: number | null
          check_out_lng?: number | null
          check_out_photo_path?: string | null
          check_out_place?: string | null
          created_at?: string
          distance_km?: number | null
          id?: string
          last_accuracy?: number | null
          last_lat?: number | null
          last_lng?: number | null
          last_seen_at?: string | null
          network_type?: string | null
          notes?: string | null
          punch_date?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "self_attendance_punches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "self_attendance_punches_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "field_officer_scope"
            referencedColumns: ["unit_id"]
          },
          {
            foreignKeyName: "self_attendance_punches_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      states: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity_id: string
          entity_label: string
          entity_type: string
          error_message: string
          id: string
          ip_address: string
          module: string
          status: string
          user_agent: string
          user_id: string | null
          user_phone: string
          user_role: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_label?: string
          entity_type?: string
          error_message?: string
          id?: string
          ip_address?: string
          module: string
          status?: string
          user_agent?: string
          user_id?: string | null
          user_phone?: string
          user_role?: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity_id?: string
          entity_label?: string
          entity_type?: string
          error_message?: string
          id?: string
          ip_address?: string
          module?: string
          status?: string
          user_agent?: string
          user_id?: string | null
          user_phone?: string
          user_role?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          file_name: string
          file_path: string
          id: string
          is_active: boolean
          mime_type: string | null
          role_key: string
          size_bytes: number | null
          sort_order: number
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name: string
          file_path: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          role_key: string
          size_bytes?: number | null
          sort_order?: number
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          role_key?: string
          size_bytes?: number | null
          sort_order?: number
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      units: {
        Row: {
          account_manager_id: string | null
          ambulance_mobile: string
          ambulance_name: string
          billing_address1: string
          billing_address2: string
          billing_city: string
          billing_country: string
          billing_district: string
          billing_name: string
          billing_pincode: string
          billing_salutation: string
          billing_state: string
          bonus_enabled: boolean
          bonus_frequency: string | null
          branch_id: string | null
          branch_sap_code: string | null
          client_address: string | null
          client_city: string | null
          client_district: string | null
          client_pincode: string | null
          client_state: string | null
          client_type: string | null
          closing_date: string | null
          code: string
          compliance_frequency: string | null
          compliance_manager_id: string | null
          compliance_report_format: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          coordinates_accuracy_m: number | null
          coordinates_captured_at: string | null
          coordinates_captured_by: string | null
          coordinates_source: string | null
          created_at: string
          customer_id: string | null
          description: string
          dividing_factor: number | null
          emergency_contact_mobile: string
          emergency_contact_name: string
          enable_lwf: boolean
          enable_pt: boolean
          epf_cap_enabled: boolean
          esic_branch_id: string | null
          gpaip_amount: number
          gpaip_enabled: boolean
          gst_number: string
          gst_payable: boolean
          gst_type: string | null
          hr_executive_id: string | null
          id: string
          is_billable: boolean
          latitude: number | null
          location: string
          longitude: number | null
          mapping_pay_day: number | null
          mapping_payroll_window_id: string | null
          name: string
          nearby_hospital_mobile: string
          nearby_hospital_name: string
          onboarding_date: string | null
          operations_manager_id: string | null
          pan_number: string
          payroll_manager_id: string | null
          recruitment_fee_amount: number
          recruitment_fee_enabled: boolean
          reporting_officers: Json
          salary_slip_required: boolean | null
          security_service_mobile: string
          security_service_name: string
          separate_mis: boolean
          shipping_address1: string
          shipping_address2: string
          shipping_city: string
          shipping_country: string
          shipping_district: string
          shipping_name: string
          shipping_pincode: string
          shipping_salutation: string
          shipping_same_as_billing: boolean
          shipping_same_as_org: boolean
          shipping_state: string
          status: Database["public"]["Enums"]["customer_status"]
          uniform_fee_amount: number
          uniform_included: boolean
          updated_at: string
          zone: string | null
        }
        Insert: {
          account_manager_id?: string | null
          ambulance_mobile?: string
          ambulance_name?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_country?: string
          billing_district?: string
          billing_name?: string
          billing_pincode?: string
          billing_salutation?: string
          billing_state?: string
          bonus_enabled?: boolean
          bonus_frequency?: string | null
          branch_id?: string | null
          branch_sap_code?: string | null
          client_address?: string | null
          client_city?: string | null
          client_district?: string | null
          client_pincode?: string | null
          client_state?: string | null
          client_type?: string | null
          closing_date?: string | null
          code: string
          compliance_frequency?: string | null
          compliance_manager_id?: string | null
          compliance_report_format?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          coordinates_accuracy_m?: number | null
          coordinates_captured_at?: string | null
          coordinates_captured_by?: string | null
          coordinates_source?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string
          dividing_factor?: number | null
          emergency_contact_mobile?: string
          emergency_contact_name?: string
          enable_lwf?: boolean
          enable_pt?: boolean
          epf_cap_enabled?: boolean
          esic_branch_id?: string | null
          gpaip_amount?: number
          gpaip_enabled?: boolean
          gst_number?: string
          gst_payable?: boolean
          gst_type?: string | null
          hr_executive_id?: string | null
          id?: string
          is_billable?: boolean
          latitude?: number | null
          location?: string
          longitude?: number | null
          mapping_pay_day?: number | null
          mapping_payroll_window_id?: string | null
          name?: string
          nearby_hospital_mobile?: string
          nearby_hospital_name?: string
          onboarding_date?: string | null
          operations_manager_id?: string | null
          pan_number?: string
          payroll_manager_id?: string | null
          recruitment_fee_amount?: number
          recruitment_fee_enabled?: boolean
          reporting_officers?: Json
          salary_slip_required?: boolean | null
          security_service_mobile?: string
          security_service_name?: string
          separate_mis?: boolean
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_country?: string
          shipping_district?: string
          shipping_name?: string
          shipping_pincode?: string
          shipping_salutation?: string
          shipping_same_as_billing?: boolean
          shipping_same_as_org?: boolean
          shipping_state?: string
          status?: Database["public"]["Enums"]["customer_status"]
          uniform_fee_amount?: number
          uniform_included?: boolean
          updated_at?: string
          zone?: string | null
        }
        Update: {
          account_manager_id?: string | null
          ambulance_mobile?: string
          ambulance_name?: string
          billing_address1?: string
          billing_address2?: string
          billing_city?: string
          billing_country?: string
          billing_district?: string
          billing_name?: string
          billing_pincode?: string
          billing_salutation?: string
          billing_state?: string
          bonus_enabled?: boolean
          bonus_frequency?: string | null
          branch_id?: string | null
          branch_sap_code?: string | null
          client_address?: string | null
          client_city?: string | null
          client_district?: string | null
          client_pincode?: string | null
          client_state?: string | null
          client_type?: string | null
          closing_date?: string | null
          code?: string
          compliance_frequency?: string | null
          compliance_manager_id?: string | null
          compliance_report_format?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          coordinates_accuracy_m?: number | null
          coordinates_captured_at?: string | null
          coordinates_captured_by?: string | null
          coordinates_source?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string
          dividing_factor?: number | null
          emergency_contact_mobile?: string
          emergency_contact_name?: string
          enable_lwf?: boolean
          enable_pt?: boolean
          epf_cap_enabled?: boolean
          esic_branch_id?: string | null
          gpaip_amount?: number
          gpaip_enabled?: boolean
          gst_number?: string
          gst_payable?: boolean
          gst_type?: string | null
          hr_executive_id?: string | null
          id?: string
          is_billable?: boolean
          latitude?: number | null
          location?: string
          longitude?: number | null
          mapping_pay_day?: number | null
          mapping_payroll_window_id?: string | null
          name?: string
          nearby_hospital_mobile?: string
          nearby_hospital_name?: string
          onboarding_date?: string | null
          operations_manager_id?: string | null
          pan_number?: string
          payroll_manager_id?: string | null
          recruitment_fee_amount?: number
          recruitment_fee_enabled?: boolean
          reporting_officers?: Json
          salary_slip_required?: boolean | null
          security_service_mobile?: string
          security_service_name?: string
          separate_mis?: boolean
          shipping_address1?: string
          shipping_address2?: string
          shipping_city?: string
          shipping_country?: string
          shipping_district?: string
          shipping_name?: string
          shipping_pincode?: string
          shipping_salutation?: string
          shipping_same_as_billing?: boolean
          shipping_same_as_org?: boolean
          shipping_state?: string
          status?: Database["public"]["Enums"]["customer_status"]
          uniform_fee_amount?: number
          uniform_included?: boolean
          updated_at?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_account_manager_id_fkey"
            columns: ["account_manager_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_compliance_manager_id_fkey"
            columns: ["compliance_manager_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_esic_branch_id_fkey"
            columns: ["esic_branch_id"]
            isOneToOne: false
            referencedRelation: "esic_branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_hr_executive_id_fkey"
            columns: ["hr_executive_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_mapping_payroll_window_id_fkey"
            columns: ["mapping_payroll_window_id"]
            isOneToOne: false
            referencedRelation: "payroll_windows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_operations_manager_id_fkey"
            columns: ["operations_manager_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_payroll_manager_id_fkey"
            columns: ["payroll_manager_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_fastags: {
        Row: {
          account_number: string
          balance: number
          bank_name: string
          created_at: string
          enabled: boolean
          expiry_date: string | null
          fastag_number: string
          id: string
          issued_date: string | null
          login_id: string
          login_password: string
          login_type: string
          notes: string
          registered_email: string
          status: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          account_number?: string
          balance?: number
          bank_name?: string
          created_at?: string
          enabled?: boolean
          expiry_date?: string | null
          fastag_number?: string
          id?: string
          issued_date?: string | null
          login_id?: string
          login_password?: string
          login_type?: string
          notes?: string
          registered_email?: string
          status?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          bank_name?: string
          created_at?: string
          enabled?: boolean
          expiry_date?: string | null
          fastag_number?: string
          id?: string
          issued_date?: string | null
          login_id?: string
          login_password?: string
          login_type?: string
          notes?: string
          registered_email?: string
          status?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_fastags_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_fuel_entries: {
        Row: {
          amount: number
          created_at: string
          description: string
          entry_date: string
          entry_time: string | null
          expense_type: string
          filling_photo_url: string
          fuel_type: string
          geo_lat: number | null
          geo_lng: number | null
          id: string
          location_text: string
          notes: string
          odometer_km: number
          odometer_photo_url: string
          payment_mode: string
          pump_photo_url: string
          quantity: number
          rate: number
          receipt_photo_url: string
          tags: string[]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string
          entry_date?: string
          entry_time?: string | null
          expense_type?: string
          filling_photo_url?: string
          fuel_type?: string
          geo_lat?: number | null
          geo_lng?: number | null
          id?: string
          location_text?: string
          notes?: string
          odometer_km?: number
          odometer_photo_url?: string
          payment_mode?: string
          pump_photo_url?: string
          quantity?: number
          rate?: number
          receipt_photo_url?: string
          tags?: string[]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          entry_date?: string
          entry_time?: string | null
          expense_type?: string
          filling_photo_url?: string
          fuel_type?: string
          geo_lat?: number | null
          geo_lng?: number | null
          id?: string
          location_text?: string
          notes?: string
          odometer_km?: number
          odometer_photo_url?: string
          payment_mode?: string
          pump_photo_url?: string
          quantity?: number
          rate?: number
          receipt_photo_url?: string
          tags?: string[]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: []
      }
      vehicle_insurances: {
        Row: {
          chassis_number: string
          created_at: string
          enabled: boolean
          end_date: string | null
          engine_number: string
          id: string
          insurance_company: string
          notes: string
          policy_number: string
          premium_amount: number
          start_date: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          chassis_number?: string
          created_at?: string
          enabled?: boolean
          end_date?: string | null
          engine_number?: string
          id?: string
          insurance_company?: string
          notes?: string
          policy_number?: string
          premium_amount?: number
          start_date?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          chassis_number?: string
          created_at?: string
          enabled?: boolean
          end_date?: string | null
          engine_number?: string
          id?: string
          insurance_company?: string
          notes?: string
          policy_number?: string
          premium_amount?: number
          start_date?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_insurances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_pucs: {
        Row: {
          created_at: string
          enabled: boolean
          expiry_date: string | null
          id: string
          issued_date: string | null
          issuing_authority: string
          notes: string
          puc_number: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string
          notes?: string
          puc_number?: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          expiry_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_authority?: string
          notes?: string
          puc_number?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_pucs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          chassis_number: string
          color: string
          created_at: string
          enabled: boolean
          engine_number: string
          fuel_type: string
          id: string
          make: string
          name: string
          notes: string
          owner: string
          registration_date: string | null
          service_interval_km: number
          type: string
          updated_at: string
          vehicle_id: string
          vehicle_number: string
          year: number | null
        }
        Insert: {
          brand?: string
          chassis_number?: string
          color?: string
          created_at?: string
          enabled?: boolean
          engine_number?: string
          fuel_type?: string
          id?: string
          make?: string
          name?: string
          notes?: string
          owner?: string
          registration_date?: string | null
          service_interval_km?: number
          type?: string
          updated_at?: string
          vehicle_id?: string
          vehicle_number: string
          year?: number | null
        }
        Update: {
          brand?: string
          chassis_number?: string
          color?: string
          created_at?: string
          enabled?: boolean
          engine_number?: string
          fuel_type?: string
          id?: string
          make?: string
          name?: string
          notes?: string
          owner?: string
          registration_date?: string | null
          service_interval_km?: number
          type?: string
          updated_at?: string
          vehicle_id?: string
          vehicle_number?: string
          year?: number | null
        }
        Relationships: []
      }
      workflow_definitions: {
        Row: {
          created_at: string
          description: string
          entity_type: string
          id: string
          is_active: boolean
          key: string
          name: string
          route_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          route_path?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          route_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          action_label: string
          approver_candidate_id: string | null
          approver_role_key: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          key: string
          name: string
          step_order: number
          updated_at: string
          workflow_id: string
        }
        Insert: {
          action_label?: string
          approver_candidate_id?: string | null
          approver_role_key: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          key: string
          name: string
          step_order: number
          updated_at?: string
          workflow_id: string
        }
        Update: {
          action_label?: string
          approver_candidate_id?: string | null
          approver_role_key?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          key?: string
          name?: string
          step_order?: number
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflow_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      field_officer_scope: {
        Row: {
          address: string | null
          branch_id: string | null
          branch_name: string | null
          candidate_id: string | null
          customer_id: string | null
          customer_name: string | null
          guard_count: number | null
          is_primary: boolean | null
          latitude: number | null
          longitude: number | null
          unit_code: string | null
          unit_id: string | null
          unit_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "units_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_month_counts: {
        Row: {
          first_sequence: number | null
          fiscal_year: string | null
          invoice_count: number | null
          last_sequence: number | null
          month_code: string | null
          month_order: number | null
          state_code: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      allocate_invoice_number: {
        Args: {
          _client_token?: string
          _invoice_date?: string
          _party_name?: string
          _state_code: string
          _unit_id?: string
        }
        Returns: {
          fiscal_year: string
          invoice_no: string
          month_code: string
          sequence: number
        }[]
      }
      apply_fpl_master_fill: {
        Args: { _id: string; p: Json }
        Returns: undefined
      }
      attendance_location_rule_for: {
        Args: { _candidate_id: string }
        Returns: {
          capture_missing_coords: boolean
          mode: string
          radius_m: number
          require_selfie: boolean
          source: string
        }[]
      }
      attendance_location_units_for: {
        Args: { _candidate_id: string; _mode: string }
        Returns: {
          id: string
          is_primary: boolean
          latitude: number
          longitude: number
          name: string
        }[]
      }
      autofill_daily_attendance: { Args: never; Returns: undefined }
      batch_period_statuses: {
        Args: { p_periods: Json }
        Returns: {
          attendance_status: string
          finalised: boolean
          invoice_status: string
          payroll_status: string
          run_id: string
          run_status: string
          tally_invoice_path: string
          unit_id: string
        }[]
      }
      build_invoice_number: {
        Args: {
          _fiscal_year: string
          _month_code: string
          _padding: number
          _prefix: string
          _sequence: number
          _token: string
        }
        Returns: string
      }
      can_phone_login: { Args: { _mobile: string }; Returns: boolean }
      candidate_branch_ids: {
        Args: { _candidate_id: string }
        Returns: string[]
      }
      capture_unit_coordinates:
        | {
            Args: {
              _by: string
              _lat: number
              _lng: number
              _source: string
              _unit_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              _accuracy?: number
              _lat: number
              _lng: number
              _unit_id: string
            }
            Returns: boolean
          }
      contract_register_directory: { Args: never; Returns: Json }
      current_user_assigned_guard_ids: { Args: never; Returns: string[] }
      current_user_branch_id: { Args: never; Returns: string }
      current_user_branch_scope_ids: { Args: never; Returns: string[] }
      current_user_can_action_rehire: {
        Args: { _request_id: string }
        Returns: boolean
      }
      current_user_can_approve_onboarding: { Args: never; Returns: boolean }
      current_user_can_approve_payroll: { Args: never; Returns: boolean }
      current_user_can_crm: { Args: never; Returns: boolean }
      current_user_can_edit_organizations: { Args: never; Returns: boolean }
      current_user_can_manage_attendance_location_rules: {
        Args: never
        Returns: boolean
      }
      current_user_can_manage_attendance_unit: {
        Args: { _unit_id: string }
        Returns: boolean
      }
      current_user_can_manage_guard_unit_mapping: {
        Args: { _candidate_id: string; _unit_id: string }
        Returns: boolean
      }
      current_user_can_manage_unit_scope_assignment: {
        Args: { _unit_id: string }
        Returns: boolean
      }
      current_user_can_manage_unit_scope_assignments: {
        Args: never
        Returns: boolean
      }
      current_user_can_onboard_recruit: { Args: never; Returns: boolean }
      current_user_can_onboard_unit: {
        Args: { _unit_id: string }
        Returns: boolean
      }
      current_user_can_process_payroll: { Args: never; Returns: boolean }
      current_user_can_recruit: { Args: never; Returns: boolean }
      current_user_can_submit_onboarding: { Args: never; Returns: boolean }
      current_user_can_view_radar: { Args: never; Returns: boolean }
      current_user_can_view_self_attendance: {
        Args: { _candidate_id: string; _unit_id?: string }
        Returns: boolean
      }
      current_user_candidate_id: { Args: never; Returns: string }
      current_user_created_recruitment_candidate: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      current_user_department_id: { Args: never; Returns: string }
      current_user_has_branch_scope: { Args: never; Returns: boolean }
      current_user_has_permission: {
        Args: {
          _action?: string
          _module_key: string
          _sub_module_key?: string
        }
        Returns: boolean
      }
      current_user_is_inventory_manager: { Args: never; Returns: boolean }
      current_user_is_people_ops: { Args: never; Returns: boolean }
      current_user_is_rehire_participant: { Args: never; Returns: boolean }
      current_user_is_super_admin: { Args: never; Returns: boolean }
      current_user_mobile: { Args: never; Returns: string }
      current_user_owns_onboarding_candidate: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      current_user_role_key: { Args: never; Returns: string }
      current_user_unit_ids: { Args: never; Returns: string[] }
      dashboard_counts: {
        Args: {
          p_end: string
          p_horizon: string
          p_start: string
          p_today: string
        }
        Returns: Json
      }
      dashboard_lifecycle_counts: {
        Args: {
          p_month: number
          p_window_end: number
          p_window_start: number
          p_year: number
        }
        Returns: Json
      }
      dashboard_pnl_inputs: {
        Args: { p_att_end: string; p_end: string; p_start: string }
        Returns: Json
      }
      ensure_annual_gpaip_deductions: { Args: never; Returns: number }
      finance_charter_entry_totals: {
        Args: { _end: string; _start: string; _unit_ids: string[] }
        Returns: {
          candidate_id: string
          code: string
          days: number
          designation_id: string
          ot_hours: number
          shift_hours: number
          unit_id: string
        }[]
      }
      find_rehire_candidate_by_aadhaar: {
        Args: { _aadhaar: string }
        Returns: {
          aadhaar_number: string
          candidate_code: string
          employee_code: string
          full_name: string
          id: string
          id_card_url: string
          mobile: string
          resignation_url: string
          status: string
          unit_id: string
        }[]
      }
      fo_org_chart: {
        Args: { _unit_ids: string[] }
        Returns: {
          candidate_id: string
          employee_code: string
          full_name: string
          guards: number
          kind: string
          status: string
          unit_id: string
        }[]
      }
      generate_final_invoice: {
        Args: {
          _billing_state?: string
          _client_token?: string
          _customer_id?: string
          _invoice_date?: string
          _party_name?: string
          _period_end: string
          _period_start: string
          _tax_total?: number
          _taxable_value?: number
          _total_value?: number
          _unit_ids: string[]
        }
        Returns: {
          final_invoice_id: string
          fiscal_year: string
          invoice_no: string
          month_code: string
          sequence: number
          state_code: string
        }[]
      }
      geo_distance_m: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      get_admin_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      get_attendance_charter_units: { Args: never; Returns: Json }
      get_candidate_id_by_user_id: {
        Args: { _user_id: string }
        Returns: string
      }
      get_field_scope_for: {
        Args: { _candidate_id: string }
        Returns: {
          address: string
          branch_id: string
          branch_name: string
          customer_id: string
          customer_name: string
          guard_count: number
          is_primary: boolean
          latitude: number
          longitude: number
          unit_code: string
          unit_id: string
          unit_name: string
        }[]
      }
      get_inventory_admin_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      get_missing_contract_designations: {
        Args: never
        Returns: {
          candidate_code: string
          candidate_id: string
          contract_id: string
          customer_name: string
          designation_id: string
          designation_name: string
          employee_code: string
          full_name: string
          missing_since: string
          unit_code: string
          unit_id: string
          unit_name: string
        }[]
      }
      get_my_assigned_units: {
        Args: never
        Returns: {
          code: string
          designation_id: string
          id: string
          is_primary: boolean
          latitude: number
          longitude: number
          name: string
          shift_end_time: string
          shift_start_time: string
          site_address: string
        }[]
      }
      get_my_field_scope: {
        Args: never
        Returns: {
          branch_id: string
          is_primary: boolean
          unit_code: string
          unit_id: string
          unit_name: string
        }[]
      }
      get_my_field_scope_fresh: {
        Args: never
        Returns: {
          address: string
          branch_name: string
          customer_name: string
          latitude: number
          longitude: number
          unit_code: string
          unit_id: string
          unit_name: string
        }[]
      }
      get_onboarding_approver_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      get_recent_notification_push_tokens: {
        Args: { _user_ids: string[] }
        Returns: {
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }[]
      }
      get_recruitment_onboarder_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      get_user_display_name: {
        Args: { _user_id: string }
        Returns: {
          full_name: string
          mobile: string
          role_key: string
        }[]
      }
      get_user_id_by_candidate: {
        Args: { _candidate_id: string }
        Returns: string
      }
      get_user_id_by_candidate_id: {
        Args: { _candidate_id: string }
        Returns: string
      }
      get_user_ids_by_branch: {
        Args: { _branch_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_user_ids_by_role: {
        Args: { _role_key: string }
        Returns: {
          user_id: string
        }[]
      }
      get_user_ids_by_unit: {
        Args: { _unit_id: string }
        Returns: {
          user_id: string
        }[]
      }
      get_user_ids_with_approve: {
        Args: { _module: string }
        Returns: {
          user_id: string
        }[]
      }
      invoice_fiscal_year: { Args: { _on: string }; Returns: string }
      invoice_month_code: { Args: { _on: string }; Returns: string }
      is_active_field_officer: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_candidate_in_current_user_branch: {
        Args: { _candidate_id: string }
        Returns: boolean
      }
      is_current_employee_active: { Args: never; Returns: boolean }
      is_inv_location_in_current_user_scope: {
        Args: { _id: string; _type: string }
        Returns: boolean
      }
      is_unit_in_current_user_branch: {
        Args: { _unit_id: string }
        Returns: boolean
      }
      list_active_field_officers: {
        Args: never
        Returns: {
          employee_code: string
          full_name: string
          id: string
          mobile: string
          status: string
        }[]
      }
      my_attendance_location_rule: { Args: never; Returns: Json }
      nextval: { Args: { sequence_name: string }; Returns: number }
      peek_invoice_number: {
        Args: {
          _client_token?: string
          _invoice_date?: string
          _state_code: string
        }
        Returns: {
          fiscal_year: string
          invoice_no: string
          month_code: string
          next_sequence: number
        }[]
      }
      people_insights: {
        Args: {
          p_days?: number
          p_limit?: number
          p_role_keys?: string[]
          p_sixty?: boolean
          p_unit_ids?: string[]
        }
        Returns: Json
      }
      rail_accept_task: { Args: { _task: string }; Returns: undefined }
      rail_assign_task: {
        Args: { _assignee: string; _task: string }
        Returns: undefined
      }
      rail_bill_advance: {
        Args: {
          _bill: string
          _otp?: string
          _ref?: string
          _sha256?: string
          _to: string
        }
        Returns: undefined
      }
      rail_briefing: { Args: { _date?: string }; Returns: Json }
      rail_can: {
        Args: { _action: string; _location?: string; _module: string }
        Returns: boolean
      }
      rail_check_shortfall: { Args: { _date: string }; Returns: number }
      rail_complete_task: {
        Args: {
          _ai_score?: number
          _completed_at?: string
          _offline_id?: string
          _photo?: string
          _task: string
        }
        Returns: string
      }
      rail_finance_summary: {
        Args: { _month: string }
        Returns: {
          location_id: string
          location_name: string
          man_days: number
          penalties: number
          staff: number
          wage_cost: number
        }[]
      }
      rail_generate_bill: {
        Args: { _contract: string; _month: string }
        Returns: string
      }
      rail_is_hq: { Args: never; Returns: boolean }
      rail_kpis: { Args: { _date?: string }; Returns: Json }
      rail_location_ancestors: { Args: { _loc: string }; Returns: string[] }
      rail_main_store_id: { Args: never; Returns: string }
      rail_min_wage: {
        Args: { _location: string; _on?: string; _skill: string }
        Returns: number
      }
      rail_my_mobile: { Args: never; Returns: string }
      rail_my_pay: {
        Args: { _month: string }
        Returns: {
          daily_wage: number
          days: number
          full_name: string
          gross: number
          hours: number
          mobile: string
          role_key: string
          skill: string
        }[]
      }
      rail_my_roles: {
        Args: never
        Returns: {
          role_key: string
          scope_location_id: string
          scope_type: string
        }[]
      }
      rail_payslip_preview: {
        Args: { _month?: string; _person: string }
        Returns: Json
      }
      rail_people_users: {
        Args: never
        Returns: {
          mobile: string
          user_id: string
        }[]
      }
      rail_place_rake: {
        Args: { _event: string; _reason?: string; _removed?: string[] }
        Returns: undefined
      }
      rail_plan_day: {
        Args: { _date: string; _location?: string }
        Returns: number
      }
      rail_post_event_resources: {
        Args: { _event: string }
        Returns: undefined
      }
      rail_presence: {
        Args: { _location?: string }
        Returns: {
          check_in: string
          check_out: string
          full_name: string
          location_name: string
          person_id: string
          role_key: string
        }[]
      }
      rail_release_event: { Args: { _event: string }; Returns: undefined }
      rail_required_staff: { Args: { _location?: string }; Returns: number }
      rail_review_coach: {
        Args: {
          _coach: string
          _pass: boolean
          _reason?: string
          _remarks?: string
          _score?: number
        }
        Returns: undefined
      }
      rail_roll_up: { Args: { _coach: string }; Returns: undefined }
      rail_save_person: {
        Args: {
          _home?: string
          _mobile: string
          _name: string
          _role: string
          _scope?: string
          _scope_contract?: string
          _scope_location?: string
          _skill?: string
          _wage?: number
        }
        Returns: string
      }
      rail_send_stock: {
        Args: {
          _from: string
          _item: string
          _note?: string
          _qty: number
          _request?: string
          _to: string
        }
        Returns: string
      }
      rail_setting: { Args: { _key: string; _on?: string }; Returns: number }
      rail_suggest_cleaners: {
        Args: { _task: string }
        Returns: {
          full_name: string
          open_tasks: number
          present: boolean
          user_id: string
        }[]
      }
      rail_transfer_step: {
        Args: { _action: string; _id: string; _reason?: string }
        Returns: string
      }
      rec_onboard_candidate: { Args: { _request_id: string }; Returns: string }
      rec_reschedule_interview: {
        Args: {
          _availability: string
          _interview_id: string
          _new_at: string
          _reason: string
        }
        Returns: {
          candidate_id: string
          creator_user_id: string
          interviewer_user_id: string
        }[]
      }
      rec_send_back: {
        Args: { _note: string; _request_id: string }
        Returns: undefined
      }
      rec_submit_interview_result: {
        Args: {
          _decision: string
          _feedback: string
          _interview_id: string
          _rating: number
        }
        Returns: string
      }
      recruitment_leadership_summary: { Args: never; Returns: Json }
      register_device_push_token: {
        Args: { _platform?: string; _token: string }
        Returns: {
          saved: boolean
          token_count: number
          token_suffix: string
        }[]
      }
      rehire_current_step_role: {
        Args: { _request_id: string }
        Returns: string
      }
      resolve_candidate_issuance_field_officer: {
        Args: { _candidate_id: string; _reports_to: string; _unit_id: string }
        Returns: {
          fo_candidate_id: string
          fo_name: string
          fo_user_id: string
        }[]
      }
      resolve_invoice_series_state: {
        Args: { _fiscal_year: string; _state_name: string }
        Returns: string
      }
      unit_attendance_coverage: {
        Args: { _from: string; _to: string }
        Returns: {
          days_marked: number
          staff_marked: number
          unit_code: string
          unit_id: string
          unit_name: string
        }[]
      }
    }
    Enums: {
      customer_status: "active" | "inactive"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_status: ["active", "inactive"],
    },
  },
} as const
