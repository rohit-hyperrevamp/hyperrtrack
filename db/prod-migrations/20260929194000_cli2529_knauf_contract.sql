-- Knauf Ceiling Solutions (CLI2529) CON16280 from signed rate sheets (01/01/2026-30/06/2026).
-- Head Guard + Security Guard, 8 hrs, 26 payable days, Management Fees 10%, no reliever.
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16280') then return; end if;
  select id into u_id from units where code = 'CLI2529';
  select * into sc from client_contracts where contract_code = 'CON16273';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16280', 'unit_id', u_id,
    'description', 'KNAUF CEILING SOLUTIONS (TAKWE) PUNE - CLI2529, Head Guard & Security Guard 8 Hrs 26 Days (rate sheet 01/01/2026)',
    'start_date', '2026-01-01', 'original_start_date', '2026-01-01',
    'end_date', '2026-12-31', 'expiry_date', '2026-12-31',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0, 'created_at', now(), 'updated_at', now()));
  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  select gen_random_uuid(), c_id, v.des, sc.service_type_id, 1, 8, v.ord,
    'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96', 'abea52aa-6151-4d0a-9209-f102d3ecf226', v.gross, '[]',
    jsonb_build_array(
      f || jsonb_build_object('name','Basic','amount',v.basic,'allowanceId','44e4177f-b612-44ac-9b4b-227da493a4c9'),
      f || '{"name":"DA","amount":3900,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
      f || jsonb_build_object('name','HRA 15%','amount',v.hra,'allowanceId',null),
      f || '{"name":"Conveyance Allowance","amount":1800,"allowanceId":null}',
      f || '{"name":"Washing Allowance","amount":1000,"allowanceId":null}',
      f || jsonb_build_object('name','Uniform Allowance','amount',v.uni,'allowanceId','92303274-cd77-4692-b956-4c96622da5b1'),
      f || jsonb_build_object('name','Skill Allowance','amount',v.skill,'allowanceId',null)),
    jsonb_build_array(
      d || jsonb_build_object('name','EE EPF 12% (Gross - HRA)','amount',v.pf,'costComponentId',null),
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || jsonb_build_object('name','EE ESI 0.75%','amount',v.eesi,'costComponentId','cc161330-0001-4001-8001-000000000001')),
    jsonb_build_array(
      d || jsonb_build_object('name','ER EPF 13% (Total A)','amount',v.erpf,'costComponentId',null),
      d || jsonb_build_object('name','ER ESI 3.25%','amount',v.eresi,'costComponentId','cc161330-0001-4001-8001-000000000002'),
      d || jsonb_build_object('name','Leave with Wages 6% (Total A)','amount',v.lww,'costComponentId',null),
      d || jsonb_build_object('name','Bonus 8.33% (Total A)','amount',v.bonus,'costComponentId',null),
      d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || jsonb_build_object('name','Gratuity 4.81% (Basic+DA)','amount',v.grat,'costComponentId','cc143130-0001-4001-8001-000000000001'),
      d || jsonb_build_object('name','National Holiday 1% (Total A)','amount',v.nh,'costComponentId',null),
      d || jsonb_build_object('name','Guard Board Levy 3% (Total A)','amount',v.levy,'costComponentId',null),
      d || jsonb_build_object('name','Management Fees 10%','amount',v.mf,'costComponentId','611a7658-810f-4aa5-a052-51aaa78a68cf'))
  from (values
    ('716031f4-4dd1-4eb4-a154-c452f1a439c2'::uuid,1,23473.88,13366,2589.90,517.98,300,2071.92,129.50,2244.58,561.15,1035.96,1438.26,830.49,172.66,517.98,3028.74),
    ('aad77ba7-98d2-44cb-a0f1-b598eed740f4'::uuid,2,23055.88,13266,2574.90,514.98,0,2059.92,128.75,2231.58,557.90,1029.96,1429.93,825.68,171.66,514.98,2983.00)
  ) v(des,ord,gross,basic,hra,uni,skill,pf,eesi,erpf,eresi,lww,bonus,grat,nh,levy,mf);
end $$;
