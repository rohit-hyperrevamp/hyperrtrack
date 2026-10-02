ALTER TABLE public.roles ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

CREATE OR REPLACE VIEW public.field_officer_scope AS
WITH links AS (
  SELECT cu.candidate_id, cu.unit_id, cu.is_primary FROM public.candidate_units cu
  UNION ALL
  SELECT c.id, c.unit_id, true FROM public.candidates c WHERE c.unit_id IS NOT NULL
)
SELECT l.candidate_id,
       u.id AS unit_id, u.name AS unit_name, u.code AS unit_code,
       u.customer_id, cu.name AS customer_name,
       u.branch_id, b.name AS branch_name,
       concat_ws(', ', NULLIF(u.client_address, ''), NULLIF(u.client_pincode, '')) AS address,
       u.latitude, u.longitude,
       bool_or(l.is_primary) AS is_primary,
       (SELECT count(*)::int FROM public.candidates g WHERE g.unit_id = u.id AND g.status = 'active') AS guard_count
FROM links l
JOIN public.candidates c ON c.id = l.candidate_id AND c.role_key = 'field_officer'
JOIN public.units u ON u.id = l.unit_id
LEFT JOIN public.customers cu ON cu.id = u.customer_id
LEFT JOIN public.branches b ON b.id = u.branch_id
GROUP BY l.candidate_id, u.id, cu.name, b.name;

REVOKE ALL ON public.field_officer_scope FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.field_officer_scope TO service_role;