-- Remove Alfa Laval India Pvt Ltd (ORG311) and its 6 sites globally (no contracts existed). Backups kept.
BEGIN;
CREATE TEMP TABLE al_units AS SELECT id FROM public.units WHERE customer_id = '04f3c69b-ea28-45cd-8631-7228c71f56cf';
CREATE TABLE IF NOT EXISTS public._bkp_alfa_customers_20260928 AS SELECT * FROM public.customers WHERE id = '04f3c69b-ea28-45cd-8631-7228c71f56cf';
CREATE TABLE IF NOT EXISTS public._bkp_alfa_units_20260928 AS SELECT * FROM public.units WHERE id IN (SELECT id FROM al_units);
CREATE TABLE IF NOT EXISTS public._bkp_alfa_candidate_units_20260928 AS SELECT * FROM public.candidate_units WHERE unit_id IN (SELECT id FROM al_units);
CREATE TABLE IF NOT EXISTS public._bkp_alfa_candidates_20260928 AS SELECT id, unit_id FROM public.candidates WHERE unit_id IN (SELECT id FROM al_units);
CREATE TABLE IF NOT EXISTS public._bkp_alfa_attendance_20260928 AS SELECT * FROM public.attendance_entries WHERE unit_id IN (SELECT id FROM al_units);
REVOKE ALL ON public._bkp_alfa_customers_20260928, public._bkp_alfa_units_20260928, public._bkp_alfa_candidate_units_20260928, public._bkp_alfa_candidates_20260928, public._bkp_alfa_attendance_20260928 FROM anon, authenticated;

UPDATE public.candidates SET unit_id = '92541381-14d3-4be6-ae8c-078b79c2e0f1' WHERE unit_id IN (SELECT id FROM al_units);
DELETE FROM public.attendance_entries WHERE unit_id IN (SELECT id FROM al_units);
DELETE FROM public.candidate_units WHERE unit_id IN (SELECT id FROM al_units);
DELETE FROM public.employee_scope_assignments WHERE scope_id IN (SELECT id::text FROM al_units) OR scope_id = '04f3c69b-ea28-45cd-8631-7228c71f56cf';
DELETE FROM public.client_contracts WHERE unit_id IN (SELECT id FROM al_units);
DELETE FROM public.units WHERE id IN (SELECT id FROM al_units);
DELETE FROM public.customers WHERE id = '04f3c69b-ea28-45cd-8631-7228c71f56cf';
SELECT cron.unschedule('sohcm-alfa-nightly-sync');
COMMIT;
