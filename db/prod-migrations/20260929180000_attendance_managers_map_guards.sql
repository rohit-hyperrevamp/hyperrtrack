-- Anyone who can save attendance on a site (same rule as "Scoped insert attendance_entries":
-- HR Executives on their mapped sites, branch-scoped users on their branch) may add/edit
-- guard lines for that site from the attendance sheet.
drop policy if exists "Attendance managers add unit lines" on public.candidate_units;
create policy "Attendance managers add unit lines" on public.candidate_units
  for insert to authenticated
  with check (
    unit_id = any (coalesce((select public.current_user_unit_ids()), '{}'::uuid[]))
    or (coalesce((select public.current_user_role_key()), '') <> 'hr_executive'
        and public.is_unit_in_current_user_branch(unit_id)
        and (select public.current_user_has_branch_scope()))
  );
drop policy if exists "Attendance managers edit unit lines" on public.candidate_units;
create policy "Attendance managers edit unit lines" on public.candidate_units
  for update to authenticated
  using (
    unit_id = any (coalesce((select public.current_user_unit_ids()), '{}'::uuid[]))
    or (coalesce((select public.current_user_role_key()), '') <> 'hr_executive'
        and public.is_unit_in_current_user_branch(unit_id)
        and (select public.current_user_has_branch_scope()))
  )
  with check (
    unit_id = any (coalesce((select public.current_user_unit_ids()), '{}'::uuid[]))
    or (coalesce((select public.current_user_role_key()), '') <> 'hr_executive'
        and public.is_unit_in_current_user_branch(unit_id)
        and (select public.current_user_has_branch_scope()))
  );
