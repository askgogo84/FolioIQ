import { NextResponse } from 'next/server'

const FALLBACK = [
  { name: 'NIFTY 50', value: '24,315.95', change: '+1.12%', up: true },
  { name: 'SENSEX', value: '80,218.37', change: '+1.09%', up: true },
  { name: 'NIFTY MIDCAP', value: '17,842.20', change: '+0.87%', up: true },
  { name: 'SMALLCAP 250', value: '9,421.55', change: '+1.34%', up: true },
  { name: 'GOLD', value: '₹9,342/g', change: '+0.34%', up: true },
  { name: 'USD/INR', value: '₹83.42', change: '-0.12%', up: false },
  { name: 'NIFTY IT', value: '38,621.40', change: '-0.54%', up: false },
  { name: '10Y G-SEC', value: '6.87%', change: '-0.04%', up: false },
]

export async function GET() {
  try {
    const symbols = [
      { sym: '^NSEI', name: 'NIFTY 50' },
      { sym: '^BSESN', name: 'SENSEX' },
      { sym: 'GC=F', name: 'GOLD' },
      { sym: 'USDINR=X', name: 'USD/INR' },
    ]

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const results = await Promise.allSettled(
      symbols.map(async ({ sym, name }) => {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: controller.signal }
        )
        if (!r.ok) throw new Error('fetch failed')
        const data = await r.json()
        const meta = data.result?.[0]?.meta
        if (!meta) throw new Error('no meta')
        const price = meta.regularMarketPrice
        const prev = meta.chartPreviousClose || meta.previousClose || price
        const changePct = ((price - prev) / prev) * 100
        return {
          name,
          value: name === 'USD/INR' ? `₹${price.toFixed(2)}`
            : name === 'GOLD' ? `₹${Math.round(price * 83.5)}/10g`
            : price.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
          change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
          up: changePct >= 0,
        }
      })
    )
    clearTimeout(timeout)

    // Merge live results with fallback
    const live = results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : FALLBACK[i]
    )
    
    // Add static items not from Yahoo
    const indices = [
      ...live,
      { name: 'NIFTY MIDCAP', value: '17,842.20', change: '+0.87%', up: true },
      { name: 'SMALLCAP 250', value: '9,421.55', change: '+1.34%', up: true },
      { name: 'NIFTY IT', value: '38,621.40', change: '-0.54%', up: false },
      { name: '10Y G-SEC', value: '6.87%', change: '-0.04%', up: false },
    ]

    return NextResponse.json({ indices, ts: Date.now() })
  } catch {
    return NextResponse.json({ indices: FALLBACK, ts: Date.now() })
  }
}
