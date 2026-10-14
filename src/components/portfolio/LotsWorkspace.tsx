"use client";
import AppLayout from "../AppLayout";
import { useResource } from "./usePortfolio";
import { LoadingState, ErrorState } from "./Evidence";
import type { LotAssessment } from "@/lib/portfolio/lots";
import { money } from "@/lib/portfolio/format";
import LedgerPanel from "./LedgerPanel";
export default function LotsWorkspace() {
  const { data, error, loading, retry } = useResource<{
    lots: LotAssessment | null;
  }>("/api/portfolio/ledger");
  return (
    <AppLayout>
      <span className="fk-kicker">Source transactions / FIFO review</span>
      <h1>Understand your acquisition lots.</h1>
      <p>
        Reconcile purchases and redemptions before estimating any tax. This
        screen calculates source-amount differences only; tax liability remains
        unavailable.
      </p>
      {error ? (
        <ErrorState message={error} retry={retry} />
      ) : loading ? (
        <LoadingState />
      ) : !data?.lots ? (
        <section className="trust-card">
          <p>
            Import a detailed statement with opening balances and transaction
            history.
          </p>
        </section>
      ) : (
        <>
          <p className="trust-notice">{data.lots.method}</p>
          {data.lots.positions.map((p) => (
            <section className="trust-card" key={p.key}>
              <h2>{p.name}</h2>
              {!p.available ? (
                p.issues.map((i) => <p key={i}>{i}</p>)
              ) : (
                <>
                  <strong className="trust-number">
                    {money(p.realizedGain)}
                  </strong>
                  <p>
                    Recognized redemption proceeds less FIFO source acquisition
                    amounts. This is not taxable income or a complete tax
                    report.
                  </p>
                  <h3>Open source lots</h3>
                  {p.openLots.length ? (
                    <div
                      className="trust-table"
                      role="region"
                      tabIndex={0}
                      aria-label={p.name + " open lots"}
                    >
                      <table>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Remaining units</th>
                            <th scope="col">Source amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.openLots.map((l, i) => (
                            <tr key={l.date + ":" + i}>
                              <td>{l.date}</td>
                              <td>{l.units.toFixed(6)}</td>
                              <td>{money(l.sourceCost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No open lots within this statement.</p>
                  )}
                  <h3>Recognized redemptions</h3>
                  {p.realized.length ? (
                    <div
                      className="trust-table"
                      role="region"
                      tabIndex={0}
                      aria-label={p.name + " recognized redemptions"}
                    >
                      <table>
                        <thead>
                          <tr>
                            {[
                              "Date",
                              "Units",
                              "Proceeds",
                              "FIFO source cost",
                              "Difference",
                            ].map((t) => (
                              <th scope="col" key={t}>
                                {t}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {p.realized.map((r, i) => (
                            <tr key={r.date + ":" + i}>
                              <td>{r.date}</td>
                              <td>{r.units}</td>
                              <td>{money(r.proceeds)}</td>
                              <td>{money(r.sourceCost)}</td>
                              <td>{money(r.difference)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No recognized redemptions in this statement.</p>
                  )}
                </>
              )}
            </section>
          ))}
        </>
      )}
      <LedgerPanel />
    </AppLayout>
  );
}
