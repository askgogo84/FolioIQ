import test from "node:test";
import assert from "node:assert/strict";
import {
  routeGuideQuestion,
  guideTopics,
} from "../src/lib/providers/guide-router";
import { guideAnswer } from "../src/lib/intelligence/guide-answer";
import { analyzePortfolio } from "../src/lib/intelligence/generate";
test("Jev topic matching is disabled without all configuration and makes no call", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    throw Error();
  };
  assert.equal(
    (
      await routeGuideQuestion("What is my value?", {
        apiKey: "synthetic",
        model: "test",
        fetcher,
      })
    ).status,
    "unavailable",
  );
  assert.equal(calls, 0);
});
test("Jev only receives question text; financial facts come from deterministic local evidence", async () => {
  const fetcher: typeof fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    assert.deepEqual(body.state, { question: "Synthetic question only" });
    assert.equal(body.questions.topic.type, "choice");
    assert.ok(!JSON.stringify(body).includes("holdings"));
    return Response.json({
      model: "test",
      answers: {
        topic: {
          type: "choice",
          choice: "advice",
          confidence: 0.99,
          probabilities: Object.fromEntries(
            guideTopics.map((t) => [t, t === "advice" ? 1 : 0]),
          ),
        },
      },
    });
  };
  const routed = await routeGuideQuestion("Synthetic question only", {
    enabled: true,
    apiKey: "synthetic",
    model: "test",
    fetcher,
  });
  assert.equal(routed.topic, "advice");
  assert.equal(routed.status, "matched");
  const answer = guideAnswer("advice", analyzePortfolio([]), null);
  assert.match(answer.text, /cannot recommend/);
});
test("low-confidence, invalid schema, timeouts and rate limits never create financial answers", async () => {
  const options = { enabled: true, apiKey: "synthetic", model: "test" };
  for (const response of [
    Response.json({
      answers: { topic: { type: "choice", choice: "BUY_FUND", confidence: 1 } },
    }),
    Response.json({
      model: "test",
      answers: {
        topic: {
          type: "choice",
          choice: "value",
          confidence: 0.4,
          probabilities: Object.fromEntries(
            guideTopics.map((t) => [t, t === "value" ? 1 : 0]),
          ),
        },
      },
    }),
    new Response(null, { status: 429 }),
  ]) {
    const result = await routeGuideQuestion("Synthetic question", {
      ...options,
      fetcher: async () => response,
    });
    assert.notEqual(result.status, "matched");
  }
  assert.equal(
    (
      await routeGuideQuestion("Synthetic question", {
        ...options,
        fetcher: async () => {
          throw Error("Timeout");
        },
      })
    ).status,
    "unavailable",
  );
});
test("missing evidence is preserved by every deterministic guide topic", () => {
  const a = analyzePortfolio([]);
  assert.match(
    guideAnswer("value", a, null).text,
    /complete total is unavailable/,
  );
  assert.match(guideAnswer("returns", a, null).text, /needs/);
  assert.match(guideAnswer("planning", a, null).text, /self-reported/);
});
