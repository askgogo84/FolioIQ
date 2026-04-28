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
  priority: 'High' | 'Medium' | 'Low'
  impact: string
  why: string[]
}

export type PortfolioDecision = {
  healthScore: number
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
  confidenceScore: number
  logic: string[]
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
  return name.replace(/ - Direct.*/i, '').replace(/ Fund/gi, '').replace(/\s+/g, ' ').trim()
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
  if (s.includes('debt') || s.includes('liquid') || s.includes('bond') || s.includes('gilt') || s.includes('short duration')) return 'Debt'
  if (s.includes('technology') || s.includes('infra') || s.includes('sector') || s.includes('thematic')) return 'Thematic'
  return 'Equity'
}

function isRegular(name = '') { return /regular|reg\s/i.test(name) }
function isDividend(name = '') { return /dividend|idcw/i.test(name) }
function returnPct(h: Holding) { const i = Number(h.investedAmount || 0); const c = Number(h.currentValue || 0); return i ? ((c - i) / i) * 100 : 0 }
function getCounts(holdings: Holding[]) { const counts: Record<string, number> = {}; holdings.forEach((h) => { const t = fundType(h.schemeName, h.category); counts[t] = (counts[t] || 0) + 1 }); return counts }
function valueByType(holdings: Holding[]) { const values: Record<string, number> = {}; holdings.forEach((h) => { const t = fundType(h.schemeName, h.category); values[t] = (values[t] || 0) + Number(h.currentValue || h.investedAmount || 0) }); return values }

function inferRiskStyle(holdings: Holding[]): 'Conservative' | 'Balanced' | 'Aggressive' {
  if (!holdings.length) return 'Balanced'
  const value = holdings.reduce((s, h) => s + Number(h.currentValue || h.investedAmount || 0), 0) || 1
  const values = valueByType(holdings)
  const highRiskPct = ((values['Small Cap'] || 0) + (values['Mid Cap'] || 0) + (values['Thematic'] || 0)) / value
  const cushionPct = ((values['Debt'] || 0) + (values['Gold'] || 0)) / value
  if (highRiskPct > 0.42) return 'Aggressive'
  if (cushionPct > 0.25) return 'Conservative'
  return 'Balanced'
}

function score(holdings: Holding[], problems: string[]) {
  if (!holdings.length) return 0
  let s = 86
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
  if (!(counts['International'] || 0)) s -= 4
  if (amcs < 3 && holdings.length > 4) s -= 8
  s -= Math.min(8, problems.length * 2)
  return Math.max(18, Math.min(96, Math.round(s)))
}

function action(name: string, reason: string, action: string, confidence: 'High'|'Medium'|'Low', priority: 'High'|'Medium'|'Low', impact: string, why: string[]): ActionItem {
  return { name, reason, action, confidence, priority, impact, why }
}

export function analysePortfolio(holdings: Holding[]): PortfolioDecision {
  const invested = holdings.reduce((sum, h) => sum + Number(h.investedAmount || 0), 0)
  const current = holdings.reduce((sum, h) => sum + Number(h.currentValue || h.investedAmount || 0), 0)
  const gain = current - invested
  const returnPercentage = invested ? (gain / invested) * 100 : 0
  const counts = getCounts(holdings)
  const problems: string[] = []

  if (!holdings.length) {
    return { healthScore: 0, riskStyle: 'Balanced', verdict: 'Add your portfolio first.', plainEnglishVerdict: 'Upload your funds and FolioIQ will tell you what to fix first.', simpleSummary: 'No portfolio found yet.', money: { invested: 0, current: 0, gain: 0, returnPct: 0 }, problems: [], review: [], keep: [], add: [], weeklyAction: 'Upload your portfolio statement or add your first fund.', confidenceScore: 0, logic: ['No portfolio data found yet.'] }
  }

  if (holdings.length > 8) problems.push(`You have ${holdings.length} funds. Most people only need 6–8 funds.`)
  if ((counts['ELSS'] || 0) > 2) problems.push(`You have ${counts['ELSS']} tax-saver funds. Keep only 1–2.`)
  if ((counts['Small Cap'] || 0) > 3) problems.push('Small-cap exposure is high. This can fall sharply in bad markets.')
  if ((counts['Thematic'] || 0) > 2) problems.push('Too many sector/theme bets. These should not dominate a portfolio.')
  if (!counts['Debt']) problems.push('No debt/cushion fund. Portfolio may feel too volatile.')
  if (!counts['Index']) problems.push('No low-cost index core. Add a simple base fund.')
  if (!counts['International']) problems.push('No global exposure. Portfolio depends only on India.')

  const review: ActionItem[] = []
  const keep: ActionItem[] = []
  const seenType: Record<string, number> = {}
  const sorted = [...holdings].sort((a, b) => returnPct(a) - returnPct(b))

  sorted.forEach((h) => {
    const name = cleanFundName(h.schemeName)
    const type = fundType(h.schemeName, h.category)
    const r = returnPct(h)
    seenType[type] = (seenType[type] || 0) + 1

    if (review.length < 3 && isDividend(h.schemeName)) { review.push(action(name, 'Dividend/IDCW plan is usually not tax-friendly.', 'Use Growth option for future investments.', 'High', 'High', 'Can reduce tax leakage and improve compounding clarity.', ['Dividend payouts may create tax leakage.', 'Growth option is simpler for compounding.'])); return }
    if (review.length < 3 && isRegular(h.schemeName)) { review.push(action(name, 'Regular plan may have higher commission cost.', 'Compare with Direct Growth version.', 'High', 'High', 'Can improve long-term compounding by reducing hidden cost.', ['Direct funds usually have lower expense ratios.', 'Cost difference compounds over years.'])); return }
    if (review.length < 3 && type === 'ELSS' && seenType[type] > 2) { review.push(action(name, 'Duplicate tax-saving fund.', 'Keep only 1–2 ELSS funds.', 'Medium', 'Medium', 'Reduces clutter and lock-in confusion.', ['Too many ELSS funds creates clutter.', 'ELSS has lock-in, so be selective.'])); return }
    if (review.length < 3 && type === 'Small Cap' && seenType[type] > 3) { review.push(action(name, 'Too much small-cap exposure.', 'Reduce small-cap count.', 'Medium', 'Medium', 'Can reduce portfolio volatility.', ['Small caps can fall sharply.', 'You need controlled allocation, not many similar funds.'])); return }
    if (review.length < 3 && r < -5) { review.push(action(name, 'Weak return in your portfolio.', 'Pause extra SIP until reviewed.', 'Medium', 'Medium', 'Prevents adding more to a weak holding blindly.', ['This fund is lagging in your portfolio.', 'Do not add more just because it is down.'])); return }
    if (keep.length < 3) keep.push(action(name, r >= 0 ? 'Doing okay for now.' : 'Not urgent, but monitor.', 'Hold. Do not add blindly.', 'Medium', 'Low', 'Keeps portfolio stable while you fix bigger issues.', ['No immediate red flag found.', 'Keep only if it fits your final allocation.']))
  })

  const add: ActionItem[] = []
  if (!counts['Index']) add.push(action('Low-cost Nifty 50 / Sensex index fund', 'Missing simple core allocation.', 'Shortlist funds with low expense ratio and low tracking error.', 'High', 'High', 'Creates a clean base for the portfolio.', ['Check expense ratio.', 'Check tracking error.', 'Prefer Direct Growth if suitable.']))
  if (!counts['Debt']) add.push(action('Short-duration debt / corporate bond fund', 'Missing stability cushion.', 'Use for stability, not for high returns.', 'High', 'Medium', 'Can reduce portfolio shock during equity falls.', ['Check credit quality.', 'Avoid chasing high yield.', 'Match with your time horizon.']))
  if (!counts['International']) add.push(action('International index exposure', 'Missing global diversification.', 'Keep allocation small and understand taxation.', 'Medium', 'Low', 'Reduces dependence on only Indian equities.', ['Check cost.', 'Check taxation.', 'Do not over-allocate.']))

  const healthScore = score(holdings, problems)
  const riskStyle = inferRiskStyle(holdings)
  const verdict = healthScore >= 75 ? 'Mostly fine. Just simplify a little.' : healthScore >= 55 ? 'Decent, but needs cleanup.' : 'Needs cleanup. Too many moving parts.'
  const plainEnglishVerdict = healthScore >= 75 ? 'You are mostly on track. Fix one or two small things.' : healthScore >= 55 ? 'Your portfolio is not bad, but it has avoidable clutter.' : 'Your portfolio is doing too many things at once. Simplify first.'
  const simpleSummary = `${money(invested)} invested is now ${money(current)}. You are ${returnPercentage >= 0 ? 'up' : 'down'} ${Math.abs(returnPercentage).toFixed(1)}%.`
  const weeklyAction = review.length ? `This week: start with ${review[0].name}. ${review[0].action}` : add.length ? `This week: research ${add[0].name}.` : 'This week: do nothing. Your portfolio looks manageable.'
  const confidenceScore = Math.min(95, Math.max(40, 70 + review.filter((x) => x.confidence === 'High').length * 8 + problems.length * 2))
  const logic = ['We infer risk style from your existing fund mix.', 'We check clutter: too many funds, duplicate ELSS, small-cap overload and sector bets.', 'We check missing building blocks: low-cost index core, debt cushion and global exposure.', 'We show category-first alternatives, not blind fund switching.', 'Output is limited to Fix / Keep / Explore so users can act quickly.']

  return { healthScore, riskStyle, verdict, plainEnglishVerdict, simpleSummary, money: { invested, current, gain, returnPct: returnPercentage }, problems, review, keep, add, weeklyAction, confidenceScore, logic }
}
