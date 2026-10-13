import { json } from "@/lib/server/http";
export function GET() {
  return json(
    {
      error:
        "This legacy endpoint has been retired. Use the current portfolio import or Supabase sign-in flow.",
    },
    410,
  );
}
export const POST = GET;
