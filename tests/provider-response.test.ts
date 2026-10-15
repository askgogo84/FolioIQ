import test from "node:test";
import assert from "node:assert/strict";
import { boundedText } from "../src/lib/providers/bounded-response";
import { parseAmfi } from "../src/lib/portfolio/nav";
test("upstream body limits count streamed UTF-8 bytes and reject advertised oversized responses", async () => {
  assert.equal(await boundedText(new Response("valid"), 5), "valid");
  await assert.rejects(boundedText(new Response("₹₹"), 5), /size/);
  await assert.rejects(
    boundedText(
      new Response("small", { headers: { "content-length": "100" } }),
      5,
    ),
    /size/,
  );
  await assert.rejects(boundedText(new Response(null), 5), /missing/);
});
test("AMFI exact matches fail closed on conflicting identifiers", () => {
  assert.throws(
    () =>
      parseAmfi(
        "100001;INF000000001;-;Synthetic A;10;01-Jan-2023\n100002;INF000000001;-;Synthetic B;12;01-Jan-2023",
      ),
    /Ambiguous/,
  );
  assert.throws(
    () =>
      parseAmfi(
        "100001;INF000000001;-;Synthetic A;10;01-Jan-2023\n100001;INF000000001;-;Synthetic A;12;01-Jan-2023",
      ),
    /Conflicting/,
  );
});
