import { budget, failure, json, ApiError } from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
import { boundedText } from "@/lib/providers/bounded-response";
import { parseAmfi } from "@/lib/portfolio/nav";
export async function POST(request: Request) {
  try {
    const { db, holdings } = await readPortfolio(request);
    if (!holdings.length)
      return json({
        updated: 0,
        message: "Import a portfolio before refreshing NAVs.",
      });
    if (holdings.length > 2000)
      throw new ApiError(
        "This portfolio exceeds the supported NAV batch size. No values were changed.",
        422,
      );
    await budget(db, "refresh");
    const res = await fetch("https://portal.amfiindia.com/spages/NAVAll.txt", {
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
      redirect: "error",
    });
    if (!res.ok)
      throw new ApiError(
        "AMFI NAV service is unavailable. Existing values are unchanged.",
        502,
      );
    let map;
    try {
      map = parseAmfi(await boundedText(res, 8_000_000));
    } catch {
      throw new ApiError(
        "NAV response failed validation. Existing values are unchanged.",
        502,
      );
    }
    if (map.size < 10)
      throw new ApiError("NAV response could not be validated.", 502);
    const updates = [];
    for (const h of holdings || []) {
      const nav = map.get(h.isin || h.amfi_code || h.scheme_code);
      if (!nav || nav.date < (h.nav_date || h.valuation_date || "")) continue;
      updates.push({
        id: h.id,
        nav: nav.nav,
        date: nav.date,
        amfi_code: nav.code,
      });
    }
    if (!updates.length)
      return json({
        message:
          "No newer NAVs matched exact scheme identifiers. Existing values are unchanged.",
        updated: 0,
      });
    const { data: updated, error: saveError } = await db.rpc(
      "refresh_owned_navs",
      { p_updates: updates },
    );
    if (saveError)
      throw new ApiError(
        "NAVs could not be saved. Existing values are unchanged.",
        503,
      );
    return json({
      updated,
      message:
        "Updated " +
        updated +
        " of " +
        (holdings?.length || 0) +
        " positions using last imported units × dated AMFI NAVs. Subsequent transactions are not verified. Unmatched positions retain their earlier values.",
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  return json({ error: "Use the authenticated refresh action." }, 405);
}
