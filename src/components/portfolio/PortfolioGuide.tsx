"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { usePortfolio, useResource } from "./usePortfolio";
import type { LedgerAssessment } from "@/lib/portfolio/ledger";
import { LoadingState, ErrorState } from "./Evidence";
import { money } from "@/lib/portfolio/format";
import JevGuide from "./JevGuide";
const prompts = [
  "What is my reported portfolio value?",
  "What evidence is missing?",
  "Where is my largest AMC exposure?",
  "What return evidence is available?",
  "Can you recommend a fund?",
];
export default function PortfolioGuide() {
  const { data, error, loading, retry } = usePortfolio();
  const ledger = useResource<{ assessment: LedgerAssessment | null }>(
    "/api/portfolio/ledger",
  );
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
        ledger.loading
          ? "Statement reconciliation is loading."
          : ledger.error
            ? "Statement reconciliation is unavailable. Review the ledger on your dashboard."
            : ledger.data?.assessment?.return.rate != null
              ? "Your annualized statement-period cash-flow XIRR is " +
                (ledger.data.assessment.return.rate * 100).toFixed(2) +
                "%, over " +
                ledger.data.assessment.from +
                " to " +
                ledger.data.assessment.to +
                ". It uses the statement’s closing value and supported cash flows; it is not certified lifetime or live performance."
              : "Statement XIRR requires valid dates, zero opening units, supported cash flows and reconciled closing units. Review the ledger for your specific blockers. Continuous performance charts still need historical units and valuations.",
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
          The questions below use the same checked fields as your dashboard.
          Selecting them makes no AI call. Optional Jev question matching is
          separate and requires explicit consent.
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
      <JevGuide />
    </AppLayout>
  );
}
