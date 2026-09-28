-- Only Super Admin / Admin (super admin console) and Leadership may create, edit or delete contracts.
UPDATE public.role_permissions
SET can_edit = false, can_delete = false
WHERE module_key = 'contracts'
  AND role_key NOT IN ('super_admin', 'admin', 'leadership');

INSERT INTO public.role_permissions (role_key, module_key, sub_module_key, can_view, can_edit, can_delete, can_approve)
SELECT 'leadership', 'contracts', s, true, true, true, true
FROM unnest(ARRAY['', 'client_contracts']) AS s
ON CONFLICT (role_key, module_key, sub_module_key)
DO UPDATE SET can_view = true, can_edit = true, can_delete = true, can_approve = true;

CREATE OR REPLACE FUNCTION public.prevent_hr_contract_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Backend jobs (no signed-in user) are allowed.
  IF auth.uid() IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF public.is_admin_user()
     OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin', 'leadership') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  RAISE EXCEPTION 'Only Super Admin or Leadership can change contracts'
    USING ERRCODE = '42501';
END;
$$;
