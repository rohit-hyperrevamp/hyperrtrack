-- CLI1597 (CON14463): SG line wrongly carried Bouncer pricing (25,743.67).
-- SG back to Gujarat Zone I Urban 22,925.25; add a separate Bouncer line at
-- 25,743.67; move 32761 (Bhatt Bhupendrabhai) to Bouncer incl. Sep attendance.
BEGIN;
CREATE TABLE IF NOT EXISTS public._bkp_cli1597_cr_20260927 AS
  SELECT * FROM public.contract_resources WHERE contract_id='348471c4-bd1f-4058-9cf6-cb633f92ff8d';

INSERT INTO public.contract_resources (contract_id,designation_id,service_type_id,quantity,components,gross,sort_order,payroll_day_base_id,benefits,deductions,employer_contributions,role_key,shift_hours,billing_day_base_id)
SELECT contract_id,'0ec2821e-3d7a-47d5-b68c-d6e4daf378b4',service_type_id,1,components,gross,2,payroll_day_base_id,benefits,deductions,employer_contributions,role_key,shift_hours,billing_day_base_id
FROM public.contract_resources WHERE id='7d966e9e-e7fa-407f-a3c1-10346f822a25'
  AND NOT EXISTS (SELECT 1 FROM public.contract_resources WHERE contract_id='348471c4-bd1f-4058-9cf6-cb633f92ff8d' AND designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4');

UPDATE public.contract_resources s
   SET employer_contributions = r.employer_contributions, updated_at=now()
  FROM public.contract_resources r
 WHERE s.id='7d966e9e-e7fa-407f-a3c1-10346f822a25' AND r.id='66a9f7a3-abd4-4f2d-aaf0-d592f703e82d';

UPDATE public.candidate_units cu SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4', updated_at=now()
  FROM public.candidates c
 WHERE c.id=cu.candidate_id AND c.employee_code='32761' AND cu.unit_id='2c88f45f-819e-4935-84c1-19289e763cc4';

UPDATE public.attendance_entries ae SET designation_id='0ec2821e-3d7a-47d5-b68c-d6e4daf378b4'
  FROM public.candidates c
 WHERE c.id=ae.candidate_id AND c.employee_code='32761' AND ae.unit_id='2c88f45f-819e-4935-84c1-19289e763cc4';
COMMIT;
