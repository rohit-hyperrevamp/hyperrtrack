-- CLI394 VENKY'S (INDIA) LTD. (OIL SEED DIV) SOLAPUR — CON16066 (from contract list, 1 Jul 2026 - 31 Dec 2026, Active)
-- Rate sheets: Venkys 8 Hrs (Solapur), 30/31 payable days, WEF 1 Apr 2026
--   Security SG:     gross 13,406 / billing 17,062.97 / mgmt fee 1,613
--   Head Guard:      gross 14,413 / billing 18,347.87 / mgmt fee 1,738
--   Security Officer: gross 17,999 / billing 22,585.16 / mgmt fee 2,210
INSERT INTO public.client_contracts (
  contract_code, unit_id, start_date, end_date, description,
  service_type_id, payroll_window_id, billing_type_id, gst_option,
  status, approval_status, approved_at, record_type, prospect_stage,
  is_internal, expiry_date, original_start_date, renewal_count
) VALUES (
  'CON16066',
  '0e9897cf-bf60-41c8-8856-26cc9a02021d',
  '2026-07-01', '2026-12-31',
  'Venky''s (India) Ltd. (Oil Seed Div) Solapur - CLI394, Venkys 8 Hrs Solapur rate sheets WEF 1 Apr 2026 (SG ₹17,062.97 / Head Guard ₹18,347.87 / Security Officer ₹22,585.16)',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c',
  '70f409c8-2eb6-4b44-bbae-2fe15a566b6d',
  'csgst',
  'active', 'approved', now(), 'client', 'new',
  false, '2026-12-31', '2026-07-01', 0
);

-- Security SG (qty 40 = guards currently posted)
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
) VALUES (
  (SELECT id FROM public.client_contracts WHERE contract_code='CON16066'),
  'aad77ba7-98d2-44cb-a0f1-b598eed740f4',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  40,
  '[
    {"name":"Basic","amount":10021,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":1092,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA","amount":555.65,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday","amount":144.47,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"LWW","amount":666.78,"calcType":"fixed","allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Education Allowance","amount":0,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Skill Allowance","amount":0,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Exgratia","amount":925.71,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  13406,
  1,
  'e23708c1-250e-4440-b76d-1c2c63a99218',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1542,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":83,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1670.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":361.20,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":1613,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8,
  'c82178db-3864-471f-b078-1510ea49a2f9'
);

-- Head Guard (qty 1 = head guard currently posted)
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
) VALUES (
  (SELECT id FROM public.client_contracts WHERE contract_code='CON16066'),
  '716031f4-4dd1-4eb4-a154-c452f1a439c2',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  1,
  '[
    {"name":"Basic","amount":10856,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":1092,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA","amount":597.40,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday","amount":155.32,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"LWW","amount":716.88,"calcType":"fixed","allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Education Allowance","amount":0,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Skill Allowance","amount":0,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Exgratia","amount":995.27,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  14413,
  2,
  'e23708c1-250e-4440-b76d-1c2c63a99218',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1658,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":90,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1796,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":388.30,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":1738,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8,
  'c82178db-3864-471f-b078-1510ea49a2f9'
);

-- Security Officer (qty 1 — none posted; sheet gives no headcount)
INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
) VALUES (
  (SELECT id FROM public.client_contracts WHERE contract_code='CON16066'),
  'c1f7c7a9-6fca-4166-87fd-6a2e22f1afe9',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  1,
  '[
    {"name":"Basic","amount":11632,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":1092,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA","amount":636.20,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday","amount":165.41,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"LWW","amount":763.44,"calcType":"fixed","allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Education Allowance","amount":1000,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Skill Allowance","amount":1650,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Exgratia","amount":1059.91,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  17999,
  3,
  'e23708c1-250e-4440-b76d-1c2c63a99218',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1800,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":95,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1950,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":413.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":2210,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8,
  'c82178db-3864-471f-b078-1510ea49a2f9'
);
