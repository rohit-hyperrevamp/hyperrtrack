ALTER TABLE public.rail_purchase_requests DROP CONSTRAINT IF EXISTS rail_purchase_requests_status_check;
ALTER TABLE public.rail_purchase_requests ADD CONSTRAINT rail_purchase_requests_status_check CHECK (status = ANY (ARRAY['requested','approved','ordered','sending','rejected','refused','received']));
ALTER TABLE public.rail_purchase_requests ADD COLUMN IF NOT EXISTS decision_note text;
ALTER TABLE public.rail_stock_transfers ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.rail_purchase_requests(id);
ALTER TABLE public.rail_stock_transfers ADD COLUMN IF NOT EXISTS refuse_reason text;

-- Head office = whoever can manage the main store (super admin, or scope covering it).
CREATE OR REPLACE FUNCTION public.rail_main_store_id() RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT NULLIF(text_value,'')::uuid FROM rail_settings_kv WHERE key='main_store_id' AND deleted_at IS NULL AND effective_to IS NULL ORDER BY created_at DESC LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.rail_is_hq() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.is_admin_user() OR (public.rail_main_store_id() IS NOT NULL AND public.rail_can('rail_supplies','edit',public.rail_main_store_id()))
$$;
GRANT EXECUTE ON FUNCTION public.rail_main_store_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rail_is_hq() TO authenticated;

-- Head office sees every store's stock, requests and transfers.
DROP POLICY IF EXISTS "rail read" ON public.rail_item_batches;
CREATE POLICY "rail read" ON public.rail_item_batches FOR SELECT TO authenticated USING (deleted_at IS NULL AND (rail_can('rail_supplies','view',location_id) OR rail_is_hq()));
DROP POLICY IF EXISTS "rail read" ON public.rail_purchase_requests;
CREATE POLICY "rail read" ON public.rail_purchase_requests FOR SELECT TO authenticated USING (deleted_at IS NULL AND (rail_can('rail_supplies','view',location_id) OR rail_is_hq()));
DROP POLICY IF EXISTS "rail edit" ON public.rail_purchase_requests;
CREATE POLICY "rail edit" ON public.rail_purchase_requests FOR UPDATE TO authenticated USING (rail_can('rail_supplies','edit',location_id) OR rail_is_hq());
DROP POLICY IF EXISTS "rail read" ON public.rail_stock_transfers;
CREATE POLICY "rail read" ON public.rail_stock_transfers FOR SELECT TO authenticated USING (deleted_at IS NULL AND (rail_can('rail_supplies','view',from_location_id) OR rail_can('rail_supplies','view',to_location_id) OR rail_is_hq()));

CREATE OR REPLACE FUNCTION public.rail_pr_guard() RETURNS trigger LANGUAGE plpgsql AS $function$
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
      IF OLD.status <> 'ordered' THEN RAISE EXCEPTION 'Only supplier orders can be received here'; END IF;
    ELSIF NEW.status IN ('sending','refused','approved') THEN
      IF current_setting('rail.internal', true) IS DISTINCT FROM 'on' THEN RAISE EXCEPTION 'Use the Send from head office action'; END IF;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

-- Head office fulfils a store request from the main store: stock leaves now (oldest expiry first).
CREATE OR REPLACE FUNCTION public.rail_send_stock(_item uuid, _from uuid, _to uuid, _qty numeric, _note text DEFAULT NULL, _request uuid DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b record; left_qty numeric := _qty; take numeric; avail numeric; tid uuid; pr rail_purchase_requests;
BEGIN
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Enter a quantity above 0'; END IF;
  IF _from = _to THEN RAISE EXCEPTION 'Choose two different stores'; END IF;
  IF NOT (rail_can('rail_supplies','edit',_from) OR rail_is_hq()) THEN RAISE EXCEPTION 'You do not manage the sending store'; END IF;
  IF _request IS NOT NULL THEN
    SELECT * INTO pr FROM rail_purchase_requests WHERE id=_request AND deleted_at IS NULL FOR UPDATE;
    IF NOT FOUND OR pr.status NOT IN ('requested','approved') THEN RAISE EXCEPTION 'This request is already handled'; END IF;
    IF NOT rail_is_hq() THEN RAISE EXCEPTION 'Only head office fulfils requests'; END IF;
    _to := pr.location_id; _item := pr.item_id;
  END IF;
  SELECT COALESCE(sum(qty_on_hand),0) INTO avail FROM rail_item_batches WHERE item_id=_item AND location_id=_from AND deleted_at IS NULL AND qty_on_hand>0 AND (expiry_date IS NULL OR expiry_date>=current_date);
  IF avail < _qty THEN RAISE EXCEPTION 'Only % in stock (not expired) at the sending store', avail; END IF;
  FOR b IN SELECT id, qty_on_hand FROM rail_item_batches WHERE item_id=_item AND location_id=_from AND deleted_at IS NULL AND qty_on_hand>0 AND (expiry_date IS NULL OR expiry_date>=current_date) ORDER BY expiry_date NULLS LAST, created_at LOOP
    EXIT WHEN left_qty <= 0;
    take := LEAST(b.qty_on_hand, left_qty);
    UPDATE rail_item_batches SET qty_on_hand = qty_on_hand - take WHERE id=b.id;
    left_qty := left_qty - take;
  END LOOP;
  INSERT INTO rail_stock_transfers(item_id, from_location_id, to_location_id, qty, note, status, requested_by, approved_by, approved_at, dispatched_at, request_id)
    VALUES (_item, _from, _to, _qty, _note, 'dispatched', auth.uid(), auth.uid(), now(), now(), _request) RETURNING id INTO tid;
  IF _request IS NOT NULL THEN
    PERFORM set_config('rail.internal','on',true);
    UPDATE rail_purchase_requests SET status='sending', approved_by=auth.uid(), approved_at=now() WHERE id=_request;
    PERFORM set_config('rail.internal','off',true);
  END IF;
  RETURN tid;
END $$;
GRANT EXECUTE ON FUNCTION public.rail_send_stock(uuid,uuid,uuid,numeric,text,uuid) TO authenticated;

-- Receiving store accepts (stock added) or refuses with a reason (stock goes back to the sender).
CREATE OR REPLACE FUNCTION public.rail_transfer_step(_id uuid, _action text, _reason text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE t rail_stock_transfers; exp date;
BEGIN
  SELECT * INTO t FROM rail_stock_transfers WHERE id=_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF t.status <> 'dispatched' THEN RAISE EXCEPTION 'This delivery is already handled'; END IF;
  IF NOT (rail_can('rail_supplies','edit',t.to_location_id) OR is_admin_user()) THEN RAISE EXCEPTION 'Only the receiving store can do this'; END IF;
  SELECT min(expiry_date) INTO exp FROM rail_item_batches WHERE item_id=t.item_id AND location_id=t.from_location_id AND expiry_date>=current_date;
  IF _action = 'receive' THEN
    INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand) VALUES (t.item_id, t.to_location_id, 'TRF-'||to_char(now(),'YYMMDDHH24MI'), exp, t.qty);
    UPDATE rail_stock_transfers SET status='received', received_at=now() WHERE id=_id;
    IF t.request_id IS NOT NULL THEN
      PERFORM set_config('rail.internal','on',true);
      UPDATE rail_purchase_requests SET status='received', grn_qty=t.qty, grn_at=now() WHERE id=t.request_id AND status='sending';
    END IF;
  ELSIF _action = 'refuse' THEN
    IF COALESCE(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Give a reason for rejecting'; END IF;
    INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand) VALUES (t.item_id, t.from_location_id, 'RET-'||to_char(now(),'YYMMDDHH24MI'), exp, t.qty);
    UPDATE rail_stock_transfers SET status='refused', refuse_reason=_reason, received_at=now() WHERE id=_id;
    IF t.request_id IS NOT NULL THEN
      PERFORM set_config('rail.internal','on',true);
      UPDATE rail_purchase_requests SET status='refused', decision_note=_reason WHERE id=t.request_id AND status='sending';
    END IF;
  ELSE RAISE EXCEPTION 'Unknown action'; END IF;
  RETURN 'ok';
END $$;
GRANT EXECUTE ON FUNCTION public.rail_transfer_step(uuid,text,text) TO authenticated;