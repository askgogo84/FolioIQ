import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // The code exchange happens client-side or via middleware
  // Just redirect to profile after auth
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile`);
}
