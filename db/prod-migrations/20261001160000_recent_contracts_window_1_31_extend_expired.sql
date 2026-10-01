-- User request 2026-10-01: all recently created/updated client contracts go on the
-- 1 to 30/31 payroll window; any already expired (end before today or blank) end on 1 Dec 2026.
BEGIN;
CREATE TEMP TABLE recent_cc AS
SELECT id FROM client_contracts
WHERE record_type='client' AND (created_at>='2026-09-29' OR updated_at>='2026-10-01');
UPDATE client_contracts SET end_date='2026-12-01', expiry_date='2026-12-01', updated_at=now()
WHERE id IN (SELECT id FROM recent_cc) AND (end_date IS NULL OR end_date < '2026-10-01');
UPDATE client_contracts SET payroll_window_id='9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c', updated_at=now()
WHERE id IN (SELECT id FROM recent_cc) AND payroll_window_id IS DISTINCT FROM '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c';
COMMIT;
