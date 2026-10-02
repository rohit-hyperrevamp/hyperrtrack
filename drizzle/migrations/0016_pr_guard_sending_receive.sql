CREATE OR REPLACE FUNCTION public.rail_pr_guard() RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE internal boolean := current_setting('rail.internal', true) = 'on';
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'ordered' THEN
      IF OLD.status NOT IN ('requested','approved') THEN RAISE EXCEPTION 'This request can no longer be ordered'; END IF;
      IF NOT public.rail_is_hq() THEN RAISE EXCEPTION 'Only head office can buy from suppliers'; END IF;
      IF NEW.vendor_id IS NULL THEN RAISE EXCEPTION 'Choose a supplier before ordering'; END IF;
      NEW.ordered_at := now(); NEW.approved_by := COALESCE(NEW.approved_by, auth.uid()); NEW.approved_at := COALESCE(NEW.approved_at, now());
      NEW.po_number := COALESCE(NEW.po_number, 'PO-' || to_char(now(),'YYMMDD') || '-' || upper(substr(NEW.id::text,1,4)));
    ELSIF NEW.status = 'rejected' THEN
      IF OLD.status NOT IN ('requested','approved') THEN RAISE EXCEPTION 'Too late to reject'; END IF;
      IF NOT public.rail_is_hq() THEN RAISE EXCEPTION 'Only head office can reject requests'; END IF;
    ELSIF NEW.status = 'received' THEN
      IF NOT (OLD.status = 'ordered' OR (OLD.status = 'sending' AND internal)) THEN RAISE EXCEPTION 'Only supplier orders can be received here'; END IF;
    ELSIF NEW.status IN ('sending','refused','approved') THEN
      IF NOT internal THEN RAISE EXCEPTION 'Use the Send from head office action'; END IF;
    END IF;
  END IF;
  RETURN NEW;
END $function$;