-- A cleaner must be on an active shift before accepting assigned work.
CREATE OR REPLACE FUNCTION public.rail_accept_task(_task uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE task_location uuid;
BEGIN
  SELECT location_id INTO task_location FROM public.rail_event_tasks
  WHERE id = _task AND assigned_to = auth.uid() AND status = 'pending' AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This task is not assigned to you or has already started'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.rail_attendance a
    JOIN public.rail_people p ON p.id = a.person_id
    WHERE p.mobile = public.rail_my_mobile() AND p.enabled AND p.deleted_at IS NULL
      AND a.work_date = CURRENT_DATE AND a.check_in IS NOT NULL AND a.check_out IS NULL AND a.deleted_at IS NULL
      AND (a.location_id = task_location OR a.location_id IN (SELECT public.rail_location_ancestors(task_location)))
  ) THEN RAISE EXCEPTION 'Check in at your work location before starting a task'; END IF;
  UPDATE public.rail_event_tasks SET status = 'in_progress', accepted_at = now(), accepted_by = auth.uid(),
    started_at = COALESCE(started_at, now()) WHERE id = _task;
END $$;
REVOKE ALL ON FUNCTION public.rail_accept_task(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rail_accept_task(uuid) TO authenticated;
