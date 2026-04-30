"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { analysePortfolio, money } from "@/lib/folioiq/decision-engine"

export default function Dashboard() {
  const [holdings, setHoldings] = useState<any[]>([])

  useEffect(() => {
    const data = localStorage.getItem("folioiq_h")
    if (data) setHoldings(JSON.parse(data))
  }, [])

  const decision = useMemo(() => analysePortfolio(holdings), [holdings])

  if (!holdings.length) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-5 py-10 text-[#111827]">
        <div className="mx-auto max-w-3xl rounded-[32px] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-xl font-black text-white">F</div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">FolioIQ Money Coach</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Upload once. Know what to fix.</h1>
          <p className="mt-4 text-base leading-7 text-slate-500">Upload your mutual fund portfolio and FolioIQ will show what to fix, keep and explore.</p>
          <Link href="/profile" className="mt-8 inline-flex rounded-full bg-[#111827] px-8 py-4 text-sm font-black text-white">Upload portfolio</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 pb-20 text-[#111827] md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827] text-sm font-black text-white">F</div>
            <div>
              <div className="text-lg font-black">FolioIQ</div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Money Coach</div>
            </div>
          </div>
          <Link href="/profile" className="rounded-full bg-[#111827] px-5 py-2.5 text-sm font-black text-white">Upload</Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-xl md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">Portfolio Snapshot</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight md:text-5xl">{decision.plainEnglishVerdict || decision.verdict}</h1>
            <p className="mt-4 text-base leading-7 text-slate-500">{decision.simpleSummary}</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Current value" value={money(decision.money.current)} />
              <Metric label="Gain" value={`${decision.money.returnPct >= 0 ? "+" : ""}${decision.money.returnPct.toFixed(1)}%`} />
              <Metric label="Health" value={`${decision.healthScore}/100`} />
              <Metric label="Funds" value={holdings.length} />
            </div>
          </div>

          <div className="rounded-[32px] bg-[#071021] p-6 text-white shadow-xl md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Start Here</p>
            <h2 className="mt-4 text-3xl font-black leading-tight">{decision.review?.[0]?.name || "Portfolio looks manageable"}</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">{decision.review?.[0]?.action || decision.weeklyAction}</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <ActionColumn title="Fix Now" subtitle="Highest priority" items={decision.review} tone="red" />
          <ActionColumn title="Keep" subtitle="Okay for now" items={decision.keep} tone="green" />
          <ActionColumn title="Explore" subtitle="Missing building blocks" items={decision.add} tone="blue" />
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-black">Why this recommendation?</h2>
          <p className="mt-2 text-sm text-slate-500">FolioIQ checks hidden cost, overlap, risk concentration and missing portfolio building blocks.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(decision.logic || []).slice(0, 4).map((item: string, index: number) => (
              <div key={index} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black text-[#111827]">{value}</div>
    </div>
  )
}

function ActionColumn({ title, subtitle, items, tone }: any) {
  const dot = tone === "red" ? "bg-red-500" : tone === "green" ? "bg-emerald-600" : "bg-blue-600"
  return (
    <div className="rounded-[28px] bg-white p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-black">{title}</div>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{items?.length || 0}</div>
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        {items?.length ? items.slice(0, 4).map((item: any, i: number) => (
          <details key={i} className="rounded-2xl bg-slate-50 p-4" open={i === 0}>
            <summary className="cursor-pointer list-none">
              <div className="flex items-start gap-3">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <div>
                  <div className="text-sm font-black leading-tight">{item.name}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{item.reason}</div>
                </div>
              </div>
            </summary>
            <div className="mt-3 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-slate-700">{item.action}</div>
            {item.impact && <div className="mt-2 text-xs leading-5 text-slate-500">Impact: {item.impact}</div>}
          </details>
        )) : <p className="text-sm text-slate-400">Nothing urgent.</p>}
      </div>
    </div>
  )
}
