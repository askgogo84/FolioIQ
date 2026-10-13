import { authorized, budget, failure, ApiError, json } from "@/lib/server/http";
import { stageImport } from "@/lib/server/imports";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    const { db, user } = await authorized(request);
    const key = process.env.FOLIOKEY_CAS_PARSER_API_KEY;
    if (!key)
      throw new ApiError(
        "CAS import is awaiting provider configuration. Please try again after setup is complete.",
        503,
      );
    const form = await request.formData(),
      file = form.get("file"),
      password = form.get("password");
    if (form.get("consent") !== "true")
      throw new ApiError(
        "Consent is required before sending this document to CASParser.",
      );
    if (
      !(file instanceof File) ||
      !file.name.toLowerCase().endsWith(".pdf") ||
      file.size === 0 ||
      file.size > 3_000_000
    )
      throw new ApiError(
        "Choose a CAS PDF up to 3 MB. Larger documents can use Portfolio Connect.",
        413,
      );
    if (
      new TextDecoder().decode(await file.slice(0, 5).arrayBuffer()) !== "%PDF-"
    )
      throw new ApiError("This file is not a PDF.", 422);
    if (typeof password === "string" && password.length > 128)
      throw new ApiError("Invalid PDF password.");
    await budget(db, "parse");
    const body = new FormData();
    body.append("file", file, "statement.pdf");
    body.append("password", typeof password === "string" ? password : "");
    const res = await fetch("https://api.casparser.in/v4/smart/parse", {
      method: "POST",
      headers: { "x-api-key": key },
      body,
      signal: AbortSignal.timeout(50000),
      cache: "no-store",
    });
    if (!res.ok)
      throw new ApiError(
        res.status === 429
          ? "Statement provider quota is unavailable. Please try later."
          : "Statement provider could not process this request. Check your PDF/password and try again.",
        502,
      );
    const text = await res.text();
    if (text.length > 3_500_000)
      throw new ApiError("Parsed statement is too large.", 413);
    return json(
      await stageImport(db, user.id, JSON.parse(text), "casparser-server"),
    );
  } catch (e) {
    return failure(e);
  }
}
