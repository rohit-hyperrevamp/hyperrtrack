-- Venkys (FC Rd, JM Rd & Vimannagar) 8 Hrs SG rate sheet: CLI384 CON14055, CLI371 CON14040, CLI383 CON14039
INSERT INTO public.client_contracts (contract_code, unit_id, start_date, end_date, description, service_type_id, payroll_window_id, billing_type_id, gst_option, status, approval_status, approved_at, record_type, prospect_stage, is_internal, expiry_date, original_start_date, renewal_count) VALUES
('CON14055','3152c4f9-3868-440b-a68f-562f95893d8e','2025-11-01','2026-09-30','VENKY''S (INDIA) LTD. (VIMAN NAGAR) - CLI384 - Venkys (FC Rd, JM Rd & Vimannagar) 8 Hrs rate sheet w.e.f. 01/11/2025 (SG billing ₹14,186.81)','b10a1dd8-116e-4c1d-856e-4b3785c04bd1','9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c','70f409c8-2eb6-4b44-bbae-2fe15a566b6d','csgst','active','approved',now(),'client','new',false,'2026-09-30','2025-11-01',0),
('CON14040','66cd1955-d6a1-4b44-bac0-3142b02e2c10','2025-11-01','2026-10-31','VENKY EXPRESS- F.C.ROAD - CLI371 - Venkys (FC Rd, JM Rd & Vimannagar) 8 Hrs rate sheet w.e.f. 01/11/2025 (SG billing ₹14,186.81)','b10a1dd8-116e-4c1d-856e-4b3785c04bd1','9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c','70f409c8-2eb6-4b44-bbae-2fe15a566b6d','csgst','active','approved',now(),'client','new',false,'2026-10-31','2025-11-01',0),
('CON14039','06b36cb7-0315-4255-99aa-2ef521905958','2025-11-01','2026-11-30','VENKATESHWARA HATCHERIES PVT. LTD. SALES OFFICE - CLI383 - Venkys (FC Rd, JM Rd & Vimannagar) 8 Hrs rate sheet w.e.f. 01/11/2025 (SG billing ₹14,186.81)','b10a1dd8-116e-4c1d-856e-4b3785c04bd1','9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c','70f409c8-2eb6-4b44-bbae-2fe15a566b6d','csgst','active','approved',now(),'client','new',false,'2026-11-30','2025-11-01',0);

INSERT INTO public.contract_resources (
  contract_id, designation_id, service_type_id, quantity,
  components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions,
  shift_hours, billing_day_base_id
)
SELECT
  c.id,
  'aad77ba7-98d2-44cb-a0f1-b598eed740f4',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1',
  c.qty,
  '[
    {"name":"Basic","amount":10021,"calcType":"fixed","allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"D.A.","amount":390,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"HRA","amount":0,"calcType":"fixed","allowanceId":"c22f90cd-5a7f-45de-9b1e-755d9a162d6f","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Bonus","amount":583,"calcType":"fixed","allowanceId":"3380efbe-759e-443a-8b8f-7dc71f5f837e","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Paid Holiday","amount":104.11,"calcType":"fixed","allowanceId":"10b07374-0106-40c2-9b83-dfa9881c9989","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Special Allowance","amount":0,"calcType":"fixed","allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Washing Allowance","amount":0,"calcType":"fixed","allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null},
    {"name":"Exgratia","amount":0,"calcType":"fixed","allowanceId":null,"formulaMode":"preset","includeInOt":true,"formulaVersion":1,"formulaExpression":null}
  ]'::jsonb,
  11098.11,
  1,
  'e23708c1-250e-4440-b76d-1c2c63a99218',
  '[]'::jsonb,
  '[
    {"name":"EE EPF 12% (cap 15000)","state":"N/A","amount":1249.32,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000001","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE Professional Tax","state":"N/A","amount":200,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"EE ESI 0.75%","state":"N/A","amount":83.24,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000003","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  '[
    {"name":"ER EPF 13% (cap 15000)","state":"N/A","amount":1353.43,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc113290-0001-4001-8001-000000000002","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER ESI 3.25%","state":"N/A","amount":360.69,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"cc130430-0001-4001-8001-000000000004","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"ER LWF - MH","state":"N/A","amount":12.50,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]},
    {"name":"Management Fee","state":"N/A","amount":1257.98,"calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf","fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}
  ]'::jsonb,
  8,
  'c82178db-3864-471f-b078-1510ea49a2f9'
FROM (SELECT id, CASE contract_code WHEN 'CON14055' THEN 1 WHEN 'CON14040' THEN 3 ELSE 2 END qty FROM public.client_contracts WHERE contract_code IN ('CON14055','CON14040','CON14039')) c;
