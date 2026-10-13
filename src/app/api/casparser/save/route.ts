import {
  authorized,
  budget,
  failure,
  ApiError,
  json,
  readJson,
} from "@/lib/server/http";
import { stageImport } from "@/lib/server/imports";
export async function POST(request: Request) {
  try {
    const { db, user } = await authorized(request);
    const body = await readJson(request);
    if (body.consent !== true)
      throw new ApiError("Confirm your import consent.");
    await budget(db, "draft");
    return json(await stageImport(db, user.id, body.data, "casparser-widget"));
  } catch (e) {
    return failure(e);
  }
}
