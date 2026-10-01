-- User request 2026-10-01: the four Bajel sites (CLI3400, CLI3402, CLI4374, CLI4396) go on the 1 to 30/31 window.
BEGIN;
UPDATE client_contracts SET payroll_window_id='9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c', updated_at=now()
WHERE contract_code IN ('CON14894','CON14895','CON16048','CON16065');
COMMIT;
