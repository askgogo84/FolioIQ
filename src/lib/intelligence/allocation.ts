import { finite, type Position, type Slice } from "./types";
export function allocation(rows: Position[], field: "category" | "amc") {
  const buckets = new Map<string, { value: number; positions: number }>();
  let total = 0,
    valued = 0;
  for (const row of rows) {
    const value = finite(row.current_value);
    if (value === null) continue;
    valued++;
    total += value;
    const label = row[field]?.trim() || "Unknown";
    const prior = buckets.get(label) || { value: 0, positions: 0 };
    buckets.set(label, {
      value: prior.value + value,
      positions: prior.positions + 1,
    });
  }
  const slices: Slice[] =
    total > 0
      ? Array.from(buckets, ([label, b]) => ({
          ...b,
          label,
          percent: (b.value / total) * 100,
        })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
      : [];
  return {
    slices,
    total,
    valued,
    excluded: rows.length - valued,
    partial: valued !== rows.length,
    available: total > 0,
  };
}
