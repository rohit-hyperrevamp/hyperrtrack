-- CLI325 JPAN Tubular: contract CON12888 (latest in Contract_list), 1 Aug 2025 – end extended to 1 Dec 2026,
-- 1 to 30/31 window. SG (26 days pay, reliever 4/26, billing 29,234) + SUP (billing 27,668) rate sheets.
do $$
declare cid uuid := gen_random_uuid(); uid uuid := '3dc9f81a-a794-497b-9527-813b08e45979';
 d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
 c jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
begin
if exists (select 1 from client_contracts where contract_code='CON12888') then return; end if;
insert into client_contracts (id,contract_code,unit_id,start_date,end_date,expiry_date,original_start_date,description,service_type_id,
  payroll_window_id,billing_type_id,gst_option,status,approval_status,approved_at,record_type,is_internal)
values (cid,'CON12888',uid,'2025-08-01','2026-12-01','2026-12-01','2025-08-01',
  'JPAN TUBULAR CO. PVT. LTD. - CLI325, rate sheet 01/07/2025 (SG billing ₹29,234 / SUP ₹27,668)',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1','9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c','70f409c8-2eb6-4b44-bbae-2fe15a566b6d','csgst',
  'active','approved',now(),'client',false);
update units set contract_end_date='2026-12-01', updated_at=now() where id=uid;

insert into contract_resources (id,contract_id,designation_id,service_type_id,quantity,shift_hours,sort_order,payroll_day_base_id,billing_day_base_id,
  gross,benefits,components,deductions,employer_contributions)
values (gen_random_uuid(),cid,'aad77ba7-98d2-44cb-a0f1-b598eed740f4','b10a1dd8-116e-4c1d-856e-4b3785c04bd1',1,8,1,
 'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96','c82178db-3864-471f-b078-1510ea49a2f9',20558,'[]',
 jsonb_build_array(
  c||'{"name":"Basic","amount":10021,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
  c||'{"name":"Special Allowance","amount":3614,"allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436"}',
  c||'{"name":"Exgratia","amount":5113,"allowanceId":null}',
  c||'{"name":"HRA 5% (Basic+DA)","amount":682,"allowanceId":"aa161330-0001-4001-8001-000000000003"}',
  c||'{"name":"LWW 4%","amount":545,"allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee"}',
  c||'{"name":"Bonus / Exgratia 8.33% (Rs.7000)","amount":583,"allowanceId":"aa142900-0001-4001-8001-000000000001"}'),
 jsonb_build_array(
  d||'{"name":"EE EPF 12% (cap 15000)","amount":1800,"costComponentId":"cc113290-0001-4001-8001-000000000001"}',
  d||'{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
  d||'{"name":"EE ESI 0.75%","amount":154,"costComponentId":"cc130430-0001-4001-8001-000000000003"}'),
 jsonb_build_array(
  d||'{"name":"ER EPF 13% (cap 15000)","amount":1950,"costComponentId":"cc113290-0001-4001-8001-000000000002"}',
  d||'{"name":"ER ESI 3.25%","amount":668,"costComponentId":"cc130430-0001-4001-8001-000000000004"}',
  d||'{"name":"Gratuity 4.81% (Basic+DA)","amount":656,"costComponentId":"cc161170-0001-4001-8001-000000000002"}',
  d||'{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
  d||'{"name":"Reliever Charges (Total CTC/26*4)","amount":3668,"costComponentId":null}',
  d||'{"name":"Management Fee","amount":1721,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));

insert into contract_resources (id,contract_id,designation_id,service_type_id,quantity,shift_hours,sort_order,payroll_day_base_id,billing_day_base_id,
  gross,benefits,components,deductions,employer_contributions)
values (gen_random_uuid(),cid,'69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4','b10a1dd8-116e-4c1d-856e-4b3785c04bd1',1,8,2,
 'fe52c7ac-4cfd-4de2-924f-56c69dfb2d96','c82178db-3864-471f-b078-1510ea49a2f9',22918,'[]',
 jsonb_build_array(
  c||'{"name":"Basic","amount":11632,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
  c||'{"name":"Special Allowance","amount":3614,"allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436"}',
  c||'{"name":"Exgratia","amount":5717,"allowanceId":null}',
  c||'{"name":"HRA 5% (Basic+DA)","amount":762,"allowanceId":"aa161330-0001-4001-8001-000000000003"}',
  c||'{"name":"LWW 4%","amount":610,"allowanceId":"2ae10fc7-d9b4-440f-ab4d-06cecee11eee"}',
  c||'{"name":"Bonus / Exgratia 8.33% (Rs.7000)","amount":583,"allowanceId":"aa142900-0001-4001-8001-000000000001"}'),
 jsonb_build_array(
  d||'{"name":"EE EPF 12% (cap 15000)","amount":1800,"costComponentId":"cc113290-0001-4001-8001-000000000001"}',
  d||'{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}'),
 jsonb_build_array(
  d||'{"name":"ER EPF 13% (cap 15000)","amount":1950,"costComponentId":"cc113290-0001-4001-8001-000000000002"}',
  d||'{"name":"WC Policy","amount":200,"costComponentId":"22e1022a-c558-4a9c-be6c-bb684de079ff"}',
  d||'{"name":"Gratuity 4.81% (Basic+DA)","amount":733,"costComponentId":"cc161170-0001-4001-8001-000000000002"}',
  d||'{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
  d||'{"name":"Management Fee","amount":1854,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
end $$;
