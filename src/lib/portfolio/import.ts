import { createHash } from "node:crypto";

export type Holding = {
  scheme_code: string;
  scheme_name: string;
  folio_key: string;
  folio_label: string;
  isin: string | null;
  amfi_code: string | null;
  category: string;
  amc: string;
  units: number;
  current_nav: number | null;
  current_value: number | null;
  invested_amount: number | null;
  avg_nav: number | null;
  purchase_date: null;
  nav_date: string | null;
  valuation_date: string | null;
  sip_amount: null;
  opening_units?: number | null;
};
export type Transaction = {
  position_key: string;
  scheme_name: string;
  date: string | null;
  type: string;
  units: number | null;
  amount: number | null;
  nav: number | null;
  ordinal: number;
  balance?: number | null;
};
export type ImportPreview = {
  holdings: Holding[];
  transactions: Transaction[];
  statement_date: string | null;
  warnings: string[];
  checksum: string;
  source: string;
  statement_from?: string | null;
};
type Obj = Record<string, unknown>;
function obj(v: unknown): Obj {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {};
}
function str(v: unknown) {
  return typeof v === "string" || typeof v === "number" ? String(v).trim() : "";
}
export function numeric(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "number" && typeof v !== "string")
    throw new Error("Invalid numeric field in statement.");
  const text = typeof v === "string" ? v.trim().replace(/,/g, "") : v;
  if (text === "") return null;
  const n = Number(text);
  if (!Number.isFinite(n) || Math.abs(n) > 1e15)
    throw new Error("Invalid or out-of-range number in statement.");
  return n;
}
export function isoDate(v: unknown): string | null {
  const s = str(v);
  if (!s) return null;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    !Number.isFinite(Date.parse(s)) ||
    new Date(s).toISOString().slice(0, 10) !== s
  )
    throw new Error("A statement date is invalid. Use YYYY-MM-DD.");
  if (s > new Date().toISOString().slice(0, 10))
    throw new Error("A statement date is in the future.");
  return s;
}
function hash(s: string) {
  return createHash("sha256").update(s).digest("hex");
}
function category(v: unknown): string {
  const s = str(v).toLowerCase();
  if (/hybrid|balanced/.test(s)) return "Hybrid";
  if (/gold|silver/.test(s)) return "Gold";
  if (/debt|liquid|bond|gilt|overnight|duration/.test(s)) return "Debt";
  if (/equity|elss/.test(s)) return "Equity";
  return "Unknown";
}

/** Normalize only documented fields. No fuzzy scheme resolution, invented lots or raw investor details. */
export function normalizeCas(
  input: unknown,
  source = "casparser",
): ImportPreview {
  const outer = obj(input);
  const root = outer.raw_response ? obj(outer.raw_response) : outer;
  if (root.status === "failed" || root.status === "error")
    throw new Error(
      "The provider could not parse this statement. Check the file and password.",
    );
  const period = obj(obj(root.meta).statement_period);
  const statement_date = isoDate(period.to);
  const statement_from = isoDate(period.from);
  if (statement_from && statement_date && statement_from > statement_date)
    throw new Error("Statement period is reversed.");
  const holdings: Holding[] = [],
    transactions: Transaction[] = [],
    warnings = new Set<string>();
  if (!statement_date)
    warnings.add(
      "Statement valuation date is missing. Freshness cannot be verified.",
    );
  if (Array.isArray(root.demat_accounts) && root.demat_accounts.length)
    warnings.add(
      "This import supports non-demat mutual fund folios only. Stocks, demat funds and other assets are not included; confirm the scope before saving.",
    );
  if (!Array.isArray(root.mutual_funds))
    throw new Error(
      "No supported mutual fund folios were returned. Use a CAMS/KFintech CAS with folio details.",
    );
  if (root.mutual_funds.length > 1000)
    throw new Error("Too many folios for one import.");
  const seen = new Set<string>();
  for (const rawFolio of root.mutual_funds) {
    const folio = obj(rawFolio),
      folioNumber = str(folio.folio_number ?? folio.folio);
    if (!folioNumber)
      throw new Error(
        "A folio number is missing. This import cannot safely distinguish accounts.",
      );
    if (!Array.isArray(folio.schemes))
      throw new Error("A folio has no valid scheme list.");
    for (const rawScheme of folio.schemes) {
      const s = obj(rawScheme),
        extra = obj(s.additional_info);
      const name = str(s.name ?? s.scheme_name),
        isin = str(s.isin),
        amfi = str(extra.amfi ?? s.amfi_code);
      if (!name || name.length > 300)
        throw new Error("A scheme name is missing or invalid.");
      if (isin && !/^INF[A-Z0-9]{9}$/.test(isin))
        throw new Error("A mutual fund ISIN is invalid.");
      if (amfi && !/^\d{5,8}$/.test(amfi))
        throw new Error("An AMFI scheme identifier is invalid.");
      if (!isin && !amfi)
        throw new Error(
          "A scheme has no ISIN or AMFI identifier. Resolve it before importing.",
        );
      const amc = str(folio.amc ?? s.amc),
        folioKey = hash(amc.toLowerCase() + "|" + folioNumber);
      const code = isin || amfi,
        positionKey = folioKey + ":" + code;
      if (seen.has(positionKey))
        throw new Error(
          "Duplicate folio/scheme rows found. Review the source statement.",
        );
      seen.add(positionKey);
      const units = numeric(s.units ?? s.balance_units);
      const opening = numeric(extra.open_units),
        closing = numeric(extra.close_units);
      if (
        (opening !== null && opening < 0) ||
        (closing !== null &&
          (units === null || Math.abs(closing - units) > 0.00001))
      )
        throw new Error(
          "Source opening or closing units are invalid or inconsistent.",
        );
      const nav = numeric(s.nav ?? s.last_nav),
        cost = numeric(
          s.cost ?? s.cost_value ?? s.purchase_cost ?? s.invested_value,
        );
      const value =
        numeric(s.value) ??
        (units !== null && nav !== null ? units * nav : null);
      if (
        units === null ||
        units < 0 ||
        (nav !== null && nav <= 0) ||
        (cost !== null && cost < 0) ||
        (value !== null && value < 0)
      )
        throw new Error(
          "Invalid units, NAV, cost or valuation. No holdings have been changed.",
        );
      if (
        units !== 0 &&
        nav !== null &&
        value !== null &&
        Math.abs(units * nav - value) > Math.max(2, value * 0.001)
      )
        throw new Error(
          "Units × NAV does not reconcile with statement value. Review this statement before saving.",
        );
      if (cost === null)
        warnings.add(
          "Some cost values are missing; total gain will be unavailable.",
        );
      if (value === null)
        warnings.add(
          "Some valuations are missing; total portfolio value will be unavailable.",
        );
      const cat = category(s.type ?? s.category ?? s.scheme_type);
      if (cat === "Unknown")
        warnings.add(
          "Some fund classifications are unknown. Allocation analysis will show them separately.",
        );
      holdings.push({
        scheme_code: code,
        scheme_name: name,
        folio_key: folioKey,
        folio_label: "••••" + folioNumber.slice(-4),
        isin: isin || null,
        amfi_code: amfi || null,
        category: cat,
        amc,
        units,
        current_nav: nav,
        current_value: value,
        invested_amount: cost,
        avg_nav: cost !== null && units > 0 ? cost / units : null,
        purchase_date: null,
        nav_date: null,
        valuation_date: statement_date,
        sip_amount: null,
        opening_units: opening,
      });
      if (s.transactions !== undefined && !Array.isArray(s.transactions))
        throw new Error("Invalid transaction list.");
      for (const [ordinal, rawTx] of (Array.isArray(s.transactions)
        ? s.transactions
        : []
      ).entries()) {
        const t = obj(rawTx);
        transactions.push({
          position_key: positionKey,
          scheme_name: name,
          date: isoDate(t.date),
          type: str(t.type) || "UNKNOWN",
          units: numeric(t.units),
          amount: numeric(t.amount),
          nav: numeric(t.nav),
          ordinal,
          balance: numeric(t.balance),
        });
      }
    }
  }
  if (!holdings.length || holdings.length > 2000 || transactions.length > 20000)
    throw new Error("Import is empty or exceeds the supported portfolio size.");
  warnings.add(
    "Transaction coverage is limited to this statement. Portfolio XIRR, historical returns and tax estimates remain unavailable until complete history is reconciled.",
  );
  const core = { holdings, transactions, statement_date, statement_from };
  return {
    ...core,
    warnings: [...warnings],
    source,
    checksum: hash(JSON.stringify(core)),
  };
}

export function summarize(
  rows: Array<Pick<Holding, "current_value" | "invested_amount">>,
) {
  const valued = rows.filter(
    (r) => r.current_value !== null && Number.isFinite(Number(r.current_value)),
  );
  const costed = rows.filter(
    (r) =>
      r.invested_amount !== null && Number.isFinite(Number(r.invested_amount)),
  );
  const current = valued.reduce((a, r) => a + Number(r.current_value), 0),
    cost = costed.reduce((a, r) => a + Number(r.invested_amount), 0);
  const complete =
    rows.length > 0 &&
    valued.length === rows.length &&
    costed.length === rows.length;
  return {
    totalCurrent: valued.length === rows.length ? current : null,
    knownCurrent: current,
    totalInvested: costed.length === rows.length ? cost : null,
    totalGain: complete ? current - cost : null,
    gainPct: complete && cost > 0 ? ((current - cost) / cost) * 100 : null,
    fundCount: rows.length,
    valuationCoverage: valued.length,
    costCoverage: costed.length,
  };
}
