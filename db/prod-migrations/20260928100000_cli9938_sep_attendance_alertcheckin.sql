-- CLI9938 Mavdi Road: Sep 1-27 2026 attendance from AlertCheckin check-ins (Girish Sadhu 42359)
INSERT INTO public.attendance_entries (unit_id,candidate_id,entry_date,code,designation_id,shift_hours,is_reliever)
SELECT 'ad8a02da-acfe-4984-8f96-f959a0ac6fbd','d87a761d-f28d-4c15-9fb1-b6d7745fb9c4',d::date,'P','aad77ba7-98d2-44cb-a0f1-b598eed740f4',0,false
FROM unnest(ARRAY['2026-09-01','2026-09-07','2026-09-08','2026-09-09','2026-09-10','2026-09-11','2026-09-12','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-21','2026-09-22','2026-09-23','2026-09-24','2026-09-25','2026-09-26']) d
WHERE NOT EXISTS (SELECT 1 FROM public.attendance_entries e WHERE e.unit_id='ad8a02da-acfe-4984-8f96-f959a0ac6fbd' AND e.candidate_id='d87a761d-f28d-4c15-9fb1-b6d7745fb9c4' AND e.entry_date=d::date);
