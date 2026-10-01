-- Recruitment visibility and hiring classification.

alter table public.rec_openings
  add column if not exists workforce_class text not null default 'white_collar'
    check (workforce_class in ('blue_collar', 'white_collar')),
  add column if not exists billing_class text not null default 'non_billable'
    check (billing_class in ('billable', 'non_billable'));

create or replace function public.current_user_created_recruitment_candidate(_candidate_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rec_candidates c
    where c.id = _candidate_id and c.created_by = auth.uid()
  ) or exists (
    select 1 from public.rec_interviews i
    where i.candidate_id = _candidate_id and i.created_by = auth.uid()
  );
$$;

revoke all on function public.current_user_created_recruitment_candidate(uuid) from public, anon;
grant execute on function public.current_user_created_recruitment_candidate(uuid) to authenticated;

create policy rec_interviews_creator_read on public.rec_interviews for select to authenticated
  using (created_by = auth.uid());

create policy rec_candidates_creator_read on public.rec_candidates for select to authenticated
  using ((select public.current_user_created_recruitment_candidate(id)));

create or replace function public.recruitment_leadership_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not (
    public.current_user_is_super_admin()
    or public.current_user_has_permission('recruitment', '', 'view')
    or public.current_user_role_key() in ('leadership', 'admin')
  ) then
    raise exception 'Not allowed';
  end if;

  select jsonb_build_object(
    'pipeline', coalesce((select count(*) from public.rec_candidates where stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding')), 0),
    'blue_collar', coalesce((select count(*) from public.rec_candidates c join public.rec_openings o on o.id = c.opening_id where c.stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding') and o.workforce_class = 'blue_collar'), 0),
    'white_collar', coalesce((select count(*) from public.rec_candidates c join public.rec_openings o on o.id = c.opening_id where c.stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding') and o.workforce_class = 'white_collar'), 0),
    'billable', coalesce((select count(*) from public.rec_candidates c join public.rec_openings o on o.id = c.opening_id where c.stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding') and o.billing_class = 'billable'), 0),
    'non_billable', coalesce((select count(*) from public.rec_candidates c join public.rec_openings o on o.id = c.opening_id where c.stage in ('new','screening','round_1','round_2','round_3','hr_approved','pending_onboarding') and o.billing_class = 'non_billable'), 0),
    'upcoming', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'candidate_id', c.id,
        'candidate_code', c.code,
        'candidate_name', c.full_name,
        'round_no', i.round_no,
        'round_name', i.round_name,
        'scheduled_at', i.scheduled_at,
        'workforce_class', o.workforce_class,
        'billing_class', o.billing_class
      ) order by i.scheduled_at)
      from public.rec_interviews i
      join public.rec_candidates c on c.id = i.candidate_id
      left join public.rec_openings o on o.id = c.opening_id
      where i.status = 'scheduled' and i.scheduled_at >= now() and i.scheduled_at < now() + interval '7 days'
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.recruitment_leadership_summary() from public, anon;
grant execute on function public.recruitment_leadership_summary() to authenticated;