import test from "node:test";
import assert from "node:assert/strict";
import { selectCasCredential } from "../src/lib/providers/cas-config";
const now = Date.parse("2026-10-13T12:00:00Z");
test("existing credential stays disabled without an explicit valid test window", () => {
  for (const temporaryExpiry of [
    undefined,
    "",
    "invalid",
    "2026-10-14",
    "2026-10-14T12:00:00",
  ])
    assert.equal(
      selectCasCredential(
        { existingKey: "synthetic-existing", temporaryExpiry },
        now,
      ),
      null,
    );
});
test("test window permits the existing credential only before the exact expiry", () => {
  const config = {
    existingKey: "synthetic-existing",
    temporaryExpiry: "2026-10-13T12:00:01Z",
  };
  assert.equal(selectCasCredential(config, now), "synthetic-existing");
  assert.equal(selectCasCredential(config, now + 1000), null);
  assert.equal(selectCasCredential(config, now + 2000), null);
});
test("replacement credential always takes precedence and works after test expiry", () => {
  assert.equal(
    selectCasCredential(
      {
        replacementKey: "synthetic-replacement",
        existingKey: "synthetic-existing",
        temporaryExpiry: "2026-10-12T12:00:00Z",
      },
      now,
    ),
    "synthetic-replacement",
  );
});
test("a test deadline cannot enable uploads without a credential", () => {
  assert.equal(
    selectCasCredential(
      { existingKey: "  ", temporaryExpiry: "2026-10-14T12:00:00Z" },
      now,
    ),
    null,
  );
});
