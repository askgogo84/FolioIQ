export type Holding = {
  schemeCode?: string
  schemeName?: string
  category?: string
  amc?: string
  units?: number
  avgNav?: number
  currentNAV?: number
  investedAmount?: number
  currentValue?: number
  sipAmount?: number
  purchaseDate?: string
}

export type ActionItem = {
  name: string
  reason: string
  action: string
  confidence: 'High' | 'Medium' | 'Low'
}

export type PortfolioDecision = {
  healthScore: number
  riskStyle: 'Conservative' | 'Balanced' | 'Aggressive'
  verdict: string
  simpleSummary: string
  money: {
    invested: number
    current: number
    gain: number
    returnPct: number
  }
  problems: string[]
  review: ActionItem[]
  keep: ActionItem[]
  add: ActionItem[]
  weeklyAction: string
}

export function money(n: number) {
  const num = Number(n || 0)
  if (!num || Number.isNaN(num)) return '₹0'
  const a = Math.abs(num)
  const s = num < 0 ? '-' : ''
  if (a >= 10000000) return `${s}₹${(a / 10000000).toFixed(2)}Cr`
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(2)}L`
  return `${s}₹${a.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export function cleanFundName(name = '') {
  return name
    .replace(/ - Direct.*/i, '')
    .replace(/ Fund/gi, '')
    .replace(/Regular/gi, 'Regular')
    .replace(/Growth/gi, 'Growth')
    .replace(/\s+/g, ' ')
    .trim()
}

export function fundType(name = '', category = '') {
  const s = `${name} ${category}`.toLowerCase()
  if (s.includes('elss') || s.includes('tax saver')) return 'ELSS'
  if (s.includes('small')) return 'Small Cap'
  if (s.includes('mid')) return 'Mid Cap'
  if (s.includes('large') && s.includes('mid')) return 'Large & Mid Cap'
  if (s.includes('flexi')) return 'Flexi Cap'
  if (s.includes('multi cap') || s.includes('multicap')) return 'Multi Cap'
  if (s.includes('index') || s.includes('nifty') || s.includes('sensex')) return 'Index'
  if (s.includes('gold')) return 'Gold'
  if (s.includes('debt') || s.includes('liquid') || s.includes('bond') || s.includes('gilt') || s.includes('short duration')) return 'Debt'
  if (s.includes('technology') || s.includes('infra') || s.includes('sector') || s.includes('thematic')) return 'Thematic'
  return 'Equity'
}

function isRegular(name = '') {
  return /regular|reg\s/i.test(name)
}

function isDividend(name = '') {
  return /dividend|idcw/i.test(name)
}

function returnPct(h: Holding) {
  const invested = Number(h.investedAmount || 0)
  const current = Number(h.currentValue || 0)
  if (!invested) return 0
  return ((current - invested) / invested) * 100
}

function getCounts(holdings: Holding[]) {
  const counts: Record<string, number> = {}
  holdings.forEach((h) => {
    const t = fundType(h.schemeName, h.category)
    counts[t] = (counts[t] || 0) + 1
  })
  return counts
}

function inferRiskStyle(holdings: Holding[]): 'Conservative' | 'Balanced' | 'Aggressive' {
  if (!holdings.length) return 'Balanced'
  const value = holdings.reduce((s, h) => s + Number(h.currentValue || h.investedAmount || 0), 0) || 1
  const highRisk = holdings
    .filter((h) => ['Small Cap', 'Mid Cap', 'Thematic'].includes(fundType(h.schemeName, h.category)))
    .reduce((s, h) => s + Number(h.currentValue || h.investedAmount || 0), 0)
  const debt = holdings
    .filter((h) => ['Debt', 'Gold'].includes(fundType(h.schemeName, h.category)))
    .reduce((s, h) => s + Number(h.currentValue || h.investedAmount || 0), 0)

  const highRiskPct = highRisk / value
  const cushionPct = debt / value

  if (highRiskPct > 0.45) return 'Aggressive'
  if (cushionPct > 0.25) return 'Conservative'
  return 'Balanced'
}

function score(holdings: Holding[], problems: string[]) {
  if (!holdings.length) return 0
  let s = 82
  const counts = getCounts(holdings)
  const amcs = new Set(holdings.map((h) => h.amc || h.schemeName?.split(' ')?.[0]).filter(Boolean)).size

  if (holdings.length > 8) s -= 10
  if (holdings.length > 12) s -= 12
  if (holdings.length > 16) s -= 8
  if ((counts['Small Cap'] || 0) > 3) s -= 10
  if ((counts['ELSS'] || 0) > 2) s -= 10
  if ((counts['Thematic'] || 0) > 2) s -= 8
  if (!(counts['Debt'] || 0)) s -= 8
  if (!(counts['Index'] || 0)) s -= 6
  if (amcs < 3 && holdings.length > 4) s -= 8
  s -= Math.min(10, problems.length * 2)

  return Math.max(18, Math.min(96, Math.round(s)))
}

export function analysePortfolio(holdings: Holding[]): PortfolioDecision {
  const invested = holdings.reduce((sum, h) => sum + Number(h.investedAmount || 0), 0)
  const current = holdings.reduce((sum, h) => sum + Number(h.currentValue || h.investedAmount || 0), 0)
  const gain = current - invested
  const returnPercentage = invested ? (gain / invested) * 100 : 0
  const counts = getCounts(holdings)
  const problems: string[] = []

  if (!holdings.length) {
    return {
      healthScore: 0,
      riskStyle: 'Balanced',
      verdict: 'Add your portfolio first.',
      simpleSummary: 'Upload or add your mutual funds. FolioIQ will then tell you what to keep, review and add.',
      money: { invested: 0, current: 0, gain: 0, returnPct: 0 },
      problems: [],
      review: [],
      keep: [],
      add: [],
      weeklyAction: 'Upload your portfolio statement or add your first fund.',
    }
  }

  if (holdings.length > 8) problems.push(`You have ${holdings.length} funds. Most people only need 6–8 well-chosen funds.`)
  if ((counts['ELSS'] || 0) > 2) problems.push(`You have ${counts['ELSS']} tax-saver funds. This creates clutter.`)
  if ((counts['Small Cap'] || 0) > 3) problems.push(`You have ${counts['Small Cap']} small-cap funds. This can move sharply in bad markets.`)
  if ((counts['Thematic'] || 0) > 2) problems.push(`You have many sector/theme funds. These are risky if held without a clear reason.`)
  if (!(counts['Debt'] || 0)) problems.push('No debt or cushion fund is visible. Add stability.')
  if (!(counts['Index'] || 0)) problems.push('No simple low-cost index fund is visible.')

  const review: ActionItem[] = []
  const keep: ActionItem[] = []
  const seenType: Record<string, number> = {}

  const sorted = [...holdings].sort((a, b) => returnPct(a) - returnPct(b))

  sorted.forEach((h) => {
    const name = cleanFundName(h.schemeName)
    const type = fundType(h.schemeName, h.category)
    const r = returnPct(h)
    seenType[type] = (seenType[type] || 0) + 1

    if (review.length < 6 && isDividend(h.schemeName)) {
      review.push({ name, reason: 'Dividend/IDCW plans are usually tax-inefficient.', action: 'Switch future money to Growth option.', confidence: 'High' })
      return
    }

    if (review.length < 6 && isRegular(h.schemeName)) {
      review.push({ name, reason: 'Regular plan may have higher commission cost.', action: 'Check if Direct Growth version is available.', confidence: 'High' })
      return
    }

    if (review.length < 6 && type === 'ELSS' && seenType[type] > 2) {
      review.push({ name, reason: 'Duplicate tax-saving fund. Too many ELSS funds reduce clarity.', action: 'Keep only 1–2 strongest ELSS funds.', confidence: 'Medium' })
      return
    }

    if (review.length < 6 && type === 'Small Cap' && seenType[type] > 3) {
      review.push({ name, reason: 'Too much small-cap exposure can be risky.', action: 'Reduce and keep only best small-cap exposure.', confidence: 'Medium' })
      return
    }

    if (review.length < 6 && r < -5) {
      review.push({ name, reason: 'This fund is showing weak returns in your portfolio.', action: 'Review before adding more SIP.', confidence: 'Medium' })
      return
    }

    if (keep.length < 6) {
      keep.push({ name, reason: r >= 0 ? 'This is doing okay in your portfolio.' : 'Not urgent, but monitor.', action: 'Hold for now. Do not add blindly.', confidence: 'Medium' })
    }
  })

  const add: ActionItem[] = []
  if (!(counts['Index'] || 0)) add.push({ name: 'Nifty 50 / Sensex Index Fund', reason: 'Gives simple low-cost core exposure.', action: 'Use as portfolio base.', confidence: 'High' })
  if (!(counts['Debt'] || 0)) add.push({ name: 'Short Duration Debt Fund', reason: 'Adds stability when equity markets fall.', action: 'Use as cushion, not for high returns.', confidence: 'High' })
  if (!(counts['Gold'] || 0)) add.push({ name: 'Small Gold Allocation', reason: 'Useful hedge during uncertain periods.', action: 'Keep allocation small.', confidence: 'Low' })

  const healthScore = score(holdings, problems)
  const riskStyle = inferRiskStyle(holdings)
  const verdict = healthScore >= 75 ? 'Looks good. Needs small cleanup.' : healthScore >= 55 ? 'Decent, but needs simplification.' : 'Needs cleanup. Too many moving parts.'
  const simpleSummary = `${money(invested)} invested is now ${money(current)}. You are ${returnPercentage >= 0 ? 'up' : 'down'} ${Math.abs(returnPercentage).toFixed(1)}%.`
  const weeklyAction = review.length
    ? `This week: review ${review[0].name}. Do not add more money there until you decide.`
    : add.length
      ? `This week: consider adding ${add[0].name} to improve balance.`
      : 'This week: do nothing. Your portfolio looks manageable.'

  return {
    healthScore,
    riskStyle,
    verdict,
    simpleSummary,
    money: { invested, current, gain, returnPct: returnPercentage },
    problems,
    review,
    keep,
    add,
    weeklyAction,
  }
}
