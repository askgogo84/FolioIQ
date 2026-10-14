import Link from "next/link";
import type { PortfolioAnalysis } from "@/lib/intelligence/generate";
export function TrustStrip({ analysis: a }: { analysis: PortfolioAnalysis }) {
  return (
    <section className="fk-trust" aria-label="Portfolio evidence coverage">
      <div>
        <span className="fk-kicker">Evidence, at a glance</span>
        <strong>{a.quality.status}</strong>
        <small>Field coverage is not a health score.</small>
      </div>
      {[
        ["Values", a.quality.valued],
        ["Costs", a.quality.costed],
        ["Dated NAVs", a.nav.priced],
      ].map(([label, n]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>
            {n} / {a.summary.positions}
          </strong>
          <meter
            aria-label={label + " coverage"}
            value={Number(n)}
            max={Math.max(a.summary.positions, 1)}
          />
        </div>
      ))}
      <div>
        <span>Valuation dates</span>
        <strong>{a.quality.oldestDate || "Unknown"}</strong>
        <small>
          {a.quality.mixedDates
            ? "through " + a.quality.newestDate
            : "Reported snapshot date"}
          {a.quality.dated < a.summary.positions ? " · some dates missing" : ""}
        </small>
      </div>
    </section>
  );
}
export function Readiness({ analysis: a }: { analysis: PortfolioAnalysis }) {
  return (
    <section className="trust-card fk-readiness">
      <div className="fk-section-head">
        <div>
          <span className="fk-kicker">A stronger foundation</span>
          <h2>What your data can tell us.</h2>
        </div>
        <span className="fk-pill">Returns unavailable</span>
      </div>
      <div className="fk-checks">
        {a.performance.checks.map((c) => (
          <details key={c.id}>
            <summary>
              <span
                className={c.ready ? "fk-check" : "fk-pending"}
                aria-hidden="true"
              >
                {c.ready ? "✓" : "○"}
              </span>
              {c.label}
              <span>{c.ready ? "Present" : "Needed"}</span>
            </summary>
            <p>{c.detail}</p>
          </details>
        ))}
      </div>
      <Link href="/transactions">Review your statement records →</Link>
    </section>
  );
}
export function LoadingState() {
  return (
    <section className="trust-card fk-loading" role="status">
      <span className="fk-kicker">Your private workspace</span>
      <h2>Bringing your portfolio into focus…</h2>
      <p>Loading your records and checking evidence coverage.</p>
    </section>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <section className="trust-card" role="alert">
      <span className="fk-kicker">Unable to load</span>
      <h2>Your portfolio is not available right now.</h2>
      <p>{message}</p>
      <button onClick={retry}>Try again</button>
    </section>
  );
}
