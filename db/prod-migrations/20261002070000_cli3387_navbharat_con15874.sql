-- CLI3387 Navbharat Bandra East: exact clone of CLI4449 contract CON16126 as CON15874 (contract list, 1 May 2026 - 30 Apr 2027).
do $$ declare src client_contracts; nid uuid := gen_random_uuid(); begin
  if exists (select 1 from client_contracts where contract_code='CON15874') then return; end if;
  select * into src from client_contracts where contract_code='CON16126';
  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(src) || jsonb_build_object(
    'id',nid,'contract_code','CON15874','unit_id','faa8e644-db81-420f-bbdf-42f106122a66',
    'start_date','2026-05-01','original_start_date','2026-05-01','end_date','2027-04-30','expiry_date','2027-04-30',
    'status','active','approval_status','approved','approved_at',now(),'signed_pdf_url','','signed_at',null,
    'renewal_count',0,'created_at',now(),'updated_at',now()));
  insert into contract_resources select * from jsonb_populate_record(null::contract_resources, to_jsonb(r) || jsonb_build_object(
    'id',gen_random_uuid(),'contract_id',nid,'created_at',now(),'updated_at',now()))
  from contract_resources r where r.contract_id=src.id;
end $$;
