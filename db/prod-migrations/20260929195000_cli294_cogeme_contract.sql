-- Cogeme Precision Parts (CLI294) CON16281 from signed rate sheets wef 26/06/2026.
-- Security Guard, Head Guard, Security Supervisor; 8 hrs, 26 payable days, Management Fees 6%.
do $$
declare
  sc client_contracts; u_id uuid; c_id uuid := gen_random_uuid();
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
begin
  if exists (select 1 from client_contracts where contract_code = 'CON16281') then return; end if;
  select id into u_id from units where code = 'CLI294';
  select * into sc from client_contracts where contract_code = 'CON16273';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16281', 'unit_id', u_id,
    'description', 'COGEME PRECISION PARTS - CLI294, Security Guard, Head Guard & Supervisor 8 Hrs 26 Days (wef 26/06/2026)',
    'start_date', '2026-06-26', 'original_start_date', '2026-06-26',
    'end_date', '2027-06-25', 'expiry_date', '2027-06-25',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0, 'created_at', now(), 'updated_at', now()));
  insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
    payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
  select gen_random_uuid(), c_id, v.des, sc.service_type_id, 1, 8, v.ord,
    'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96', 'abea52aa-6151-4d0a-9209-f102d3ecf226', v.gross, '[]',
    jsonb_build_array(
      f || jsonb_build_object('name','Basic','amount',v.basic,'allowanceId','44e4177f-b612-44ac-9b4b-227da493a4c9'),
      f || '{"name":"Special Allowance","amount":3900,"allowanceId":null}',
      f || jsonb_build_object('name','HRA 15%','amount',v.hra,'allowanceId',null))
    || case when v.skill > 0 then jsonb_build_array(f || jsonb_build_object('name','Skill Allowance','amount',v.skill,'allowanceId',null)) else '[]'::jsonb end
    || jsonb_build_array(
      f || '{"name":"Travelling Allowance","amount":1800,"allowanceId":null}',
      f || jsonb_build_object('name','Leave with Wages 6% (Total A)','amount',v.lww,'allowanceId',null),
      f || '{"name":"Washing Allowance","amount":1000,"allowanceId":null}'),
    jsonb_build_array(
      d || '{"name":"EE EPF 12% (ceiling 15,000)","amount":1800,"costComponentId":null}',
      d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
      d || jsonb_build_object('name','EE ESI 0.75% (Basic+DA)','amount',v.eesi,'costComponentId','cc161330-0001-4001-8001-000000000001')),
    jsonb_build_array(
      d || '{"name":"ER EPF 13% (ceiling 15,000)","amount":1950,"costComponentId":null}',
      d || jsonb_build_object('name','ER ESI 3.25%','amount',v.eresi,'costComponentId','cc161330-0001-4001-8001-000000000002'),
      d || jsonb_build_object('name','Bonus/Exgratia 10% (Total A)','amount',v.bonus,'costComponentId',null),
      d || jsonb_build_object('name','Uniform Allowance 4% (Total A)','amount',v.g4,'costComponentId',null),
      d || jsonb_build_object('name','Paid Holiday 1%','amount',v.ph,'costComponentId',null),
      d || jsonb_build_object('name','Gratuity 4%','amount',v.g4,'costComponentId','cc143130-0001-4001-8001-000000000001'),
      d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
      d || jsonb_build_object('name','Guard Board Levy 3% (Total A)','amount',v.levy,'costComponentId',null),
      d || jsonb_build_object('name','Management Fees 6%','amount',v.mf,'costComponentId','611a7658-810f-4aa5-a052-51aaa78a68cf'))
  from (values
    ('aad77ba7-98d2-44cb-a0f1-b598eed740f4'::uuid,1,23570.86,13266,2574.90,0,1029.96,128.75,557.90,1716.60,686.64,171.66,514.98,1803.28),
    ('716031f4-4dd1-4eb4-a154-c452f1a439c2'::uuid,2,24038.46,13366,2589.90,346.60,1035.96,129.50,561.15,1726.60,690.64,172.66,517.98,1840.21),
    ('69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4'::uuid,3,24296.86,13866,2664.90,0,1065.96,133.25,577.40,1776.60,710.64,177.66,532.98,1858.48)
  ) v(des,ord,gross,basic,hra,skill,lww,eesi,eresi,bonus,g4,ph,levy,mf);
end $$;
