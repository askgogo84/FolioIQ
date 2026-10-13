import {
  authorized,
  budget,
  failure,
  ApiError,
  json,
  readJson,
} from "@/lib/server/http";
export async function GET() {
  return json({ configured: !!process.env.FOLIOKEY_CAS_PARSER_API_KEY });
}
export async function POST(request: Request) {
  try {
    const { db } = await authorized(request);
    const body = await readJson(request);
    if (body.consent !== true) throw new ApiError("Consent is required.");
    const key = process.env.FOLIOKEY_CAS_PARSER_API_KEY;
    if (!key)
      throw new ApiError(
        "Portfolio Connect is awaiting provider configuration.",
        503,
      );
    await budget(db, "token");
    const res = await fetch("https://api.casparser.in/v1/token", {
      method: "POST",
      headers: { "x-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ expiry_minutes: 5 }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok)
      throw new ApiError(
        "Portfolio provider could not start a session. Please try later.",
        502,
      );
    const data = await res.json();
    if (
      typeof data.access_token !== "string" ||
      !data.access_token.startsWith("at_")
    )
      throw new ApiError("Invalid provider session.", 502);
    return json({ access_token: data.access_token });
  } catch (e) {
    return failure(e);
  }
}
