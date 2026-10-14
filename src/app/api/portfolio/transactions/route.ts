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
    const transactions: Record<string, unknown>[] = [];
    for (let start = 0; start <= 20000; start += 1000) {
      const { data, error } = await db
        .from("portfolio_transactions")
        .select(
          "id,scheme_name,transaction_date,transaction_type,units,amount,nav",
        )
        .eq("user_id", user.id)
        .eq("import_id", id)
        .order("transaction_date", { ascending: false })
        .order("id")
        .range(start, start === 20000 ? 20000 : start + 999);
      if (error) return json({ error: "Transactions unavailable." }, 503);
      if (start === 20000 && data?.length)
        return json(
          {
            error:
              "Statement exceeds the supported transaction size. No partial ledger is shown.",
          },
          422,
        );
      transactions.push(...(data || []));
      if (!data || data.length < 1000) break;
    }
    return json({
      transactions,
      coverage:
        "Latest statement only. All records within the supported 20,000-record limit are shown; this is not certified lifetime history.",
    });
  } catch (e) {
    return failure(e);
  }
}
