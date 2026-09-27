-- Align remaining MH lines at 26971.50 to 26970.96 using the CLI1410 master breakdown.
create table if not exists _bkp_mh_26970_cr_20260927 as select * from contract_resources where id in ('682f474d-2373-4bfd-88c2-b812fc5a77a7','a153c223-2bd6-4403-9067-25ce235ad74e');
update contract_resources r set components=s.components, employer_contributions=s.employer_contributions, gross=s.gross, updated_at=now()
from contract_resources s where s.id='dbd00295-c9d3-4015-8335-e58fd61f56ae' and r.id in ('682f474d-2373-4bfd-88c2-b812fc5a77a7','a153c223-2bd6-4403-9067-25ce235ad74e');
