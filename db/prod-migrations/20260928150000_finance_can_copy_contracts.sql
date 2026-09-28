-- Finance may create (copy) contracts, but never edit or delete them.
CREATE OR REPLACE FUNCTION public.prevent_hr_contract_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  IF public.is_admin_user()
     OR COALESCE(public.current_user_role_key(), '') IN ('super_admin', 'admin', 'leadership') THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'INSERT' AND COALESCE(public.current_user_role_key(), '') = 'finance' THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Only Super Admin or Leadership can change contracts' USING ERRCODE = '42501';
END;
$$;
