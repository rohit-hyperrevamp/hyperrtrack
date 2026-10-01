-- Venky's group (21 sites): contracts from the Venkys 8 Hrs rate sheets (w.e.f. 01 Sep 2025),
-- Security Guard + Security Supervisor, payroll window 1 to 30/31. Contract IDs/dates from Contract_list.
-- Quantity = active posted guards (min 1 SG); supervisor line only where a supervisor is posted.
do $$
declare
  r record; sc client_contracts; c_id uuid; sg int; sup int;
  f jsonb := '{"calcType":"fixed","formulaMode":"preset","formulaVersion":1,"formulaExpression":null,"includeInOt":true}';
  d jsonb := '{"state":"N/A","calcType":"fixed","capAmount":null,"percentage":0,"formulaMode":"preset","capFlatAmount":null,"baseComponents":[],"formulaVersion":1,"fixedCalcMethod":"flat","fixedDutyDivisor":null,"deductionCalcType":"fixed_amount","formulaExpression":null,"fixedDutyComponents":[]}';
begin
  select * into sc from client_contracts where contract_code = 'CON16225';
  for r in select v.code, v.cli, v.sd::date sd, v.ed::date ed, u.id uid, u.name from (values
    ('CON13184','CLI390','2025-10-01','2026-10-31'),
    ('CON13175','CLI374','2025-10-01','2026-08-31'),
    ('CON13166','CLI382','2025-10-01','2026-09-30'),
    ('CON13176','CLI375','2025-10-01','2026-10-31'),
    ('CON13106','CLI377','2025-10-01','2026-08-31'),
    ('CON13170','CLI378','2025-10-01','2026-09-30'),
    ('CON13181','CLI376','2025-10-01','2026-09-30'),
    ('CON13177','CLI1227','2025-10-01','2026-09-30'),
    ('CON13180','CLI379','2025-10-01','2026-09-30'),
    ('CON13167','CLI370','2025-10-01','2026-09-30'),
    ('CON13165','CLI388','2025-10-01','2026-09-30'),
    ('CON13179','CLI387','2025-10-01','2026-09-30'),
    ('CON13173','CLI386','2025-10-01','2026-09-30'),
    ('CON13168','CLI380','2025-10-01','2026-09-30'),
    ('CON13171','CLI373','2025-10-01','2026-10-31'),
    ('CON13182','CLI395','2025-10-01','2026-10-31'),
    ('CON13183','CLI381','2025-10-01','2026-09-30'),
    ('CON13172','CLI1487','2025-10-01','2026-09-30'),
    ('CON15194','CLI4190','2026-04-01','2026-09-30'),
    ('CON13169','CLI385','2025-10-01','2026-10-31'),
    ('CON13174','CLI372','2025-10-01','2026-09-30')) v(code,cli,sd,ed) join units u on u.code = v.cli
  loop
    continue when exists (select 1 from client_contracts where contract_code = r.code);
    c_id := gen_random_uuid();
    select count(*) filter (where designation_id='aad77ba7-98d2-44cb-a0f1-b598eed740f4'),
           count(*) filter (where designation_id='69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4')
      into sg, sup from candidates where unit_id = r.uid and status ilike 'active';
    insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
      'id', c_id, 'contract_code', r.code, 'unit_id', r.uid,
      'description', r.name || ' - ' || r.cli || ', Venkys 8 Hrs rate sheet w.e.f. 01/09/2025 (SG ₹20,962 / SUP ₹22,757)',
      'start_date', r.sd, 'original_start_date', r.sd, 'end_date', r.ed, 'expiry_date', r.ed,
      'payroll_window_id', '9676d05d-fbb3-4d9a-bdca-b4b9ac65db0c', 'gst_option', 'csgst',
      'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
      'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0, 'created_at', now(), 'updated_at', now()));

    insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
      payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
    values (gen_random_uuid(), c_id, 'aad77ba7-98d2-44cb-a0f1-b598eed740f4', sc.service_type_id, greatest(sg,1), 8, 1,
      'e23708c1-250e-4440-b76d-1c2c63a99218', 'c82178db-3864-471f-b078-1510ea49a2f9', 16285, '[]',
      jsonb_build_array(
        f || '{"name":"Basic","amount":8100,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
        f || '{"name":"DA","amount":3614,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
        f || '{"name":"HRA 10% (Basic+DA)","amount":1171.40,"allowanceId":"aa101120-0001-4001-8001-000000000001"}',
        f || '{"name":"Washing Allowance","amount":1000,"allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","includeInOt":false}',
        f || '{"name":"LWW","amount":1650,"allowanceId":null}',
        f || '{"name":"Special Allowance","amount":750,"allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436"}'),
      jsonb_build_array(
        d || '{"name":"EE EPF 12% (Gross-HRA, cap 15000)","amount":1800,"costComponentId":"cc113290-0001-4001-8001-000000000001"}',
        d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
        d || '{"name":"EE ESI 0.75% (Gross-WA)","amount":115,"costComponentId":"cc130430-0001-4001-8001-000000000003"}'),
      jsonb_build_array(
        d || '{"name":"ER EPF 13% (Gross-HRA, cap 15000)","amount":1950,"costComponentId":"cc113290-0001-4001-8001-000000000002"}',
        d || '{"name":"ER ESI 3.25% (Gross-WA)","amount":496.80,"costComponentId":"cc130430-0001-4001-8001-000000000004"}',
        d || '{"name":"Bonus / Exgratia 8.33% (Rs.7000) Employer Cost","amount":583.10,"costComponentId":"cc101120-0001-4001-8001-000000000002"}',
        d || '{"name":"Paid Holiday","amount":250,"costComponentId":null}',
        d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
        d || '{"name":"Management Fee","amount":1384,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));

    if sup > 0 then
    insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
      payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
    values (gen_random_uuid(), c_id, '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4', sc.service_type_id, sup, 8, 2,
      'e23708c1-250e-4440-b76d-1c2c63a99218', 'c82178db-3864-471f-b078-1510ea49a2f9', 17785.40, '[]',
      jsonb_build_array(
        f || '{"name":"Basic","amount":9100,"allowanceId":"44e4177f-b612-44ac-9b4b-227da493a4c9"}',
        f || '{"name":"DA","amount":3614,"allowanceId":"4ac31d78-dafd-44d2-9123-2168ce28917a"}',
        f || '{"name":"HRA 10% (Basic+DA)","amount":1271.40,"allowanceId":"aa101120-0001-4001-8001-000000000001"}',
        f || '{"name":"Washing Allowance","amount":1000,"allowanceId":"9a96de53-a582-4f5a-a8de-bb349335cb47","includeInOt":false}',
        f || '{"name":"LWW","amount":1750,"allowanceId":null}',
        f || '{"name":"Special Allowance","amount":1050,"allowanceId":"b545cbf0-30c0-4e2a-87d0-b355fe8cc436"}'),
      jsonb_build_array(
        d || '{"name":"EE EPF 12% (Gross-HRA, cap 15000)","amount":1800,"costComponentId":"cc113290-0001-4001-8001-000000000001"}',
        d || '{"name":"EE Professional Tax","amount":200,"costComponentId":"70113912-2bb8-4916-b1d5-84d090a387e0"}',
        d || '{"name":"EE ESI 0.75% (Gross-WA)","amount":126,"costComponentId":"cc130430-0001-4001-8001-000000000003"}'),
      jsonb_build_array(
        d || '{"name":"ER EPF 13% (Gross-HRA, cap 15000)","amount":1950,"costComponentId":"cc113290-0001-4001-8001-000000000002"}',
        d || '{"name":"ER ESI 3.25% (Gross-WA)","amount":545.53,"costComponentId":"cc130430-0001-4001-8001-000000000004"}',
        d || '{"name":"Bonus / Exgratia 8.33% (Rs.7000) Employer Cost","amount":583.10,"costComponentId":"cc101120-0001-4001-8001-000000000002"}',
        d || '{"name":"Paid Holiday","amount":350,"costComponentId":null}',
        d || '{"name":"ER LWF - MH","amount":12.50,"costComponentId":"70421294-a437-4e27-a0bd-5585513b8039"}',
        d || '{"name":"Management Fee","amount":1530.47,"costComponentId":"611a7658-810f-4aa5-a052-51aaa78a68cf"}'));
    end if;
  end loop;
end $$;
