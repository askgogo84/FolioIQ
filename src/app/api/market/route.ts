import { NextResponse } from 'next/server'

// Fallback values — NSE/BSE close on Wed 13 May 2026
const FALLBACK = [
  { name: 'NIFTY 50',   value: '23,412.60', change: '+0.14%', up: true },
  { name: 'SENSEX',     value: '74,608.98', change: '+0.07%', up: true },
  { name: 'NIFTY BANK', value: '53,456.15', change: '-0.27%', up: false },
  { name: 'NIFTY IT',   value: '29,394.20', change: '+1.21%', up: true },
  { name: 'INDIA VIX',  value: '19.42',     change: '+0.75%', up: false },
  { name: 'GOLD',       value: '₹1,62,010', change: '+4.52%', up: true },
  { name: 'USD/INR',    value: '₹95.71',    change: '+0.43%', up: false },
  { name: 'BTC/USD',    value: '$79,547',   change: '-1.60%', up: false },
  ]

export async function GET() {
    try {
          const symbols = [
            { sym: '^NSEI',    name: 'NIFTY 50' },
            { sym: '^BSESN',   name: 'SENSEX' },
            { sym: '^NSEBANK', name: 'NIFTY BANK' },
            { sym: '^CNXIT',   name: 'NIFTY IT' },
            { sym: '^INDIAVIX', name: 'INDIA VIX' },
            { sym: 'GC=F',     name: 'GOLD' },
            { sym: 'USDINR=X', name: 'USD/INR' },
            { sym: 'BTC-USD',  name: 'BTC/USD' },
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
                                    value: price.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                                    change: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
                                    up: changePct >= 0,
                        }
              })
            )

      clearTimeout(timeout)

      const data = results.map((r, i) =>
              r.status === 'fulfilled' ? r.value : FALLBACK[i]
                                   )

      return NextResponse.json(data, {
              headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
      })
    } catch {
          return NextResponse.json(FALLBACK, {
                  headers: { 'Cache-Control': 's-maxage=60' },
          })
    }
}
