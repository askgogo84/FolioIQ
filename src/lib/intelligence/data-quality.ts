import { finite, validDate, type Position } from "./types";
export function dataQuality(rows: Position[], today: string) {
  const dates = rows
    .map((r) => validDate(r.valuation_date || r.nav_date, today))
    .filter((d): d is string => d !== null)
    .sort();
  return {
    positions: rows.length,
    valued: rows.filter((r) => finite(r.current_value) !== null).length,
    costed: rows.filter((r) => finite(r.invested_amount) !== null).length,
    dated: dates.length,
    identified: rows.filter(
      (r) =>
        /^INF[A-Z0-9]{9}$/.test(r.isin || "") ||
        /^\d{5,8}$/.test(r.amfi_code || ""),
    ).length,
    oldestDate: dates[0] || null,
    newestDate: dates.at(-1) || null,
    mixedDates: new Set(dates).size > 1,
    status: !rows.length
      ? "empty"
      : dates.length === rows.length &&
          rows.every(
            (r) =>
              finite(r.current_value) !== null &&
              finite(r.invested_amount) !== null,
          )
        ? "snapshot fields present"
        : "partial snapshot",
  };
}
