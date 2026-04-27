-- FolioIQ Supabase schema
-- Run this once in Supabase SQL Editor.

create table if not exists portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  scheme_code text not null,
  scheme_name text not null,
  category text,
  amc text,
  units numeric(18, 6) not null,
  avg_nav numeric(18, 6) not null,
  current_nav numeric(18, 6),
  purchase_date date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (clerk_user_id, scheme_code)
);

create table if not exists risk_profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  risk_label text,
  risk_score integer,
  allocation text,
  answers jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table portfolio_holdings enable row level security;
alter table risk_profiles enable row level security;

-- Server route uses service role key. These policies are permissive for service-backed API access.
drop policy if exists "Service role portfolio access" on portfolio_holdings;
create policy "Service role portfolio access"
  on portfolio_holdings for all
  using (true)
  with check (true);

drop policy if exists "Service role risk profile access" on risk_profiles;
create policy "Service role risk profile access"
  on risk_profiles for all
  using (true)
  with check (true);

create index if not exists idx_portfolio_holdings_clerk_user_id
  on portfolio_holdings (clerk_user_id);

create index if not exists idx_risk_profiles_clerk_user_id
  on risk_profiles (clerk_user_id);
