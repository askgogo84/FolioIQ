"use client";
import { useState, useId } from "react";
import type { PortfolioAnalysis } from "@/lib/intelligence/generate";
import { money } from "@/lib/portfolio/format";
const colors = [
  "#254d38",
  "#61876b",
  "#9cac7d",
  "#b28d52",
  "#7c8f9b",
  "#a68278",
  "#6c7661",
  "#b1a798",
];
export default function AllocationChart({
  title,
  data,
  donut = false,
}: {
  title: string;
  data: PortfolioAnalysis["allocation"]["category"];
  donut?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const id = useId();
  const chosen = data.slices.find((s) => s.label === selected);
  return (
    <section className="trust-card fk-chart">
      <div className="fk-section-head">
        <div>
          <span className="fk-kicker">Reported allocation</span>
          <h2>{title}</h2>
        </div>
        <span className="fk-pill">
          {data.partial ? "Partial coverage" : "Snapshot"}
        </span>
      </div>
      <p className="fk-caption">
        {data.partial
          ? "Shares of known value only; " +
            data.excluded +
            " unvalued positions excluded."
          : "Shares of reported snapshot value."}{" "}
        Categories describe funds, not underlying holdings.
      </p>
      {!data.available ? (
        <div className="fk-chart-empty">
          <strong>No valued allocation yet</strong>
          <p>A positive reported value is needed to draw this chart.</p>
        </div>
      ) : (
        <>
          <div className={donut ? "fk-donut-layout" : ""}>
            {donut && (
              <div className="fk-donut">
                <svg viewBox="0 0 120 120" role="img" aria-labelledby={id}>
                  <title id={id}>
                    {title}:{" "}
                    {data.slices
                      .map((s) => s.label + " " + s.percent.toFixed(1) + "%")
                      .join(", ")}
                  </title>
                  {data.slices.map((s, i) => {
                    const start = data.slices
                      .slice(0, i)
                      .reduce((sum, slice) => sum + slice.percent, 0);
                    return (
                      <circle
                        key={s.label}
                        cx="60"
                        cy="60"
                        r="46"
                        fill="none"
                        stroke={colors[i % colors.length]}
                        strokeWidth={
                          chosen && chosen.label === s.label ? 17 : 13
                        }
                        pathLength="100"
                        strokeDasharray={s.percent + " " + (100 - s.percent)}
                        strokeDashoffset={-start}
                        transform="rotate(-90 60 60)"
                      />
                    );
                  })}
                </svg>
                <div>
                  <strong>{data.slices.length}</strong>
                  <span>groups</span>
                </div>
              </div>
            )}
            <div className="fk-legend">
              {data.slices.map((s, i) => (
                <button
                  key={s.label}
                  className="fk-legend-row"
                  aria-pressed={selected === s.label}
                  onClick={() =>
                    setSelected(selected === s.label ? null : s.label)
                  }
                >
                  <span className="fk-legend-label">
                    <i style={{ background: colors[i % colors.length] }} />
                    {s.label}
                  </span>
                  <strong>{s.percent.toFixed(1)}%</strong>
                  {!donut && (
                    <span className="fk-bar">
                      <span
                        style={{
                          width: s.percent + "%",
                          background: colors[i % colors.length],
                        }}
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="fk-chart-detail" aria-live="polite">
            {chosen ? (
              <>
                <strong>
                  {chosen.label} · {money(chosen.value)}
                </strong>
                <small>
                  {chosen.positions} positions · {chosen.percent.toFixed(1)}% of
                  the chart’s known-value denominator
                </small>
              </>
            ) : (
              <>
                <strong>{money(data.total)} represented</strong>
                <small>
                  Select a group to inspect its value and position count.
                </small>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
