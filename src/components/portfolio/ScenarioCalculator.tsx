"use client";
import { useState } from "react";
import AppLayout from "../AppLayout";
import { projectSip } from "@/lib/planning/projection";
import { money } from "@/lib/portfolio/format";
export default function ScenarioCalculator() {
  const [monthly, setMonthly] = useState(0),
    [years, setYears] = useState(10),
    [rate, setRate] = useState(0),
    [step, setStep] = useState(0);
  let result: ReturnType<typeof projectSip> | null = null,
    error = "";
  try {
    result = projectSip(monthly, years, rate, step);
  } catch (e) {
    error = e instanceof Error ? e.message : "Scenario unavailable.";
  }
  return (
    <AppLayout>
      <span className="fk-kicker">Planning / Assumptions you control</span>
      <h1>Explore a contribution scenario.</h1>
      <p>
        This illustration uses the assumptions below. It is not a forecast,
        promised return or your portfolio performance.
      </p>
      <div className="fk-two-col">
        <section className="trust-card fk-planning-form">
          <Control
            label="Monthly contribution (₹)"
            value={monthly}
            min={0}
            max={1e9}
            onChange={setMonthly}
          />
          <Control
            label="Years"
            value={years}
            min={1}
            max={50}
            onChange={setYears}
          />
          <Control
            label="Assumed annual effective return (%)"
            value={rate}
            min={-99}
            max={100}
            step="0.1"
            onChange={setRate}
          />
          <Control
            label="Annual contribution step-up (%)"
            value={step}
            min={0}
            max={100}
            step="0.1"
            onChange={setStep}
          />
        </section>
        <section className="trust-card">
          <h2>Illustrated outcome</h2>
          {error ? (
            <p role="alert">{error}</p>
          ) : (
            result && (
              <>
                <strong className="trust-number">{money(result.value)}</strong>
                <p>
                  Contributions: {money(result.invested)} · illustrated
                  growth/loss: {money(result.difference)}
                </p>
                <p>{result.method}</p>
                <p>
                  Zero return is the initial assumption. Negative returns are
                  supported. Actual markets vary and may lose value.
                </p>
              </>
            )
          )}
        </section>
      </div>
      {result && (
        <section className="trust-card">
          <h2>Year-by-year illustration</h2>
          <div
            className="trust-table"
            role="region"
            tabIndex={0}
            aria-label="Contribution scenario by year"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Year</th>
                  <th scope="col">Contributed</th>
                  <th scope="col">Illustrated value</th>
                </tr>
              </thead>
              <tbody>
                {result.points.map((p) => (
                  <tr key={p.year}>
                    <td>{p.year}</td>
                    <td>{money(p.invested)}</td>
                    <td>{money(p.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
function Control({
  label,
  value,
  min,
  max,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
      />
    </label>
  );
}
