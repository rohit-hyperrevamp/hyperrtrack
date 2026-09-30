-- CLI2370 AWL Bundi (CON14295) Warehouse Guard: align with AWL Rajasthan Bundi (With ESIC) rate card.
-- Service charge 850 now sits inside Monthly Salary (22064); reliever = 1/6 of Monthly Salary (3677);
-- the old 991 management fee and 16.67% reliever lines are replaced. Total CTC per month 25742.
BEGIN;

UPDATE public.contract_resources
SET employer_contributions = (
      SELECT COALESCE(jsonb_agg(e ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(employer_contributions) WITH ORDINALITY AS t(e, ord)
      WHERE e->>'name' !~* '(reliever|management\s*fee)'
    ) || jsonb_build_array(
      jsonb_build_object(
        'name', 'Service Charge (Fixed)', 'state', 'N/A', 'amount', 850,
        'calcType', 'fixed', 'percentage', 0, 'capAmount', null, 'capFlatAmount', null,
        'baseComponents', '[]'::jsonb, 'formulaMode', 'preset', 'formulaExpression', null,
        'formulaVersion', 1, 'costComponentId', 'cc900000-0001-4001-8001-000000000002',
        'fixedCalcMethod', 'flat', 'fixedDutyDivisor', null, 'fixedDutyComponents', '[]'::jsonb,
        'deductionCalcType', 'fixed_amount'),
      jsonb_build_object(
        'name', 'Reliever Charges 1/6th (Total CTC)', 'state', 'N/A', 'amount', 3677,
        'calcType', 'percentage', 'percentage', 16.67, 'capAmount', null, 'capFlatAmount', null,
        'baseComponents', '[]'::jsonb, 'formulaMode', 'advanced', 'formulaExpression', 'total_ctc / 6',
        'formulaVersion', 1, 'costComponentId', 'cc142050-0001-4001-8001-000000000003',
        'fixedCalcMethod', 'flat', 'fixedDutyDivisor', null, 'fixedDutyComponents', '[]'::jsonb,
        'deductionCalcType', 'earned_salary')
    ),
    updated_at = now()
WHERE id = 'c12370a0-0001-4001-8001-000000000001';

UPDATE public.client_contracts
SET description = 'AWL Agri Business Ltd. - Bundi (External Warehouse): Warehouse Guard, 26 days, 12 hrs. Gross 18540, service charge 850, monthly salary 22064, reliever 1/6th 3677, total CTC per month 25742 (30 days). w.e.f. 01 Apr 2025.',
    updated_at = now()
WHERE contract_code = 'CON14295';

COMMIT;
