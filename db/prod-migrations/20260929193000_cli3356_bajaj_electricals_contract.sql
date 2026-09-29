-- Bajaj Electricals Gujarat (CLI3356) CON16279 from rate sheets, period 01/04/2026-30/09/2027.
-- Security Guard 26d 12h (with reliever), Security Supervisor 26d 12h, Security Guard 30d 12h (no reliever).
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
  p26 uuid := 'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96'; pact uuid := 'e23708c1-250e-4440-b76d-1c2c63a99218';
  b26 uuid := 'abea52aa-6151-4d0a-9209-f102d3ecf226'; b30 uuid := 'bd2370a0-0001-4001-8001-000000000001';
  g uuid := 'aad77ba7-98d2-44cb-a0f1-b598eed740f4'; s uuid := '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16279') then return; end if;
  select id into u_id from units where code = 'CLI3356';
  select * into sc from client_contracts where contract_code = 'CON14205';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16279', 'unit_id', u_id,
    'description', 'BAJAJ ELECTRICALS LIMITED GUJARAT - CLI3356, Security Guard & Supervisor 12 Hrs (01/04/2026-30/09/2027)',
    'start_date', '2026-04-01', 'original_start_date', '2026-04-01',
    'end_date', '2027-09-30', 'expiry_date', '2027-09-30',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0, 'created_at', now(), 'updated_at', now()));
  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  select gen_random_uuid(), c_id, v.des, sc.service_type_id, 1, 12, v.ord, v.pb, v.bb, v.gross, '[]',
    jsonb_build_array(
      f || jsonb_build_object('name','Basic + DA','amount',v.basic,'allowanceId',null),
      f || jsonb_build_object('name','HRA','amount',v.hra,'allowanceId',null),
      f || jsonb_build_object('name','Paid Holiday 1.28% (Basic+DA)','amount',v.ph,'allowanceId',null),
      f || '{"name":"Uniform","amount":400,"allowanceId":"92303274-cd77-4692-b956-4c96622da5b1"}',
      f || '{"name":"Washing Allowance","amount":300,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || jsonb_build_object('name','EE ESI 0.75%','amount',v.eesi,'costComponentId','cc161330-0001-4001-8001-000000000001')),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || jsonb_build_object('name','ER ESI 3.25%','amount',v.eresi,'costComponentId','cc161330-0001-4001-8001-000000000002'),
      d || jsonb_build_object('name','Gratuity 4.81% (Basic+DA)','amount',v.grat,'costComponentId','cc143130-0001-4001-8001-000000000001'),
      d || '{"name":"LWF","amount":2,"costComponentId":null}',
      d || jsonb_build_object('name','Leave with Wages 6.73% (Basic+DA)','amount',v.lww,'costComponentId',null),
      d || jsonb_build_object('name','Bonus/Exgratia 8.33% (Basic+DA)','amount',v.bonus,'costComponentId',null))
    || case when v.rel > 0 then jsonb_build_array(d || jsonb_build_object('name','Relieving Charges 16.67% (CTC)','amount',v.rel,'costComponentId','cc166700-0001-4001-8001-000000000001')) else '[]'::jsonb end
    || jsonb_build_array(d || jsonb_build_object('name','Management Fees 5%','amount',v.mf,'costComponentId','611a7658-810f-4aa5-a052-51aaa78a68cf'))
  from (values
    (g,1,p26,b26,15138.14,13585,679.25,173.89,101.89,441.51,653.44,914.27,1131.63,3372.51,1180.17),
    (s,2,p26,b26,15469.73,13897,694.85,177.88,104.23,451.65,668.45,935.27,1157.62,0,1031.73),
    (g,3,pact,b30,15138.14,13585,679.25,173.89,101.89,441.51,653.44,914.27,1131.63,0,1011.55)
  ) v(des,ord,pb,bb,gross,basic,hra,ph,eesi,eresi,grat,lww,bonus,rel,mf);
end $$;
