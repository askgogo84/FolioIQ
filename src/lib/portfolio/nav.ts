export type Nav = {
  code: string;
  isin1: string;
  isin2: string;
  name: string;
  nav: number;
  date: string;
};
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export function parseAmfi(
  text: string,
  today = new Date().toISOString().slice(0, 10),
): Map<string, Nav> {
  const result = new Map<string, Nav>();
  for (const line of text.split(/\r?\n/)) {
    const [code, isin1, isin2, name, price, rawDate] = line
      .split(";")
      .map((v) => v.trim());
    if (!/^\d{5,8}$/.test(code || "")) continue;
    const nav = Number(price),
      m = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(rawDate || "");
    if (!m || !Number.isFinite(nav) || nav <= 0 || nav > 1e12 || !name)
      continue;
    const month = months.findIndex(
      (v) => v.toLowerCase() === m[2].toLowerCase(),
    );
    if (month < 0) continue;
    const date = m[3] + "-" + String(month + 1).padStart(2, "0") + "-" + m[1];
    if (
      !Number.isFinite(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date ||
      date > today
    )
      continue;
    const item = { code, isin1, isin2, name, nav, date };
    if (
      result.has(code) &&
      JSON.stringify(result.get(code)) !== JSON.stringify(item)
    )
      throw new Error("Conflicting exact AMFI identifier.");
    result.set(code, item);
    for (const isin of [isin1, isin2])
      if (/^INF[A-Z0-9]{9}$/.test(isin)) {
        if (result.has(isin) && result.get(isin)!.code !== code)
          throw new Error("Ambiguous exact AMFI ISIN.");
        result.set(isin, item);
      }
  }
  return result;
}
