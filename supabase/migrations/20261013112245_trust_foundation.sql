-- Additive trust foundation. Existing holdings remain until an owner confirms an import.
-- Never use legacy schema.sql / supabase_fix.sql as production migrations.
-- Bootstrap empty preview environments without replaying destructive legacy scripts.
create table if not exists public.portfolio_holdings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 scheme_code text not null, scheme_name text not null, category text, amc text,
 units numeric(18,6) not null, avg_nav numeric(18,6), current_nav numeric(18,6),
 purchase_date date, sip_amount numeric(12,2), invested_amount numeric(14,2),
 current_value numeric(14,2), updated_at timestamptz default now()
);
alter table public.portfolio_holdings enable row level security;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='portfolio_holdings' and policyname='users_own') then
  create policy users_own on public.portfolio_holdings for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
 end if;
end $$;
revoke all on public.portfolio_holdings from anon;
grant select,insert,update,delete on public.portfolio_holdings to authenticated;

-- Retired, unrelated tables must not remain public APIs. Preserve all rows.
do $$ begin
 if to_regclass('public.otp_codes') is not null then
  revoke all on public.otp_codes from anon, authenticated;
  drop policy if exists allow_all on public.otp_codes;
  alter table public.otp_codes enable row level security;
 end if;
 if to_regclass('public.nutrition_logs') is not null then
  revoke all on public.nutrition_logs from anon, authenticated;
  drop policy if exists users_own_nutrition_logs on public.nutrition_logs;
  alter table public.nutrition_logs enable row level security;
 end if;
 if to_regclass('public.nutrition_goals') is not null then
  revoke all on public.nutrition_goals from anon, authenticated;
  drop policy if exists users_own_nutrition_goals on public.nutrition_goals;
  alter table public.nutrition_goals enable row level security;
 end if;
 if to_regprocedure('public.update_updated_at_column()') is not null then
  alter function public.update_updated_at_column() set search_path='';
 end if;
end $$;

alter table public.portfolio_holdings
  add column if not exists folio_key text not null default 'legacy',
  add column if not exists folio_label text,
  add column if not exists isin text,
  add column if not exists amfi_code text,
  add column if not exists nav_date date,
  add column if not exists valuation_date date,
  add column if not exists import_id uuid;
alter table public.portfolio_holdings alter column purchase_date drop not null;
alter table public.portfolio_holdings alter column purchase_date drop default;
alter table public.portfolio_holdings alter column avg_nav drop not null;
alter table public.portfolio_holdings alter column avg_nav drop default;
alter table public.portfolio_holdings alter column current_nav drop default;
alter table public.portfolio_holdings alter column invested_amount drop default;
alter table public.portfolio_holdings alter column current_value drop default;
alter table public.portfolio_holdings alter column category drop default;
alter table public.portfolio_holdings drop constraint if exists portfolio_holdings_user_id_scheme_code_key;
create unique index if not exists portfolio_holdings_owner_folio_scheme on public.portfolio_holdings(user_id,folio_key,scheme_code);

create table if not exists public.portfolio_imports(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 source text not null check(length(source)<80),
 checksum text not null check(checksum ~ '^[a-f0-9]{64}$'),
 payload jsonb not null,
 previous_holdings jsonb,
 status text not null default 'draft' check(status in ('draft','committed')),
 created_at timestamptz not null default now(),
 committed_at timestamptz
);
create index if not exists portfolio_imports_owner_date on public.portfolio_imports(user_id,created_at desc);
alter table public.portfolio_imports enable row level security;
drop policy if exists imports_owner on public.portfolio_imports;
create policy imports_owner on public.portfolio_imports for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.portfolio_imports from anon, authenticated;
grant select,insert,update on public.portfolio_imports to authenticated;

create table if not exists public.portfolio_transactions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 import_id uuid not null references public.portfolio_imports(id) on delete cascade,
 position_key text not null,
 scheme_name text not null,
 transaction_date date,
 transaction_type text not null,
 units numeric,
 amount numeric,
 nav numeric,
 ordinal integer not null,
 unique(import_id,position_key,ordinal)
);
create index if not exists portfolio_transactions_owner on public.portfolio_transactions(user_id,import_id);
alter table public.portfolio_transactions enable row level security;
drop policy if exists transactions_owner on public.portfolio_transactions;
create policy transactions_owner on public.portfolio_transactions for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.portfolio_transactions from anon, authenticated;
grant select,insert on public.portfolio_transactions to authenticated;

create table if not exists public.portfolio_api_usage(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 action text not null check(action in ('parse','token','draft','refresh')),
 created_at timestamptz not null default now()
);
create index if not exists portfolio_api_usage_owner_date on public.portfolio_api_usage(user_id,created_at);
alter table public.portfolio_api_usage enable row level security;
drop policy if exists usage_read on public.portfolio_api_usage;
drop policy if exists usage_insert on public.portfolio_api_usage;
create policy usage_read on public.portfolio_api_usage for select to authenticated using((select auth.uid())=user_id);
create policy usage_insert on public.portfolio_api_usage for insert to authenticated with check((select auth.uid())=user_id and created_at between now()-interval '1 minute' and now()+interval '1 minute');
revoke all on public.portfolio_api_usage from anon, authenticated;
grant select,insert on public.portfolio_api_usage to authenticated;

create or replace function public.consume_portfolio_budget(p_action text)
returns boolean language plpgsql security invoker set search_path='' as $$
declare owner uuid:=auth.uid(); used integer;
begin
 if owner is null then raise exception 'Authentication required'; end if;
 if p_action not in ('parse','token','draft','refresh') then raise exception 'Invalid action'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text||p_action,0));
 select count(*) into used from public.portfolio_api_usage where user_id=owner and action=p_action and created_at>=now()-interval '24 hours';
 if used >= (case when p_action='draft' then 20 else 5 end) then return false; end if;
 insert into public.portfolio_api_usage(user_id,action) values(owner,p_action);
 return true;
end $$;
revoke all on function public.consume_portfolio_budget(text) from public,anon;
grant execute on function public.consume_portfolio_budget(text) to authenticated;

create or replace function public.commit_portfolio_import(p_import_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare owner uuid:=auth.uid(); draft public.portfolio_imports%rowtype; n integer; tx_count integer;
begin
 if owner is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text,0));
 select * into draft from public.portfolio_imports where id=p_import_id and user_id=owner for update;
 if not found then raise exception 'Import unavailable'; end if;
 if draft.status='committed' then return jsonb_build_object('success',true,'alreadyCommitted',true); end if;
 if draft.created_at<now()-interval '24 hours' then raise exception 'Import expired; upload again'; end if;
 if jsonb_typeof(draft.payload->'holdings') is distinct from 'array' or jsonb_typeof(draft.payload->'transactions') is distinct from 'array' then raise exception 'Invalid import payload'; end if;
 n:=jsonb_array_length(draft.payload->'holdings'); tx_count:=jsonb_array_length(draft.payload->'transactions');
 if n<1 or n>2000 or tx_count>20000 then raise exception 'Invalid import size'; end if;
 if exists(select 1 from jsonb_array_elements(draft.payload->'holdings') r where
  coalesce(r->>'scheme_name','')='' or coalesce(r->>'scheme_code','')='' or coalesce(r->>'folio_key','')='' or
  (r->>'units') is null or (r->>'units')::numeric<0 or (r->>'units')::numeric>1e15 or
  (r->>'current_nav')::numeric<=0 or (r->>'current_value')::numeric<0 or (r->>'invested_amount')::numeric<0
 ) then raise exception 'Invalid holding'; end if;
 -- A retry of the same statement never deletes or duplicates the active portfolio.
 if exists(select 1 from public.portfolio_imports i where i.user_id=owner and i.status='committed' and i.checksum=draft.checksum
  and exists(select 1 from public.portfolio_holdings h where h.user_id=owner and h.import_id=i.id)) then
  return jsonb_build_object('success',true,'alreadyCommitted',true);
 end if;
 update public.portfolio_imports set previous_holdings=(select coalesce(jsonb_agg(to_jsonb(h)),'[]'::jsonb) from public.portfolio_holdings h where h.user_id=owner) where id=p_import_id;
 delete from public.portfolio_holdings where user_id=owner;
 insert into public.portfolio_holdings(user_id,scheme_code,scheme_name,folio_key,folio_label,isin,amfi_code,category,amc,units,avg_nav,current_nav,purchase_date,sip_amount,invested_amount,current_value,nav_date,valuation_date,import_id,updated_at)
 select owner,r->>'scheme_code',r->>'scheme_name',r->>'folio_key',r->>'folio_label',r->>'isin',r->>'amfi_code',coalesce(r->>'category','Unknown'),coalesce(r->>'amc',''),
 (r->>'units')::numeric,(r->>'avg_nav')::numeric,(r->>'current_nav')::numeric,null,null,(r->>'invested_amount')::numeric,(r->>'current_value')::numeric,
 (r->>'nav_date')::date,(r->>'valuation_date')::date,p_import_id,now() from jsonb_array_elements(draft.payload->'holdings') r;
 insert into public.portfolio_transactions(user_id,import_id,position_key,scheme_name,transaction_date,transaction_type,units,amount,nav,ordinal)
 select owner,p_import_id,t->>'position_key',t->>'scheme_name',(t->>'date')::date,t->>'type',(t->>'units')::numeric,(t->>'amount')::numeric,(t->>'nav')::numeric,(t->>'ordinal')::integer
 from jsonb_array_elements(draft.payload->'transactions') t;
 update public.portfolio_imports set status='committed',committed_at=now() where id=p_import_id;
 return jsonb_build_object('success',true,'fundCount',n,'transactionCount',tx_count);
end $$;
revoke all on function public.commit_portfolio_import(uuid) from public,anon;
grant execute on function public.commit_portfolio_import(uuid) to authenticated;
create table if not exists public.portfolio_nav_observations(
 user_id uuid not null references auth.users(id) on delete cascade,
 position_id uuid not null,
 amfi_code text not null,
 nav_date date not null,
 nav numeric not null check(nav>0),
 source text not null default 'AMFI',
 fetched_at timestamptz not null default now(),
 primary key(user_id,position_id,nav_date)
);
alter table public.portfolio_nav_observations enable row level security;
drop policy if exists observations_owner on public.portfolio_nav_observations;
create policy observations_owner on public.portfolio_nav_observations for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
revoke all on public.portfolio_nav_observations from anon,authenticated;
grant select,insert,update on public.portfolio_nav_observations to authenticated;
create or replace function public.refresh_owned_navs(p_updates jsonb)
returns integer language plpgsql security invoker set search_path='' as $$
declare owner uuid:=auth.uid(); r jsonb; position public.portfolio_holdings%rowtype; total integer:=0; nd date; price numeric;
begin
 if owner is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(p_updates) is distinct from 'array' or jsonb_array_length(p_updates)>2000 then raise exception 'Invalid NAV batch'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text,0));
 for r in select value from jsonb_array_elements(p_updates) loop
  nd:=(r->>'date')::date; price:=(r->>'nav')::numeric;
  if nd is null or nd>current_date or price is null or price<=0 or price>1e12 or coalesce(r->>'amfi_code','')!~'^[0-9]{5,8}$' then raise exception 'Invalid NAV'; end if;
  select * into position from public.portfolio_holdings where id=(r->>'id')::uuid and user_id=owner for update;
  if not found then raise exception 'Position unavailable'; end if;
  if nd<coalesce(position.nav_date,position.valuation_date,'0001-01-01'::date) then continue; end if;
  update public.portfolio_holdings set current_nav=price,current_value=units*price,nav_date=nd,valuation_date=nd,amfi_code=r->>'amfi_code',updated_at=now() where id=position.id and user_id=owner;
  insert into public.portfolio_nav_observations(user_id,position_id,amfi_code,nav_date,nav) values(owner,position.id,r->>'amfi_code',nd,price)
  on conflict(user_id,position_id,nav_date) do update set nav=excluded.nav,fetched_at=now();
  total:=total+1;
 end loop;
 return total;
end $$;
revoke all on function public.refresh_owned_navs(jsonb) from public,anon;
grant execute on function public.refresh_owned_navs(jsonb) to authenticated;
