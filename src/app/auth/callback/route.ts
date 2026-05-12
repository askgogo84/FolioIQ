import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = (url.searchParams.get("type") as any) || "magiclink";
  const next = url.searchParams.get("next") || "/dashboard";

  const supabase = await createClient();

  // Handle token_hash (from our custom OTP flow)
  if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      console.log("token_hash verified, redirecting to:", next);
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("token_hash verify error:", error.message);
    // Even if error, try to redirect - session may have been set
    return NextResponse.redirect(new URL(next, request.url));
  }

  // Handle OAuth/PKCE code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    console.error("exchangeCode error:", error.message);
  }

  // No valid token - redirect to auth
  return NextResponse.redirect(new URL("/auth", request.url));
}
