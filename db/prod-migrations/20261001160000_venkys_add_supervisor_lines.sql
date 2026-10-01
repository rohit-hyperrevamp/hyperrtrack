-- Venky's 21 contracts: every contract carries both rate structures (Security Guard + Security Supervisor).
-- Adds the Supervisor line (copied from an existing Venky's SUP line, qty 1) where missing.
do $$
declare tpl contract_resources; r record;
begin
  select cr.* into tpl from contract_resources cr join client_contracts c on c.id = cr.contract_id
   where c.contract_code in ('CON13106','CON13170','CON13169') and cr.designation_id = '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4' limit 1;
  for r in select c.id from client_contracts c where c.contract_code in
    ('CON13184','CON13175','CON13166','CON13176','CON13106','CON13170','CON13181','CON13177','CON13180','CON13167','CON13165',
     'CON13179','CON13173','CON13168','CON13171','CON13182','CON13183','CON13172','CON15194','CON13169','CON13174')
    and not exists (select 1 from contract_resources x where x.contract_id = c.id and x.designation_id = '69a7aaf2-57fa-4ade-a2f6-12a4e69abaf4')
  loop
    insert into contract_resources (id, contract_id, designation_id, service_type_id, quantity, shift_hours, sort_order,
      payroll_day_base_id, billing_day_base_id, gross, benefits, components, deductions, employer_contributions)
    values (gen_random_uuid(), r.id, tpl.designation_id, tpl.service_type_id, 1, tpl.shift_hours, 2,
      tpl.payroll_day_base_id, tpl.billing_day_base_id, tpl.gross, tpl.benefits, tpl.components, tpl.deductions, tpl.employer_contributions);
  end loop;
end $$;
