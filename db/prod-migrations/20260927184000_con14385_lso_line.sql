-- CON14385 (CLI1760 Pune Fountain Head): add Lady Security Officer (LSO) line at Rs 36,831.60/month
-- per BFL MH Jan-2026 sheet row "Pune (Security Officer)".
begin;

insert into public.designations (name, code, enabled, billable)
select 'Lady Security Officer', 'LSO', true, true
where not exists (select 1 from public.designations where lower(btrim(name))='lady security officer');

insert into public.contract_resources (contract_id, designation_id, service_type_id, quantity, components, gross, sort_order,
  payroll_day_base_id, benefits, deductions, employer_contributions, role_key, shift_hours, billing_day_base_id)
select sg.contract_id,
  (select id from public.designations where lower(btrim(name))='lady security officer' order by created_at limit 1),
  sg.service_type_id, 1,
  (select jsonb_agg(case c->>'name'
      when 'Basic' then jsonb_set(c,'{amount}','14866.0')
      when 'HRA' then jsonb_set(c,'{amount}','2814.9')
      else c end) from jsonb_array_elements(sg.components) c),
  24380.90, coalesce((select max(sort_order) from public.contract_resources where contract_id=sg.contract_id),0)+1,
  sg.payroll_day_base_id, sg.benefits, sg.deductions,
  (select jsonb_agg(case
      when c->>'name' ilike '%ESIC%' then jsonb_set(c,'{amount}','609.9')
      when c->>'name' ilike '%Leave%' then jsonb_set(c,'{amount}','1313.62')
      when c->>'name' ilike 'Uniform%' then jsonb_set(c,'{amount}','751.0')
      when c->>'name' ilike '%Reliever%' then jsonb_set(c,'{amount}','5168.18')
      else c end) from jsonb_array_elements(sg.employer_contributions) c)
   || jsonb_build_array(jsonb_build_object('name','Security Officer Skill Allowance','state','N/A','amount',2000.0,'calcType','fixed',
      'capAmount',null,'percentage',0.0,'formulaMode','preset','capFlatAmount',null,'baseComponents','[]'::jsonb,'formulaVersion',1,
      'costComponentId','cc990000-0001-4001-8001-000000000001','fixedCalcMethod','flat','fixedDutyDivisor',null,
      'deductionCalcType','fixed_amount','formulaExpression',null,'fixedDutyComponents','[]'::jsonb)),
  sg.role_key, 8, sg.billing_day_base_id
from public.contract_resources sg
where sg.id='e135894c-d80c-4ecd-9633-d3a6937ae7f2'
  and not exists (select 1 from public.contract_resources x join public.designations d on d.id=x.designation_id
                  where x.contract_id=sg.contract_id and d.code='LSO');

commit;
