-- Align CLI2176, CLI2331, CLI3557, CLI4507, CLI508 to the Solapur rate card:
-- gross 18,122.05 + employer cost 8,148.17 = 26,270.22 / month.
create table if not exists _bkp_solapur_cr_20260927 as
select * from contract_resources where id in (
 '6c9317b8-e428-4597-b638-3d6f50b95d69','bc337f2f-bb54-42b4-9461-666b047622ee',
 '4f245d91-9932-435a-a00a-37bd36a30593','e3f40285-9c46-48ca-996f-371e3285eb0e',
 '11ed2769-26a0-4595-9d64-b8dbbef54f62');

with src as (
  select
    (select jsonb_agg(case when x->>'name'='HRA' then jsonb_set(x,'{amount}','771.05') else x end order by o)
       from jsonb_array_elements(components) with ordinality t(x,o)) comps,
    (select jsonb_agg(case when x->>'name' like 'Bajaj Reliever%' then jsonb_set(x,'{amount}','3660.17') else x end order by o)
       from jsonb_array_elements(employer_contributions) with ordinality t(x,o)) emp,
    deductions, payroll_day_base_id, billing_day_base_id
  from contract_resources where id='bc337f2f-bb54-42b4-9461-666b047622ee'
)
update contract_resources r set components=src.comps, employer_contributions=src.emp,
  deductions=src.deductions, payroll_day_base_id=src.payroll_day_base_id,
  billing_day_base_id=src.billing_day_base_id, gross=18122.05, updated_at=now()
from src where r.id in (select id from _bkp_solapur_cr_20260927);
