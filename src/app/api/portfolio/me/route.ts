import { failure, json } from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
import { analyzePortfolio } from "@/lib/intelligence/generate";
export async function GET() {
  try {
    const { holdings, user } = await readPortfolio();
    return json({
      connected: holdings.length > 0,
      holdings,
      analysis: analyzePortfolio(holdings),
      user: { name: user.user_metadata?.full_name || "Investor" },
    });
  } catch (e) {
    return failure(e);
  }
}
