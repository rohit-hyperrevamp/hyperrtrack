CREATE TABLE IF NOT EXISTS public._schema_restore_queue(seq integer primary key, q text not null, done boolean not null default false, err text);
GRANT ALL ON public._schema_restore_queue TO service_role;
GRANT SELECT, INSERT ON public._schema_restore_queue TO sandbox_exec;
GRANT SELECT ON public._schema_restore_log TO sandbox_exec;
ALTER TABLE public._schema_restore_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sandbox reads queue" ON public._schema_restore_queue FOR SELECT TO sandbox_exec USING (true);
CREATE POLICY "sandbox fills queue" ON public._schema_restore_queue FOR INSERT TO sandbox_exec WITH CHECK (true);
CREATE POLICY "sandbox reads log" ON public._schema_restore_log FOR SELECT TO sandbox_exec USING (true);