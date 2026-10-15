"use client";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { usePortfolio } from "./usePortfolio";
import { TrustStrip, ErrorState, LoadingState } from "./Evidence";
export default function FeatureReadiness({
  title,
  reason,
  requirements = [
    "Verified source data for this feature",
    "A validated calculation method",
    "Reviewable results with clear limitations",
  ],
}: {
  title: string;
  reason: string;
  requirements?: string[];
}) {
  const { data, error, loading, retry } = usePortfolio();
  return (
    <AppLayout>
      <span className="fk-kicker">FolioKey / Preparation, with purpose</span>
      <h1>{title}</h1>
      <p>Better decisions begin with the right evidence.</p>
      <section className="trust-card fk-readiness-hero">
        <span className="fk-pill">Not yet available</span>
        <h2>
          A thoughtful next step.
          <br />
          Not a premature answer.
        </h2>
        <p>{reason}</p>
        <div className="trust-actions">
          <Link href="/upload" className="trust-button">
            Review or update your statement
          </Link>
          <Link href="/intelligence">See available insights →</Link>
        </div>
      </section>
      {error ? (
        <ErrorState message={error} retry={retry} />
      ) : loading || !data ? (
        <LoadingState />
      ) : (
        <TrustStrip analysis={data.analysis} />
      )}
      <section className="trust-card">
        <span className="fk-kicker">What unlocks this feature</span>
        <h2>Evidence we still need.</h2>
        <div className="fk-checks">
          {requirements.map((r, i) => (
            <details key={r}>
              <summary>
                <span className="fk-pending" aria-hidden="true">
                  0{i + 1}
                </span>
                {r}
              </summary>
              <p>
                This prerequisite is not yet validated for this feature. No
                personal result is generated until the required evidence and
                calculation checks are in place.
              </p>
            </details>
          ))}
        </div>
      </section>
      <div className="fk-action-grid">
        <Link href="/portfolio" className="fk-action">
          <h3>Understand your holdings</h3>
          <p>Explore reported values and allocation.</p>
        </Link>
        <Link href="/transactions" className="fk-action">
          <h3>Inspect your source records</h3>
          <p>See what your latest statement actually contains.</p>
        </Link>
      </div>
      <p className="fk-caption">
        No sample portfolio, estimated personal result or investment instruction
        is shown here.
      </p>
    </AppLayout>
  );
}
