import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("planning migration replays safely and enforces tenant isolation, ownership and optimistic revisions", async () => {
  const db = new PGlite(),
    a = "00000000-0000-4000-8000-000000000001",
    b = "00000000-0000-4000-8000-000000000002";
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${a}'),('${b}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;`,
    );
    const sql = readFileSync(
      "supabase/migrations/20261014173550_portfolio_planning.sql",
      "utf8",
    );
    await db.exec(sql);
    await db.exec(sql);
    await db.exec("set role anon");
    await assert.rejects(
      db.query("select consume_guide_budget()"),
      /permission denied/,
    );
    await assert.rejects(
      db.query("select * from portfolio_plans"),
      /permission denied/,
    );
    await db.exec(
      `reset role;set role authenticated;set request.jwt.claim.sub='${a}'`,
    );
    await db.query(
      "insert into portfolio_plans(user_id,kind,payload) values($1,'goals','{\"items\":[]}')",
      [a],
    );
    await assert.rejects(
      db.query(
        "insert into portfolio_plans(user_id,kind,payload) values($1,'risk','{}')",
        [b],
      ),
      /row-level security/,
    );
    await assert.rejects(
      db.query("update portfolio_plans set user_id=$1", [b]),
      /row-level security/,
    );
    const first = await db.query(
      "update portfolio_plans set revision=revision+1 where user_id=$1 and kind='goals' and revision=1 returning revision",
      [a],
    );
    assert.equal(first.rows.length, 1);
    const stale = await db.query(
      "update portfolio_plans set revision=revision+1 where user_id=$1 and kind='goals' and revision=1 returning revision",
      [a],
    );
    assert.equal(stale.rows.length, 0);
    await db.exec(`set request.jwt.claim.sub='${b}'`);
    assert.equal(
      (await db.query("select * from portfolio_plans")).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          "delete from portfolio_plans where user_id=$1 returning user_id",
          [a],
        )
      ).rows.length,
      0,
    );
    await db.exec(`set request.jwt.claim.sub='${a}'`);
    for (let i = 0; i < 5; i++)
      assert.equal(
        (
          await db.query<{ consume_guide_budget: boolean }>(
            "select consume_guide_budget()",
          )
        ).rows[0].consume_guide_budget,
        true,
      );
    assert.equal(
      (
        await db.query<{ consume_guide_budget: boolean }>(
          "select consume_guide_budget()",
        )
      ).rows[0].consume_guide_budget,
      false,
    );
    await assert.rejects(
      db.query("delete from portfolio_guide_usage"),
      /permission denied/,
    );
    assert.equal(
      (await db.query("select * from portfolio_plans")).rows.length,
      1,
    );
    await assert.rejects(
      db.query(
        "insert into portfolio_plans(user_id,kind,payload) values($1,'unknown','{}')",
        [a],
      ),
      /check constraint/,
    );
  } finally {
    await db.close();
  }
});
