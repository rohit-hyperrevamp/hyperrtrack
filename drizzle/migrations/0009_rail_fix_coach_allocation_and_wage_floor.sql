CREATE OR REPLACE FUNCTION public.rail_min_wage(_location uuid, _skill text, _on date DEFAULT CURRENT_DATE) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  -- Latest rule already in force; minimum wages never fall, so a lapsed row stays the floor until the next revision is entered.
  SELECT w.total_per_day FROM rail_wage_rules w
  WHERE w.deleted_at IS NULL AND w.skill = _skill AND w.effective_from <= _on
    AND w.area_class = COALESCE((SELECT l.area_class FROM rail_locations l WHERE l.id IN (SELECT public.rail_location_ancestors(_location)) AND l.area_class IS NOT NULL LIMIT 1), 'A')
  ORDER BY w.effective_from DESC LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.rail_plan_day(_date date, _location uuid DEFAULT NULL) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; st uuid; ev uuid; n int := 0; dow int := extract(isodow FROM _date)::int; con uuid;
BEGIN
  FOR s IN SELECT ts.*, t.days_of_run FROM rail_train_schedules ts JOIN rail_trains t ON t.id = ts.train_id
    WHERE ts.deleted_at IS NULL AND t.deleted_at IS NULL AND dow = ANY(t.days_of_run)
      AND (_location IS NULL OR ts.location_id IN (SELECT id FROM rail_locations l WHERE _location IN (SELECT public.rail_location_ancestors(l.id))))
  LOOP
    IF NOT public.rail_can('rail_ops','create', s.location_id) THEN CONTINUE; END IF;
    SELECT cs.contract_id INTO con FROM rail_contract_sites cs JOIN rail_contracts c ON c.id = cs.contract_id
      WHERE cs.deleted_at IS NULL AND c.deleted_at IS NULL AND cs.location_id IN (SELECT public.rail_location_ancestors(s.location_id)) LIMIT 1;
    FOREACH st IN ARRAY s.service_type_ids LOOP
      INSERT INTO rail_events(event_date, train_id, location_id, service_type_id, contract_id, planned_start, planned_end, shift_id)
      VALUES (_date, s.train_id, s.location_id, st, con,
        (_date + COALESCE(s.arrival, '06:00'::time))::timestamptz,
        (_date + COALESCE(s.arrival, '06:00'::time))::timestamptz + make_interval(mins => COALESCE(s.dwell_minutes, (SELECT default_window_minutes FROM rail_service_types WHERE id = st))),
        (SELECT id FROM rail_shifts WHERE deleted_at IS NULL AND COALESCE(s.arrival,'06:00') >= start_time AND COALESCE(s.arrival,'06:00') < end_time LIMIT 1))
      ON CONFLICT DO NOTHING RETURNING id INTO ev;
      IF ev IS NULL THEN CONTINUE; END IF;
      n := n + 1;
      -- Each position gets a distinct coach of its type; if the pool runs out the coach is left blank for the supervisor to fill.
      INSERT INTO rail_event_coaches(event_id, position, coach_type_id, coach_id)
      WITH comp AS (
        SELECT sc.position, sc.coach_type_id, row_number() OVER (PARTITION BY sc.coach_type_id ORDER BY sc.position) rn
        FROM rail_standard_compositions sc WHERE sc.train_id = s.train_id AND sc.deleted_at IS NULL),
      pool AS (
        SELECT c.id, c.coach_type_id, row_number() OVER (PARTITION BY c.coach_type_id ORDER BY hashtext(c.id::text || s.train_id::text)) rn
        FROM rail_coaches c WHERE c.status = 'active' AND c.deleted_at IS NULL
          AND NOT EXISTS (SELECT 1 FROM rail_event_coaches x JOIN rail_events e ON e.id = x.event_id WHERE x.coach_id = c.id AND e.event_date = _date AND e.service_type_id = st AND x.deleted_at IS NULL))
      SELECT ev, comp.position, comp.coach_type_id, pool.id FROM comp LEFT JOIN pool ON pool.coach_type_id = comp.coach_type_id AND pool.rn = comp.rn
      ORDER BY comp.position;
      INSERT INTO rail_event_tasks(event_coach_id, task_template_id, task_name, standard_minutes)
      SELECT ec.id, tt.id, tt.task_name, tt.standard_minutes FROM rail_event_coaches ec
      JOIN rail_task_templates tt ON tt.deleted_at IS NULL AND tt.service_type_id = st AND (tt.coach_type_id IS NULL OR tt.coach_type_id = ec.coach_type_id)
      WHERE ec.event_id = ev;
      ev := NULL;
    END LOOP;
  END LOOP;
  RETURN n;
END $$;