-- Field officer org chart: one call returning FO -> unit links (from both candidate_units and
-- unit-scope Mapping rows) plus active non-reliever guard counts per unit.
-- Also mirror candidate_units FO links into employee_scope_assignments so Mapping is the single reference.
begin;

insert into public.employee_scope_assignments (candidate_id, scope_type, scope_id, scope_label)
select distinct cu.candidate_id, 'unit', cu.unit_id::text, u.code || ' - ' || u.name
  from public.candidate_units cu
  join public.candidates c on c.id = cu.candidate_id and c.role_key = 'field_officer'
  join public.units u on u.id = cu.unit_id
 where not exists (select 1 from public.employee_scope_assignments s
                    where s.candidate_id = cu.candidate_id and s.scope_type = 'unit' and s.scope_id = cu.unit_id::text);

create or replace function public.fo_org_chart(_unit_ids uuid[])
returns table(kind text, unit_id uuid, candidate_id uuid, full_name text, employee_code text, status text, guards integer)
language sql stable security definer set search_path = public as $$
  with ids as (select unnest(_unit_ids) as id where auth.uid() is not null),
  links as (
    select cu.unit_id, cu.candidate_id from candidate_units cu join ids on ids.id = cu.unit_id
    union
    select s.scope_id::uuid, s.candidate_id from employee_scope_assignments s
      join ids on ids.id::text = s.scope_id where s.scope_type = 'unit'
  )
  select 'fo', l.unit_id, c.id, c.full_name, c.employee_code, c.status, null::int
    from links l join candidates c on c.id = l.candidate_id and c.role_key = 'field_officer'
  union all
  select 'guards', cu.unit_id, null, null, null, null, count(*)::int
    from candidate_units cu join ids on ids.id = cu.unit_id
    join candidates c on c.id = cu.candidate_id
   where coalesce(cu.is_reliever, false) = false
     and c.status in ('active', 'approved')
     and coalesce(c.role_key, '') not in ('field_officer', 'operations_manager')
   group by cu.unit_id
$$;
revoke all on function public.fo_org_chart(uuid[]) from public, anon;
grant execute on function public.fo_org_chart(uuid[]) to authenticated;
commit;
