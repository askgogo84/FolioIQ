import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "./redirect";

const publicPages = new Set([
  "/",
  "/auth",
  "/privacy",
  "/terms",
  "/pricing",
  "/calculator",
]);
const authCallbacks = new Set(["/auth/callback", "/auth/session"]);

// Factory injection permits session/refresh tests without an Auth server call.
export async function updateSession(
  request: NextRequest,
  factory: typeof createServerClient = createServerClient,
) {
  let response = NextResponse.next({ request });
  const db = factory(
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
    error,
  } = await db.auth.getUser();
  const signedIn = !error && !!user && !user.is_anonymous;
  const path = request.nextUrl.pathname;
  function finish(result: NextResponse) {
    response.cookies.getAll().forEach((cookie) => result.cookies.set(cookie));
    result.headers.set("Cache-Control", "private, no-store");
    result.headers.set("Pragma", "no-cache");
    result.headers.set("Expires", "0");
    return result;
  }
  if (!signedIn && !publicPages.has(path) && !authCallbacks.has(path)) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("next", safeNext(path + request.nextUrl.search));
    return finish(NextResponse.redirect(url));
  }
  if (signedIn && path === "/auth") {
    return finish(
      NextResponse.redirect(
        new URL(
          safeNext(request.nextUrl.searchParams.get("next")),
          request.url,
        ),
      ),
    );
  }
  return finish(response);
}
