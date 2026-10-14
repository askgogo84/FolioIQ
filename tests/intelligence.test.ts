import test from "node:test";
import assert from "node:assert/strict";
import { analyzePortfolio } from "../src/lib/intelligence/generate";
import {
  finite,
  validDate,
  type Position,
} from "../src/lib/intelligence/types";
const today = "2026-10-14";
const position = (patch: Partial<Position> = {}): Position => ({
  id: "synthetic-1",
  scheme_name: "Synthetic test fund",
  scheme_code: "TEST",
  isin: null,
  amfi_code: null,
  folio_label: "Test only",
  category: "Equity",
  amc: "Test AMC",
  units: 10,
  current_value: 100,
  invested_amount: 80,
  current_nav: 10,
  nav_date: "2026-10-13",
  valuation_date: "2026-10-13",
  ...patch,
});
test("empty portfolio has no invented totals, allocations or readiness", () => {
  const a = analyzePortfolio([], today);
  assert.equal(a.summary.totalCurrent, null);
  assert.equal(a.summary.totalInvested, null);
  assert.equal(a.allocation.category.available, false);
  assert.equal(a.performance.available, false);
  assert.equal(a.performance.checks[0].ready, false);
});
test("missing value preserves known subtotal and suppresses whole-portfolio gain", () => {
  const a = analyzePortfolio(
    [position(), position({ id: "2", current_value: null, category: "Debt" })],
    today,
  );
  assert.equal(a.summary.totalCurrent, null);
  assert.equal(a.summary.knownCurrent, 100);
  assert.equal(a.summary.totalGain, null);
  assert.equal(a.allocation.category.partial, true);
  assert.equal(a.allocation.category.excluded, 1);
  assert.equal(a.allocation.category.slices[0].percent, 100);
  assert.match(
    a.findings.find((f) => f.id === "AMC")!.detail,
    /known valued positions/,
  );
});
test("zero value is present, zero denominator cannot produce chart or false return", () => {
  const a = analyzePortfolio(
    [position({ current_value: 0, invested_amount: 0 })],
    today,
  );
  assert.equal(a.summary.totalCurrent, 0);
  assert.equal(a.quality.valued, 1);
  assert.equal(a.allocation.category.available, false);
  assert.equal(a.performance.available, false);
});
test("missing cost suppresses gain while valid value remains available", () => {
  const a = analyzePortfolio([position({ invested_amount: null })], today);
  assert.equal(a.summary.totalCurrent, 100);
  assert.equal(a.summary.totalGain, null);
  assert.equal(a.summary.totalInvested, null);
});
test("invalid numeric inputs never become a valid zero or chart contribution", () => {
  for (const x of [
    null,
    undefined,
    "",
    " ",
    false,
    {},
    [],
    NaN,
    Infinity,
    -1,
    1e16,
  ])
    assert.equal(finite(x), null);
  assert.equal(finite("0"), 0);
  assert.equal(finite("12.5"), 12.5);
  const a = analyzePortfolio([position({ current_value: NaN })], today);
  assert.equal(a.summary.totalCurrent, null);
  assert.equal(a.allocation.amc.available, false);
});
test("unknown category stays visible and cannot masquerade as a known exposure", () => {
  const a = analyzePortfolio(
    [
      position({ category: null, current_value: 300 }),
      position({ id: "2", current_value: 100 }),
    ],
    today,
  );
  assert.equal(a.allocation.category.slices[0].label, "Unknown");
  assert.equal(a.concentration.category.unknownPercent, 75);
  assert.equal(a.concentration.category.largest?.label, "Equity");
  assert.equal(a.concentration.category.largest?.percent, 25);
});
test("dates distinguish mixed snapshot dates, invalid dates and stale NAVs", () => {
  assert.equal(validDate("2026-02-30", today), null);
  assert.equal(validDate("2026-10-15", today), null);
  const a = analyzePortfolio(
    [
      position({ nav_date: "2026-10-01", valuation_date: "2026-10-01" }),
      position({ id: "2", nav_date: null, valuation_date: "2026-10-13" }),
    ],
    today,
  );
  assert.equal(a.quality.mixedDates, true);
  assert.equal(a.nav.older, 1);
  assert.equal(a.nav.undatedOrMissing, 1);
  assert.equal(a.quality.oldestDate, "2026-10-01");
});
test("a newer valuation date does not disguise an old NAV", () => {
  const a = analyzePortfolio([position({ nav_date: "2026-09-01" })], today);
  assert.equal(a.nav.older, 1);
  assert.equal(a.quality.newestDate, "2026-10-13");
});
test("complete snapshot is never promoted to verified performance or advice", () => {
  const a = analyzePortfolio([position()], today);
  assert.equal(a.summary.totalGain, 20);
  assert.equal(a.performance.available, false);
  assert.equal(a.performance.checks.filter((c) => c.ready).length, 1);
  assert.equal(a.quality.status, "snapshot fields present");
  assert(a.findings.every((f) => f.evidence && f.href.startsWith("/")));
});
test("allocation totals and schemes preserve positions across folios", () => {
  const a = analyzePortfolio(
    [
      position({ isin: "INF000000001" }),
      position({
        id: "2",
        isin: "INF000000001",
        amc: "Another AMC",
        current_value: 300,
      }),
    ],
    today,
  );
  assert.equal(a.summary.positions, 2);
  assert.equal(a.summary.schemes, 1);
  assert.equal(a.allocation.amc.total, 400);
  assert.equal(
    a.allocation.amc.slices.reduce((s, r) => s + r.percent, 0),
    100,
  );
  assert.equal(a.concentration.amc.largest?.percent, 75);
});
