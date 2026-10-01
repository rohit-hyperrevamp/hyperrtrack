-- HR owns recruitment. Assigned interviewers use assignment-scoped RLS on
-- personal interview and candidate-detail routes without widening their role.

insert into public.role_permissions (
  role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve
) values (
  'hr', 'recruitment', '', true, true, false, true
)
on conflict (role_key, module_key, sub_module_key) do update set
  can_view = excluded.can_view,
  can_edit = excluded.can_edit,
  can_delete = excluded.can_delete,
  can_approve = excluded.can_approve,
  updated_at = now();