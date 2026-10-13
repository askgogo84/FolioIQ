import { authorized, failure, json } from "@/lib/server/http";
export async function GET() {
  try {
    const { db, user } = await authorized();
    const { data: holdings, error: hErr } = await db
      .from("portfolio_holdings")
      .select("import_id")
      .eq("user_id", user.id)
      .limit(1);
    if (hErr) return json({ error: "Transactions unavailable." }, 503);
    const id = holdings?.[0]?.import_id;
    if (!id)
      return json({
        transactions: [],
        coverage: "No transaction statement imported.",
      });
    const { data, error } = await db
      .from("portfolio_transactions")
      .select(
        "id,scheme_name,transaction_date,transaction_type,units,amount,nav",
      )
      .eq("user_id", user.id)
      .eq("import_id", id)
      .order("transaction_date", { ascending: false })
      .limit(1000);
    if (error) return json({ error: "Transactions unavailable." }, 503);
    return json({
      transactions: data || [],
      coverage:
        "Latest statement only. Up to 1,000 records shown; this is not certified lifetime history.",
    });
  } catch (e) {
    return failure(e);
  }
}
