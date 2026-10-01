-- Recruitment (HR): non-billable hiring funnel. Super Admin only until a role
-- is granted the `recruitment` RBAC module. Interviewers act only on their own
-- interviews; HR Head onboarding follows workflow_definitions 'recruitment_onboarding'.

create or replace function public.current_user_is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_user_role_key(), '') = 'super_admin'
      or exists (select 1 from auth.users u where u.id = auth.uid() and u.email = 'phone-8373914073@radiantguard.local');
$$;

create or replace function public.current_user_can_recruit()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_user_is_super_admin()
      or public.current_user_has_permission('recruitment', '', 'view');
$$;

create or replace function public.current_user_can_onboard_recruit()
returns boolean language sql stable security definer set search_path = public as $$
  select public.current_user_is_super_admin()
      or exists (
        select 1 from public.workflow_steps s
        join public.workflow_definitions d on d.id = s.workflow_id
        where d.key = 'recruitment_onboarding' and d.is_active and s.is_active
          and ((s.approver_candidate_id is not null and s.approver_candidate_id = public.current_user_candidate_id())
            or (s.approver_candidate_id is null and s.approver_role_key = public.current_user_role_key()))
      );
$$;

create table if not exists public.rec_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  designation_id uuid,
  department_id uuid,
  branch_id uuid,
  positions int not null default 1,
  salary_min numeric not null default 0,
  salary_max numeric not null default 0,
  description text not null default '',
  status text not null default 'open' check (status in ('open','on_hold','closed')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rec_opening_rounds (
  id uuid primary key default gen_random_uuid(),
  opening_id uuid not null references public.rec_openings(id) on delete cascade,
  round_no int not null check (round_no between 1 and 3),
  name text not null default '',
  default_interviewer_id uuid,
  unique (opening_id, round_no)
);

create sequence if not exists public.rec_candidate_code_seq start 1001;

create table if not exists public.rec_candidates (
  id uuid primary key default gen_random_uuid(),
  code text not null default '',
  full_name text not null,
  mobile text not null default '',
  email text not null default '',
  current_location text not null default '',
  experience_years numeric not null default 0,
  current_ctc numeric not null default 0,
  expected_ctc numeric not null default 0,
  notice_days int not null default 0,
  source text not null default '',
  referred_by text not null default '',
  opening_id uuid references public.rec_openings(id) on delete set null,
  resume_path text not null default '',
  resume_name text not null default '',
  stage text not null default 'new' check (stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding','onboarded','rejected','withdrawn','on_hold')),
  total_rounds int not null default 1 check (total_rounds between 1 and 3),
  rounds_cleared int not null default 0,
  notes text not null default '',
  lost_reason text not null default '',
  offer jsonb not null default '{}'::jsonb,
  employee_candidate_id uuid,
  onboarded_at timestamptz,
  stage_changed_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rec_candidates_stage_idx on public.rec_candidates(stage);
create index if not exists rec_candidates_opening_idx on public.rec_candidates(opening_id);

create table if not exists public.rec_interviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.rec_candidates(id) on delete cascade,
  round_no int not null check (round_no between 1 and 3),
  round_name text not null default '',
  interviewer_id uuid not null,
  scheduled_at timestamptz not null,
  mode text not null default 'in_person' check (mode in ('in_person','phone','video')),
  location text not null default '',
  status text not null default 'scheduled' check (status in ('scheduled','approved','rejected','cancelled')),
  feedback text not null default '',
  rating int,
  decided_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists rec_interviews_interviewer_idx on public.rec_interviews(interviewer_id, status);
create index if not exists rec_interviews_candidate_idx on public.rec_interviews(candidate_id);

create table if not exists public.rec_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.rec_candidates(id) on delete cascade,
  event text not null,
  details text not null default '',
  actor_id uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists rec_events_candidate_idx on public.rec_events(candidate_id, created_at desc);

create table if not exists public.rec_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.rec_candidates(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','onboarded','sent_back')),
  offer jsonb not null default '{}'::jsonb,
  requested_by uuid default auth.uid(),
  decided_by uuid,
  decided_at timestamptz,
  decision_note text not null default '',
  employee_candidate_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists rec_onb_status_idx on public.rec_onboarding_requests(status);

grant select, insert, update, delete on public.rec_openings, public.rec_opening_rounds, public.rec_candidates,
  public.rec_interviews, public.rec_events, public.rec_onboarding_requests to authenticated;
grant all on public.rec_openings, public.rec_opening_rounds, public.rec_candidates,
  public.rec_interviews, public.rec_events, public.rec_onboarding_requests to service_role;
grant usage on sequence public.rec_candidate_code_seq to authenticated, service_role;

alter table public.rec_openings enable row level security;
alter table public.rec_opening_rounds enable row level security;
alter table public.rec_candidates enable row level security;
alter table public.rec_interviews enable row level security;
alter table public.rec_events enable row level security;
alter table public.rec_onboarding_requests enable row level security;

create policy rec_openings_all on public.rec_openings for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_rounds_all on public.rec_opening_rounds for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_candidates_all on public.rec_candidates for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_candidates_interviewer_read on public.rec_candidates for select to authenticated
  using (exists (select 1 from public.rec_interviews i where i.candidate_id = rec_candidates.id and i.interviewer_id = (select public.current_user_candidate_id())));
create policy rec_candidates_onboarder_read on public.rec_candidates for select to authenticated
  using ((select public.current_user_can_onboard_recruit()) and stage in ('pending_onboarding','onboarded'));
create policy rec_interviews_all on public.rec_interviews for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_interviews_own_read on public.rec_interviews for select to authenticated
  using (interviewer_id = (select public.current_user_candidate_id()));
create policy rec_events_all on public.rec_events for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_onb_all on public.rec_onboarding_requests for all to authenticated
  using ((select public.current_user_can_recruit())) with check ((select public.current_user_can_recruit()));
create policy rec_onb_onboarder_read on public.rec_onboarding_requests for select to authenticated
  using ((select public.current_user_can_onboard_recruit()));

-- Code + stage history
create or replace function public.rec_candidates_before() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and (new.code is null or new.code = '') then
    new.code := 'REC' || nextval('public.rec_candidate_code_seq');
  end if;
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    if new.stage is distinct from old.stage then new.stage_changed_at := now(); end if;
  end if;
  return new;
end; $$;
drop trigger if exists trg_rec_candidates_before on public.rec_candidates;
create trigger trg_rec_candidates_before before insert or update on public.rec_candidates
  for each row execute function public.rec_candidates_before();

create or replace function public.rec_candidates_after() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.rec_events(candidate_id, event, details) values (new.id, 'created', 'Candidate added');
  elsif new.stage is distinct from old.stage then
    insert into public.rec_events(candidate_id, event, details) values (new.id, 'stage', old.stage || ' → ' || new.stage);
  end if;
  return null;
end; $$;
drop trigger if exists trg_rec_candidates_after on public.rec_candidates;
create trigger trg_rec_candidates_after after insert or update of stage on public.rec_candidates
  for each row execute function public.rec_candidates_after();

-- Interviewer decision: approve → next round / HR Approved; reject → Rejected.
create or replace function public.rec_submit_interview_result(_interview_id uuid, _decision text, _feedback text, _rating int)
returns text language plpgsql security definer set search_path = public as $$
declare i record; c record; _next text;
begin
  if _decision not in ('approved','rejected') then raise exception 'Invalid decision'; end if;
  if coalesce(trim(_feedback), '') = '' then raise exception 'Feedback is required'; end if;
  select * into i from public.rec_interviews where id = _interview_id for update;
  if not found then raise exception 'Interview not found'; end if;
  if not (i.interviewer_id = public.current_user_candidate_id() or public.current_user_can_recruit()) then
    raise exception 'Not allowed';
  end if;
  if i.status <> 'scheduled' then raise exception 'This interview already has a result'; end if;
  update public.rec_interviews set status = _decision, feedback = _feedback, rating = _rating, decided_at = now() where id = i.id;
  select * into c from public.rec_candidates where id = i.candidate_id for update;
  if _decision = 'rejected' then
    _next := 'rejected';
    update public.rec_candidates set stage = 'rejected', lost_reason = 'Rejected in round ' || i.round_no || ': ' || _feedback where id = c.id;
  else
    if i.round_no >= c.total_rounds then _next := 'hr_approved'; else _next := 'round_' || (i.round_no + 1); end if;
    update public.rec_candidates set stage = _next, rounds_cleared = greatest(rounds_cleared, i.round_no) where id = c.id;
  end if;
  insert into public.rec_events(candidate_id, event, details)
    values (c.id, 'interview_' || _decision, 'Round ' || i.round_no || ' (' || i.round_name || '): ' || _feedback);
  return _next;
end; $$;
revoke all on function public.rec_submit_interview_result(uuid, text, text, int) from public, anon;
grant execute on function public.rec_submit_interview_result(uuid, text, text, int) to authenticated;

-- HR Head onboarding: creates the employee; set_employee_code assigns the ID.
create or replace function public.rec_onboard_candidate(_request_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare r record; c record; o jsonb; _new uuid; _code text;
begin
  if not public.current_user_can_onboard_recruit() then raise exception 'Not allowed'; end if;
  select * into r from public.rec_onboarding_requests where id = _request_id for update;
  if not found or r.status <> 'pending' then raise exception 'Request is not pending'; end if;
  select * into c from public.rec_candidates where id = r.candidate_id for update;
  o := r.offer;
  if coalesce(c.mobile, '') <> '' and exists (select 1 from public.candidates where mobile = c.mobile) then
    raise exception 'An employee with mobile % already exists', c.mobile;
  end if;
  insert into public.candidates(full_name, mobile, email, designation_id, department_id, unit_id, reports_to,
      preferred_joining_date, non_billable, status, role_key, onboarding_details)
  values (c.full_name, c.mobile, c.email,
      nullif(o->>'designation_id','')::uuid, nullif(o->>'department_id','')::uuid,
      coalesce(nullif(o->>'unit_id','')::uuid, '92541381-14d3-4be6-ae8c-078b79c2e0f1'::uuid),
      nullif(o->>'reports_to','')::uuid, nullif(o->>'joining_date','')::date,
      true, 'approved', coalesce(o->>'role_key',''),
      jsonb_build_object('recruitment', jsonb_build_object('rec_candidate_id', c.id, 'code', c.code, 'offer', o)))
  returning id, employee_code into _new, _code;
  update public.rec_onboarding_requests set status = 'onboarded', decided_by = auth.uid(), decided_at = now(), employee_candidate_id = _new where id = r.id;
  update public.rec_candidates set stage = 'onboarded', employee_candidate_id = _new, onboarded_at = now() where id = c.id;
  insert into public.rec_events(candidate_id, event, details) values (c.id, 'onboarded', 'Employee ID ' || _code);
  return _code;
end; $$;
revoke all on function public.rec_onboard_candidate(uuid) from public, anon;
grant execute on function public.rec_onboard_candidate(uuid) to authenticated;

create or replace function public.rec_send_back(_request_id uuid, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if not public.current_user_can_onboard_recruit() then raise exception 'Not allowed'; end if;
  select * into r from public.rec_onboarding_requests where id = _request_id for update;
  if not found or r.status <> 'pending' then raise exception 'Request is not pending'; end if;
  update public.rec_onboarding_requests set status = 'sent_back', decided_by = auth.uid(), decided_at = now(), decision_note = coalesce(_note,'') where id = r.id;
  update public.rec_candidates set stage = 'hr_approved' where id = r.candidate_id;
  insert into public.rec_events(candidate_id, event, details) values (r.candidate_id, 'sent_back', coalesce(_note,''));
end; $$;
revoke all on function public.rec_send_back(uuid, text) from public, anon;
grant execute on function public.rec_send_back(uuid, text) to authenticated;

-- Approver list for notifications (data-driven from workflow).
create or replace function public.get_recruitment_onboarder_user_ids()
returns table(user_id uuid) language sql stable security definer set search_path = public as $$
  select distinct u.id from public.workflow_steps s
  join public.workflow_definitions d on d.id = s.workflow_id
  join public.candidates c on (s.approver_candidate_id = c.id) or (s.approver_candidate_id is null and c.role_key = s.approver_role_key)
  join auth.users u on u.email = 'phone-' || c.mobile || '@radiantguard.local'
  where d.key = 'recruitment_onboarding' and d.is_active and s.is_active and c.status in ('approved','active');
$$;
grant execute on function public.get_recruitment_onboarder_user_ids() to authenticated;

insert into public.workflow_definitions(key, name, description, entity_type, route_path)
values ('recruitment_onboarding', 'Recruitment Onboarding', 'HR-approved recruits go to the HR Head to onboard and generate an employee ID.', 'recruitment', '/admin/hr/recruitment/onboarding')
on conflict (key) do nothing;
insert into public.workflow_steps(workflow_id, step_order, key, name, description, approver_role_key, action_label)
select d.id, 1, 'hr_head_onboard', 'HR Head onboarding', 'Review offer and onboard', 'hr', 'Onboard'
from public.workflow_definitions d where d.key = 'recruitment_onboarding'
  and not exists (select 1 from public.workflow_steps s where s.workflow_id = d.id);

-- Private resume storage
insert into storage.buckets(id, name, public) values ('recruitment', 'recruitment', false) on conflict (id) do nothing;
drop policy if exists recruitment_files_all on storage.objects;
create policy recruitment_files_all on storage.objects for all to authenticated
  using (bucket_id = 'recruitment' and (select public.current_user_can_recruit()))
  with check (bucket_id = 'recruitment' and (select public.current_user_can_recruit()));
drop policy if exists recruitment_files_interviewer_read on storage.objects;
create policy recruitment_files_interviewer_read on storage.objects for select to authenticated
  using (bucket_id = 'recruitment' and exists (
    select 1 from public.rec_candidates rc join public.rec_interviews i on i.candidate_id = rc.id
    where rc.resume_path = objects.name and i.interviewer_id = (select public.current_user_candidate_id())));
