ALTER TABLE public.rail_event_tasks ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE public.rail_event_tasks ADD COLUMN IF NOT EXISTS accepted_by uuid;
CREATE OR REPLACE FUNCTION public.rail_assign_task(_task uuid, _assignee uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record; target record; actor_rank int;
BEGIN
  SELECT id, location_id, status INTO t FROM rail_event_tasks WHERE id = _task AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND OR t.status NOT IN ('pending','in_progress') THEN RAISE EXCEPTION 'Only open tasks can be assigned'; END IF;
  IF NOT public.rail_can('rail_ops','edit',t.location_id) THEN RAISE EXCEPTION 'You cannot assign work here'; END IF;
  SELECT min(CASE role_key WHEN 'super_admin' THEN 1 WHEN 'project_head' THEN 2 WHEN 'depot_manager' THEN 3 WHEN 'shift_supervisor' THEN 4 ELSE 100 END)
    INTO actor_rank FROM public.rail_my_roles();
  SELECT p.role_key, p.scope_type, p.scope_location_id, p.scope_contract_id INTO target
    FROM rail_people p JOIN auth.users u ON u.email = 'phone-' || p.mobile || '@radiantguard.local'
    WHERE u.id = _assignee AND p.enabled AND p.deleted_at IS NULL
      AND p.valid_from <= current_date AND (p.valid_to IS NULL OR p.valid_to >= current_date);
  IF NOT FOUND THEN RAISE EXCEPTION 'Worker must sign in before receiving work'; END IF;
  IF target.role_key <> 'cleaner' THEN RAISE EXCEPTION 'Choose a cleaner for this task'; END IF;
  IF actor_rank IS NULL OR actor_rank >= 5 THEN RAISE EXCEPTION 'Only a higher-level manager may assign a cleaner'; END IF;
  IF target.scope_type <> 'all' AND NOT (
    target.scope_location_id IN (SELECT public.rail_location_ancestors(t.location_id))
    OR (target.scope_type = 'contract' AND EXISTS (
      SELECT 1 FROM rail_contract_sites cs WHERE cs.contract_id = target.scope_contract_id
        AND cs.deleted_at IS NULL AND cs.location_id IN (SELECT public.rail_location_ancestors(t.location_id))
    ))
  ) THEN RAISE EXCEPTION 'Worker is outside this depot'; END IF;
  UPDATE rail_event_tasks SET assigned_to = _assignee, accepted_at = NULL, accepted_by = NULL, status = 'pending' WHERE id = _task;
END $$;
CREATE OR REPLACE FUNCTION public.rail_accept_task(_task uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE rail_event_tasks SET status = 'in_progress', accepted_at = now(), accepted_by = auth.uid(),
    started_at = COALESCE(started_at,now())
  WHERE id = _task AND assigned_to = auth.uid() AND status = 'pending' AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'This task is not assigned to you or has already started'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.rail_assign_task(uuid,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rail_accept_task(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rail_assign_task(uuid,uuid), public.rail_accept_task(uuid) TO authenticated;