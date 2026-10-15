import {
  authorized,
  failure,
  json,
  readJson,
  ApiError,
} from "@/lib/server/http";
import {
  planKinds,
  validatePlan,
  emptyPlan,
  type PlanKind,
} from "@/lib/planning/model";
export async function GET(request: Request) {
  try {
    const { db, user } = await authorized();
    const kind = new URL(request.url).searchParams.get("kind") as PlanKind;
    if (!planKinds.includes(kind))
      throw new ApiError("Unknown planning section.", 400);
    const { data, error } = await db
      .from("portfolio_plans")
      .select("revision,payload")
      .eq("user_id", user.id)
      .eq("kind", kind)
      .maybeSingle();
    if (error)
      throw new ApiError(
        "Saved planning is awaiting database setup or is temporarily unavailable. No changes have been saved.",
        503,
      );
    return json({
      revision: data?.revision || 0,
      payload: data ? validatePlan(kind, data.payload) : emptyPlan(kind),
    });
  } catch (e) {
    return failure(e);
  }
}
export async function PUT(request: Request) {
  try {
    const { db, user } = await authorized(request);
    const body = await readJson(request);
    const kind = body.kind as PlanKind;
    if (
      !planKinds.includes(kind) ||
      !Number.isSafeInteger(body.revision) ||
      body.revision < 0
    )
      throw new ApiError("Invalid planning revision.");
    let payload;
    try {
      payload = validatePlan(kind, body.payload);
    } catch (e) {
      throw new ApiError(
        e instanceof Error ? e.message : "Invalid planning input.",
        422,
      );
    }
    const result =
      body.revision === 0
        ? await db
            .from("portfolio_plans")
            .insert({ user_id: user.id, kind, payload, revision: 1 })
            .select("revision")
            .maybeSingle()
        : await db
            .from("portfolio_plans")
            .update({ payload, revision: body.revision + 1 })
            .eq("user_id", user.id)
            .eq("kind", kind)
            .eq("revision", body.revision)
            .select("revision")
            .maybeSingle();
    if (result.error?.code === "23505" || (!result.error && !result.data))
      throw new ApiError(
        "This plan changed in another session. Reload before saving.",
        409,
      );
    if (result.error)
      throw new ApiError(
        "Planning data could not be saved. Please retry after database setup.",
        503,
      );
    return json({ revision: result.data!.revision, payload });
  } catch (e) {
    return failure(e);
  }
}
