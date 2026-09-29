-- Ritika Singh (49404): Payroll role, Payroll department, Head - Payroll; Shalini + Dnyaneshwar report to her.
BEGIN;
INSERT INTO public.designations (name, code, enabled, billable)
SELECT 'Head - Payroll', 'HEAD-PAYROLL', true, false
WHERE NOT EXISTS (SELECT 1 FROM public.designations WHERE name = 'Head - Payroll');

UPDATE public.candidates SET role_key = 'payroll',
  department_id = (SELECT id FROM public.departments WHERE name = 'Payroll'),
  designation_id = (SELECT id FROM public.designations WHERE name = 'Head - Payroll'),
  reports_to = (SELECT id FROM public.candidates WHERE employee_code = '41497')
WHERE employee_code = '49404';

-- Reporting lines: Ritika -> Atul Katre; Shalini, Dnyaneshwar -> Ritika
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.id AS cid, m.id AS mid FROM (VALUES ('49404','41497'),('48433','49404'),('49464','49404')) v(e,mg)
           JOIN public.candidates c ON c.employee_code = v.e JOIN public.candidates m ON m.employee_code = v.mg
  LOOP
    UPDATE public.candidate_reporting_managers SET is_primary = false WHERE candidate_id = r.cid AND is_primary AND manager_id <> r.mid;
    INSERT INTO public.candidate_reporting_managers (candidate_id, manager_id, is_primary, source)
    SELECT r.cid, r.mid, true, 'manual'
    WHERE NOT EXISTS (SELECT 1 FROM public.candidate_reporting_managers WHERE candidate_id = r.cid AND manager_id = r.mid);
    UPDATE public.candidate_reporting_managers SET is_primary = true WHERE candidate_id = r.cid AND manager_id = r.mid;
    UPDATE public.candidates SET reports_to = r.mid WHERE id = r.cid;
  END LOOP;
END $$;

-- Processing step stays with Ritika only; stored against the payroll role for clarity.
UPDATE public.workflow_steps s SET approver_role_key = 'payroll',
  approver_candidate_id = (SELECT id FROM public.candidates WHERE employee_code = '49404')
FROM public.workflow_definitions d WHERE d.id = s.workflow_id AND d.key = 'payroll_processing' AND s.key = 'payroll_process';
COMMIT;
