import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = await createClient();
  const code = url.searchParams.get("code");
  const token = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const result = code
    ? await db.auth.exchangeCodeForSession(code)
    : token && type === "email"
      ? await db.auth.verifyOtp({ token_hash: token, type: "email" })
      : { error: true };
  return NextResponse.redirect(
    new URL(
      result.error
        ? "/auth?error=callback_failed"
        : safeNext(url.searchParams.get("next")),
      url.origin,
    ),
  );
}
