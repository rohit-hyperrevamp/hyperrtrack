-- Poonawalla postings are 8-hour shifts; AlertCheckin entries were saved with shift 0,
-- so the sheet showed a second, empty row per guard. Move them onto the 8h line.
UPDATE public.attendance_entries ae SET shift_hours = 8
FROM public.candidate_units cu, public.units u
WHERE cu.candidate_id = ae.candidate_id AND cu.unit_id = ae.unit_id AND cu.shift_hours = 8
  AND u.id = ae.unit_id AND u.customer_id = (SELECT customer_id FROM public.units WHERE code = 'CLI3372')
  AND ae.shift_hours = 0
  AND NOT EXISTS (SELECT 1 FROM public.attendance_entries x WHERE x.unit_id=ae.unit_id AND x.candidate_id=ae.candidate_id
    AND x.entry_date=ae.entry_date AND x.shift_hours=8 AND x.is_reliever=ae.is_reliever AND x.designation_id IS NOT DISTINCT FROM ae.designation_id);
