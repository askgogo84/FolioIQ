import { failure, json } from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
import { analyzePortfolio } from "@/lib/intelligence/generate";
import { readLedger } from "@/lib/server/ledger-read";
export async function GET() {
  try {
    const [{ holdings }, ledger] = await Promise.all([
      readPortfolio(),
      readLedger(),
    ]);
    return json({
      analysis: analyzePortfolio(holdings),
      recommendationsAvailable: false,
      statementLedger: ledger.assessment,
      snapshotScope:
        "Holdings-only checks; statement cash-flow XIRR is evaluated separately in statementLedger.",
    });
  } catch (e) {
    return failure(e);
  }
}
export const POST = GET;
