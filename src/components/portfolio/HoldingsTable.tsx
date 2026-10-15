"use client";
import { useState } from "react";
import type { Position } from "@/lib/intelligence/types";
import { money } from "@/lib/portfolio/format";
import Pagination from "./Pagination";
export default function HoldingsTable({ rows }: { rows: Position[] }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [sort, setSort] = useState("value"),
    [page, setPage] = useState(0);
  const categories = Array.from(
    new Set(rows.map((r) => r.category || "Unknown")),
  ).sort();
  const shown = rows
    .filter(
      (r) =>
        (category === "all" || (r.category || "Unknown") === category) &&
        [r.scheme_name, r.amc, r.isin, r.folio_label]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.scheme_name.localeCompare(b.scheme_name)
        : (b.current_value ?? -1) - (a.current_value ?? -1),
    );
  const currentPage = Math.min(
    page,
    Math.max(0, Math.ceil(shown.length / 50) - 1),
  );
  return (
    <section className="trust-card">
      <div className="fk-section-head">
        <div>
          <span className="fk-kicker">The detail matters</span>
          <h2>Your holdings.</h2>
        </div>
        <span className="fk-pill">
          {shown.length} / {rows.length} positions
        </span>
      </div>
      <div className="fk-filters">
        <label>
          Find a holding
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Fund, AMC, ISIN or masked folio"
            type="search"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(0);
            }}
          >
            <option value="value">Value: highest first</option>
            <option value="name">Fund name</option>
          </select>
        </label>
      </div>
      <p className="fk-caption">
        Filters affect this list only; summary cards describe the full snapshot.
      </p>
      {shown.length ? (
        <div
          className="trust-table"
          tabIndex={0}
          role="region"
          aria-label="Holdings table, scroll horizontally for all columns"
        >
          <table>
            <thead>
              <tr>
                {[
                  "Scheme / folio",
                  "Category",
                  "Units",
                  "Reported cost",
                  "Value",
                  "Valuation date",
                ].map((h) => (
                  <th scope="col" key={h}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown
                .slice(currentPage * 50, (currentPage + 1) * 50)
                .map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.scheme_name}</strong>
                      <small>
                        {h.folio_label || "Legacy snapshot"} ·{" "}
                        {h.isin || h.amfi_code || h.scheme_code || "Unmapped"}
                      </small>
                    </td>
                    <td>{h.category || "Unknown"}</td>
                    <td>
                      {h.units?.toLocaleString("en-IN", {
                        maximumFractionDigits: 4,
                      }) ?? "Unknown"}
                    </td>
                    <td>{money(h.invested_amount)}</td>
                    <td>{money(h.current_value)}</td>
                    <td>{h.valuation_date || h.nav_date || "Unknown"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p role="status">No holdings match these filters.</p>
      )}
      <Pagination
        page={currentPage}
        total={shown.length}
        onChange={setPage}
        label="Holdings"
      />
    </section>
  );
}
