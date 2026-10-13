import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
export async function authorized(request?: Request) {
  if (request && !["GET", "HEAD"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new ApiError("Request origin is not allowed.", 403);
    if (Number(request.headers.get("content-length") || 0) > 4_000_000)
      throw new ApiError("Upload exceeds the 4 MB request limit.", 413);
  }
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new ApiError("Please sign in again.", 401);
  return { db, user };
}
export async function budget(
  db: Awaited<ReturnType<typeof createClient>>,
  action: string,
) {
  const { data, error } = await db.rpc("consume_portfolio_budget", {
    p_action: action,
  });
  if (error)
    throw new ApiError(
      "Import service is not ready. Please try again later.",
      503,
    );
  if (!data)
    throw new ApiError(
      "Daily import limit reached. Please try again tomorrow.",
      429,
    );
}
export function failure(error: unknown) {
  if (error instanceof ApiError)
    return json({ error: error.message }, error.status);
  // Do not leak provider responses, statements, credentials or database details.
  return json(
    {
      error:
        "This operation could not be completed. Your previous portfolio is unchanged.",
    },
    500,
  );
}
export async function readJson(request: Request) {
  const text = await request.text();
  if (Buffer.byteLength(text) > 3_500_000)
    throw new ApiError("Import is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError("Invalid JSON request.", 400);
  }
}
