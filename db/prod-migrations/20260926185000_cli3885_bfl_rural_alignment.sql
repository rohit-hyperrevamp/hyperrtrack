-- CLI3885 is a Bajaj Finance Telangana branch. It was attached to ORG296,
-- which excluded its approved attendance from the combined BFL MIS export.
UPDATE public.units
SET
  customer_id = 'bcd3c541-ef45-4c58-90c7-b8f470196269'::uuid,
  name = 'BAJAJ FINANCE LIMITED- PATANCHERU - MEDHA HOSPITAL ROAD-(13345 (SGL))',
  client_state = 'Telangana',
  client_district = 'Sangareddy',
  client_city = 'Patancheru',
  client_pincode = '502319',
  client_address = 'Bajaj Finance Ltd, First Floor, H No 14-60, Sri Ram Nagar Colony, Patancheru Town and Mandal, Sangareddy District, 502319',
  branch_sap_code = 'TSMT4'
WHERE code = 'CLI3885';

-- Preserve the BFL Rural template's per-site fields from the supplied annexure.
INSERT INTO public.mis_unit_values (template_id, column_id, unit_id, value)
SELECT
  '11111111-2233-4455-6677-000000000163'::uuid,
  c.id,
  u.id,
  v.value
FROM public.units u
JOIN (VALUES
  ('Location Category', 'SGL'),
  ('Type of location', 'Med Town'),
  ('Dpl Type Permanent/  Temporary', 'Permanent'),
  ('STP', 'MH01'),
  ('BP', 'MH27'),
  ('Vendor GST No.', '27AAECR2832A1ZT'),
  ('Vendor Code', '0001004695_BAFL')
) AS v(header, value) ON true
JOIN public.mis_template_columns c
  ON c.template_id = '11111111-2233-4455-6677-000000000163'::uuid
 AND c.header = v.header
WHERE u.code = 'CLI3885'
ON CONFLICT (column_id, unit_id)
DO UPDATE SET value = EXCLUDED.value, updated_at = now();