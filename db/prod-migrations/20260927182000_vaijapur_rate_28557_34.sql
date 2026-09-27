-- Fix CLI2755 Vaijapur Station Road (12517): total rate 32085.90 -> 28557.34
-- per BFL master sheet (row 178, MHJA6). Copy the paisa-exact 28557.34
-- breakdown from CLI522 (gross 19902.70 + ER 8654.64).
create table if not exists _bkp_vaijapur_cr_20260927 as
select * from contract_resources where id = '02d210d7-8088-43e1-a9a2-874c355e467e';

update contract_resources r set
  components = s.components,
  employer_contributions = s.employer_contributions,
  gross = s.gross,
  updated_at = now()
from contract_resources s
where s.id = 'e5cf899f-1466-4dc0-abcd-cbc2af726c5d'
  and r.id = '02d210d7-8088-43e1-a9a2-874c355e467e';
