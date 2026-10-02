DO $run$
DECLARE r record; pass int; progressed int;
BEGIN
  FOR pass IN 1..4 LOOP
    progressed := 0;
    FOR r IN SELECT seq, q FROM public._schema_restore_queue WHERE NOT done ORDER BY seq LOOP
      BEGIN
        EXECUTE r.q;
        UPDATE public._schema_restore_queue SET done = true, err = NULL WHERE seq = r.seq;
        progressed := progressed + 1;
      EXCEPTION WHEN others THEN
        UPDATE public._schema_restore_queue SET err = SQLERRM WHERE seq = r.seq;
      END;
    END LOOP;
    EXIT WHEN progressed = 0;
  END LOOP;
END $run$;