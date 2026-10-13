import test from "node:test";
import assert from "node:assert/strict";
import { reviewPublicEvidence } from "../src/lib/providers/jev";
const evidence = {
  sourceUrl: "https://example.com/research",
  publishedAt: "2026-06-01",
  excerpt: "Synthetic public research fixture",
};
test("Jev makes no request without separately configured model and key", async () => {
  let called = false;
  assert.equal(
    (
      await reviewPublicEvidence(evidence, {
        fetcher: async () => {
          called = true;
          throw Error();
        },
      })
    ).status,
    "unavailable",
  );
  assert.equal(called, false);
});
test("Jev uses typed criteria and low confidence requires review", async () => {
  const fetcher: typeof fetch = async (url, request) => {
    assert.equal(url, "https://api.typesafe.ai/v1/systemone");
    const body = JSON.parse(String(request?.body));
    assert.equal(body.questions.evidence_quality.type, "choice");
    assert.deepEqual(Object.keys(body.state).sort(), [
      "excerpt",
      "publishedAt",
      "sourceUrl",
    ]);
    return Response.json({
      model: "test-model",
      answers: {
        evidence_quality: {
          type: "choice",
          choice: "relevant",
          confidence: 0.6,
          probabilities: { relevant: 0.6, insufficient: 0.4, irrelevant: 0 },
        },
      },
    });
  };
  assert.equal(
    (
      await reviewPublicEvidence(evidence, {
        apiKey: "synthetic-test-key",
        model: "test-model",
        fetcher,
      })
    ).status,
    "review_required",
  );
});
test("invalid schema and provider failure never become successful decisions", async () => {
  for (const response of [
    Response.json({ answers: {} }),
    new Response("", { status: 429 }),
  ])
    assert.equal(
      (
        await reviewPublicEvidence(evidence, {
          apiKey: "synthetic-test-key",
          model: "test-model",
          fetcher: async () => response,
        })
      ).status,
      "unavailable",
    );
});
