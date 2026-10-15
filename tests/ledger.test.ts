import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCas } from "../src/lib/portfolio/import";
import {
  reconcileStatement,
  canonicalEvents,
  eventKind,
} from "../src/lib/portfolio/ledger";
import { fifoLots } from "../src/lib/portfolio/lots";
import { xirr } from "../src/lib/portfolio/xirr";
function statement() {
  return normalizeCas({
    meta: { statement_period: { from: "2023-01-01", to: "2024-01-01" } },
    mutual_funds: [
      {
        folio_number: "SYNTHETIC-ONLY",
        amc: "Test",
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
  });
}
test("ACT/365 XIRR matches the published Microsoft reference example", () => {
  const result = xirr([
    { date: "2008-01-01", amount: -10000 },
    { date: "2008-03-01", amount: 2750 },
    { date: "2008-10-30", amount: 4250 },
    { date: "2009-02-15", amount: 3250 },
    { date: "2009-04-01", amount: 2750 },
  ]);
  assert.ok(Math.abs(result.rate! - 0.373362535) < 1e-8);
});
test("XIRR handles positive, negative, zero return and same-day netting", () => {
  for (const [closing, expected] of [
    [110, 0.1],
    [80, -0.2],
    [100, 0],
  ])
    assert.ok(
      Math.abs(
        xirr([
          { date: "2023-01-01", amount: -100 },
          { date: "2024-01-01", amount: closing },
        ]).rate! - expected,
      ) < 1e-9,
    );
  assert.ok(
    Math.abs(
      xirr([
        { date: "2023-01-01", amount: -70 },
        { date: "2023-01-01", amount: -30 },
        { date: "2024-01-01", amount: 110 },
      ]).rate! - 0.1,
    ) < 1e-9,
  );
});
test("XIRR abstains on invalid, same-date, one-sign and ambiguous cash flows", () => {
  for (const flows of [
    [
      { date: "2023-02-30", amount: -1 },
      { date: "2024-01-01", amount: 2 },
    ],
    [
      { date: "2023-01-01", amount: -1 },
      { date: "2023-01-01", amount: 2 },
    ],
    [
      { date: "2023-01-01", amount: 1 },
      { date: "2024-01-01", amount: 2 },
    ],
    [
      { date: "2023-01-01", amount: -100 },
      { date: "2023-02-01", amount: 200 },
      { date: "2023-03-01", amount: -200 },
      { date: "2024-01-01", amount: 100 },
    ],
  ])
    assert.equal(xirr(flows).rate, null);
});
test("documented opening units and dates permit only statement-scoped return", () => {
  const p = statement(),
    a = reconcileStatement(p);
  assert.equal(p.holdings[0].opening_units, 0);
  assert.equal(p.statement_from, "2023-01-01");
  assert.equal(a.eligible, true);
  assert.ok(Math.abs(a.return.rate! - 0.1) < 1e-9);
  assert.match(a.scope, /Latest imported statement only/);
});
test("missing or nonzero opening units cannot manufacture initial capital", () => {
  for (const opening of [undefined, null, 5]) {
    const p = statement();
    p.holdings[0].opening_units = opening;
    assert.equal(reconcileStatement(p).return.rate, null);
  }
});
test("unmatched position, missing amount, bad source balance and out-of-period event block returns", () => {
  for (const mutate of [
    (p: ReturnType<typeof statement>) => {
      p.transactions[0].position_key = "unknown";
    },
    (p: ReturnType<typeof statement>) => {
      p.transactions[0].amount = null;
    },
    (p: ReturnType<typeof statement>) => {
      p.transactions[0].balance = 9;
    },
    (p: ReturnType<typeof statement>) => {
      p.transactions[0].date = "2022-12-31";
    },
    (p: ReturnType<typeof statement>) => {
      p.holdings[0].units = 9;
    },
  ]) {
    const p = statement();
    mutate(p);
    assert.equal(reconcileStatement(p).return.rate, null);
  }
});
test("switches, mergers, reversals, segregation and taxes stay explicitly unmapped", () => {
  for (const type of [
    "SWITCH_IN",
    "SWITCH_OUT",
    "SWITCH_IN_MERGER",
    "REVERSAL",
    "SEGREGATION",
    "STAMP_DUTY_TAX",
    "TDS_TAX",
    "STT_TAX",
    "MISC",
    "UNKNOWN",
  ]) {
    const p = statement();
    p.transactions[0].type = type;
    assert.equal(eventKind(type), "unsupported");
    assert.equal(reconcileStatement(p).return.rate, null);
  }
});
test("canonical evidence preserves repeated same-day occurrences and detects multiplicity conflicts", () => {
  const t = statement().transactions[0],
    a = canonicalEvents([
      { id: "a", transactions: [t, t] },
      { id: "b", transactions: [t, t] },
    ]);
  assert.equal(a.events.length, 2);
  assert.equal(a.ambiguousDuplicates.length, 0);
  assert.equal(a.certifiedComplete, false);
  assert.equal(
    canonicalEvents([
      { id: "a", transactions: [t, t] },
      { id: "b", transactions: [t] },
    ]).ambiguousDuplicates.length,
    1,
  );
});
test("FIFO partial redemptions consume earliest source lots and reconcile remaining cost", () => {
  const p = statement(),
    t = p.transactions[0];
  p.transactions.push(
    {
      ...t,
      date: "2023-02-01",
      ordinal: 1,
      units: 10,
      amount: 200,
      nav: 20,
      balance: 20,
    },
    {
      ...t,
      date: "2023-03-01",
      ordinal: 2,
      type: "REDEMPTION",
      units: -15,
      amount: -450,
      nav: 30,
      balance: 5,
    },
  );
  p.holdings[0].units = 5;
  p.holdings[0].current_value = 55;
  const a = fifoLots(p).positions[0];
  assert.equal(a.available, true);
  assert.equal(a.realizedGain, 250);
  assert.equal(a.openLots[0].units, 5);
  assert.equal(a.openLots[0].sourceCost, 100);
});
test("FIFO refuses oversells and unsupported source lot treatment", () => {
  for (const kind of ["REDEMPTION", "DIVIDEND_REINVEST", "SWITCH_IN"]) {
    const p = statement();
    p.transactions[0].type = kind;
    assert.equal(fifoLots(p).positions[0].available, false);
  }
});
test("widget wrapper preserves only normalized financial evidence", () => {
  const raw = {
    meta: { statement_period: { from: "2023-01-01", to: "2024-01-01" } },
    investor: {
      pan: "SYNTHETIC_PAN_DO_NOT_SAVE",
      email: "synthetic@example.invalid",
    },
    mutual_funds: [
      {
        folio_number: "SyntheticFolioOnly",
        amc: "Test",
        schemes: [
          {
            name: "Synthetic wrapper test",
            isin: "INF000000001",
            units: 10,
            nav: 11,
            value: 110,
            cost: 100,
            additional_info: { open_units: 0, close_units: 10 },
          },
        ],
      },
    ],
  };
  const p = normalizeCas({ raw_response: raw });
  assert.equal(p.holdings.length, 1);
  assert.equal(p.holdings[0].opening_units, 0);
  assert.ok(!JSON.stringify(p).includes("SYNTHETIC_PAN_DO_NOT_SAVE"));
  assert.ok(!JSON.stringify(p).includes("synthetic@example.invalid"));
  const bad = structuredClone(raw);
  bad.mutual_funds[0].schemes[0].additional_info.close_units = 9;
  assert.throws(() => normalizeCas(bad), /inconsistent/);
  assert.throws(
    () =>
      normalizeCas({
        meta: { statement_period: { from: "2024-01-01", to: "2023-01-01" } },
        mutual_funds: [],
      }),
    /reversed/,
  );
});
