import test from "node:test";
import assert from "node:assert/strict";
import {
  parseConstituents,
  compareConstituents,
} from "../src/lib/portfolio/overlap";
const header = "fund_id,security_isin,weight_percent,as_of\n";
test("overlap preserves unknown coverage and sums minimum exact-ISIN weights", () => {
  const f = parseConstituents(
    header +
      "a,INE000000001,40,2023-01-01\na,INE000000002,20,2023-01-01\nb,INE000000001,30,2023-01-01\nb,INE000000003,50,2023-01-01",
  );
  const r = compareConstituents(f[0], f[1]);
  assert.equal(r.knownOverlap, 30);
  assert.equal(r.aCoverage, 60);
  assert.equal(r.complete, false);
  assert.equal(r.common.length, 1);
});
test("overlap rejects mixed dates, repeated securities, invalid identifiers and excessive weights", () => {
  for (const rows of [
    "a,INE000000001,40,2023-01-01\na,INE000000001,20,2023-01-01",
    "a,INE000000001,40,2023-01-01\na,INE000000002,20,2023-02-01",
    "a,INE000000001,80,2023-01-01\na,INE000000002,50,2023-01-01",
    "a,not-an-isin,40,2023-01-01",
  ])
    assert.throws(() => parseConstituents(header + rows));
  const f = parseConstituents(
    header + "a,INE000000001,40,2023-01-01\nb,INE000000001,30,2023-02-01",
  );
  assert.throws(() => compareConstituents(f[0], f[1]), /same date/);
});
