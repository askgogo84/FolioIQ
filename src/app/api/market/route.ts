import { json } from "@/lib/server/http";
export function GET() {
  return json(
    {
      available: false,
      error: "Market quotes are not connected to a verified feed.",
    },
    503,
  );
}
