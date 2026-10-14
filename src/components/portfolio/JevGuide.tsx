"use client";
import { useState } from "react";
import Link from "next/link";
import { useResource } from "./usePortfolio";
export default function JevGuide() {
  const config = useResource<{ configured: boolean }>("/api/guide"),
    [question, setQuestion] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [answer, setAnswer] = useState<{
      text: string;
      href: string;
      asOf: string;
      method: string;
    } | null>(null);
  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setAnswer(null);
    setBusy(true);
    try {
      const res = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, consent }),
        }),
        data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Question matching unavailable.");
      if (data.answer) {
        setAnswer(data.answer);
        setMessage(
          "Jev matched a topic. Provider-reported confidence is " +
            (data.routing.confidence * 100).toFixed(1) +
            "%; this is not confidence in a financial recommendation.",
        );
      } else
        setMessage(
          "No confident topic match was returned. Choose one of the rule-based questions above.",
        );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Question matching unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="trust-card">
      <span className="fk-kicker">Optional AI question matching / Jev</span>
      <h2>Ask in your own words.</h2>
      <p>
        Jev can select a topic; FolioKey answers with calculated facts and
        readiness checks. It cannot choose a fund or supply financial numbers.
      </p>
      {config.loading ? (
        <p role="status">Checking optional guide availability…</p>
      ) : config.error ? (
        <p role="alert">
          Optional matching is unavailable.{" "}
          <button onClick={config.retry}>Retry</button>
        </p>
      ) : !config.data?.configured ? (
        <p>
          Optional Jev matching is not configured. The rule-based guide above
          remains available.
        </p>
      ) : (
        <form onSubmit={ask} className="fk-planning-form">
          <label>
            Your question
            <textarea
              maxLength={1000}
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={busy}
            />
          </label>
          <p>
            Do not include PAN, OTP, account numbers or statement contents. Only
            this question is sent to TypeSafe; portfolio records are not
            automatically sent.
          </p>
          <label>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />{" "}
            I consent to sending this question to TypeSafe for topic matching
            and have read the <Link href="/privacy">data-use notice</Link>.
          </label>
          <button disabled={busy || !consent || !question.trim()}>
            {busy ? "Matching topic…" : "Match my question"}
          </button>
          <p>
            Maximum five submissions per rolling 24 hours. Failed or uncertain
            attempts count toward the limit.
          </p>
        </form>
      )}
      <p role="status">{message}</p>
      {answer && (
        <div aria-live="polite">
          <h3>From your portfolio evidence</h3>
          <p>{answer.text}</p>
          <p className="fk-caption">
            Checks evaluated {answer.asOf} · {answer.method}
          </p>
          <Link href={answer.href}>Inspect the source →</Link>
        </div>
      )}
    </section>
  );
}
