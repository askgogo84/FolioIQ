// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"

const USER_ID = "demo-user-1"

function fmtC(n) {
  const num = Number(n || 0)
  if (!num || Number.isNaN(num)) return "₹0"
  const a = Math.abs(num)
  const s = num < 0 ? "-" : ""
  if (a >= 10000000) return `${s}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(2)}L`
  return `${s}₹${a.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function fmtP(n) {
  if (n == null || Number.isNaN(Number(n))) return "0.0%"
  return `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1)}%`
}

function scorePortfolio(holdings) {
  if (!holdings.length) return 0
  const amcs = new Set(holdings.map((h) => h.amc || h.schemeName?.split(" ")?.[0])).size
  const positive = holdings.filter((h) => Number(h.currentValue || 0) >= Number(h.investedAmount || 0)).length
  return Math.min(100, Math.min(35, holdings.length * 8) + Math.min(30, amcs * 8) + Math.round((positive / holdings.length) * 35))
}

function cleanName(name = "") {
  return name.replace(/ - Direct.*/i, "").replace(/ Fund/i, "").trim()
}

function getSignal(h) {
  const invested = Number(h.investedAmount || 0)
  const current = Number(h.currentValue || 0)
  const ret = invested ? ((current - invested) / invested) * 100 : 0
  if (ret < -5) return { label: "Review", tone: "red", text: "Needs attention" }
  if (ret > 10) return { label: "Strong", tone: "green", text: "Performing well" }
  return { label: "Hold", tone: "amber", text: "Track calmly" }
}

export default function FolioIQ() {
  const [theme, setTheme] = useState("light")
  const [tab, setTab] = useState("dashboard")
  const [holdings, setHoldings] = useState([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [form, setForm] = useState({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" })
  const [status, setStatus] = useState("Ready")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState("")
  const timer = useRef(null)

  const dark = theme === "dark"
  const stats = useMemo(() => {
    const invested = holdings.reduce((s, h) => s + Number(h.investedAmount || 0), 0)
    const current = holdings.reduce((s, h) => s + Number(h.currentValue || 0), 0)
    const gain = current - invested
    return { invested, current, gain, ret: invested ? (gain / invested) * 100 : 0, score: scorePortfolio(holdings) }
  }, [holdings])

  const ui = {
    page: dark ? "bg-[#0b0b0a] text-[#f8f4ea]" : "bg-[#fbf7ee] text-[#12100d]",
    header: dark ? "bg-[#0b0b0a]/80 border-white/10" : "bg-[#fbf7ee]/85 border-black/10",
    card: dark ? "bg-white/[0.06] border-white/10" : "bg-white/85 border-black/10 shadow-[0_22px_80px_rgba(20,16,8,0.08)]",
    soft: dark ? "bg-white/[0.05] border-white/10" : "bg-[#fffaf0] border-black/10",
    muted: dark ? "text-white/55" : "text-black/55",
    subtle: dark ? "text-white/35" : "text-black/35",
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("folioiq_theme")
    if (savedTheme) setTheme(savedTheme)
    loadPortfolio()
  }, [])

  useEffect(() => localStorage.setItem("folioiq_theme", theme), [theme])

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

  async function savePortfolio(next) {
    setHoldings(next)
    localStorage.setItem("folioiq_h", JSON.stringify(next))
    setStatus("Saving")
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
    clearTimeout(timer.current)
    if (query.length < 2) {
      setResults([])
      return
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults((data || []).slice(0, 7))
      } catch {
        setResults([])
      }
    }, 300)
  }, [query])

  async function addFund(fund) {
    const detail = await (await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)).json()
    const nav = detail?.data || []
    const currentNav = nav.length ? Number(nav[0].nav) : 0
    const units = Number(form.units || 100)
    const avgNav = Number(form.avgNav || currentNav)
    const purchaseDate = form.purchaseDate || new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
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
        investedAmount: units * avgNav,
        currentValue: units * currentNav,
      },
    ]
    await savePortfolio(next)
    setQuery("")
    setResults([])
    setForm({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" })
    setTab("portfolio")
  }

  function removeFund(code) {
    savePortfolio(holdings.filter((h) => String(h.schemeCode) !== String(code)))
  }

  async function runAI() {
    setTab("insights")
    setAiLoading(true)
    setAiText("")
    if (!holdings.length) {
      setAiText("Add one or more funds first. FolioIQ will then show review, hold, add and tax actions.")
      setAiLoading(false)
      return
    }
    const lines = holdings.map((h) => `- ${h.schemeName}: invested ${fmtC(h.investedAmount)}, current ${fmtC(h.currentValue)}, category ${h.category || "MF"}`).join("\n")
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 900,
          system: "You are FolioIQ, a concise Indian mutual fund portfolio analyst. Return short action-led output. Educational guidance only. No markdown tables.",
          messages: [{ role: "user", content: `Analyse this portfolio. Keep it crisp. Sections: Verdict, Review, Hold, Add, Tax note, This week.\n\n${lines}` }],
        }),
      })
      const data = await res.json()
      setAiText(data.content?.[0]?.text || "AI analysis unavailable. Check API key and try again.")
    } catch {
      setAiText("AI analysis failed. Check Anthropic API key in Vercel/local env and try again.")
    }
    setAiLoading(false)
  }

  return (
    <main className={`min-h-screen ${ui.page}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,.18),transparent_32%),radial-gradient(circle_at_92%_12%,rgba(34,197,94,.10),transparent_24%)]" />
      <div className="relative z-10">
        <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${ui.header}`}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d879] to-[#9b741f] text-sm font-black text-black">F</div>
              <div>
                <div className="text-lg font-black tracking-tight">FolioIQ</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9b741f]">Wealth Intelligence</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 sm:inline">{status}</span>
              <button onClick={() => setTheme(dark ? "light" : "dark")} className={`rounded-full border px-4 py-2 text-sm font-bold ${dark ? "border-white/15 bg-white/5" : "border-black/10 bg-white"}`}>{dark ? "Light" : "Dark"}</button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-10 md:py-14">
          <div className={`rounded-[2.2rem] border p-7 md:p-10 ${ui.card}`}>
            <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
              <div>
                <div className="mb-5 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#9b741f]">AI mutual fund clarity</div>
                <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Your portfolio. Simplified.</h1>
                <p className={`mt-5 max-w-2xl text-base leading-7 ${ui.muted}`}>Add your funds, run AI analysis, and see what to hold, review or improve — without finance jargon.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button onClick={() => setTab("portfolio")} className="rounded-full bg-[#11100d] px-6 py-3 text-sm font-black text-white">Add portfolio</button>
                  <button onClick={runAI} className="rounded-full bg-[#f5d879] px-6 py-3 text-sm font-black text-black">Run AI analysis</button>
                </div>
              </div>

              <div className={`rounded-[1.7rem] border p-5 ${ui.soft}`}>
                <div className={`text-xs font-black uppercase tracking-[0.24em] ${ui.subtle}`}>Portfolio value</div>
                <div className="mt-3 text-5xl font-black">{fmtC(stats.current)}</div>
                <div className={`mt-2 text-sm ${ui.muted}`}>{fmtP(stats.ret)} overall · {holdings.length} funds</div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Mini label="Net gain" value={fmtC(stats.gain)} good={stats.gain >= 0} ui={ui} />
                  <Mini label="Health" value={`${stats.score}/100`} gold ui={ui} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="mb-6 flex rounded-full border border-black/10 bg-white/60 p-1 backdrop-blur md:w-fit">
            {[["dashboard", "Dashboard"], ["portfolio", "Portfolio"], ["insights", "Insights"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`rounded-full px-5 py-2 text-sm font-black transition ${tab === id ? "bg-[#11100d] text-white" : "text-black/55 hover:text-black"}`}>{label}</button>
            ))}
          </div>

          {tab === "dashboard" && <DashboardPanel holdings={holdings} stats={stats} runAI={runAI} setTab={setTab} ui={ui} />}
          {tab === "portfolio" && <PortfolioPanel holdings={holdings} removeFund={removeFund} query={query} setQuery={setQuery} results={results} addFund={addFund} form={form} setForm={setForm} ui={ui} />}
          {tab === "insights" && <InsightsPanel aiText={aiText} aiLoading={aiLoading} runAI={runAI} holdings={holdings} ui={ui} />}
        </section>
      </div>
    </main>
  )
}

function Mini({ label, value, good, gold, ui }) {
  return <div className={`rounded-2xl border p-4 ${ui.card}`}><div className={`text-xs font-bold ${ui.subtle}`}>{label}</div><div className={`mt-2 text-2xl font-black ${gold ? "text-[#9b741f]" : good ? "text-emerald-600" : ""}`}>{value}</div></div>
}

function DashboardPanel({ holdings, stats, runAI, setTab, ui }) {
  const top = holdings.slice(0, 2)
  return <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
    <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}>
      <div className="text-xl font-black">Next best action</div>
      <p className={`mt-2 text-sm leading-6 ${ui.muted}`}>{holdings.length ? "Your portfolio is ready for analysis." : "Start by adding one fund. FolioIQ will then create clean action cards."}</p>
      <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setTab("portfolio")} className="rounded-full bg-[#11100d] px-5 py-3 text-sm font-black text-white">Add fund</button><button onClick={runAI} className="rounded-full bg-[#f5d879] px-5 py-3 text-sm font-black text-black">Run AI</button></div>
    </div>
    <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}>
      <div className="mb-4 flex items-center justify-between"><div className="text-xl font-black">Top actions</div><span className={`text-xs ${ui.muted}`}>Max 2, no clutter</span></div>
      {top.length ? <div className="space-y-3">{top.map((h) => { const s = getSignal(h); return <div key={h.schemeCode} className={`rounded-2xl border p-4 ${ui.soft}`}><div className="flex items-center justify-between gap-4"><div className="min-w-0"><div className="truncate font-black">{cleanName(h.schemeName)}</div><div className={`mt-1 text-xs ${ui.muted}`}>{s.text}</div></div><span className="rounded-full bg-[#f5d879] px-3 py-1 text-xs font-black text-black">{s.label}</span></div></div> })}</div> : <div className={`rounded-2xl border p-5 text-sm ${ui.soft} ${ui.muted}`}>No actions yet. Add your first fund.</div>}
    </div>
  </div>
}

function PortfolioPanel({ holdings, removeFund, query, setQuery, results, addFund, form, setForm, ui }) {
  return <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
    <div className={`rounded-[1.7rem] border ${ui.card}`}>
      <div className="border-b border-black/10 p-5"><div className="text-xl font-black">Your funds</div><p className={`mt-1 text-sm ${ui.muted}`}>{holdings.length} holdings added</p></div>
      {holdings.length ? holdings.map((h) => { const ret = Number(h.investedAmount || 0) ? ((Number(h.currentValue || 0) - Number(h.investedAmount || 0)) / Number(h.investedAmount || 1)) * 100 : 0; return <div key={h.schemeCode} className="grid gap-4 border-b border-black/10 p-5 md:grid-cols-[1fr_120px_120px_70px]"><div><div className="font-black">{cleanName(h.schemeName)}</div><div className={`mt-1 text-xs ${ui.muted}`}>{h.amc || "AMC"}</div></div><div><div className={`text-xs ${ui.subtle}`}>Current</div><div className="font-black">{fmtC(h.currentValue)}</div></div><div><div className={`text-xs ${ui.subtle}`}>Invested</div><div className="font-black">{fmtC(h.investedAmount)}</div></div><button onClick={() => removeFund(h.schemeCode)} className="text-xs font-black text-red-500">Remove</button></div> }) : <div className={`p-6 text-sm ${ui.muted}`}>No funds yet.</div>}
    </div>
    <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}>
      <div className="text-xl font-black">Add fund</div><p className={`mt-1 text-sm ${ui.muted}`}>Search live AMFI mutual funds.</p>
      <div className="mt-5 grid gap-3"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search HDFC, SBI, Nippon…" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${ui.soft}`} /><div className="grid grid-cols-2 gap-3"><input value={form.units} onChange={(e)=>setForm({...form,units:e.target.value})} placeholder="Units" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${ui.soft}`} /><input value={form.avgNav} onChange={(e)=>setForm({...form,avgNav:e.target.value})} placeholder="Avg NAV" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${ui.soft}`} /></div><input value={form.sipAmount} onChange={(e)=>setForm({...form,sipAmount:e.target.value})} placeholder="Monthly SIP optional" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${ui.soft}`} /></div>
      {!!results.length && <div className="mt-4 space-y-2">{results.map((fund) => <button key={fund.schemeCode} onClick={() => addFund(fund)} className={`w-full rounded-2xl border p-4 text-left text-sm transition hover:-translate-y-0.5 ${ui.soft}`}><div className="font-black">{cleanName(fund.schemeName)}</div><div className={`mt-1 text-xs ${ui.muted}`}>Code {fund.schemeCode}</div></button>)}</div>}
    </div>
  </div>
}

function InsightsPanel({ aiText, aiLoading, runAI, holdings, ui }) {
  const fallback = holdings.length ? "Click Run AI Analysis to generate your portfolio verdict." : "Add funds first, then run AI analysis."
  return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><div className="text-xl font-black">Insights</div><p className={`mt-1 text-sm ${ui.muted}`}>Clean action cards, not noisy reports.</p></div><button onClick={runAI} className="rounded-full bg-[#11100d] px-5 py-3 text-sm font-black text-white">{aiLoading ? "Analysing…" : "Run AI Analysis"}</button></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <Insight title="Verdict" body={aiLoading ? "Analysing your funds…" : aiText || fallback} ui={ui} large />
      <div className="space-y-4"><Insight title="Tax note" body="Tax harvesting and after-tax recommendations are included in AI output once funds are added." ui={ui} /><Insight title="This week" body="Keep the action list short: review weak funds, fill missing allocation, and avoid unnecessary fund overlap." ui={ui} /></div>
    </div>
  </div>
}

function Insight({ title, body, ui, large }) {
  return <div className={`rounded-2xl border p-5 ${ui.soft} ${large ? "min-h-[320px]" : ""}`}><div className="text-xs font-black uppercase tracking-[0.22em] text-[#9b741f]">{title}</div><div className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${ui.muted}`}>{body}</div></div>
}
