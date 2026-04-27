"use client"

import { useEffect, useMemo, useState } from "react"

type SearchFund = { schemeCode: number; schemeName: string }

type PortfolioFund = {
  schemeCode: number
  schemeName: string
  category: string
  amc: string
  units: number
  avgNav: number
  currentNav: number
  purchaseDate: string
  invested: number
  currentValue: number
  gain: number
  tax: number
  afterTaxGain: number
  afterTaxReturnPct: number
  lastUpdated?: string
}

type AISection = { title: string; body: string }

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "Rs. 0"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 10000000) return `${sign}Rs. ${(abs / 10000000).toFixed(2)} Cr`
  if (abs >= 100000) return `${sign}Rs. ${(abs / 100000).toFixed(2)}L`
  return `${sign}Rs. ${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function cleanMarkdown(text: string) {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/---/g, "")
    .replace(/`/g, "")
    .trim()
}

function parseAISections(text: string): AISection[] {
  const clean = cleanMarkdown(text)
  const headings = [
    "Verdict",
    "Exit or Reduce",
    "Hold and Watch",
    "Increase SIP",
    "Portfolio Gaps",
    "Tax Efficiency Tip",
    "This Week Action",
  ]

  const escaped = headings.map((heading) => heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const splitRegex = new RegExp(`\\b(${escaped.join("|")})\\b:?`, "gi")
  const parts = clean.split(splitRegex).map((part) => part.trim()).filter(Boolean)

  const sections: AISection[] = []
  for (let index = 0; index < parts.length; index += 2) {
    const possibleTitle = parts[index]
    const possibleBody = parts[index + 1]
    const matchedHeading = headings.find((heading) => heading.toLowerCase() === possibleTitle.toLowerCase())
    if (matchedHeading && possibleBody) sections.push({ title: matchedHeading, body: possibleBody.trim() })
  }

  if (sections.length) return sections
  return [{ title: "FolioIQ Analysis", body: clean }]
}

function daysBetween(dateString: string) {
  return Math.max(0, Math.round((Date.now() - new Date(dateString).getTime()) / 86400000))
}

function isEquityFund(category: string) {
  const text = category.toLowerCase()
  return ["equity", "large cap", "mid cap", "small cap", "flexi", "multi cap", "elss", "focused", "value", "contra", "index", "sectoral", "thematic"].some((word) => text.includes(word))
}

function calculateTax({ invested, currentValue, category, purchaseDate }: { invested: number; currentValue: number; category: string; purchaseDate: string }) {
  const gain = currentValue - invested
  if (gain <= 0) return 0
  const holdingDays = daysBetween(purchaseDate)
  if (isEquityFund(category)) {
    if (holdingDays >= 365) return Math.max(0, gain - 125000) * 0.125 * 1.04
    return gain * 0.2 * 1.04
  }
  return gain * 0.3 * 1.04
}

function recalculateFund(fund: PortfolioFund, latestNav: number) {
  const invested = fund.units * fund.avgNav
  const currentValue = fund.units * latestNav
  const gain = currentValue - invested
  const tax = calculateTax({ invested, currentValue, category: fund.category, purchaseDate: fund.purchaseDate })
  const afterTaxGain = gain - tax
  return {
    ...fund,
    currentNav: latestNav,
    invested,
    currentValue,
    gain,
    tax,
    afterTaxGain,
    afterTaxReturnPct: invested > 0 ? (afterTaxGain / invested) * 100 : 0,
    lastUpdated: new Date().toISOString(),
  }
}

function calculateHealthScore(portfolio: PortfolioFund[]) {
  if (!portfolio.length) return 0
  let score = 45
  if (portfolio.length >= 4 && portfolio.length <= 8) score += 20
  if (portfolio.length >= 2 && portfolio.length <= 3) score += 10
  if (portfolio.length > 10) score -= 10
  const categories = new Set(portfolio.map((fund) => fund.category))
  if (categories.size >= 3) score += 20
  if (categories.size === 2) score += 10
  const totalInvested = portfolio.reduce((sum, fund) => sum + fund.invested, 0)
  const totalAfterTaxGain = portfolio.reduce((sum, fund) => sum + fund.afterTaxGain, 0)
  const afterTaxReturn = totalInvested > 0 ? (totalAfterTaxGain / totalInvested) * 100 : 0
  if (afterTaxReturn > 15) score += 15
  else if (afterTaxReturn > 8) score += 10
  else if (afterTaxReturn < 0) score -= 15
  return Math.max(0, Math.min(100, score))
}

export default function DashboardPage() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchFund[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedFund, setSelectedFund] = useState<SearchFund | null>(null)
  const [units, setUnits] = useState("")
  const [avgNav, setAvgNav] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioFund[]>([])
  const [message, setMessage] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("folioiq_portfolio")
    if (saved) {
      try { setPortfolio(JSON.parse(saved)) } catch { localStorage.removeItem("folioiq_portfolio") }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("folioiq_portfolio", JSON.stringify(portfolio))
  }, [portfolio])

  useEffect(() => {
    if (query.trim().length < 3) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const response = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSearchResults((data || []).slice(0, 8))
      } catch { setSearchResults([]) } finally { setSearchLoading(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const totals = useMemo(() => {
    const invested = portfolio.reduce((sum, fund) => sum + fund.invested, 0)
    const currentValue = portfolio.reduce((sum, fund) => sum + fund.currentValue, 0)
    const tax = portfolio.reduce((sum, fund) => sum + fund.tax, 0)
    const afterTaxGain = portfolio.reduce((sum, fund) => sum + fund.afterTaxGain, 0)
    return {
      invested,
      currentValue,
      tax,
      afterTaxGain,
      afterTaxReturnPct: invested > 0 ? (afterTaxGain / invested) * 100 : 0,
      healthScore: calculateHealthScore(portfolio),
    }
  }, [portfolio])

  const aiSections = useMemo(() => aiAnalysis ? parseAISections(aiAnalysis) : [], [aiAnalysis])

  async function addFund() {
    if (!selectedFund) return setMessage("Please search and select a fund first.")
    const parsedUnits = Number(units)
    const parsedAvgNav = Number(avgNav)
    if (!parsedUnits || parsedUnits <= 0) return setMessage("Please enter valid units.")
    if (!parsedAvgNav || parsedAvgNav <= 0) return setMessage("Please enter valid average NAV.")
    if (!purchaseDate) return setMessage("Please select purchase date using the calendar.")

    try {
      setAddLoading(true)
      setMessage("Fetching live NAV...")
      const response = await fetch(`https://api.mfapi.in/mf/${selectedFund.schemeCode}`)
      const data = await response.json()
      const latestNav = Number(data?.data?.[0]?.nav || 0)
      const category = data?.meta?.scheme_category || "Mutual Fund"
      const amc = data?.meta?.fund_house || "AMC"
      if (!latestNav) return setMessage("Could not fetch latest NAV. Try another fund.")
      const baseFund: PortfolioFund = {
        schemeCode: selectedFund.schemeCode,
        schemeName: selectedFund.schemeName,
        category,
        amc,
        units: parsedUnits,
        avgNav: parsedAvgNav,
        currentNav: latestNav,
        purchaseDate,
        invested: parsedUnits * parsedAvgNav,
        currentValue: parsedUnits * latestNav,
        gain: 0,
        tax: 0,
        afterTaxGain: 0,
        afterTaxReturnPct: 0,
      }
      const newFund = recalculateFund(baseFund, latestNav)
      setPortfolio((prev) => [newFund, ...prev.filter((fund) => fund.schemeCode !== newFund.schemeCode)])
      setQuery(""); setSearchResults([]); setSelectedFund(null); setUnits(""); setAvgNav(""); setPurchaseDate(""); setAiAnalysis("")
      setMessage("Fund added successfully.")
    } catch { setMessage("Failed to add fund. Please try again.") } finally { setAddLoading(false) }
  }

  async function refreshNAVs() {
    if (!portfolio.length) return
    try {
      setRefreshing(true)
      setMessage("Refreshing live NAVs...")
      const updated = await Promise.all(portfolio.map(async (fund) => {
        const response = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`)
        const data = await response.json()
        const latestNav = Number(data?.data?.[0]?.nav || fund.currentNav)
        return recalculateFund(fund, latestNav)
      }))
      setPortfolio(updated)
      setAiAnalysis("")
      setMessage("NAVs refreshed successfully.")
    } catch {
      setMessage("Could not refresh NAVs. Try again.")
    } finally {
      setRefreshing(false)
    }
  }

  async function runAIAnalysis() {
    if (!portfolio.length) return setAiAnalysis("Add at least one fund before running AI analysis.")
    try {
      setAiLoading(true)
      setAiAnalysis("")
      const portfolioSummary = portfolio.map((fund) => ({
        fund: fund.schemeName,
        category: fund.category,
        invested: formatCurrency(fund.invested),
        currentValue: formatCurrency(fund.currentValue),
        afterTaxReturn: formatPercent(fund.afterTaxReturnPct),
        taxIfSoldToday: formatCurrency(fund.tax),
        holdingDays: daysBetween(fund.purchaseDate),
      }))
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1200,
          system: "You are FolioIQ, a sharp Indian mutual fund portfolio advisor. Give practical portfolio observations in plain English. Do not claim SEBI registration. Do not use markdown headings or asterisks. Include a short educational disclaimer at the end.",
          messages: [{
            role: "user",
            content: `Analyse this Indian mutual fund portfolio. Total invested: ${formatCurrency(totals.invested)}. Current value: ${formatCurrency(totals.currentValue)}. After-tax gain: ${formatCurrency(totals.afterTaxGain)}. Tax if sold today: ${formatCurrency(totals.tax)}. Health score: ${totals.healthScore}/100. Holdings: ${JSON.stringify(portfolioSummary)}. Use exactly these section headings: Verdict, Exit or Reduce, Hold and Watch, Increase SIP, Portfolio Gaps, Tax Efficiency Tip, This Week Action.`
          }],
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "AI analysis failed")
      setAiAnalysis(data?.content?.[0]?.text || "No analysis returned.")
    } catch (error) {
      setAiAnalysis(error instanceof Error ? error.message : "AI analysis failed. Please try again.")
    } finally { setAiLoading(false) }
  }

  function removeFund(schemeCode: number) {
    setPortfolio((prev) => prev.filter((fund) => fund.schemeCode !== schemeCode))
    setAiAnalysis("")
  }

  function clearPortfolio() {
    setPortfolio([])
    localStorage.removeItem("folioiq_portfolio")
    setAiAnalysis("")
    setMessage("Portfolio cleared.")
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1a1714]">
      <header className="sticky top-0 z-50 border-b border-[#e0dcd5] bg-white/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1714] text-white"><span className="font-serif text-xl italic">F</span></div>
            <div><div className="font-serif text-2xl leading-none">FolioIQ</div><div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#8a857e] md:text-[10px]">India MF Intelligence</div></div>
          </a>
          <div className="flex items-center gap-2"><span className="hidden rounded-full border border-[#b6ddc8] bg-[#e8f5ee] px-4 py-2 text-xs font-semibold text-[#1a7a4a] sm:inline-flex">Live NAV</span><a href="/" className="rounded-full border border-[#d0ccc5] bg-white px-4 py-2 text-xs font-semibold">Home</a></div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1a7a4a]">Portfolio Dashboard</p>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl">Your MF command center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a453f]">Track mutual funds using live NAV, calculate after-tax returns and get AI-powered portfolio actions.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat title="Invested" value={formatCurrency(totals.invested)} note={`${portfolio.length} funds added`} />
          <Stat title="Current Value" value={formatCurrency(totals.currentValue)} note={`Gross gain ${formatCurrency(totals.currentValue - totals.invested)}`} />
          <Stat title="After Tax Return" value={formatPercent(totals.afterTaxReturnPct)} note={`Net gain ${formatCurrency(totals.afterTaxGain)}`} green />
          <Stat title="Health Score" value={portfolio.length ? `${totals.healthScore}/100` : "--/100"} note={`Tax liability ${formatCurrency(totals.tax)}`} />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 className="font-serif text-3xl">Add a mutual fund</h2><p className="mt-2 text-sm text-[#8a857e]">Search any Indian mutual fund, enter units and average NAV.</p></div>
              <div className="flex gap-2">{portfolio.length > 0 && <button onClick={refreshNAVs} disabled={refreshing} className="rounded-full border border-[#b6ddc8] bg-[#e8f5ee] px-4 py-2 text-xs font-semibold text-[#1a7a4a] disabled:opacity-50">{refreshing ? "Refreshing" : "Refresh NAV"}</button>}{portfolio.length > 0 && <button onClick={clearPortfolio} className="rounded-full border border-[#f5c0bc] bg-[#fdecea] px-4 py-2 text-xs font-semibold text-[#c0392b]">Clear</button>}</div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="relative">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">Search fund</label>
                <input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedFund(null) }} placeholder="Example: Parag Parikh Flexi Cap" className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]" />
                {(searchResults.length > 0 || searchLoading) && <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#e0dcd5] bg-white shadow-xl">
                  {searchLoading && <div className="p-4 text-sm text-[#8a857e]">Searching funds...</div>}
                  {searchResults.map((fund) => <button key={fund.schemeCode} onClick={() => { setSelectedFund(fund); setQuery(fund.schemeName); setSearchResults([]) }} className="block w-full border-b border-[#efecea] px-4 py-3 text-left hover:bg-[#f7f5f0]"><div className="text-sm font-semibold">{fund.schemeName}</div><div className="mt-1 text-xs text-[#8a857e]">Scheme code: {fund.schemeCode}</div></button>)}
                </div>}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Input label="Units" value={units} setValue={setUnits} placeholder="Example: 120.54" type="number" />
                <Input label="Avg NAV" value={avgNav} setValue={setAvgNav} placeholder="Example: 48.20" type="number" />
                <Input label="Purchase date" value={purchaseDate} setValue={setPurchaseDate} type="date" helper="Use calendar. Format saves as YYYY-MM-DD." />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><button onClick={addFund} disabled={addLoading} className="rounded-full bg-[#1a1714] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50">{addLoading ? "Adding..." : "Add Fund"}</button>{message && <p className="text-sm font-medium text-[#4a453f]">{message}</p>}</div>
            </div>

            <div className="mt-8">
              {!portfolio.length ? <div className="rounded-2xl border border-dashed border-[#d0ccc5] bg-[#fafaf8] p-10 text-center"><p className="font-serif text-2xl">No portfolio yet</p><p className="mt-2 text-sm text-[#8a857e]">Add your first fund to see live NAV and after-tax return.</p></div> : <div className="overflow-hidden rounded-2xl border border-[#e0dcd5]">
                <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] bg-[#fafaf8] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#8a857e] md:grid"><div>Fund</div><div>Invested</div><div>Current</div><div>After Tax</div><div></div></div>
                {portfolio.map((fund) => <div key={fund.schemeCode} className="grid gap-3 border-t border-[#e0dcd5] px-4 py-4 text-sm md:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] md:items-center"><div><p className="font-semibold">{fund.schemeName}</p><p className="mt-1 text-xs text-[#8a857e]">{fund.amc} | NAV {fund.currentNav.toFixed(2)}</p></div><MobileMetric label="Invested" value={formatCurrency(fund.invested)} /><MobileMetric label="Current" value={formatCurrency(fund.currentValue)} /><div><span className="mr-2 text-xs uppercase tracking-widest text-[#8a857e] md:hidden">After Tax</span><span className={fund.afterTaxReturnPct >= 0 ? "font-semibold text-[#1a7a4a]" : "font-semibold text-[#c0392b]"}>{formatPercent(fund.afterTaxReturnPct)}</span></div><div className="text-left md:text-right"><button onClick={() => removeFund(fund.schemeCode)} className="rounded-full border border-[#f5c0bc] bg-[#fdecea] px-4 py-2 text-xs font-semibold text-[#c0392b]">Remove</button></div></div>)}
              </div>}
            </div>
          </div>

          <div className="rounded-2xl border border-[#b6ddc8] bg-gradient-to-br from-[#f0faf5] to-[#f7f5f0] p-5 shadow-sm md:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">AI Advisor</p>
            <h2 className="mt-4 font-serif text-3xl">Claude portfolio analysis</h2>
            <p className="mt-3 text-sm leading-7 text-[#4a453f]">Generates exit, hold, double-down, tax-efficiency and weekly action recommendations using a secure server route.</p>
            <div className="mt-6 rounded-2xl border border-[#b6ddc8] bg-white/70 p-5"><p className="text-sm font-semibold text-[#1a1714]">Current portfolio summary</p><div className="mt-4 space-y-3 text-sm text-[#4a453f]"><Row label="Total invested" value={formatCurrency(totals.invested)} /><Row label="Current value" value={formatCurrency(totals.currentValue)} /><Row label="Tax if sold today" value={formatCurrency(totals.tax)} /><Row label="After-tax gain" value={formatCurrency(totals.afterTaxGain)} /></div></div>
            <button onClick={runAIAnalysis} disabled={aiLoading || !portfolio.length} className="mt-6 rounded-full bg-[#1a7a4a] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{aiLoading ? "Analysing..." : "Run AI Analysis"}</button>
            {aiSections.length > 0 && <AIResult sections={aiSections} />}
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ title, value, note, green = false }: { title: string; value: string; note: string; green?: boolean }) {
  return <div className={`rounded-2xl border ${green ? "border-[#b6ddc8] bg-[#f0faf5]" : "border-[#e0dcd5] bg-white"} p-5 shadow-sm md:p-6`}><p className={`text-xs font-semibold uppercase tracking-widest ${green ? "text-[#1a7a4a]" : "text-[#8a857e]"}`}>{title}</p><h2 className={`mt-4 font-serif text-3xl md:text-4xl ${green ? "text-[#1a7a4a]" : ""}`}>{value}</h2><p className="mt-2 text-xs text-[#8a857e]">{note}</p></div>
}

function Input({ label, value, setValue, placeholder, type = "text", helper }: { label: string; value: string; setValue: (value: string) => void; placeholder?: string; type?: string; helper?: string }) {
  return <div><label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">{label}</label><input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} type={type} className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]" />{helper && <p className="mt-1 text-[11px] text-[#8a857e]">{helper}</p>}</div>
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><span>{label}</span><strong>{value}</strong></div>
}

function MobileMetric({ label, value }: { label: string; value: string }) {
  return <div><span className="mr-2 text-xs uppercase tracking-widest text-[#8a857e] md:hidden">{label}</span><span>{value}</span></div>
}

function AIResult({ sections }: { sections: AISection[] }) {
  return <div className="mt-6 space-y-3"><div className="rounded-2xl border border-[#b6ddc8] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">FolioIQ Assessment</p><p className="mt-2 text-xs leading-6 text-[#4a453f]">Educational insight only. This is not financial advice. Please validate before investing or redeeming.</p></div>{sections.map((section) => <div key={section.title} className="rounded-2xl border border-[#e0dcd5] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">{section.title}</p><p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#1a1714]">{section.body}</p></div>)}</div>
}
