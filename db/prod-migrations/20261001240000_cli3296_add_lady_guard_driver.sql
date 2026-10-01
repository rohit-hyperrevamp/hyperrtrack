BEGIN;
-- CLI3296 Alfa Laval ICC (CON16103): add Lady Guard + Driver lines from the shared Alfa Laval rate sheets (copied from CON16102), qty 1
INSERT INTO public.contract_resources (contract_id, designation_id, service_type_id, quantity, components, gross, sort_order, payroll_day_base_id, benefits, deductions, employer_contributions, shift_hours, billing_day_base_id)
SELECT 'aafcac24-aca4-417d-a0c3-795fa782567e', cr.designation_id, cr.service_type_id, 1, cr.components, cr.gross, 10+cr.sort_order, cr.payroll_day_base_id, cr.benefits, cr.deductions, cr.employer_contributions, cr.shift_hours, cr.billing_day_base_id
FROM public.contract_resources cr JOIN public.designations d ON d.id=cr.designation_id
WHERE cr.contract_id='93f268bc-a7b4-4d3a-9628-beb141ae9d4d' AND d.name IN ('Lady Guard','Driver')
AND NOT EXISTS (SELECT 1 FROM public.contract_resources x WHERE x.contract_id='aafcac24-aca4-417d-a0c3-795fa782567e' AND x.designation_id=cr.designation_id);
COMMIT;
