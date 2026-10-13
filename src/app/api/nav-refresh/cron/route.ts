import { json } from "@/lib/server/http";
export function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return json({ error: "Unauthorized" }, 401);
  return json(
    {
      error:
        "Scheduled refresh is disabled until a scoped worker and job monitoring are configured.",
    },
    503,
  );
}
