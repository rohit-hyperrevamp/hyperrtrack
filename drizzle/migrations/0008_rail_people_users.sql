CREATE OR REPLACE FUNCTION public.rail_people_users() RETURNS TABLE(mobile text, user_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.mobile, u.id FROM rail_people p JOIN auth.users u ON u.email = 'phone-' || p.mobile || '@radiantguard.local'
  WHERE p.deleted_at IS NULL AND public.rail_can('rail_access','view')
$$;
REVOKE ALL ON FUNCTION public.rail_people_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rail_people_users() TO authenticated;