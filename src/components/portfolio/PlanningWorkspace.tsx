"use client";
import { useState } from "react";
import Link from "next/link";
import AppLayout from "../AppLayout";
import { useResource, usePortfolio } from "./usePortfolio";
import { money } from "@/lib/portfolio/format";
import {
  emptyPlan,
  validatePlan,
  goalProgress,
  nextSipDate,
  allocationScenario,
  type PlanKind,
  type PlanData,
  type Goal,
  type Sip,
  type Risk,
} from "@/lib/planning/model";
const names = {
  goals: "Give your wealth a purpose.",
  risk: "Your investment perspective.",
  sips: "Make room for discipline.",
  targets: "Explore your allocation.",
};
type Payload = PlanData[PlanKind];
export default function PlanningWorkspace({ kind }: { kind: PlanKind }) {
  const resource = useResource<{ payload: Payload; revision: number }>(
    "/api/plans?kind=" + kind,
  );
  const portfolio = usePortfolio();
  const [draft, setDraft] = useState<Payload | null>(null),
    [revision, setRevision] = useState<number | null>(null),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const payload = draft ?? resource.data?.payload ?? emptyPlan(kind),
    today = new Date().toISOString().slice(0, 10);
  function stage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget),
      value = (key: string) => String(form.get(key) || ""),
      num = (key: string) => Number(value(key));
    try {
      let next: Payload;
      if (kind === "risk")
        next = {
          preferences: {
            horizonYears: num("horizon"),
            liquidityMonths: num("liquidity"),
            lossTolerance: value("tolerance") as Risk["lossTolerance"],
            experience: value("experience") as Risk["experience"],
            debtComfort: form.get("debt") === "on",
          },
        };
      else if (kind === "targets")
        next = {
          items: ["Equity", "Debt", "Hybrid", "Gold", "Unknown"]
            .filter((c) => value(c) !== "")
            .map((category) => ({ category, percent: num(category) })),
        };
      else {
        const item =
          kind === "goals"
            ? {
                id: crypto.randomUUID(),
                name: value("name"),
                target: num("target"),
                allocated: num("allocated"),
                targetDate: value("date"),
                monthly: num("monthly"),
              }
            : {
                id: crypto.randomUUID(),
                name: value("name"),
                amount: num("amount"),
                day: num("day"),
                startDate: value("start"),
                endDate: value("end") || null,
                status: value("status"),
              };
        next = {
          items: [...("items" in payload ? payload.items : []), item],
        } as Payload;
      }
      setDraft(validatePlan(kind, next));
      setDirty(true);
      setNotice(
        "Changes are staged locally. Save to keep them in your account.",
      );
      if (kind === "goals" || kind === "sips") e.currentTarget.reset();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Check your inputs.");
    }
  }
  async function save() {
    if (!resource.data) return;
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            payload,
            revision: revision ?? resource.data.revision,
          }),
        }),
        body = await res.json();
      if (!res.ok) throw new Error(body.error || "Save failed.");
      setDraft(body.payload);
      setRevision(body.revision);
      setDirty(false);
      setNotice("Saved to your private account.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  function remove(id: string) {
    if (busy) return;
    setDirty(true);
    if ("items" in payload)
      setDraft({
        items: payload.items.filter((r) => "id" in r && r.id !== id),
      } as Payload);
    setNotice("Removal staged locally. Save to confirm it.");
  }
  const goals = kind === "goals" ? (payload as PlanData["goals"]).items : [],
    sips = kind === "sips" ? (payload as PlanData["sips"]).items : [],
    targets = kind === "targets" ? (payload as PlanData["targets"]).items : [];
  const preferences =
    kind === "risk" ? (payload as PlanData["risk"]).preferences : null;
  const scenario = allocationScenario(portfolio.data?.holdings || [], targets);
  return (
    <AppLayout>
      <span className="fk-kicker">FolioKey / Your planning workspace</span>
      <h1>{names[kind]}</h1>
      <p>
        {kind === "risk"
          ? "Record your preferences. This is not a validated risk score or suitability recommendation."
          : kind === "sips"
            ? "Track schedules you enter. FolioKey does not create or verify bank mandates."
            : kind === "targets"
              ? "Set your own category targets and inspect the arithmetic before any decision."
              : "Set targets and contributions using your own inputs. Money is not automatically assigned from your holdings."}
      </p>
      {resource.loading ? (
        <p role="status">Loading saved planning…</p>
      ) : resource.error ? (
        <div className="trust-notice" role="alert">
          {resource.error} You can explore the form locally; saving is
          unavailable.{" "}
          <button
            onClick={() => {
              setDraft(null);
              setRevision(null);
              setDirty(false);
              resource.retry();
            }}
          >
            Retry loading
          </button>
        </div>
      ) : null}
      <div className="trust-actions">
        <button onClick={save} disabled={!resource.data || busy || !dirty}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={() => {
            setDraft(null);
            setRevision(null);
            setDirty(false);
            resource.retry();
            setNotice("Reloading saved planning.");
          }}
          disabled={busy}
        >
          Reload saved version
        </button>
        <Link href="/profile">Account preferences →</Link>
      </div>
      <p role="status">{notice}</p>
      <div className="fk-two-col">
        <section className="trust-card">
          <span className="fk-kicker">Your inputs</span>
          <h2>
            {kind === "goals"
              ? "Add a goal"
              : kind === "sips"
                ? "Add a schedule"
                : kind === "targets"
                  ? "Set category targets"
                  : "Record your preferences"}
          </h2>
          <form
            onSubmit={stage}
            className="fk-planning-form"
            key={
              kind === "risk"
                ? JSON.stringify(preferences)
                : kind === "targets"
                  ? JSON.stringify(targets)
                  : kind
            }
          >
            {(kind === "goals" || kind === "sips") && (
              <label>
                Name
                <input
                  name="name"
                  maxLength={100}
                  required
                  placeholder={
                    kind === "goals"
                      ? "Your goal name"
                      : "Fund or schedule label"
                  }
                />
              </label>
            )}
            {kind === "goals" && (
              <>
                <NumberField
                  name="target"
                  label="Target amount (₹)"
                  min="0.01"
                />
                <NumberField
                  name="allocated"
                  label="Amount you have earmarked (₹)"
                  min="0"
                />
                <label>
                  Target date
                  <input
                    type="date"
                    name="date"
                    min={today}
                    max="2200-12-31"
                    required
                  />
                </label>
                <NumberField
                  name="monthly"
                  label="Planned monthly contribution (₹)"
                  min="0"
                />
              </>
            )}
            {kind === "sips" && (
              <>
                <NumberField
                  name="amount"
                  label="Planned monthly amount (₹)"
                  min="0.01"
                />
                <NumberField
                  name="day"
                  label="Day of month (1–28)"
                  min="1"
                  max="28"
                  step="1"
                />
                <label>
                  Start date
                  <input
                    type="date"
                    name="start"
                    min="1900-01-01"
                    max="2200-12-31"
                    required
                  />
                </label>
                <label>
                  End date (optional)
                  <input
                    type="date"
                    name="end"
                    min="1900-01-01"
                    max="2200-12-31"
                  />
                </label>
                <label>
                  Schedule status
                  <select name="status">
                    <option value="planned">Planned by me</option>
                    <option value="paused">Paused by me</option>
                  </select>
                </label>
              </>
            )}
            {kind === "targets" && (
              <>
                {["Equity", "Debt", "Hybrid", "Gold", "Unknown"].map((c) => (
                  <NumberField
                    key={c}
                    name={c}
                    label={c + " target (%)"}
                    min="0"
                    max="100"
                    required={false}
                    initial={targets.find((t) => t.category === c)?.percent}
                  />
                ))}
                <p className="fk-caption">
                  Targets must total 100%. Blank categories mean a zero target.
                  A zero target is your scenario input, not a recommendation to
                  sell.
                </p>
              </>
            )}
            {kind === "risk" && (
              <>
                <NumberField
                  name="horizon"
                  label="Investment horizon (years)"
                  min="1"
                  max="50"
                  initial={preferences?.horizonYears}
                />
                <NumberField
                  name="liquidity"
                  label="Months before this money may be needed"
                  min="0"
                  max="120"
                  initial={preferences?.liquidityMonths}
                />
                <label>
                  Loss tolerance
                  <select
                    name="tolerance"
                    defaultValue={preferences?.lossTolerance || ""}
                    required
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Investment experience
                  <select
                    name="experience"
                    defaultValue={preferences?.experience || ""}
                    required
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option value="new">New to investing</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="debt"
                    defaultChecked={preferences?.debtComfort || false}
                  />{" "}
                  I understand that debt funds also carry risks.
                </label>
              </>
            )}
            <button disabled={busy || resource.loading}>
              {kind === "goals" || kind === "sips"
                ? "Add to my plan"
                : "Apply my inputs"}
            </button>
          </form>
        </section>
        <section className="trust-card">
          <span className="fk-kicker">Your plan / Source: you</span>
          <h2>
            {kind === "targets"
              ? "Snapshot versus your targets"
              : "Your planning detail"}
          </h2>
          {kind === "goals" && (
            <>
              <p>
                Contribution-only illustration: 0% investment return and no
                inflation adjustment. Earmarked amounts are self-reported and
                may overlap; no portfolio assets are reserved.
              </p>
              {goals.length ? (
                goals.map((g) => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    today={today}
                    remove={() => remove(g.id)}
                  />
                ))
              ) : (
                <p>No goals entered.</p>
              )}
            </>
          )}
          {kind === "sips" && (
            <>
              <strong className="trust-number">
                {money(
                  sips
                    .filter((s) => nextSipDate(s, today))
                    .reduce((sum, s) => sum + s.amount, 0),
                )}
              </strong>
              <p>
                Monthly amount across planned schedules with a future date; no
                debit or mandate confirmation.
              </p>
              {sips.map((s) => (
                <SipCard
                  key={s.id}
                  sip={s}
                  today={today}
                  remove={() => remove(s.id)}
                />
              ))}
              {!sips.length && (
                <p>
                  No schedules entered. Historical SIP purchases do not
                  establish an active mandate.
                </p>
              )}
            </>
          )}
          {kind === "risk" &&
            (preferences ? (
              <>
                <p>
                  Horizon: {preferences.horizonYears} years · liquidity need:{" "}
                  {preferences.liquidityMonths} months · self-reported loss
                  tolerance: {preferences.lossTolerance}.
                </p>
                <p>
                  No risk category or fund suitability has been inferred. A
                  reviewed assessment also needs financial capacity, liabilities
                  and goals.
                </p>
              </>
            ) : (
              <p>No preferences recorded.</p>
            ))}
          {kind === "targets" && (
            <>
              <p>{scenario.reason}</p>
              {portfolio.error && (
                <p role="alert">
                  Portfolio could not be loaded. Retry from the dashboard.
                </p>
              )}
              {scenario.available && (
                <div
                  className="trust-table"
                  role="region"
                  tabIndex={0}
                  aria-label="Allocation scenario"
                >
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Category",
                          "Current share",
                          "Your target",
                          "Value difference",
                        ].map((t) => (
                          <th scope="col" key={t}>
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.rows.map((r) => (
                        <tr key={r.category}>
                          <td>{r.category}</td>
                          <td>{r.currentPercent.toFixed(1)}%</td>
                          <td>{r.targetPercent.toFixed(1)}%</td>
                          <td>{money(r.difference)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="fk-caption">
                Values may span dates. A positive difference means more value in
                your scenario; it is not an order. Tax, exit loads and trading
                are unavailable.
              </p>
            </>
          )}
        </section>
      </div>
      <p className="fk-caption">
        Saved plans are private to your account. No external provider or AI
        model receives these inputs.
      </p>
    </AppLayout>
  );
}
function NumberField({
  name,
  label,
  min,
  max = "1000000000000",
  step = "0.01",
  initial,
  required = true,
}: {
  name: string;
  label: string;
  min: string;
  max?: string;
  step?: string;
  initial?: number;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        defaultValue={initial ?? ""}
        required={required}
      />
    </label>
  );
}
function GoalCard({
  goal: g,
  today,
  remove,
}: {
  goal: Goal;
  today: string;
  remove: () => void;
}) {
  const p = goalProgress(g, today);
  return (
    <article className="fk-plan-item">
      <h3>{g.name}</h3>
      <p>
        {money(g.allocated)} earmarked / {money(g.target)} target by{" "}
        {g.targetDate}
      </p>
      <meter
        aria-label={g.name + " funding progress"}
        max={100}
        value={p.progress}
      />
      <p>
        Gap: {money(p.gap)} · full months: {p.months} · contribution-only
        monthly requirement: {money(p.requiredMonthly)}
      </p>
      <p>
        Your planned {money(g.monthly)} monthly would reach{" "}
        {money(p.contributionOnlyValue)} with zero assumed return.
      </p>
      <button onClick={remove}>Remove goal</button>
    </article>
  );
}
function SipCard({
  sip: s,
  today,
  remove,
}: {
  sip: Sip;
  today: string;
  remove: () => void;
}) {
  return (
    <article className="fk-plan-item">
      <h3>{s.name}</h3>
      <p>
        {money(s.amount)} monthly · {s.status} · next planned date:{" "}
        {nextSipDate(s, today) || "None"}
      </p>
      <p>
        Calendar date only; no business-day adjustment or payment confirmation.
      </p>
      <button onClick={remove}>Remove schedule</button>
    </article>
  );
}
