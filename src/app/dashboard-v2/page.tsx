// @ts-nocheck
/* eslint-disable */
"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"

const USER_ID = "demo-user-1"

const MODEL_PORTFOLIOS = {
  Conservative: [
    { name: "HDFC Nifty 50 Index Fund", pct: 35, role: "Core stability" },
    { name: "Parag Parikh Flexi Cap Fund", pct: 25, role: "Quality equity" },
    { name: "Kotak Corporate Bond Fund", pct: 25, role: "Debt cushion" },
    { name: "ICICI Prudential Liquid Fund", pct: 15, role: "Emergency liquidity" },
  ],
  Balanced: [
    { name: "HDFC Nifty 50 Index Fund", pct: 30, role: "Low-cost core" },
    { name: "Parag Parikh Flexi Cap Fund", pct: 30, role: "Global + flexi exposure" },
    { name: "Mirae Asset Large & Midcap Fund", pct: 20, role: "Growth engine" },
    { name: "Kotak Corporate Bond Fund", pct: 20, role: "Stability" },
  ],
  Aggressive: [
    { name: "Parag Parikh Flexi Cap Fund", pct: 30, role: "Core compounder" },
    { name: "Nippon India Small Cap Fund", pct: 25, role: "High-growth satellite" },
    { name: "Motilal Oswal Midcap Fund", pct: 20, role: "Midcap alpha" },
    { name: "HDFC Nifty 50 Index Fund", pct: 15, role: "Index anchor" },
    { name: "ICICI Prudential Liquid Fund", pct: 10, role: "Cash buffer" },
  ],
}

function fmtC(n) {
  const num = Number(n || 0)
  if (!num || Number.isNaN(num)) return "₹0"
  const a = Math.abs(num), s = num < 0 ? "-" : ""
  if (a >= 10000000) return `${s}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(2)}L`
  return `${s}₹${a.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}
function fmtP(n) { return n == null || Number.isNaN(Number(n)) ? "—" : `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1)}%` }
function futureValue(monthly, years = 20, annual = 0.12) { const r = annual / 12, n = years * 12; return monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r)) }
function scorePortfolio(h) { if (!h.length) return 0; const amcs = new Set(h.map(x => x.amc || x.schemeName?.split(" ")?.[0])).size; const pos = h.filter(x => Number(x.currentValue || 0) >= Number(x.investedAmount || 0)).length; return Math.min(100, Math.min(25, h.length * 5) + Math.round((pos / h.length) * 35) + Math.min(25, amcs * 6) + (h.some(x => Number(x.sipAmount || 0) > 0) ? 15 : 6)) }
function signal(h) { const inv = Number(h.investedAmount || 0), cur = Number(h.currentValue || 0); const r = inv ? ((cur - inv) / inv) * 100 : 0; if (r < -5) return ["Review", "text-red-600 bg-red-50 border-red-200", "Under pressure"]; if (r > 12) return ["Add", "text-emerald-700 bg-emerald-50 border-emerald-200", "Momentum holding"]; return ["Hold", "text-amber-700 bg-amber-50 border-amber-200", "Track closely"] }

export default function FolioIQDashboard() {
  const [theme, setTheme] = useState("light")
  const [holdings, setHoldings] = useState([])
  const [tab, setTab] = useState("overview")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [form, setForm] = useState({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" })
  const [status, setStatus] = useState("Ready")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiText, setAiText] = useState("")
  const [plan, setPlan] = useState({ sip: 10000, risk: "Balanced", years: 20 })
  const timer = useRef(null)

  const dark = theme === "dark"
  const model = MODEL_PORTFOLIOS[plan.risk] || MODEL_PORTFOLIOS.Balanced
  const projected = futureValue(Number(plan.sip), Number(plan.years), plan.risk === "Aggressive" ? 0.14 : plan.risk === "Conservative" ? 0.09 : 0.12)
  const stats = useMemo(() => { const invested = holdings.reduce((s, h) => s + Number(h.investedAmount || 0), 0); const current = holdings.reduce((s, h) => s + Number(h.currentValue || 0), 0); return { invested, current, gain: current - invested, ret: invested ? ((current - invested) / invested) * 100 : 0, score: scorePortfolio(holdings) } }, [holdings])

  const page = dark ? "bg-[#070706] text-[#f7f1df]" : "bg-[#f7f3e8] text-[#11100d]"
  const card = dark ? "border-white/10 bg-white/[0.06]" : "border-black/10 bg-white/80 shadow-xl"
  const soft = dark ? "bg-black/30 border-white/10" : "bg-[#fffaf0] border-black/10"
  const muted = dark ? "text-white/55" : "text-black/55"
  const accent = "#d4af37"

  useEffect(() => { const saved = localStorage.getItem("folioiq_theme"); if (saved) setTheme(saved); loadPortfolio() }, [])
  useEffect(() => { localStorage.setItem("folioiq_theme", theme) }, [theme])

  async function loadPortfolio() {
    try {
      const local = localStorage.getItem("folioiq_h"); if (local) setHoldings(JSON.parse(local))
      const res = await fetch(`/api/pf/load?userId=${USER_ID}`); const data = await res.json()
      if (data?.success && data?.holdings?.length) { setHoldings(data.holdings); localStorage.setItem("folioiq_h", JSON.stringify(data.holdings)) }
    } catch { setStatus("Local mode") }
  }
  async function savePortfolio(next) {
    setHoldings(next); localStorage.setItem("folioiq_h", JSON.stringify(next)); setStatus("Saving…")
    try { const r = await fetch("/api/pf/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: USER_ID, holdings: next }) }); const d = await r.json(); setStatus(d?.success ? "Synced" : "Saved locally") } catch { setStatus("Saved locally") }
  }

  useEffect(() => { clearTimeout(timer.current); if (query.length < 2) { setResults([]); return } timer.current = setTimeout(async () => { try { const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`); const data = await res.json(); setResults((data || []).slice(0, 8)) } catch { setResults([]) } }, 300) }, [query])

  async function addFund(fund) {
    setLoading(true)
    try {
      const detail = await (await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)).json(); const nav = detail?.data || []; const currentNav = nav.length ? Number(nav[0].nav) : 0
      const units = Number(form.units || 100), avgNav = Number(form.avgNav || currentNav), purchaseDate = form.purchaseDate || new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)
      const next = [...holdings.filter(h => String(h.schemeCode) !== String(fund.schemeCode)), { schemeCode: String(fund.schemeCode), schemeName: fund.schemeName, category: detail?.meta?.scheme_category || "Mutual Fund", amc: detail?.meta?.fund_house || "", units, avgNav, currentNAV: currentNav, purchaseDate, sipAmount: Number(form.sipAmount || 0), investedAmount: units * avgNav, currentValue: units * currentNav }]
      await savePortfolio(next); setQuery(""); setResults([]); setForm({ units: "", avgNav: "", purchaseDate: "", sipAmount: "" }); setTab("holdings")
    } finally { setLoading(false) }
  }
  function removeFund(code) { savePortfolio(holdings.filter(h => String(h.schemeCode) !== String(code))) }

  async function runAI() {
    setTab("ai"); setAiLoading(true); setAiText("")
    if (!holdings.length) { setAiText("Add or upload your portfolio first. Then I can analyse overlaps, risk concentration, weak funds and next actions."); setAiLoading(false); return }
    const lines = holdings.map(h => `- ${h.schemeName}: invested ${fmtC(h.investedAmount)}, current ${fmtC(h.currentValue)}, category ${h.category || 'MF'}`).join("\n")
    try {
      const res = await fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: "You are FolioIQ, a clear Indian mutual fund portfolio analyst. Be practical, concise, and action-led. Do not claim SEBI registration. Give educational guidance only.", messages: [{ role: "user", content: `Analyse this portfolio. Return sections: Portfolio verdict, Stop/Review, Hold, Increase SIP, Missing gaps, Tax note, This week's action.\n\n${lines}` }] }) })
      const data = await res.json(); setAiText(data.content?.[0]?.text || "AI analysis unavailable. Check API key and try again.")
    } catch { setAiText("AI analysis failed. Check Anthropic API key in Vercel/local env and try again.") }
    setAiLoading(false)
  }

  return <main className={`min-h-screen ${page}`}>
    <div className={`fixed inset-0 pointer-events-none ${dark ? "bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.22),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,.12),transparent_26%)]" : "bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,.24),transparent_30%),radial-gradient(circle_at_90%_5%,rgba(22,163,74,.10),transparent_24%)]"}`} />
    <div className="relative z-10">
      <header className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${dark ? "border-white/10 bg-black/55" : "border-black/10 bg-[#fffaf0]/85"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4d27a] to-[#8d6b22] text-sm font-black text-black">F</div><div><div className="text-lg font-black">FolioIQ</div><div className="text-[10px] uppercase tracking-[0.28em] text-[#8d6b22]">AI Wealth Intelligence</div></div></Link>
          <div className="flex items-center gap-2"><span className="hidden rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 md:inline">{status}</span><button onClick={() => setTheme(dark ? "light" : "dark")} className={`rounded-full border px-4 py-2 text-sm font-bold ${dark ? "border-white/15" : "border-black/10 bg-white"}`}>{dark ? "Light" : "Dark"}</button><Link href="/upload" className="rounded-full bg-[#f4d27a] px-4 py-2 text-sm font-black text-black">Upload</Link></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className={`rounded-[2rem] border p-8 backdrop-blur-xl ${card}`}><div className="mb-7"><div className="mb-3 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15 px-3 py-1 text-xs font-bold text-[#8d6b22]">Light-first · India MF intelligence</div><h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">Know what your money really made after tax.</h1><p className={`mt-4 max-w-2xl text-base leading-7 ${muted}`}>Live NAV, after-tax clarity, AI analysis, tax harvesting and portfolio actions — stitched into one clean FolioIQ experience.</p></div><div className="grid gap-4 md:grid-cols-3"><Metric label="Current Value" value={fmtC(stats.current)} sub={`Across ${holdings.length} funds`} cls={soft}/><Metric label="Net Gain" value={fmtC(stats.gain)} sub={fmtP(stats.ret)} cls={soft} good={stats.gain >= 0}/><Metric label="Health Score" value={`${stats.score}/100`} sub="Diversification + momentum" cls="border-[#d4af37]/30 bg-[#d4af37]/15" gold/></div></div>
          <div className={`rounded-[2rem] border p-6 ${card}`}><div className="mb-4 flex items-center justify-between"><div><div className="font-black">AI Action Desk</div><div className={`text-xs ${muted}`}>Run analysis or start with a model portfolio</div></div><button onClick={runAI} className="rounded-full bg-[#11100d] px-4 py-2 text-sm font-black text-white">Run AI</button></div>{holdings.length ? <div className="space-y-3">{holdings.slice(0,3).map(h=>{const s=signal(h);return <div key={h.schemeCode} className={`rounded-2xl border p-4 ${soft}`}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="truncate text-sm font-black">{h.schemeName}</div><div className={`mt-1 text-xs ${muted}`}>{s[2]}</div></div><span className={`rounded-full border px-3 py-1 text-xs font-black ${s[1]}`}>{s[0]}</span></div></div>})}</div> : <Onboarding plan={plan} setPlan={setPlan} projected={projected} setTab={setTab}/>}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12"><div className="mb-6 flex flex-wrap gap-2">{[["overview","Overview"],["ai","AI Analysis"],["plan","AI Plan"],["holdings","Holdings"],["tax","Tax Harvest"],["sip","SIP Calendar"],["add","Add Fund"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-full px-5 py-2 text-sm font-black ${tab===id ? "bg-[#f4d27a] text-black" : dark ? "border border-white/10 text-white/60" : "border border-black/10 bg-white text-black/60"}`}>{label}</button>)}</div>{tab==="overview"&&<Overview holdings={holdings} stats={stats} card={card} soft={soft} muted={muted}/>} {tab==="ai"&&<AIBox aiText={aiText} aiLoading={aiLoading} runAI={runAI} card={card} muted={muted}/>} {tab==="plan"&&<Plan plan={plan} setPlan={setPlan} model={model} projected={projected} setTab={setTab} card={card} soft={soft} muted={muted}/>} {tab==="holdings"&&<Holdings holdings={holdings} removeFund={removeFund} card={card} muted={muted}/>} {tab==="tax"&&<SimpleCard title="Tax Harvest" text="Tax harvesting view will use the same final UI. For now, run AI Analysis after adding funds to get the tax note and this week’s action." card={card} muted={muted}/>} {tab==="sip"&&<SimpleCard title="SIP Calendar" text="SIP reminders and calendar will appear here once your holdings include monthly SIP values." card={card} muted={muted}/>} {tab==="add"&&<AddFund query={query} setQuery={setQuery} form={form} setForm={setForm} results={results} addFund={addFund} loading={loading} card={card} soft={soft} muted={muted}/>}</section>
    </div>
  </main>
}

function Metric({label,value,sub,cls,good,gold}){return <div className={`rounded-3xl border p-5 ${cls}`}><div className="text-xs uppercase tracking-[0.22em] opacity-55">{label}</div><div className={`mt-3 text-3xl font-black ${gold?'text-[#8d6b22]':good?'text-emerald-500':''}`}>{value}</div><div className="mt-2 text-sm opacity-55">{sub}</div></div>}
function Onboarding({plan,setPlan,projected,setTab}){return <div className="rounded-3xl border border-[#d4af37]/30 bg-[#d4af37]/15 p-5"><div className="text-2xl font-black">Build your ₹1Cr portfolio blueprint</div><p className="mt-2 text-sm opacity-65">Choose SIP and risk. FolioIQ creates a model allocation instantly.</p><div className="mt-5 space-y-4"><div className="grid grid-cols-3 gap-2">{[5000,10000,25000].map(v=><button key={v} onClick={()=>setPlan({...plan,sip:v})} className={`rounded-full px-3 py-2 text-xs font-black ${plan.sip===v?'bg-[#f4d27a] text-black':'border border-black/10 bg-white/30'}`}>{fmtC(v)}</button>)}</div><div className="grid grid-cols-3 gap-2">{['Conservative','Balanced','Aggressive'].map(v=><button key={v} onClick={()=>setPlan({...plan,risk:v})} className={`rounded-full px-3 py-2 text-xs font-black ${plan.risk===v?'bg-[#f4d27a] text-black':'border border-black/10 bg-white/30'}`}>{v}</button>)}</div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4"><div className="text-xs opacity-60">Projected 20-year value</div><div className="text-3xl font-black text-emerald-500">{fmtC(projected)}</div></div><button onClick={()=>setTab('plan')} className="w-full rounded-full bg-[#11100d] px-5 py-3 text-sm font-black text-white">Generate AI portfolio</button></div></div>}
function Overview({holdings,stats,card,soft,muted}){return <div className="grid gap-5 lg:grid-cols-3"><div className={`rounded-[1.7rem] border p-6 ${card}`}><div className="text-xs uppercase tracking-[0.25em] opacity-40">Allocation</div><div className="mt-5 space-y-4">{holdings.length?holdings.slice(0,5).map(h=>{const pct=stats.current?Number(h.currentValue||0)/stats.current*100:0;return <div key={h.schemeCode}><div className="mb-2 flex justify-between text-sm"><span className="truncate pr-4">{h.schemeName}</span><span>{pct.toFixed(0)}%</span></div><div className="h-2 rounded-full bg-black/10"><div className="h-2 rounded-full bg-[#d4af37]" style={{width:`${Math.min(100,pct)}%`}}/></div></div>}):<p className={`text-sm ${muted}`}>No allocation yet.</p>}</div></div><div className={`rounded-[1.7rem] border p-6 lg:col-span-2 ${card}`}><div className="text-xs uppercase tracking-[0.25em] opacity-40">Portfolio Intelligence</div><div className="mt-5 grid gap-4 md:grid-cols-3"><Metric label="Funds" value={holdings.length} sub="Total holdings" cls={soft}/><Metric label="AMCs" value={new Set(holdings.map(h=>h.amc||h.schemeName?.split(' ')?.[0])).size} sub="Diversification" cls={soft}/><Metric label="SIP Funds" value={holdings.filter(h=>Number(h.sipAmount||0)>0).length} sub="Recurring" cls={soft}/></div><div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-700">One unified dashboard is active. Add a fund, run AI analysis, test sync, and view model allocation from here.</div></div></div>}
function AIBox({aiText,aiLoading,runAI,card,muted}){return <div className={`rounded-[1.7rem] border p-6 ${card}`}><div className="flex items-center justify-between"><div><div className="text-xl font-black">AI Portfolio Analysis</div><p className={`mt-1 text-sm ${muted}`}>Stop / hold / increase SIP, gaps, and tax note.</p></div><button onClick={runAI} className="rounded-full bg-[#f4d27a] px-5 py-3 text-sm font-black text-black">{aiLoading?'Analysing…':'Run AI Analysis'}</button></div><pre className="mt-6 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white/50 p-5 text-sm leading-7 text-black">{aiLoading?'Analysing your portfolio…':aiText||'Add holdings and click Run AI Analysis.'}</pre></div>}
function Plan({plan,setPlan,model,projected,setTab,card,soft,muted}){return <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]"><div className={`rounded-[1.7rem] border border-[#d4af37]/30 bg-[#d4af37]/15 p-6`}><div className="text-xs uppercase tracking-[0.25em] opacity-60">AI Wealth Projection</div><div className="mt-4 text-5xl font-black text-[#8d6b22]">{fmtC(projected)}</div><p className={`mt-3 text-sm leading-7 ${muted}`}>At {fmtC(plan.sip)} monthly SIP for {plan.years} years using a {plan.risk.toLowerCase()} allocation.</p><button onClick={()=>setTab('add')} className="mt-6 rounded-full bg-[#11100d] px-5 py-3 text-sm font-black text-white">Start adding these funds</button></div><div className={`rounded-[1.7rem] border p-6 ${card}`}><div className="text-xs uppercase tracking-[0.25em] opacity-40">Recommended Allocation</div><div className="mt-5 space-y-3">{model.map(f=><div key={f.name} className={`rounded-2xl border p-4 ${soft}`}><div className="flex items-center justify-between gap-4"><div><div className="font-black">{f.name}</div><div className={`mt-1 text-xs ${muted}`}>{f.role}</div></div><div className="text-2xl font-black text-[#8d6b22]">{f.pct}%</div></div><div className="mt-3 h-2 rounded-full bg-black/10"><div className="h-2 rounded-full bg-[#d4af37]" style={{width:`${f.pct}%`}}/></div></div>)}</div></div></div>}
function Holdings({holdings,removeFund,card,muted}){return <div className={`overflow-hidden rounded-[1.7rem] border ${card}`}><div className="border-b border-black/10 p-5 text-sm font-black">Holdings</div>{holdings.length?holdings.map(h=>{const ret=Number(h.investedAmount||0)>0?((Number(h.currentValue||0)-Number(h.investedAmount||0))/Number(h.investedAmount||1))*100:0;return <div key={h.schemeCode} className="grid gap-4 border-b border-black/10 p-5 md:grid-cols-[1fr_140px_140px_100px_80px] md:items-center"><div><div className="font-bold">{h.schemeName}</div><div className={`mt-1 text-xs ${muted}`}>{h.category||'Mutual Fund'} · {h.amc||'AMC'}</div></div><div><div className={`text-xs ${muted}`}>Invested</div><div className="font-bold">{fmtC(h.investedAmount)}</div></div><div><div className={`text-xs ${muted}`}>Current</div><div className="font-bold">{fmtC(h.currentValue)}</div></div><div className={ret>=0?'font-black text-emerald-600':'font-black text-red-600'}>{fmtP(ret)}</div><button onClick={()=>removeFund(h.schemeCode)} className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-600">Remove</button></div>}):<div className={`p-8 text-sm ${muted}`}>No holdings yet.</div>}</div>}
function SimpleCard({title,text,card,muted}){return <div className={`rounded-[1.7rem] border p-6 ${card}`}><div className="text-xl font-black">{title}</div><p className={`mt-2 text-sm ${muted}`}>{text}</p></div>}
function AddFund({query,setQuery,form,setForm,results,addFund,loading,card,soft,muted}){return <div className={`rounded-[1.7rem] border p-6 ${card}`}><div className="mb-5"><div className="text-xl font-black">Add a mutual fund</div><div className={`mt-1 text-sm ${muted}`}>Search live AMFI database via MFAPI.</div></div><div className="grid gap-3 md:grid-cols-4"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search fund name" className={`rounded-2xl border px-4 py-3 text-sm outline-none md:col-span-4 ${soft}`}/><input value={form.units} onChange={e=>setForm({...form,units:e.target.value})} placeholder="Units" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${soft}`}/><input value={form.avgNav} onChange={e=>setForm({...form,avgNav:e.target.value})} placeholder="Avg NAV" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${soft}`}/><input value={form.purchaseDate} onChange={e=>setForm({...form,purchaseDate:e.target.value})} type="date" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${soft}`}/><input value={form.sipAmount} onChange={e=>setForm({...form,sipAmount:e.target.value})} placeholder="Monthly SIP" className={`rounded-2xl border px-4 py-3 text-sm outline-none ${soft}`}/></div>{!!results.length&&<div className={`mt-4 overflow-hidden rounded-2xl border ${soft}`}>{results.map(fund=><button key={fund.schemeCode} onClick={()=>addFund(fund)} disabled={loading} className="block w-full border-b border-black/10 px-4 py-3 text-left text-sm hover:bg-[#fff2bd]"><div className="font-bold">{fund.schemeName}</div><div className={`mt-1 text-xs ${muted}`}>Scheme code: {fund.schemeCode}</div></button>)}</div>}</div>}
