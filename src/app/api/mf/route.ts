import { authorized, budget, failure, json, ApiError } from "@/lib/server/http";
export async function GET(request: Request) {
  try {
    const { db } = await authorized();
    const p = new URL(request.url).searchParams,
      action = p.get("action"),
      code = p.get("schemeCode"),
      q = p.get("q");
    let suffix: string;
    if (action === "search" && q && q.length >= 2 && q.length <= 100)
      suffix = "search?q=" + encodeURIComponent(q);
    else if (
      (action === "latest" || action === "history") &&
      code &&
      /^\d{5,8}$/.test(code)
    )
      suffix = code + (action === "latest" ? "/latest" : "");
    else throw new ApiError("Invalid fund query.");
    // Share the existing durable external-data quota; no in-memory serverless counters.
    await budget(db, "refresh");
    const res = await fetch("https://api.mfapi.in/mf/" + suffix, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new ApiError("Fund data provider is unavailable.", 502);
    const data = await res.json();
    if (
      action === "search"
        ? !Array.isArray(data)
        : !data.meta || !Array.isArray(data.data)
    )
      throw new ApiError("Fund response could not be validated.", 502);
    return json({ success: true, source: "MFAPI", data });
  } catch (e) {
    return failure(e);
  }
}
