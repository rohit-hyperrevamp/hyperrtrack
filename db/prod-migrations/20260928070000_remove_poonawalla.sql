BEGIN;
CREATE TEMP TABLE pw_units AS
  SELECT u.id FROM public.units u JOIN public.customers c ON c.id = u.customer_id
  WHERE c.name ILIKE '%poonawalla%';
CREATE TABLE IF NOT EXISTS public._bkp_pw_customers_20260928 AS SELECT * FROM public.customers WHERE name ILIKE '%poonawalla%';
CREATE TABLE IF NOT EXISTS public._bkp_pw_units_20260928 AS SELECT * FROM public.units WHERE id IN (SELECT id FROM pw_units);
CREATE TABLE IF NOT EXISTS public._bkp_pw_candidate_units_20260928 AS SELECT * FROM public.candidate_units WHERE unit_id IN (SELECT id FROM pw_units);
CREATE TABLE IF NOT EXISTS public._bkp_pw_candidates_20260928 AS SELECT id, unit_id FROM public.candidates WHERE unit_id IN (SELECT id FROM pw_units);
CREATE TABLE IF NOT EXISTS public._bkp_pw_scope_20260928 AS SELECT * FROM public.employee_scope_assignments WHERE scope_id IN (SELECT id::text FROM pw_units) OR scope_id IN (SELECT id::text FROM public.customers WHERE name ILIKE '%poonawalla%');

UPDATE public.candidates SET unit_id = '92541381-14d3-4be6-ae8c-078b79c2e0f1' WHERE unit_id IN (SELECT id FROM pw_units);
DELETE FROM public.candidate_units WHERE unit_id IN (SELECT id FROM pw_units);
DELETE FROM public.employee_scope_assignments WHERE scope_id IN (SELECT id::text FROM pw_units) OR scope_id IN (SELECT id::text FROM public.customers WHERE name ILIKE '%poonawalla%');
DELETE FROM public.units WHERE id IN (SELECT id FROM pw_units);
DELETE FROM public.customers WHERE name ILIKE '%poonawalla%';
COMMIT;
