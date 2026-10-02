-- Interviewer or recruiter can reschedule a scheduled interview; logs reason + availability.
create or replace function public.rec_reschedule_interview(_interview_id uuid, _new_at timestamptz, _reason text, _availability text)
returns table(candidate_id uuid, interviewer_user_id uuid, creator_user_id uuid)
language plpgsql security definer set search_path = public as $$
declare r public.rec_interviews;
begin
  select * into r from public.rec_interviews where id = _interview_id;
  if r.id is null then raise exception 'Interview not found'; end if;
  if r.status <> 'scheduled' then raise exception 'Only scheduled interviews can be rescheduled'; end if;
  if not (public.current_user_can_recruit() or r.interviewer_id = public.current_user_candidate_id()) then
    raise exception 'Not allowed';
  end if;
  if coalesce(trim(_reason), '') = '' then raise exception 'Reason is required'; end if;
  update public.rec_interviews set scheduled_at = _new_at where id = _interview_id;
  insert into public.rec_events(candidate_id, event, details)
  values (r.candidate_id, 'interview_rescheduled',
    format('Round %s moved from %s to %s IST. Reason: %s%s', r.round_no,
      to_char(r.scheduled_at at time zone 'Asia/Kolkata', 'DD Mon HH12:MI AM'),
      to_char(_new_at at time zone 'Asia/Kolkata', 'DD Mon HH12:MI AM'),
      trim(_reason), case when coalesce(trim(_availability), '') <> '' then '. Availability: ' || trim(_availability) else '' end));
  return query select r.candidate_id, public.get_user_id_by_candidate_id(r.interviewer_id), r.created_by;
end $$;
grant execute on function public.rec_reschedule_interview(uuid, timestamptz, text, text) to authenticated;
