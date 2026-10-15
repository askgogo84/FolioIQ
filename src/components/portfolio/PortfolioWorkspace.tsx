"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { usePortfolio } from "./usePortfolio";
import { TrustStrip, Readiness, LoadingState, ErrorState } from "./Evidence";
import AllocationChart from "./AllocationChart";
import InsightQueue from "./InsightQueue";
import HoldingsTable from "./HoldingsTable";
import LedgerPanel from "./LedgerPanel";
import { money } from "@/lib/portfolio/format";
export default function PortfolioWorkspace({
  view = "overview",
}: {
  view?: "overview" | "holdings" | "intelligence";
}) {
  const { data, error, loading, retry } = usePortfolio();
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function refresh() {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/nav-refresh", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Refresh unavailable.");
      setNotice(d.message || "Available NAVs checked.");
      retry();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Refresh unavailable.");
    } finally {
      setBusy(false);
    }
  }
  const a = data?.analysis;
  return (
    <AppLayout>
      <div className="fk-page-heading">
        <div>
          <span className="fk-kicker">
            FolioKey / Your private wealth workspace
          </span>
          <h1>
            {view === "holdings"
              ? "Every holding. In perspective."
              : view === "intelligence"
                ? "Know more. Decide with care."
                : "Your wealth, in perspective."}
          </h1>
          <p>
            A considered view of what you own, what we know, and what needs a
            closer look.
          </p>
        </div>
        <Link href="/upload" className="trust-button">
          Update portfolio ↗
        </Link>
      </div>
      {error ? (
        <ErrorState message={error} retry={retry} />
      ) : loading || !data || !a ? (
        <LoadingState />
      ) : !data.connected ? (
        <>
          <section className="fk-hero trust-card">
            <span className="fk-kicker">Begin with your evidence</span>
            <h2>
              A clearer picture starts
              <br />
              with your statement.
            </h2>
            <p>
              Import a CAS, review each position and confirm what belongs in
              your portfolio. Your charts will appear when actual values are
              available.
            </p>
            <div className="trust-actions">
              <Link href="/upload" className="trust-button">
                Import your portfolio
              </Link>
              <Link href="/connect">Explore connection options →</Link>
            </div>
          </section>
          <Readiness analysis={a} />
        </>
      ) : (
        <>
          <TrustStrip analysis={a} />
          <div className="fk-metrics">
            <section className="trust-card fk-value-card">
              <span className="fk-kicker">Reported / NAV-marked value</span>
              <strong className="trust-number">
                {money(a.summary.totalCurrent)}
              </strong>
              <small>
                {a.summary.totalCurrent === null
                  ? money(a.summary.knownCurrent) +
                    " known subtotal; not the whole portfolio."
                  : "Imported units · reported or dated NAV values"}
              </small>
              <div className="fk-value-footer">
                <span>
                  {a.summary.positions} positions · {a.summary.schemes}{" "}
                  identifiers
                </span>
                <button onClick={refresh} disabled={busy}>
                  {busy ? "Checking…" : "Refresh NAVs ↻"}
                </button>
              </div>
            </section>
            <section className="trust-card">
              <span className="fk-kicker">Reported remaining cost</span>
              <strong className="trust-number">
                {money(a.summary.totalInvested)}
              </strong>
              <small>
                {a.summary.costed} / {a.summary.positions} positions have cost.
                This is not lifetime money invested.
              </small>
            </section>
            <section className="trust-card">
              <span className="fk-kicker">Unrealized holding gain</span>
              <strong className="trust-number">
                {money(a.summary.totalGain)}
              </strong>
              <small>
                Value less reported remaining cost. Excludes realized gains,
                payouts and withdrawals.
              </small>
            </section>
          </div>
          {notice && (
            <p className="trust-notice" role="status">
              {notice}
            </p>
          )}
          <p className="fk-caption">
            {a.quality.mixedDates ? "Values span different dates. " : ""}
            {a.quality.dated < a.summary.positions
              ? "Some valuation dates are unknown. "
              : ""}
            Snapshot observations are not independently verified valuations or
            personalized investment advice.
            {a.nav.priced > 0
              ? " NAV refresh marks the last imported units; it does not verify subsequent account transactions or balances."
              : ""}
          </p>
          {view === "holdings" ? <HoldingsTable rows={data.holdings} /> : null}
          <div className="fk-two-col">
            <AllocationChart
              title="Category allocation"
              data={a.allocation.category}
              donut
            />
            <AllocationChart
              title="AMC concentration"
              data={a.allocation.amc}
            />
          </div>
          <AllocationChart
            title="Category concentration"
            data={a.allocation.category}
          />
          {view !== "holdings" && <InsightQueue findings={a.findings} />}
          <LedgerPanel />
          <div className="fk-action-grid">
            {[
              [
                "/transactions",
                "Follow the money",
                "Review the records behind your statement.",
              ],
              [
                "/sips",
                "Make room for discipline",
                "Track schedules you enter and review their next planned dates.",
              ],
              [
                "/rebalance",
                "Plan with perspective",
                "Compare your snapshot with your own allocation targets.",
              ],
              [
                "/chat",
                "Ask about your data",
                "Explore verified snapshot facts with the portfolio guide.",
              ],
            ].map(([href, title, detail]) => (
              <Link className="fk-action" href={href} key={href}>
                <span aria-hidden="true">↗</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </Link>
            ))}
          </div>
          {view === "overview" && <HoldingsTable rows={data.holdings} />}
          <p className="fk-caption">
            Snapshot checks evaluated {a.asOf} · {a.method}. Statement XIRR has
            separate reconciliation gates. No continuous historical performance,
            tax estimate or AI recommendation is generated.
          </p>
        </>
      )}
    </AppLayout>
  );
}
