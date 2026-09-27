-- Create security guard Swapnil Panchal (employee code 42990), home unit Radiant Pune HO (UN1).
INSERT INTO public.candidates (
  id, full_name, employee_code, status, is_enabled, role_key,
  designation_id, unit_id, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Swapnil Panchal',
  '42990',
  'approved',
  true,
  'guard',
  'aad77ba7-98d2-44cb-a0f1-b598eed740f4', -- Security Guard (SG)
  '0889cfb4-7fd6-44b4-bbac-7d7026e33f0f', -- UN1 Corporate Office (Pune - HO) payroll base
  now(), now()
)
RETURNING id, full_name, employee_code;
