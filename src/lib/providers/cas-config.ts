type CasConfiguration = {
  replacementKey?: string;
  existingKey?: string;
  temporaryExpiry?: string;
};

/** Existing credentials require an explicitly configured, unexpired test window. */
export function selectCasCredential(
  config: CasConfiguration,
  now = Date.now(),
): string | null {
  const replacement = config.replacementKey?.trim();
  if (replacement) return replacement;
  const existing = config.existingKey?.trim();
  const expiry = config.temporaryExpiry;
  if (
    !existing ||
    !expiry ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(expiry)
  )
    return null;
  const deadline = Date.parse(expiry);
  if (!Number.isFinite(deadline) || !Number.isFinite(now) || deadline <= now)
    return null;
  return existing;
}
