-- Anyone who can manage attendance for a site (HR Executives, Branch Managers, etc.
-- on their mapped sites) may add/edit guard lines for that site from the attendance sheet.
drop policy if exists "Attendance managers add unit lines" on public.candidate_units;
create policy "Attendance managers add unit lines" on public.candidate_units
  for insert to authenticated
  with check (public.current_user_can_manage_attendance_unit(unit_id));
drop policy if exists "Attendance managers edit unit lines" on public.candidate_units;
create policy "Attendance managers edit unit lines" on public.candidate_units
  for update to authenticated
  using (public.current_user_can_manage_attendance_unit(unit_id))
  with check (public.current_user_can_manage_attendance_unit(unit_id));
