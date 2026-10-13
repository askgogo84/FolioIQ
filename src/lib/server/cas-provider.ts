import "server-only";
import { selectCasCredential } from "@/lib/providers/cas-config";

export function casProviderKey() {
  return selectCasCredential({
    replacementKey: process.env.FOLIOKEY_CAS_PARSER_API_KEY,
    existingKey: process.env.CAS_PARSER_API_KEY,
    temporaryExpiry: process.env.FOLIOKEY_CAS_TEST_EXPIRES_AT,
  });
}
