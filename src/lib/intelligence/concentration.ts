import type { Slice } from "./types";
export function concentration(slices: Slice[]) {
  return {
    largest: slices.find((s) => s.label.toLowerCase() !== "unknown") || null,
    unknownPercent: slices
      .filter((s) => s.label.toLowerCase() === "unknown")
      .reduce((s, r) => s + r.percent, 0),
    method: "Share of known snapshot value; descriptive, not a risk rating.",
  };
}
