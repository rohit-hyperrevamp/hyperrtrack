-- The contract register directory returned one row per site, and the server
-- caps every response at 1,000 rows. With more than 1,000 contracted sites the
-- remaining sites (e.g. CLI293) lost their organisation/client names and could
-- not be searched. Return the whole directory as ONE jsonb array instead, so
-- the row cap never applies. The client receives the same array of objects.
DROP FUNCTION IF EXISTS public.contract_register_directory();

CREATE FUNCTION public.contract_register_directory()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY d.unit_code), '[]'::jsonb)
  FROM (
    SELECT DISTINCT u.id AS unit_id, u.code AS unit_code, u.name AS unit_name,
      u.customer_id, coalesce(c.name, '—') AS customer_name,
      coalesce(nullif(u.client_state,''), u.billing_state, '') AS unit_state,
      coalesce(nullif(u.client_city,''), u.billing_city, '') AS unit_city
    FROM public.client_contracts cc
    JOIN public.units u ON u.id = cc.unit_id
    LEFT JOIN public.customers c ON c.id = u.customer_id
    WHERE auth.uid() IS NOT NULL
      AND (public.is_admin_user() OR public.current_user_has_permission('contracts', '', 'view'))
      AND (coalesce(public.current_user_role_key(), '') <> 'hr_executive'
        OR u.id IN (SELECT unnest(public.current_user_unit_ids())))
  ) d;
$function$;

REVOKE ALL ON FUNCTION public.contract_register_directory() FROM public;
GRANT EXECUTE ON FUNCTION public.contract_register_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.contract_register_directory() TO service_role;

NOTIFY pgrst, 'reload schema';
