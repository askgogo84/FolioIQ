import { validDate, finite } from "@/lib/intelligence/types";
export const planKinds = ["goals", "risk", "sips", "targets"] as const;
export type PlanKind = (typeof planKinds)[number];
export type Goal = {
  id: string;
  name: string;
  target: number;
  allocated: number;
  targetDate: string;
  monthly: number;
};
export type Sip = {
  id: string;
  name: string;
  amount: number;
  day: number;
  startDate: string;
  endDate: string | null;
  status: "planned" | "paused";
};
export type Risk = {
  horizonYears: number;
  liquidityMonths: number;
  lossTolerance: "low" | "medium" | "high";
  experience: "new" | "experienced";
  debtComfort: boolean;
};
export type Target = { category: string; percent: number };
export type PlanData = {
  goals: { items: Goal[] };
  risk: { preferences: Risk | null };
  sips: { items: Sip[] };
  targets: { items: Target[] };
};
export function emptyPlan<K extends PlanKind>(kind: K): PlanData[K] {
  return (
    kind === "risk" ? { preferences: null } : { items: [] }
  ) as PlanData[K];
}
const object = (v: unknown): Record<string, unknown> => {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error("Expected an object.");
  return v as Record<string, unknown>;
};
const text = (v: unknown, max = 100) => {
  if (
    typeof v !== "string" ||
    !v.trim() ||
    v.trim().length > max ||
    /[\u0000-\u001f]/.test(v)
  )
    throw new Error("Enter a valid label.");
  return v.trim();
};
const number = (v: unknown, min: number, max: number) => {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max)
    throw new Error("A number is outside its supported range.");
  return v;
};
const date = (v: unknown) => {
  if (
    typeof v !== "string" ||
    !validDate(v, "9999-12-31") ||
    v < "1900-01-01" ||
    v > "2200-12-31"
  )
    throw new Error("Enter a supported calendar date.");
  return v;
};
const id = (v: unknown) => {
  const s = text(v, 60);
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) throw new Error("Invalid item identifier.");
  return s;
};
export function validatePlan<K extends PlanKind>(
  kind: K,
  input: unknown,
): PlanData[K] {
  const data = object(input);
  if (kind === "risk") {
    if (data.preferences === null) return { preferences: null } as PlanData[K];
    const p = object(data.preferences);
    if (
      !["low", "medium", "high"].includes(String(p.lossTolerance)) ||
      !["new", "experienced"].includes(String(p.experience)) ||
      typeof p.debtComfort !== "boolean"
    )
      throw new Error("Choose your investment preferences.");
    return {
      preferences: {
        horizonYears: number(p.horizonYears, 1, 50),
        liquidityMonths: number(p.liquidityMonths, 0, 120),
        lossTolerance: p.lossTolerance,
        experience: p.experience,
        debtComfort: p.debtComfort,
      },
    } as PlanData[K];
  }
  if (!Array.isArray(data.items) || data.items.length > 50)
    throw new Error("A maximum of 50 planning items is supported.");
  const items = data.items.map((raw) => {
    const r = object(raw);
    if (kind === "goals")
      return {
        id: id(r.id),
        name: text(r.name),
        target: number(r.target, 0.01, 1e12),
        allocated: number(r.allocated, 0, 1e12),
        targetDate: date(r.targetDate),
        monthly: number(r.monthly, 0, 1e9),
      };
    if (kind === "sips") {
      if (
        !["planned", "paused"].includes(String(r.status)) ||
        !Number.isInteger(r.day)
      )
        throw new Error("Choose a valid SIP status and day.");
      const startDate = date(r.startDate),
        endDate = r.endDate === null ? null : date(r.endDate);
      if (endDate && endDate < startDate)
        throw new Error("SIP end date precedes its start.");
      return {
        id: id(r.id),
        name: text(r.name),
        amount: number(r.amount, 0.01, 1e9),
        day: number(r.day, 1, 28),
        startDate,
        endDate,
        status: r.status,
      };
    }
    return {
      category: text(r.category, 80),
      percent: number(r.percent, 0, 100),
    };
  });
  const keys = items.map((r) => ("id" in r ? r.id : r.category));
  if (new Set(keys).size !== keys.length)
    throw new Error("Duplicate planning items are not allowed.");
  if (
    kind === "targets" &&
    items.length &&
    Math.abs(
      items.reduce((s, r) => s + ("percent" in r ? r.percent : 0), 0) - 100,
    ) > 0.0001
  )
    throw new Error("Target allocations must total 100%.");
  return { items } as PlanData[K];
}
/** Contribution-only scenario: zero return/inflation assumption; no portfolio value is auto-assigned. */
export function goalProgress(g: Goal, today: string) {
  const months = Math.max(
    0,
    (Number(g.targetDate.slice(0, 4)) - Number(today.slice(0, 4))) * 12 +
      Number(g.targetDate.slice(5, 7)) -
      Number(today.slice(5, 7)) -
      (g.targetDate.slice(8) < today.slice(8) ? 1 : 0),
  );
  const gap = Math.max(0, g.target - g.allocated);
  return {
    gap,
    months,
    requiredMonthly: months > 0 ? gap / months : null,
    contributionOnlyValue: g.allocated + months * g.monthly,
    progress: Math.min(100, (g.allocated / g.target) * 100),
  };
}
export function nextSipDate(s: Sip, today: string): string | null {
  if (s.status !== "planned" || !validDate(today, "9999-12-31")) return null;
  let candidate = today.slice(0, 7) + "-" + String(s.day).padStart(2, "0");
  if (candidate < today) {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    candidate =
      d.toISOString().slice(0, 7) + "-" + String(s.day).padStart(2, "0");
  }
  if (candidate < s.startDate) {
    candidate = s.startDate.slice(0, 7) + "-" + String(s.day).padStart(2, "0");
    if (candidate < s.startDate) {
      const d = new Date(candidate + "T00:00:00Z");
      d.setUTCMonth(d.getUTCMonth() + 1);
      candidate =
        d.toISOString().slice(0, 7) + "-" + String(s.day).padStart(2, "0");
    }
  }
  return s.endDate && candidate > s.endDate ? null : candidate;
}
export function allocationScenario(
  rows: { category: string | null; current_value: number | null }[],
  targets: Target[],
) {
  if (!rows.length || rows.some((r) => finite(r.current_value) === null))
    return {
      available: false,
      reason: "A complete valued snapshot is required.",
      rows: [],
    };
  if (
    !targets.length ||
    targets.some(
      (t) => !Number.isFinite(t.percent) || t.percent < 0 || t.percent > 100,
    ) ||
    new Set(targets.map((t) => t.category)).size !== targets.length ||
    Math.abs(targets.reduce((s, t) => s + t.percent, 0) - 100) > 0.0001
  )
    return {
      available: false,
      reason: "Set explicit targets totalling 100%.",
      rows: [],
    };
  const total = rows.reduce((s, r) => s + r.current_value!, 0),
    groups = new Map<string, number>();
  if (total <= 0)
    return {
      available: false,
      reason: "Positive portfolio value is required.",
      rows: [],
    };
  for (const r of rows) {
    const c = r.category?.trim() || "Unknown";
    groups.set(c, (groups.get(c) || 0) + r.current_value!);
  }
  const categories = [
    ...new Set([...groups.keys(), ...targets.map((t) => t.category)]),
  ];
  return {
    available: true,
    reason:
      "Arithmetic illustration of your targets; no trades, tax, exit loads or suitability assumed.",
    rows: categories.map((category) => {
      const current = groups.get(category) || 0,
        targetPercent =
          targets.find((t) => t.category === category)?.percent || 0;
      return {
        category,
        current,
        currentPercent: (current / total) * 100,
        targetPercent,
        targetValue: (total * targetPercent) / 100,
        difference: (total * targetPercent) / 100 - current,
      };
    }),
  };
}
