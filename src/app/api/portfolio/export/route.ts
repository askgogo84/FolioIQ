import { readPortfolio } from "@/lib/server/portfolio-read";
import { readLedger } from "@/lib/server/ledger-read";
import { failure } from "@/lib/server/http";
import { csv } from "@/lib/portfolio/export";
export async function GET(request: Request) {
  try {
    const format = new URL(request.url).searchParams.get("format") || "csv",
      { holdings } = await readPortfolio();
    if (format === "json") {
      const ledger = await readLedger();
      return new Response(
        JSON.stringify(
          {
            scope:
              "Reported holdings and latest statement assessment; not a tax report or certified lifetime ledger",
            exportedAt: new Date().toISOString(),
            holdings,
            ledger,
          },
          null,
          2,
        ),
        {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition":
              'attachment; filename="foliokey-evidence.json"',
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }
    return new Response(
      csv([
        [
          "Scheme",
          "Scheme identifier",
          "Masked folio",
          "Category",
          "AMC",
          "Units",
          "Reported cost",
          "Value",
          "NAV",
          "NAV date",
          "Valuation date",
        ],
        ...holdings.map((h) => [
          h.scheme_name,
          h.scheme_code,
          h.folio_label,
          h.category,
          h.amc,
          h.units,
          h.invested_amount,
          h.current_value,
          h.current_nav,
          h.nav_date,
          h.valuation_date,
        ]),
      ]),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="foliokey-holdings.csv"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    return failure(e);
  }
}
