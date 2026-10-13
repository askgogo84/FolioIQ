import {
  authorized,
  failure,
  ApiError,
  json,
  readJson,
} from "@/lib/server/http";
export async function POST(request: Request) {
  try {
    const { db } = await authorized(request);
    const body = await readJson(request);
    if (
      body.confirmReplace !== true ||
      typeof body.draftId !== "string" ||
      !/^[-a-f0-9]{36}$/.test(body.draftId)
    )
      throw new ApiError("Review and confirm the portfolio replacement.");
    const { data, error } = await db.rpc("commit_portfolio_import", {
      p_import_id: body.draftId,
    });
    if (error)
      throw new ApiError(
        "Import could not be committed. It may have expired or failed reconciliation. Existing holdings are unchanged.",
        409,
      );
    return json(data);
  } catch (e) {
    return failure(e);
  }
}
