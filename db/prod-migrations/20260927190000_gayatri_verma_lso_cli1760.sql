-- Move Gayatri Verma (40338) to Lady Security Officer (LSO) at CLI1760 (CON14385)
-- so her attendance bills at the LSO rate ₹36,831.60. Backup first.

CREATE TABLE IF NOT EXISTS _bkp_gayatri_lso_20260927 AS
SELECT 'candidate' AS src, id::text AS row_id, designation_id::text AS old_designation_id, NULL::text AS extra
FROM candidates WHERE id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e'
UNION ALL
SELECT 'candidate_unit', id::text, designation_id::text, unit_id::text
FROM candidate_units WHERE candidate_id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e'
  AND unit_id = '09b3a57b-677f-40e1-9c2b-03c484d9da5f'
UNION ALL
SELECT 'attendance_entry', id::text, designation_id::text, entry_date::text
FROM attendance_entries WHERE candidate_id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e'
  AND unit_id = '09b3a57b-677f-40e1-9c2b-03c484d9da5f';

-- Her main designation
UPDATE candidates
SET designation_id = 'f4a68c00-5808-41a4-b4af-d83df1830866'
WHERE id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e';

-- Her posting line at CLI1760 (regular, not reliever)
UPDATE candidate_units
SET designation_id = 'f4a68c00-5808-41a4-b4af-d83df1830866'
WHERE candidate_id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e'
  AND unit_id = '09b3a57b-677f-40e1-9c2b-03c484d9da5f'
  AND is_reliever = false;

-- Her attendance at CLI1760 (all periods, so MIS picks up the LSO rate)
UPDATE attendance_entries
SET designation_id = 'f4a68c00-5808-41a4-b4af-d83df1830866'
WHERE candidate_id = '8ed932ef-6c45-467d-a7a2-938eb238fd5e'
  AND unit_id = '09b3a57b-677f-40e1-9c2b-03c484d9da5f';
