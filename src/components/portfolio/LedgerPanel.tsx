"use client";
import Link from "next/link";
import { useResource } from "./usePortfolio";
import type { LedgerAssessment } from "@/lib/portfolio/ledger";
import { money } from "@/lib/portfolio/format";
export default function LedgerPanel() {
  const { data, error, loading, retry } = useResource<{
    assessment: LedgerAssessment | null;
    canonical?: {
      events: number;
      sourceImports: number;
      ambiguousDuplicates: number;
      scope: string;
    } | null;
  }>("/api/portfolio/ledger");
  const a = data?.assessment;
  return (
    <section className="trust-card">
      <div className="fk-section-head">
        <div>
          <span className="fk-kicker">Source statement / Ledger review</span>
          <h2>Returns begin with reconciliation.</h2>
        </div>
        <span className="fk-pill">
          {a?.return.rate != null ? "Statement XIRR" : "Evidence needed"}
        </span>
      </div>
      {loading ? (
        <p role="status">Checking statement evidence…</p>
      ) : error ? (
        <p role="alert">
          {error} <button onClick={retry}>Retry ledger</button>
        </p>
      ) : !a ? (
        <p>
          No source statement is attached.{" "}
          <Link href="/upload">Import a detailed CAS →</Link>
        </p>
      ) : (
        <>
          <p>{a.scope}</p>
          {data?.canonical && (
            <p className="fk-caption">
              {data.canonical.events} indexed event occurrences across{" "}
              {data.canonical.sourceImports} source versions ·{" "}
              {data.canonical.ambiguousDuplicates} duplicate-count conflicts.{" "}
              {data.canonical.scope}
            </p>
          )}
          <strong className="trust-number">
            {a.return.rate === null
              ? "Unavailable"
              : (a.return.rate * 100).toFixed(2) + "%"}
          </strong>
          <p>
            Annualized statement-period cash-flow XIRR · {a.from || "Unknown"}{" "}
            through {a.to || "Unknown"}
            {a.return.days ? " · " + a.return.days + " days" : ""}
          </p>
          <p>{a.return.reason}</p>
          {a.issues.map((i) => (
            <p key={i} className="trust-notice">
              {i}
            </p>
          ))}
          <div className="fk-checks">
            {a.positions.map((p) => (
              <details key={p.key}>
                <summary>
                  {p.name}
                  <span>
                    {p.issues.length ? "Review needed" : "Units reconciled"}
                  </span>
                </summary>
                <p>
                  Opening: {p.openingUnits ?? "Unknown"} · computed closing:{" "}
                  {p.computedClosingUnits ?? "Unknown"} · reported:{" "}
                  {p.reportedClosingUnits} · records: {p.eventCount}
                </p>
                <p>
                  Purchases: {money(p.purchases)} · redemptions:{" "}
                  {money(p.redemptions)} · payouts: {money(p.payouts)}. Totals
                  cover recognized source labels only.
                </p>
                {p.issues.map((i) => (
                  <p key={i}>{i}</p>
                ))}
              </details>
            ))}
          </div>
          <p className="fk-caption">
            {a.method} · {a.return.method}. No continuous NAV chart, lifetime
            return, tax estimate or fund recommendation is inferred.
          </p>
        </>
      )}
    </section>
  );
}
