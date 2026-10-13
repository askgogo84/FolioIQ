"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "./AppLayout";
import type { Holding } from "@/lib/portfolio/import";
type Data = {
  error?: string;
  connected: boolean;
  holdings: (Holding & { id: string })[];
  summary: {
    totalCurrent: number | null;
    knownCurrent: number;
    totalInvested: number | null;
    totalGain: number | null;
    gainPct: number | null;
    fundCount: number;
    valuationCoverage: number;
    costCoverage: number;
  };
  coverage: {
    valuationDate: string | null;
    mixedDates: boolean;
    missingDates: number;
    stale: boolean;
    oldestDate: string | null;
  };
  user: { name: string };
};
export function money(n: number | null | undefined) {
  return n === null || n === undefined
    ? "Unavailable"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(n);
}
export default function PortfolioOverview({
  holdingsOnly = false,
}: {
  holdingsOnly?: boolean;
}) {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio/me", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Unable to load portfolio.");
      setData(d);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load portfolio.");
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load only updates state after the network request settles.
    void load();
  }, [load]);
  async function refresh() {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/nav-refresh", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setNotice(d.message);
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Refresh unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppLayout>
      <div className="trust-eyebrow">
        Your mutual funds · statement-based review
      </div>
      <h1>
        {holdingsOnly ? "Your holdings." : "A clearer view of your portfolio."}
      </h1>
      {error ? (
        <section className="trust-card" role="alert">
          <p>{error}</p>
          <button onClick={load}>Retry</button>
        </section>
      ) : !data ? (
        <p role="status">Loading your portfolio…</p>
      ) : !data.connected ? (
        <section className="trust-card">
          <h2>Start with your statement</h2>
          <p>
            No holdings are saved for this account. New imports are paused
            during security containment; no sample portfolio is substituted.
          </p>
          <Link href="/upload" className="trust-button">
            Import unavailable
          </Link>
        </section>
      ) : (
        <>
          <div className="trust-notice">
            <strong>
              {data.coverage.valuationDate
                ? "Valuation from " + data.coverage.valuationDate
                : "Valuation date not verified"}
            </strong>
            <p>
              {data.coverage.mixedDates
                ? "Holdings have different valuation dates. "
                : ""}
              This is your imported mutual fund snapshot. It is not your
              complete net worth or a live market feed.
            </p>
            {data.coverage.stale && (
              <p role="status">
                Stale snapshot: at least one valuation is more than 7 calendar
                days old. Figures below are dated records, not current market
                values.
              </p>
            )}
            {data.coverage.missingDates > 0 && (
              <p role="status">
                Partial date coverage: {data.coverage.missingDates} positions
                have no verified valuation date.
              </p>
            )}
            {data.summary.valuationCoverage < data.summary.fundCount && (
              <p role="status">
                Partial valuation: only {data.summary.valuationCoverage} of{" "}
                {data.summary.fundCount} positions have a value. Complete
                portfolio value and gain are unavailable.
              </p>
            )}
            <button onClick={refresh} disabled={busy}>
              {busy ? "Checking NAVs…" : "Refresh available NAVs"}
            </button>
            {notice && <p role="status">{notice}</p>}
          </div>
          <div className="trust-grid">
            <section className="trust-card">
              <label>Mutual Fund Portfolio Value</label>
              <strong className="trust-number">
                {money(data.summary.totalCurrent)}
              </strong>
              <small>
                {data.summary.valuationCoverage} of {data.summary.fundCount}{" "}
                positions valued
              </small>
            </section>
            <section className="trust-card">
              <label>Reported cost</label>
              <strong className="trust-number">
                {money(data.summary.totalInvested)}
              </strong>
              <small>
                {data.summary.costCoverage} positions have cost data
              </small>
            </section>
            <section className="trust-card">
              <label>Unrealized holding gain</label>
              <strong className="trust-number">
                {money(data.summary.totalGain)}
              </strong>
              <small>
                Current value minus reported remaining cost; excludes realized
                gains and withdrawals.
              </small>
            </section>
          </div>
          {!holdingsOnly && (
            <section className="trust-card">
              <h2>History before performance</h2>
              <p>
                Period returns, charts and portfolio XIRR require complete dated
                cash flows and valuations. They remain unavailable for this
                statement snapshot.
              </p>
              <Link href="/transactions">Review imported transactions →</Link>
            </section>
          )}
          <section className="trust-card">
            <h2>
              Holdings <small>({data.holdings.length} positions)</small>
            </h2>
            <div className="trust-table">
              <table>
                <thead>
                  <tr>
                    <th>Scheme / folio</th>
                    <th>Category</th>
                    <th>Units</th>
                    <th>Reported cost</th>
                    <th>Value</th>
                    <th>Valuation date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holdings.map((h) => (
                    <tr key={h.id}>
                      <td>
                        {h.scheme_name}
                        <small>
                          {h.folio_label || "Legacy snapshot"} ·{" "}
                          {h.isin || h.amfi_code || h.scheme_code}
                        </small>
                      </td>
                      <td>{h.category || "Unknown"}</td>
                      <td>
                        {h.units.toLocaleString("en-IN", {
                          maximumFractionDigits: 4,
                        })}
                      </td>
                      <td>{money(h.invested_amount)}</td>
                      <td>{money(h.current_value)}</td>
                      <td>{h.nav_date || h.valuation_date || "Unknown"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <Link href="/intelligence">
            See evidence-based portfolio checks →
          </Link>
        </>
      )}
    </AppLayout>
  );
}
