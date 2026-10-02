-- ===== Rail Clean OS phases 2-7 =====
CREATE TABLE public.rail_people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile text NOT NULL UNIQUE,
  full_name text NOT NULL,
  role_key text NOT NULL,
  scope_type text NOT NULL DEFAULT 'all' CHECK (scope_type IN ('all','zone','division','contract','depot','line','own')),
  scope_location_id uuid REFERENCES public.rail_locations(id),
  scope_contract_id uuid REFERENCES public.rail_contracts(id),
  home_location_id uuid REFERENCES public.rail_locations(id),
  skill text NOT NULL DEFAULT 'unskilled' CHECK (skill IN ('unskilled','semi_skilled','skilled','highly_skilled')),
  daily_wage numeric,
  language text NOT NULL DEFAULT 'en',
  valid_from date NOT NULL DEFAULT CURRENT_DATE, valid_to date,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);

CREATE OR REPLACE FUNCTION public.rail_my_mobile() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT substring(u.email from 'phone-(\d+)@radiantguard\.local') FROM auth.users u WHERE u.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.rail_can(_module text, _action text, _location uuid DEFAULT NULL) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user() OR EXISTS (
    SELECT 1 FROM (
      SELECT role_key, scope_type, scope_location_id, scope_contract_id FROM rail_user_roles
       WHERE user_id = auth.uid() AND deleted_at IS NULL AND valid_from <= now() AND (valid_to IS NULL OR valid_to > now())
      UNION ALL
      SELECT role_key, scope_type, scope_location_id, scope_contract_id FROM rail_people
       WHERE mobile = public.rail_my_mobile() AND enabled AND deleted_at IS NULL AND valid_from <= CURRENT_DATE AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
    ) ur
    JOIN rail_permissions p ON p.role_key = ur.role_key AND p.deleted_at IS NULL
    WHERE p.module_key = _module AND p.action = _action
      AND (ur.scope_type IN ('all','own') OR _location IS NULL
        OR (ur.scope_type = 'contract' AND EXISTS (SELECT 1 FROM rail_contract_sites cs WHERE cs.contract_id = ur.scope_contract_id AND cs.deleted_at IS NULL AND cs.location_id IN (SELECT public.rail_location_ancestors(_location))))
        OR ur.scope_location_id IN (SELECT public.rail_location_ancestors(_location)))
  )
$$;

CREATE OR REPLACE FUNCTION public.rail_my_roles() RETURNS TABLE(role_key text, scope_type text, scope_location_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role_key, scope_type, scope_location_id FROM rail_user_roles WHERE user_id = auth.uid() AND deleted_at IS NULL AND (valid_to IS NULL OR valid_to > now())
  UNION SELECT role_key, scope_type, scope_location_id FROM rail_people WHERE mobile = public.rail_my_mobile() AND enabled AND deleted_at IS NULL
  UNION SELECT 'super_admin', 'all', NULL::uuid WHERE public.is_admin_user()
$$;
GRANT EXECUTE ON FUNCTION public.rail_my_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rail_my_mobile() TO authenticated;

CREATE TABLE public.rail_settings_kv (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL, value numeric, text_value text, description text,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE OR REPLACE FUNCTION public.rail_setting(_key text, _on date DEFAULT CURRENT_DATE) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT value FROM rail_settings_kv WHERE key = _key AND deleted_at IS NULL AND effective_from <= _on AND (effective_to IS NULL OR effective_to >= _on) ORDER BY effective_from DESC LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.rail_setting(text,date) TO authenticated;

CREATE TABLE public.rail_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date date NOT NULL, train_id uuid NOT NULL REFERENCES public.rail_trains(id),
  location_id uuid NOT NULL REFERENCES public.rail_locations(id), service_type_id uuid NOT NULL REFERENCES public.rail_service_types(id),
  shift_id uuid REFERENCES public.rail_shifts(id), contract_id uuid REFERENCES public.rail_contracts(id),
  wash_method text NOT NULL DEFAULT 'manual' CHECK (wash_method IN ('manual','acwp','none')),
  planned_start timestamptz, planned_end timestamptz, placed_at timestamptz, actual_start timestamptz, actual_end timestamptz, released_at timestamptz,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','placed','in_progress','completed','approved','released','cancelled')),
  supervisor_id uuid, notes text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE UNIQUE INDEX rail_events_uniq ON public.rail_events(train_id, event_date, service_type_id, location_id) WHERE deleted_at IS NULL;
CREATE INDEX rail_events_date_idx ON public.rail_events(event_date, location_id);

CREATE TABLE public.rail_event_coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.rail_events(id), location_id uuid,
  coach_id uuid REFERENCES public.rail_coaches(id), coach_type_id uuid REFERENCES public.rail_coach_types(id), position int NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','rejected','approved','removed')),
  removed_reason text, rework_count int NOT NULL DEFAULT 0, first_pass boolean, rate_fraction numeric NOT NULL DEFAULT 1,
  ai_score numeric, approved_by uuid, approved_at timestamptz,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE INDEX rail_event_coaches_event_idx ON public.rail_event_coaches(event_id);

CREATE TABLE public.rail_event_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_coach_id uuid NOT NULL REFERENCES public.rail_event_coaches(id), event_id uuid, location_id uuid,
  task_template_id uuid REFERENCES public.rail_task_templates(id), task_name text NOT NULL, standard_minutes int NOT NULL DEFAULT 10,
  assigned_to uuid, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','skipped')),
  started_at timestamptz, completed_at timestamptz, completed_by uuid, photo_path text, ai_score numeric, offline_id text UNIQUE, completed_offline boolean NOT NULL DEFAULT false,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE INDEX rail_event_tasks_coach_idx ON public.rail_event_tasks(event_coach_id);
CREATE INDEX rail_event_tasks_assignee_idx ON public.rail_event_tasks(assigned_to);

CREATE TABLE public.rail_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), person_id uuid NOT NULL REFERENCES public.rail_people(id), location_id uuid REFERENCES public.rail_locations(id),
  shift_id uuid REFERENCES public.rail_shifts(id), work_date date NOT NULL, check_in timestamptz, check_out timestamptz,
  hours numeric GENERATED ALWAYS AS (round((extract(epoch FROM (check_out - check_in)) / 3600.0)::numeric, 2)) STORED,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE (person_id, work_date, shift_id));

CREATE TABLE public.rail_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_coach_id uuid REFERENCES public.rail_event_coaches(id), event_id uuid, location_id uuid,
  inspector_id uuid DEFAULT auth.uid(), inspector_role text, result text NOT NULL CHECK (result IN ('pass','fail')), score numeric, remarks text, reason_code text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_penalty_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL, name text NOT NULL,
  basis text NOT NULL DEFAULT 'per_instance' CHECK (basis IN ('per_instance','per_coach','per_head','percent_of_bill')), amount numeric NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid REFERENCES public.rail_contracts(id), location_id uuid, event_id uuid REFERENCES public.rail_events(id),
  event_coach_id uuid, rule_code text NOT NULL, qty numeric NOT NULL DEFAULT 1, amount numeric NOT NULL, penalty_date date NOT NULL DEFAULT CURRENT_DATE,
  reason text, status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','confirmed','waived','disputed')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source text NOT NULL DEFAULT 'railmadad', ref_no text, train_id uuid REFERENCES public.rail_trains(id), coach_number text,
  location_id uuid, category text NOT NULL DEFAULT 'cleanliness', description text, sla_due timestamptz, resolved_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','assigned','resolved','closed')), assigned_to uuid,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rule_code text NOT NULL, location_id uuid, severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','critical')),
  message text NOT NULL, link text, status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','closed')), ack_by uuid, ack_at timestamptz,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

ALTER TABLE public.inv_items
  ADD COLUMN IF NOT EXISTS rail_category text,
  ADD COLUMN IF NOT EXISTS is_concentrate boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dilution_ratio text,
  ADD COLUMN IF NOT EXISTS hazard_class text,
  ADD COLUMN IF NOT EXISTS msds_path text,
  ADD COLUMN IF NOT EXISTS co2e_kg_per_unit numeric;
CREATE TABLE public.rail_item_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES public.inv_items(id), location_id uuid REFERENCES public.rail_locations(id),
  batch_no text NOT NULL, expiry_date date, qty_on_hand numeric NOT NULL DEFAULT 0, unit_cost numeric,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_contract_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid NOT NULL REFERENCES public.rail_contracts(id), item_id uuid NOT NULL REFERENCES public.inv_items(id),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_consumption_norms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), item_id uuid NOT NULL REFERENCES public.inv_items(id), service_type_id uuid REFERENCES public.rail_service_types(id),
  coach_type_id uuid REFERENCES public.rail_coach_types(id), qty_per_coach numeric NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_kit_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), issue_date date NOT NULL DEFAULT CURRENT_DATE, location_id uuid REFERENCES public.rail_locations(id),
  shift_id uuid REFERENCES public.rail_shifts(id), contract_id uuid REFERENCES public.rail_contracts(id), supervisor_person_id uuid REFERENCES public.rail_people(id),
  item_id uuid NOT NULL REFERENCES public.inv_items(id), qty_issued numeric NOT NULL, qty_returned numeric NOT NULL DEFAULT 0, returned_at timestamptz,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_job_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_coach_id uuid NOT NULL REFERENCES public.rail_event_coaches(id), event_id uuid, location_id uuid,
  item_id uuid NOT NULL REFERENCES public.inv_items(id), norm_qty numeric NOT NULL DEFAULT 0, qty numeric NOT NULL,
  source text NOT NULL DEFAULT 'norm' CHECK (source IN ('norm','edited')), cleaner_id uuid,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  UNIQUE (event_coach_id, item_id));
CREATE TABLE public.rail_purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), location_id uuid REFERENCES public.rail_locations(id), item_id uuid NOT NULL REFERENCES public.inv_items(id),
  qty numeric NOT NULL, reason text, requested_by uuid DEFAULT auth.uid(),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','received')),
  approved_by uuid, approved_at timestamptz, grn_qty numeric, grn_batch text, grn_expiry date, grn_at timestamptz,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), qr_tag text NOT NULL UNIQUE, name text NOT NULL,
  category text NOT NULL CHECK (category IN ('jet_machine','scrubber_drier','vacuum','fogger','ladder','trolley','ppe','uniform','phone_tablet','acwp_spare','tractor','tanker','other')),
  serial_no text, purchase_date date, value numeric, warranty_until date, location_id uuid REFERENCES public.rail_locations(id), custodian_person_id uuid REFERENCES public.rail_people(id),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','issued','maintenance','damaged','missing','retired')),
  run_hours numeric NOT NULL DEFAULT 0, pm_every_days int, pm_every_hours numeric, last_pm_on date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_asset_custody (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), asset_id uuid NOT NULL REFERENCES public.rail_assets(id), person_id uuid NOT NULL REFERENCES public.rail_people(id), location_id uuid,
  checked_out_at timestamptz NOT NULL DEFAULT now(), due_back_at timestamptz, checked_in_at timestamptz,
  out_condition text NOT NULL DEFAULT 'ok' CHECK (out_condition IN ('ok','damaged','missing')), in_condition text CHECK (in_condition IN ('ok','damaged','missing')), photo_path text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_asset_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), asset_id uuid NOT NULL REFERENCES public.rail_assets(id), location_id uuid,
  kind text NOT NULL DEFAULT 'preventive' CHECK (kind IN ('preventive','breakdown')), due_on date, opened_at timestamptz NOT NULL DEFAULT now(), closed_at timestamptz,
  downtime_hours numeric GENERATED ALWAYS AS (round((extract(epoch FROM (closed_at - opened_at)) / 3600.0)::numeric, 1)) STORED,
  description text, cost numeric, status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_ppe_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), person_id uuid NOT NULL REFERENCES public.rail_people(id), location_id uuid,
  item_name text NOT NULL, issued_on date NOT NULL DEFAULT CURRENT_DATE, replace_every_days int NOT NULL DEFAULT 180,
  next_due date GENERATED ALWAYS AS (issued_on + replace_every_days) STORED,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

CREATE TABLE public.rail_meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, name text NOT NULL,
  resource text NOT NULL CHECK (resource IN ('water_fresh','water_recycled','electricity','diesel')), unit text NOT NULL, location_id uuid REFERENCES public.rail_locations(id),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_meter_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), meter_id uuid NOT NULL REFERENCES public.rail_meters(id), location_id uuid, event_id uuid REFERENCES public.rail_events(id),
  reading numeric NOT NULL, read_at timestamptz NOT NULL DEFAULT now(), photo_path text, reader_id uuid DEFAULT auth.uid(),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_emission_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), resource text NOT NULL, factor numeric NOT NULL, unit text NOT NULL, source_note text,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_resource_norms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), method text NOT NULL CHECK (method IN ('manual','acwp')), resource text NOT NULL, qty_per_coach numeric NOT NULL, unit text NOT NULL,
  effective_from date NOT NULL DEFAULT CURRENT_DATE, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_resource_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid REFERENCES public.rail_events(id), event_coach_id uuid, location_id uuid, ledger_date date NOT NULL DEFAULT CURRENT_DATE,
  resource text NOT NULL, qty numeric NOT NULL, unit text NOT NULL, metered boolean NOT NULL DEFAULT false, co2e_kg numeric NOT NULL DEFAULT 0, method text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE INDEX rail_resource_ledger_date_idx ON public.rail_resource_ledger(ledger_date, location_id);
CREATE TABLE public.rail_acwp_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), location_id uuid REFERENCES public.rail_locations(id), run_date date NOT NULL, coaches int NOT NULL,
  run_minutes numeric, kwh numeric, fresh_litres numeric, recycled_litres numeric, source_file text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_esg_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), month date NOT NULL, contract_id uuid REFERENCES public.rail_contracts(id), summary jsonb NOT NULL DEFAULT '{}',
  signed_by uuid, signed_at timestamptz, file_hash text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

CREATE TABLE public.rail_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid NOT NULL REFERENCES public.rail_contracts(id), bill_month date NOT NULL, bill_no text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','checker_verified','certified','paid','cancelled')),
  gross numeric NOT NULL DEFAULT 0, penalty_total numeric NOT NULL DEFAULT 0, credit_total numeric NOT NULL DEFAULT 0, gst_percent numeric NOT NULL DEFAULT 18,
  gst_amount numeric NOT NULL DEFAULT 0, net_total numeric NOT NULL DEFAULT 0,
  submitted_at timestamptz, checker_signed_by uuid, checker_signed_at timestamptz, annexure_sha256 text, certified_by uuid, certified_at timestamptz, paid_at timestamptz, paid_ref text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE UNIQUE INDEX rail_bills_uniq ON public.rail_bills(contract_id, bill_month) WHERE deleted_at IS NULL AND status <> 'cancelled';
CREATE TABLE public.rail_bill_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bill_id uuid NOT NULL REFERENCES public.rail_bills(id), event_id uuid, event_coach_id uuid, rate_line_id uuid,
  description text NOT NULL, billing_unit text NOT NULL, qty numeric NOT NULL, rate numeric NOT NULL, amount numeric NOT NULL, dup_key text,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE UNIQUE INDEX rail_bill_lines_dup ON public.rail_bill_lines(dup_key) WHERE deleted_at IS NULL AND dup_key IS NOT NULL;
CREATE TABLE public.rail_credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bill_id uuid NOT NULL REFERENCES public.rail_bills(id), amount numeric NOT NULL, reason text NOT NULL,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_bill_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bill_id uuid NOT NULL REFERENCES public.rail_bills(id), stage text NOT NULL, signer uuid DEFAULT auth.uid(), signer_mobile text,
  file_sha256 text, signed_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_wage_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), area_class text NOT NULL CHECK (area_class IN ('A','B','C')),
  skill text NOT NULL CHECK (skill IN ('unskilled','semi_skilled','skilled','highly_skilled')), category text NOT NULL DEFAULT 'sweeping_cleaning',
  basic_per_day numeric NOT NULL, vda_per_day numeric NOT NULL, total_per_day numeric GENERATED ALWAYS AS (basic_per_day + vda_per_day) STORED,
  effective_from date NOT NULL, effective_to date,
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);
CREATE TABLE public.rail_compliance_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), contract_id uuid NOT NULL REFERENCES public.rail_contracts(id), month date NOT NULL,
  doc_type text NOT NULL CHECK (doc_type IN ('bank_transfer','epf_ecr','esic_challan','attendance_register')), file_path text, reference text,
  status text NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','verified','rejected')),
  created_by uuid, updated_by uuid, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz);

DO $$
DECLARE r record; has_loc boolean;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('rail_people','rail_access'),('rail_settings_kv','rail_settings'),
    ('rail_events','rail_ops'),('rail_event_coaches','rail_ops'),('rail_event_tasks','rail_ops'),('rail_attendance','rail_ops'),('rail_alerts','rail_ops'),
    ('rail_inspections','rail_quality'),('rail_complaints','rail_quality'),
    ('rail_penalty_rules','rail_billing'),('rail_penalties','rail_billing'),
    ('rail_item_batches','rail_supplies'),('rail_contract_items','rail_supplies'),('rail_consumption_norms','rail_supplies'),('rail_kit_issues','rail_supplies'),
    ('rail_job_consumption','rail_supplies'),('rail_purchase_requests','rail_supplies'),('rail_assets','rail_supplies'),('rail_asset_custody','rail_supplies'),
    ('rail_asset_maintenance','rail_supplies'),('rail_ppe_issues','rail_supplies'),
    ('rail_meters','rail_sustainability'),('rail_meter_readings','rail_sustainability'),('rail_emission_factors','rail_sustainability'),('rail_resource_norms','rail_sustainability'),
    ('rail_resource_ledger','rail_sustainability'),('rail_acwp_runs','rail_sustainability'),('rail_esg_reports','rail_sustainability'),
    ('rail_bills','rail_billing'),('rail_bill_lines','rail_billing'),('rail_credit_notes','rail_billing'),('rail_bill_signoffs','rail_billing'),
    ('rail_wage_rules','rail_wages'),('rail_compliance_docs','rail_wages')
  ) v(t, m)
  LOOP
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=r.t AND column_name='location_id') INTO has_loc;
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON public.%I TO authenticated', r.t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', r.t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.t);
    IF has_loc THEN
      EXECUTE format('CREATE POLICY "rail read" ON public.%I FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.rail_can(%L,''view'',location_id))', r.t, r.m);
      EXECUTE format('CREATE POLICY "rail create" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.rail_can(%L,''create'',location_id))', r.t, r.m);
      EXECUTE format('CREATE POLICY "rail edit" ON public.%I FOR UPDATE TO authenticated USING (public.rail_can(%L,''edit'',location_id)) WITH CHECK (public.rail_can(%L,''edit'',location_id))', r.t, r.m, r.m);
    ELSE
      EXECUTE format('CREATE POLICY "rail read" ON public.%I FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.rail_can(%L,''view''))', r.t, r.m);
      EXECUTE format('CREATE POLICY "rail create" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.rail_can(%L,''create'') OR public.rail_can(%L,''configure''))', r.t, r.m, r.m);
      EXECUTE format('CREATE POLICY "rail edit" ON public.%I FOR UPDATE TO authenticated USING (public.rail_can(%L,''edit'') OR public.rail_can(%L,''configure'')) WITH CHECK (public.rail_can(%L,''edit'') OR public.rail_can(%L,''configure''))', r.t, r.m, r.m, r.m, r.m);
    END IF;
    EXECUTE format('CREATE TRIGGER rail_audit_trg BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.rail_audit()', r.t);
  END LOOP;
END $$;
CREATE POLICY "rail own tasks read" ON public.rail_event_tasks FOR SELECT TO authenticated USING (deleted_at IS NULL AND assigned_to = auth.uid());
CREATE POLICY "rail own person read" ON public.rail_people FOR SELECT TO authenticated USING (deleted_at IS NULL AND mobile = public.rail_my_mobile());
CREATE POLICY "rail settings read" ON public.rail_settings_kv FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "rail audit insert" ON public.rail_audit_trail FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "rail read" ON public.rail_ai_photo_scores;
CREATE POLICY "rail ai reviewer read" ON public.rail_ai_photo_scores FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.rail_can('rail_quality','view'));

CREATE OR REPLACE FUNCTION public.rail_fill_from_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'rail_event_coaches' THEN
    SELECT location_id INTO NEW.location_id FROM rail_events WHERE id = NEW.event_id;
  ELSE
    SELECT ec.event_id, ec.location_id INTO NEW.event_id, NEW.location_id FROM rail_event_coaches ec WHERE ec.id = NEW.event_coach_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_fill_loc BEFORE INSERT ON public.rail_event_coaches FOR EACH ROW EXECUTE FUNCTION public.rail_fill_from_event();
CREATE TRIGGER rail_fill_loc BEFORE INSERT ON public.rail_event_tasks FOR EACH ROW EXECUTE FUNCTION public.rail_fill_from_event();
CREATE TRIGGER rail_fill_loc BEFORE INSERT ON public.rail_job_consumption FOR EACH ROW EXECUTE FUNCTION public.rail_fill_from_event();
CREATE TRIGGER rail_fill_loc BEFORE INSERT ON public.rail_inspections FOR EACH ROW EXECUTE FUNCTION public.rail_fill_from_event();

CREATE OR REPLACE FUNCTION public.rail_kit_issue_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.contract_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rail_contract_items WHERE contract_id = NEW.contract_id AND item_id = NEW.item_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'This item is not approved for this contract';
  END IF;
  IF NEW.qty_returned > NEW.qty_issued THEN RAISE EXCEPTION 'Returned quantity cannot exceed issued quantity'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_kit_issue_guard BEFORE INSERT OR UPDATE ON public.rail_kit_issues FOR EACH ROW EXECUTE FUNCTION public.rail_kit_issue_guard();

CREATE OR REPLACE FUNCTION public.rail_custody_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM rail_asset_custody WHERE person_id = NEW.person_id AND checked_in_at IS NULL AND due_back_at < now() AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'This person holds overdue items. Collect them first.';
  END IF;
  IF EXISTS (SELECT 1 FROM rail_asset_custody WHERE asset_id = NEW.asset_id AND checked_in_at IS NULL AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'This item is already checked out';
  END IF;
  SELECT location_id INTO NEW.location_id FROM rail_assets WHERE id = NEW.asset_id;
  UPDATE rail_assets SET status = 'issued', custodian_person_id = NEW.person_id WHERE id = NEW.asset_id;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_custody_guard BEFORE INSERT ON public.rail_asset_custody FOR EACH ROW EXECUTE FUNCTION public.rail_custody_guard();
CREATE OR REPLACE FUNCTION public.rail_custody_return() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.checked_in_at IS NOT NULL AND OLD.checked_in_at IS NULL THEN
    UPDATE rail_assets SET custodian_person_id = NULL,
      status = CASE COALESCE(NEW.in_condition,'ok') WHEN 'ok' THEN 'available' WHEN 'damaged' THEN 'damaged' ELSE 'missing' END
    WHERE id = NEW.asset_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_custody_return BEFORE UPDATE ON public.rail_asset_custody FOR EACH ROW EXECUTE FUNCTION public.rail_custody_return();

CREATE OR REPLACE FUNCTION public.rail_pr_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'requested' THEN
    IF NEW.requested_by = auth.uid() THEN RAISE EXCEPTION 'You cannot approve your own request'; END IF;
    NEW.approved_by := auth.uid(); NEW.approved_at := now();
  END IF;
  IF NEW.status = 'received' AND OLD.status <> 'approved' THEN RAISE EXCEPTION 'Only approved requests can be received'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_pr_guard BEFORE UPDATE ON public.rail_purchase_requests FOR EACH ROW EXECUTE FUNCTION public.rail_pr_guard();

CREATE OR REPLACE FUNCTION public.rail_pr_grn() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'received' AND OLD.status = 'approved' THEN
    INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand)
      VALUES (NEW.item_id, NEW.location_id, COALESCE(NEW.grn_batch, 'GRN-' || to_char(now(),'YYMMDDHH24MI')), NEW.grn_expiry, COALESCE(NEW.grn_qty, NEW.qty));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_pr_grn AFTER UPDATE ON public.rail_purchase_requests FOR EACH ROW EXECUTE FUNCTION public.rail_pr_grn();

CREATE OR REPLACE FUNCTION public.rail_min_wage(_location uuid, _skill text, _on date DEFAULT CURRENT_DATE) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.total_per_day FROM rail_wage_rules w
  WHERE w.deleted_at IS NULL AND w.skill = _skill AND w.effective_from <= _on AND (w.effective_to IS NULL OR w.effective_to >= _on)
    AND w.area_class = COALESCE((SELECT l.area_class FROM rail_locations l WHERE l.id IN (SELECT public.rail_location_ancestors(_location)) AND l.area_class IS NOT NULL LIMIT 1), 'A')
  ORDER BY w.effective_from DESC LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.rail_min_wage(uuid,text,date) TO authenticated;
CREATE OR REPLACE FUNCTION public.rail_wage_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE mn numeric;
BEGIN
  IF NEW.daily_wage IS NOT NULL AND NEW.home_location_id IS NOT NULL THEN
    mn := public.rail_min_wage(NEW.home_location_id, NEW.skill);
    IF mn IS NOT NULL AND NEW.daily_wage < mn THEN
      RAISE EXCEPTION 'Daily wage % is below the legal minimum % for this site and skill', NEW.daily_wage, mn;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_wage_guard BEFORE INSERT OR UPDATE ON public.rail_people FOR EACH ROW EXECUTE FUNCTION public.rail_wage_guard();

CREATE OR REPLACE FUNCTION public.rail_ledger_co2() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f numeric;
BEGIN
  SELECT factor INTO f FROM rail_emission_factors WHERE resource = NEW.resource AND deleted_at IS NULL AND effective_from <= NEW.ledger_date
    AND (effective_to IS NULL OR effective_to >= NEW.ledger_date) ORDER BY effective_from DESC LIMIT 1;
  NEW.co2e_kg := round(COALESCE(f,0) * NEW.qty, 4);
  RETURN NEW;
END $$;
CREATE TRIGGER rail_ledger_co2 BEFORE INSERT OR UPDATE OF qty, resource ON public.rail_resource_ledger FOR EACH ROW EXECUTE FUNCTION public.rail_ledger_co2();

CREATE OR REPLACE FUNCTION public.rail_consumption_alert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pct numeric := COALESCE(public.rail_setting('variance_alert_pct'), 25);
BEGIN
  IF NEW.norm_qty > 0 AND NEW.qty > NEW.norm_qty * (1 + pct/100) THEN
    INSERT INTO rail_alerts(rule_code, location_id, severity, message, link)
    VALUES ('CONSUMPTION_VARIANCE', NEW.location_id, 'warning',
      format('Chemical use %s%% above norm on a coach', round((NEW.qty/NEW.norm_qty - 1)*100)), '/admin/rail/supplies');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_consumption_alert AFTER INSERT OR UPDATE OF qty ON public.rail_job_consumption FOR EACH ROW EXECUTE FUNCTION public.rail_consumption_alert();

CREATE OR REPLACE FUNCTION public.rail_plan_day(_date date, _location uuid DEFAULT NULL) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; st uuid; ev uuid; n int := 0; dow int := extract(isodow FROM _date)::int; con uuid;
BEGIN
  FOR s IN SELECT ts.*, t.days_of_run FROM rail_train_schedules ts JOIN rail_trains t ON t.id = ts.train_id
    WHERE ts.deleted_at IS NULL AND t.deleted_at IS NULL AND dow = ANY(t.days_of_run)
      AND (_location IS NULL OR ts.location_id IN (SELECT id FROM rail_locations l WHERE _location IN (SELECT public.rail_location_ancestors(l.id))))
  LOOP
    IF NOT public.rail_can('rail_ops','create', s.location_id) THEN CONTINUE; END IF;
    SELECT cs.contract_id INTO con FROM rail_contract_sites cs JOIN rail_contracts c ON c.id = cs.contract_id
      WHERE cs.deleted_at IS NULL AND c.deleted_at IS NULL AND cs.location_id IN (SELECT public.rail_location_ancestors(s.location_id)) LIMIT 1;
    FOREACH st IN ARRAY s.service_type_ids LOOP
      INSERT INTO rail_events(event_date, train_id, location_id, service_type_id, contract_id, planned_start, planned_end, shift_id)
      VALUES (_date, s.train_id, s.location_id, st, con,
        (_date + COALESCE(s.arrival, '06:00'::time))::timestamptz,
        (_date + COALESCE(s.arrival, '06:00'::time))::timestamptz + make_interval(mins => COALESCE(s.dwell_minutes, (SELECT default_window_minutes FROM rail_service_types WHERE id = st))),
        (SELECT id FROM rail_shifts WHERE deleted_at IS NULL AND COALESCE(s.arrival,'06:00') >= start_time AND COALESCE(s.arrival,'06:00') < end_time LIMIT 1))
      ON CONFLICT DO NOTHING RETURNING id INTO ev;
      IF ev IS NULL THEN CONTINUE; END IF;
      n := n + 1;
      INSERT INTO rail_event_coaches(event_id, position, coach_type_id, coach_id)
      SELECT ev, sc.position, sc.coach_type_id,
        (SELECT c.id FROM rail_coaches c WHERE c.coach_type_id = sc.coach_type_id AND c.status = 'active' AND c.deleted_at IS NULL
           ORDER BY (hashtext(s.train_id::text || sc.position::text || c.id::text)) LIMIT 1)
      FROM rail_standard_compositions sc WHERE sc.train_id = s.train_id AND sc.deleted_at IS NULL ORDER BY sc.position;
      INSERT INTO rail_event_tasks(event_coach_id, task_template_id, task_name, standard_minutes)
      SELECT ec.id, tt.id, tt.task_name, tt.standard_minutes FROM rail_event_coaches ec
      JOIN rail_task_templates tt ON tt.deleted_at IS NULL AND tt.service_type_id = st AND (tt.coach_type_id IS NULL OR tt.coach_type_id = ec.coach_type_id)
      WHERE ec.event_id = ev;
      ev := NULL;
    END LOOP;
  END LOOP;
  RETURN n;
END $$;

CREATE OR REPLACE FUNCTION public.rail_place_rake(_event uuid, _removed uuid[] DEFAULT '{}', _reason text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE loc uuid;
BEGIN
  SELECT location_id INTO loc FROM rail_events WHERE id = _event;
  IF NOT public.rail_can('rail_ops','edit', loc) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  UPDATE rail_events SET status = 'placed', placed_at = now() WHERE id = _event AND status = 'planned';
  UPDATE rail_event_coaches SET status = 'removed', removed_reason = COALESCE(_reason,'Removed from rake') WHERE event_id = _event AND id = ANY(_removed);
  UPDATE rail_event_tasks SET status = 'skipped' WHERE event_coach_id = ANY(_removed);
END $$;

CREATE OR REPLACE FUNCTION public.rail_post_event_resources(_event uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e record;
BEGIN
  SELECT * INTO e FROM rail_events WHERE id = _event;
  INSERT INTO rail_job_consumption(event_coach_id, item_id, norm_qty, qty, source)
  SELECT ec.id, n.item_id, n.qty_per_coach, n.qty_per_coach, 'norm'
  FROM rail_event_coaches ec JOIN rail_consumption_norms n ON n.deleted_at IS NULL AND (n.service_type_id IS NULL OR n.service_type_id = e.service_type_id)
    AND (n.coach_type_id IS NULL OR n.coach_type_id = ec.coach_type_id) AND n.effective_from <= e.event_date AND (n.effective_to IS NULL OR n.effective_to >= e.event_date)
  WHERE ec.event_id = _event AND ec.status <> 'removed' AND ec.deleted_at IS NULL
  ON CONFLICT (event_coach_id, item_id) DO NOTHING;
  IF e.wash_method <> 'none' AND NOT EXISTS (SELECT 1 FROM rail_resource_ledger WHERE event_id = _event AND deleted_at IS NULL) THEN
    INSERT INTO rail_resource_ledger(event_id, event_coach_id, location_id, ledger_date, resource, qty, unit, metered, method)
    SELECT _event, ec.id, e.location_id, e.event_date, rn.resource, rn.qty_per_coach, rn.unit, false, e.wash_method
    FROM rail_event_coaches ec JOIN rail_resource_norms rn ON rn.deleted_at IS NULL AND rn.method = e.wash_method
      AND rn.effective_from <= e.event_date AND (rn.effective_to IS NULL OR rn.effective_to >= e.event_date)
    WHERE ec.event_id = _event AND ec.status <> 'removed' AND ec.deleted_at IS NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rail_roll_up(_coach uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ev uuid; total int; done int;
BEGIN
  SELECT event_id INTO ev FROM rail_event_coaches WHERE id = _coach;
  SELECT count(*) FILTER (WHERE status <> 'skipped'), count(*) FILTER (WHERE status = 'done') INTO total, done FROM rail_event_tasks WHERE event_coach_id = _coach AND deleted_at IS NULL;
  UPDATE rail_event_coaches SET
    rate_fraction = CASE WHEN total = 0 THEN 1 ELSE round(done::numeric / total, 4) END,
    status = CASE WHEN status IN ('approved','removed') THEN status WHEN total > 0 AND done = total THEN 'done' WHEN done > 0 THEN 'in_progress' ELSE status END
  WHERE id = _coach;
  UPDATE rail_events SET status = 'in_progress', actual_start = COALESCE(actual_start, now()) WHERE id = ev AND status IN ('planned','placed');
  IF NOT EXISTS (SELECT 1 FROM rail_event_coaches WHERE event_id = ev AND deleted_at IS NULL AND status NOT IN ('done','approved','removed')) THEN
    UPDATE rail_events SET status = 'completed', actual_end = now() WHERE id = ev AND status = 'in_progress';
    PERFORM public.rail_post_event_resources(ev);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rail_complete_task(_task uuid, _offline_id text DEFAULT NULL, _completed_at timestamptz DEFAULT NULL, _photo text DEFAULT NULL, _ai_score numeric DEFAULT NULL) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF _offline_id IS NOT NULL AND EXISTS (SELECT 1 FROM rail_event_tasks WHERE offline_id = _offline_id) THEN RETURN 'already_synced'; END IF;
  SELECT * INTO t FROM rail_event_tasks WHERE id = _task AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;
  IF NOT (t.assigned_to = auth.uid() OR public.rail_can('rail_ops','edit', t.location_id)) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF t.status = 'done' THEN RETURN 'already_done'; END IF;
  UPDATE rail_event_tasks SET status = 'done', completed_at = COALESCE(_completed_at, now()), completed_by = auth.uid(),
    photo_path = COALESCE(_photo, photo_path), ai_score = COALESCE(_ai_score, ai_score), offline_id = _offline_id, completed_offline = _offline_id IS NOT NULL
  WHERE id = _task;
  PERFORM public.rail_roll_up(t.event_coach_id);
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.rail_review_coach(_coach uuid, _pass boolean, _remarks text DEFAULT NULL, _reason text DEFAULT NULL, _score numeric DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; ev record; roles text;
BEGIN
  SELECT * INTO c FROM rail_event_coaches WHERE id = _coach;
  IF NOT (public.rail_can('rail_quality','inspect', c.location_id) OR public.rail_can('rail_quality','sign', c.location_id)) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT string_agg(role_key, ',') INTO roles FROM public.rail_my_roles();
  INSERT INTO rail_inspections(event_coach_id, result, remarks, reason_code, score, inspector_role) VALUES (_coach, CASE WHEN _pass THEN 'pass' ELSE 'fail' END, _remarks, _reason, _score, roles);
  SELECT * INTO ev FROM rail_events WHERE id = c.event_id;
  IF _pass THEN
    UPDATE rail_event_coaches SET status = 'approved', approved_by = auth.uid(), approved_at = now(), first_pass = COALESCE(first_pass, rework_count = 0) WHERE id = _coach;
    IF NOT EXISTS (SELECT 1 FROM rail_event_coaches WHERE event_id = c.event_id AND deleted_at IS NULL AND status NOT IN ('approved','removed')) THEN
      UPDATE rail_events SET status = 'approved' WHERE id = c.event_id;
    END IF;
  ELSE
    UPDATE rail_event_coaches SET status = 'rejected', rework_count = rework_count + 1, first_pass = false WHERE id = _coach;
    UPDATE rail_event_tasks SET status = 'pending', completed_at = NULL, offline_id = NULL WHERE event_coach_id = _coach AND status = 'done';
    UPDATE rail_events SET status = 'in_progress' WHERE id = c.event_id AND status IN ('completed','approved');
    INSERT INTO rail_penalties(contract_id, location_id, event_id, event_coach_id, rule_code, qty, amount, reason)
    SELECT ev.contract_id, c.location_id, c.event_id, _coach, r.code, 1, r.amount, COALESCE(_remarks, 'Coach rejected on inspection')
    FROM rail_penalty_rules r WHERE r.code = 'COACH_REJECTED' AND r.deleted_at IS NULL AND r.effective_from <= ev.event_date AND (r.effective_to IS NULL OR r.effective_to >= ev.event_date)
    ORDER BY r.effective_from DESC LIMIT 1;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rail_release_event(_event uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e record; late_min int; r record;
BEGIN
  SELECT * INTO e FROM rail_events WHERE id = _event;
  IF NOT public.rail_can('rail_ops','approve', e.location_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF e.status <> 'approved' THEN RAISE EXCEPTION 'All coaches must be approved before release'; END IF;
  UPDATE rail_events SET status = 'released', released_at = now() WHERE id = _event;
  late_min := GREATEST(0, extract(epoch FROM (now() - e.planned_end)) / 60)::int;
  IF late_min > 0 THEN
    SELECT * INTO r FROM rail_penalty_rules WHERE code = 'LATE_RELEASE' AND deleted_at IS NULL ORDER BY effective_from DESC LIMIT 1;
    IF FOUND THEN
      INSERT INTO rail_penalties(contract_id, location_id, event_id, rule_code, qty, amount, reason)
      VALUES (e.contract_id, e.location_id, _event, 'LATE_RELEASE', ceil(late_min / 15.0), ceil(late_min / 15.0) * r.amount, format('Released %s minutes late', late_min));
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rail_check_shortfall(_date date) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n record; present int; r record; k int := 0;
BEGIN
  IF NOT public.rail_can('rail_billing','create') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO r FROM rail_penalty_rules WHERE code = 'STAFF_SHORTFALL' AND deleted_at IS NULL AND effective_from <= _date ORDER BY effective_from DESC LIMIT 1;
  FOR n IN SELECT dn.*, cs.location_id, cs.contract_id FROM rail_deployment_norms dn JOIN rail_contract_sites cs ON cs.id = dn.contract_site_id
    WHERE dn.deleted_at IS NULL AND dn.effective_from <= _date AND (dn.effective_to IS NULL OR dn.effective_to >= _date)
  LOOP
    SELECT count(*) INTO present FROM rail_attendance a JOIN rail_people p ON p.id = a.person_id
      WHERE a.work_date = _date AND a.deleted_at IS NULL AND a.check_in IS NOT NULL AND (n.shift_id IS NULL OR a.shift_id = n.shift_id) AND p.role_key = n.role_key
        AND a.location_id IN (SELECT id FROM rail_locations l WHERE n.location_id IN (SELECT public.rail_location_ancestors(l.id)));
    IF present < n.min_count AND r.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rail_penalties WHERE rule_code = 'STAFF_SHORTFALL' AND penalty_date = _date AND location_id = n.location_id AND reason LIKE '%' || n.role_key || '%' AND deleted_at IS NULL) THEN
      INSERT INTO rail_penalties(contract_id, location_id, rule_code, qty, amount, penalty_date, reason)
      VALUES (n.contract_id, n.location_id, 'STAFF_SHORTFALL', n.min_count - present, (n.min_count - present) * r.amount, _date, format('%s short by %s (needed %s, present %s)', n.role_key, n.min_count - present, n.min_count, present));
      k := k + 1;
    END IF;
  END LOOP;
  RETURN k;
END $$;

CREATE OR REPLACE FUNCTION public.rail_generate_bill(_contract uuid, _month date) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b uuid; c record; m0 date := date_trunc('month', _month)::date; m1 date := (date_trunc('month', _month) + interval '1 month - 1 day')::date; rl record; g numeric; p numeric; cr numeric;
BEGIN
  IF NOT public.rail_can('rail_billing','create') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO c FROM rail_contracts WHERE id = _contract;
  SELECT id INTO b FROM rail_bills WHERE contract_id = _contract AND bill_month = m0 AND deleted_at IS NULL AND status <> 'cancelled';
  IF b IS NULL THEN
    INSERT INTO rail_bills(contract_id, bill_month, gst_percent, bill_no) VALUES (_contract, m0, c.gst_percent, 'RB-' || to_char(m0,'YYYYMM') || '-' || left(c.loa_number, 12)) RETURNING id INTO b;
  ELSIF (SELECT status FROM rail_bills WHERE id = b) <> 'draft' THEN
    RAISE EXCEPTION 'Only draft bills can be regenerated';
  ELSE
    UPDATE rail_bill_lines SET deleted_at = now() WHERE bill_id = b AND deleted_at IS NULL;
  END IF;
  INSERT INTO rail_bill_lines(bill_id, event_id, event_coach_id, rate_line_id, description, billing_unit, qty, rate, amount, dup_key)
  SELECT b, e.id, ec.id, r.id,
    format('%s %s %s coach %s', t.number, to_char(e.event_date,'DD Mon'), st.code, COALESCE(co.coach_number, ec.position::text)),
    'per_coach',
    CASE c.partial_clean_rule WHEN 'full' THEN 1 WHEN 'zero' THEN CASE WHEN ec.rate_fraction < 1 THEN 0 ELSE 1 END ELSE ec.rate_fraction END,
    r.rate,
    round(r.rate * CASE c.partial_clean_rule WHEN 'full' THEN 1 WHEN 'zero' THEN CASE WHEN ec.rate_fraction < 1 THEN 0 ELSE 1 END ELSE ec.rate_fraction END, 2),
    t.id::text || '|' || e.event_date || '|' || e.service_type_id || '|' || COALESCE(ec.coach_id::text, ec.position::text)
  FROM rail_events e JOIN rail_event_coaches ec ON ec.event_id = e.id AND ec.status = 'approved' AND ec.deleted_at IS NULL
  JOIN rail_trains t ON t.id = e.train_id JOIN rail_service_types st ON st.id = e.service_type_id LEFT JOIN rail_coaches co ON co.id = ec.coach_id
  JOIN LATERAL (SELECT * FROM rail_rate_lines r WHERE r.contract_id = _contract AND r.deleted_at IS NULL AND r.billing_unit = 'per_coach'
      AND (r.service_type_id IS NULL OR r.service_type_id = e.service_type_id) AND (r.coach_type_id IS NULL OR r.coach_type_id = ec.coach_type_id)
      AND (r.category_id IS NULL OR r.category_id = t.category_id) AND r.effective_from <= e.event_date AND (r.effective_to IS NULL OR r.effective_to >= e.event_date)
      ORDER BY (r.coach_type_id IS NOT NULL) DESC, (r.category_id IS NOT NULL) DESC, r.effective_from DESC LIMIT 1) r ON true
  WHERE e.contract_id = _contract AND e.event_date BETWEEN m0 AND m1 AND e.deleted_at IS NULL AND e.status IN ('approved','released')
  ON CONFLICT DO NOTHING;
  FOR rl IN SELECT * FROM rail_rate_lines WHERE contract_id = _contract AND deleted_at IS NULL AND billing_unit <> 'per_coach' AND effective_from <= m1 AND (effective_to IS NULL OR effective_to >= m0) LOOP
    INSERT INTO rail_bill_lines(bill_id, rate_line_id, description, billing_unit, qty, rate, amount, dup_key)
    SELECT b, rl.id, format('%s (%s)', COALESCE((SELECT name FROM rail_service_types WHERE id = rl.service_type_id),'Service'), rl.billing_unit), rl.billing_unit, q, rl.rate, round(q * rl.rate, 2),
      rl.id::text || '|' || m0
    FROM (SELECT CASE rl.billing_unit
        WHEN 'lump_sum' THEN 1
        WHEN 'per_day' THEN (SELECT count(DISTINCT e.event_date) FROM rail_events e WHERE e.contract_id = _contract AND e.event_date BETWEEN m0 AND m1 AND e.status IN ('approved','released') AND e.deleted_at IS NULL AND (rl.service_type_id IS NULL OR e.service_type_id = rl.service_type_id))
        ELSE (SELECT count(*) FROM rail_events e WHERE e.contract_id = _contract AND e.event_date BETWEEN m0 AND m1 AND e.status IN ('approved','released') AND e.deleted_at IS NULL AND (rl.service_type_id IS NULL OR e.service_type_id = rl.service_type_id)) END::numeric AS q) x
    WHERE q > 0 ON CONFLICT DO NOTHING;
  END LOOP;
  SELECT COALESCE(sum(amount),0) INTO g FROM rail_bill_lines WHERE bill_id = b AND deleted_at IS NULL;
  SELECT COALESCE(sum(amount),0) INTO p FROM rail_penalties WHERE contract_id = _contract AND penalty_date BETWEEN m0 AND m1 AND status IN ('proposed','confirmed') AND deleted_at IS NULL;
  SELECT COALESCE(sum(amount),0) INTO cr FROM rail_credit_notes WHERE bill_id = b AND deleted_at IS NULL;
  UPDATE rail_bills SET gross = g, penalty_total = p, credit_total = cr,
    gst_amount = round((g - p - cr) * gst_percent / 100, 2), net_total = round((g - p - cr) * (1 + gst_percent / 100), 2)
  WHERE id = b;
  RETURN b;
END $$;

CREATE OR REPLACE FUNCTION public.rail_bill_advance(_bill uuid, _to text, _otp text DEFAULT NULL, _sha256 text DEFAULT NULL, _ref text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; missing int; mob text := public.rail_my_mobile();
BEGIN
  SELECT * INTO b FROM rail_bills WHERE id = _bill AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Bill not found'; END IF;
  IF _to = 'submitted' THEN
    IF b.status <> 'draft' OR NOT public.rail_can('rail_billing','edit') THEN RAISE EXCEPTION 'Not allowed'; END IF;
    SELECT count(*) INTO missing FROM unnest(ARRAY['bank_transfer','epf_ecr','esic_challan','attendance_register']) d
      WHERE NOT EXISTS (SELECT 1 FROM rail_compliance_docs cd WHERE cd.contract_id = b.contract_id AND cd.month = b.bill_month AND cd.doc_type = d AND cd.status <> 'rejected' AND cd.deleted_at IS NULL);
    IF missing > 0 THEN RAISE EXCEPTION 'Compliance checklist incomplete: % document(s) missing for this month', missing; END IF;
    UPDATE rail_bills SET status = 'submitted', submitted_at = now() WHERE id = _bill;
  ELSIF _to = 'checker_verified' THEN
    IF b.status <> 'submitted' OR NOT public.rail_can('rail_billing','sign') THEN RAISE EXCEPTION 'Only a Railway Checker can sign a submitted bill'; END IF;
    IF _otp IS NULL OR (mob IS NOT NULL AND _otp <> right(mob, 4)) OR (mob IS NULL AND NOT public.is_admin_user()) THEN RAISE EXCEPTION 'Incorrect OTP'; END IF;
    IF _sha256 IS NULL OR length(_sha256) <> 64 THEN RAISE EXCEPTION 'Signed annexure fingerprint missing'; END IF;
    UPDATE rail_bills SET status = 'checker_verified', checker_signed_by = auth.uid(), checker_signed_at = now(), annexure_sha256 = _sha256 WHERE id = _bill;
    INSERT INTO rail_bill_signoffs(bill_id, stage, signer_mobile, file_sha256) VALUES (_bill, 'checker_verified', mob, _sha256);
  ELSIF _to = 'certified' THEN
    IF b.status <> 'checker_verified' OR NOT public.rail_can('rail_billing','approve') THEN RAISE EXCEPTION 'Not allowed'; END IF;
    UPDATE rail_bills SET status = 'certified', certified_by = auth.uid(), certified_at = now() WHERE id = _bill;
    INSERT INTO rail_bill_signoffs(bill_id, stage, signer_mobile) VALUES (_bill, 'certified', mob);
  ELSIF _to = 'paid' THEN
    IF b.status <> 'certified' OR NOT public.rail_can('rail_billing','approve') THEN RAISE EXCEPTION 'Not allowed'; END IF;
    UPDATE rail_bills SET status = 'paid', paid_at = now(), paid_ref = _ref WHERE id = _bill;
  ELSIF _to = 'cancelled' THEN
    IF b.status NOT IN ('draft','submitted') OR NOT public.rail_can('rail_billing','approve') THEN RAISE EXCEPTION 'Not allowed'; END IF;
    UPDATE rail_bills SET status = 'cancelled' WHERE id = _bill;
    UPDATE rail_bill_lines SET deleted_at = now() WHERE bill_id = _bill;
  ELSE RAISE EXCEPTION 'Unknown state %', _to; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.rail_save_person(_mobile text, _name text, _role text, _scope text DEFAULT 'all', _scope_location uuid DEFAULT NULL,
  _home uuid DEFAULT NULL, _skill text DEFAULT 'unskilled', _wage numeric DEFAULT NULL, _scope_contract uuid DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pid uuid;
BEGIN
  IF NOT public.rail_can('rail_access','configure') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _mobile !~ '^\d{10}$' THEN RAISE EXCEPTION 'Mobile must be 10 digits'; END IF;
  IF NOT EXISTS (SELECT 1 FROM rail_roles WHERE key = _role AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Unknown role'; END IF;
  INSERT INTO rail_people(mobile, full_name, role_key, scope_type, scope_location_id, scope_contract_id, home_location_id, skill, daily_wage)
  VALUES (_mobile, _name, _role, _scope, _scope_location, _scope_contract, _home, _skill, _wage)
  ON CONFLICT (mobile) DO UPDATE SET full_name = EXCLUDED.full_name, role_key = EXCLUDED.role_key, scope_type = EXCLUDED.scope_type,
    scope_location_id = EXCLUDED.scope_location_id, scope_contract_id = EXCLUDED.scope_contract_id, home_location_id = EXCLUDED.home_location_id,
    skill = EXCLUDED.skill, daily_wage = EXCLUDED.daily_wage, enabled = true, deleted_at = NULL
  RETURNING id INTO pid;
  IF NOT EXISTS (SELECT 1 FROM candidates WHERE mobile = _mobile) THEN
    INSERT INTO candidates(full_name, mobile, status, role_key, is_enabled) VALUES (_name, _mobile, 'active', 'rail_' || _role, true);
  ELSE
    UPDATE candidates SET role_key = 'rail_' || _role, is_enabled = true, status = 'active' WHERE mobile = _mobile AND (role_key IS NULL OR role_key LIKE 'rail_%');
  END IF;
  RETURN pid;
END $$;

CREATE OR REPLACE FUNCTION public.rail_kpis(_date date DEFAULT CURRENT_DATE) RETURNS jsonb
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'events_today', (SELECT count(*) FROM rail_events WHERE event_date = _date AND deleted_at IS NULL),
    'coaches_cleaned', (SELECT count(*) FROM rail_event_coaches ec JOIN rail_events e ON e.id = ec.event_id WHERE e.event_date = _date AND ec.status IN ('done','approved')),
    'released', (SELECT count(*) FROM rail_events WHERE event_date = _date AND status = 'released'),
    'on_time_release', (SELECT count(*) FROM rail_events WHERE event_date = _date AND status = 'released' AND released_at <= planned_end),
    'reviewed', (SELECT count(*) FROM rail_event_coaches ec JOIN rail_events e ON e.id = ec.event_id WHERE e.event_date = _date AND ec.first_pass IS NOT NULL),
    'first_pass', (SELECT count(*) FROM rail_event_coaches ec JOIN rail_events e ON e.id = ec.event_id WHERE e.event_date = _date AND ec.first_pass),
    'rework', (SELECT count(*) FROM rail_event_coaches ec JOIN rail_events e ON e.id = ec.event_id WHERE e.event_date = _date AND ec.rework_count > 0),
    'staff_present', (SELECT count(*) FROM rail_attendance WHERE work_date = _date AND check_in IS NOT NULL AND deleted_at IS NULL),
    'staff_norm', (SELECT COALESCE(sum(min_count),0) FROM rail_deployment_norms WHERE deleted_at IS NULL AND effective_from <= _date AND (effective_to IS NULL OR effective_to >= _date)),
    'penalties_mtd', (SELECT COALESCE(sum(amount),0) FROM rail_penalties WHERE penalty_date >= date_trunc('month', _date) AND penalty_date <= _date AND status IN ('proposed','confirmed') AND deleted_at IS NULL),
    'bill_mtd', (SELECT COALESCE(sum(net_total),0) FROM rail_bills WHERE bill_month = date_trunc('month', _date)::date AND status <> 'cancelled' AND deleted_at IS NULL),
    'open_alerts', (SELECT count(*) FROM rail_alerts WHERE status = 'open' AND deleted_at IS NULL),
    'open_complaints', (SELECT count(*) FROM rail_complaints WHERE status IN ('open','assigned') AND deleted_at IS NULL),
    'water_saved_mtd_l', (SELECT COALESCE(sum(CASE WHEN l.method = 'acwp' THEN COALESCE(public.rail_setting('baseline_manual_litres', _date), 1500) END), 0)
         - COALESCE(sum(CASE WHEN l.method = 'acwp' AND l.resource = 'water_fresh' THEN l.qty END), 0)
         FROM (SELECT DISTINCT ON (event_coach_id, resource) * FROM rail_resource_ledger WHERE ledger_date >= date_trunc('month', _date) AND ledger_date <= _date AND deleted_at IS NULL AND resource = 'water_fresh') l),
    'co2e_mtd_kg', (SELECT COALESCE(sum(co2e_kg),0) FROM rail_resource_ledger WHERE ledger_date >= date_trunc('month', _date) AND ledger_date <= _date AND deleted_at IS NULL),
    'coaches_mtd', (SELECT count(DISTINCT event_coach_id) FROM rail_resource_ledger WHERE ledger_date >= date_trunc('month', _date) AND ledger_date <= _date AND deleted_at IS NULL)
  )
$$;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY['rail_plan_day(date,uuid)','rail_place_rake(uuid,uuid[],text)','rail_complete_task(uuid,text,timestamptz,text,numeric)','rail_review_coach(uuid,boolean,text,text,numeric)',
    'rail_release_event(uuid)','rail_check_shortfall(date)','rail_generate_bill(uuid,date)','rail_bill_advance(uuid,text,text,text,text)',
    'rail_save_person(text,text,text,text,uuid,uuid,text,numeric,uuid)','rail_kpis(date)','rail_setting(text,date)']
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION public.%s FROM PUBLIC, anon', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO authenticated', f);
  END LOOP;
  REVOKE ALL ON FUNCTION public.rail_post_event_resources(uuid) FROM PUBLIC, anon, authenticated;
  REVOKE ALL ON FUNCTION public.rail_roll_up(uuid) FROM PUBLIC, anon, authenticated;
END $$;

CREATE OR REPLACE FUNCTION public.can_phone_login(_mobile text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    _mobile IN ('8373914073','8373149073','8373914072')
    OR EXISTS (SELECT 1 FROM public.candidates c WHERE c.mobile = _mobile AND c.status IN ('active','approved') AND COALESCE(c.is_enabled, true) = true)
    OR EXISTS (SELECT 1 FROM public.rail_people p WHERE p.mobile = _mobile AND p.enabled AND p.deleted_at IS NULL)
$$;