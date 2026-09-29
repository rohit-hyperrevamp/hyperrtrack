-- Sales & Marketing CRM: prospects pipeline, activities, quotes.
-- Access: Super Admin / Admin console by default, plus any role later granted
-- the `sales_marketing` RBAC module.
begin;

create or replace function public.current_user_can_crm()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_user()
      or public.current_user_has_permission('sales_marketing', '', 'view');
$$;

create table if not exists public.crm_stages (
  key text primary key,
  label text not null,
  sort_order int not null default 0,
  probability int not null default 0,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.crm_stages to authenticated;
grant all on public.crm_stages to service_role;
alter table public.crm_stages enable row level security;
drop policy if exists crm_stages_all on public.crm_stages;
create policy crm_stages_all on public.crm_stages for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

insert into public.crm_stages (key, label, sort_order, probability, is_won, is_lost) values
  ('new', 'New', 10, 5, false, false),
  ('contacted', 'Contacted', 20, 10, false, false),
  ('qualified', 'Qualified', 30, 20, false, false),
  ('meeting_scheduled', 'Meeting Scheduled', 40, 30, false, false),
  ('site_survey', 'Site Survey', 50, 40, false, false),
  ('negotiation', 'Pricing Negotiation', 60, 55, false, false),
  ('quote_sent', 'Quote Sent', 70, 65, false, false),
  ('quote_signed', 'Quote Signed', 80, 90, false, false),
  ('won', 'Won', 90, 100, true, false),
  ('on_hold', 'On Hold', 95, 10, false, false),
  ('lost', 'Lost', 100, 0, false, true)
on conflict (key) do nothing;

create table if not exists public.crm_lost_reasons (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true
);
grant select, insert, update, delete on public.crm_lost_reasons to authenticated;
grant all on public.crm_lost_reasons to service_role;
alter table public.crm_lost_reasons enable row level security;
drop policy if exists crm_lost_reasons_all on public.crm_lost_reasons;
create policy crm_lost_reasons_all on public.crm_lost_reasons for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));
insert into public.crm_lost_reasons (label, sort_order) values
  ('Price too high', 10), ('Went with competitor', 20), ('No budget', 30),
  ('No response', 40), ('Requirement cancelled', 50), ('Other', 90)
on conflict (label) do nothing;

create sequence if not exists public.crm_lead_seq start 1001;

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  lead_code text unique,
  company_name text not null,
  customer_id uuid references public.customers(id) on delete set null,
  unit_id uuid references public.units(id) on delete set null,
  contact_name text not null default '',
  contact_title text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  source text not null default '',
  industry text not null default '',
  service_type text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  pincode text not null default '',
  stage_key text not null default 'new' references public.crm_stages(key),
  owner_id uuid,
  owner_name text not null default '',
  estimated_monthly_value numeric not null default 0,
  probability int,
  expected_close_date date,
  next_follow_up_at timestamptz,
  lost_reason text not null default '',
  notes text not null default '',
  converted_contract_id uuid references public.client_contracts(id) on delete set null,
  converted_at timestamptz,
  stage_changed_at timestamptz not null default now(),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_leads_stage_idx on public.crm_leads(stage_key);
create index if not exists crm_leads_follow_idx on public.crm_leads(next_follow_up_at);
grant select, insert, update, delete on public.crm_leads to authenticated;
grant all on public.crm_leads to service_role;
grant usage on sequence public.crm_lead_seq to authenticated, service_role;
alter table public.crm_leads enable row level security;
drop policy if exists crm_leads_all on public.crm_leads;
create policy crm_leads_all on public.crm_leads for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

create table if not exists public.crm_lead_requirements (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  designation_id uuid references public.designations(id) on delete set null,
  designation_label text not null default '',
  quantity int not null default 1,
  shift_hours int not null default 8,
  notes text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.crm_lead_requirements to authenticated;
grant all on public.crm_lead_requirements to service_role;
alter table public.crm_lead_requirements enable row level security;
drop policy if exists crm_lead_requirements_all on public.crm_lead_requirements;
create policy crm_lead_requirements_all on public.crm_lead_requirements for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  activity_type text not null default 'note',
  subject text not null default '',
  details text not null default '',
  scheduled_at timestamptz,
  completed boolean not null default true,
  created_by uuid,
  created_by_name text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists crm_activities_lead_idx on public.crm_activities(lead_id, created_at desc);
grant select, insert, update, delete on public.crm_activities to authenticated;
grant all on public.crm_activities to service_role;
alter table public.crm_activities enable row level security;
drop policy if exists crm_activities_all on public.crm_activities;
create policy crm_activities_all on public.crm_activities for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

create table if not exists public.crm_quotes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  quote_no text not null default '',
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft','sent','signed','rejected')),
  valid_until date,
  notes text not null default '',
  total_monthly numeric not null default 0,
  sent_at timestamptz,
  signed_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists crm_quotes_lead_idx on public.crm_quotes(lead_id);
grant select, insert, update, delete on public.crm_quotes to authenticated;
grant all on public.crm_quotes to service_role;
alter table public.crm_quotes enable row level security;
drop policy if exists crm_quotes_all on public.crm_quotes;
create policy crm_quotes_all on public.crm_quotes for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

create table if not exists public.crm_quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.crm_quotes(id) on delete cascade,
  designation_id uuid references public.designations(id) on delete set null,
  designation_label text not null default '',
  quantity int not null default 1,
  shift_hours int not null default 8,
  paid_days int not null default 26,
  gross_salary numeric not null default 0,
  billing_rate numeric not null default 0,
  notes text not null default '',
  sort_order int not null default 0
);
grant select, insert, update, delete on public.crm_quote_lines to authenticated;
grant all on public.crm_quote_lines to service_role;
alter table public.crm_quote_lines enable row level security;
drop policy if exists crm_quote_lines_all on public.crm_quote_lines;
create policy crm_quote_lines_all on public.crm_quote_lines for all to authenticated
  using ((select public.current_user_can_crm())) with check ((select public.current_user_can_crm()));

-- Lead code + stage-change timeline.
create or replace function public.crm_leads_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.lead_code is null or new.lead_code = '' then
      new.lead_code := 'LEAD' || nextval('public.crm_lead_seq');
    end if;
  elsif new.stage_key is distinct from old.stage_key then
    new.stage_changed_at := now();
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_crm_leads_before on public.crm_leads;
create trigger trg_crm_leads_before before insert or update on public.crm_leads
  for each row execute function public.crm_leads_before_write();

create or replace function public.crm_leads_after_stage()
returns trigger language plpgsql security definer set search_path = public as $$
declare _from text; _to text;
begin
  if tg_op = 'INSERT' or new.stage_key is distinct from old.stage_key then
    select label into _to from public.crm_stages where key = new.stage_key;
    if tg_op = 'UPDATE' then select label into _from from public.crm_stages where key = old.stage_key; end if;
    insert into public.crm_activities (lead_id, activity_type, subject, created_by)
    values (new.id, 'stage_change',
      case when tg_op = 'INSERT' then 'Created in ' || coalesce(_to, new.stage_key)
           else coalesce(_from, old.stage_key) || ' → ' || coalesce(_to, new.stage_key) end,
      auth.uid());
  end if;
  return new;
end $$;
drop trigger if exists trg_crm_leads_after on public.crm_leads;
create trigger trg_crm_leads_after after insert or update on public.crm_leads
  for each row execute function public.crm_leads_after_stage();

-- Move legacy contract "prospects" that were never approved into the pipeline.
insert into public.crm_leads (company_name, customer_id, unit_id, stage_key, notes, created_at)
select coalesce(cu.name, u.name, 'Unknown'), u.customer_id, cc.unit_id, 'new',
       'Migrated from Client Contracts prospect ' || coalesce(cc.prospect_code, ''), cc.created_at
from public.client_contracts cc
left join public.units u on u.id = cc.unit_id
left join public.customers cu on cu.id = u.customer_id
where cc.record_type = 'prospect'
  and not exists (select 1 from public.crm_leads l where l.notes = 'Migrated from Client Contracts prospect ' || coalesce(cc.prospect_code, ''));

comment on column public.client_contracts.prospect_stage is 'DEPRECATED: sales pipeline moved to crm_leads.stage_key';

commit;
