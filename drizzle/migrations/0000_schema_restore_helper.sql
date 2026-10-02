CREATE TABLE IF NOT EXISTS public._schema_restore_log(id bigserial primary key, stmt text, err text, at timestamptz default now());
GRANT ALL ON public._schema_restore_log TO service_role;
ALTER TABLE public._schema_restore_log ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public._try(q text) RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
  EXECUTE q;
EXCEPTION WHEN others THEN
  INSERT INTO public._schema_restore_log(stmt, err) VALUES (left(q, 400), SQLERRM);
END $f$;
REVOKE ALL ON FUNCTION public._try(text) FROM PUBLIC, anon, authenticated;