import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
const publicPages = new Set([
  "/",
  "/auth",
  "/privacy",
  "/terms",
  "/pricing",
  "/calculator",
]);
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach((v) => request.cookies.set(v.name, v.value));
          response = NextResponse.next({ request });
          values.forEach((v) =>
            response.cookies.set(v.name, v.value, v.options),
          );
        },
      },
    },
  );
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user && !publicPages.has(path) && !path.startsWith("/auth/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  if (user && path === "/auth") {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
