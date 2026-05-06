-- FolioIQ Supabase Schema v2
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hvuqwfpcumooegflfrth/editor

-- Drop old tables if they exist with wrong schema
drop table if exists portfolio_holdings cascade;
drop table if exists risk_profiles cascade;
drop table if exists portfolios cascade;

-- portfolio_holdings: one row per fund per user (uses Supabase auth UUID)
create table portfolio_holdings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  scheme_code     text not null,
  scheme_name     text not null,
  category        text default 'Equity Scheme',
  amc             text default '',
  units           numeric(18,6) not null default 0,
  avg_nav         numeric(18,6) not null default 0,
  current_nav     numeric(18,6) default 0,
  purchase_date   date not null default current_date,
  sip_amount      numeric(12,2) default 0,
  invested_amount numeric(14,2) default 0,
  current_value   numeric(14,2) default 0,
  updated_at      timestamptz default now(),
  unique (user_id, scheme_code)
);

-- risk_profiles: one row per user
create table risk_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique not null references auth.users(id) on delete cascade,
  risk_label  text,
  risk_score  integer,
  allocation  jsonb,
  answers     jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable RLS
alter table portfolio_holdings enable row level security;
alter table risk_profiles enable row level security;

-- RLS policies: users can only see their own data
create policy "Users can manage own holdings"
  on portfolio_holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own risk profile"
  on risk_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role bypass (for server-side API routes)
create policy "Service role full access holdings"
  on portfolio_holdings for all
  to service_role
  using (true)
  with check (true);

create policy "Service role full access risk"
  on risk_profiles for all
  to service_role
  using (true)
  with check (true);

-- Indexes
create index idx_holdings_user_id on portfolio_holdings(user_id);
create index idx_holdings_updated on portfolio_holdings(updated_at desc);
create index idx_risk_user_id on risk_profiles(user_id);
