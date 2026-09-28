-- SmartApp (sohcm) nightly sync reuses the AlertCheckin run log / review list, tagged by source.
alter table public.alertcheckin_sync_runs add column if not exists source text not null default 'alertcheckin';
alter table public.alertcheckin_unmatched add column if not exists source text not null default 'alertcheckin';
