import {
  authorized,
  readJson,
  json,
  failure,
  ApiError,
} from "@/lib/server/http";
import { readPortfolio } from "@/lib/server/portfolio-read";
import { readLedger } from "@/lib/server/ledger-read";
import { analyzePortfolio } from "@/lib/intelligence/generate";
import { guideAnswer } from "@/lib/intelligence/guide-answer";
import { routeGuideQuestion } from "@/lib/providers/guide-router";
const configured = () =>
  process.env.FOLIOKEY_ENABLE_JEV_GUIDE === "true" &&
  Boolean(process.env.FOLIOKEY_JEV_API_KEY && process.env.FOLIOKEY_JEV_MODEL);
export async function GET() {
  try {
    await authorized();
    return json({ configured: configured() });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const { db } = await authorized(request),
      body = await readJson(request);
    if (
      body?.consent !== true ||
      typeof body.question !== "string" ||
      !body.question.trim() ||
      body.question.length > 1000
    )
      throw new ApiError(
        "Consent and a question of 1–1,000 characters are required.",
        422,
      );
    if (!configured())
      throw new ApiError(
        "Optional Jev question matching is not configured. Use the rule-based guide.",
        503,
      );
    const { data: allowed, error } = await db.rpc("consume_guide_budget");
    if (error)
      throw new ApiError(
        "The guide usage guard is awaiting database setup.",
        503,
      );
    if (!allowed)
      throw new ApiError(
        "The five-question rolling 24-hour guide limit has been reached.",
        429,
      );
    const routing = await routeGuideQuestion(body.question, {
      enabled: true,
      apiKey: process.env.FOLIOKEY_JEV_API_KEY,
      model: process.env.FOLIOKEY_JEV_MODEL,
    });
    if (routing.status !== "matched" || !routing.topic)
      return json({ routing, answer: null });
    const [portfolio, ledger] = await Promise.all([
      readPortfolio(),
      readLedger(),
    ]);
    return json({
      routing,
      answer: guideAnswer(
        routing.topic,
        analyzePortfolio(portfolio.holdings),
        ledger.assessment,
      ),
    });
  } catch (e) {
    return failure(e);
  }
}
