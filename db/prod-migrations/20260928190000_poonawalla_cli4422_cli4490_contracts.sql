-- CLI4422 (Umrala) and CLI4490 (Vishrantwadi): their sheet contract IDs
-- CON16192/CON16193 already belong to L&T (CLI4505/CLI4506). Issue new IDs,
-- cloning the rate structure of a same-city Poonawalla contract.
do $$
declare
  m record; src client_contracts; new_id uuid;
begin
  for m in select * from (values
    ('CLI4422','CON16197','CON16260'),
    ('CLI4490','CON16058','CON16261')) v(unit_code, src_code, new_code)
  loop
    if exists (select 1 from client_contracts where contract_code = m.new_code) then continue; end if;
    select * into src from client_contracts where contract_code = m.src_code;
    src.id := gen_random_uuid();
    src.contract_code := m.new_code;
    src.unit_id := (select id from units where code = m.unit_code);
    src.created_at := now(); src.updated_at := now();
    insert into client_contracts select (src).*;
    new_id := src.id;
    insert into contract_resources
    select (jsonb_populate_record(r, jsonb_build_object('id', gen_random_uuid(), 'contract_id', new_id))).*
    from contract_resources r
    where r.contract_id = (select id from client_contracts where contract_code = m.src_code);
  end loop;
end $$;
