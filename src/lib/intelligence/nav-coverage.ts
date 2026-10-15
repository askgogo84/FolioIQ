import { finite, validDate, type Position } from "./types";
export function navCoverage(rows: Position[], today: string) {
  const dated = rows.filter(
    (r) =>
      finite(r.current_nav) !== null &&
      r.current_nav! > 0 &&
      validDate(r.nav_date, today),
  );
  return {
    priced: dated.length,
    total: rows.length,
    older: dated.filter(
      (r) => (Date.parse(today) - Date.parse(r.nav_date!)) / 86400000 > 7,
    ).length,
    undatedOrMissing: rows.length - dated.length,
    freshnessPolicy:
      "Review NAVs older than 7 calendar days; a display freshness rule, not a market-calendar or investment judgment.",
  };
}
