-- Designation cleanup: office titles become rank-only, department carries the function.
-- Site/billing roles keep their names; only duplicates/typos are merged.
-- Held for user confirmation (untouched): CCT, CAHOT, TSM (CAHOT), EXC, Assignment Manager, Operations Consultant.
begin;

create table if not exists public._bkp_designations_20260927 as select * from public.designations;
create table if not exists public._bkp_cand_desig_20260927 as select id, designation_id, department_id from public.candidates;

insert into public.departments (name) select v from (values ('Payroll'),('Finance'),('Compliance')) t(v)
where not exists (select 1 from public.departments d where lower(d.name)=lower(t.v));

create temp table m(old text, new text, dept text) on commit drop;
insert into m values
('Account Executive','Executive','Accounts'),
('Accounts Executive','Executive','Accounts'),
('Executive Accounts','Executive','Accounts'),
('Accounts - Intern','Intern','Accounts'),
('Billing Executive','Executive','Accounts'),
('Assistant Billing Executive','Junior Executive','Accounts'),
('Assistant General Manager - Account & Finance','Assistant General Manager','Finance'),
('Manager - Accounts & Finance','Manager','Finance'),
('Assistant Manager - Payroll','Assistant Manager','Payroll'),
('Manager - Payroll','Manager','Payroll'),
('Manager - Payroll & Compliance','Manager','Payroll'),
('Executive - Payroll','Executive','Payroll'),
('Executive - HR','Executive','HR'),
('Senior HR Executive','Senior Executive','HR'),
('Senior Executive - HR','Senior Executive','HR'),
('Junior HR Executive','Junior Executive','HR'),
('Asst Manager HR','Assistant Manager','HR'),
('Manager - HR & Compliance','Manager','Compliance'),
('HR Head','Head','HR'),
('Manager - Training','Manager','Training'),
('Operations Manager','Manager','Operations'),
('Assistant Manager - Operations','Assistant Manager','Operations'),
('Assistant General Manager - Operations','Assistant General Manager','Operations'),
('DGM - Operations','Deputy General Manager','Operations'),
('Ops. & Training Manager','Manager','Operations'),
('Operations Executive','Executive','Operations'),
('Assistant Manager - Operations & Marketing','Assistant Manager','Sales & Marketing'),
('Senior Executive - Sales','Senior Executive','Sales & Marketing'),
('Senior Manager - Admin','Senior Manager','Admin'),
('Head - Control Center','Head','Control Center'),
('Lead Control','Senior Executive','Control Center'),
('Control Executive','Executive','Control Center'),
('Control Room Executive','Executive','Control Center'),
('Senior Control Executive','Senior Executive','Control Center'),
('Legal Officer','Executive','Legal'),
('Regional Head (AP & Telangana)','Regional Head','Operations'),
('Sr. Executive','Senior Executive',null),
('Asst. Vice President','Assistant Vice President',null),
('Chief Executive Officer','CEO',null),
('Body Guard','Bodyguard',null),
('CIVIL Armed Gurad','Armed Guard',null),
('Facility Attendant F','Facility Attendant',null),
('Data Entry Operator','Computer Operator',null),
('Surveillance More','Surveillance Executive',null);

-- target designations
insert into public.designations (name, code, enabled, billable)
select distinct m.new, '', true, false from m
where not exists (select 1 from public.designations d where lower(btrim(d.name))=lower(m.new));

create temp table mid on commit drop as
select o.id old_id, n.id new_id, dp.id dept_id
from m
join public.designations o on btrim(o.name)=m.old
join lateral (select id from public.designations where lower(btrim(name))=lower(m.new) order by created_at limit 1) n on true
left join public.departments dp on lower(dp.name)=lower(m.dept)
where o.id <> n.id;

update public.candidates c set department_id = x.dept_id
from mid x where c.designation_id=x.old_id and x.dept_id is not null;
update public.candidates c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
update public.candidate_units c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
delete from public.candidate_designations a using mid x where a.designation_id=x.old_id
  and exists (select 1 from public.candidate_designations b where b.candidate_id=a.candidate_id and b.designation_id=x.new_id);
update public.candidate_designations c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
update public.contract_resources c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
update public.attendance_entries c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
update public.employee_wages c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;
update public.rehire_requests c set designation_id=x.new_id from mid x where c.designation_id=x.old_id;

delete from public.designations d using mid x where d.id=x.old_id;

-- remove unused designations (nothing references them), keeping the rank ladder
delete from public.designations d
where lower(btrim(d.name)) not in ('intern','junior executive','executive','senior executive','assistant manager','manager','senior manager',
  'assistant general manager','deputy general manager','general manager','assistant vice president','vice president','senior vice president',
  'director','ceo','head','branch head','regional head','area manager')
and not exists (select 1 from public.candidates t where t.designation_id=d.id)
and not exists (select 1 from public.candidate_units t where t.designation_id=d.id)
and not exists (select 1 from public.candidate_designations t where t.designation_id=d.id)
and not exists (select 1 from public.contract_resources t where t.designation_id=d.id)
and not exists (select 1 from public.attendance_entries t where t.designation_id=d.id)
and not exists (select 1 from public.employee_wages t where t.designation_id=d.id)
and not exists (select 1 from public.rehire_requests t where t.designation_id=d.id);

commit;
