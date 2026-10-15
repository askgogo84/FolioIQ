import test from "node:test";
import assert from "node:assert/strict";
import {
  parseNavHistory,
  compareNavSeries,
} from "../src/lib/portfolio/history";
const header = "Scheme Code;Scheme Name;Net Asset Value;Date\n";
test("AMFI history retains dates and compares exact common observations without filling gaps", () => {
  const series = parseNavHistory(
    header +
      "100001;Synthetic A;10;01-Jan-2023\n100001;Synthetic A;11;01-Jan-2024\n100002;Synthetic B;10;01-Jan-2023\n100002;Synthetic B;20;01-Jul-2023\n100002;Synthetic B;12;01-Jan-2024",
  );
  const r = compareNavSeries(series[0], series[1]);
  assert.equal(r.commonDates, 2);
  assert.ok(Math.abs(r.a.annualizedPercent! - 10) < 1e-9);
  assert.equal(r.points[0].a, 100);
  assert.equal(r.recommendationAvailable, false);
});
test("AMFI history rejects conflicts, invalid NAVs/dates and unlabelled input", () => {
  for (const body of [
    "100001;A;10;2023-01-01\n100001;A;11;2023-01-01",
    "100001;A;0;2023-01-01",
    "100001;A;10;2023-02-30",
    "100001;A;10;2999-01-01",
    "100001;A;10;2023-01-01\n100001;B;10;2023-02-01",
  ])
    assert.throws(() => parseNavHistory(header + body));
  assert.throws(() => parseNavHistory("100001;A;10;2023-01-01"));
});
test("NAV comparisons do not annualize short intervals or label NAV as total return", () => {
  const a = {
      code: "100001",
      name: "Synthetic",
      points: [
        { date: "2023-01-01", nav: 10 },
        { date: "2023-02-01", nav: 11 },
      ],
    },
    b = { ...a, code: "100002" };
  const r = compareNavSeries(a, b);
  assert.equal(r.a.annualizedPercent, null);
  assert.match(r.method, /no distributions/);
  assert.throws(() => compareNavSeries(a, a));
});
