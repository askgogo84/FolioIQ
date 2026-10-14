import { validDate } from "@/lib/intelligence/types";
export type Constituents = {
  fund: string;
  date: string;
  weights: { isin: string; percent: number }[];
  coverage: number;
};
/** Original comparison over user-supplied weights. Missing disclosure is never renormalized away. */
export function parseConstituents(
  text: string,
  today = new Date().toISOString().slice(0, 10),
): Constituents[] {
  if (text.length > 1_000_000)
    throw new Error("Constituent file exceeds 1 MB.");
  const lines = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/);
  if (lines.shift()?.trim() !== "fund_id,security_isin,weight_percent,as_of")
    throw new Error(
      "Expected headers: fund_id,security_isin,weight_percent,as_of",
    );
  const groups = new Map<string, Constituents>();
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = line.split(",").map((v) => v.trim());
    if (cells.length !== 4)
      throw new Error("Each constituent row must have four fields.");
    const [fund, isin, raw, date] = cells,
      percent = Number(raw);
    if (
      !/^[A-Za-z0-9_-]{1,60}$/.test(fund) ||
      !/^IN[A-Z0-9]{10}$/.test(isin) ||
      !raw ||
      !Number.isFinite(percent) ||
      percent <= 0 ||
      percent > 100 ||
      !validDate(date, today)
    )
      throw new Error(
        "Invalid fund identifier, security ISIN, weight or disclosure date.",
      );
    const g = groups.get(fund) || { fund, date, weights: [], coverage: 0 };
    if (g.date !== date || g.weights.some((w) => w.isin === isin))
      throw new Error(
        "Mixed disclosure dates or duplicate securities within a fund.",
      );
    g.weights.push({ isin, percent });
    g.coverage += percent;
    if (g.coverage > 100.00001 || g.weights.length > 1000 || groups.size > 50)
      throw new Error(
        "Constituent coverage or file size exceeds supported limits.",
      );
    groups.set(fund, g);
  }
  if (!groups.size) throw new Error("No constituent rows supplied.");
  return [...groups.values()];
}
export function compareConstituents(a: Constituents, b: Constituents) {
  if (a.fund === b.fund) throw new Error("Choose two different funds.");
  if (a.date !== b.date)
    throw new Error(
      "Compare disclosures from the same date; dates cannot be silently mixed.",
    );
  const weights = new Map(b.weights.map((w) => [w.isin, w.percent]));
  const common = a.weights
    .filter((w) => weights.has(w.isin))
    .map((w) => ({
      isin: w.isin,
      a: w.percent,
      b: weights.get(w.isin)!,
      shared: Math.min(w.percent, weights.get(w.isin)!),
    }))
    .sort((x, y) => y.shared - x.shared);
  return {
    date: a.date,
    funds: [a.fund, b.fund],
    aCoverage: a.coverage,
    bCoverage: b.coverage,
    knownOverlap: common.reduce((s, w) => s + w.shared, 0),
    common,
    complete:
      Math.abs(a.coverage - 100) < 0.00001 &&
      Math.abs(b.coverage - 100) < 0.00001,
    method:
      "Sum of minimum disclosed security weights on one common date. Missing cash, derivatives or undisclosed positions are not invented; partial overlap is a known lower bound, not a full portfolio assessment.",
  };
}
export type OverlapResult = ReturnType<typeof compareConstituents>;
