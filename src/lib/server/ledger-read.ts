import "server-only";
import { authorized, ApiError } from "./http";
import { reconcileStatement, canonicalEvents } from "@/lib/portfolio/ledger";
import type { ImportPreview } from "@/lib/portfolio/import";
import { fifoLots } from "@/lib/portfolio/lots";
export async function readLedger() {
  const { db, user } = await authorized();
  const { data: holdings, error } = await db
    .from("portfolio_holdings")
    .select("import_id")
    .eq("user_id", user.id)
    .limit(1);
  if (error) throw new ApiError("Statement evidence could not be loaded.", 503);
  const id = holdings?.[0]?.import_id;
  if (!id)
    return {
      assessment: null,
      canonical: null,
      sourceImport: null,
      lots: null,
    };
  const { data: source, error: err } = await db
    .from("portfolio_imports")
    .select("id,payload,status")
    .eq("user_id", user.id)
    .eq("id", id)
    .eq("status", "committed")
    .maybeSingle();
  if (err || !source)
    throw new ApiError("The committed source statement is unavailable.", 503);
  const payload = source.payload as ImportPreview;
  if (
    !Array.isArray(payload.holdings) ||
    !Array.isArray(payload.transactions) ||
    payload.holdings.length > 2000 ||
    payload.transactions.length > 20000
  )
    throw new ApiError(
      "Statement evidence exceeds the supported review size.",
      422,
    );
  const { data: previous, error: historyError } = await db
    .from("portfolio_imports")
    .select("id,payload")
    .eq("user_id", user.id)
    .eq("status", "committed")
    .neq("id", source.id)
    .order("committed_at", { ascending: false })
    .limit(2);
  if (historyError)
    throw new ApiError("Import history could not be checked.", 503);
  const sources = [{ id: source.id, transactions: payload.transactions }];
  for (const p of previous || []) {
    if (
      !Array.isArray(p.payload?.transactions) ||
      p.payload.transactions.length > 20000
    )
      throw new ApiError(
        "Prior source evidence exceeds supported review limits.",
        422,
      );
    sources.push({ id: p.id, transactions: p.payload.transactions });
  }
  const canonical = canonicalEvents(sources);
  const assessment = reconcileStatement(payload);
  return {
    assessment,
    lots: fifoLots(payload, assessment),
    canonical: {
      events: canonical.events.length,
      ambiguousDuplicates: canonical.ambiguousDuplicates.length,
      certifiedComplete: false,
      sourceImports: sources.length,
      scope:
        "Current statement plus up to two recent committed imports. Duplicate evidence is indexed; lifetime completeness is not established.",
    },
    sourceImport: source.id,
  };
}
