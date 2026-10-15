"use client";
import { useState } from "react";
import Link from "next/link";
import type { Insight } from "@/lib/intelligence/types";
export default function InsightQueue({ findings }: { findings: Insight[] }) {
  const [filter, setFilter] = useState("all");
  const shown = findings.filter((f) => filter === "all" || f.kind === filter);
  return (
    <section className="trust-card">
      <div className="fk-section-head">
        <div>
          <span className="fk-kicker">Your review queue</span>
          <h2>Clarity before action.</h2>
        </div>
        <span className="fk-pill">Rule-based · not AI advice</span>
      </div>
      <div className="fk-tabs" aria-label="Filter insights">
        {[
          ["all", "All"],
          ["coverage", "Data checks"],
          ["observation", "Observations"],
          ["readiness", "Readiness"],
        ].map(([value, label]) => (
          <button
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        {shown.length ? (
          shown.map((f) => (
            <article className="fk-insight" key={f.id}>
              <span className="fk-kicker">{f.kind}</span>
              <h3>{f.title}</h3>
              <p>{f.detail}</p>
              <details>
                <summary>Evidence & limitations</summary>
                <p>{f.evidence}</p>
              </details>
              <Link href={f.href}>{f.action} →</Link>
            </article>
          ))
        ) : (
          <p>
            No findings in this group. This does not certify portfolio health.
          </p>
        )}
      </div>
    </section>
  );
}
