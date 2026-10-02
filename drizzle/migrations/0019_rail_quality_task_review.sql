-- Quality reviewers can read task metadata only at their authorized locations.
CREATE POLICY "rail quality task review" ON public.rail_event_tasks FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND public.rail_can('rail_quality', 'view', location_id));
