import test from "node:test";
import assert from "node:assert/strict";
import {
  validatePlan,
  goalProgress,
  nextSipDate,
  allocationScenario,
  type Sip,
} from "../src/lib/planning/model";
import { projectSip } from "../src/lib/planning/projection";
import { csv } from "../src/lib/portfolio/export";
test("planning validators reject duplicate identities, invalid dates, nonfinite values and malformed targets", () => {
  const goal = {
    id: "test",
    name: "User goal",
    target: 1000,
    allocated: 0,
    targetDate: "2030-01-01",
    monthly: 100,
  };
  for (const items of [
    [goal, goal],
    [{ ...goal, target: NaN }],
    [{ ...goal, targetDate: "2030-02-30" }],
  ])
    assert.throws(() => validatePlan("goals", { items }));
  assert.throws(
    () =>
      validatePlan("targets", { items: [{ category: "Equity", percent: 50 }] }),
    /100%/,
  );
  assert.throws(() =>
    validatePlan("risk", {
      preferences: {
        horizonYears: 10,
        liquidityMonths: 1,
        lossTolerance: "auto",
        experience: "new",
        debtComfort: false,
      },
    }),
  );
  assert.deepEqual(
    validatePlan("goals", { items: [goal], PAN: "must not persist" }),
    { items: [goal] },
  );
});
test("goal calculation uses zero returns and full months with no invented allocation", () => {
  const g = {
    id: "test",
    name: "User goal",
    target: 1200,
    allocated: 0,
    targetDate: "2027-01-15",
    monthly: 100,
  };
  const p = goalProgress(g, "2026-01-15");
  assert.equal(p.months, 12);
  assert.equal(p.requiredMonthly, 100);
  assert.equal(p.contributionOnlyValue, 1200);
  assert.equal(goalProgress(g, "2027-01-15").requiredMonthly, null);
});
test("manual SIP schedule handles month/year rollover, pause, start and end", () => {
  const s: Sip = {
    id: "test",
    name: "User schedule",
    amount: 100,
    day: 5,
    startDate: "2026-01-01",
    endDate: null,
    status: "planned",
  };
  assert.equal(nextSipDate(s, "2026-12-06"), "2027-01-05");
  assert.equal(nextSipDate({ ...s, status: "paused" }, "2026-12-06"), null);
  assert.equal(
    nextSipDate({ ...s, startDate: "2027-02-10" }, "2026-12-06"),
    "2027-03-05",
  );
  assert.equal(
    nextSipDate({ ...s, endDate: "2026-12-31" }, "2026-12-06"),
    null,
  );
});
test("allocation arithmetic uses user targets and abstains on incomplete values", () => {
  const rows = [
      { category: "Equity", current_value: 80 },
      { category: "Debt", current_value: 20 },
    ],
    targets = [
      { category: "Equity", percent: 50 },
      { category: "Debt", percent: 50 },
    ];
  assert.equal(allocationScenario(rows, targets).rows[0].difference, -30);
  assert.equal(
    allocationScenario([{ category: null, current_value: null }], targets)
      .available,
    false,
  );
});
test("SIP projections convert annual effective rate correctly and support loss/zero scenarios", () => {
  assert.equal(projectSip(100, 1, 0, 0).value, 1200);
  assert.equal(projectSip(100, 2, 0, 10).invested, 2520);
  assert.ok(projectSip(100, 1, -20, 0).value < 1200);
  const r = Math.pow(1.12, 1 / 12) - 1;
  assert.ok(
    Math.abs(
      projectSip(100, 1, 12, 0).value - (100 * (Math.pow(1 + r, 12) - 1)) / r,
    ) < 1e-6,
  );
  assert.throws(() => projectSip(100, 1, -100, 0));
  assert.throws(() => projectSip(1e9, 50, 100, 100));
});
test("CSV quotes text, preserves unknown and neutralizes formula injection", () => {
  const out = csv([
    ['=HYPERLINK("secret")', " +SUM(1)", null, -12, "line\nnext"],
  ]);
  assert.ok(out.includes("'=HYPERLINK"));
  assert.ok(out.includes("' +SUM"));
  assert.ok(out.includes('"","-12"'));
  assert.ok(out.includes('"line\nnext"'));
});
