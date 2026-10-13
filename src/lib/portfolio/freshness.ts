type DatedPosition = {
  valuation_date?: string | null;
  nav_date?: string | null;
};

// A freshness warning, not a guarantee of provider publication or market performance.
export function snapshotFreshness(
  rows: DatedPosition[],
  today = new Date().toISOString().slice(0, 10),
) {
  const dates = rows.map((r) => r.nav_date || r.valuation_date || null);
  const valid = dates
    .filter((date): date is string => {
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today)
        return false;
      const parsed = new Date(date);
      return (
        Number.isFinite(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === date
      );
    })
    .sort();
  const oldestDate = valid[0] || null;
  const ageDays = oldestDate
    ? Math.floor((Date.parse(today) - Date.parse(oldestDate)) / 86400000)
    : null;
  const missingDates = rows.length - valid.length;
  return {
    valuationDate: rows.length > 0 && missingDates === 0 ? oldestDate : null,
    mixedDates: new Set(valid).size > 1,
    missingDates,
    oldestDate,
    ageDays,
    stale: ageDays !== null && ageDays > 7,
  };
}
