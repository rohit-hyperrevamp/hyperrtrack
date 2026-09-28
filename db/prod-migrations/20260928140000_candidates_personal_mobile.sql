-- Add optional personal phone number for all employees (non-mandatory).
-- Distinct from `mobile` (primary/login number) and `alt_mobile` (alternate).
alter table public.candidates
  add column if not exists personal_mobile text;

comment on column public.candidates.personal_mobile is
  'Optional personal phone number, separate from the primary mobile used for login.';
