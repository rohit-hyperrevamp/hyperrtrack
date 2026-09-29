-- Per-unit attendance coverage for units with an active contract, visible to the caller (RLS applies: security invoker).
create or replace function public.unit_attendance_coverage(_from date, _to date)
returns table(unit_id uuid, unit_code text, unit_name text, days_marked bigint, staff_marked bigint)
language sql stable security invoker set search_path = public as $$
  select u.id, u.code, u.name,
         count(a.id) filter (where a.code <> '' or a.ot_hours > 0),
         count(distinct a.candidate_id)
  from units u
  left join attendance_entries a on a.unit_id = u.id and a.entry_date between _from and _to
  where exists (select 1 from client_contracts k where k.unit_id = u.id and k.status = 'active')
  group by u.id, u.code, u.name
$$;
grant execute on function public.unit_attendance_coverage(date, date) to authenticated;
