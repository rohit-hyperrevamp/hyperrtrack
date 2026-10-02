-- Add feedback and history to rail_event_tasks
ALTER TABLE public.rail_event_tasks
  ADD COLUMN IF NOT EXISTS supervisor_score numeric,
  ADD COLUMN IF NOT EXISTS supervisor_feedback text,
  ADD COLUMN IF NOT EXISTS history jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Ensure storage bucket exists for task photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('rail-task-photos', 'rail-task-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "rail_task_photos_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'rail-task-photos');
CREATE POLICY "rail_task_photos_auth_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rail-task-photos');
CREATE POLICY "rail_task_photos_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'rail-task-photos');

-- Grant permissions for new columns
GRANT UPDATE(supervisor_score, supervisor_feedback, history) ON public.rail_event_tasks TO authenticated;

-- Link completed_by to rail_people if possible (optional but helpful for the join)
-- This assumes rail_people.id is what's stored in completed_by, 
-- but often it's auth.uid(). If it's auth.uid(), we join via rail_people.user_id.
-- For this implementation, we'll assume a standard join is needed.
