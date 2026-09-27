-- Create security guard Gautam Jha (employee code 49503), home unit Radiant Pune HO (UN1),
-- primary deployment at CLI3881 (Bajaj Finance Limited - Weikfield 5th Floor HO).
INSERT INTO public.candidates (
  id, full_name, employee_code, status, is_enabled, role_key,
  designation_id, unit_id, branch_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Gautam Jha',
  '49503',
  'approved',
  true,
  'guard',
  'aad77ba7-98d2-44cb-a0f1-b598eed740f4', -- Security Guard (SG)
  '0889cfb4-7fd6-44b4-bbac-7d7026e33f0f', -- UN1 Corporate Office (Pune - HO) payroll base
  '8897587c-e532-47ad-af01-353409cc6b23', -- PUNE branch
  now(), now()
)
RETURNING id, full_name, employee_code;

-- Primary unit mapping to CLI3881
INSERT INTO public.candidate_units (candidate_id, unit_id, is_primary)
SELECT c.id, 'c3a8213c-3808-45eb-985f-a0811d8c5f07', true
FROM public.candidates c
WHERE c.employee_code = '49503' AND c.full_name = 'Gautam Jha';
