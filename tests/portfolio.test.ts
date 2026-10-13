import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCas,
  numeric,
  isoDate,
  summarize,
} from "../src/lib/portfolio/import";
import { parseAmfi } from "../src/lib/portfolio/nav";
import { assessPortfolio } from "../src/lib/portfolio/insights";
import { safeNext } from "../src/lib/auth/redirect";
export function fixture() {
  return {
    meta: { statement_period: { to: "2026-06-01" } },
    investor: { pan: "DO_NOT_PERSIST" },
    mutual_funds: [
      {
        folio_number: "12345",
        amc: "Example AMC",
        schemes: [
          {
            isin: "INF000000001",
            name: "Example Growth",
            type: "Equity",
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
}
test("documented CAS cost, dates, masked folio and transactions are preserved without investor identity", () => {
  const p = normalizeCas(fixture());
  assert.equal(p.holdings[0].invested_amount, 100);
  assert.equal(p.holdings[0].purchase_date, null);
  assert.equal(p.holdings[0].folio_label, "••••2345");
  assert.equal(p.transactions.length, 1);
  assert(!JSON.stringify(p).includes("DO_NOT_PERSIST"));
  assert(!JSON.stringify(p).includes("12345"));
});
test("same scheme in distinct folios stays distinct", () => {
  const f = fixture();
  f.mutual_funds.push({ ...f.mutual_funds[0], folio_number: "67890" });
  const p = normalizeCas(f);
  assert.equal(p.holdings.length, 2);
  assert.notEqual(p.holdings[0].folio_key, p.holdings[1].folio_key);
});
test("duplicate position and absent identity reject whole import", () => {
  const f = fixture();
  f.mutual_funds.push(f.mutual_funds[0]);
  assert.throws(() => normalizeCas(f), /Duplicate/);
  const g = fixture();
  g.mutual_funds[0].folio_number = "";
  assert.throws(() => normalizeCas(g), /folio number/);
});
test("unknown cost and dates remain unknown, no generated purchase dates", () => {
  const f: {
    meta?: unknown;
    mutual_funds: {
      folio_number: string;
      amc: string;
      schemes: Record<string, unknown>[];
    }[];
  } = fixture();
  delete f.meta;
  delete f.mutual_funds[0].schemes[0].cost;
  const p = normalizeCas(f);
  assert.equal(p.statement_date, null);
  assert.equal(p.holdings[0].invested_amount, null);
  assert.equal(summarize(p.holdings).totalGain, null);
});
test("zero cost/value is not silently missing or discarded", () => {
  const f = fixture();
  Object.assign(f.mutual_funds[0].schemes[0], { units: 0, value: 0, cost: 0 });
  const p = normalizeCas(f);
  assert.equal(p.holdings.length, 1);
  assert.equal(summarize(p.holdings).totalCurrent, 0);
  assert.equal(summarize(p.holdings).gainPct, null);
});
test("invalid and mismatched numeric inputs fail closed", () => {
  for (const v of ["NaN", "Infinity", {}, true])
    assert.throws(() => numeric(v));
  const f = fixture();
  f.mutual_funds[0].schemes[0].value = 999;
  assert.throws(() => normalizeCas(f), /reconcile/);
  assert.equal(numeric(""), null);
  assert.equal(numeric("1,234.56"), 1234.56);
});
test("invalid dates rejected rather than rolled into another month", () => {
  assert.throws(() => isoDate("2025-02-30"));
  assert.throws(() => isoDate("1/2/2025"));
  assert.equal(isoDate(null), null);
  assert.equal(isoDate("2024-02-29"), "2024-02-29");
});
test("missing valuation never reports a complete portfolio gain", () => {
  const s = summarize([
    { current_value: 100, invested_amount: 80 },
    { current_value: null, invested_amount: 90 },
  ]);
  assert.equal(s.totalCurrent, null);
  assert.equal(s.totalGain, null);
  assert.equal(s.knownCurrent, 100);
});
test("AMFI exact identifiers, dated NAVs, no malformed/future values", () => {
  const m = parseAmfi(
    "100001;INF000000001;-;Example;12.50;01-Jun-2026\n100002;-;-;Bad;0;01-Jun-2026\n100003;-;-;Future;30;01-Jun-2030\n100004;-;-;Bad date;10;31-Feb-2026",
    "2026-10-13",
  );
  assert.equal(m.get("INF000000001")?.nav, 12.5);
  assert.equal(m.get("100001")?.date, "2026-06-01");
  assert(!m.has("100002"));
  assert(!m.has("100003"));
  assert(!m.has("100004"));
  assert(!m.has("Example"));
});
test("no best-fund or opaque health score from incomplete data", () => {
  assert.equal(assessPortfolio([])[0].id, "empty");
  const rows = normalizeCas(fixture()).holdings;
  const findings = assessPortfolio(rows);
  assert(
    findings.some((f) => f.id === "recommendations" && f.kind === "coverage"),
  );
  assert(!JSON.stringify(findings).includes("score"));
});
test("redirect cannot leave origin or create an auth loop", () => {
  for (const p of [
    "//evil.test",
    "/\\evil.test",
    "https://evil.test",
    "/auth/callback",
    "/\nevil",
  ])
    assert.equal(safeNext(p), "/dashboard");
  assert.equal(safeNext("/portfolio"), "/portfolio");
});
