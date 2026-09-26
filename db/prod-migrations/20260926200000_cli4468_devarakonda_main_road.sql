-- BFL Telangana Devarakonda Main Road (TSSK2) CLI4468 + contract CON16227.
-- Cloned from Haliya-Devarakonda CLI2394 / CON14572 (Telangana Zone II, 21-20 window).
do $$
declare
  su units; sc client_contracts; r contract_resources;
  u_id uuid := gen_random_uuid(); c_id uuid := gen_random_uuid();
  addr text := 'First Floor, Vishnu Complex, Main Road, Gandhinagar, Devarakonda';
begin
  if exists (select 1 from units where code = 'CLI4468') then return; end if;
  select * into su from units where code = 'CLI2394';
  select * into sc from client_contracts where contract_code = 'CON14572';

  insert into units select * from jsonb_populate_record(null::units, to_jsonb(su) || jsonb_build_object(
    'id', u_id, 'code', 'CLI4468',
    'name', 'BAJAJ FINANCE LIMITED- DEVARAKONDA MAIN ROAD', 'location', 'Devarakonda',
    'branch_sap_code', 'TSSK2', 'zone', 'Zone II',
    'client_address', addr, 'client_city', 'Devarakonda', 'client_district', 'Nalgonda',
    'client_state', 'Telangana', 'client_pincode', '508248', 'status', 'active',
    'latitude', null, 'longitude', null, 'coordinates_source', null, 'coordinates_captured_by', null,
    'coordinates_captured_at', null, 'coordinates_accuracy_m', null,
    'created_at', now(), 'updated_at', now()));

  insert into client_contracts select * from jsonb_populate_record(null::client_contracts, to_jsonb(sc) || jsonb_build_object(
    'id', c_id, 'contract_code', 'CON16227', 'unit_id', u_id,
    'description', 'DEVARAKONDA MAIN ROAD - CLI4468, BFL Telangana Zone II',
    'payroll_window_id', '5e900b36-3cca-4137-a923-57bfe7910641',
    'status', 'active', 'approval_status', 'approved', 'approved_at', now(),
    'signed_pdf_url', '', 'signed_at', null, 'renewal_count', 0,
    'created_at', now(), 'updated_at', now()));

  for r in select * from contract_resources where contract_id = sc.id order by sort_order loop
    insert into contract_resources select * from jsonb_populate_record(null::contract_resources, to_jsonb(r) || jsonb_build_object(
      'id', gen_random_uuid(), 'contract_id', c_id, 'created_at', now(), 'updated_at', now()));
  end loop;
end $$;
