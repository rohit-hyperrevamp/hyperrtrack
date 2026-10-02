-- Interviewers can read the timeline and opening title for candidates they interview.
-- Previously rec_events and rec_openings were recruiter-only, so an assigned
-- interviewer saw an empty Timeline and no position name.

create policy rec_events_interviewer_read on public.rec_events for select to authenticated
  using (exists (
    select 1 from public.rec_interviews i
    where i.candidate_id = rec_events.candidate_id
      and i.interviewer_id = (select public.current_user_candidate_id())
  ));

create policy rec_openings_interviewer_read on public.rec_openings for select to authenticated
  using (exists (
    select 1 from public.rec_candidates c
    join public.rec_interviews i on i.candidate_id = c.id
    where c.opening_id = rec_openings.id
      and i.interviewer_id = (select public.current_user_candidate_id())
  ));
