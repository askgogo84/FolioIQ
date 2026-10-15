-- Review-only migration. Do not apply to production without approval.
create table if not exists public.portfolio_plans (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('goals','risk','sips','targets')),
 revision integer not null default 1 check(revision>0),
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=100000),
 primary key(user_id,kind)
);
alter table public.portfolio_plans enable row level security;
drop policy if exists plans_owner on public.portfolio_plans;
create policy plans_owner on public.portfolio_plans for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.portfolio_plans from public,anon,authenticated;
grant select,insert,update,delete on public.portfolio_plans to authenticated;
comment on table public.portfolio_plans is 'Self-reported plans only. No inferred suitability, mandate execution or investment recommendation.';

-- Separate usage guard: optional AI questions cannot consume portfolio-import budgets.
create table if not exists public.portfolio_guide_usage (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create index if not exists guide_usage_owner_date on public.portfolio_guide_usage(user_id,created_at);
alter table public.portfolio_guide_usage enable row level security;
drop policy if exists guide_usage_owner on public.portfolio_guide_usage;
create policy guide_usage_owner on public.portfolio_guide_usage for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
revoke all on public.portfolio_guide_usage from public,anon,authenticated;
grant select,insert on public.portfolio_guide_usage to authenticated;
create or replace function public.consume_guide_budget()
returns boolean language plpgsql security invoker set search_path='' as $$
declare owner uuid:=auth.uid(); used integer;
begin
 if owner is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner::text||'guide',0));
 select count(*) into used from public.portfolio_guide_usage where user_id=owner and created_at>=now()-interval '24 hours';
 if used>=5 then return false; end if;
 insert into public.portfolio_guide_usage(user_id) values(owner);
 return true;
end $$;
revoke all on function public.consume_guide_budget() from public,anon;
grant execute on function public.consume_guide_budget() to authenticated;
