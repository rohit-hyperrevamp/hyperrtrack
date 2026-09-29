-- HR Executives could fill attendance but not submit: attendance_sheets insert/update excluded them.
-- Allow them on sites mapped to them only (same rule as their attendance entries).
CREATE POLICY "HR executives write mapped attendance_sheets" ON public.attendance_sheets
  FOR INSERT TO authenticated
  WITH CHECK (COALESCE((SELECT public.current_user_role_key()), '') = 'hr_executive'
    AND unit_id IN (SELECT unnest((SELECT public.current_user_unit_ids()))));
CREATE POLICY "HR executives update mapped attendance_sheets" ON public.attendance_sheets
  FOR UPDATE TO authenticated
  USING (COALESCE((SELECT public.current_user_role_key()), '') = 'hr_executive'
    AND unit_id IN (SELECT unnest((SELECT public.current_user_unit_ids()))))
  WITH CHECK (COALESCE((SELECT public.current_user_role_key()), '') = 'hr_executive'
    AND unit_id IN (SELECT unnest((SELECT public.current_user_unit_ids()))));
