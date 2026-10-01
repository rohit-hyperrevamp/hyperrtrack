-- CLI365 TVS Lonikand (CON14076): add the Lady Security Guard rate line so both
-- rate structures exist on both TVS contracts (CON14075 already has both).
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity, components, gross,
  sort_order, payroll_day_base_id, benefits, deductions, employer_contributions,
  role_key, shift_hours, billing_day_base_id
)
SELECT
  (SELECT id FROM public.client_contracts WHERE contract_code = 'CON14076'),
  src.designation_id, src.service_type_id, 1, src.components, src.gross,
  2, src.payroll_day_base_id, src.benefits, src.deductions, src.employer_contributions,
  src.role_key, src.shift_hours, src.billing_day_base_id
FROM public.contract_resources src
WHERE src.id = '8f808469-1fa0-4686-b5ab-b77bcf560424'
  AND NOT EXISTS (
    SELECT 1 FROM public.contract_resources x
    JOIN public.client_contracts c ON c.id = x.contract_id
    WHERE c.contract_code = 'CON14076'
      AND x.designation_id = src.designation_id
  );
