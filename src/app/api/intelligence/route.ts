import { authorized, failure, json } from "@/lib/server/http";
import { assessPortfolio } from "@/lib/portfolio/insights";
export async function GET() {
  try {
    const { db, user } = await authorized();
    const { data, error } = await db
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id);
    if (error) return json({ error: "Insights are unavailable." }, 503);
    const rows = (data || []).map((r) => ({
      ...r,
      current_value: r.current_value === null ? null : Number(r.current_value),
      invested_amount:
        r.invested_amount === null ? null : Number(r.invested_amount),
    }));
    return json({
      findings: assessPortfolio(rows),
      method: "Deterministic portfolio checks; no AI fund ranking",
      recommendationsAvailable: false,
    });
  } catch (e) {
    return failure(e);
  }
}
export const POST = GET;
