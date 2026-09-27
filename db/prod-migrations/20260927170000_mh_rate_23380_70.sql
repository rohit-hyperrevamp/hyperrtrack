-- Fix 9 Maharashtra BFL contract lines: total rate 23381.95 -> 23380.70.
-- Pay side was Rs 1.30 too high; reduce Basic 10179.00 -> 10177.70, gross
-- 15782.95 -> 15781.70. Employer contributions (7599.00) unchanged.
create table if not exists _bkp_mh_rate_cr_20260927 as
select * from contract_resources where id in (
  '6f5a3b34-f7a6-48df-9960-1deae9ad9476','c0168ae4-6628-4acc-bd81-82a9df20117c',
  'f2e11be8-186c-42a3-a750-18854315f4e1','44b8b40e-0db8-4ad1-a4d6-004a80fa96c1',
  'd122750d-f827-43e7-bd62-c175a1fce5e8','65f6075a-ace4-4203-9719-35cb7e5339c9',
  '02ac35a2-6779-4ef1-a417-17f25469bb9b','6dfa7283-ee75-4ea3-816f-b46182b74829',
  '1a4123f2-a852-4a50-9ea1-0a918aa36f7d');

update contract_resources r set
  components = (
    select jsonb_agg(case when x->>'name'='Basic' then jsonb_set(x,'{amount}','10177.70') else x end order by o)
    from jsonb_array_elements(r.components) with ordinality t(x,o)
  ),
  gross = 15781.70,
  updated_at = now()
where r.id in (select id from _bkp_mh_rate_cr_20260927);
