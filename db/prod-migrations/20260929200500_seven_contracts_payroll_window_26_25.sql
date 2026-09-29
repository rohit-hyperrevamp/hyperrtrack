-- Move 7 recently created contracts to the 26–25 payroll window (user request 2026-09-29).
BEGIN;
UPDATE client_contracts
SET payroll_window_id = '59c7f3a7-342c-42d5-9783-9bf3b173d266', updated_at = now()
WHERE contract_code IN ('CON16273','CON16274','CON16275','CON16276','CON16277','CON16278','CON16281');
COMMIT;
