CREATE OR REPLACE FUNCTION public.get_field_scope_for(_candidate_id uuid)
 RETURNS TABLE(unit_id uuid, unit_name text, unit_code text, customer_id uuid, customer_name text, branch_id uuid, branch_name text, address text, latitude numeric, longitude numeric, is_primary boolean, guard_count integer)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF _candidate_id IS NULL THEN RETURN; END IF;
  IF NOT (
    _candidate_id = public.current_user_candidate_id()
    OR public.is_admin_user()
    OR public.current_user_has_permission('field_sense','day_patrol','view')
    OR public.current_user_has_permission('field_sense','dashboard','view')
  ) THEN RETURN; END IF;
  RETURN QUERY
  SELECT f.unit_id, f.unit_name, f.unit_code, f.customer_id, f.customer_name,
         f.branch_id, f.branch_name, f.address, f.latitude, f.longitude,
         f.is_primary, f.guard_count
  FROM public.field_officer_scope f
  WHERE f.candidate_id = _candidate_id
  ORDER BY f.is_primary DESC, f.unit_name;
END;
$$;
REVOKE ALL ON FUNCTION public.get_field_scope_for(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_field_scope_for(uuid) TO authenticated;
