import { readLedger } from "@/lib/server/ledger-read";
import { failure, json } from "@/lib/server/http";
export async function GET() {
  try {
    return json(await readLedger());
  } catch (e) {
    return failure(e);
  }
}
