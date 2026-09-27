-- Fix CLI2134 Pimpalgaon - Chinchkhed Road (Kuthla Gaon, 11560): rate 28053.95 -> 32085.46.
-- Copy the paisa-exact 32085.46 breakdown from CLI501 (Pune urban rate).
create table if not exists _bkp_kuthla_cr_20260927 as
select * from contract_resources where id = 'c63cc60f-a7a2-46f2-aa53-9e5a611640f3';

update contract_resources r set
  components = s.components,
  employer_contributions = s.employer_contributions,
  gross = s.gross,
  updated_at = now()
from contract_resources s
join client_contracts sc on sc.id = s.contract_id
join units su on su.id = sc.unit_id
where su.code = 'CLI501' and sc.status = 'active'
  and r.id = 'c63cc60f-a7a2-46f2-aa53-9e5a611640f3';
