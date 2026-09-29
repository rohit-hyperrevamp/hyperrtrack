-- Ventive Hospitality (CLI4200) contract CON16273 from the signed rate sheet
-- (Security Guard, 8 hrs, 26 payable days, billing for 30 days, 1-to-month-end window).
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16273') then return; end if;
  select id into u_id from units where code = 'CLI4200';
  select * into sc from client_contracts where contract_code = 'CON16225';

  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16273', 'unit_id', u_id,
    'description', 'VENTIVE HOSPITALITY - CLI4200, Security Guard 8 Hrs 26 Days (rate sheet 01/01/2026)',
    'start_date', '2026-01-01', 'original_start_date', '2026-01-01',
    'end_date', '2026-12-31', 'expiry_date', '2026-12-31',
    'payroll_window_id', '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c', 'gst_option', 'csgst',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0,
    'created_at', now(), 'updated_at', now()));

  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  values (gen_random_uuid(), c_id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', sc.service_type_id, 1, 8, 1,
    'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96', 'bd2370a0-0001-4001-8001-000000000001', 25894.17, '[]',
    jsonb_build_array(
      f || '{"name":"Basic","amount":13266,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
      f || '{"name":"DA","amount":3900,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || '{"name":"HRA 15% (Basic+DA)","amount":2574.90,"allowanceId":"c22f90cd-5a7f-45de-9b1e-755d9a162d6f"}',
      f || '{"name":"Travelling Allowance","amount":1800,"allowanceId":null}',
      f || '{"name":"Washing Allowance","amount":1000,"allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","includeInOt":false}',
      f || '{"name":"Skill Allowance","amount":700,"allowanceId":"5c82ab94-a77c-4ea6-8237-4e051496cebb"}',
      f || '{"name":"Uniform Allowance","amount":365.04,"allowanceId":"92303274-cd77-4692-b956-4c96622da5b1"}',
      f || '{"name":"Bonus 8.33% (Basic+DA)","amount":1429.93,"allowanceId":null}',
      f || '{"name":"LWW 4% (Basic+DA)","amount":686.64,"allowanceId":null}',
      f || '{"name":"Paid Holiday 1% (Basic+DA)","amount":171.66,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (Basic+DA)","amount":2059.92,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || '{"name":"EE ESI 0.75% (Basic+DA)","amount":128.75,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (Basic+DA)","amount":2231.58,"costComponentId":null}',
      d || '{"name":"ER ESI 3.25% (Basic+DA)","amount":557.90,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
      d || '{"name":"Gratuity 4% (Basic+DA)","amount":686.64,"costComponentId":"cc143130-0001-4001-8001-000000000001"}',
      d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || '{"name":"Levy 3%","amount":514.98,"costComponentId":"cc152250-0001-4001-8001-000000000005"}',
      d || '{"name":"Relieving Charges 16.67% (CTC)","amount":4983.96,"costComponentId":"cc166700-0001-4001-8001-000000000001"}',
      d || '{"name":"Management Fees","amount":2790.54,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
end $$;
