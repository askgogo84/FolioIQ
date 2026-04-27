"use client"

import { useEffect, useMemo, useState } from "react"

type SearchFund = {
  schemeCode: number
  schemeName: string
}

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
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0"

  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""

  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`

  return `${sign}₹${abs.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

function daysBetween(dateString: string) {
  const start = new Date(dateString)
  const end = new Date()
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))
}

function isEquityFund(category: string) {
  const equityWords = [
    "equity",
    "large cap",
    "mid cap",
    "small cap",
    "flexi",
    "multi cap",
    "elss",
    "focused",
    "value",
    "contra",
    "index",
    "sectoral",
    "thematic",
  ]

  const text = category.toLowerCase()
  return equityWords.some((word) => text.includes(word))
}

function calculateTax({
  invested,
  currentValue,
  category,
  purchaseDate,
}: {
  invested: number
  currentValue: number
  category: string
  purchaseDate: string
}) {
  const gain = currentValue - invested
  if (gain <= 0) return 0

  const holdingDays = daysBetween(purchaseDate)

  if (isEquityFund(category)) {
    if (holdingDays >= 365) {
      const exemption = 125000
      const taxableGain = Math.max(0, gain - exemption)
      return taxableGain * 0.125 * 1.04
    }

    return gain * 0.2 * 1.04
  }

  return gain * 0.3 * 1.04
}

function calculateHealthScore(portfolio: PortfolioFund[]) {
  if (portfolio.length === 0) return 0

  let score = 45

  if (portfolio.length >= 4 && portfolio.length <= 8) score += 20
  if (portfolio.length >= 2 && portfolio.length <= 3) score += 10
  if (portfolio.length > 10) score -= 10

  const categories = new Set(portfolio.map((fund) => fund.category))
  if (categories.size >= 3) score += 20
  if (categories.size === 2) score += 10

  const totalInvested = portfolio.reduce((sum, fund) => sum + fund.invested, 0)
  const totalAfterTaxGain = portfolio.reduce(
    (sum, fund) => sum + fund.afterTaxGain,
    0
  )

  const afterTaxReturn =
    totalInvested > 0 ? (totalAfterTaxGain / totalInvested) * 100 : 0

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

  useEffect(() => {
    const saved = localStorage.getItem("folioiq_portfolio")
    if (saved) {
      try {
        setPortfolio(JSON.parse(saved))
      } catch {
        localStorage.removeItem("folioiq_portfolio")
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("folioiq_portfolio", JSON.stringify(portfolio))
  }, [portfolio])

  useEffect(() => {
    if (query.trim().length < 3) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const response = await fetch(
          `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`
        )
        const data = await response.json()
        setSearchResults((data || []).slice(0, 8))
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  const totals = useMemo(() => {
    const invested = portfolio.reduce((sum, fund) => sum + fund.invested, 0)
    const currentValue = portfolio.reduce(
      (sum, fund) => sum + fund.currentValue,
      0
    )
    const tax = portfolio.reduce((sum, fund) => sum + fund.tax, 0)
    const afterTaxGain = portfolio.reduce(
      (sum, fund) => sum + fund.afterTaxGain,
      0
    )
    const afterTaxReturnPct =
      invested > 0 ? (afterTaxGain / invested) * 100 : 0

    return {
      invested,
      currentValue,
      tax,
      afterTaxGain,
      afterTaxReturnPct,
      healthScore: calculateHealthScore(portfolio),
    }
  }, [portfolio])

  async function addFund() {
    if (!selectedFund) {
      setMessage("Please search and select a fund first.")
      return
    }

    const parsedUnits = Number(units)
    const parsedAvgNav = Number(avgNav)

    if (!parsedUnits || parsedUnits <= 0) {
      setMessage("Please enter valid units.")
      return
    }

    if (!parsedAvgNav || parsedAvgNav <= 0) {
      setMessage("Please enter valid average NAV.")
      return
    }

    if (!purchaseDate) {
      setMessage("Please select purchase date.")
      return
    }

    try {
      setAddLoading(true)
      setMessage("Fetching live NAV...")

      const response = await fetch(
        `https://api.mfapi.in/mf/${selectedFund.schemeCode}`
      )
      const data = await response.json()

      const latestNav = Number(data?.data?.[0]?.nav || 0)
      const category = data?.meta?.scheme_category || "Mutual Fund"
      const amc = data?.meta?.fund_house || "AMC"

      if (!latestNav) {
        setMessage("Could not fetch latest NAV. Try another fund.")
        return
      }

      const invested = parsedUnits * parsedAvgNav
      const currentValue = parsedUnits * latestNav
      const gain = currentValue - invested
      const tax = calculateTax({
        invested,
        currentValue,
        category,
        purchaseDate,
      })
      const afterTaxGain = gain - tax
      const afterTaxReturnPct =
        invested > 0 ? (afterTaxGain / invested) * 100 : 0

      const newFund: PortfolioFund = {
        schemeCode: selectedFund.schemeCode,
        schemeName: selectedFund.schemeName,
        category,
        amc,
        units: parsedUnits,
        avgNav: parsedAvgNav,
        currentNav: latestNav,
        purchaseDate,
        invested,
        currentValue,
        gain,
        tax,
        afterTaxGain,
        afterTaxReturnPct,
      }

      setPortfolio((prev) => [
        newFund,
        ...prev.filter((fund) => fund.schemeCode !== newFund.schemeCode),
      ])

      setQuery("")
      setSearchResults([])
      setSelectedFund(null)
      setUnits("")
      setAvgNav("")
      setPurchaseDate("")
      setMessage("Fund added successfully.")
    } catch {
      setMessage("Failed to add fund. Please try again.")
    } finally {
      setAddLoading(false)
    }
  }

  function removeFund(schemeCode: number) {
    setPortfolio((prev) => prev.filter((fund) => fund.schemeCode !== schemeCode))
  }

  function clearPortfolio() {
    setPortfolio([])
    localStorage.removeItem("folioiq_portfolio")
    setMessage("Portfolio cleared.")
  }

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1a1714]">
      <header className="sticky top-0 z-50 border-b border-[#e0dcd5] bg-white/90 px-8 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1714] text-white">
              <span className="font-serif text-xl italic">F</span>
            </div>
            <div>
              <div className="font-serif text-2xl leading-none">FolioIQ</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a857e]">
                India MF Intelligence
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#b6ddc8] bg-[#e8f5ee] px-4 py-2 text-xs font-semibold text-[#1a7a4a]">
              Live NAV
            </span>
            <a
              href="/"
              className="rounded-full border border-[#d0ccc5] bg-white px-4 py-2 text-xs font-semibold"
            >
              Home
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1a7a4a]">
            Portfolio Dashboard
          </p>
          <h1 className="mt-3 font-serif text-5xl">Your MF command center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#4a453f]">
            Track mutual funds using live NAV, calculate after-tax returns and
            understand your actual portfolio quality.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
              Invested
            </p>
            <h2 className="mt-4 font-serif text-4xl">
              {formatCurrency(totals.invested)}
            </h2>
            <p className="mt-2 text-xs text-[#8a857e]">
              {portfolio.length} funds added
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
              Current Value
            </p>
            <h2 className="mt-4 font-serif text-4xl">
              {formatCurrency(totals.currentValue)}
            </h2>
            <p className="mt-2 text-xs text-[#8a857e]">
              Gross gain {formatCurrency(totals.currentValue - totals.invested)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#b6ddc8] bg-[#f0faf5] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">
              After Tax Return
            </p>
            <h2 className="mt-4 font-serif text-4xl text-[#1a7a4a]">
              {formatPercent(totals.afterTaxReturnPct)}
            </h2>
            <p className="mt-2 text-xs text-[#4a453f]">
              Net gain {formatCurrency(totals.afterTaxGain)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
              Health Score
            </p>
            <h2 className="mt-4 font-serif text-4xl">
              {portfolio.length ? `${totals.healthScore}/100` : "--/100"}
            </h2>
            <p className="mt-2 text-xs text-[#8a857e]">
              Tax liability {formatCurrency(totals.tax)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-[#e0dcd5] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-serif text-3xl">Add a mutual fund</h2>
                <p className="mt-2 text-sm text-[#8a857e]">
                  Search any Indian mutual fund, enter your units and average NAV.
                </p>
              </div>

              {portfolio.length > 0 && (
                <button
                  onClick={clearPortfolio}
                  className="rounded-full border border-[#f5c0bc] bg-[#fdecea] px-5 py-2 text-xs font-semibold text-[#c0392b]"
                >
                  Clear Portfolio
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              <div className="relative">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
                  Search fund
                </label>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setSelectedFund(null)
                  }}
                  placeholder="Example: Parag Parikh Flexi Cap"
                  className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]"
                />

                {(searchResults.length > 0 || searchLoading) && (
                  <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#e0dcd5] bg-white shadow-xl">
                    {searchLoading && (
                      <div className="p-4 text-sm text-[#8a857e]">
                        Searching funds...
                      </div>
                    )}

                    {searchResults.map((fund) => (
                      <button
                        key={fund.schemeCode}
                        onClick={() => {
                          setSelectedFund(fund)
                          setQuery(fund.schemeName)
                          setSearchResults([])
                        }}
                        className="block w-full border-b border-[#efecea] px-4 py-3 text-left hover:bg-[#f7f5f0]"
                      >
                        <div className="text-sm font-semibold">
                          {fund.schemeName}
                        </div>
                        <div className="mt-1 text-xs text-[#8a857e]">
                          Scheme code: {fund.schemeCode}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
                    Units
                  </label>
                  <input
                    value={units}
                    onChange={(event) => setUnits(event.target.value)}
                    placeholder="Example: 120.54"
                    type="number"
                    className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
                    Avg NAV
                  </label>
                  <input
                    value={avgNav}
                    onChange={(event) => setAvgNav(event.target.value)}
                    placeholder="Example: 48.20"
                    type="number"
                    className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
                    Purchase date
                  </label>
                  <input
                    value={purchaseDate}
                    onChange={(event) => setPurchaseDate(event.target.value)}
                    type="date"
                    className="w-full rounded-xl border border-[#d0ccc5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1a7a4a] focus:ring-4 focus:ring-[#e8f5ee]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={addFund}
                  disabled={addLoading}
                  className="rounded-full bg-[#1a1714] px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add Fund"}
                </button>

                {message && (
                  <p className="text-sm font-medium text-[#4a453f]">{message}</p>
                )}
              </div>
            </div>

            <div className="mt-8">
              {portfolio.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d0ccc5] bg-[#fafaf8] p-10 text-center">
                  <p className="font-serif text-2xl">No portfolio yet</p>
                  <p className="mt-2 text-sm text-[#8a857e]">
                    Add your first fund to see live NAV and after-tax return.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-[#e0dcd5]">
                  <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] bg-[#fafaf8] px-4 py-3 text-xs font-semibold uppercase tracking-widest text-[#8a857e]">
                    <div>Fund</div>
                    <div>Invested</div>
                    <div>Current</div>
                    <div>After Tax</div>
                    <div></div>
                  </div>

                  {portfolio.map((fund) => (
                    <div
                      key={fund.schemeCode}
                      className="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] items-center border-t border-[#e0dcd5] px-4 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{fund.schemeName}</p>
                        <p className="mt-1 text-xs text-[#8a857e]">
                          {fund.amc} | NAV {fund.currentNav.toFixed(2)}
                        </p>
                      </div>

                      <div>{formatCurrency(fund.invested)}</div>
                      <div>{formatCurrency(fund.currentValue)}</div>
                      <div
                        className={
                          fund.afterTaxReturnPct >= 0
                            ? "font-semibold text-[#1a7a4a]"
                            : "font-semibold text-[#c0392b]"
                        }
                      >
                        {formatPercent(fund.afterTaxReturnPct)}
                      </div>

                      <div className="text-right">
                        <button
                          onClick={() => removeFund(fund.schemeCode)}
                          className="rounded-full border border-[#f5c0bc] bg-[#fdecea] px-4 py-2 text-xs font-semibold text-[#c0392b]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#b6ddc8] bg-gradient-to-br from-[#f0faf5] to-[#f7f5f0] p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1a7a4a]">
              AI Advisor
            </p>
            <h2 className="mt-4 font-serif text-3xl">Claude analysis next</h2>
            <p className="mt-3 text-sm leading-7 text-[#4a453f]">
              In the next step, we will connect this button to a secure server
              API route so your Anthropic API key is never exposed in the browser.
            </p>

            <div className="mt-6 rounded-2xl border border-[#b6ddc8] bg-white/70 p-5">
              <p className="text-sm font-semibold text-[#1a1714]">
                Current portfolio summary
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#4a453f]">
                <div className="flex justify-between">
                  <span>Total invested</span>
                  <strong>{formatCurrency(totals.invested)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current value</span>
                  <strong>{formatCurrency(totals.currentValue)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tax if sold today</span>
                  <strong>{formatCurrency(totals.tax)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>After-tax gain</span>
                  <strong>{formatCurrency(totals.afterTaxGain)}</strong>
                </div>
              </div>
            </div>

            <button
              disabled
              className="mt-6 rounded-full bg-[#1a7a4a] px-6 py-3 text-sm font-semibold text-white opacity-50"
            >
              Run AI Analysis
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
