"use client";
import { useState } from "react";
import AppLayout from "../AppLayout";
import {
  parseConstituents,
  compareConstituents,
  type Constituents,
  type OverlapResult,
} from "@/lib/portfolio/overlap";
export default function OverlapResearch() {
  const [funds, setFunds] = useState<Constituents[]>([]),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [error, setError] = useState(""),
    [result, setResult] = useState<OverlapResult | null>(null),
    [busy, setBusy] = useState(false);
  async function load(file: File | undefined) {
    setFunds([]);
    setResult(null);
    setA("");
    setB("");
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 1_000_000)
        throw new Error("Maximum constituent file size is 1 MB.");
      setFunds(parseConstituents(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "File unavailable.");
    } finally {
      setBusy(false);
    }
  }
  function compare(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setError("");
    try {
      const left = funds.find((f) => f.fund === a),
        right = funds.find((f) => f.fund === b);
      if (!left || !right) throw new Error("Select two funds from your file.");
      setResult(compareConstituents(left, right));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison unavailable.");
    }
  }
  return (
    <AppLayout>
      <span className="fk-kicker">
        Underlying holdings / Bring your disclosure
      </span>
      <h1>Look beneath the fund names.</h1>
      <p>
        Compare two constituent disclosures you are authorized to use. Files
        stay in this browser; FolioKey does not scrape private apps or certify
        user-supplied disclosures.
      </p>
      <section className="trust-card">
        <h2>Supply dated security weights</h2>
        <p>
          Use a CSV with the exact header below and one security per row. Fund
          identifiers are your own labels without spaces; weights are
          percentages of the whole fund, not fractions of disclosed holdings.
        </p>
        <pre>fund_id,security_isin,weight_percent,as_of</pre>
        <p>
          No example investments are preloaded. Cash, derivatives and incomplete
          disclosures require separate interpretation.
        </p>
        <label>
          Constituent CSV (up to 1 MB)
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={busy}
            onChange={(e) => load(e.target.files?.[0])}
          />
        </label>
        <p role="status">
          {busy ? "Reading local file…" : funds.length + " disclosures loaded."}
        </p>
        <form className="fk-planning-form" onSubmit={compare}>
          <label>
            First fund
            <select
              required
              value={a}
              onChange={(e) => {
                setA(e.target.value);
                setResult(null);
              }}
            >
              <option value="">Choose from file</option>
              {funds.map((f) => (
                <option key={f.fund}>{f.fund}</option>
              ))}
            </select>
          </label>
          <label>
            Second fund
            <select
              required
              value={b}
              onChange={(e) => {
                setB(e.target.value);
                setResult(null);
              }}
            >
              <option value="">Choose from file</option>
              {funds.map((f) => (
                <option key={f.fund}>{f.fund}</option>
              ))}
            </select>
          </label>
          <button disabled={busy || funds.length < 2}>
            Compare disclosed holdings
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
      {result && (
        <section className="trust-card">
          <span className="fk-pill">User-supplied evidence</span>
          <h2>{result.knownOverlap.toFixed(2)}% known common exposure</h2>
          <p>
            Disclosure date: {result.date} · coverage:{" "}
            {result.aCoverage.toFixed(2)}% / {result.bCoverage.toFixed(2)}%.
          </p>
          <p>
            {result.complete
              ? "Supplied weights total 100% for both files; authenticity and scope are not independently verified."
              : "Partial disclosure: this is a lower bound on overlap. Missing weights remain unknown."}
          </p>
          <p>{result.method}</p>
          <div
            className="trust-table"
            role="region"
            tabIndex={0}
            aria-label="Common disclosed securities"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Security ISIN</th>
                  <th scope="col">First weight</th>
                  <th scope="col">Second weight</th>
                  <th scope="col">Common weight</th>
                </tr>
              </thead>
              <tbody>
                {result.common.map((w) => (
                  <tr key={w.isin}>
                    <td>{w.isin}</td>
                    <td>{w.a.toFixed(2)}%</td>
                    <td>{w.b.toFixed(2)}%</td>
                    <td>{w.shared.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!result.common.length && (
            <p>
              No common securities in the supplied rows; undisclosed exposure
              may still overlap.
            </p>
          )}
        </section>
      )}
    </AppLayout>
  );
}
