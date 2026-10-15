"use client";
import { useState } from "react";
import AppLayout from "../AppLayout";
import {
  parseNavHistory,
  compareNavSeries,
  type NavSeries,
  type NavComparison,
} from "@/lib/portfolio/history";
export default function NavResearch() {
  const [series, setSeries] = useState<NavSeries[]>([]),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [error, setError] = useState(""),
    [result, setResult] = useState<NavComparison | null>(null),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(0);
  async function load(files: FileList | null) {
    setError("");
    setResult(null);
    setSeries([]);
    setA("");
    setB("");
    if (!files?.length) return;
    setBusy(true);
    try {
      if (
        files.length > 20 ||
        [...files].reduce((n, f) => n + f.size, 0) > 3_000_000
      )
        throw new Error("Choose up to 20 text files totalling at most 3 MB.");
      const texts = await Promise.all([...files].map((f) => f.text()));
      setSeries(parseNavHistory(texts.join("\n")));
    } catch (e) {
      setError(e instanceof Error ? e.message : "NAV file could not be read.");
    } finally {
      setBusy(false);
    }
  }
  function compare(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const left = series.find((s) => s.code === a),
        right = series.find((s) => s.code === b);
      if (!left || !right)
        throw new Error("Select two schemes present in your file.");
      setResult(compareNavSeries(left, right));
      setSelected(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison unavailable.");
    }
  }
  return (
    <AppLayout>
      <span className="fk-kicker">Fund research / Bring your source</span>
      <h1>Compare the evidence.</h1>
      <p>
        Explore two NAV series from AMFI text exports you supply. Files stay in
        this browser; no provider or AI call is made.
      </p>
      <section className="trust-card">
        <h2>Choose your NAV history.</h2>
        <p>
          Download historical NAV text from the{" "}
          <a
            href="https://www.amfiindia.com/net-asset-value/nav-history"
            target="_blank"
            rel="noopener noreferrer"
          >
            official AMFI history page
          </a>
          , then choose files containing the schemes you want to compare. This
          tool neither certifies file authenticity nor assigns investment
          suitability.
        </p>
        <label>
          AMFI semicolon text files (combined 3 MB maximum)
          <input
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            multiple
            disabled={busy}
            onChange={(e) => load(e.target.files)}
          />
        </label>
        <p role="status">
          {busy
            ? "Reading local NAV files…"
            : series.length
              ? series.length + " scheme identifiers loaded."
              : "No history supplied."}
        </p>
        <form className="fk-planning-form" onSubmit={compare}>
          <label>
            First scheme
            <select
              value={a}
              onChange={(e) => {
                setA(e.target.value);
                setResult(null);
              }}
              required
            >
              <option value="">Choose from file</option>
              {series.map((s) => (
                <option value={s.code} key={s.code}>
                  {s.name} · {s.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Second scheme
            <select
              value={b}
              onChange={(e) => {
                setB(e.target.value);
                setResult(null);
              }}
              required
            >
              <option value="">Choose from file</option>
              {series.map((s) => (
                <option value={s.code} key={s.code}>
                  {s.name} · {s.code}
                </option>
              ))}
            </select>
          </label>
          <button disabled={busy || series.length < 2}>
            Compare exact dates
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
      {result && (
        <section className="trust-card">
          <span className="fk-kicker">
            NAV-only comparison / Not portfolio performance
          </span>
          <h2>
            {result.from} — {result.to}
          </h2>
          <p>{result.source}</p>
          <NavPlot result={result} />
          <label>
            Inspect an observation
            <input
              type="range"
              min={0}
              max={result.points.length - 1}
              step={1}
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
            />
          </label>
          <p aria-live="polite">
            {result.points[selected].date} · {result.a.name}:{" "}
            {result.points[selected].a.toFixed(2)} · {result.b.name}:{" "}
            {result.points[selected].b.toFixed(2)} (base 100)
          </p>
          <div
            className="trust-table"
            role="region"
            tabIndex={0}
            aria-label="NAV comparison metrics"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Scheme</th>
                  <th scope="col">NAV change</th>
                  <th scope="col">Annualized NAV change</th>
                </tr>
              </thead>
              <tbody>
                {[result.a, result.b].map((s) => (
                  <tr key={s.code}>
                    <td>{s.name}</td>
                    <td>{s.pointToPointPercent.toFixed(2)}%</td>
                    <td>
                      {s.annualizedPercent === null
                        ? "Requires at least 365 days"
                        : s.annualizedPercent.toFixed(2) + "%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            {result.commonDates} shared observations over {result.days} days.
            Gaps are not filled. Connecting lines are visual guides between
            observations.
          </p>
          <p className="fk-caption">
            {result.method}. This is not a total-return benchmark, fund ranking
            or direct-versus-regular fee-saving estimate.
          </p>
        </section>
      )}
    </AppLayout>
  );
}
function NavPlot({ result: r }: { result: NavComparison }) {
  const values = r.points.flatMap((p) => [p.a, p.b]),
    lo = values.reduce((v, n) => Math.min(v, n), Infinity),
    hi = values.reduce((v, n) => Math.max(v, n), -Infinity),
    span = hi - lo || 1,
    start = Date.parse(r.from),
    duration = Date.parse(r.to) - start;
  const path = (key: "a" | "b") =>
    r.points
      .map(
        (p) =>
          `${30 + ((Date.parse(p.date) - start) / duration) * 740},${250 - ((p[key] - lo) / span) * 210}`,
      )
      .join(" ");
  return (
    <svg
      viewBox="0 0 800 290"
      className="fk-nav-chart"
      role="img"
      aria-label="NAV-only comparison normalized to 100 on the first shared date"
    >
      <title>
        {r.a.name} (green) and {r.b.name} (gold), observed NAVs on common dates
      </title>
      <text x="4" y="25" fill="currentColor" fontSize="12">
        {hi.toFixed(1)}
      </text>
      <text x="4" y="275" fill="currentColor" fontSize="12">
        {lo.toFixed(1)}
      </text>
      <polyline
        points={path("a")}
        fill="none"
        stroke="#254d38"
        strokeWidth="3"
      />
      <polyline
        points={path("b")}
        fill="none"
        stroke="#b28d52"
        strokeWidth="3"
      />
    </svg>
  );
}
