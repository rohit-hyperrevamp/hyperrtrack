-- Accounts role: account managers see only the clients where they are the
-- unit's account_manager_id. First member: Rani Kumari (48874) on Poonawalla.
begin;

insert into public.roles (key, name, description, is_system, sort_order)
values ('accounts', 'Accounts', 'Account management team — sees only the clients they manage', false, 32)
on conflict (key) do nothing;

-- Permissions: attendance + billing editable, clients/contracts view only.
delete from public.role_permissions where role_key = 'accounts';
insert into public.role_permissions (role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve) values
  ('accounts','dashboard','',true,false,false,false),
  ('accounts','organizations','',true,false,false,false),
  ('accounts','organizations','organization_manager',true,false,false,false),
  ('accounts','organizations','unit_manager',true,false,false,false),
  ('accounts','contracts','',true,false,false,false),
  ('accounts','contracts','client_contracts',true,false,false,false),
  ('accounts','attendance','',true,true,false,true),
  ('accounts','invoice','',true,true,false,false),
  ('accounts','notification_center','',true,false,false,false),
  ('accounts','my_attendance','',true,false,false,false);

-- Account-managed units join the caller's unit list.
create or replace function public.current_user_unit_ids()
 returns uuid[] language sql stable security definer set search_path to 'public'
as $function$
  WITH me AS (
    SELECT id, unit_id, role_key FROM public.candidates
    WHERE mobile = public.current_user_mobile() LIMIT 1
  ), mapped AS (
    SELECT unit_id AS id FROM me WHERE unit_id IS NOT NULL AND me.role_key IS DISTINCT FROM 'hr_executive' AND me.role_key IS DISTINCT FROM 'accounts'
    UNION
    SELECT cu.unit_id FROM public.candidate_units cu JOIN me ON cu.candidate_id = me.id WHERE cu.unit_id IS NOT NULL
    UNION
    SELECT esa.scope_id::uuid FROM public.employee_scope_assignments esa JOIN me ON esa.candidate_id = me.id
    WHERE esa.scope_type = 'unit' AND esa.scope_id ~* '^[0-9a-f-]{36}$'
    UNION
    SELECT u.id FROM public.employee_scope_assignments esa JOIN me ON esa.candidate_id = me.id
    JOIN public.units u ON u.customer_id::text = esa.scope_id
    WHERE esa.scope_type = 'customer' AND u.is_billable IS TRUE
    UNION
    SELECT u.id FROM public.units u JOIN me ON u.hr_executive_id = me.id
    UNION
    SELECT u.id FROM public.units u JOIN me ON u.account_manager_id = me.id
  )
  SELECT COALESCE(ARRAY(
    SELECT DISTINCT m.id FROM mapped m JOIN public.units u ON u.id = m.id WHERE u.is_billable IS TRUE
  ), ARRAY[]::uuid[]);
$function$;

-- Hard limits for the accounts role (restrictive = ANDed with existing policies).
drop policy if exists "accounts scope units" on public.units;
create policy "accounts scope units" on public.units as restrictive for all to authenticated
  using (coalesce((select public.current_user_role_key()),'') <> 'accounts'
         or id in (select unnest((select public.current_user_unit_ids()))));

drop policy if exists "accounts scope customers" on public.customers;
create policy "accounts scope customers" on public.customers as restrictive for select to authenticated
  using (coalesce((select public.current_user_role_key()),'') <> 'accounts'
         or id in (select u.customer_id from public.units u where u.id in (select unnest((select public.current_user_unit_ids())))));

drop policy if exists "accounts scope contracts" on public.client_contracts;
create policy "accounts scope contracts" on public.client_contracts as restrictive for all to authenticated
  using (coalesce((select public.current_user_role_key()),'') <> 'accounts'
         or unit_id in (select unnest((select public.current_user_unit_ids()))));

drop policy if exists "accounts scope attendance sheets" on public.attendance_sheets;
create policy "accounts scope attendance sheets" on public.attendance_sheets as restrictive for all to authenticated
  using (coalesce((select public.current_user_role_key()),'') <> 'accounts'
         or unit_id in (select unnest((select public.current_user_unit_ids()))));

drop policy if exists "accounts scope attendance entries" on public.attendance_entries;
create policy "accounts scope attendance entries" on public.attendance_entries as restrictive for all to authenticated
  using (coalesce((select public.current_user_role_key()),'') <> 'accounts'
         or unit_id in (select unnest((select public.current_user_unit_ids()))));

-- Rani Kumari (48874): accounts role, reports to Pandurang Patil (36017).
update public.candidates set role_key = 'accounts'
 where employee_code = '48874';
update public.candidates set reports_to = (select id from public.candidates where employee_code = '36017')
 where employee_code = '48874';
delete from public.candidate_reporting_managers
 where candidate_id = (select id from public.candidates where employee_code = '48874');
insert into public.candidate_reporting_managers (candidate_id, manager_id, is_primary, source)
select e.id, m.id, true, 'manual'
from public.candidates e, public.candidates m
where e.employee_code = '48874' and m.employee_code = '36017';

-- Account manager on every Poonawalla site.
update public.units u set account_manager_id = (select id from public.candidates where employee_code = '48874')
from public.customers c
where c.id = u.customer_id and c.name ilike 'poonawalla%';

commit;
