-- ot_hours stores Extra Duty in DAYS (screens multiply by shift length).
-- Sep 2026 CLI9938 rows were written as hours; convert to days on the 8h shift.
CREATE TABLE IF NOT EXISTS public._bkp_cli9938_ot_20260928 AS
SELECT ae.* FROM public.attendance_entries ae JOIN public.units u ON u.id = ae.unit_id
WHERE u.code = 'CLI9938' AND ae.entry_date BETWEEN '2026-09-01' AND '2026-09-27';
UPDATE public.attendance_entries ae SET ot_hours = ae.ot_hours / 8
FROM public.units u
WHERE u.id = ae.unit_id AND u.code = 'CLI9938'
  AND ae.entry_date BETWEEN '2026-09-01' AND '2026-09-27' AND ae.ot_hours > 0;
