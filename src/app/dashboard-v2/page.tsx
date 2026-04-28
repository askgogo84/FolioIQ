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

  if (!holdings.length) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] text-[#111827]">
        <AppHeader />
        <section className="mx-auto max-w-md px-5 py-10">
          <div className="rounded-[2rem] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111827] text-2xl text-white">📊</div>
            <h1 className="text-3xl font-black tracking-tight">Add your portfolio first</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Upload your mutual fund statement and FolioIQ will show what to fix, keep and add next.</p>
            <Link href="/upload" className="mt-7 inline-flex rounded-full bg-[#111827] px-7 py-3 text-sm font-black text-white">Upload portfolio</Link>
          </div>
        </section>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pb-28 text-[#111827]">
      <AppHeader />

      <section className="mx-auto max-w-md px-4 py-5 md:max-w-6xl md:px-8">
        <div className="mb-4">
          <div className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-600">Portfolio Intelligence</div>
          <h1 className="mt-1 text-3xl font-black tracking-tight md:text-5xl">Your MF dashboard</h1>
          <div className="mt-4 flex gap-3">
            <Link href="/upload" className="rounded-full bg-[#111827] px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10">Upload new</Link>
            <Link href="/explore" className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm">Explore</Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{decision.riskStyle} portfolio</div>
          <h2 className="text-3xl font-black leading-tight tracking-tight">{decision.plainEnglishVerdict}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-500">{decision.simpleSummary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <div className="rounded-[1.5rem] bg-[#070b1d] p-5 text-white md:col-span-1">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-white/45">Health</div>
              <div className="mt-3 text-5xl font-black">{decision.healthScore}</div>
              <div className="mt-1 text-sm text-white/55">out of 100</div>
            </div>
            <div className="grid gap-3 md:col-span-4 md:grid-cols-4">
              <Metric label="Current value" value={money(decision.money.current)} />
              <Metric label="Gain" value={`${decision.money.returnPct >= 0 ? "+" : ""}${decision.money.returnPct.toFixed(1)}%`} tone="text-emerald-600" />
              <Metric label="Confidence" value={`${decision.confidenceScore}%`} />
              <Metric label="Annual leakage" value={money(decision.estimatedAnnualLeakage)} tone="text-red-600" />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] bg-gradient-to-br from-[#071021] to-[#111827] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.20)]">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-emerald-400">Start Here</div>
          <div className="mt-5 text-2xl font-black leading-tight">{topAction?.name || "Portfolio looks manageable"}</div>
          <p className="mt-3 text-sm leading-6 text-white/65">{topAction?.action || decision.weeklyAction}</p>
          {topAction?.impact && <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm font-semibold leading-6 text-white/90">Impact: {topAction.impact}</div>}
          <button className="mt-6 w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-[#111827]">Review action</button>
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.07)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xl font-black">Trust check</div>
              <p className="text-xs text-slate-400">How reliable this analysis is</p>
            </div>
            <div className="text-2xl font-black text-emerald-600">{decision.healthScore}</div>
          </div>
          <div className="space-y-3 text-sm">
            <Trust label="Funds detected" value={meta ? `${meta.savedCount}/${meta.expectedCount}` : `${holdings.length}`} />
            <Trust label="Data confidence" value={meta?.confidence || "High"} />
            <Trust label="Checks applied" value="Cost, overlap, risk, gaps" />
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] bg-white p-6 shadow-[0_22px_70px_rgba(15,23,42,0.07)]">
          <div className="text-xl font-black">Why FolioIQ decided this</div>
          <div className="mt-4 space-y-3">
            {decision.logic.slice(0, 3).map((l: string, i: number) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">{l}</div>
            ))}
          </div>
        </div>

        <ThreeColumns fix={decision.review} keep={decision.keep} explore={decision.add} />
      </section>

      <BottomNav />
    </main>
  )
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4 md:max-w-6xl md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#070b1d] text-sm font-black text-white">F</div>
          <div className="text-lg font-black">FolioIQ</div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/upload" className="hidden rounded-full bg-[#111827] px-4 py-2 text-xs font-black text-white md:inline-flex">Upload</Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">G</div>
        </div>
      </div>
    </header>
  )
}

function Metric({ label, value, tone = "text-[#111827]" }: any) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className={`mt-2 text-xl font-black ${tone}`}>{value}</div>
    </div>
  )
}

function Trust({ label, value }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-[#111827]">{value}</span>
    </div>
  )
}

function ThreeColumns({ fix, keep, explore }: any) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-3">
      <ActionColumn title="Fix Now" tone="red" subtitle="Issues hurting returns" items={fix} cta="View All Issues" />
      <ActionColumn title="Keep" tone="green" subtitle="Good funds, stay invested" items={keep} cta="View All" />
      <ActionColumn title="Explore" tone="blue" subtitle="Smart additions" items={explore} cta="Explore Funds" />
    </div>
  )
}

function ActionColumn({ title, subtitle, items, cta, tone }: any) {
  const color = tone === "red" ? "text-red-500 bg-red-50" : tone === "green" ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"
  const dot = tone === "red" ? "bg-red-500" : tone === "green" ? "bg-emerald-600" : "bg-blue-600"
  return (
    <div className="rounded-[1.5rem] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)]">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-black ${color}`}>!</div>
        <div>
          <div className="text-xl font-black">{title}</div>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
        {items?.slice(0, 4).map((item: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <div>
                <div className="text-sm font-black leading-tight">{item.name}</div>
                <div className="mt-1 text-xs text-slate-400">{item.reason}</div>
              </div>
            </div>
            <span className="text-lg text-slate-400">›</span>
          </div>
        ))}
      </div>
      <button className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-black ${color}`}>{cta} <span className="ml-2">›</span></button>
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-4 py-3 text-center text-xs font-bold text-slate-400">
        <Link href="/dashboard-v2" className="text-emerald-600">⌂<div>Dashboard</div></Link>
        <Link href="/explore">◌<div>Explore</div></Link>
        <Link href="/upload" className="-mt-6"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-xl">+</div><div className="mt-1 text-slate-500">Upload</div></Link>
        <Link href="/calculators/sip">▦<div>Calculators</div></Link>
        <Link href="/home">♙<div>Profile</div></Link>
      </div>
    </nav>
  )
}
