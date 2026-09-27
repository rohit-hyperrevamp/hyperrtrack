-- Remove 10 BFL contracts on the 1-31 window (user request 27 Sep 2026). No attendance existed.
BEGIN;
DELETE FROM public.client_contracts
WHERE payroll_window_id IN (SELECT id FROM public.payroll_windows WHERE window_start_day=1 AND window_end_day=31)
  AND contract_code IN ('CON14466','CON14595','CON14594','CON12355','CON14416','CON15193','CON14375','CON14347','CON14575','CON14456');
COMMIT;
