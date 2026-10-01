-- CLI365 TVS MOTOR CO. LTD. (LONIKAND) — CON14076; CLI367 TVS MOTORS CO. LTD. (VIMAN NAGAR) — CON14075
-- Rate sheets w.e.f. 01/12/2025: Security Guard (26 days, 8 hrs, billing ₹27,109.62);
-- Lady Security Guard (30/31 days, billing ₹29,403.09) — Viman Nagar sheet
INSERT INTO public.client_contracts (
  contract_code, unit_id, start_date, end_date, description,
  service_type_id, payroll_window_id, billing_type_id, gst_option,
  status, approval_status, approved_at, record_type, prospect_stage,
  is_internal, expiry_date, original_start_date, renewal_count
) VALUES
  ('CON14076', 'd1868508-f6a6-4df0-a281-42c0932f6b22', '2025-12-01', '2026-09-30',
   'TVS MOTOR CO. LTD. (LONIKAND) - CLI365, rate sheet w.e.f. 01/12/2025 (SG billing ₹27,109.62)',
   'b10a1dd8-116e-4c1d-856e-4b3785c04bd1', '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c',
   '70f409c8-2eb6-4b44-bbae-2fe15a566b6d', 'csgst',
   'active', 'approved', now(), 'client', 'new', false, '2026-09-30', '2025-12-01', 0),
  ('CON14075', '56dd0019-e640-4edb-9250-24c5a84741c4', '2025-12-01', '2026-09-30',
   'TVS MOTORS CO. LTD. (VIMAN NAGAR) - CLI367, rate sheet w.e.f. 01/12/2025 (SG ₹27,109.62 / LSG ₹29,403.09)',
   'b10a1dd8-116e-4c1d-856e-4b3785c04bd1', '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c',
   '70f409c8-2eb6-4b44-bbae-2fe15a566b6d', 'csgst',
   'active', 'approved', now(), 'client', 'new', false, '2026-09-30', '2025-12-01', 0);

-- Security Guard line (both sites): gross 18580, 26 payable days, 8 hrs
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
)
SELECT c.id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', 'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  c.qty,
  '[
    {"name":"Basic","amount":10021,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":4200,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA 5% (Basic+DA)","amount":711.05,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday 1% (Basic+DA)","amount":142.21,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Uniform Allowance","amount":0,"calcType":"fixed","allowanceId":"92303274-cd77-4692-b956-4c96622da5b1","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"LWW 4%","amount":568.84,"calcType":"fixed","allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Bonus","amount":1184.61,"calcType":"fixed","allowanceId":"3380efbe-759e-443a-8b8f-7dc71f5f837e","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Conveyance Allowance","amount":1077,"calcType":"fixed","allowanceId":"ddd82b23-d385-4f0a-99bb-4cd64ec2f973","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Washing Allowance","amount":675,"calcType":"fixed","allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  18580, 1,
  'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1800,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":134,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1950,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":581.90,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Gratuity 4.81% (Basic+DA)","state":"N/A","amount":0,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc161170-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Reliever Charges","state":"N/A","amount":3521,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":null,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":2464.51,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8, 'c82178db-3864-471f-b078-1510ea49a2f9'
FROM (VALUES
  ((SELECT id FROM public.client_contracts WHERE contract_code='CON14076'), 6),
  ((SELECT id FROM public.client_contracts WHERE contract_code='CON14075'), 4)
) AS c(id, qty);

-- Lady Security Guard line (Viman Nagar only): gross 19664.80, 30/31 payable days
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
) VALUES (
  (SELECT id FROM public.client_contracts WHERE contract_code='CON14075'),
  '20da0e27-c5dc-4b72-9672-a35d005f8ff2',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  1,
  '[
    {"name":"Basic","amount":10021,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":3614,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA 5% (Basic+DA)","amount":681.75,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday 1% (Basic+DA)","amount":136.35,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Uniform Allowance","amount":398.13,"calcType":"fixed","allowanceId":"92303274-cd77-4692-b956-4c96622da5b1","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"LWW 4%","amount":545.40,"calcType":"fixed","allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Bonus","amount":1135.80,"calcType":"fixed","allowanceId":"3380efbe-759e-443a-8b8f-7dc71f5f837e","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Travelling Allowance","amount":1077,"calcType":"fixed","allowanceId":"ddd82b23-d385-4f0a-99bb-4cd64ec2f973","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Washing Allowance","amount":351,"calcType":"fixed","allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Additional 01 Hours Allowance","amount":1704.38,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  19664.80, 2,
  'e23708c1-250e-4440-b76d-1c2c63a99218',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1800,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":0,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":145,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1950,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":627.70,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Gratuity 4.81% (Basic+DA)","state":"N/A","amount":655.84,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc161170-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Reliever Charges @ 16.67%","state":"N/A","amount":3819.20,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":null,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":2673,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8, 'c82178db-3864-471f-b078-1510ea49a2f9'
);
