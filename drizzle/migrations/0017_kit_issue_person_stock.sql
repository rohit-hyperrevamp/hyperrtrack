ALTER TABLE public.rail_kit_issues ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.rail_people(id);
ALTER TABLE public.rail_kit_issues ADD COLUMN IF NOT EXISTS return_note text;

-- Issuing a kit takes stock out of that store (oldest expiry first); recording a return puts the returned part back.
CREATE OR REPLACE FUNCTION public.rail_kit_stock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE b record; left_qty numeric; take numeric; avail numeric; delta numeric; exp date;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(sum(qty_on_hand),0) INTO avail FROM rail_item_batches WHERE item_id=NEW.item_id AND location_id=NEW.location_id AND deleted_at IS NULL AND qty_on_hand>0 AND (expiry_date IS NULL OR expiry_date>=current_date);
    IF avail < NEW.qty_issued THEN RAISE EXCEPTION 'Only % in stock at this store', avail; END IF;
    left_qty := NEW.qty_issued;
    FOR b IN SELECT id, qty_on_hand FROM rail_item_batches WHERE item_id=NEW.item_id AND location_id=NEW.location_id AND deleted_at IS NULL AND qty_on_hand>0 AND (expiry_date IS NULL OR expiry_date>=current_date) ORDER BY expiry_date NULLS LAST, created_at LOOP
      EXIT WHEN left_qty <= 0;
      take := LEAST(b.qty_on_hand, left_qty);
      UPDATE rail_item_batches SET qty_on_hand = qty_on_hand - take WHERE id=b.id;
      left_qty := left_qty - take;
    END LOOP;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.qty_returned < OLD.qty_returned THEN RAISE EXCEPTION 'A recorded return cannot be reduced'; END IF;
    delta := NEW.qty_returned - OLD.qty_returned;
    IF delta > 0 THEN
      SELECT min(expiry_date) INTO exp FROM rail_item_batches WHERE item_id=NEW.item_id AND location_id=NEW.location_id AND expiry_date>=current_date;
      INSERT INTO rail_item_batches(item_id, location_id, batch_no, expiry_date, qty_on_hand) VALUES (NEW.item_id, NEW.location_id, 'KRET-'||to_char(now(),'YYMMDDHH24MI'), exp, delta);
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS rail_kit_stock_trg ON public.rail_kit_issues;
CREATE TRIGGER rail_kit_stock_trg AFTER INSERT OR UPDATE OF qty_returned ON public.rail_kit_issues FOR EACH ROW EXECUTE FUNCTION public.rail_kit_stock();