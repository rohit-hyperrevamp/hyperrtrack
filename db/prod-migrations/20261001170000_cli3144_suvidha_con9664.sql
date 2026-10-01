-- CLI3144 Suvidha Towel Industries (Balaji Industries Solapur): contract CON9664 from Contract_list,
-- 1 to 30/31 window, Security Guard 12 Hrs rate sheet (gross 13,578, CTC 15,625, billing 17,001).
do $$
declare cid uuid := gen_random_uuid();
 ded jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
 comp jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null}';
begin
if exists (select 1 from client_contracts where contract_code='CON9664') then return; end if;
insert into client_contracts (id,contract_code,unit_id,start_date,end_date,expiry_date,original_start_date,description,service_type_id,
  payroll_window_id,billing_type_id,gst_option,status,approval_status,approved_at,record_type,is_internal)
values (cid,'CON9664','7671d3e8-a975-401e-aefc-0b3b68733897','2024-09-01','2026-08-31','2026-08-31','2024-09-01',
  'SUVIDHA TOWEL INDUSTRIES-(BALAJI INDUSTRIES) - CLI3144, Balaji Industries Solapur SG rate sheet 14-09-2024 (12 Hrs, billing ₹17,001)',
  'b10a1dd8-116e-4c1d-856e-4b3785c04bd1','9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c','70f409c8-2eb6-4b44-bbae-2fe15a566b6d','csgst',
  'active','approved',now(),'client',false);
insert into contract_resources (id,contract_id,designation_id,service_type_id,quantity,shift_hours,sort_order,payroll_day_base_id,billing_day_base_id,
  gross,benefits,components,deductions,employer_contributions)
values (gen_random_uuid(),cid,'aad77ba7-98d2-44cb-a0f1-b598eed740f4','b10a1dd8-116e-4c1d-856e-4b3785c04bd1',1,12,1,
 'e23708c1-250e-4440-b76d-1c2c63a99218','c82178db-3864-471f-b078-1510ea49a2f9',13578,'[]',
 jsonb_build_array(
  comp||'{"name":"Basic","amount":8828,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9","includeInOt":true}',
  comp||'{"name":"DA","amount":3250,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a","includeInOt":true}',
  comp||'{"name":"Uniform Allowance","amount":200,"allowanceId":"92303274-cd77-4692-b956-4c96622da5b1","includeInOt":false}',
  comp||'{"name":"Washing Allowance","amount":100,"allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","includeInOt":false}',
  comp||'{"name":"Additional 4 Hrs","amount":1200,"allowanceId":"d2727847-2a69-43ce-aba0-8216ffb95d41","includeInOt":false}'),
 jsonb_build_array(
  ded||'{"name":"EE EPF 12% (Gross - Add. 4 Hrs)","amount":1485.36,"costComponentId":"cc113290-0001-4001-8001-000000000001"}',
  ded||'{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
  ded||'{"name":"EE ESI 0.75% (Gross-WA)","amount":101.09,"costComponentId":"cc130430-0001-4001-8001-000000000003"}'),
 jsonb_build_array(
  ded||'{"name":"ER EPF 13% (Gross - Add. 4 Hrs)","amount":1609,"costComponentId":"cc113290-0001-4001-8001-000000000002"}',
  ded||'{"name":"ER ESI 3.25% (Gross-WA)","amount":438,"costComponentId":"cc130430-0001-4001-8001-000000000004"}',
  ded||'{"name":"Management Fee","amount":1376,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
end $$;
