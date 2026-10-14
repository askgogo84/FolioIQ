import type { ImportPreview } from "./import";
import { reconcileStatement, eventKind, groupTransactions } from "./ledger";
export function fifoLots(
  preview: ImportPreview,
  assessment = reconcileStatement(preview),
) {
  const groups = groupTransactions(preview.transactions);
  const results = preview.holdings.map((h) => {
    const key = h.folio_key + ":" + h.scheme_code,
      check = assessment.positions.find((p) => p.key === key)!;
    const txs = [...(groups.get(key) || [])].sort(
      (a, b) =>
        (a.date || "").localeCompare(b.date || "") || a.ordinal - b.ordinal,
    );
    const issues = [...check.issues, ...assessment.issues];
    if (
      txs.some(
        (t) =>
          !["purchase", "redemption", "payout"].includes(eventKind(t.type)),
      )
    )
      issues.push(
        "FIFO supports source purchases and redemptions only; reinvestments and corporate actions need reviewed lot treatment.",
      );
    if (issues.length)
      return {
        key,
        name: h.scheme_name,
        available: false,
        issues: [...new Set(issues)],
        openLots: [],
        realized: [],
        realizedGain: null,
      };
    const lots: { date: string; units: number; costPerUnit: number }[] = [],
      realized: {
        date: string;
        units: number;
        proceeds: number;
        sourceCost: number;
        difference: number;
      }[] = [];
    for (const t of txs) {
      const kind = eventKind(t.type),
        units = Math.abs(t.units ?? 0),
        amount = Math.abs(t.amount ?? 0);
      if (kind === "purchase")
        lots.push({ date: t.date!, units, costPerUnit: amount / units });
      if (kind === "redemption") {
        let remaining = units,
          sourceCost = 0;
        for (const lot of lots) {
          const used = Math.min(lot.units, remaining);
          sourceCost += used * lot.costPerUnit;
          lot.units -= used;
          remaining -= used;
          if (remaining <= 1e-8) break;
        }
        if (remaining > 0.00001)
          return {
            key,
            name: h.scheme_name,
            available: false,
            issues: ["Redemption exceeds supported acquisition lots."],
            openLots: [],
            realized: [],
            realizedGain: null,
          };
        realized.push({
          date: t.date!,
          units,
          proceeds: amount,
          sourceCost,
          difference: amount - sourceCost,
        });
      }
    }
    return {
      key,
      name: h.scheme_name,
      available: true,
      issues: [],
      openLots: lots
        .filter((l) => l.units > 1e-8)
        .map((l) => ({
          date: l.date,
          units: l.units,
          sourceCost: l.costPerUnit * l.units,
        })),
      realized,
      realizedGain: realized.reduce((s, r) => s + r.difference, 0),
    };
  });
  return {
    positions: results,
    method:
      "FIFO over reconciled zero-opening statement units and source amounts. Pre-tax arithmetic only; legal tax basis, transaction charges, exit loads and tax rates are not certified.",
    taxLiability: null,
  };
}
export type LotAssessment = ReturnType<typeof fifoLots>;
