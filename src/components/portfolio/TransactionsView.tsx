"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { useResource } from "./usePortfolio";
import { LoadingState, ErrorState } from "./Evidence";
import { money } from "@/lib/portfolio/format";
type Tx = {
  id: string;
  scheme_name: string;
  transaction_date: string | null;
  transaction_type: string;
  units: number | null;
  amount: number | null;
};
export default function TransactionsView() {
  const { data, error, loading, retry } = useResource<{
    transactions: Tx[];
    coverage: string;
  }>("/api/portfolio/transactions");
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState("all");
  const rows = data?.transactions || [];
  const types = Array.from(new Set(rows.map((r) => r.transaction_type))).sort();
  const shown = rows.filter(
    (r) =>
      (kind === "all" || r.transaction_type === kind) &&
      r.scheme_name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AppLayout>
      <span className="fk-kicker">The source behind the snapshot</span>
      <h1>Follow your money.</h1>
      <p>Explore the transaction records supplied by your latest statement.</p>
      {error ? (
        <ErrorState message={error} retry={retry} />
      ) : loading || !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="trust-notice">
            <strong>
              Statement records · not a reconciled lifetime ledger
            </strong>
            <p>{data.coverage}</p>
          </div>
          <section className="trust-card">
            <div className="fk-section-head">
              <h2>Your records.</h2>
              <span className="fk-pill">
                {shown.length} / {rows.length} shown
              </span>
            </div>
            <div className="fk-filters">
              <label>
                Find a fund
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search statement records"
                />
              </label>
              <label>
                Transaction label
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="all">All labels</option>
                  {types.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            {shown.length ? (
              <div
                className="trust-table"
                tabIndex={0}
                role="region"
                aria-label="Statement transaction table"
              >
                <table>
                  <thead>
                    <tr>
                      {[
                        "Date",
                        "Scheme",
                        "Source label",
                        "Units",
                        "Amount",
                      ].map((h) => (
                        <th scope="col" key={h}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r) => (
                      <tr key={r.id}>
                        <td>{r.transaction_date || "Unknown"}</td>
                        <td>{r.scheme_name}</td>
                        <td>{r.transaction_type}</td>
                        <td>{r.units ?? "Unknown"}</td>
                        <td>
                          {money(r.amount === null ? null : Number(r.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="fk-chart-empty">
                <h3>
                  {rows.length
                    ? "No matching records"
                    : "Your transaction history starts with a statement."}
                </h3>
                <p>Missing records do not mean there were no transactions.</p>
                <Link href="/upload" className="trust-button">
                  Import a statement
                </Link>
              </div>
            )}
          </section>
          <div className="fk-action-grid">
            <Link className="fk-action" href="/sips">
              <h3>Looking for SIPs?</h3>
              <p>Historical installments do not prove an active mandate.</p>
            </Link>
            <Link className="fk-action" href="/dashboard">
              <h3>Return to the bigger picture</h3>
              <p>View your snapshot, coverage and allocations.</p>
            </Link>
          </div>
        </>
      )}
    </AppLayout>
  );
}
