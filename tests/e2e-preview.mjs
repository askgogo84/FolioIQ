// Explicit opt-in integration test. Never run against production or customer accounts.
// .env.e2e.json is ignored; fixtures must be created in the disposable PR database.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createServerClient } from "@supabase/ssr";
const config = JSON.parse(fs.readFileSync(".env.e2e.json", "utf8"));
assert.equal(
  new URL(config.url).hostname,
  "fbqwrqerkzipkusljbfz.supabase.co",
  "Only the disposable PR preview is permitted",
);
const origin = process.env.FOLIOKEY_E2E_ORIGIN || "http://localhost:3100";
assert.equal(new URL(origin).hostname, "localhost");
const results = [];
async function check(name, fn) {
  await fn();
  results.push({ name, passed: true });
  console.log(`PASS ${name}`);
}
async function account(letter) {
  const jar = new Map();
  const db = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (cookies) => cookies.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  const { data, error } = await db.auth.signInWithPassword({
    email: `foliokey-e2e-${letter}@example.invalid`,
    password: config.password,
  });
  assert.equal(error, null, error?.message);
  assert.ok(data.user);
  return {
    db,
    user: data.user,
    jar,
    cookie: () => [...jar].map(([k, v]) => `${k}=${v}`).join("; "),
  };
}
async function request(
  path,
  account,
  body,
  method = body ? "POST" : "GET",
  customOrigin = origin,
) {
  const r = await fetch(origin + path, {
    signal: AbortSignal.timeout(60000),
    method,
    headers: {
      ...(account ? { cookie: account.cookie() } : {}),
      origin: customOrigin,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    redirect: "manual",
  });
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: r.status, data, headers: r.headers };
}
const a = await account("a"),
  b = await account("b");
await check(
  "Malformed JSON shapes return 400 rather than server errors",
  async () => {
    for (const body of [null, [], true, "invalid"]) {
      const r = await fetch(origin + "/api/plans", {
        method: "PUT",
        headers: {
          cookie: a.cookie(),
          origin,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      assert.equal(r.status, 400);
      assert.ok(r.headers.get("x-foliokey-request-id"));
    }
  },
);
await check(
  "Supabase issues real sessions for both preview accounts",
  async () => {
    assert.ok(a.user.id !== b.user.id);
  },
);
await check("Unauthenticated APIs reject access", async () => {
  for (const p of [
    "/api/portfolio/me",
    "/api/portfolio/ledger",
    "/api/plans?kind=goals",
    "/api/guide",
  ])
    assert.equal((await request(p)).status, 401);
});
await check(
  "Protected dashboard redirects unauthenticated visitor",
  async () => {
    const r = await request("/dashboard");
    assert.equal(r.status, 307);
    assert.match(r.headers.get("location"), /\/auth/);
  },
);
await check("Empty portfolio is truthful", async () => {
  const r = await request("/api/portfolio/me", b);
  assert.equal(r.status, 200);
  assert.equal(r.data.connected, false);
  assert.deepEqual(r.data.holdings, []);
});
await check("Cross-origin writes rejected", async () => {
  assert.equal(
    (
      await request(
        "/api/plans",
        a,
        { kind: "goals", revision: 0, payload: { items: [] } },
        "PUT",
        "https://foreign.invalid",
      )
    ).status,
    403,
  );
});
const goal = {
  id: "synthetic-goal",
  name: "Synthetic test goal",
  target: 100000,
  allocated: 1000,
  targetDate: "2030-01-01",
  monthly: 1000,
};
await check(
  "Planning persists and stale revisions cannot overwrite",
  async () => {
    const revision = (await request("/api/plans?kind=goals", a)).data.revision;
    const r = await request(
      "/api/plans",
      a,
      { kind: "goals", revision, payload: { items: [goal] } },
      "PUT",
    );
    assert.equal(r.status, 200);
    assert.equal(r.data.revision, revision + 1);
    assert.equal(
      (
        await request(
          "/api/plans",
          a,
          { kind: "goals", revision: 0, payload: { items: [] } },
          "PUT",
        )
      ).status,
      409,
    );
    assert.equal(
      (await request("/api/plans?kind=goals", a)).data.payload.items[0].name,
      goal.name,
    );
    assert.deepEqual(
      (await request("/api/plans?kind=goals", b)).data.payload.items,
      [],
    );
    assert.equal(
      (
        await request(
          "/api/plans",
          a,
          {
            kind: "goals",
            revision: 1,
            payload: { items: [{ ...goal, target: -1 }] },
          },
          "PUT",
        )
      ).status,
      422,
    );
  },
);
const cas = {
  meta: { statement_period: { from: "2023-01-01", to: "2024-01-01" } },
  mutual_funds: [
    {
      folio_number: "SYNTHETIC-ONLY",
      amc: "Synthetic AMC",
      schemes: [
        {
          name: "Synthetic test position",
          isin: "INF000000001",
          units: 10,
          nav: 11,
          value: 110,
          cost: 100,
          additional_info: { open_units: 0 },
          transactions: [
            {
              date: "2023-01-01",
              type: "PURCHASE",
              units: 10,
              amount: 100,
              nav: 10,
              balance: 10,
            },
          ],
        },
      ],
    },
  ],
};
let draft;
await check(
  "Import validates consent, stages without replacing holdings",
  async () => {
    const before = (await request("/api/portfolio/me", a)).data.holdings;
    assert.equal(
      (await request("/api/casparser/save", a, { data: cas })).status,
      400,
    );
    const r = await request("/api/casparser/save", a, {
      consent: true,
      data: cas,
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    draft = r.data.draftId;
    assert.ok(draft);
    assert.deepEqual(
      (await request("/api/portfolio/me", a)).data.holdings,
      before,
    );
  },
);
await check("Another user cannot commit the draft", async () => {
  assert.equal(
    (
      await request("/api/portfolio/import/commit", b, {
        draftId: draft,
        confirmReplace: true,
      })
    ).status,
    409,
  );
});
await check(
  "Confirmed import atomically creates owned holdings and transactions",
  async () => {
    const r = await request("/api/portfolio/import/commit", a, {
      draftId: draft,
      confirmReplace: true,
    });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    const p = await request("/api/portfolio/me", a);
    assert.equal(p.status, 200);
    assert.equal(p.data.holdings.length, 1);
    assert.equal(p.data.holdings[0].current_value, 110);
    assert.equal(
      (await request("/api/portfolio/me", b)).data.holdings.length,
      0,
    );
  },
);
await check("Committed statement ledger and export work", async () => {
  const r = await request("/api/portfolio/ledger", a);
  assert.equal(r.status, 200, JSON.stringify(r.data));
  fs.writeFileSync(".env.e2e-ledger.json", JSON.stringify(r.data));
  assert.equal(r.data.assessment.eligible, true);
  assert.ok(Math.abs(r.data.assessment.return.rate - 0.1) < 1e-9);
  assert.equal(r.data.canonical.events, 1);
  assert.equal(r.data.lots.taxLiability, null);
  const e = await request("/api/portfolio/export?kind=holdings", a);
  assert.equal(e.status, 200);
  assert.match(e.headers.get("content-type"), /text\/csv/);
  assert.match(e.data, /Synthetic test position/);
});
await check(
  "RLS blocks direct cross-user reads and ownership reassignment",
  async () => {
    const { data, error } = await b.db
      .from("portfolio_holdings")
      .select("id")
      .eq("user_id", a.user.id);
    assert.equal(error, null);
    assert.deepEqual(data, []);
    const own = await a.db.from("portfolio_holdings").select("id").single();
    assert.equal(own.error, null);
    const reassignment = await a.db
      .from("portfolio_holdings")
      .update({ user_id: b.user.id })
      .eq("id", own.data.id)
      .select("id");
    assert.ok(reassignment.error);
  },
);
await check(
  "Optional AI abstains when unconfigured and makes no provider call",
  async () => {
    assert.equal((await request("/api/guide", a)).data.configured, false);
    assert.equal(
      (
        await request("/api/guide", a, {
          consent: true,
          question: "What is my return?",
        })
      ).status,
      503,
    );
  },
);
await check("Guide database budget blocks after five requests", async () => {
  const { count, error } = await a.db
    .from("portfolio_guide_usage")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());
  assert.equal(error, null);
  for (let i = 0; i < 6; i++) {
    const r = await a.db.rpc("consume_guide_budget");
    assert.equal(r.error, null);
    assert.equal(r.data, i < Math.max(0, 5 - count));
  }
});
await check("All premium pages render under a real session", async () => {
  for (const p of [
    "/dashboard",
    "/portfolio",
    "/intelligence",
    "/upload",
    "/connect",
    "/sips",
    "/transactions",
    "/rebalance",
    "/profile",
    "/chat",
    "/goals",
    "/risk-profile",
    "/compare",
    "/overlap",
    "/capital-gains",
    "/reports",
    "/calculator",
  ]) {
    const r = await request(p, a);
    assert.equal(r.status, 200, p);
    assert.match(r.data, /<html/, p);
  }
});
fs.writeFileSync(
  ".env.e2e-browser.json",
  JSON.stringify([...a.jar].map(([name, value]) => ({ name, value }))),
);
fs.writeFileSync(
  "../../outputs/FolioKey-preview-e2e.json",
  JSON.stringify(
    {
      date: new Date().toISOString(),
      environment: "Disposable PR Supabase database; local Next.js app",
      syntheticOnly: true,
      paidProviderCalls: 0,
      productionMutations: 0,
      results,
    },
    null,
    2,
  ),
);
console.log(`${results.length} connected integration checks passed.`);
