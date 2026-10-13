"use client";
import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { money } from "@/components/PortfolioOverview";
type Tx = {
  id: string;
  scheme_name: string;
  transaction_date: string | null;
  transaction_type: string;
  units: number | null;
  amount: number | null;
};
export default function Page() {
  const [rows, setRows] = useState<Tx[]>([]),
    [message, setMessage] = useState("Loading transactions…");
  useEffect(() => {
    fetch("/api/portfolio/transactions")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setRows(d.transactions);
        setMessage(d.coverage);
      })
      .catch((e) => setMessage(e.message || "Transactions unavailable."));
  }, []);
  return (
    <AppLayout>
      <h1>Your transactions.</h1>
      <p role="status">{message}</p>
      <section className="trust-card">
        {rows.length ? (
          <div className="trust-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Scheme</th>
                  <th>Type</th>
                  <th>Units</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
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
          <p>No transaction records are available for the current snapshot.</p>
        )}
      </section>
    </AppLayout>
  );
}
