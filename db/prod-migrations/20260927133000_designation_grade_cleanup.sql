-- Consolidate abbreviated and grade-suffixed operational designations.
-- Preserve genuinely distinct jobs; remove only aliases and meaningless A/B grades.
begin;

create table if not exists public._bkp_designations_grade_cleanup_20260927 as
select * from public.designations;
create table if not exists public._bkp_candidates_grade_cleanup_20260927 as
select id, designation_id, department_id from public.candidates;
create table if not exists public._bkp_candidate_units_grade_cleanup_20260927 as
select * from public.candidate_units;
create table if not exists public._bkp_candidate_designations_grade_cleanup_20260927 as
select * from public.candidate_designations;
create table if not exists public._bkp_contract_resources_grade_cleanup_20260927 as
select * from public.contract_resources;
create table if not exists public._bkp_attendance_entries_grade_cleanup_20260927 as
select * from public.attendance_entries;
create table if not exists public._bkp_employee_wages_grade_cleanup_20260927 as
select * from public.employee_wages;
create table if not exists public._bkp_rehire_requests_grade_cleanup_20260927 as
select * from public.rehire_requests;

create temp table designation_merge(old_name text, new_name text) on commit drop;
insert into designation_merge values
  ('CCT', 'CCTV Operator'),
  ('CCTV Operator "A"', 'CCTV Operator'),
  ('CCTV Operator  "B"', 'CCTV Operator'),
  ('Fire Man - A', 'Fireman'),
  ('Driver Cum Pump Operator - A', 'Driver Cum Pump Operator'),
  ('ARG', 'Armed Guard'),
  ('TSM (CAHOT)', 'Trust & Safety Manager'),
  ('CAHOT', 'Trust & Safety Officer'),
  ('EXC', 'Executive');

insert into public.designations (name, code, enabled, billable)
select distinct m.new_name, '', true, false
from designation_merge m
where not exists (
  select 1 from public.designations d where lower(btrim(d.name)) = lower(m.new_name)
);

create temp table designation_ids on commit drop as
select old_d.id old_id, new_d.id new_id
from designation_merge m
join public.designations old_d on btrim(old_d.name) = m.old_name
join lateral (
  select id from public.designations
  where lower(btrim(name)) = lower(m.new_name)
  order by created_at, id limit 1
) new_d on true
where old_d.id <> new_d.id;

update public.candidates c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;

-- Avoid unique-line collisions when an employee already has both alias and canonical postings.
delete from public.candidate_units a using designation_ids x
where a.designation_id=x.old_id
  and exists (
    select 1 from public.candidate_units b
    where b.candidate_id=a.candidate_id
      and b.unit_id=a.unit_id
      and b.designation_id=x.new_id
      and b.shift_hours is not distinct from a.shift_hours
      and b.is_reliever is not distinct from a.is_reliever
  );
update public.candidate_units c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;

-- Avoid duplicate secondary-designation records for the same employee.
delete from public.candidate_designations a using designation_ids x
where a.designation_id=x.old_id
  and exists (
    select 1 from public.candidate_designations b
    where b.candidate_id=a.candidate_id and b.designation_id=x.new_id
  );
update public.candidate_designations c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;

update public.contract_resources c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;
update public.attendance_entries c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;
update public.employee_wages c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;
update public.rehire_requests c set designation_id=x.new_id
from designation_ids x where c.designation_id=x.old_id;

delete from public.designations d using designation_ids x where d.id=x.old_id;

commit;
