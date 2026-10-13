import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { normalizeCas } from "../src/lib/portfolio/import";
const A = "00000000-0000-4000-8000-000000000001",
  B = "00000000-0000-4000-8000-000000000002";
const statement = {
  meta: { statement_period: { to: "2026-06-01" } },
  mutual_funds: [
    {
      folio_number: "1",
      amc: "Example",
      schemes: [
        {
          isin: "INF000000001",
          name: "Synthetic test fund",
          units: 10,
          nav: 12,
          value: 120,
          cost: 100,
          transactions: [
            {
              date: "2025-01-01",
              type: "PURCHASE",
              amount: 100,
              units: 10,
              nav: 10,
            },
          ],
        },
      ],
    },
  ],
};
test("PostgreSQL migration: tenant isolation, atomic imports, retries, NAV updates and budgets", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${A}'),('${B}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;
 create table public.otp_codes(id uuid);alter table public.otp_codes enable row level security;create policy allow_all on public.otp_codes for all using(true) with check(true);grant all on public.otp_codes to anon,authenticated;
 create table public.portfolio_holdings(id uuid primary key default gen_random_uuid(),user_id uuid not null,scheme_code text not null,scheme_name text not null,category text default 'Equity Scheme',amc text,units numeric not null default 0,avg_nav numeric not null default 0,current_nav numeric default 0,purchase_date date not null default current_date,sip_amount numeric,invested_amount numeric default 0,current_value numeric default 0,updated_at timestamptz default now(),constraint portfolio_holdings_user_id_scheme_code_key unique(user_id,scheme_code));alter table public.portfolio_holdings enable row level security;create policy owner on public.portfolio_holdings for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);grant select,insert,update,delete on public.portfolio_holdings to authenticated;`);
    await db.exec(`create table public.nutrition_logs(id uuid);create table public.nutrition_goals(id uuid);
      alter table public.nutrition_logs enable row level security;alter table public.nutrition_goals enable row level security;
      create policy users_own_nutrition_logs on public.nutrition_logs using(true);
      create policy users_own_nutrition_goals on public.nutrition_goals using(true);
      grant all on public.nutrition_logs,public.nutrition_goals to anon,authenticated;
      create function public.update_updated_at_column() returns trigger language plpgsql as $$begin NEW.updated_at=NOW();return NEW;end $$;`);
    await db.exec(
      readFileSync(
        "supabase/migrations/20261013112245_trust_foundation.sql",
        "utf8",
      ),
    );
    async function asUser(id: string) {
      await db.exec(
        `reset role;set role authenticated;set request.jwt.claim.sub='${id}';`,
      );
    }
    const preview = normalizeCas(statement);
    async function draft(payload: unknown = preview, user = A) {
      return (
        await db.query<{ id: string }>(
          "insert into portfolio_imports(user_id,source,checksum,payload) values($1,$2,$3,$4) returning id",
          [user, "test", preview.checksum, JSON.stringify(payload)],
        )
      ).rows[0].id;
    }
    await t.test("public OTP read revoked", async () => {
      await db.exec("set role anon;");
      await assert.rejects(
        db.query("select * from otp_codes"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select * from nutrition_logs"),
        /permission denied/,
      );
      await assert.rejects(
        db.query("select * from nutrition_goals"),
        /permission denied/,
      );
    });
    await asUser(A);
    const id = await draft();
    await t.test("cross-owner inserts denied", async () => {
      await assert.rejects(draft(preview, B), /row-level security/);
    });
    await t.test(
      "owner commit preserves source transactions and no fake date",
      async () => {
        await db.query("select commit_portfolio_import($1)", [id]);
        const h = (
          await db.query<{ purchase_date: string | null }>(
            "select * from portfolio_holdings",
          )
        ).rows;
        assert.equal(h.length, 1);
        assert.equal(h[0].purchase_date, null);
        assert.equal(
          (await db.query("select * from portfolio_transactions")).rows.length,
          1,
        );
      },
    );
    await t.test(
      "retry does not duplicate positions/transactions",
      async () => {
        await db.query("select commit_portfolio_import($1)", [id]);
        assert.equal(
          (await db.query("select * from portfolio_holdings")).rows.length,
          1,
        );
        assert.equal(
          (await db.query("select * from portfolio_transactions")).rows.length,
          1,
        );
      },
    );
    await t.test("other user cannot see or commit the import", async () => {
      await asUser(B);
      assert.equal(
        (await db.query("select * from portfolio_holdings")).rows.length,
        0,
      );
      assert.equal(
        (await db.query("select * from portfolio_imports")).rows.length,
        0,
      );
      await assert.rejects(
        db.query("select commit_portfolio_import($1)", [id]),
        /unavailable/,
      );
      await asUser(A);
    });
    await t.test(
      "failure after deletion rolls back previous holdings",
      async () => {
        const malformed = structuredClone(preview);
        malformed.holdings.push({ ...malformed.holdings[0] });
        malformed.checksum = "a".repeat(64);
        const failed = await draft(malformed);
        await db.query("update portfolio_imports set checksum=$1 where id=$2", [
          "a".repeat(64),
          failed,
        ]);
        await assert.rejects(
          db.query("select commit_portfolio_import($1)", [failed]),
          /duplicate key/,
        );
        assert.equal(
          (await db.query("select * from portfolio_holdings")).rows.length,
          1,
        );
        assert.equal(
          (
            await db.query<{ status: string }>(
              "select status from portfolio_imports where id=$1",
              [failed],
            )
          ).rows[0].status,
          "draft",
        );
      },
    );
    await t.test(
      "same scheme in separate folios succeeds atomically",
      async () => {
        const multiple = structuredClone(preview);
        multiple.holdings.push({
          ...multiple.holdings[0],
          folio_key: "different-folio",
        });
        const next = await draft(multiple);
        await db.query("update portfolio_imports set checksum=$1 where id=$2", [
          "b".repeat(64),
          next,
        ]);
        await db.query("select commit_portfolio_import($1)", [next]);
        assert.equal(
          (await db.query("select * from portfolio_holdings")).rows.length,
          2,
        );
        const backup = (
          await db.query<{ previous_holdings: unknown[] }>(
            "select previous_holdings from portfolio_imports where id=$1",
            [next],
          )
        ).rows[0];
        assert.equal(backup.previous_holdings.length, 1);
      },
    );
    await t.test(
      "NAV batch updates only owner positions and keeps dated evidence",
      async () => {
        const h = (
          await db.query<{ id: string }>("select id from portfolio_holdings")
        ).rows[0];
        const updates = [
          { id: h.id, nav: 15, date: "2026-06-02", amfi_code: "100001" },
        ];
        await asUser(B);
        await assert.rejects(
          db.query("select refresh_owned_navs($1)", [JSON.stringify(updates)]),
          /unavailable/,
        );
        await asUser(A);
        await db.query("select refresh_owned_navs($1)", [
          JSON.stringify(updates),
        ]);
        assert.equal(
          Number(
            (
              await db.query<{ current_value: string }>(
                "select current_value from portfolio_holdings where id=$1",
                [h.id],
              )
            ).rows[0].current_value,
          ),
          150,
        );
        assert.equal(
          (await db.query("select * from portfolio_nav_observations")).rows
            .length,
          1,
        );
      },
    );
    await t.test(
      "budgets persist across requests and cannot be deleted by a user",
      async () => {
        for (let i = 0; i < 5; i++)
          assert.equal(
            (
              await db.query<{ consume_portfolio_budget: boolean }>(
                "select consume_portfolio_budget('parse')",
              )
            ).rows[0].consume_portfolio_budget,
            true,
          );
        assert.equal(
          (
            await db.query<{ consume_portfolio_budget: boolean }>(
              "select consume_portfolio_budget('parse')",
            )
          ).rows[0].consume_portfolio_budget,
          false,
        );
        await assert.rejects(
          db.query("delete from portfolio_api_usage"),
          /permission denied/,
        );
      },
    );
  } finally {
    await db.close();
  }
});
