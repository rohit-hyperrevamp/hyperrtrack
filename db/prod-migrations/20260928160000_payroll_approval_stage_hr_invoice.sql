-- 1) Shalini (48433) reports to Atul Katre (41497)
UPDATE public.candidate_reporting_managers SET is_primary = false
 WHERE candidate_id = 'cd343fd0-9e1c-492e-bf10-a7077fc52bf0' AND is_primary;
INSERT INTO public.candidate_reporting_managers (candidate_id, manager_id, is_primary, source)
SELECT 'cd343fd0-9e1c-492e-bf10-a7077fc52bf0', '2190ceba-2a65-4e31-8c3e-ef6039638cee', true, 'manual'
WHERE NOT EXISTS (SELECT 1 FROM public.candidate_reporting_managers
  WHERE candidate_id = 'cd343fd0-9e1c-492e-bf10-a7077fc52bf0' AND manager_id = '2190ceba-2a65-4e31-8c3e-ef6039638cee');
UPDATE public.candidate_reporting_managers SET is_primary = true
 WHERE candidate_id = 'cd343fd0-9e1c-492e-bf10-a7077fc52bf0' AND manager_id = '2190ceba-2a65-4e31-8c3e-ef6039638cee';
UPDATE public.candidates SET reports_to = '2190ceba-2a65-4e31-8c3e-ef6039638cee'
 WHERE id = 'cd343fd0-9e1c-492e-bf10-a7077fc52bf0';

-- 2) All HR staff can view Invoice (also unlocks the leadership P&L cards on the dashboard)
INSERT INTO public.role_permissions (role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve)
VALUES ('hr', 'invoice', '', true, false, false, false)
ON CONFLICT (role_key, module_key, sub_module_key) DO UPDATE SET can_view = true;

-- 3) Payroll approval: data-driven approver (a named employee) on a workflow step
ALTER TABLE public.workflow_steps ADD COLUMN IF NOT EXISTS approver_candidate_id uuid;

INSERT INTO public.workflow_definitions (key, name, description, entity_type, route_path, is_active)
SELECT 'payroll_approval', 'Payroll Approval',
  'Once attendance is approved the payroll is Ready; the named approver approves it; it can then be processed.',
  'payroll_runs', '/admin/payroll', true
WHERE NOT EXISTS (SELECT 1 FROM public.workflow_definitions WHERE key = 'payroll_approval');

INSERT INTO public.workflow_steps (workflow_id, step_order, key, name, description, approver_role_key, approver_candidate_id, action_label, is_active)
SELECT d.id, 1, 'payroll_approve', 'Payroll Approval', 'Approve the unit payroll for processing.', 'hr',
  'cd343fd0-9e1c-492e-bf10-a7077fc52bf0', 'Approve', true
FROM public.workflow_definitions d
WHERE d.key = 'payroll_approval'
  AND NOT EXISTS (SELECT 1 FROM public.workflow_steps s WHERE s.workflow_id = d.id AND s.key = 'payroll_approve');

CREATE OR REPLACE FUNCTION public.current_user_can_approve_payroll()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user()
    OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps s
      JOIN public.workflow_definitions d ON d.id = s.workflow_id
      WHERE d.key = 'payroll_approval' AND d.is_active AND s.is_active
        AND s.approver_candidate_id = public.current_user_candidate_id()
    );
$$;
GRANT EXECUTE ON FUNCTION public.current_user_can_approve_payroll() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_payroll_run_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.status = 'approved' AND COALESCE(OLD.status, '') <> 'approved' THEN
    IF NOT public.current_user_can_approve_payroll() THEN
      RAISE EXCEPTION 'Only the payroll approver can approve payroll' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.attendance_sheets a
       WHERE a.unit_id = NEW.unit_id AND a.period_start = NEW.period_start
         AND a.period_end = NEW.period_end AND a.status = 'approved') THEN
      RAISE EXCEPTION 'Attendance must be approved before payroll can be approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_payroll_run_approval ON public.payroll_runs;
CREATE TRIGGER guard_payroll_run_approval BEFORE INSERT OR UPDATE OF status ON public.payroll_runs
FOR EACH ROW EXECUTE FUNCTION public.guard_payroll_run_approval();
