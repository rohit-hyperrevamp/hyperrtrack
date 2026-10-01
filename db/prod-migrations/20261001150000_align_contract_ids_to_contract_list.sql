-- Align contract IDs with Contract_list (client ID -> contract ID). Each unit's contract takes the
-- file's latest Active contract ID for that client (or latest any, when its current ID belongs to another client).
-- Two-phase rename to avoid unique clashes (e.g. CON16192/CON16193 swap).
do $$ begin
create temp table m(cur text, unit text, target text) on commit drop;
insert into m values ;
update client_contracts c set contract_code = 'TMP-'||c.contract_code from m where c.contract_code=m.cur;
update client_contracts c set contract_code = m.target, updated_at=now() from m where c.contract_code='TMP-'||m.cur;
end $$;
