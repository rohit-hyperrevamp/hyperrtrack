-- Hash of the nightly AlertCheckin sync key (plain key lives only inside the cron job).
create table if not exists public.alertcheckin_cron_keys (key_hash text primary key, created_at timestamptz not null default now());
grant all on public.alertcheckin_cron_keys to service_role;
alter table public.alertcheckin_cron_keys enable row level security;
insert into public.alertcheckin_cron_keys(key_hash) values (encode(extensions.digest('<redacted>','sha256'),'hex')) on conflict do nothing;
