-- CLI2779 (Pune Fountain Head 3, 14th Flr): add Security Officer line at ₹36,831.60
-- and move Dipak Suresh Pagare (29223) onto it. Backup first.

CREATE TABLE IF NOT EXISTS _bkp_dipak_so_20260927 AS
SELECT 'candidate' AS src, id::text AS row_id, designation_id::text AS old_designation_id, NULL::text AS extra
FROM candidates WHERE id = '59c76b17-a282-4224-94b1-90332c712b0b'
UNION ALL
SELECT 'candidate_unit', id::text, designation_id::text, unit_id::text
FROM candidate_units WHERE candidate_id = '59c76b17-a282-4224-94b1-90332c712b0b'
  AND unit_id = '086bc2d5-0615-482e-bc06-d6ed0a6cba8e'
UNION ALL
SELECT 'attendance_entry', id::text, designation_id::text, entry_date::text
FROM attendance_entries WHERE candidate_id = '59c76b17-a282-4224-94b1-90332c712b0b'
  AND unit_id = '086bc2d5-0615-482e-bc06-d6ed0a6cba8e';

-- New Security Officer contract line: exact copy of the ₹36,831.60 LSO rate card
INSERT INTO contract_resources (
  contract_id, designation_id, service_type_id, quantity, components, gross,
  sort_order, payroll_day_base_id, benefits, deductions, employer_contributions,
  role_key, shift_hours, billing_day_base_id
)
SELECT
  '28803908-7b2e-447b-bd58-d7c561f4f134',
  'c1f7c7a9-6fca-4166-87fd-6a2e22f1afe9', -- Security Officer
  service_type_id, quantity, components, gross,
  sort_order, payroll_day_base_id, benefits, deductions, employer_contributions,
  NULL, shift_hours, billing_day_base_id
FROM contract_resources
WHERE id = 'd0011492-c380-41dd-883c-9f1fa8ecf146';

-- His main designation
UPDATE candidates
SET designation_id = 'c1f7c7a9-6fca-4166-87fd-6a2e22f1afe9'
WHERE id = '59c76b17-a282-4224-94b1-90332c712b0b';

-- His regular posting line at CLI2779
UPDATE candidate_units
SET designation_id = 'c1f7c7a9-6fca-4166-87fd-6a2e22f1afe9'
WHERE candidate_id = '59c76b17-a282-4224-94b1-90332c712b0b'
  AND unit_id = '086bc2d5-0615-482e-bc06-d6ed0a6cba8e'
  AND is_reliever = false;

-- His attendance at CLI2779 (all periods)
UPDATE attendance_entries
SET designation_id = 'c1f7c7a9-6fca-4166-87fd-6a2e22f1afe9'
WHERE candidate_id = '59c76b17-a282-4224-94b1-90332c712b0b'
  AND unit_id = '086bc2d5-0615-482e-bc06-d6ed0a6cba8e';
