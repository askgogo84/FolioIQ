import { authorized, budget, failure, json, ApiError } from "@/lib/server/http";
import { parseAmfi } from "@/lib/portfolio/nav";
export async function POST(request: Request) {
  try {
    const { db, user } = await authorized(request);
    await budget(db, "refresh");
    const { data: holdings, error } = await db
      .from("portfolio_holdings")
      .select("id,isin,amfi_code,scheme_code,units,valuation_date,nav_date")
      .eq("user_id", user.id);
    if (error) throw new ApiError("Holdings could not be loaded.", 503);
    const res = await fetch("https://portal.amfiindia.com/spages/NAVAll.txt", {
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok)
      throw new ApiError(
        "AMFI NAV service is unavailable. Existing values are unchanged.",
        502,
      );
    const map = parseAmfi(await res.text());
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
        " positions using dated AMFI NAVs. Unmatched positions retain their earlier values.",
    });
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  return json({ error: "Use the authenticated refresh action." }, 405);
}
