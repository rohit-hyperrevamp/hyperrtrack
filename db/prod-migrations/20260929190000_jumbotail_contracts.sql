-- Jumbotail Technologies Pune: CON16275 (CLI3047 Pimpri Chinchwad), CON16276 (CLI3048 Kondhwa)
-- Rate sheet wef Nov 2025: Security Guard 12 Hrs + Lady Security Guard 8 Hrs, 30/31 payable days.
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid; r record;
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
  ab uuid := 'e23708c1-250e-4440-b76d-1c2c63a99218';
begin
  select * into sc from client_contracts where contract_code = 'CON16273';
  for r in select * from (values ('CON16275','CLI3047'),('CON16276','CLI3048')) v(code, unit) loop
    if exists (select 1 from client_contracts where contract_code = r.code) then continue; end if;
    select id into u_id from units where code = r.unit;
    c_id := gen_random_uuid();
    insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
      'id', c_id, 'contract_code', r.code, 'unit_id', u_id,
      'description', 'JUMBOTAIL TECHNOLOGIES PUNE - ' || r.unit || ', Security Guard 12 Hrs & Lady Guard 8 Hrs, 30/31 days (wef Nov 2025)',
      'start_date', '2025-11-01', 'original_start_date', '2025-11-01',
      'end_date', '2026-10-31', 'expiry_date', '2026-10-31',
      'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
      'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0,
      'created_at', now(), 'updated_at', now()));

    insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
      payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
    values
    (gen_random_uuid(), c_id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', sc.service_type_id, 1, 12, 1, ab, ab, 23266.38, '[]',
      jsonb_build_array(
        f || '{"name":"Basic","amount":13266,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
        f || '{"name":"Special Allowance","amount":3614,"allowanceId":null}',
        f || '{"name":"Additional 4 Hours Allowance","amount":5450.06,"allowanceId":null}',
        f || '{"name":"Leave with Wages","amount":610.73,"allowanceId":null}',
        f || '{"name":"Paid Holiday","amount":325.59,"allowanceId":null}'),
      jsonb_build_array(
        d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
        d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}'),
      jsonb_build_array(
        d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
        d || '{"name":"Medical Insurance","amount":160,"costComponentId":null}',
        d || '{"name":"ESIC Employer Share / WC Policy","amount":200,"costComponentId":null}',
        d || '{"name":"Bonus 8.33%","amount":1406,"costComponentId":null}',
        d || '{"name":"Management Fees","amount":1200,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}')),
    (gen_random_uuid(), c_id, '20da0e27-c5dc-4b72-9672-a35d005f8ff2', sc.service_type_id, 1, 8, 2, ab, ab, 17816.32, '[]',
      jsonb_build_array(
        f || '{"name":"Basic","amount":13266,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
        f || '{"name":"Special Allowance","amount":3614,"allowanceId":null}',
        f || '{"name":"Leave with Wages","amount":610.73,"allowanceId":null}',
        f || '{"name":"Paid Holiday","amount":325.59,"allowanceId":null}'),
      jsonb_build_array(
        d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
        d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
        d || '{"name":"EE ESI 0.75%","amount":134,"costComponentId":"cc161330-0001-4001-8001-000000000001"}'),
      jsonb_build_array(
        d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
        d || '{"name":"ER ESI 3.25%","amount":579.03,"costComponentId":"cc161330-0001-4001-8001-000000000002"}',
        d || '{"name":"Bonus 8.33%","amount":1406,"costComponentId":null}',
        d || '{"name":"Management Fees","amount":1245.97,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
  end loop;
end $$;
