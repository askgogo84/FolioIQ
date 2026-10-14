import { finite, type Position } from "./types";
export function portfolioSummary(rows: Position[]) {
  const valued = rows.filter((r) => finite(r.current_value) !== null),
    costed = rows.filter((r) => finite(r.invested_amount) !== null);
  const knownCurrent = valued.reduce((s, r) => s + r.current_value!, 0);
  const totalCurrent =
    rows.length && valued.length === rows.length ? knownCurrent : null;
  const totalInvested =
    rows.length && costed.length === rows.length
      ? costed.reduce((s, r) => s + r.invested_amount!, 0)
      : null;
  const totalGain =
    totalCurrent !== null && totalInvested !== null
      ? totalCurrent - totalInvested
      : null;
  return {
    totalCurrent,
    knownCurrent,
    totalInvested,
    totalGain,
    positions: rows.length,
    schemes: new Set(
      rows.map((r) => r.isin || r.amfi_code || r.scheme_code).filter(Boolean),
    ).size,
    valued: valued.length,
    costed: costed.length,
  };
}
