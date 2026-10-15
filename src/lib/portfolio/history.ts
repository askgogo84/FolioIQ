import { validDate } from "@/lib/intelligence/types";
export type NavPoint = { date: string; nav: number };
export type NavSeries = { code: string; name: string; points: NavPoint[] };
/** User-supplied AMFI semicolon exports only. No undocumented endpoints, interpolation or forward-filling. */
export function parseNavHistory(
  text: string,
  today = new Date().toISOString().slice(0, 10),
): NavSeries[] {
  if (text.length > 3_000_000) throw new Error("NAV file exceeds 3 MB.");
  let columns: string[] = [];
  const series = new Map<
    string,
    { code: string; name: string; points: Map<string, number> }
  >();
  let rows = 0;
  for (const raw of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const cells = raw.split(";").map((v) => v.trim());
    if (cells[0]?.toLowerCase() === "scheme code") {
      columns = cells.map((c) => c.toLowerCase());
      continue;
    }
    if (!/^\d{5,8}$/.test(cells[0] || "")) continue;
    const code = cells[0],
      name = cells[columns.indexOf("scheme name")],
      navText = cells[columns.indexOf("net asset value")],
      rawDate = cells[columns.indexOf("date")];
    if (!columns.length || !name || !navText || !rawDate)
      throw new Error(
        "Expected AMFI headers: Scheme Code, Scheme Name, Net Asset Value, Date.",
      );
    const m = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(rawDate),
      months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
    const date = m
      ? m[3] +
        "-" +
        String(months.indexOf(m[2].toLowerCase()) + 1).padStart(2, "0") +
        "-" +
        m[1]
      : rawDate;
    const nav = Number(navText);
    if (
      !validDate(date, today) ||
      !Number.isFinite(nav) ||
      nav < 0.00000001 ||
      nav > 1e12
    )
      throw new Error("Invalid dated NAV in supplied file.");
    const s = series.get(code) || {
      code,
      name,
      points: new Map<string, number>(),
    };
    if (s.name !== name)
      throw new Error(
        "A scheme identifier has conflicting names. Review scheme changes before comparison.",
      );
    if (s.points.has(date) && s.points.get(date) !== nav)
      throw new Error(
        "Conflicting NAV observations for the same scheme and date.",
      );
    s.points.set(date, nav);
    series.set(code, s);
    if (++rows > 50000 || series.size > 2000)
      throw new Error("NAV file exceeds supported review size.");
  }
  if (!series.size) throw new Error("No valid AMFI NAV rows found.");
  return [...series.values()].map((s) => ({
    code: s.code,
    name: s.name,
    points: [...s.points]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, nav]) => ({ date, nav })),
  }));
}
export function compareNavSeries(a: NavSeries, b: NavSeries) {
  for (const series of [a, b]) {
    if (
      !series.points.length ||
      series.points.length > 50000 ||
      new Set(series.points.map((p) => p.date)).size !== series.points.length ||
      series.points.some(
        (p) =>
          !validDate(p.date, new Date().toISOString().slice(0, 10)) ||
          !Number.isFinite(p.nav) ||
          p.nav < 0.00000001 ||
          p.nav > 1e12,
      )
    )
      throw new Error(
        "Comparison requires unique, valid dated NAV observations.",
      );
  }
  if (a.code === b.code)
    throw new Error("Choose two different scheme identifiers.");
  const second = new Map(b.points.map((p) => [p.date, p.nav]));
  const shared = a.points
    .filter((p) => second.has(p.date))
    .sort((x, y) => x.date.localeCompare(y.date));
  if (shared.length < 2)
    throw new Error(
      "At least two exact common observation dates are required.",
    );
  const first = shared[0],
    last = shared.at(-1)!,
    days = (Date.parse(last.date) - Date.parse(first.date)) / 86400000;
  if (days <= 0) throw new Error("The comparison period has no duration.");
  const aStart = first.nav,
    bStart = second.get(first.date)!;
  const points = shared.map((p) => ({
    date: p.date,
    a: (p.nav / aStart) * 100,
    b: (second.get(p.date)! / bStart) * 100,
  }));
  const metrics = (start: number, end: number) => ({
    pointToPointPercent: (end / start - 1) * 100,
    annualizedPercent:
      days >= 365 ? (Math.pow(end / start, 365 / days) - 1) * 100 : null,
  });
  return {
    from: first.date,
    to: last.date,
    days,
    commonDates: points.length,
    points,
    a: { code: a.code, name: a.name, ...metrics(aStart, last.nav) },
    b: {
      code: b.code,
      name: b.name,
      ...metrics(bStart, second.get(last.date)!),
    },
    method:
      "NAV-only, exact common dates, base 100; no distributions, tax, costs or investor cash flows; annualized only for periods >=365 days",
    source:
      "User-supplied file; provenance and redistribution rights are not independently certified",
    recommendationAvailable: false,
  };
}
export type NavComparison = ReturnType<typeof compareNavSeries>;
