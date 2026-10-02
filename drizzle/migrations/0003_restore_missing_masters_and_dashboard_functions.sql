CREATE TABLE IF NOT EXISTS public.public_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  holiday_month smallint NOT NULL CHECK (holiday_month BETWEEN 1 AND 12),
  holiday_day smallint NOT NULL CHECK (holiday_day BETWEEN 1 AND 31),
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_holidays TO authenticated;
GRANT ALL ON public.public_holidays TO service_role;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "holidays read" ON public.public_holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "holidays write" ON public.public_holidays FOR ALL TO authenticated
  USING ((select public.is_admin_user()) OR (select public.current_user_has_permission('control_center', null, 'edit')))
  WITH CHECK ((select public.is_admin_user()) OR (select public.current_user_has_permission('control_center', null, 'edit')));
CREATE TRIGGER public_holidays_set_updated_at BEFORE UPDATE ON public.public_holidays FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.billing_day_bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  method text NOT NULL DEFAULT 'actual_days',
  fixed_days integer,
  weekly_off_day smallint,
  included_weekdays smallint[],
  description text,
  is_default boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_day_bases TO authenticated;
GRANT ALL ON public.billing_day_bases TO service_role;
ALTER TABLE public.billing_day_bases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "billing day bases read" ON public.billing_day_bases FOR SELECT TO authenticated USING (true);
CREATE POLICY "billing day bases write" ON public.billing_day_bases FOR ALL TO authenticated
  USING ((select public.is_admin_user()) OR (select public.current_user_has_permission('control_center', null, 'edit')))
  WITH CHECK ((select public.is_admin_user()) OR (select public.current_user_has_permission('control_center', null, 'edit')));
CREATE TRIGGER billing_day_bases_set_updated_at BEFORE UPDATE ON public.billing_day_bases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.invoice_extra_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  contract_id uuid REFERENCES public.client_contracts(id) ON DELETE SET NULL,
  period_start date,
  period_end date,
  description text NOT NULL,
  hsn_sac text NOT NULL DEFAULT '998525',
  quantity numeric NOT NULL DEFAULT 1,
  rate numeric NOT NULL DEFAULT 0,
  per_label text NOT NULL DEFAULT 'Duty',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoice_extra_charges_unit_idx ON public.invoice_extra_charges(unit_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_extra_charges TO authenticated;
GRANT ALL ON public.invoice_extra_charges TO service_role;
ALTER TABLE public.invoice_extra_charges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "extras read" ON public.invoice_extra_charges FOR SELECT TO authenticated
  USING ((select public.is_admin_user()) OR (select public.current_user_has_permission('invoice', null, 'view')));
CREATE POLICY "extras write" ON public.invoice_extra_charges FOR ALL TO authenticated
  USING ((select public.is_admin_user()) OR (select public.current_user_has_permission('invoice', null, 'edit')))
  WITH CHECK ((select public.is_admin_user()) OR (select public.current_user_has_permission('invoice', null, 'edit')));
CREATE TRIGGER invoice_extra_charges_set_updated_at BEFORE UPDATE ON public.invoice_extra_charges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Dashboard / scope helpers. SECURITY INVOKER so row-level security decides what each person counts.
CREATE OR REPLACE FUNCTION public.dashboard_counts(p_start date, p_end date, p_today date, p_horizon date)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT jsonb_build_object(
    'orgs', (SELECT count(*) FROM public.customers),
    'units', (SELECT count(*) FROM public.units),
    'employees', (SELECT count(*) FROM public.candidates WHERE status = 'active' AND is_enabled),
    'contractsActive', (SELECT count(*) FROM public.client_contracts WHERE status = 'active'),
    'contractsExpiring', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'contract_code', contract_code, 'end_date', end_date, 'unit_id', unit_id, 'status', status) ORDER BY end_date)
        FROM public.client_contracts WHERE status = 'active' AND end_date BETWEEN p_today AND p_horizon), '[]'::jsonb),
    'vehicles', (SELECT count(*) FROM public.vehicles WHERE enabled),
    'fuelTotal', (SELECT COALESCE(sum(amount), 0) FROM public.vehicle_fuel_entries WHERE entry_date BETWEEN p_start AND p_end),
    'items', (SELECT count(*) FROM public.inv_items WHERE enabled),
    'sheetCounts', (SELECT jsonb_build_object(
        'approved', count(*) FILTER (WHERE status = 'approved'),
        'pending', count(*) FILTER (WHERE status = 'submitted'),
        'draft', count(*) FILTER (WHERE status = 'draft'),
        'rejected', count(*) FILTER (WHERE status = 'rejected'))
      FROM public.attendance_sheets WHERE period_end >= p_start AND period_start <= p_end),
    'runCounts', (SELECT jsonb_build_object(
        'approved', count(*) FILTER (WHERE status = 'approved'),
        'pending', count(*) FILTER (WHERE status = 'submitted'),
        'draft', count(*) FILTER (WHERE status = 'draft'),
        'rejected', count(*) FILTER (WHERE status = 'rejected'),
        'processed', count(*) FILTER (WHERE payroll_status = 'processed'),
        'open', count(*) FILTER (WHERE COALESCE(payroll_status, 'open') = 'open'))
      FROM public.payroll_runs WHERE period_end >= p_start AND period_start <= p_end)
  );
$$;
GRANT EXECUTE ON FUNCTION public.dashboard_counts(date, date, date, date) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_pnl_inputs(p_start date, p_end date, p_att_end date)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public AS $$
  WITH ac AS (
    SELECT DISTINCT ON (cc.unit_id) cc.id, cc.unit_id
    FROM public.client_contracts cc
    WHERE cc.status = 'active' AND cc.unit_id IS NOT NULL
      AND (cc.start_date IS NULL OR cc.start_date <= p_end)
      AND (cc.end_date IS NULL OR cc.end_date >= p_start)
    ORDER BY cc.unit_id, cc.start_date DESC NULLS LAST
  )
  SELECT jsonb_build_object(
    'units', COALESCE((SELECT jsonb_agg(jsonb_build_object('unit_id', u.id, 'unit_code', u.code, 'unit_name', u.name,
        'customer_name', COALESCE(c.name, ''), 'epf_cap_enabled', u.epf_cap_enabled, 'contract_id', ac.id,
        'is_internal', false, 'actual_strength', (SELECT count(*) FROM public.candidates x WHERE x.unit_id = u.id AND x.status = 'active')))
      FROM ac JOIN public.units u ON u.id = ac.unit_id LEFT JOIN public.customers c ON c.id = u.customer_id), '[]'::jsonb),
    'resources', COALESCE((SELECT jsonb_agg(jsonb_build_object('contract_id', r.contract_id, 'designation_id', r.designation_id,
        'quantity', r.quantity, 'components', r.components, 'benefits', r.benefits, 'deductions', r.deductions,
        'employer_contributions', r.employer_contributions, 'payroll_day_base_id', r.payroll_day_base_id))
      FROM public.contract_resources r WHERE r.contract_id IN (SELECT id FROM ac)), '[]'::jsonb),
    'pairs', COALESCE((SELECT jsonb_agg(p) FROM (
        SELECT e.unit_id, e.candidate_id, e.designation_id,
          count(*) FILTER (WHERE ac2.counts_as_present) AS p_days,
          count(*) FILTER (WHERE e.code = 'PH') AS ph_days,
          count(*) FILTER (WHERE ac2.is_paid AND NOT ac2.counts_as_present AND e.code <> 'PH') AS other_paid_days,
          COALESCE(sum(e.ot_hours), 0) / 8.0 AS ot_days
        FROM public.attendance_entries e
        LEFT JOIN public.attendance_codes ac2 ON ac2.code = e.code
        WHERE e.entry_date BETWEEN p_start AND p_att_end AND e.unit_id IN (SELECT unit_id FROM ac) AND e.designation_id IS NOT NULL
        GROUP BY e.unit_id, e.candidate_id, e.designation_id) p), '[]'::jsonb),
    'day_bases', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', d.id, 'method', d.method, 'fixed_days', d.fixed_days,
        'weekly_off_day', d.weekly_off_day, 'included_weekdays', d.included_weekdays)) FROM public.payroll_day_bases d), '[]'::jsonb)
  );
$$;
GRANT EXECUTE ON FUNCTION public.dashboard_pnl_inputs(date, date, date) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.people_insights(p_unit_ids uuid[] DEFAULT NULL, p_days integer DEFAULT 366, p_sixty boolean DEFAULT false, p_limit integer DEFAULT 200, p_role_keys text[] DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SET search_path = public AS $$
  WITH people AS (
    SELECT c.id, c.full_name, c.photo_url, c.mobile, c.date_of_birth, c.approved_at, c.created_at, c.unit_id,
           u.name AS unit_name, c.designation_id, d.name AS designation_name
    FROM public.candidates c
    LEFT JOIN public.units u ON u.id = c.unit_id
    LEFT JOIN public.designations d ON d.id = c.designation_id
    WHERE c.status = 'active' AND c.is_enabled
      AND (p_unit_ids IS NULL OR c.unit_id = ANY (p_unit_ids))
      AND (p_role_keys IS NULL OR c.role_key = ANY (p_role_keys))
  ), b AS (
    SELECT p.*, (make_date(extract(year FROM current_date)::int, extract(month FROM date_of_birth)::int, 1)
                 + (least(extract(day FROM date_of_birth)::int, 28) - 1)) AS this_year
    FROM people p WHERE date_of_birth IS NOT NULL
  ), b2 AS (
    SELECT b.*, CASE WHEN this_year < current_date THEN (this_year + interval '1 year')::date ELSE this_year END AS next_date FROM b
  ), a AS (
    SELECT p.*, COALESCE(p.approved_at, p.created_at)::date AS joined FROM people p
  ), a2 AS (
    SELECT a.*, CASE WHEN (joined + (extract(year FROM age(current_date, joined))::int || ' years')::interval)::date >= current_date
        THEN (joined + (extract(year FROM age(current_date, joined))::int || ' years')::interval)::date
        ELSE (joined + ((extract(year FROM age(current_date, joined))::int + 1) || ' years')::interval)::date END AS next_date
    FROM a WHERE joined IS NOT NULL AND joined < current_date
  )
  SELECT jsonb_build_object(
    'birthdays', COALESCE((SELECT jsonb_agg(x) FROM (SELECT id, full_name, photo_url, mobile, date_of_birth, approved_at, created_at, unit_id, unit_name, designation_id, designation_name,
        (next_date - current_date) AS "daysUntil", next_date AS "nextDate", extract(year FROM age(next_date, date_of_birth))::int AS "turningAge"
        FROM b2 WHERE next_date - current_date <= p_days ORDER BY next_date LIMIT p_limit) x), '[]'::jsonb),
    'anniversaries', COALESCE((SELECT jsonb_agg(x) FROM (SELECT id, full_name, photo_url, mobile, date_of_birth, approved_at, created_at, unit_id, unit_name, designation_id, designation_name,
        (next_date - current_date) AS "daysUntil", next_date AS "nextDate", extract(year FROM age(next_date, joined))::int AS years
        FROM a2 WHERE next_date - current_date <= p_days AND extract(year FROM age(next_date, joined)) >= 1 ORDER BY next_date LIMIT p_limit) x), '[]'::jsonb),
    'sixtyPlus', CASE WHEN p_sixty THEN COALESCE((SELECT jsonb_agg(x) FROM (SELECT id, full_name, photo_url, mobile, date_of_birth, approved_at, created_at, unit_id, unit_name, designation_id, designation_name,
        extract(year FROM age(current_date, date_of_birth))::int AS age
        FROM people WHERE date_of_birth IS NOT NULL AND age(current_date, date_of_birth) >= interval '60 years' ORDER BY date_of_birth LIMIT p_limit) x), '[]'::jsonb) ELSE '[]'::jsonb END
  );
$$;
GRANT EXECUTE ON FUNCTION public.people_insights(uuid[], integer, boolean, integer, text[]) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_missing_contract_designations()
RETURNS TABLE(candidate_id uuid, full_name text, employee_code text, candidate_code text, unit_id uuid, unit_name text, unit_code text,
  customer_name text, designation_id uuid, designation_name text, contract_id uuid, missing_since timestamptz)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT c.id, c.full_name, c.employee_code, c.candidate_code, u.id, u.name, u.code, COALESCE(cu.name, ''), d.id, d.name,
         cc.id, COALESCE(c.approved_at, c.created_at)
  FROM public.candidates c
  JOIN public.units u ON u.id = c.unit_id
  JOIN public.designations d ON d.id = c.designation_id
  LEFT JOIN public.customers cu ON cu.id = u.customer_id
  JOIN LATERAL (SELECT x.id FROM public.client_contracts x WHERE x.unit_id = u.id AND x.status = 'active' ORDER BY x.start_date DESC NULLS LAST LIMIT 1) cc ON true
  WHERE c.status = 'active' AND c.is_enabled
    AND NOT EXISTS (SELECT 1 FROM public.contract_resources r WHERE r.contract_id = cc.id AND r.designation_id = c.designation_id);
$$;
GRANT EXECUTE ON FUNCTION public.get_missing_contract_designations() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_assigned_units()
RETURNS TABLE(id uuid, name text, code text, site_address text, latitude numeric, longitude numeric,
  shift_start_time text, shift_end_time text, is_primary boolean, designation_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH me AS (SELECT public.current_user_candidate_id() AS cid)
  SELECT u.id, u.name, u.code, concat_ws(', ', NULLIF(u.client_address, ''), NULLIF(u.client_pincode, '')), u.latitude, u.longitude,
         NULL::text, NULL::text, bool_or(src.is_primary), (array_agg(src.designation_id) FILTER (WHERE src.designation_id IS NOT NULL))[1]
  FROM me
  JOIN LATERAL (
    SELECT c.unit_id, true AS is_primary, c.designation_id FROM public.candidates c WHERE c.id = me.cid AND c.unit_id IS NOT NULL
    UNION ALL
    SELECT cu.unit_id, cu.is_primary, cu.designation_id FROM public.candidate_units cu WHERE cu.candidate_id = me.cid
  ) src ON true
  JOIN public.units u ON u.id = src.unit_id
  GROUP BY u.id;
$$;
REVOKE ALL ON FUNCTION public.get_my_assigned_units() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_assigned_units() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_field_scope()
RETURNS TABLE(unit_id uuid, unit_name text, unit_code text, branch_id uuid, is_primary boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.unit_id, s.unit_name, s.unit_code, s.branch_id, s.is_primary
  FROM public.get_field_scope_for(public.current_user_candidate_id()) s;
$$;
REVOKE ALL ON FUNCTION public.get_my_field_scope() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_field_scope() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_field_scope_fresh()
RETURNS TABLE(unit_id uuid, unit_name text, unit_code text, customer_name text, branch_name text, address text, latitude numeric, longitude numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.unit_id, s.unit_name, s.unit_code, s.customer_name, s.branch_name, s.address, s.latitude, s.longitude
  FROM public.get_field_scope_for(public.current_user_candidate_id()) s;
$$;
REVOKE ALL ON FUNCTION public.get_my_field_scope_fresh() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_field_scope_fresh() TO authenticated, service_role;