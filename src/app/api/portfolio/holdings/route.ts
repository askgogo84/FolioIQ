import { failure, json } from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
export async function GET() {
  try {
    const { holdings } = await readPortfolio();
    return json({ holdings });
  } catch (e) {
    return failure(e);
  }
}
