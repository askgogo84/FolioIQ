// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { analysePortfolio, cleanFundName, fundType, money } from "@/lib/folioiq/decision-engine"

const USER_ID = "demo-user-1"

function fmtP(n) {
  return n == null || Number.isNaN(Number(n)) ? "0.0%" : `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1)}%`
}

export default function FolioIQ() {
  const [theme, setTheme] = useState("light")
  const [step, setStep] = useState("home")
  const [holdings, setHoldings] = useState([])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [form, setForm] = useState({ units: "", avgNav: "", sipAmount: "" })
  const [status, setStatus] = useState("Ready")
  const [aiLoading, setAiLoading] = useState(false)
  const timer = useRef(null)

  const decision = useMemo(() => analysePortfolio(holdings), [holdings])
  const dark = theme === "dark"
  const ui = {
    page: dark ? "bg-[#0b0b0a] text-[#f8f4ea]" : "bg-[#fbf7ee] text-[#12100d]",
    header: dark ? "bg-[#0b0b0a]/85 border-white/10" : "bg-[#fbf7ee]/85 border-black/10",
    card: dark ? "bg-white/[0.06] border-white/10" : "bg-white/90 border-black/10 shadow-[0_22px_80px_rgba(20,16,8,0.08)]",
    soft: dark ? "bg-white/[0.05] border-white/10" : "bg-[#fffaf0] border-black/10",
    muted: dark ? "text-white/55" : "text-black/55",
    subtle: dark ? "text-white/35" : "text-black/35",
  }

  useEffect(() => {
    const t = localStorage.getItem("folioiq_theme")
    if (t) setTheme(t)
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
      setStatus("Local")
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
      setStatus(data?.success ? "Synced" : "Saved")
    } catch {
      setStatus("Saved")
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
        purchaseDate: new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10),
        sipAmount: Number(form.sipAmount || 0),
        investedAmount: units * avgNav,
        currentValue: units * currentNav,
      },
    ]
    await savePortfolio(next)
    setQuery("")
    setResults([])
    setForm({ units: "", avgNav: "", sipAmount: "" })
    setStep("confirm")
  }

  function removeFund(code) {
    savePortfolio(holdings.filter((h) => String(h.schemeCode) !== String(code)))
  }

  async function runAI() {
    setStep("result")
    setAiLoading(true)
    setTimeout(() => setAiLoading(false), 650)
  }

  return (
    <main className={`min-h-screen ${ui.page}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,55,.18),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(34,197,94,.08),transparent_26%)]" />
      <div className="relative z-10">
        <Header ui={ui} status={status} dark={dark} setTheme={setTheme} />
        <section className="mx-auto max-w-5xl px-6 py-10">
          <Hero decision={decision} holdings={holdings} setStep={setStep} runAI={runAI} ui={ui} />
          <Stepper step={step} />
          {step === "home" && <Home decision={decision} holdings={holdings} setStep={setStep} runAI={runAI} ui={ui} />}
          {step === "add" && <AddFund query={query} setQuery={setQuery} results={results} addFund={addFund} form={form} setForm={setForm} ui={ui} />}
          {step === "confirm" && <Confirm holdings={holdings} removeFund={removeFund} setStep={setStep} runAI={runAI} ui={ui} />}
          {step === "result" && <Result decision={decision} aiLoading={aiLoading} setStep={setStep} ui={ui} />}
        </section>
      </div>
    </main>
  )
}

function Header({ ui, status, dark, setTheme }) {
  return <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${ui.header}`}><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5d879] to-[#9b741f] text-sm font-black text-black">F</div><div><div className="text-lg font-black">FolioIQ</div><div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#9b741f]">Decision Engine</div></div></div><div className="flex gap-2"><span className="hidden rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 sm:inline">{status}</span><button onClick={() => setTheme(dark ? "light" : "dark")} className={`rounded-full border px-4 py-2 text-sm font-bold ${dark ? "border-white/15" : "border-black/10 bg-white"}`}>{dark ? "Light" : "Dark"}</button></div></div></header>
}

function Hero({ decision, holdings, setStep, runAI, ui }) {
  return <div className={`rounded-[2.2rem] border p-8 md:p-10 ${ui.card}`}><div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center"><div><div className="mb-5 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-xs font-black text-[#9b741f]">For normal investors, not finance experts</div><h1 className="text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Tell me what to do with my mutual funds.</h1><p className={`mt-5 text-base leading-7 ${ui.muted}`}>Upload or add funds. FolioIQ checks clutter, risk, duplication and gaps — then gives simple actions.</p><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => setStep("add")} className="rounded-full bg-[#11100d] px-6 py-3 text-sm font-black text-white">Add / upload portfolio</button><button onClick={runAI} className="rounded-full bg-[#f5d879] px-6 py-3 text-sm font-black text-black">Show my actions</button></div></div><div className={`rounded-[1.7rem] border p-5 ${ui.soft}`}><div className={`text-xs font-black uppercase tracking-[0.24em] ${ui.subtle}`}>Portfolio health</div><div className="mt-3 text-5xl font-black">{decision.healthScore}/100</div><p className={`mt-2 text-sm ${ui.muted}`}>{holdings.length ? `${holdings.length} funds · ${money(decision.money.current)} current value` : "No funds added yet"}</p><div className="mt-5 h-3 rounded-full bg-black/10"><div className="h-3 rounded-full bg-[#d4af37]" style={{ width: `${decision.healthScore}%` }} /></div><div className="mt-5 rounded-2xl bg-white/60 p-4 text-sm font-bold text-black/70">{decision.verdict}</div></div></div></div>
}

function Stepper({ step }) {
  const arr = [["home", "Start"], ["add", "Add"], ["confirm", "Confirm"], ["result", "Actions"]]
  return <div className="my-8 flex justify-center gap-2">{arr.map(([id, l]) => <div key={id} className={`rounded-full px-4 py-2 text-xs font-black ${step === id ? "bg-[#11100d] text-white" : "bg-white/70 text-black/40"}`}>{l}</div>)}</div>
}

function Home({ decision, holdings, setStep, runAI, ui }) {
  return <div className="grid gap-5 md:grid-cols-3"><Card title="Money now" value={money(decision.money.current)} text={decision.simpleSummary} ui={ui} /><Card title="Risk style" value={decision.riskStyle} text="Inferred from current funds" ui={ui} /><Card title="This week" value={holdings.length ? "1 action" : "Add funds"} text={decision.weeklyAction} ui={ui} /></div>
}
function Card({ title, value, text, ui }) { return <div className={`rounded-[1.5rem] border p-6 ${ui.card}`}><div className={`text-xs font-black uppercase tracking-[0.22em] ${ui.subtle}`}>{title}</div><div className="mt-3 text-3xl font-black">{value}</div><p className={`mt-2 text-sm leading-6 ${ui.muted}`}>{text}</p></div> }

function AddFund({ query, setQuery, results, addFund, form, setForm, ui }) {
  return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h2 className="text-2xl font-black">Add portfolio</h2><p className={`mt-2 text-sm ${ui.muted}`}>Search a fund manually, or use Upload from the main menu. Every detected fund is confirmed before analysis.</p><div className="mt-6 grid gap-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search HDFC, SBI, Axis, Nippon…" className={`rounded-2xl border px-4 py-4 text-sm outline-none ${ui.soft}`} /><div className="grid gap-3 md:grid-cols-3"><input value={form.units} onChange={e => setForm({ ...form, units: e.target.value })} placeholder="Units" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /><input value={form.avgNav} onChange={e => setForm({ ...form, avgNav: e.target.value })} placeholder="Avg NAV" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /><input value={form.sipAmount} onChange={e => setForm({ ...form, sipAmount: e.target.value })} placeholder="SIP optional" className={`rounded-2xl border px-4 py-3 text-sm ${ui.soft}`} /></div></div>{!!results.length && <div className="mt-5 space-y-2">{results.map(f => <button key={f.schemeCode} onClick={() => addFund(f)} className={`w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${ui.soft}`}><div className="font-black">{cleanFundName(f.schemeName)}</div><div className={`mt-1 text-xs ${ui.muted}`}>Tap to add</div></button>)}</div>}</div>
}

function Confirm({ holdings, removeFund, setStep, runAI, ui }) {
  return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-2xl font-black">Confirm funds detected</h2><p className={`mt-2 text-sm ${ui.muted}`}>{holdings.length} funds found. If anything is missing, add it before analysis.</p></div><button onClick={runAI} className="rounded-full bg-[#f5d879] px-5 py-3 text-sm font-black text-black">Looks good — analyse</button></div><div className="mt-6 space-y-2">{holdings.map(h => <div key={h.schemeCode} className={`flex items-center justify-between rounded-2xl border p-4 ${ui.soft}`}><div><div className="font-black">{cleanFundName(h.schemeName)}</div><div className={`text-xs ${ui.muted}`}>{money(h.currentValue)} · {fundType(h.schemeName, h.category)}</div></div><button onClick={() => removeFund(h.schemeCode)} className="text-xs font-black text-red-500">Remove</button></div>)}</div><button onClick={() => setStep("add")} className="mt-4 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-black">Add missing fund</button></div>
}

function Result({ decision, aiLoading, setStep, ui }) {
  return <div className="space-y-5"><div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><div className="text-sm font-black text-[#9b741f]">Your simple answer</div><h2 className="mt-2 text-3xl font-black">{aiLoading ? "Checking your portfolio…" : decision.verdict}</h2><p className={`mt-2 text-sm ${ui.muted}`}>{decision.simpleSummary}</p><div className="mt-5 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-4 text-sm font-black text-[#7a5a16]">{decision.weeklyAction}</div></div><div className="grid gap-5 md:grid-cols-3"><Action title="Review / Exit" items={decision.review} empty="Nothing urgent" tone="red" ui={ui} /><Action title="Keep" items={decision.keep} empty="Add funds to see keeps" tone="green" ui={ui} /><Action title="Add" items={decision.add} empty="No big gaps found" tone="amber" ui={ui} /></div><div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h3 className="text-xl font-black">Problems found</h3><div className="mt-4 grid gap-3">{decision.problems.length ? decision.problems.map((p, i) => <div key={i} className={`rounded-2xl border p-4 text-sm ${ui.soft}`}>{p}</div>) : <p className={`text-sm ${ui.muted}`}>No major issue found.</p>}</div><button onClick={() => setStep("confirm")} className="mt-5 rounded-full bg-[#11100d] px-5 py-3 text-sm font-black text-white">Edit portfolio</button></div></div>
}

function Action({ title, items, empty, tone, ui }) {
  const color = tone === "red" ? "text-red-600" : tone === "green" ? "text-emerald-600" : "text-[#9b741f]"
  return <div className={`rounded-[1.7rem] border p-6 ${ui.card}`}><h3 className={`text-xl font-black ${color}`}>{title}</h3><div className="mt-4 space-y-3">{items?.length ? items.map((x, i) => <div key={i} className={`rounded-2xl border p-4 ${ui.soft}`}><div className="font-black">{x.name}</div><div className={`mt-1 text-xs ${ui.muted}`}>{x.reason}</div><div className="mt-3 rounded-full bg-white/70 px-3 py-1 text-xs font-black text-black/65">{x.action}</div></div>) : <p className={`text-sm ${ui.muted}`}>{empty}</p>}</div></div>
}
