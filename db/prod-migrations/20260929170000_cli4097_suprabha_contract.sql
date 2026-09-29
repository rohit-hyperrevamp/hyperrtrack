-- Suprabha Protective Products (CLI4097) contract CON16274 from the signed rate sheet
-- (Security Guard + Security Supervisor, 12 hrs, 26 payable days, billing 30/31 days).
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16274') then return; end if;
  select id into u_id from units where code = 'CLI4097';
  select * into sc from client_contracts where contract_code = 'CON16273';

  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16274', 'unit_id', u_id,
    'description', 'SUPRABHA PROTECTIVE PRODUCTS - CLI4097, Security Guard & Supervisor 12 Hrs 26 Days (rate sheet 21/03/2026)',
    'start_date', '2026-04-01', 'original_start_date', '2026-04-01',
    'end_date', '2027-03-31', 'expiry_date', '2027-03-31',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0,
    'created_at', now(), 'updated_at', now()));

  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  values
  (gen_random_uuid(), c_id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', sc.service_type_id, 1, 12, 1,
    'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96', 'bd2370a0-0001-4001-8001-000000000001', 19630.58, '[]',
    jsonb_build_array(
      f || '{"name":"Basic","amount":10021,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
      f || '{"name":"DA","amount":3614,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || '{"name":"Leave with Wages","amount":818.10,"allowanceId":null}',
      f || '{"name":"Paid Holiday 1.28% (Basic+DA)","amount":174.53,"allowanceId":null}',
      f || '{"name":"Bonus 8.33% (Basic+DA)","amount":1135.80,"allowanceId":null}',
      f || '{"name":"Uniform Allowance","amount":300,"allowanceId":"92303274-cd77-4692-b956-4c96622da5b1"}',
      f || '{"name":"Additional 4 Hours Allowance","amount":3567.15,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || '{"name":"EE ESI 0.75%","amount":102.26,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || '{"name":"ER ESI 3.25% (Basic+DA)","amount":443.14,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
      d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || '{"name":"Gratuity 4.81% (Basic+DA)","amount":655.84,"costComponentId":"cc143130-0001-4001-8001-000000000001"}',
      d || '{"name":"HRA","amount":681.75,"costComponentId":null}',
      d || '{"name":"Relieving Charges 16.67% (CTC)","amount":3896.41,"costComponentId":"cc166700-0001-4001-8001-000000000001"}',
      d || '{"name":"Management Fees 6%","amount":1636.46,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}')),
  (gen_random_uuid(), c_id, '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4', sc.service_type_id, 1, 12, 2,
    'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96', 'bd2370a0-0001-4001-8001-000000000001', 20807.66, '[]',
    jsonb_build_array(
      f || '{"name":"Basic","amount":10856,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
      f || '{"name":"DA","amount":3614,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || '{"name":"Leave with Wages","amount":868.20,"allowanceId":null}',
      f || '{"name":"Paid Holiday 1.28% (Basic+DA)","amount":185.22,"allowanceId":null}',
      f || '{"name":"Bonus 8.33% (Basic+DA)","amount":1205.35,"allowanceId":null}',
      f || '{"name":"Uniform Allowance","amount":300,"allowanceId":"92303274-cd77-4692-b956-4c96622da5b1"}',
      f || '{"name":"Additional 4 Hours Allowance","amount":3778.89,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || '{"name":"EE ESI 0.75%","amount":108.53,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || '{"name":"ER ESI 3.25% (Basic+DA)","amount":470.28,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
      d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || '{"name":"Gratuity 4.81% (Basic+DA)","amount":696.01,"costComponentId":"cc143130-0001-4001-8001-000000000001"}',
      d || '{"name":"HRA","amount":723.50,"costComponentId":null}',
      d || '{"name":"Relieving Charges 16.67% (CTC)","amount":4110.81,"costComponentId":"cc166700-0001-4001-8001-000000000001"}',
      d || '{"name":"Management Fees 6%","amount":1726.24,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
end $$;
