export type Position = {
  id: string;
  scheme_name: string;
  scheme_code: string;
  isin: string | null;
  amfi_code: string | null;
  folio_label: string | null;
  category: string | null;
  amc: string | null;
  units: number | null;
  current_value: number | null;
  invested_amount: number | null;
  current_nav: number | null;
  nav_date: string | null;
  valuation_date: string | null;
};
export type Slice = {
  label: string;
  value: number;
  percent: number;
  positions: number;
};
export type Insight = {
  id: string;
  kind: "coverage" | "observation" | "readiness";
  title: string;
  detail: string;
  evidence: string;
  href: string;
  action: string;
};
export function finite(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1e15 ? n : null;
}
export function validDate(value: string | null, today: string): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value &&
    value <= today
    ? value
    : null;
}
