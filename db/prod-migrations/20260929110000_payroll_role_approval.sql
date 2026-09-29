-- Payroll approval is granted by ROLE (payroll team), not by a named user.
BEGIN;
INSERT INTO public.roles (key, name, description, is_system, sort_order)
VALUES ('payroll', 'Payroll', 'Payroll team — approves unit payroll once attendance is approved. Cannot process.', false, 36)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve) VALUES
 ('payroll','dashboard','',true,false,false,false),
 ('payroll','payroll','',true,false,false,true),
 ('payroll','attendance','',true,false,false,false),
 ('payroll','employees','',true,false,false,false),
 ('payroll','my_attendance','',true,false,false,false),
 ('payroll','notification_center','',true,false,false,false),
 ('payroll','profile','',true,true,false,false)
ON CONFLICT (role_key, module_key, sub_module_key) DO UPDATE
 SET can_view=EXCLUDED.can_view, can_edit=EXCLUDED.can_edit, can_delete=EXCLUDED.can_delete, can_approve=EXCLUDED.can_approve;

-- HR no longer approves payroll (HR still approves attendance -> payroll Ready).
UPDATE public.role_permissions SET can_approve = false WHERE role_key='hr' AND module_key='payroll' AND sub_module_key='';

-- Approval step now points at the payroll role, no named user.
UPDATE public.workflow_steps s SET approver_role_key='payroll', approver_candidate_id=NULL
FROM public.workflow_definitions d WHERE d.id=s.workflow_id AND d.key='payroll_approval' AND s.key='payroll_approve';

-- Step check: named person if set, otherwise the step's role.
CREATE OR REPLACE FUNCTION public.current_user_can_approve_payroll()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user()
    OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps s
      JOIN public.workflow_definitions d ON d.id = s.workflow_id
      WHERE d.key = 'payroll_approval' AND d.is_active AND s.is_active
        AND CASE WHEN s.approver_candidate_id IS NOT NULL
                 THEN s.approver_candidate_id = public.current_user_candidate_id()
                 ELSE s.approver_role_key = public.current_user_role_key() END
    );
$$;

CREATE OR REPLACE FUNCTION public.current_user_can_process_payroll()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_user()
    OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps s
      JOIN public.workflow_definitions d ON d.id = s.workflow_id
      WHERE d.key = 'payroll_processing' AND d.is_active AND s.is_active
        AND CASE WHEN s.approver_candidate_id IS NOT NULL
                 THEN s.approver_candidate_id = public.current_user_candidate_id()
                 ELSE s.approver_role_key = public.current_user_role_key() END
    );
$$;

-- Payroll team members
UPDATE public.candidates SET role_key='payroll' WHERE employee_code IN ('48433','49464');
COMMIT;
