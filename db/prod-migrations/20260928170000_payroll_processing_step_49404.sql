-- Payroll processing is a separate data-driven step: Ritika Singh (49404) processes;
-- the approver (48433) only approves.
BEGIN;
INSERT INTO public.workflow_definitions (key, name, description, entity_type, route_path, is_active)
SELECT 'payroll_processing', 'Payroll Processing',
  'After payroll is approved, the named processor processes it.', 'payroll_runs', '/admin/payroll', true
WHERE NOT EXISTS (SELECT 1 FROM public.workflow_definitions WHERE key = 'payroll_processing');

INSERT INTO public.workflow_steps (workflow_id, step_order, key, name, description, approver_role_key, approver_candidate_id, action_label, is_active)
SELECT d.id, 1, 'payroll_process', 'Payroll Processing', 'Process the approved unit payroll.', 'hr',
  (SELECT id FROM public.candidates WHERE employee_code = '49404'), 'Process', true
FROM public.workflow_definitions d
WHERE d.key = 'payroll_processing'
  AND NOT EXISTS (SELECT 1 FROM public.workflow_steps s WHERE s.workflow_id = d.id AND s.key = 'payroll_process');

CREATE OR REPLACE FUNCTION public.current_user_can_process_payroll()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user()
    OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps s
      JOIN public.workflow_definitions d ON d.id = s.workflow_id
      WHERE d.key = 'payroll_processing' AND d.is_active AND s.is_active
        AND s.approver_candidate_id = public.current_user_candidate_id()
    );
$$;
GRANT EXECUTE ON FUNCTION public.current_user_can_process_payroll() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_payroll_run_processing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.payroll_status = 'processed' AND COALESCE(OLD.payroll_status, '') IS DISTINCT FROM 'processed'
     AND NOT public.current_user_can_process_payroll() THEN
    RAISE EXCEPTION 'Only the payroll processor can process payroll' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_payroll_run_processing ON public.payroll_runs;
CREATE TRIGGER trg_guard_payroll_run_processing BEFORE UPDATE ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION public.guard_payroll_run_processing();
COMMIT;
