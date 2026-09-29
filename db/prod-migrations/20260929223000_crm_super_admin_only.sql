-- Sales & Marketing CRM is Super Admin-only until roles are explicitly granted
-- the `sales_marketing` RBAC module. Plain admins are no longer included.
create or replace function public.current_user_can_crm()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role_key(), '') = 'super_admin'
      or exists (select 1 from auth.users u where u.id = auth.uid() and u.email = 'phone-8373914073@radiantguard.local')
      or public.current_user_has_permission('sales_marketing', '', 'view');
$$;
