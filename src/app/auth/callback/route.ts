import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  // Handle token_hash (magic link / OTP)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("verifyOtp error:", error.message);
  }

  // Handle OAuth code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("exchangeCodeForSession error:", error.message);
  }

  // Fallback — redirect to dashboard (session may be in cookie already)
  return NextResponse.redirect(new URL(next, request.url));
}
