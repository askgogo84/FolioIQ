import { validDate } from "@/lib/intelligence/types";
export type CashFlow = { date: string; amount: number };
export type ReturnResult = {
  rate: number | null;
  reason: string;
  days: number;
  method: string;
};
/** Original ACT/365 XNPV root solver. Non-conventional flows abstain rather than pick an arbitrary root. */
export function xirr(
  flows: CashFlow[],
  today = new Date().toISOString().slice(0, 10),
): ReturnResult {
  const method =
    "ACT/365; same-day netting; conventional cash flows; bounded log-rate bisection";
  const unavailable = (reason: string, days = 0): ReturnResult => ({
    rate: null,
    reason,
    days,
    method,
  });
  const daily = new Map<string, number>();
  for (const f of flows) {
    if (
      !validDate(f.date, today) ||
      !Number.isFinite(f.amount) ||
      Math.abs(f.amount) > 1e15
    )
      return unavailable("Invalid dated cash flow.");
    daily.set(f.date, (daily.get(f.date) || 0) + f.amount);
  }
  const rows = [...daily]
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([, v]) => v !== 0);
  if (rows.length < 2)
    return unavailable(
      "At least two distinct dates and opposite cash flows are required.",
    );
  const first = Date.parse(rows[0][0]),
    days = (Date.parse(rows.at(-1)![0]) - first) / 86400000;
  if (rows[0][1] >= 0 || rows.at(-1)![1] <= 0)
    return unavailable(
      "An initial outflow and later inflow are required.",
      days,
    );
  let changes = 0;
  for (let i = 1; i < rows.length; i++)
    if (Math.sign(rows[i][1]) !== Math.sign(rows[i - 1][1])) changes++;
  if (changes !== 1)
    return unavailable(
      "Cash flows change sign more than once; a unique XIRR is not established.",
      days,
    );
  const scale = Math.max(...rows.map(([, v]) => Math.abs(v)));
  const points = rows.map(([d, v]) => ({
    t: (Date.parse(d) - first) / 86400000 / 365,
    v: v / scale,
  }));
  const npv = (logRate: number) => {
    const max = Math.max(...points.map((p) => -logRate * p.t));
    return points.reduce(
      (sum, p) => sum + p.v * Math.exp(-logRate * p.t - max),
      0,
    );
  };
  let lo = -20,
    hi = 20;
  if (npv(lo) <= 0 || npv(hi) >= 0)
    return unavailable(
      "No stable rate within the supported numerical range.",
      days,
    );
  for (let i = 0; i < 180; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  const rate = Math.expm1((lo + hi) / 2);
  if (
    !Number.isFinite(rate) ||
    rate <= -1 ||
    Math.abs(npv((lo + hi) / 2)) > 1e-9
  )
    return unavailable("Calculation did not converge.", days);
  return {
    rate,
    reason:
      "Calculated from the supplied dated cash flows; annualized, not a forecast.",
    days,
    method,
  };
}
