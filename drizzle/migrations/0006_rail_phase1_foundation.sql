
-- ===== Audit trail (append-only) =====
CREATE TABLE public.rail_audit_trail (
  id bigserial PRIMARY KEY,
  table_name text NOT NULL,
  record_id text,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  actor uuid DEFAULT auth.uid(),
  at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.rail_audit_trail TO authenticated;
GRANT ALL ON public.rail_audit_trail TO service_role;
GRANT USAGE ON SEQUENCE public.rail_audit_trail_id_seq TO authenticated;
ALTER TABLE public.rail_audit_trail ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rail_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by := auth.uid();
    INSERT INTO rail_audit_trail(table_name, record_id, action, new_data) VALUES (TG_TABLE_NAME, NEW.id::text, 'insert', to_jsonb(NEW));
  ELSE
    NEW.updated_by := auth.uid();
    NEW.updated_at := now();
    INSERT INTO rail_audit_trail(table_name, record_id, action, old_data, new_data)
      VALUES (TG_TABLE_NAME, NEW.id::text, CASE WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN 'delete' ELSE 'update' END, to_jsonb(OLD), to_jsonb(NEW));
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.rail_audit_no_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Audit trail is append-only'; END $$;
CREATE TRIGGER rail_audit_trail_immutable BEFORE UPDATE OR DELETE ON public.rail_audit_trail
  FOR EACH ROW EXECUTE FUNCTION public.rail_audit_no_change();

-- ===== Roles, permissions, scopes =====
CREATE TABLE public.rail_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_external boolean NOT NULL DEFAULT false,
  hide_costs boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE TABLE public.rail_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  module_key text NOT NULL,
  action text NOT NULL CHECK (action IN ('view','create','edit','delete','approve','export','configure','inspect','sign')),
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE (role_key, module_key, action)
);
CREATE TABLE public.rail_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_key text NOT NULL,
  scope_type text NOT NULL DEFAULT 'all' CHECK (scope_type IN ('all','zone','division','contract','depot','line','own')),
  scope_location_id uuid,
  scope_contract_id uuid,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);

-- ===== Locations tree =====
CREATE TABLE public.rail_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.rail_locations(id),
  type text NOT NULL CHECK (type IN ('zone','division','depot','station','pit_line','platform','bay','store')),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  area_class text CHECK (area_class IN ('A','B','C')),
  latitude double precision, longitude double precision,
  geofence jsonb,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX rail_locations_parent_idx ON public.rail_locations(parent_id);

-- ===== Access helpers =====
CREATE OR REPLACE FUNCTION public.rail_location_ancestors(_loc uuid) RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH RECURSIVE a AS (
    SELECT id, parent_id FROM rail_locations WHERE id = _loc
    UNION ALL SELECT l.id, l.parent_id FROM rail_locations l JOIN a ON l.id = a.parent_id
  ) SELECT id FROM a
$$;

CREATE OR REPLACE FUNCTION public.rail_can(_module text, _action text, _location uuid DEFAULT NULL) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user() OR EXISTS (
    SELECT 1 FROM rail_user_roles ur
    JOIN rail_permissions p ON p.role_key = ur.role_key AND p.deleted_at IS NULL
    WHERE ur.user_id = auth.uid() AND ur.deleted_at IS NULL
      AND ur.valid_from <= now() AND (ur.valid_to IS NULL OR ur.valid_to > now())
      AND p.module_key = _module AND p.action = _action
      AND (ur.scope_type IN ('all','own','contract') OR _location IS NULL
           OR ur.scope_location_id IN (SELECT public.rail_location_ancestors(_location)))
  )
$$;
GRANT EXECUTE ON FUNCTION public.rail_can(text,text,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rail_location_ancestors(uuid) TO authenticated;

-- ===== Coach and train masters =====
CREATE TABLE public.rail_coach_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, sort_order int NOT NULL DEFAULT 0,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_coach_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL, name text NOT NULL,
  family_id uuid REFERENCES public.rail_coach_families(id), berths int, seats int, toilet_count int NOT NULL DEFAULT 0,
  toilet_type text CHECK (toilet_type IN ('bio','vacuum','conventional','none')), area_m2 numeric, billable boolean NOT NULL DEFAULT true, icon text,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_train_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL, name text NOT NULL, quality_weight numeric NOT NULL DEFAULT 1,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, default_window_minutes int NOT NULL DEFAULT 240,
  mode text NOT NULL DEFAULT 'full' CHECK (mode IN ('full','cts_quick','obhs_trip','premises','water','custom')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_trains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), number text NOT NULL UNIQUE, name text NOT NULL,
  category_id uuid REFERENCES public.rail_train_categories(id), base_depot_id uuid REFERENCES public.rail_locations(id),
  days_of_run int[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_train_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), train_id uuid NOT NULL REFERENCES public.rail_trains(id), location_id uuid NOT NULL REFERENCES public.rail_locations(id),
  arrival time, departure time, dwell_minutes int, service_type_ids uuid[] NOT NULL DEFAULT '{}',
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_standard_compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), train_id uuid NOT NULL REFERENCES public.rail_trains(id), position int NOT NULL,
  coach_type_id uuid NOT NULL REFERENCES public.rail_coach_types(id),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), coach_number text NOT NULL UNIQUE, coach_type_id uuid REFERENCES public.rail_coach_types(id),
  owning_depot_id uuid REFERENCES public.rail_locations(id), qr_code text, last_intensive_on date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sick','condemned')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

-- ===== Checklists and tasks =====
CREATE TABLE public.rail_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, service_type_id uuid REFERENCES public.rail_service_types(id),
  coach_type_id uuid REFERENCES public.rail_coach_types(id), effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), template_id uuid NOT NULL REFERENCES public.rail_checklist_templates(id), area text NOT NULL,
  label_en text NOT NULL, label_hi text, label_mr text, photo_required boolean NOT NULL DEFAULT false, weight numeric NOT NULL DEFAULT 1,
  ai_check boolean NOT NULL DEFAULT false, sort_order int NOT NULL DEFAULT 0,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), service_type_id uuid REFERENCES public.rail_service_types(id), coach_type_id uuid REFERENCES public.rail_coach_types(id),
  task_name text NOT NULL, skill text, standard_minutes int NOT NULL DEFAULT 10,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

-- ===== Contracts =====
CREATE TABLE public.rail_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, start_time time NOT NULL, end_time time NOT NULL,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), client_location_id uuid REFERENCES public.rail_locations(id), loa_number text NOT NULL, gem_ref text,
  title text, start_date date, end_date date, value numeric, gst_percent numeric NOT NULL DEFAULT 18,
  partial_clean_rule text NOT NULL DEFAULT 'pro_rata' CHECK (partial_clean_rule IN ('pro_rata','zero','full')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_contract_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid NOT NULL REFERENCES public.rail_contracts(id), location_id uuid NOT NULL REFERENCES public.rail_locations(id),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_rate_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid NOT NULL REFERENCES public.rail_contracts(id), service_type_id uuid REFERENCES public.rail_service_types(id),
  coach_type_id uuid REFERENCES public.rail_coach_types(id), category_id uuid REFERENCES public.rail_train_categories(id),
  billing_unit text NOT NULL DEFAULT 'per_coach' CHECK (billing_unit IN ('per_coach','per_day','per_trip','lump_sum')), rate numeric NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_deployment_norms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_site_id uuid REFERENCES public.rail_contract_sites(id), shift_id uuid REFERENCES public.rail_shifts(id),
  role_key text NOT NULL, min_count int NOT NULL DEFAULT 1, effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

-- ===== Config masters =====
CREATE TABLE public.rail_reason_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, label text NOT NULL, applies_to text NOT NULL DEFAULT 'event',
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL, language text NOT NULL DEFAULT 'en', text text NOT NULL,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE (key, language));
CREATE TABLE public.rail_custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), entity text NOT NULL, field text NOT NULL, field_type text NOT NULL DEFAULT 'text', options jsonb,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL, threshold_minutes int, notify_roles text[] NOT NULL DEFAULT '{}', enabled boolean NOT NULL DEFAULT true,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL UNIQUE, enabled boolean NOT NULL DEFAULT false, description text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

-- ===== AI cleanliness check =====
CREATE TABLE public.rail_ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), pass_score numeric NOT NULL DEFAULT 7, attention_score numeric NOT NULL DEFAULT 5,
  areas text[] NOT NULL DEFAULT '{toilet,floor,berths,windows,dustbin,doorway,washbasin,vestibule}',
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_ai_photo_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), photo_path text NOT NULL, area text, coach_number text, coach_type text,
  model text NOT NULL, score numeric NOT NULL, verdict text NOT NULL CHECK (verdict IN ('clean','attention','dirty')), issues jsonb NOT NULL DEFAULT '[]',
  summary text, scored_by uuid DEFAULT auth.uid(),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

-- ===== Grants, RLS, audit triggers for all rail_ tables =====
DO $$
DECLARE t text; m text;
BEGIN
  FOREACH t IN ARRAY ARRAY['rail_roles','rail_permissions','rail_user_roles','rail_locations','rail_coach_families','rail_coach_types','rail_train_categories','rail_service_types','rail_trains','rail_train_schedules','rail_standard_compositions','rail_coaches','rail_checklist_templates','rail_checklist_items','rail_task_templates','rail_shifts','rail_contracts','rail_contract_sites','rail_rate_lines','rail_deployment_norms','rail_reason_codes','rail_labels','rail_custom_fields','rail_alert_rules','rail_feature_flags','rail_ai_settings','rail_ai_photo_scores']
  LOOP
    m := CASE
      WHEN t IN ('rail_roles','rail_permissions','rail_user_roles') THEN 'rail_access'
      WHEN t IN ('rail_contracts','rail_contract_sites','rail_rate_lines','rail_deployment_norms') THEN 'rail_contracts'
      WHEN t = 'rail_ai_photo_scores' THEN 'rail_ops'
      ELSE 'rail_settings' END;
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "rail read" ON public.%I FOR SELECT TO authenticated USING (deleted_at IS NULL AND (public.rail_can(%L,''view'') OR public.rail_can(''rail_ops'',''view'')))', t, m);
    EXECUTE format('CREATE POLICY "rail create" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.rail_can(%L,''create'') OR public.rail_can(%L,''configure''))', t, m, m);
    EXECUTE format('CREATE POLICY "rail edit" ON public.%I FOR UPDATE TO authenticated USING (public.rail_can(%L,''edit'') OR public.rail_can(%L,''configure'')) WITH CHECK (true)', t, m, m);
    EXECUTE format('CREATE TRIGGER rail_audit BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.rail_audit()', t);
  END LOOP;
END $$;

-- cleaners may record their own AI scores
CREATE POLICY "rail ai own insert" ON public.rail_ai_photo_scores FOR INSERT TO authenticated WITH CHECK (scored_by = auth.uid());
CREATE POLICY "rail ai own read" ON public.rail_ai_photo_scores FOR SELECT TO authenticated USING (scored_by = auth.uid());
-- every signed-in user may read their own role grants and labels
CREATE POLICY "rail own roles" ON public.rail_user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "rail labels read" ON public.rail_labels FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "rail flags read" ON public.rail_feature_flags FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "rail ai settings read" ON public.rail_ai_settings FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "rail audit read" ON public.rail_audit_trail FOR SELECT TO authenticated USING (public.rail_can('rail_access','view'));
