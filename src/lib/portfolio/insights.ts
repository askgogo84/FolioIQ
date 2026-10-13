type Position = {
  scheme_name: string;
  category: string | null;
  amc: string | null;
  current_value: number | null;
  invested_amount: number | null;
  valuation_date?: string | null;
  nav_date?: string | null;
  isin?: string | null;
  scheme_code: string;
};
export type Finding = {
  id: string;
  title: string;
  detail: string;
  kind: "coverage" | "observation";
  method: string;
};
export function assessPortfolio(rows: Position[]): Finding[] {
  const result: Finding[] = [];
  if (!rows.length)
    return [
      {
        id: "empty",
        title: "Import a portfolio first",
        detail:
          "No personal investment conclusions can be drawn without records.",
        kind: "coverage",
        method: "presence-v1",
      },
    ];
  const missingValue = rows.filter((r) => r.current_value === null).length,
    missingCost = rows.filter((r) => r.invested_amount === null).length;
  const unknownDates = rows.filter(
    (r) => !r.valuation_date && !r.nav_date,
  ).length;
  if (missingValue || missingCost || unknownDates)
    result.push({
      id: "coverage",
      title: "Some evidence is missing",
      detail:
        missingValue +
        " positions lack value, " +
        missingCost +
        " lack cost and " +
        unknownDates +
        " lack a valuation date. Related metrics are unavailable.",
      kind: "coverage",
      method: "coverage-count-v1",
    });
  const total = rows.reduce((s, r) => s + (r.current_value ?? 0), 0);
  if (!missingValue && total > 0) {
    for (const field of ["amc", "category"] as const) {
      const buckets: Record<string, number> = {};
      for (const r of rows) {
        const key = r[field] || "Unknown";
        buckets[key] = (buckets[key] || 0) + (r.current_value ?? 0);
      }
      const top = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0];
      result.push({
        id: field,
        title:
          field === "amc"
            ? "Largest AMC exposure"
            : "Largest reported asset category",
        detail:
          top[0] +
          " accounts for " +
          ((top[1] / total) * 100).toFixed(1) +
          "% of the valued snapshot. This is an observation, not a recommended target allocation.",
        kind: "observation",
        method: "current-value-weight-v1",
      });
    }
  }
  const ids = rows.map((r) => r.isin || r.scheme_code),
    duplicates = new Set(ids.filter((v, i) => ids.indexOf(v) !== i));
  if (duplicates.size)
    result.push({
      id: "duplicates",
      title: "Schemes appear in multiple folios",
      detail:
        duplicates.size +
        " identifiers occur in more than one position. This can be normal; it does not measure security-level overlap.",
      kind: "observation",
      method: "exact-identifier-v1",
    });
  result.push({
    id: "recommendations",
    title: "Fund recommendations need more evidence",
    detail:
      "Verified fund history, benchmarks, costs, holdings and your risk/goal preferences are required before ranking alternatives. No best-fund recommendation is generated from an incomplete snapshot.",
    kind: "coverage",
    method: "eligibility-gate-v1",
  });
  return result;
}
