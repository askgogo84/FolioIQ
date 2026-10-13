import { authorized, failure, json } from "@/lib/server/http";
export async function GET() {
  try {
    const { db, user } = await authorized();
    const { data, error } = await db
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id);
    if (error) return json({ error: "Portfolio unavailable." }, 503);
    return json({ holdings: data || [] });
  } catch (e) {
    return failure(e);
  }
}
