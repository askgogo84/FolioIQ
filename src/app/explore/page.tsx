"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

const funds = [
  ["HDFC Flexi Cap Fund", "Flexi Cap", "20.37%", "hdfc-flexi-cap-fund"],
  ["Parag Parikh Flexi Cap Fund", "Flexi Cap", "18.15%", "parag-parikh-flexi-cap-fund"],
  ["Motilal Oswal Midcap Fund", "Mid Cap", "22.89%", "motilal-oswal-midcap-fund"],
  ["Nippon India Small Cap Fund", "Small Cap", "25.10%", "nippon-india-small-cap-fund"],
  ["ICICI Prudential Bluechip Fund", "Large Cap", "16.42%", "icici-prudential-bluechip-fund"],
  ["SBI Contra Fund", "Contra", "19.40%", "sbi-contra-fund"],
  ["Axis ELSS Tax Saver Fund", "ELSS", "14.85%", "axis-elss-tax-saver-fund"],
]

const categories = [
  ["Large Cap Mutual Funds", "Stability from India's largest companies", "/category/large-cap"],
  ["Mid Cap Mutual Funds", "Growth from emerging leaders", "/category/mid-cap"],
  ["Small Cap Mutual Funds", "Higher growth with higher volatility", "/category/small-cap"],
  ["Flexi Cap Mutual Funds", "Flexible allocation across market caps", "/category/flexi-cap"],
]

const collections = ["Best SIP Funds", "High Return Funds", "ELSS Tax Saver", "Index Funds", "Debt Funds", "Low Risk Funds"]

export default function ExplorePage() {
  const [query, setQuery] = useState("")
  const filteredFunds = useMemo(() => funds.filter(([name, category]) => `${name} ${category}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-[#171a20]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-black text-white">F</div><div className="font-black">FolioIQ</div></Link>
          <nav className="hidden gap-6 text-sm font-bold text-slate-500 md:flex"><Link href="/explore" className="text-emerald-600">Mutual Funds</Link><Link href="/calculators/sip">Calculators</Link><Link href="/profile">Upload</Link><Link href="/dashboard-v2">Dashboard</Link></nav>
          <Link href="/profile" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">Upload</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 text-center md:py-16">
        <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">Mutual Fund Portfolio Analysis</h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-500">Explore mutual funds, upload your portfolio, and get decision-first insights on what to fix, keep and add next.</p>
        <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mutual funds, categories, AMC..." className="h-12 w-full rounded-xl px-4 text-sm font-semibold outline-none" />
        </div>
        <div className="mt-7 flex justify-center gap-3"><Link href="/profile" className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-black text-white shadow-xl shadow-emerald-600/20">Check your portfolio</Link><Link href="/dashboard-v2" className="rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-black">View dashboard</Link></div>

        <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] bg-[#243963] p-8 text-white shadow-[0_24px_80px_rgba(36,57,99,0.22)]"><div className="text-xs font-black uppercase tracking-[0.22em] text-white/50">Mutual Fund Portfolio</div><div className="mt-3 text-5xl font-black">0</div><p className="mt-3 text-white/75">No mutual fund investments found yet.</p><Link href="/profile" className="mt-6 inline-flex rounded-full bg-blue-500 px-6 py-3 text-sm font-black text-white">Auto track my mutual funds</Link></div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <h2 className="mb-6 text-center text-4xl font-black">1. Equity Mutual Funds</h2>
        <div className="grid gap-6 md:grid-cols-[1fr_.9fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 font-black">Top Mutual Funds</div><div className="space-y-3">{filteredFunds.map(([name, category, ret, slug]) => <div key={name} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"><Link href={`/mutual-funds/${slug}`}><div className="font-black">{name}</div><div className="text-sm text-slate-500">{category}</div></Link><div className="text-right"><div className="font-black text-emerald-600">{ret}</div><Link href={`/mutual-funds/${slug}`} className="mt-1 inline-flex rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-black text-white">View</Link></div></div>)}</div></div>
          <div className="grid gap-4 md:grid-cols-2">{categories.map(([title, text, href]) => <Link href={href} key={title} className="rounded-2xl bg-white p-5 shadow-sm"><div className="font-black">{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p><div className="mt-4 text-sm font-black text-blue-600">View all â†’</div></Link>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8"><h2 className="text-3xl font-black">Collections</h2><div className="mt-5 flex flex-wrap gap-3">{collections.map((c) => <span key={c} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black shadow-sm">{c}</span>)}</div></section>

      <section className="mx-auto max-w-6xl px-5 py-8"><h2 className="text-3xl font-black">Calculators</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Link href="/calculators/sip" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-2xl">ðŸ§®</div><div className="mt-2 text-xl font-black">SIP Calculator</div><p className="mt-2 text-sm text-slate-500">Estimate future wealth from monthly SIPs.</p></Link><Link href="/calculators/lumpsum" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="text-2xl">ðŸ’°</div><div className="mt-2 text-xl font-black">Lumpsum Calculator</div><p className="mt-2 text-sm text-slate-500">Estimate growth on one-time investments.</p></Link></div></section>

      <section className="mx-auto max-w-6xl px-5 py-8"><div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10"><div className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">FolioIQ Edge</div><h2 className="mt-3 max-w-2xl text-4xl font-black">Already invested elsewhere?</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/65">Upload your statement and see your health score, leakage, overlap, missing categories and next action.</p><Link href="/profile" className="mt-7 inline-flex rounded-full bg-white px-7 py-3 text-sm font-black text-slate-950">Upload portfolio</Link></div></section>
    </main>
  )
}
