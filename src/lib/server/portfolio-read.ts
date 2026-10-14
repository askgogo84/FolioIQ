import "server-only";
import { authorized, ApiError } from "./http";
import { finite, type Position } from "@/lib/intelligence/types";
export async function readPortfolio(request?: Request) {
  const { db, user } = await authorized(request);
  const holdings: Position[] = [];
  for (let start = 0; start < 10000; start += 1000) {
    const { data, error } = await db
      .from("portfolio_holdings")
      .select(
        "id,scheme_name,scheme_code,isin,amfi_code,folio_label,category,amc,units,current_value,invested_amount,current_nav,nav_date,valuation_date",
      )
      .eq("user_id", user.id)
      .order("id")
      .range(start, start + 999);
    if (error)
      throw new ApiError("Portfolio could not be loaded. Please retry.", 503);
    for (const h of data || [])
      holdings.push({
        ...h,
        units: finite(h.units),
        current_value: finite(h.current_value),
        invested_amount: finite(h.invested_amount),
        current_nav: finite(h.current_nav),
      });
    if (!data || data.length < 1000) return { holdings, user, db };
  }
  throw new ApiError(
    "This portfolio exceeds the supported review size. No partial total is shown.",
    422,
  );
}
