BEGIN;

CREATE TABLE IF NOT EXISTS public._bkp_cli517_attendance_20260927
(LIKE public.attendance_entries INCLUDING ALL);

INSERT INTO public._bkp_cli517_attendance_20260927
SELECT ae.*
FROM public.attendance_entries ae
JOIN public.units u ON u.id = ae.unit_id
JOIN public.candidates c ON c.id = ae.candidate_id
WHERE u.code = 'CLI517'
  AND c.employee_code = '48557'
  AND ae.entry_date = DATE '2026-09-05'
  AND ae.code = 'P'
  AND ae.id = '82fd7ff7-c446-4f09-9c9a-a3941ba18011'
ON CONFLICT (id) DO NOTHING;

DELETE FROM public.attendance_entries
WHERE id = '82fd7ff7-c446-4f09-9c9a-a3941ba18011'
  AND unit_id = '6899a6a3-5ca2-4502-b5cc-f98f112c6137'
  AND entry_date = DATE '2026-09-05'
  AND code = 'P';

DO $$
DECLARE
  v_present integer;
BEGIN
  SELECT count(*) INTO v_present
  FROM public.attendance_entries
  WHERE unit_id = '6899a6a3-5ca2-4502-b5cc-f98f112c6137'
    AND entry_date BETWEEN DATE '2026-08-21' AND DATE '2026-09-20'
    AND code = 'P';

  IF v_present <> 383 THEN
    RAISE EXCEPTION 'CLI517 expected 383 present entries, found %', v_present;
  END IF;
END $$;

COMMIT;
