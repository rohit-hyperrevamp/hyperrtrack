-- Move 10 BFL contracts with no attendance from the 21–20 window to 1–30/31.
BEGIN;
CREATE TABLE IF NOT EXISTS _bkp_window_move_20260927 AS
SELECT id, contract_code, payroll_window_id FROM client_contracts
 WHERE contract_code IN ('CON16070','CON14621','CON12363','CON14668','CON16072','CON16068','CON16067','CON14388','CON16069','CON16071');
UPDATE client_contracts SET payroll_window_id='9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c', updated_at=now()
 WHERE contract_code IN ('CON16070','CON14621','CON12363','CON14668','CON16072','CON16068','CON16067','CON14388','CON16069','CON16071');
COMMIT;
