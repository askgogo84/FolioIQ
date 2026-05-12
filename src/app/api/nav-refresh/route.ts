import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

// Parse AMFI NAV pipe-delimited format
// Format: SchemeCode;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;SchemeName;NAV Date;NAV
function parseAMFI(text: string): Record<string, { nav: number; date: string; name: string; isin: string }> {
  const map: Record<string, { nav: number; date: string; name: string; isin: string }> = {}
  let currentAMC = ''

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    // AMC header lines (not pipe-delimited)
    if (!line.includes(';')) {
      currentAMC = line
      continue
    }

    const parts = line.split(';')
    if (parts.length < 6) continue

    const code = parts[0]?.trim()
    if (!code || !/^\d+$/.test(code)) continue

    const isin = parts[1]?.trim() || parts[2]?.trim() || ''
    const name = parts[3]?.trim() || ''
    const navDate = parts[4]?.trim() || ''
    const navStr = parts[5]?.trim() || ''
    const nav = parseFloat(navStr)

    if (!isNaN(nav) && nav > 0) {
      map[code] = { nav, date: navDate, name, isin }
      // Also index by ISIN
      if (isin && isin.startsWith('INF')) map[isin] = { nav, date: navDate, name, isin }
    }
  }
  return map
}

// POST: Refresh a single user's portfolio NAVs
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const admin = createAdminClient()
    const { data: pd } = await admin.from('portfolios').select('data').eq('user_id', user.id).maybeSingle()
    
    if (!pd?.data?.funds?.length) {
      return NextResponse.json({ error: 'No portfolio with scheme codes found' }, { status: 404 })
    }

    const funds = pd.data.funds as any[]
    const hasCodes = funds.some((f: any) => f.schemeCode || f.isin)
    
    if (!hasCodes) {
      return NextResponse.json({ 
        message: 'Portfolio uploaded via XLS — scheme codes not available. Using current values.',
        funds: funds.length 
      })
    }

    // Fetch AMFI NAV
    const navRes = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
      headers: { 'User-Agent': 'FolioIQ/2.0 (https://folio-iq.vercel.app)' },
      cache: 'no-store',
    })

    if (!navRes.ok) throw new Error(`AMFI returned ${navRes.status}`)
    const navText = await navRes.text()
    const navMap = parseAMFI(navText)

    let updatedCount = 0
    const updatedFunds = funds.map((f: any) => {
      const entry = navMap[f.schemeCode] || navMap[f.isin]
      if (!entry || !f.units) return f
      
      const newValue = entry.nav * f.units
      updatedCount++
      return {
        ...f,
        nav: entry.nav,
        value: newValue,
        navDate: entry.date,
        returnsPercent: f.invested > 0 ? ((newValue - f.invested) / f.invested) * 100 : 0,
        lastUpdated: new Date().toISOString(),
      }
    })

    const totalCurrent = updatedFunds.reduce((s: number, f: any) => s + (f.value || 0), 0)
    const totalInvested = updatedFunds.reduce((s: number, f: any) => s + (f.invested || 0), 0)

    await admin.from('portfolios').update({
      data: {
        ...pd.data,
        funds: updatedFunds,
        totalCurrent,
        totalInvested,
        lastNavRefresh: new Date().toISOString(),
        navSource: 'AMFI NAVAll.txt',
      }
    }).eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: funds.length,
      totalValue: totalCurrent,
      gain: totalCurrent - totalInvested,
      gainPct: ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(2) + '%',
      source: 'AMFI NAVAll.txt — updated daily by 5:30PM IST',
    })
  } catch (err) {
    console.error('NAV refresh error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET: Get current NAV for any scheme code or ISIN (public, no auth)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const name = url.searchParams.get('name')

  if (!code && !name) {
    return NextResponse.json({ error: 'Provide ?code= (scheme code) or ?name= (fund name)' }, { status: 400 })
  }

  try {
    // Use mfapi.in for single fund lookups (simpler than parsing full AMFI file)
    if (code) {
      const res = await fetch(`https://api.mfapi.in/mf/${code}`, {
        next: { revalidate: 3600 }
      })
      const data = await res.json()
      return NextResponse.json({
        schemeCode: code,
        name: data.meta?.scheme_name || '',
        amc: data.meta?.fund_house || '',
        category: data.meta?.scheme_category || '',
        nav: parseFloat(data.data?.[0]?.nav || '0'),
        date: data.data?.[0]?.date || '',
        historicalNavs: data.data?.slice(0, 30) || [], // last 30 days
      })
    }

    // Search by name
    const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(name!)}`)
    const results = await searchRes.json()
    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
