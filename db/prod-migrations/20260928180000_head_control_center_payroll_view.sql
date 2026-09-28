-- Head - Control Center: view-only access to Payroll (so processed bank files are visible/downloadable)
insert into public.role_permissions (role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve)
values ('control_center_head', 'payroll', '', true, false, false, false)
on conflict (role_key, module_key, sub_module_key)
do update set can_view = true, can_edit = false, can_delete = false, can_approve = false;
