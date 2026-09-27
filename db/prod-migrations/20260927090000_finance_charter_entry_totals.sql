-- Invoice/Payroll charter: return attendance already grouped per
-- (unit, person, line, code) in one request instead of paging ~26k raw rows
-- through dozens of chunked Data API calls. SECURITY INVOKER keeps RLS.
create or replace function public.finance_charter_entry_totals(_unit_ids uuid[], _start date, _end date)
returns table (
  unit_id uuid,
  candidate_id uuid,
  designation_id uuid,
  shift_hours numeric,
  code text,
  days bigint,
  ot_hours numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select e.unit_id, e.candidate_id, e.designation_id, e.shift_hours::numeric, e.code,
         count(*)::bigint, coalesce(sum(e.ot_hours), 0)::numeric
  from public.attendance_entries e
  where e.unit_id = any(_unit_ids)
    and e.entry_date between _start and _end
  group by 1, 2, 3, 4, 5;
$$;

revoke all on function public.finance_charter_entry_totals(uuid[], date, date) from public;
grant execute on function public.finance_charter_entry_totals(uuid[], date, date) to authenticated;
grant execute on function public.finance_charter_entry_totals(uuid[], date, date) to service_role;
