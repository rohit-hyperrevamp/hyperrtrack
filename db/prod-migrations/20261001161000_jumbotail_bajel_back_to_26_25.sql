-- User correction 2026-10-01: contracts created 29–30 Sep (Jumbotail/Bajel, CLI1400 batch)
-- stay on the 26–25 payroll window; only today's work is on 1 to 30/31.
BEGIN;
UPDATE client_contracts cc SET payroll_window_id='59c7f3a7-342c-42d5-9783-9bf3b173d266', updated_at=now()
FROM units u WHERE u.id=cc.unit_id AND cc.record_type='client'
AND cc.created_at>='2026-09-29' AND cc.created_at<'2026-10-01'
AND u.code IN ('CLI2370','CLI4150','CLI3469','CLI3818','CLI3347','CLI3348','CLI4200','CLI4097','CLI3048','CLI3047','CLI3029','CLI4201','CLI3356','CLI2529','CLI294','CLI1400','CLI2029','CLI2988','CLI2905','CLI3471','CLI2906');
COMMIT;
