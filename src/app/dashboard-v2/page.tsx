// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { analysePortfolio, cleanFundName, fundType, money } from "@/lib/folioiq/decision-engine"

const USER_ID = "demo-user-1"

export default function FolioIQ() {
  const [theme, setTheme] = useState("light")
  const [view, setView] = useState("coach")
  const [holdings, setHoldings] = useState([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [form, setForm] = useState({ units: "", avgNav: "", sipAmount: "" })
  const [status, setStatus] = useState("Ready")
  const timer = useRef(null)

  const decision = useMemo(() => analysePortfolio(holdings), [holdings])
  const dark = theme === "dark"
  const ui = {
    page: dark ? "bg-[#0b0b0a] text-[#f8f4ea]" : "bg-[#fbf7ee] text-[#12100d]",
    header: dark ? "bg-[#0b0b0a]/85 border-white/10" : "bg-[#fbf7ee]/85 border-black/10",
    card: dark ? "bg-white/[0.06] border-white/10" : "bg-white/90 border-black/10 shadow-[0_24px_90px_rgba(25,20,10,0.08)]",
    soft: dark ? "bg-white/[0.05] border-white/10" : "bg-[#fffaf0] border-black/10",
    muted: dark ? "text-white/55" : "text-black/55",
    subtle: dark ? "text-white/35" : "text-black/35",
  }

  useEffect(() => { const t = localStorage.getItem("folioiq_theme"); if (t) setTheme(t); loadPortfolio() }, [])
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
    } catch { setStatus("Local") }
  }

  async function savePortfolio(next) {
    setHoldings(next)
    localStorage.setItem("folioiq_h", JSON.stringify(next))
    setStatus("Saving")
    try {
      const res = await fetch("/api/pf/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: USER_ID, holdings: next }) })
      const data = await res.json()
      setStatus(data?.success ? "Synced" : "Saved")
    } catch { setStatus("Saved") }
  }

  useEffect(() => {
    clearTimeout(timer.current)
    if (query.length < 2) { setResults([]); return }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults((data || []).slice(0, 6))
      } catch { setResults([]) }
    }, 300)
  }, [query])

  async function addFund(fund) {
    const detail = await (await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)).json()
    const nav = detail?.data || []
    const currentNav = nav.length ? Number(nav[0].nav) : 0
    const units = Number(form.units || 100)
    const avgNav = Number(form.avgNav || currentNav)
    const next = [...holdings.filter((h) => String(h.schemeCode) !== String(fund.schemeCode)), { schemeCode: String(fund.schemeCode), schemeName: fund.schemeName, category: detail?.meta?.scheme_category || "Mutual Fund", amc: detail?.meta?.fund_house || "", units, avgNav, currentNAV: currentNav, purchaseDate: new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10), sipAmount: Number(form.sipAmount || 0), investedAmount: units * avgNav, currentValue: units * currentNav }]
    await savePortfolio(next)
    setQuery(""); setResults([]); setForm({ units: "", avgNav: "", sipAmount: "" }); setView("confirm")
  }

  function removeFund(code) { savePortfolio(holdings.filter((h) => String(h.schemeCode) !== String(code))) }

  return <main className={`min-h-screen ${ui.page}`}>
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(212,175,55,.18),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(34,197,94,.09),transparent_26%)]" />
    <div className="relative z-10">
      <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${ui.header}`}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d879] to-[#9b741f] text-sm font-black text-black">F</div><div><div className="text-lg font-black">FolioIQ</div><div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9b741f]">Money Coach</div></div></div>
          <div className="flex gap-2"><span className="hidden rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 sm:inline">{status}</span><button onClick={() => setTheme(dark ? "light" : "dark")} className={`rounded-full border px-4 py-2 text-sm font-bold ${dark ? "border-white/15" : "border-black/10 bg-white"}`}>{dark ? "Light" : "Dark"}</button></div>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <CoachHero decision={decision} holdings={holdings} setView={setView} ui={ui} />
        <div className="mt-8">
          {view === "coach" && <Coach decision={decision} holdings={holdings} setView={setView} ui={ui} />}
          {view === "add" && <AddFund query={query} setQuery={setQuery} results={results} addFund={addFund} form={form} setForm={setForm} ui={ui} />}
          {view === "confirm" && <Confirm holdings={holdings} removeFund={removeFund} setView={setView} ui={ui} />}
          {view === "why" && <Why decision={decision} ui={ui} />}
        </div>
      </section>
    </div>
  </main>
}

function CoachHero({ decision, holdings, setView, ui }) {
  const status = holdings.length ? decision.verdict : "Add your portfolio first."
  return <div className={`rounded-[2.4rem] border p-8 md:p-10 ${ui.card}`}>
    <div className="mb-5 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#9b741f]">Built for people who don’t want finance jargon</div>
    <h1 className="text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Your mutual funds, explained simply.</h1>
    <p className={`mt-5 max-w-2xl text-base leading-7 ${ui.muted}`}>FolioIQ reads your portfolio and says only three things: what to review, what to keep, and what category is missing.</p>
    <div className={`mt-8 rounded-[1.7rem] border p-5 ${ui.soft}`}>
      <div className={`text-xs font-black uppercase tracking-[0.22em] ${ui.subtle}`}>Answer</div>
      <div className="mt-2 text-2xl font-black md:text-3xl">{status}</div>
      <p className={`mt-2 text-sm ${ui.muted}`}>{decision.simpleSummary}</p>
    </div>
    <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setView("add")} className="rounded-full bg-[#11100d] px-6 py-3 text-sm font-black text-white">Add portfolio</button>{holdings.length > 0 && <button onClick={() => setView("coach")} className="rounded-full bg-[#f5d879] px-6 py-3 text-sm font-black text-black">See my actions</button>}</div>
  </div>
}

function Coach({ decision, holdings, setView, ui }) {
  if (!holdings.length) return <div className="grid gap-5 md:grid-cols-3"><Step n="1" title="Upload" text="Add a statement or manually add funds." ui={ui}/><Step n="2" title="Confirm" text="Check every detected fund before analysis." ui={ui}/><Step n="3" title="Act" text="See Review, Keep and Add in plain English." ui={ui}/></div>
  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3"><Metric title="Portfolio value" value={money(decision.money.current)} text={`${decision.money.returnPct >= 0 ? '+' : ''}${decision.money.returnPct.toFixed(1)}% overall`} ui={ui}/><Metric title="Health" value={`${decision.healthScore}/100`} text={decision.riskStyle + ' style'} ui={ui}/><Metric title="This week" value="1 action" text={decision.weeklyAction} ui={ui}/></div>
    <div className="grid gap-5 md:grid-cols-3"><Action title="Review" items={decision.review.slice(0,3)} empty="Nothing urgent" tone="red" ui={ui}/><Action title="Keep" items={decision.keep.slice(0,3)} empty="No clear keep yet" tone="green" ui={ui}/><Action title="Explore" items={decision.add.slice(0,3)} empty="No major gap" tone="amber" ui={ui}/></div>
    <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black">Why are we saying this?</h3><p className={`mt-1 text-sm ${ui.muted}`}>See the logic. No hidden black box.</p></div><button onClick={() => setView("why")} className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-black">Show logic</button></div></div>
  </div>
}

function Step({ n, title, text, ui }) { return <div className={`rounded-[1.6rem] border p-6 ${ui.card}`}><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d879] text-sm font-black text-black">{n}</div><div className="text-xl font-black">{title}</div><p className={`mt-2 text-sm leading-6 ${ui.muted}`}>{text}</p></div> }
function Metric({ title, value, text, ui }) { return <div className={`rounded-[1.5rem] border p-6 ${ui.card}`}><div className={`text-xs font-black uppercase tracking-[0.22em] ${ui.subtle}`}>{title}</div><div className="mt-3 text-3xl font-black">{value}</div><p className={`mt-2 text-sm leading-6 ${ui.muted}`}>{text}</p></div> }

function AddFund({ query, setQuery, results, addFund, form, setForm, ui }) { return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h2 className="text-2xl font-black">Add portfolio</h2><p className={`mt-2 text-sm ${ui.muted}`}>Add one fund manually. Upload uses the same confirmation-first flow.</p><div className="mt-6 grid gap-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search HDFC, SBI, Axis, Nippon…" className={`rounded-2xl border px-4 py-4 text-sm outline-none ${ui.soft}`} /><div className="grid gap-3 md:grid-cols-3"><input value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} placeholder="Units" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /><input value={form.avgNav} onChange={e => setForm({ ...form, avgNav: e.target.value })} placeholder="Avg NAV" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /><input value={form.sipAmount} onChange={e => setForm({ ...form, sipAmount: e.target.value })} placeholder="SIP optional" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /></div></div>{!!results.length && <div className="mt-5 space-y-2">{results.map(f => <button key={f.schemeCode} onClick={() => addFund(f)} className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${ui.soft}`}><div className="font-black">{cleanFundName(f.schemeName)}</div><div className={`mt-1 text-xs ${ui.muted}`}>Tap to add</div></button>)}</div>}</div> }
function Confirm({ holdings, removeFund, setView, ui }) { return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-2xl font-black">Confirm funds</h2><p className={`mt-2 text-sm ${ui.muted}`}>{holdings.length} funds found. Remove wrong ones before seeing actions.</p></div><button onClick={() => setView("coach")} className="rounded-full bg-[#f5d879] px-5 py-3 text-sm font-black text-black">Looks good</button></div><div className="mt-6 space-y-2">{holdings.map(h => <div key={h.schemeCode} className={`flex items-center justify-between rounded-2xl border p-4 ${ui.soft}`}><div><div className="font-black">{cleanFundName(h.schemeName)}</div><div className={`text-xs ${ui.muted}`}>{money(h.currentValue)} · {fundType(h.schemeName, h.category)}</div></div><button onClick={() => removeFund(h.schemeCode)} className="text-xs font-black text-red-500">Remove</button></div>)}</div><button onClick={() => setView("add")} className="mt-4 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black text-black">Add missing fund</button></div> }
function Action({ title, items, empty, tone, ui }) { const color = tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-[#9b741f]"; return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h3 className={`text-xl font-black ${color}`}>{title}</h3><div className="mt-4 space-y-3">{items?.length ? items.map((x, i) => <div key={i} className={`rounded-2xl border p-4 ${ui.soft}`}><div className="font-black">{x.name}</div><div className={`mt-1 text-sm ${ui.muted}`}>{x.reason}</div><div className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-xs font-black text-black/65">{x.action}</div></div>) : <p className={`text-sm ${ui.muted}`}>{empty}</p>}</div></div> }
function Why({ decision, ui }) { return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h2 className="text-2xl font-black">Logic behind the answer</h2><p className={`mt-2 text-sm ${ui.muted}`}>This is educational guidance, not regulated investment advice.</p><div className="mt-6 space-y-3">{(decision.logic || []).map((x, i) => <div key={i} className={`rounded-2xl border p-4 text-sm ${ui.soft}`}>{x}</div>)}</div><div className="mt-6"><h3 className="font-black">Problems found</h3><div className="mt-3 space-y-2">{decision.problems.length ? decision.problems.map((p, i) => <div key={i} className={`rounded-2xl border p-4 text-sm ${ui.soft}`}>{p}</div>) : <p className={`text-sm ${ui.muted}`}>No major issue found.</p>}</div></div></div> }
