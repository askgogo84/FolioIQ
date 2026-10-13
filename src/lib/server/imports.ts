import "server-only";
import { normalizeCas, summarize } from "@/lib/portfolio/import";
import { ApiError } from "./http";
import { createClient } from "@/utils/supabase/server";

export async function stageImport(
  db: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  data: unknown,
  source: string,
) {
  let preview;
  try {
    preview = normalizeCas(data, source);
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Statement could not be validated.",
      422,
    );
  }
  const { data: draft, error } = await db
    .from("portfolio_imports")
    .insert({
      user_id: userId,
      source,
      checksum: preview.checksum,
      payload: preview,
      status: "draft",
    })
    .select("id")
    .single();
  if (error || !draft)
    throw new ApiError(
      "Unable to save the import for review. Existing holdings are unchanged.",
      503,
    );
  return {
    draftId: draft.id,
    holdings: preview.holdings,
    summary: summarize(preview.holdings),
    warnings: preview.warnings,
    statementDate: preview.statement_date,
    transactionCount: preview.transactions.length,
  };
}
