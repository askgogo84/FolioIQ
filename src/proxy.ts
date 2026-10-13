import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/auth/session";
export async function proxy(request: NextRequest) {
  return updateSession(request);
}
export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico$).*)"],
};
