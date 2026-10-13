import { json } from "@/lib/server/http";
export function POST() {
  return json(
    {
      error:
        "NJ report parsing is temporarily unavailable while its reconciliation is validated. Upload a CAMS/KFintech CAS PDF instead; existing holdings are unchanged.",
    },
    422,
  );
}
