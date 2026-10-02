CREATE TABLE public.rail_pay_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  label text NOT NULL,
  skill text NOT NULL DEFAULT 'unskilled',
  hra_pct numeric NOT NULL DEFAULT 5,
  bonus_pct numeric NOT NULL DEFAULT 8.33,
  uniform_pct numeric NOT NULL DEFAULT 3,
  leave_pct numeric NOT NULL DEFAULT 6,
  pf_emp_pct numeric NOT NULL DEFAULT 12,
  pf_er_pct numeric NOT NULL DEFAULT 13,
  pf_wage_cap numeric NOT NULL DEFAULT 15000,
  esic_emp_pct numeric NOT NULL DEFAULT 0.75,
  esic_er_pct numeric NOT NULL DEFAULT 3.25,
  esic_gross_limit numeric NOT NULL DEFAULT 21000,
  pt_monthly numeric NOT NULL DEFAULT 200,
  lwf_monthly numeric NOT NULL DEFAULT 25,
  is_placeholder boolean NOT NULL DEFAULT true,
  effective_from date NOT NULL DEFAULT current_date,
  effective_to date,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rail_pay_structures TO authenticated;
GRANT ALL ON public.rail_pay_structures TO service_role;
ALTER TABLE public.rail_pay_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay structures view" ON public.rail_pay_structures FOR SELECT TO authenticated USING (public.rail_can('rail_billing','view'));
CREATE POLICY "pay structures edit" ON public.rail_pay_structures FOR ALL TO authenticated USING (public.rail_can('rail_billing','edit')) WITH CHECK (public.rail_can('rail_billing','edit'));
CREATE TRIGGER rail_audit_trg BEFORE INSERT OR UPDATE ON public.rail_pay_structures FOR EACH ROW EXECUTE FUNCTION public.rail_audit();

INSERT INTO public.rail_pay_structures (role_key,label,skill,hra_pct,effective_from) VALUES
 ('cleaner','Cleaner','unskilled',5,'2026-10-01'),
 ('shift_supervisor','Shift Supervisor','semi_skilled',10,'2026-10-01'),
 ('store_keeper','Store Keeper','semi_skilled',10,'2026-10-01'),
 ('depot_manager','Depot Manager','skilled',15,'2026-10-01'),
 ('railway_checker','Checker (contract side)','skilled',15,'2026-10-01'),
 ('project_head','Project Head','highly_skilled',20,'2026-10-01');

INSERT INTO public.rail_wage_rules (area_class,skill,category,basic_per_day,vda_per_day,effective_from) VALUES
 ('A','unskilled','sweeping_cleaning',535,312,'2026-10-01'),('B','unskilled','sweeping_cleaning',447,262,'2026-10-01'),('C','unskilled','sweeping_cleaning',358,211,'2026-10-01'),
 ('A','semi_skilled','sweeping_cleaning',600,330,'2026-10-01'),('B','semi_skilled','sweeping_cleaning',510,280,'2026-10-01'),('C','semi_skilled','sweeping_cleaning',420,230,'2026-10-01'),
 ('A','skilled','sweeping_cleaning',680,350,'2026-10-01'),('B','skilled','sweeping_cleaning',580,300,'2026-10-01'),('C','skilled','sweeping_cleaning',480,250,'2026-10-01'),
 ('A','highly_skilled','sweeping_cleaning',760,370,'2026-10-01'),('B','highly_skilled','sweeping_cleaning',660,320,'2026-10-01'),('C','highly_skilled','sweeping_cleaning',560,270,'2026-10-01');
COMMENT ON TABLE public.rail_pay_structures IS 'Role pay structures. Rows with is_placeholder=true and Oct-2026 rail_wage_rules are placeholders until the official notification is entered.';

CREATE OR REPLACE FUNCTION public.rail_guard_penalty() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved','final','waived') AND OLD.created_by = auth.uid() THEN
    RAISE EXCEPTION 'You cannot approve or waive a penalty you raised';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_guard_penalty_trg BEFORE UPDATE ON public.rail_penalties FOR EACH ROW EXECUTE FUNCTION public.rail_guard_penalty();

CREATE OR REPLACE FUNCTION public.rail_guard_bill() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.checker_signed_by IS DISTINCT FROM OLD.checker_signed_by AND NEW.checker_signed_by = OLD.created_by THEN
    RAISE EXCEPTION 'The person who prepared a bill cannot sign it';
  END IF;
  IF NEW.certified_by IS DISTINCT FROM OLD.certified_by AND NEW.certified_by = OLD.created_by THEN
    RAISE EXCEPTION 'The person who prepared a bill cannot certify it';
  END IF;
  IF OLD.status = 'paid' AND (NEW.gross IS DISTINCT FROM OLD.gross OR NEW.net_total IS DISTINCT FROM OLD.net_total) THEN
    RAISE EXCEPTION 'A paid bill cannot be changed';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_guard_bill_trg BEFORE UPDATE ON public.rail_bills FOR EACH ROW EXECUTE FUNCTION public.rail_guard_bill();

CREATE OR REPLACE FUNCTION public.rail_guard_attendance() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.work_date > current_date THEN RAISE EXCEPTION 'Attendance cannot be marked for a future date'; END IF;
  IF NEW.check_out IS NOT NULL AND NEW.check_in IS NOT NULL AND NEW.check_out < NEW.check_in THEN RAISE EXCEPTION 'Check-out cannot be before check-in'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_guard_attendance_trg BEFORE INSERT OR UPDATE ON public.rail_attendance FOR EACH ROW EXECUTE FUNCTION public.rail_guard_attendance();

CREATE OR REPLACE FUNCTION public.rail_guard_task_done() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status IS DISTINCT FROM 'done' AND NEW.assigned_to IS NOT NULL THEN
    IF NEW.accepted_at IS NULL THEN RAISE EXCEPTION 'The cleaner must accept this task before finishing it'; END IF;
    IF auth.uid() IS NOT NULL AND auth.uid() <> NEW.assigned_to AND NOT public.rail_can('rail_ops','edit',NEW.location_id) THEN
      RAISE EXCEPTION 'Only the assigned cleaner or a manager can finish this task';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER rail_guard_task_done_trg BEFORE UPDATE ON public.rail_event_tasks FOR EACH ROW EXECUTE FUNCTION public.rail_guard_task_done();

CREATE OR REPLACE FUNCTION public.rail_briefing(_date date DEFAULT current_date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.rail_can('rail_ops','view') THEN RETURN '{}'::jsonb; END IF;
  SELECT jsonb_build_object(
    'late_jobs', (SELECT count(*) FROM rail_events e WHERE e.event_date=_date AND e.deleted_at IS NULL AND e.status<>'released' AND e.planned_end < now()),
    'unassigned_tasks', (SELECT count(*) FROM rail_event_tasks t JOIN rail_events e ON e.id=t.event_id WHERE e.event_date=_date AND t.deleted_at IS NULL AND t.status='pending' AND t.assigned_to IS NULL),
    'waiting_accept', (SELECT count(*) FROM rail_event_tasks t JOIN rail_events e ON e.id=t.event_id WHERE e.event_date=_date AND t.deleted_at IS NULL AND t.status='pending' AND t.assigned_to IS NOT NULL AND t.accepted_at IS NULL),
    'short_depots', (SELECT count(*) FROM (
        SELECT cs.location_id, sum(n.min_count) req FROM rail_deployment_norms n JOIN rail_contract_sites cs ON cs.id=n.contract_site_id
        WHERE n.deleted_at IS NULL AND n.effective_from<=_date AND (n.effective_to IS NULL OR n.effective_to>=_date) GROUP BY 1) q
        WHERE q.req > (SELECT count(*) FROM rail_attendance a WHERE a.work_date=_date AND a.deleted_at IS NULL AND a.check_in IS NOT NULL AND a.location_id IN (SELECT id FROM rail_locations WHERE id=q.location_id OR parent_id=q.location_id))),
    'bills_to_sign', (SELECT count(*) FROM rail_bills WHERE deleted_at IS NULL AND status IN ('submitted','draft') AND checker_signed_at IS NULL),
    'penalties_proposed', (SELECT count(*) FROM rail_penalties WHERE deleted_at IS NULL AND status='proposed'),
    'complaints_late', (SELECT count(*) FROM rail_complaints WHERE deleted_at IS NULL AND status IN ('open','assigned') AND sla_due < now()),
    'stock_expiring', (SELECT count(*) FROM rail_item_batches WHERE deleted_at IS NULL AND qty_on_hand>0 AND expiry_date <= _date + 15),
    'purchase_waiting', (SELECT count(*) FROM rail_purchase_requests WHERE deleted_at IS NULL AND status='requested')
  ) INTO r;
  RETURN r;
END $$;
GRANT EXECUTE ON FUNCTION public.rail_briefing(date) TO authenticated;

CREATE OR REPLACE FUNCTION public.rail_suggest_cleaners(_task uuid) RETURNS TABLE(user_id uuid, full_name text, present boolean, open_tasks bigint) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE loc uuid;
BEGIN
  SELECT location_id INTO loc FROM rail_event_tasks WHERE id=_task;
  IF loc IS NULL OR NOT public.rail_can('rail_ops','edit',loc) THEN RETURN; END IF;
  RETURN QUERY
  SELECT u.id, p.full_name,
    EXISTS (SELECT 1 FROM rail_attendance a WHERE a.person_id=p.id AND a.work_date=current_date AND a.check_in IS NOT NULL AND a.check_out IS NULL AND a.deleted_at IS NULL),
    (SELECT count(*) FROM rail_event_tasks t WHERE t.assigned_to=u.id AND t.status IN ('pending','in_progress') AND t.deleted_at IS NULL)
  FROM rail_people p JOIN auth.users u ON u.email = 'phone-' || p.mobile || '@radiantguard.local'
  WHERE p.role_key='cleaner' AND p.enabled AND p.deleted_at IS NULL
    AND p.valid_from<=current_date AND (p.valid_to IS NULL OR p.valid_to>=current_date)
    AND (p.scope_type='all' OR p.scope_location_id IN (SELECT public.rail_location_ancestors(loc)) OR p.home_location_id IN (SELECT public.rail_location_ancestors(loc)))
  ORDER BY 3 DESC, 4 ASC, 2
  LIMIT 5;
END $$;
GRANT EXECUTE ON FUNCTION public.rail_suggest_cleaners(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.rail_payslip_preview(_person uuid, _month date DEFAULT date_trunc('month',current_date)::date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE p record; s record; w record; days int; rate numeric; base numeric; hra numeric; bonus numeric; uni numeric; lv numeric; gross numeric; pfw numeric; pf numeric; pfer numeric; esic numeric; esicer numeric; pt numeric; lwf numeric; is_self boolean; is_mgr boolean;
BEGIN
  SELECT rp.*, l.area_class AS loc_area INTO p FROM rail_people rp LEFT JOIN rail_locations l ON l.id=rp.home_location_id WHERE rp.id=_person;
  IF NOT FOUND THEN RETURN NULL; END IF;
  is_self := EXISTS (SELECT 1 FROM auth.users u WHERE u.id=auth.uid() AND u.email='phone-'||p.mobile||'@radiantguard.local');
  is_mgr := public.rail_can('rail_billing','view');
  IF NOT is_self AND NOT is_mgr THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO s FROM rail_pay_structures WHERE role_key=p.role_key AND deleted_at IS NULL ORDER BY effective_from DESC LIMIT 1;
  SELECT * INTO w FROM rail_wage_rules WHERE skill=coalesce(p.skill,'unskilled') AND area_class=coalesce(nullif(p.loc_area,''),'A') AND deleted_at IS NULL AND effective_from<=_month AND (effective_to IS NULL OR effective_to>=_month) ORDER BY effective_from DESC LIMIT 1;
  SELECT count(*) INTO days FROM rail_attendance WHERE person_id=_person AND deleted_at IS NULL AND check_in IS NOT NULL AND work_date>=_month AND work_date<(_month + interval '1 month');
  rate := greatest(coalesce(w.total_per_day,0), coalesce(p.daily_wage,0));
  base := round(days*rate,2);
  hra := round(base*coalesce(s.hra_pct,0)/100,2); bonus := round(base*coalesce(s.bonus_pct,0)/100,2);
  uni := round(base*coalesce(s.uniform_pct,0)/100,2); lv := round(base*coalesce(s.leave_pct,0)/100,2);
  gross := base+hra+bonus+uni+lv;
  pfw := least(base, coalesce(s.pf_wage_cap,15000));
  pf := round(pfw*coalesce(s.pf_emp_pct,12)/100,0); pfer := round(pfw*coalesce(s.pf_er_pct,13)/100,0);
  esic := CASE WHEN gross>0 AND gross<=coalesce(s.esic_gross_limit,21000) THEN ceil(gross*coalesce(s.esic_emp_pct,0.75)/100) ELSE 0 END;
  esicer := CASE WHEN gross>0 AND gross<=coalesce(s.esic_gross_limit,21000) THEN ceil(gross*coalesce(s.esic_er_pct,3.25)/100) ELSE 0 END;
  pt := CASE WHEN gross>=10000 THEN coalesce(s.pt_monthly,200) ELSE 0 END;
  lwf := CASE WHEN days>0 THEN coalesce(s.lwf_monthly,0) ELSE 0 END;
  RETURN jsonb_build_object('name',p.full_name,'role',p.role_key,'days',days,'day_rate',rate,
    'basic_da',base,'hra',hra,'bonus',bonus,'uniform',uni,'leave',lv,'gross',gross,
    'pf',pf,'esic',esic,'pt',pt,'lwf',lwf,'deductions',pf+esic+pt+lwf,'net',gross-(pf+esic+pt+lwf),
    'employer_pf',CASE WHEN is_mgr THEN pfer END,'employer_esic',CASE WHEN is_mgr THEN esicer END,'ctc',CASE WHEN is_mgr THEN gross+pfer+esicer END,
    'placeholder',coalesce(s.is_placeholder,true));
END $$;
GRANT EXECUTE ON FUNCTION public.rail_payslip_preview(uuid,date) TO authenticated;