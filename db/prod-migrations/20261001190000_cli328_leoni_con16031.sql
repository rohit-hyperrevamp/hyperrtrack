-- CLI328 LEONI WIRING SYSTEMS (PUNE) PVT. LTD. — contract CON16031 (from contract list)
-- Rate sheet: Security SG, 26/27 payable days, billing 30/31 days, period 01/07/2026–31/12/2026
INSERT INTO public.client_contracts (
  contract_code, unit_id, start_date, end_date, description,
  service_type_id, payroll_window_id, billing_type_id, gst_option,
  status, approval_status, approved_at, record_type, prospect_stage,
  is_internal, expiry_date, original_start_date, renewal_count
) VALUES (
  'CON16031',
  '482952cf-c976-4b1d-9f5a-089e5978a53b',
  '2026-07-01', '2026-12-31',
  'LEONI WIRING SYSTEMS (PUNE) PVT. LTD. - CLI328, rate sheet 01/07/2026-31/12/2026 (Security SG billing ₹25,482.58)',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c',
  '70f409c8-2eb6-4b44-bbae-2fe15a566b6d',
  'csgst',
  'active', 'approved', now(), 'client', 'new',
  false, '2026-12-31', '2026-07-01', 0
);

INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
) VALUES (
  (SELECT id FROM public.client_contracts WHERE contract_code='CON16031'),
  'aad77ba7-98d2-44cb-a0f1-b598eed740f4',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  13,
  '[
    {"name":"Basic","amount":10021,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Special Allowance","amount":4134,"calcType":"fixed","allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA 5% (Basic+DA)","amount":707.75,"calcType":"fixed","allowanceId":"aa161330-0001-4001-8001-000000000003","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Conveyance Allowance","amount":500,"calcType":"fixed","allowanceId":"ddd82b23-d385-4f0a-99bb-4cd64ec2f973","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday 1% (Basic+DA)","amount":141.55,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Uniform Allowance","amount":300,"calcType":"fixed","allowanceId":"92303274-cd77-4692-b956-4c96622da5b1","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Leave with Wages 6% (Basic+DA)","amount":849.30,"calcType":"fixed","allowanceId":"d8d73782-3e6d-40f1-bc7e-ded960f43322","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Washing Allowance","amount":300,"calcType":"fixed","allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  16953.60,
  1,
  'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1800,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":106.16,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1950,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":460.04,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Bonus / Exgratia 8.33% (Rs.7000)","state":"N/A","amount":583.10,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"aa142900-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Gratuity 4.81% (Basic+DA)","state":"N/A","amount":680.86,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc161170-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Reliever Charges (1/6th of Total CTC)","state":"N/A","amount":3175.40,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":null,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":1667.08,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8,
  'c82178db-3864-471f-b078-1510ea49a2f9'
);
