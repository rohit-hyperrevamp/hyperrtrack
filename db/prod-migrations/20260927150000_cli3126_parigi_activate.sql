-- Reactivate CLI3126 Parigi (BFL Rural, TSMK2) + new contract from 21 Aug 2026,
-- cloned from Haliya CLI2394 / CON14572 (Telangana Zone II, 21,974.62, 21-20 window).
do $$
declare
  sc client_contracts; r contract_resources; c_id uuid := gen_random_uuid();
  u_id uuid := 'f0bd417d-f80f-4cc5-92d1-226a97b40177'; code text;
begin
  if exists (select 1 from client_contracts where unit_id = u_id and status = 'active') then return; end if;
  update units set status='active', customer_id='bcd3c541-ef45-4c58-90c7-b8f470196269',
    name='BAJAJ FINANCE LIMITED- PARIGI VIKARABAD - PARIGI-(SGL_13270)', location='Parigi',
    branch_sap_code='TSMK2', zone='Zone II',
    client_address='Bajaj Finance Limited, Ground Floor, Survey No. 256/1, Door No.11-23, Baharpet, Balaji Nagar, Opp Vignan College Main Road, Pargi, Vikarabad District - 501501',
    client_city='Parigi', client_district='Vikarabad', client_state='Telangana', client_pincode='501501',
    pan_number='AABCB1518L', updated_at=now()
  where id=u_id;

  select * into sc from client_contracts where contract_code='CON14572';
  select 'CON' || (max(substring(contract_code from 4)::int)+1) into code from client_contracts where contract_code ~ '^CON[0-9]+$';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', code, 'unit_id', u_id,
    'description', 'PARIGI VIKARABAD - CLI3126, BFL Telangana Zone II',
    'start_date','2026-08-21','original_start_date','2026-08-21','end_date','2027-08-20','expiry_date','2027-08-20',
    'status','active','approval_status','approved','approved_at',now(),
    'signed_pdf_url','','signed_at',null,'renewal_count',0,'created_at',now(),'updated_at',now()));
  for r in select * from contract_resources where contract_id=sc.id order by sort_order loop
    insert into contract_resources select * from jsonb_populate_record(null::contract_resources, to_jsonb(r) || jsonb_build_object(
      'id', gen_random_uuid(), 'contract_id', c_id, 'created_at', now(), 'updated_at', now()));
  end loop;

  insert into mis_unit_values (template_id, column_id, unit_id, value)
  select '11111111-2233-4455-6677-000000000163'::uuid, c.id, u_id, v.value
  from (values ('Location Category','SGL'),('Type of location','Tier 2'),('Dpl Type Permanent/  Temporary','Permanent'),
    ('STP','MH01'),('BP','MH27'),('Vendor GST No.','27AAECR2832A1ZT'),('Vendor Code','0001004695_BAFL')) v(header,value)
  join mis_template_columns c on c.template_id='11111111-2233-4455-6677-000000000163'::uuid and c.header=v.header
  on conflict (column_id, unit_id) do update set value=excluded.value, updated_at=now();
end $$;
select u.code,u.status,u.branch_sap_code,u.client_state,c.contract_code,c.start_date,c.end_date,r.gross
from units u join client_contracts c on c.unit_id=u.id and c.status='active' join contract_resources r on r.contract_id=c.id where u.code='CLI3126';
