import { failure, json } from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
import { analyzePortfolio } from "@/lib/intelligence/generate";
export async function GET() {
  try {
    const { holdings } = await readPortfolio();
    return json({
      analysis: analyzePortfolio(holdings),
      recommendationsAvailable: false,
    });
  } catch (e) {
    return failure(e);
  }
}
export const POST = GET;
