import { authorized, failure, json } from "@/lib/server/http";
export async function POST(request: Request) {
  try {
    await authorized(request);
    return json(
      {
        error:
          "Personal advice is unavailable until fund data, suitability and grounding checks are connected.",
      },
      503,
    );
  } catch (e) {
    return failure(e);
  }
}
