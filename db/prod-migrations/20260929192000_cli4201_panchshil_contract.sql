-- Panchshil Techpark (CLI4201) CON16278 from signed rate sheet wef 1 Jul 2026
-- Security Guard + Security Supervisor, 8 hrs, 26 payable days, billing 30 days.
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
  pb uuid := 'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96'; bb uuid := 'bd2370a0-0001-4001-8001-000000000001';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16278') then return; end if;
  select id into u_id from units where code = 'CLI4201';
  if u_id is null then raise exception 'CLI4201 not found'; end if;
  select * into sc from client_contracts where contract_code = 'CON16273';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16278', 'unit_id', u_id,
    'description', 'PANCHSHIL TECHPARK PUNE - CLI4201, Security Guard & Supervisor 8 Hrs 26 Days (wef 01/07/2026)',
    'start_date', '2026-07-01', 'original_start_date', '2026-07-01',
    'end_date', '2027-06-30', 'expiry_date', '2027-06-30',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0, 'created_at', now(), 'updated_at', now()));
  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  values
  (gen_random_uuid(), c_id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', sc.service_type_id, 1, 8, 1, pb, bb, 25708.84, '[]',
    jsonb_build_array(
      f || '{"name":"Basic","amount":13266,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
      f || '{"name":"DA","amount":4134,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || '{"name":"HRA 15%","amount":2610,"allowanceId":null}',
      f || '{"name":"Leave with Wages","amount":1449.42,"allowanceId":null}',
      f || '{"name":"Washing Allowance","amount":1000,"allowanceId":null}',
      f || '{"name":"Conveyance Allowance","amount":1800,"allowanceId":null}',
      f || '{"name":"Bonus 8.33%","amount":1449.42,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || '{"name":"EE ESI 0.75%","amount":130.50,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || '{"name":"ER ESI 3.25%","amount":565.50,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
      d || '{"name":"ER LWF - MH","amount":13,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || '{"name":"Uniform Allowance","amount":522,"costComponentId":null}',
      d || '{"name":"Relieving Charges 16.67% (CTC)","amount":4794.18,"costComponentId":"cc166700-0001-4001-8001-000000000001"}',
      d || '{"name":"Management Fees","amount":2527.48,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}')),
  (gen_random_uuid(), c_id, '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4', sc.service_type_id, 1, 8, 2, pb, bb, 26498.80, '[]',
    jsonb_build_array(
      f || '{"name":"Basic","amount":13866,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
      f || '{"name":"DA","amount":4134,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || '{"name":"HRA 15%","amount":2700,"allowanceId":null}',
      f || '{"name":"Leave with Wages","amount":1499.40,"allowanceId":null}',
      f || '{"name":"Washing Allowance","amount":1000,"allowanceId":null}',
      f || '{"name":"Conveyance Allowance","amount":1800,"allowanceId":null}',
      f || '{"name":"Bonus 8.33%","amount":1499.40,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || '{"name":"EE ESI 0.75%","amount":135,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || '{"name":"ER ESI 3.25%","amount":585,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
      d || '{"name":"ER LWF - MH","amount":13,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || '{"name":"Uniform Allowance","amount":540,"costComponentId":null}',
      d || '{"name":"Relieving Charges 16.67% (CTC)","amount":4932.12,"costComponentId":"cc166700-0001-4001-8001-000000000001"}',
      d || '{"name":"Management Fees","amount":2599.08,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
end $$;
