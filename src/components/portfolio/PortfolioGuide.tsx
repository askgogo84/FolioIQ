"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { usePortfolio } from "./usePortfolio";
import { LoadingState, ErrorState } from "./Evidence";
import { money } from "@/lib/portfolio/format";
const prompts = [
  "What is my reported portfolio value?",
  "What evidence is missing?",
  "Where is my largest AMC exposure?",
  "Why are returns unavailable?",
  "Can you recommend a fund?",
];
export default function PortfolioGuide() {
  const { data, error, loading, retry } = usePortfolio();
  const [selected, setSelected] = useState(0);
  const a = data?.analysis;
  const answers = a
    ? [
        a.summary.positions
          ? (a.summary.totalCurrent === null
              ? "A complete total is unavailable. The known subtotal is " +
                money(a.summary.knownCurrent) +
                "."
              : "Your reported snapshot value is " +
                money(a.summary.totalCurrent) +
                ".") + " Values are statement-based; dates may differ."
          : "Import a statement first. There is no portfolio value to summarize.",
        a.summary.positions
          ? `${a.summary.positions - a.quality.valued} positions lack valid values, ${a.summary.positions - a.quality.costed} lack costs and ${a.summary.positions - a.quality.dated} lack valid valuation dates. A reconciled lifetime ledger is also not available.`
          : "No positions are available. A statement is the first piece of evidence.",
        a.concentration.amc.largest
          ? a.concentration.amc.largest.label +
            " represents " +
            a.concentration.amc.largest.percent.toFixed(1) +
            "% of known snapshot value. Unvalued positions are excluded; this does not measure underlying security overlap or suitability."
          : "There is not enough reported AMC/value data to identify an exposure.",
        "A snapshot and latest-statement records do not prove complete cash flows. XIRR and period charts remain unavailable until a reconciled ledger and historical valuations are supported.",
        "No. Verified fund history, benchmark and holdings data, costs, and your risk/horizon preferences are needed before a suitable comparison or recommendation can be made.",
      ]
    : [];
  return (
    <AppLayout>
      <span className="fk-kicker">Portfolio guide / Evidence-led answers</span>
      <h1>A little more clarity.</h1>
      <p>Explore what your snapshot says—and where it stops.</p>
      <div className="trust-notice">
        <strong>Rule-based guide · not an AI adviser</strong>
        <p>
          These answers come from the same checked fields as your dashboard. No
          AI model is called and no personal investment advice is generated.
        </p>
      </div>
      {error ? (
        <ErrorState message={error} retry={retry} />
      ) : loading || !a ? (
        <LoadingState />
      ) : (
        <div className="fk-guide-layout">
          <section className="trust-card">
            <h2>Start with a question.</h2>
            <div className="fk-prompt-list">
              {prompts.map((p, i) => (
                <button
                  key={p}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                >
                  {p}
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </section>
          <section className="trust-card fk-guide-answer" aria-live="polite">
            <span className="fk-kicker">From your portfolio evidence</span>
            <h2>{prompts[selected]}</h2>
            <p>{answers[selected]}</p>
            <small>
              Snapshot checks evaluated {a.asOf}.{" "}
              {a.quality.oldestDate
                ? "Oldest reported valuation: " + a.quality.oldestDate + "."
                : "Valuation date unknown."}{" "}
              {a.quality.mixedDates ? "Mixed valuation dates." : ""}
            </small>
            <Link href="/intelligence">Inspect the evidence →</Link>
          </section>
        </div>
      )}
    </AppLayout>
  );
}
