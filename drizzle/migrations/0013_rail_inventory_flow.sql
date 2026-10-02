CREATE TABLE public.rail_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_name text, phone text, email text, gstin text,
  lead_days int NOT NULL DEFAULT 7,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.rail_vendors TO authenticated;
GRANT ALL ON public.rail_vendors TO service_role;
ALTER TABLE public.rail_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rail read" ON public.rail_vendors FOR SELECT TO authenticated USING (deleted_at IS NULL AND public.rail_can('rail_supplies','view'));
CREATE POLICY "rail create" ON public.rail_vendors FOR INSERT TO authenticated WITH CHECK (public.rail_can('rail_supplies','create'));
CREATE POLICY "rail edit" ON public.rail_vendors FOR UPDATE TO authenticated USING (public.rail_can('rail_supplies','edit')) WITH CHECK (public.rail_can('rail_supplies','edit'));
CREATE TRIGGER rail_audit_trg BEFORE INSERT OR UPDATE ON public.rail_vendors FOR EACH ROW EXECUTE FUNCTION public.rail_audit();

ALTER TABLE public.rail_purchase_requests
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.rail_vendors(id),
  ADD COLUMN IF NOT EXISTS po_number text,
  ADD COLUMN IF NOT EXISTS unit_price numeric,
  ADD COLUMN IF NOT EXISTS ordered_at timestamptz,
  ADD COLUMN IF NOT EXISTS expected_on date;
ALTER TABLE public.rail_purchase_requests ALTER COLUMN requested_by SET DEFAULT auth.uid();

CREATE OR REPLACE FUNCTION public.rail_pr_guard()
 RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'requested' THEN
    IF NEW.requested_by = auth.uid() THEN RAISE EXCEPTION 'You cannot approve your own request'; END IF;
    NEW.approved_by := auth.uid(); NEW.approved_at := now();
  END IF;
  IF NEW.status = 'ordered' AND OLD.status <> 'approved' THEN RAISE EXCEPTION 'Only approved requests can be ordered'; END IF;
  IF NEW.status = 'ordered' AND NEW.vendor_id IS NULL THEN RAISE EXCEPTION 'Choose a supplier before ordering'; END IF;
  IF NEW.status = 'ordered' AND OLD.status = 'approved' THEN
    NEW.ordered_at := now();
    NEW.po_number := COALESCE(NEW.po_number, 'PO-' || to_char(now(),'YYMMDD') || '-' || upper(substr(NEW.id::text,1,4)));
  END IF;
  IF NEW.status = 'received' AND OLD.status NOT IN ('approved','ordered') THEN RAISE EXCEPTION 'Only approved or ordered requests can be received'; END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.rail_pr_grn()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NEW.status = 'received' AND OLD.status IN ('approved','ordered') THEN
    INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand, unit_cost)
      VALUES (NEW.item_id, NEW.location_id, COALESCE(NEW.grn_batch, 'GRN-' || to_char(now(),'YYMMDDHH24MI')), NEW.grn_expiry, COALESCE(NEW.grn_qty, NEW.qty), NEW.unit_price);
  END IF;
  RETURN NEW;
END $function$;

CREATE TABLE public.rail_stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inv_items(id),
  from_location_id uuid NOT NULL REFERENCES public.rail_locations(id),
  to_location_id uuid NOT NULL REFERENCES public.rail_locations(id),
  qty numeric NOT NULL CHECK (qty > 0),
  note text,
  status text NOT NULL DEFAULT 'requested',
  requested_by uuid DEFAULT auth.uid(),
  approved_by uuid, approved_at timestamptz, dispatched_at timestamptz, received_at timestamptz,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz,
  CHECK (from_location_id <> to_location_id)
);
GRANT SELECT, INSERT ON public.rail_stock_transfers TO authenticated;
GRANT ALL ON public.rail_stock_transfers TO service_role;
ALTER TABLE public.rail_stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rail read" ON public.rail_stock_transfers FOR SELECT TO authenticated USING (deleted_at IS NULL AND (public.rail_can('rail_supplies','view',from_location_id) OR public.rail_can('rail_supplies','view',to_location_id)));
CREATE POLICY "rail create" ON public.rail_stock_transfers FOR INSERT TO authenticated WITH CHECK (status = 'requested' AND (public.rail_can('rail_supplies','create',to_location_id) OR public.rail_can('rail_supplies','create',from_location_id)));
CREATE TRIGGER rail_audit_trg BEFORE INSERT OR UPDATE ON public.rail_stock_transfers FOR EACH ROW EXECUTE FUNCTION public.rail_audit();

-- Move a transfer forward; stock leaves the source (earliest expiry first) on dispatch and lands at destination on receipt.
CREATE OR REPLACE FUNCTION public.rail_transfer_step(_id uuid, _action text)
 RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE t rail_stock_transfers; b record; left_qty numeric; take numeric; avail numeric;
BEGIN
  SELECT * INTO t FROM rail_stock_transfers WHERE id = _id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transfer not found'; END IF;
  IF _action = 'approve' THEN
    IF t.status <> 'requested' THEN RAISE EXCEPTION 'Only new requests can be approved'; END IF;
    IF NOT rail_can('rail_supplies','edit',t.from_location_id) THEN RAISE EXCEPTION 'Not allowed at the sending store'; END IF;
    IF t.requested_by = auth.uid() THEN RAISE EXCEPTION 'You cannot approve your own request'; END IF;
    UPDATE rail_stock_transfers SET status='approved', approved_by=auth.uid(), approved_at=now() WHERE id=_id;
  ELSIF _action = 'reject' THEN
    IF t.status NOT IN ('requested','approved') THEN RAISE EXCEPTION 'Too late to reject'; END IF;
    IF NOT rail_can('rail_supplies','edit',t.from_location_id) THEN RAISE EXCEPTION 'Not allowed at the sending store'; END IF;
    UPDATE rail_stock_transfers SET status='rejected' WHERE id=_id;
  ELSIF _action = 'dispatch' THEN
    IF t.status <> 'approved' THEN RAISE EXCEPTION 'Approve before dispatch'; END IF;
    IF NOT rail_can('rail_supplies','edit',t.from_location_id) THEN RAISE EXCEPTION 'Not allowed at the sending store'; END IF;
    SELECT COALESCE(sum(qty_on_hand),0) INTO avail FROM rail_item_batches WHERE item_id=t.item_id AND location_id=t.from_location_id AND deleted_at IS NULL AND qty_on_hand > 0 AND (expiry_date IS NULL OR expiry_date >= current_date);
    IF avail < t.qty THEN RAISE EXCEPTION 'Only % in stock (not expired) at the sending store', avail; END IF;
    left_qty := t.qty;
    FOR b IN SELECT id, qty_on_hand FROM rail_item_batches WHERE item_id=t.item_id AND location_id=t.from_location_id AND deleted_at IS NULL AND qty_on_hand > 0 AND (expiry_date IS NULL OR expiry_date >= current_date) ORDER BY expiry_date NULLS LAST, created_at LOOP
      EXIT WHEN left_qty <= 0;
      take := LEAST(b.qty_on_hand, left_qty);
      UPDATE rail_item_batches SET qty_on_hand = qty_on_hand - take WHERE id=b.id;
      left_qty := left_qty - take;
    END LOOP;
    UPDATE rail_stock_transfers SET status='dispatched', dispatched_at=now() WHERE id=_id;
  ELSIF _action = 'receive' THEN
    IF t.status <> 'dispatched' THEN RAISE EXCEPTION 'Only dispatched transfers can be received'; END IF;
    IF NOT rail_can('rail_supplies','edit',t.to_location_id) THEN RAISE EXCEPTION 'Not allowed at the receiving store'; END IF;
    INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand)
      SELECT t.item_id, t.to_location_id, 'TRF-' || to_char(now(),'YYMMDDHH24MI'),
        (SELECT min(expiry_date) FROM rail_item_batches WHERE item_id=t.item_id AND location_id=t.from_location_id AND expiry_date >= current_date), t.qty;
    UPDATE rail_stock_transfers SET status='received', received_at=now() WHERE id=_id;
  ELSE RAISE EXCEPTION 'Unknown action'; END IF;
  RETURN 'ok';
END $function$;
REVOKE ALL ON FUNCTION public.rail_transfer_step(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.rail_transfer_step(uuid, text) TO authenticated;