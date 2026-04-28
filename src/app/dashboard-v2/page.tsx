// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

const USER_ID = "demo-user-1"

function fmtC(n: number) {
  if (!n || Number.isNaN(Number(n))) return "₹0"
  const a = Math.abs(Number(n))
  const s = Number(n) < 0 ? "-" : ""
  if (a >= 10000000) return `${s}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(2)}L`
  return `${s}₹${a.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function fmtP(n: number, dp = 1) {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(dp)}%`
}

function scorePortfolio(holdings: any[]) {
  if (!holdings.length) return 0
  const countScore = Math.min(25, holdings.length * 5)
  const positive = holdings.filter((h) => Number(h.currentValue || 0) >= Number(h.investedAmount || 0)).length
  const returnScore = Math.round((positive / holdings.length) * 35)
  const amcCount = new Set(holdings.map((h) => h.amc || h.schemeName?.split(" ")?.[0])).size
  const diversificationScore = Math.min(25, amcCount * 6)
  const sipScore = holdings.some((h) => Number(h.sipAmount || 0) > 0) ? 15 : 6
  return Math.min(100, countScore + returnScore + diversificationScore + sipScore)
}

function classifySignal(h: any) {
  const invested = Number(h.investedAmount || 0)
  const current = Number(h.currentValue || 0)
  const gross = invested > 0 ? ((current - invested) / invested) * 100 : 0
  if (gross < -5) return { label: "Review", tone: "red", hint: "Under pressure" }
  if (gross > 12) return { label: "Add", tone: "emerald", hint: "Momentum holding" }
  return { label: "Hold", tone: "amber", hint: "Track closely" }
}

export default function PremiumDashboard() {
  const [holdings, setHoldings] = useState<any[]>([])
  const [tab, setTab] = useState("overview")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [form, setForm] = useState({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("Ready")
  const timer = useRef<any>(null)

  const stats = useMemo(() => {
    const invested = holdings.reduce((s, h) => s + Number(h.investedAmount || 0), 0)
    const current = holdings.reduce((s, h) => s + Number(h.currentValue || 0), 0)
    const gain = current - invested
    const returnPct = invested > 0 ? (gain / invested) * 100 : 0
    const score = scorePortfolio(holdings)
    return { invested, current, gain, returnPct, score }
  }, [holdings])

  async function loadPortfolio() {
    try {
      const local = localStorage.getItem("folioiq_h")
      if (local) setHoldings(JSON.parse(local))

      const res = await fetch(`/api/pf/load?userId=${USER_ID}`)
      const data = await res.json()
      if (data?.success && data?.holdings?.length) {
        setHoldings(data.holdings)
        localStorage.setItem("folioiq_h", JSON.stringify(data.holdings))
      }
    } catch {
      setStatus("Local mode")
    }
  }

  async function savePortfolio(next: any[]) {
    setHoldings(next)
    localStorage.setItem("folioiq_h", JSON.stringify(next))
    setStatus("Saving…")
    try {
      const res = await fetch("/api/pf/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, holdings: next }),
      })
      const data = await res.json()
      setStatus(data?.success ? "Synced" : "Saved locally")
    } catch {
      setStatus("Saved locally")
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    if (query.length < 2) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults((data || []).slice(0, 8))
      } catch {
        setResults([])
      }
    }, 300)
  }, [query])

  async function addFund(fund: any) {
    setLoading(true)
    try {
      const detail = await (await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)).json()
      const nav = detail?.data || []
      const currentNav = nav.length ? Number(nav[0].nav) : 0
      const units = Number(form.units || 100)
      const avgNav = Number(form.avgNav || currentNav)
      const purchaseDate = form.purchaseDate || new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
      const investedAmount = units * avgNav
      const currentValue = units * currentNav
      const next = [
        ...holdings.filter((h) => String(h.schemeCode) !== String(fund.schemeCode)),
        {
          schemeCode: String(fund.schemeCode),
          schemeName: fund.schemeName,
          category: detail?.meta?.scheme_category || "Mutual Fund",
          amc: detail?.meta?.fund_house || "",
          units,
          avgNav,
          currentNAV: currentNav,
          purchaseDate,
          sipAmount: Number(form.sipAmount || 0),
          investedAmount,
          currentValue,
        },
      ]
      await savePortfolio(next)
      setQuery("")
      setResults([])
      setForm({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" })
    } finally {
      setLoading(false)
    }
  }

  function removeFund(code: string) {
    savePortfolio(holdings.filter((h) => String(h.schemeCode) !== String(code)))
  }

  const topActions = holdings.length
    ? holdings.slice(0, 3).map((h) => ({ h, signal: classifySignal(h) }))
    : []

  return (
    <main className="min-h-screen bg-[#070706] text-[#f7f1df]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.24),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,.12),transparent_26%),linear-gradient(180deg,#070706_0%,#11100d_50%,#070706_100%)]" />

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/55 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4d27a] to-[#8d6b22] text-sm font-black text-black shadow-[0_0_30px_rgba(212,175,55,.35)]">F</div>
              <div>
                <div className="text-lg font-black tracking-tight">FolioIQ</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">AI Wealth Intelligence</div>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">{status}</span>
              <Link href="/upload" className="rounded-full bg-[#f4d27a] px-4 py-2 text-sm font-bold text-black hover:bg-[#ffe39b]">Upload Portfolio</Link>
              <Link href="/risk" className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/10">Risk Profile</Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1 text-xs font-semibold text-[#f4d27a]">Private beta · India MF intelligence</div>
                  <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Know what your money really made after tax.</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Live NAV, after-tax gains, action cards and AI-led portfolio decisions — built for investors who want clarity, not jargon.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Current Value</div>
                  <div className="mt-3 text-3xl font-black">{fmtC(stats.current)}</div>
                  <div className="mt-2 text-sm text-white/45">Across {holdings.length} funds</div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/40">Net Gain</div>
                  <div className={`mt-3 text-3xl font-black ${stats.gain >= 0 ? "text-emerald-300" : "text-red-300"}`}>{fmtC(stats.gain)}</div>
                  <div className="mt-2 text-sm text-white/45">{fmtP(stats.returnPct)} gross estimate</div>
                </div>
                <div className="rounded-3xl border border-[#d4af37]/25 bg-[#d4af37]/10 p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-[#f4d27a]/70">Health Score</div>
                  <div className="mt-3 text-3xl font-black text-[#f4d27a]">{stats.score}/100</div>
                  <div className="mt-2 text-sm text-[#f4d27a]/60">Diversification + momentum</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">AI Action Desk</div>
                  <div className="text-xs text-white/40">What deserves attention now</div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">Live</span>
              </div>

              {topActions.length ? (
                <div className="space-y-3">
                  {topActions.map(({ h, signal }) => (
                    <div key={h.schemeCode} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{h.schemeName}</div>
                          <div className="mt-1 text-xs text-white/40">{signal.hint}</div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${signal.tone === "emerald" ? "bg-emerald-400/15 text-emerald-300" : signal.tone === "red" ? "bg-red-400/15 text-red-300" : "bg-amber-400/15 text-amber-300"}`}>{signal.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[#d4af37]/30 bg-[#d4af37]/10 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4d27a] text-2xl text-black">✦</div>
                  <div className="text-xl font-black">Start your intelligent portfolio</div>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">Upload a statement or add your first fund. FolioIQ will turn it into clear action cards.</p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link href="/upload" className="rounded-full bg-[#f4d27a] px-5 py-2 text-sm font-black text-black">Upload</Link>
                    <button onClick={() => setTab("add")} className="rounded-full border border-white/15 px-5 py-2 text-sm font-bold text-white/75">Add Fund</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-12">
          <div className="mb-6 flex flex-wrap gap-2">
            {[["overview", "Overview"], ["holdings", "Holdings"], ["add", "Add Fund"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-5 py-2 text-sm font-bold transition ${tab === id ? "bg-[#f4d27a] text-black" : "border border-white/10 text-white/55 hover:bg-white/10"}`}>{label}</button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-6">
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">Allocation</div>
                <div className="mt-5 space-y-4">
                  {holdings.length ? holdings.slice(0, 5).map((h) => {
                    const pct = stats.current > 0 ? (Number(h.currentValue || 0) / stats.current) * 100 : 0
                    return <div key={h.schemeCode}><div className="mb-2 flex justify-between text-sm"><span className="truncate pr-4 text-white/75">{h.schemeName}</span><span>{pct.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-[#f4d27a]" style={{ width: `${Math.min(100, pct)}%` }} /></div></div>
                  }) : <p className="text-sm text-white/45">No allocation yet.</p>}
                </div>
              </div>
              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-6 lg:col-span-2">
                <div className="text-xs uppercase tracking-[0.25em] text-white/35">Portfolio Intelligence</div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-black/30 p-5"><div className="text-sm text-white/45">Funds</div><div className="mt-2 text-3xl font-black">{holdings.length}</div></div>
                  <div className="rounded-2xl bg-black/30 p-5"><div className="text-sm text-white/45">AMCs</div><div className="mt-2 text-3xl font-black">{new Set(holdings.map(h => h.amc || h.schemeName?.split(' ')?.[0])).size}</div></div>
                  <div className="rounded-2xl bg-black/30 p-5"><div className="text-sm text-white/45">SIP Funds</div><div className="mt-2 text-3xl font-black">{holdings.filter(h => Number(h.sipAmount || 0) > 0).length}</div></div>
                </div>
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-100">FolioIQ is now connected to the backend layer. Add a fund here and it will save locally and sync to Supabase through the `/api/pf/save` endpoint.</div>
              </div>
            </div>
          )}

          {tab === "holdings" && (
            <div className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.05]">
              <div className="border-b border-white/10 p-5 text-sm font-black">Holdings</div>
              {holdings.length ? holdings.map((h) => {
                const signal = classifySignal(h)
                const ret = Number(h.investedAmount || 0) > 0 ? ((Number(h.currentValue || 0) - Number(h.investedAmount || 0)) / Number(h.investedAmount || 1)) * 100 : 0
                return <div key={h.schemeCode} className="grid gap-4 border-b border-white/10 p-5 md:grid-cols-[1fr_140px_140px_100px_60px] md:items-center"><div><div className="font-bold">{h.schemeName}</div><div className="mt-1 text-xs text-white/40">{h.category || 'Mutual Fund'} · {h.amc || 'AMC'}</div></div><div><div className="text-xs text-white/35">Invested</div><div className="font-bold">{fmtC(h.investedAmount)}</div></div><div><div className="text-xs text-white/35">Current</div><div className="font-bold">{fmtC(h.currentValue)}</div></div><div className={ret >= 0 ? 'font-black text-emerald-300' : 'font-black text-red-300'}>{fmtP(ret)}</div><button onClick={() => removeFund(h.schemeCode)} className="rounded-full border border-red-400/20 px-3 py-1 text-xs text-red-300">Remove</button></div>
              }) : <div className="p-8 text-sm text-white/45">No holdings yet.</div>}
            </div>
          )}

          {tab === "add" && (
            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-6">
              <div className="mb-5"><div className="text-xl font-black">Add a mutual fund</div><div className="mt-1 text-sm text-white/45">Search live AMFI database via MFAPI.</div></div>
              <div className="grid gap-3 md:grid-cols-4">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fund name" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none placeholder:text-white/25 md:col-span-4" />
                <input value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} placeholder="Units" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none" />
                <input value={form.avgNav} onChange={(e) => setForm({ ...form, avgNav: e.target.value })} placeholder="Avg NAV" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none" />
                <input value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} type="date" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none" />
                <input value={form.sipAmount} onChange={(e) => setForm({ ...form, sipAmount: e.target.value })} placeholder="Monthly SIP" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none" />
              </div>
              {!!results.length && <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/35">{results.map((fund) => <button key={fund.schemeCode} onClick={() => addFund(fund)} disabled={loading} className="block w-full border-b border-white/10 px-4 py-3 text-left text-sm hover:bg-white/10"><div className="font-bold text-white/85">{fund.schemeName}</div><div className="mt-1 text-xs text-white/35">Scheme code: {fund.schemeCode}</div></button>)}</div>}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
