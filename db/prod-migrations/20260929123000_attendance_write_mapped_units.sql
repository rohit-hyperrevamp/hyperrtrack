-- Users could open mapped sites but not save attendance / Extra Duty:
--  * HR Executives were blocked from every write (read was mapped-scoped).
--  * Branch-scoped users (e.g. branch managers) were blocked on sites mapped
--    to them directly (unit/customer scope) that sit in another branch.
-- Writes now also allow any site in the user's mapped units.
BEGIN;
DROP POLICY IF EXISTS "Scoped insert attendance_entries" ON public.attendance_entries;
DROP POLICY IF EXISTS "Scoped update attendance_entries" ON public.attendance_entries;
DROP POLICY IF EXISTS "Scoped delete attendance_entries" ON public.attendance_entries;

CREATE POLICY "Scoped insert attendance_entries" ON public.attendance_entries
FOR INSERT TO authenticated WITH CHECK (
  (unit_id = ANY (COALESCE((SELECT public.current_user_unit_ids()), '{}'::uuid[])))
  OR ((COALESCE((SELECT public.current_user_role_key()), '') <> 'hr_executive')
      AND ((SELECT public.is_admin_user()) OR NOT (SELECT public.current_user_has_branch_scope())
           OR public.is_unit_in_current_user_branch(unit_id)))
);
CREATE POLICY "Scoped update attendance_entries" ON public.attendance_entries
FOR UPDATE TO authenticated USING (
  (unit_id = ANY (COALESCE((SELECT public.current_user_unit_ids()), '{}'::uuid[])))
  OR ((COALESCE((SELECT public.current_user_role_key()), '') <> 'hr_executive')
      AND ((SELECT public.is_admin_user()) OR NOT (SELECT public.current_user_has_branch_scope())
           OR public.is_unit_in_current_user_branch(unit_id)))
) WITH CHECK (
  (unit_id = ANY (COALESCE((SELECT public.current_user_unit_ids()), '{}'::uuid[])))
  OR ((COALESCE((SELECT public.current_user_role_key()), '') <> 'hr_executive')
      AND ((SELECT public.is_admin_user()) OR NOT (SELECT public.current_user_has_branch_scope())
           OR public.is_unit_in_current_user_branch(unit_id)))
);
CREATE POLICY "Scoped delete attendance_entries" ON public.attendance_entries
FOR DELETE TO authenticated USING (
  (unit_id = ANY (COALESCE((SELECT public.current_user_unit_ids()), '{}'::uuid[])))
  OR ((COALESCE((SELECT public.current_user_role_key()), '') <> 'hr_executive')
      AND ((SELECT public.is_admin_user()) OR NOT (SELECT public.current_user_has_branch_scope())
           OR public.is_unit_in_current_user_branch(unit_id)))
);

-- Reads: branch-scoped users also see their directly mapped sites.
DROP POLICY IF EXISTS "Scoped read attendance_entries" ON public.attendance_entries;
CREATE POLICY "Scoped read attendance_entries" ON public.attendance_entries
FOR SELECT TO authenticated USING (
  (unit_id = ANY (COALESCE((SELECT public.current_user_unit_ids()), '{}'::uuid[])))
  OR ((COALESCE((SELECT public.current_user_role_key()), '') <> 'hr_executive')
      AND ((SELECT public.is_admin_user()) OR NOT (SELECT public.current_user_has_branch_scope())
           OR public.is_unit_in_current_user_branch(unit_id)))
);
COMMIT;
