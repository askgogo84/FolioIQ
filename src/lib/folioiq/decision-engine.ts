export type Holding = {
  schemeCode?: string
  schemeName?: string
  originalName?: string
  category?: string
  amc?: string
  units?: number
  avgNav?: number
  currentNAV?: number
  investedAmount?: number
  currentValue?: number
  sipAmount?: number
  purchaseDate?: string
  preEnriched?: boolean
  matchConfidence?: 'high' | 'medium' | 'low'
}

export type ActionItem = {
  name: string
  reason: string
  action: string
  confidence: 'High' | 'Medium' | 'Low'
  priority: 'High' | 'Medium' | 'Low'
  impact: string
  why: string[]
  score?: number
  estimatedLeakage?: number
}

export type PortfolioDecision = {
  healthScore: number
  confidenceScore: number
  riskStyle: 'Conservative' | 'Balanced' | 'Aggressive'
  verdict: string
  plainEnglishVerdict: string
  simpleSummary: string
  money: { invested: number; current: number; gain: number; returnPct: number }
  problems: string[]
  review: ActionItem[]
  keep: ActionItem[]
  add: ActionItem[]
  weeklyAction: string
  trustSummary: string
  estimatedAnnualLeakage: number
  concentrationWarning?: string
  logic: string[]
}

type FundScore = {
  holding: Holding
  name: string
  type: string
  returnPct: number
  value: number
  performanceScore: number
  costScore: number
  overlapScore: number
  riskScore: number
  consistencyScore: number
  totalScore: number
  flags: string[]
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
    .replace(/\s+-\s+(Direct|Regular|Growth|IDCW|Dividend).*/i, '')
    .replace(/\s+Fund$/gi, '')
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
  if (s.includes('nasdaq') || s.includes('international') || s.includes('global') || s.includes('us ')) return 'International'
  if (s.includes('debt') || s.includes('liquid') || s.includes('bond') || s.includes('gilt') || s.includes('short duration') || s.includes('money market')) return 'Debt'
  if (s.includes('technology') || s.includes('infra') || s.includes('sector') || s.includes('thematic') || s.includes('pharma') || s.includes('banking')) return 'Thematic'
  return 'Equity'
}

function isRegular(name = '') { return /regular|reg\s/i.test(name) }
function isDividend(name = '') { return /dividend|idcw/i.test(name) }
function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }
function returnPct(h: Holding) {
  const i = Number(h.investedAmount || 0)
  const c = Number(h.currentValue || h.investedAmount || 0)
  return i ? ((c - i) / i) * 100 : 0
}
function holdingValue(h: Holding) { return Number(h.currentValue || h.investedAmount || 0) }
function getCounts(holdings: Holding[]) {
  const counts: Record<string, number> = {}
  holdings.forEach((h) => { const t = fundType(h.schemeName || h.originalName, h.category); counts[t] = (counts[t] || 0) + 1 })
  return counts
}
function valueByType(holdings: Holding[]) {
  const values: Record<string, number> = {}
  holdings.forEach((h) => { const t = fundType(h.schemeName || h.originalName, h.category); values[t] = (values[t] || 0) + holdingValue(h) })
  return values
}

function inferRiskStyle(holdings: Holding[]): 'Conservative' | 'Balanced' | 'Aggressive' {
  if (!holdings.length) return 'Balanced'
  const value = holdings.reduce((s, h) => s + holdingValue(h), 0) || 1
  const values = valueByType(holdings)
  const highRiskPct = ((values['Small Cap'] || 0) + (values['Mid Cap'] || 0) + (values['Thematic'] || 0)) / value
  const cushionPct = ((values['Debt'] || 0) + (values['Gold'] || 0)) / value
  if (highRiskPct > 0.4) return 'Aggressive'
  if (cushionPct > 0.22) return 'Conservative'
  return 'Balanced'
}

function scoreFund(h: Holding, typeCount: number, portfolioValue: number): FundScore {
  const name = cleanFundName(h.schemeName || h.originalName || 'Mutual fund')
  const type = fundType(h.schemeName || h.originalName, h.category)
  const r = returnPct(h)
  const value = holdingValue(h)
  const weight = portfolioValue ? value / portfolioValue : 0
  const flags: string[] = []

  let performanceScore = 72
  if (r > 18) performanceScore += 16
  else if (r > 10) performanceScore += 10
  else if (r > 3) performanceScore += 4
  else if (r < -8) performanceScore -= 24
  else if (r < 0) performanceScore -= 12

  let costScore = 86
  if (isRegular(h.schemeName || h.originalName)) { costScore -= 24; flags.push('Regular plan cost drag') }
  if (isDividend(h.schemeName || h.originalName)) { costScore -= 20; flags.push('IDCW/dividend plan') }

  let overlapScore = 86
  if (typeCount > 3 && ['Small Cap', 'Mid Cap', 'ELSS', 'Thematic', 'Equity'].includes(type)) { overlapScore -= 18; flags.push(`Too many ${type} funds`) }
  if (typeCount > 2 && type === 'ELSS') { overlapScore -= 20; flags.push('Duplicate tax-saving fund') }

  let riskScore = 82
  if (['Small Cap', 'Thematic'].includes(type)) riskScore -= 14
  if (['Debt', 'Index'].includes(type)) riskScore += 6
  if (weight > 0.28 && !['Debt', 'Index'].includes(type)) { riskScore -= 14; flags.push('High single-fund concentration') }

  let consistencyScore = 74
  if (Number(h.sipAmount || 0) > 0) consistencyScore += 8
  if (Number(h.units || 0) <= 0) { consistencyScore -= 14; flags.push('Low data quality') }
  if (!h.schemeCode) { consistencyScore -= 10; flags.push('Scheme not confidently matched') }

  const totalScore = Math.round(
    performanceScore * 0.26 + costScore * 0.22 + overlapScore * 0.2 + riskScore * 0.18 + consistencyScore * 0.14
  )

  return {
    holding: h,
    name,
    type,
    returnPct: r,
    value,
    performanceScore: clamp(performanceScore, 0, 100),
    costScore: clamp(costScore, 0, 100),
    overlapScore: clamp(overlapScore, 0, 100),
    riskScore: clamp(riskScore, 0, 100),
    consistencyScore: clamp(consistencyScore, 0, 100),
    totalScore: clamp(totalScore, 0, 100),
    flags,
  }
}

function action(name: string, reason: string, action: string, confidence: 'High'|'Medium'|'Low', priority: 'High'|'Medium'|'Low', impact: string, why: string[], score?: number, estimatedLeakage?: number): ActionItem {
  return { name, reason, action, confidence, priority, impact, why, score, estimatedLeakage }
}

function buildPortfolioHealth(fundScores: FundScore[], problems: string[], holdings: Holding[]) {
  if (!fundScores.length) return 0
  const weighted = fundScores.reduce((sum, f) => sum + f.totalScore * (f.value || 1), 0) / fundScores.reduce((sum, f) => sum + (f.value || 1), 0)
  let s = weighted
  if (holdings.length > 8) s -= 6
  if (holdings.length > 12) s -= 8
  if (holdings.length > 16) s -= 6
  s -= Math.min(14, problems.length * 2)
  return clamp(Math.round(s), 18, 96)
}

export function analysePortfolio(holdings: Holding[]): PortfolioDecision {
  const invested = holdings.reduce((sum, h) => sum + Number(h.investedAmount || 0), 0)
  const current = holdings.reduce((sum, h) => sum + holdingValue(h), 0)
  const gain = current - invested
  const returnPercentage = invested ? (gain / invested) * 100 : 0
  const counts = getCounts(holdings)
  const values = valueByType(holdings)
  const problems: string[] = []

  if (!holdings.length) {
    return {
      healthScore: 0,
      confidenceScore: 0,
      riskStyle: 'Balanced',
      verdict: 'Add your portfolio first.',
      plainEnglishVerdict: 'Upload your funds and FolioIQ will tell you what to fix first.',
      simpleSummary: 'No portfolio found yet.',
      money: { invested: 0, current: 0, gain: 0, returnPct: 0 },
      problems: [],
      review: [],
      keep: [],
      add: [],
      weeklyAction: 'Upload your portfolio statement or add your first fund.',
      trustSummary: 'No analysis yet because no portfolio was detected.',
      estimatedAnnualLeakage: 0,
      logic: ['No portfolio data found yet.'],
    }
  }

  if (holdings.length > 8) problems.push(`You have ${holdings.length} funds. Most portfolios are easier to manage with 6–8 funds.`)
  if ((counts['ELSS'] || 0) > 2) problems.push(`You have ${counts['ELSS']} tax-saver funds. Keep only 1–2.`)
  if ((counts['Small Cap'] || 0) > 3) problems.push('Small-cap exposure is high. This can fall sharply in weak markets.')
  if ((counts['Thematic'] || 0) > 2) problems.push('Too many sector/theme bets. These should not dominate a portfolio.')
  if (!counts['Debt']) problems.push('No debt/cushion fund. Portfolio may feel too volatile.')
  if (!counts['Index']) problems.push('No low-cost index core. Add a simple base fund.')
  if (!counts['International']) problems.push('No global exposure. Portfolio depends only on India.')

  const highRiskValue = (values['Small Cap'] || 0) + (values['Mid Cap'] || 0) + (values['Thematic'] || 0)
  const highRiskPct = current ? highRiskValue / current : 0
  const concentrationWarning = highRiskPct > 0.42 ? `About ${Math.round(highRiskPct * 100)}% of your portfolio is in higher-risk categories.` : undefined
  if (concentrationWarning) problems.push(concentrationWarning)

  const fundScores = holdings
    .map((h) => scoreFund(h, counts[fundType(h.schemeName || h.originalName, h.category)] || 1, current || invested || 1))
    .sort((a, b) => a.totalScore - b.totalScore)

  const estimatedAnnualLeakage = Math.round(
    holdings.reduce((sum, h) => sum + (isRegular(h.schemeName || h.originalName) ? holdingValue(h) * 0.0075 : 0), 0)
  )

  const review: ActionItem[] = []
  for (const f of fundScores) {
    if (review.length >= 4) break
    const h = f.holding
    if (isDividend(h.schemeName || h.originalName)) {
      review.push(action(f.name, 'IDCW/dividend option usually weakens compounding clarity.', 'Switch future investments to Growth option after checking tax impact.', 'High', 'High', 'Cleaner compounding and fewer tax surprises.', ['IDCW payouts can interrupt compounding.', 'Growth option is simpler for long-term investing.'], f.totalScore))
      continue
    }
    if (isRegular(h.schemeName || h.originalName)) {
      const leakage = Math.round(holdingValue(h) * 0.0075)
      review.push(action(f.name, 'Regular plan may be leaking cost every year.', 'Compare with Direct Growth version before your next SIP.', 'High', 'High', `Potential annual cost drag around ${money(leakage)}.`, ['Regular plans often have higher expense ratios.', 'Even small cost gaps compound over years.'], f.totalScore, leakage))
      continue
    }
    if (f.flags.includes(`Too many ${f.type} funds`) || f.flags.includes('Duplicate tax-saving fund')) {
      review.push(action(f.name, `This looks like overlap in ${f.type}.`, 'Do not add more. Compare with similar funds and keep the strongest one.', 'Medium', 'Medium', 'Reduces clutter and makes decisions easier.', ['Too many similar funds do not always reduce risk.', 'Overlap makes it harder to know what is actually working.'], f.totalScore))
      continue
    }
    if (f.returnPct < -5) {
      review.push(action(f.name, 'This holding is lagging inside your portfolio.', 'Pause fresh additions until you compare it with category alternatives.', 'Medium', 'Medium', 'Stops blind averaging into weak funds.', ['Negative return alone is not a sell signal.', 'But weak funds should not keep receiving fresh SIPs without review.'], f.totalScore))
      continue
    }
    if (f.totalScore < 62) {
      review.push(action(f.name, 'This fund has multiple small red flags.', 'Put it on review before adding more money.', 'Medium', 'Medium', 'Improves portfolio quality before increasing allocation.', f.flags.length ? f.flags : ['Score is weak across cost, overlap, risk, or consistency.'], f.totalScore))
    }
  }

  const keep = fundScores
    .filter((f) => f.totalScore >= 68 && !isRegular(f.holding.schemeName || f.holding.originalName) && !isDividend(f.holding.schemeName || f.holding.originalName))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 4)
    .map((f) => action(
      f.name,
      f.returnPct >= 0 ? 'No urgent red flag detected.' : 'Not perfect, but not the first problem to fix.',
      'Hold. Do not add blindly until final allocation is clear.',
      f.totalScore >= 78 ? 'High' : 'Medium',
      'Low',
      'Keeps the portfolio stable while you fix higher-impact issues.',
      [`Score: ${f.totalScore}/100`, `Category: ${f.type}`, 'No immediate action needed.'],
      f.totalScore,
    ))

  const add: ActionItem[] = []
  if (!counts['Index']) add.push(action('Low-cost Nifty 50 / Sensex index fund', 'Missing simple core allocation.', 'Shortlist Direct Growth funds with low expense ratio and low tracking error.', 'High', 'High', 'Creates a clean base for the portfolio.', ['Index core reduces dependence on fund-manager calls.', 'Low cost matters over long periods.'], 84))
  if (!counts['Debt']) add.push(action('Short-duration debt / corporate bond fund', 'Missing stability cushion.', 'Use it for stability, not high returns.', 'High', 'Medium', 'Can reduce shock when equities fall.', ['Debt allocation can reduce volatility.', 'Avoid chasing high-yield credit risk.'], 78))
  if (!counts['International']) add.push(action('Small international index exposure', 'Missing global diversification.', 'Keep allocation modest and understand taxation.', 'Medium', 'Low', 'Reduces dependence on only Indian equities.', ['Global exposure adds diversification.', 'Costs and taxation need checking.'], 70))

  const healthScore = buildPortfolioHealth(fundScores, problems, holdings)
  const riskStyle = inferRiskStyle(holdings)
  const verdict = healthScore >= 78 ? 'Mostly fine. Just simplify a little.' : healthScore >= 58 ? 'Decent portfolio, but needs cleanup.' : 'Needs cleanup before adding more money.'
  const plainEnglishVerdict = healthScore >= 78 ? 'You are mostly on track. Fix one or two small things.' : healthScore >= 58 ? 'Your portfolio is not bad, but it has avoidable clutter.' : 'Your portfolio is doing too many things at once. Simplify first.'
  const simpleSummary = `${money(invested)} invested is now ${money(current)}. You are ${returnPercentage >= 0 ? 'up' : 'down'} ${Math.abs(returnPercentage).toFixed(1)}%.`
  const weeklyAction = review.length ? `Start here: ${review[0].name}. ${review[0].action}` : add.length ? `Start here: research ${add[0].name}.` : 'Start here: do nothing. Your portfolio looks manageable.'
  const dataConfidence = holdings.filter((h) => h.schemeCode && Number(h.units || 0) > 0).length / holdings.length
  const confidenceScore = clamp(Math.round(62 + dataConfidence * 23 + Math.min(10, holdings.length)), 45, 96)
  const trustSummary = `We scored ${holdings.length} funds across performance, cost, overlap, risk and consistency. ${review.length ? 'Your first action is selected by highest fix-impact.' : 'No urgent fix was detected.'}`
  const logic = [
    'Performance score checks whether the holding is helping or dragging your portfolio.',
    'Cost score penalises regular and IDCW/dividend plans because cost and payout structure can hurt compounding.',
    'Overlap score checks duplicate categories such as too many ELSS, small-cap, thematic or similar equity funds.',
    'Risk score checks small-cap/thematic concentration and large single-fund exposure.',
    'Portfolio checks look for over-diversification, missing index core, missing debt cushion and missing global exposure.',
    'FolioIQ shows actions first because the product is designed for decisions, not reports.',
  ]

  return {
    healthScore,
    riskStyle,
    verdict,
    plainEnglishVerdict,
    simpleSummary,
    money: { invested, current, gain, returnPct: returnPercentage },
    problems,
    review,
    keep,
    add,
    weeklyAction,
    confidenceScore,
    trustSummary,
    estimatedAnnualLeakage,
    concentrationWarning,
    logic,
  }
}
