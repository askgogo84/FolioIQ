import { createHash } from "node:crypto";
import type { ImportPreview, Transaction } from "./import";
import { validDate } from "@/lib/intelligence/types";
import { xirr, type CashFlow } from "./xirr";
export type EventKind =
  "purchase" | "redemption" | "payout" | "reinvestment" | "unsupported";
export function eventKind(type: string): EventKind {
  return (
    (
      {
        PURCHASE: "purchase",
        PURCHASE_SIP: "purchase",
        REDEMPTION: "redemption",
        DIVIDEND_PAYOUT: "payout",
        DIVIDEND_REINVEST: "reinvestment",
      } as Record<string, EventKind>
    )[type.trim().toUpperCase()] || "unsupported"
  );
}
const fingerprint = (t: Transaction) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        t.position_key,
        t.date,
        t.type,
        t.units,
        t.amount,
        t.nav,
        t.balance ?? null,
      ]),
    )
    .digest("hex");
export function groupTransactions(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const rows = groups.get(t.position_key) || [];
    rows.push(t);
    groups.set(t.position_key, rows);
  }
  return groups;
}
/** Canonical evidence index. Retains same-day identical occurrences; conflicting multiplicity never certifies a ledger. */
export function canonicalEvents(
  imports: { id: string; transactions: Transaction[] }[],
) {
  const index = new Map<
    string,
    { event: Transaction; count: number; sources: string[] }
  >();
  const conflicts: string[] = [];
  for (const source of imports) {
    const local = new Map<string, { event: Transaction; count: number }>();
    for (const event of source.transactions) {
      const key = fingerprint(event),
        prior = local.get(key);
      local.set(key, { event, count: (prior?.count || 0) + 1 });
    }
    for (const [key, entry] of local) {
      const prior = index.get(key);
      if (prior && prior.count !== entry.count) conflicts.push(key);
      index.set(key, {
        event: entry.event,
        count: Math.max(prior?.count || 0, entry.count),
        sources: [...(prior?.sources || []), source.id],
      });
    }
  }
  return {
    events: [...index].flatMap(([key, v]) =>
      Array.from({ length: v.count }, (_, i) => ({
        key: key + ":" + i,
        ...v.event,
        sourceImports: v.sources,
      })),
    ),
    ambiguousDuplicates: [...new Set(conflicts)],
    certifiedComplete: false as const,
  };
}
export function reconcileStatement(
  preview: ImportPreview,
  today = new Date().toISOString().slice(0, 10),
) {
  const flows: CashFlow[] = [];
  const from = validDate(preview.statement_from ?? null, today),
    to = validDate(preview.statement_date, today);
  const globalIssues: string[] = [];
  const groups = groupTransactions(preview.transactions);
  if (!from || !to || from > to)
    globalIssues.push("A valid statement start and end date are required.");
  const keys = new Set(
    preview.holdings.map((h) => h.folio_key + ":" + h.scheme_code),
  );
  if (preview.transactions.some((t) => !keys.has(t.position_key)))
    globalIssues.push(
      "Transactions refer to a position outside this statement.",
    );
  const positions = preview.holdings.map((h) => {
    const key = h.folio_key + ":" + h.scheme_code,
      issues: string[] = [];
    const txs = [...(groups.get(key) || [])].sort(
      (a, b) =>
        (a.date || "").localeCompare(b.date || "") || a.ordinal - b.ordinal,
    );
    if (!Number.isFinite(h.units) || h.units < 0)
      issues.push("Closing units are missing or invalid.");
    if (to && h.valuation_date !== to)
      issues.push("Closing value does not have the statement end date.");
    let balance = h.opening_units ?? null;
    if (balance === null || !Number.isFinite(balance) || balance < 0) {
      issues.push("Opening units are missing or invalid.");
      balance = null;
    }
    if (balance !== 0)
      issues.push(
        "Zero opening units are required for statement cash-flow XIRR; opening capital is not invented.",
      );
    let purchases = 0,
      redemptions = 0,
      payouts = 0;
    for (const t of txs) {
      const kind = eventKind(t.type),
        date = validDate(t.date, today);
      if (!date || !from || !to || date < from || date > to)
        issues.push(
          "A transaction date is missing or outside the statement period.",
        );
      if (kind === "unsupported") {
        issues.push(
          "Unmapped event: " +
            t.type +
            ". Corporate actions, switches, taxes and reversals require separate reconciliation.",
        );
        continue;
      }
      const amount = t.amount === null ? null : Math.abs(t.amount),
        units = t.units === null ? null : Math.abs(t.units);
      if (amount === null || !Number.isFinite(amount) || amount > 1e15)
        issues.push("A cash amount is missing or invalid.");
      if (
        (kind === "purchase" || kind === "payout" || kind === "reinvestment") &&
        (t.amount ?? 0) < 0
      )
        issues.push(
          "A negative source amount requires reversal reconciliation.",
        );
      if (kind === "purchase" && amount === 0)
        issues.push(
          "A zero-value acquisition needs separate lot and cash-flow treatment.",
        );
      if (kind !== "payout") {
        if (
          units === null ||
          !Number.isFinite(units) ||
          units === 0 ||
          (kind !== "redemption" && (t.units ?? 0) < 0)
        )
          issues.push("Transaction units are missing or invalid.");
        else if (balance !== null)
          balance += (kind === "redemption" ? -1 : 1) * units;
      } else if (t.units !== null && t.units !== 0)
        issues.push("A payout unexpectedly changes units.");
      if (balance !== null && balance < -0.00001)
        issues.push("A redemption exceeds available units.");
      if (
        t.balance != null &&
        (!Number.isFinite(t.balance) ||
          t.balance < 0 ||
          (balance !== null && Math.abs(balance - t.balance) > 0.00001))
      )
        issues.push("Source running units do not reconcile.");
      if (amount !== null && date && kind !== "reinvestment") {
        flows.push({ date, amount: kind === "purchase" ? -amount : amount });
        if (kind === "purchase") purchases += amount;
        else if (kind === "redemption") redemptions += amount;
        else payouts += amount;
      }
    }
    if (balance === null || Math.abs(balance - h.units) > 0.00001)
      issues.push("Closing units do not reconcile with the statement.");
    if (
      h.current_value === null ||
      !Number.isFinite(h.current_value) ||
      h.current_value < 0
    )
      issues.push("A valid closing value is required.");
    else if (to) flows.push({ date: to, amount: h.current_value });
    return {
      key,
      name: h.scheme_name,
      openingUnits: h.opening_units ?? null,
      computedClosingUnits: balance,
      reportedClosingUnits: h.units,
      purchases,
      redemptions,
      payouts,
      eventCount: txs.length,
      issues: [...new Set(issues)],
    };
  });
  if (!positions.length)
    globalIssues.push("No statement positions are available.");
  const eligible =
    positions.length > 0 &&
    !globalIssues.length &&
    positions.every((p) => !p.issues.length);
  const result = eligible
    ? xirr(flows, today)
    : {
        rate: null,
        days: 0,
        reason: "Reconciliation prerequisites are missing.",
        method: "No return calculated",
      };
  return {
    from,
    to,
    positions,
    issues: globalIssues,
    eligible,
    return: result,
    scope:
      "Latest imported statement only; source-dependent, not certified lifetime or live performance.",
    method: "statement-ledger-v1",
  };
}
export type LedgerAssessment = ReturnType<typeof reconcileStatement>;
