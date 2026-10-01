-- Align contract IDs with Contract_list (client ID -> contract ID). Each unit's contract takes the
-- file's latest Active contract ID for that client (or latest any, when its current ID belongs to another client).
-- Two-phase rename to avoid unique clashes (e.g. CON16192/CON16193 swap).
do $$ begin
create temp table m(cur text, unit text, target text) on commit drop;
insert into m values ('CON16279','CLI3356','CON16109'),('CON16280','CLI2529','CON15223'),('CON16265','CLI3211','CON16100'),('CON16264','CLI3212','CON16099'),('CON16261','CLI4490','CON16193'),('CON16188','CLI4501','CON16218'),('CON16272','CLI3347','CON14218'),('CON16192','CLI4505','CON16222'),('CON16267','CLI3214','CON16104'),('CON16178','CLI2282','CON11329'),('CON16260','CLI4422','CON16192'),('CON16193','CLI4506','CON16223'),('CON16277','CLI3029','CON14072'),('CON16273','CLI4200','CON16020'),('CON16281','CLI294','CON16096'),('CON16190','CLI4502','CON16219'),('CON16226','CLI4507','CON16201'),('CON16269','CLI4150','CON14337'),('CON16268','CLI3469','CON14315'),('CON16262','CLI3210','CON16102'),('CON16278','CLI4201','CON16162'),('CON16284','CLI2988','CON14071'),('CON16263','CLI3296','CON16103'),('CON16282','CLI1400','CON16134'),('CON16283','CLI2029','CON14070'),('CON16189','CLI4503','CON16220'),('CON16276','CLI3048','CON14073'),('CON16274','CLI4097','CON14289'),('CON16275','CLI3047','CON14074'),('CON16266','CLI3213','CON16101'),('CON16187','CLI4500','CON16217'),('CON16191','CLI4504','CON16221'),('CON16271','CLI3348','CON14219'),('CON16194','CLI289','CON9675');
update client_contracts c set contract_code = 'TMP-'||c.contract_code from m where c.contract_code=m.cur;
update client_contracts c set contract_code = m.target, updated_at=now() from m where c.contract_code='TMP-'||m.cur;
end $$;
