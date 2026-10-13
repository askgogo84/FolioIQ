import { authorized, failure, json } from "@/lib/server/http";
import { summarize } from "@/lib/portfolio/import";
export async function GET() {
  try {
    const { db, user } = await authorized();
    const { data, error } = await db
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id)
      .order("current_value", { ascending: false, nullsFirst: false });
    if (error)
      return json(
        { error: "Portfolio could not be loaded. Please retry." },
        503,
      );
    const holdings = (data || []).map((h) => ({
      ...h,
      units: Number(h.units),
      current_value: h.current_value === null ? null : Number(h.current_value),
      invested_amount:
        h.invested_amount === null ? null : Number(h.invested_amount),
      current_nav: h.current_nav === null ? null : Number(h.current_nav),
    }));
    const summary = summarize(holdings);
    const dates = holdings
      .map((h) => h.valuation_date || h.nav_date)
      .filter(Boolean)
      .sort();
    return json({
      connected: holdings.length > 0,
      holdings,
      summary: {
        ...summary,
        lastUpdated:
          holdings
            .map((h) => h.updated_at)
            .filter(Boolean)
            .sort()
            .at(-1) || null,
      },
      coverage: {
        valuationDate: dates.length === holdings.length ? dates[0] : null,
        mixedDates: new Set(dates).size > 1,
        history: "statement_only",
        performanceAvailable: false,
      },
      user: {
        name: user.user_metadata?.full_name || "Investor",
        email: user.email,
      },
    });
  } catch (e) {
    return failure(e);
  }
}
