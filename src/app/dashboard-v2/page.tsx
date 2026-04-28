"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { analysePortfolio, money } from "@/lib/folioiq/decision-engine"

export default function Dashboard() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem("folioiq_h")
    const m = localStorage.getItem("folioiq_meta")
    if (data) setHoldings(JSON.parse(data))
    if (m) setMeta(JSON.parse(m))
  }, [])

  const decision = useMemo(() => analysePortfolio(holdings), [holdings])
  const topAction = decision.review?.[0]
  const healthTone = decision.healthScore >= 75 ? "text-emerald-600" : decision.healthScore >= 55 ? "text-amber-600" : "text-red-600"

  if (!holdings.length) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
        <Topbar />
        <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-white">📊</div>
            <h1 className="text-4xl font-black tracking-tight">Add your portfolio first</h1>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">Upload your mutual fund statement and FolioIQ will show what to fix, keep and add next.</p>
            <Link href="/upload" className="mt-7 inline-flex rounded-full bg-slate-950 px-7 py-3 text-sm font-black text-white">Upload portfolio</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Topbar />

      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Portfolio Intelligence</div>
            <h1 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">Your MF dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/upload" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white">Upload new</Link>
            <Link href="/explore" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700">Explore</Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{decision.riskStyle} portfolio</div>
                <h2 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">{decision.plainEnglishVerdict}</h2>
                <p className="mt-4 text-base leading-7 text-slate-500">{decision.simpleSummary}</p>
              </div>
              <div className="min-w-[150px] rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Health</div>
                <div className="mt-3 text-5xl font-black">{decision.healthScore}</div>
                <div className="mt-1 text-sm text-white/55">out of 100</div>
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Current value" value={money(decision.money.current)} />
              <Stat label="Gain" value={`${decision.money.returnPct >= 0 ? "+" : ""}${decision.money.returnPct.toFixed(1)}%`} tone={decision.money.returnPct >= 0 ? "text-emerald-600" : "text-red-600"} />
              <Stat label="Confidence" value={`${decision.confidenceScore}%`} />
              <Stat label="Annual leakage" value={money(decision.estimatedAnnualLeakage)} tone="text-red-600" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Start here</div>
            <div className="mt-4 text-2xl font-black leading-tight">{topAction?.name || "Portfolio looks manageable"}</div>
            <p className="mt-3 text-sm leading-6 text-white/65">{topAction?.action || decision.weeklyAction}</p>
            {topAction?.impact && <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-semibold text-white/90">Impact: {topAction.impact}</div>}
            <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950">Review action</button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-black">Trust check</div>
                <p className="mt-1 text-sm text-slate-500">How reliable this analysis is</p>
              </div>
              <div className={`text-2xl font-black ${healthTone}`}>{decision.healthScore}</div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <Trust label="Funds detected" value={meta ? `${meta.savedCount}/${meta.expectedCount}` : `${holdings.length}`} />
              <Trust label="Data confidence" value={meta?.confidence || `${decision.confidenceScore}%`} />
              <Trust label="Checks applied" value="Cost, overlap, risk, gaps" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="text-lg font-black">Why FolioIQ decided this</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {decision.logic.slice(0, 4).map((l: string, i: number) => (
                <div key={i} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{l}</div>
              ))}
            </div>
          </div>
        </div>

        <Section title="Fix Now" subtitle="Highest impact cleanup actions" items={decision.review} intent="fix" />
        <Section title="Keep" subtitle="Hold these while fixing bigger issues" items={decision.keep} intent="keep" />
        <Section title="Explore" subtitle="Missing building blocks to consider" items={decision.add} intent="explore" />
      </section>
    </main>
  )
}

function Topbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">F</div>
          <div className="font-black">FolioIQ</div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-500 md:flex">
          <Link href="/explore">Mutual Funds</Link>
          <Link href="/upload">Upload</Link>
          <Link href="/dashboard-v2" className="text-slate-950">Dashboard</Link>
        </nav>
      </div>
    </header>
  )
}

function Stat({ label, value, tone = "text-slate-950" }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={`mt-2 text-xl font-black ${tone}`}>{value}</div>
    </div>
  )
}

function Trust({ label, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="font-black text-slate-950">{value}</span>
    </div>
  )
}

function Section({ title, subtitle, items, intent }: any) {
  if (!items?.length) return null
  const chip = intent === "fix" ? "bg-red-50 text-red-700" : intent === "keep" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
            <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${chip}`}>{item.priority || "Action"}</div>
            <div className="line-clamp-2 min-h-12 text-lg font-black leading-tight">{item.name}</div>
            <p className="mt-3 min-h-12 text-sm leading-6 text-slate-500">{item.reason}</p>
            <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-sm font-black leading-5 text-white">{item.action}</div>
            {item.impact && <p className="mt-3 text-xs leading-5 text-slate-500">Impact: {item.impact}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
