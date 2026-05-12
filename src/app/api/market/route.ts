import { NextResponse } from 'next/server'

// Fetch live market data from multiple public sources
export async function GET() {
  try {
    // Use Yahoo Finance API (no auth needed for Indian indices)
    const symbols = [
      { sym: '^NSEI', name: 'NIFTY 50' },
      { sym: '^BSESN', name: 'SENSEX' },
      { sym: 'NIFTYMIDCAP150.NS', name: 'NIFTY MIDCAP' },
      { sym: 'NIFTYSMALLCAP250.NS', name: 'SMALLCAP 250' },
      { sym: 'GC=F', name: 'GOLD' },
      { sym: 'USDINR=X', name: 'USD/INR' },
    ]

    const results = await Promise.allSettled(
      symbols.map(async ({ sym, name }) => {
        const r = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=2d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
        )
        if (!r.ok) throw new Error('fetch failed')
        const data = await r.json()
        const meta = data.result?.[0]?.meta
        if (!meta) throw new Error('no meta')
        const price = meta.regularMarketPrice
        const prev = meta.chartPreviousClose || meta.previousClose
        const change = price - prev
        const changePct = (change / prev) * 100
        return {
          name,
          value: sym === 'USDINR=X' ? price.toFixed(2) : sym === 'GC=F'
            ? `$${price.toFixed(0)}`
            : price >= 1000 ? price.toLocaleString('en-IN', { maximumFractionDigits: 2 })
            : price.toFixed(2),
          change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
          up: changePct >= 0,
          raw: price,
        }
      })
    )

    const indices = results.map((r, i) => 
      r.status === 'fulfilled' ? r.value : {
        name: symbols[i].name, value: '--', change: '--', up: true, raw: 0
      }
    )

    return NextResponse.json({ indices, ts: Date.now() })
  } catch (e) {
    return NextResponse.json({ indices: [], error: 'Failed to fetch' }, { status: 500 })
  }
}
