CREATE TABLE public.rail_salary_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id uuid NOT NULL REFERENCES public.rail_pay_structures(id),
  code text NOT NULL,
  label text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('earning','deduction','employer')),
  formula text NOT NULL,
  area_class text CHECK (area_class IS NULL OR area_class IN ('A','B','C')),
  sort_order int NOT NULL DEFAULT 100,
  enabled boolean NOT NULL DEFAULT true,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX rail_salary_components_structure_idx ON public.rail_salary_components(structure_id) WHERE deleted_at IS NULL;
GRANT SELECT, INSERT, UPDATE ON public.rail_salary_components TO authenticated;
GRANT ALL ON public.rail_salary_components TO service_role;
ALTER TABLE public.rail_salary_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salary components view" ON public.rail_salary_components FOR SELECT TO authenticated USING (public.rail_can('rail_billing','view'));
CREATE POLICY "salary components insert" ON public.rail_salary_components FOR INSERT TO authenticated WITH CHECK (public.rail_can('rail_billing','edit'));
CREATE POLICY "salary components update" ON public.rail_salary_components FOR UPDATE TO authenticated USING (public.rail_can('rail_billing','edit')) WITH CHECK (public.rail_can('rail_billing','edit'));
CREATE TRIGGER rail_audit_trg BEFORE INSERT OR UPDATE ON public.rail_salary_components FOR EACH ROW EXECUTE FUNCTION public.rail_audit();

INSERT INTO public.rail_salary_components (structure_id, code, label, kind, formula, sort_order, effective_from)
SELECT s.id, c.code, c.label, c.kind, c.formula, c.ord, s.effective_from
FROM public.rail_pay_structures s
CROSS JOIN LATERAL (VALUES
  ('basic_da','Basic + DA','earning','days * rate',10),
  ('hra','HRA','earning', format('basic_da * %s / 100', s.hra_pct),20),
  ('bonus','Bonus','earning', format('basic_da * %s / 100', s.bonus_pct),30),
  ('uniform','Uniform','earning', format('basic_da * %s / 100', s.uniform_pct),40),
  ('leave','Leave wages','earning', format('basic_da * %s / 100', s.leave_pct),50),
  ('ed','Extra Duty','earning', format('ed_hours * rate / %s * %s', s.ed_shift_hours, s.ed_multiplier),60),
  ('pf','PF','deduction', format('round(min(basic_da, %s) * %s / 100)', s.pf_wage_cap, s.pf_emp_pct),110),
  ('esic','ESIC','deduction', format('if(lte(gross, %s), ceil(gross * %s / 100), 0)', s.esic_gross_limit, s.esic_emp_pct),120),
  ('pt','Professional tax','deduction', format('if(gte(gross, %s), %s, 0)', s.pt_gross_threshold, s.pt_monthly),130),
  ('lwf','Labour welfare','deduction', format('if(days, %s, 0)', s.lwf_monthly),140),
  ('employer_pf','Employer PF','employer', format('round(min(basic_da, %s) * %s / 100)', s.pf_wage_cap, s.pf_er_pct),210),
  ('employer_edli','EDLI','employer', format('round(min(basic_da, %s) * %s / 100)', s.pf_wage_cap, s.edli_er_pct),220),
  ('employer_admin','PF admin','employer', format('round(min(basic_da, %s) * %s / 100)', s.pf_wage_cap, s.admin_er_pct),230),
  ('employer_esic','Employer ESIC','employer', format('if(lte(gross, %s), ceil(gross * %s / 100), 0)', s.esic_gross_limit, s.esic_er_pct),240)
) AS c(code,label,kind,formula,ord)
WHERE s.deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.rail_pay_inputs(_person uuid, _month date)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE p record; s record; w record; days int; ed_hours numeric; sh numeric; is_self boolean; is_mgr boolean;
BEGIN
  SELECT rp.*, l.area_class AS loc_area INTO p FROM rail_people rp LEFT JOIN rail_locations l ON l.id=rp.home_location_id WHERE rp.id=_person;
  IF NOT FOUND THEN RETURN NULL; END IF;
  is_self := EXISTS (SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND u.email='phone-'||p.mobile||'@radiantguard.local');
  is_mgr := public.rail_can('rail_billing','view');
  IF NOT is_self AND NOT is_mgr THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO s FROM rail_pay_structures WHERE role_key=p.role_key AND deleted_at IS NULL
    AND effective_from <= (_month + interval '1 month - 1 day')::date AND (effective_to IS NULL OR effective_to >= _month)
    ORDER BY effective_from DESC LIMIT 1;
  IF NOT FOUND THEN SELECT * INTO s FROM rail_pay_structures WHERE role_key=p.role_key AND deleted_at IS NULL ORDER BY effective_from DESC LIMIT 1; END IF;
  SELECT * INTO w FROM rail_wage_rules WHERE skill=coalesce(p.skill, s.skill, 'unskilled') AND area_class=coalesce(nullif(p.loc_area,''),'A') AND deleted_at IS NULL AND effective_from<=_month AND (effective_to IS NULL OR effective_to>=_month) ORDER BY effective_from DESC LIMIT 1;
  sh := greatest(coalesce(s.ed_shift_hours,8),1);
  SELECT count(*), coalesce(sum(greatest(coalesce(hours,0)-sh,0)),0) INTO days, ed_hours FROM rail_attendance WHERE person_id=_person AND deleted_at IS NULL AND check_in IS NOT NULL AND work_date>=_month AND work_date<(_month + interval '1 month');
  RETURN jsonb_build_object('name',p.full_name,'role',p.role_key,'structure_id',s.id,'structure',s.label,'area',coalesce(nullif(p.loc_area,''),'A'),
    'days',days,'rate',greatest(coalesce(w.total_per_day,0),coalesce(p.daily_wage,0)),'ed_hours',ed_hours,
    'days_in_month',extract(day from (_month + interval '1 month - 1 day'))::int,'is_mgr',is_mgr,'placeholder',coalesce(s.is_placeholder,true));
END $function$;
GRANT EXECUTE ON FUNCTION public.rail_pay_inputs(uuid, date) TO authenticated;