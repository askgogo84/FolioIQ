import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// AMFI NAV is published daily as a pipe-delimited text file — completely free, no auth needed
const AMFI_NAV_URL = 'https://www.amfiindia.com/spages/NAVAll.txt'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const admin = createAdminClient()

    // Get user's portfolio
    const { data: pd } = await admin.from('portfolios').select('data, raw_cas').eq('user_id', userId).maybeSingle()
    if (!pd?.data?.funds) return NextResponse.json({ error: 'No portfolio found' }, { status: 404 })

    const funds = pd.data.funds as any[]
    const schemeCodes = funds.map((f: any) => f.schemeCode).filter(Boolean)

    if (schemeCodes.length === 0) {
      return NextResponse.json({ message: 'No scheme codes to refresh', funds: funds.length })
    }

    // Fetch AMFI NAV file
    const navRes = await fetch(AMFI_NAV_URL, {
      headers: { 'User-Agent': 'FolioIQ NAV Refresh' },
      next: { revalidate: 3600 } // cache 1hr
    })

    if (!navRes.ok) throw new Error('AMFI NAV fetch failed')
    const navText = await navRes.text()

    // Parse AMFI NAV format:
    // SchemeCode;ISIN;ISIN2;SchemeName;NAVDate;NAV
    const navMap: Record<string, { nav: number; date: string; name: string }> = {}
    for (const line of navText.split('\n')) {
      const parts = line.split(';')
      if (parts.length >= 6 && parts[0] && !isNaN(Number(parts[0]))) {
        const code = parts[0].trim()
        const nav = parseFloat(parts[4])
        const date = parts[5]?.trim() || ''
        const name = parts[3]?.trim() || ''
        if (!isNaN(nav) && nav > 0) {
          navMap[code] = { nav, date, name }
        }
      }
    }

    // Update fund values with fresh NAVs
    let updatedCount = 0
    const updatedFunds = funds.map((f: any) => {
      if (f.schemeCode && navMap[f.schemeCode]) {
        const { nav, date } = navMap[f.schemeCode]
        const newValue = nav * (f.units || 0)
        updatedCount++
        return {
          ...f,
          nav,
          value: newValue,
          returnsPercent: f.invested > 0 ? ((newValue - f.invested) / f.invested) * 100 : 0,
          navDate: date,
          lastUpdated: new Date().toISOString(),
        }
      }
      return f
    })

    // Save updated portfolio
    const totalCurrent = updatedFunds.reduce((s: number, f: any) => s + (f.value || 0), 0)
    const totalInvested = updatedFunds.reduce((s: number, f: any) => s + (f.invested || 0), 0)

    await admin.from('portfolios').update({
      data: {
        ...pd.data,
        funds: updatedFunds,
        totalCurrent,
        totalInvested,
        lastNavRefresh: new Date().toISOString(),
      }
    }).eq('user_id', userId)

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      total: funds.length,
      totalValue: totalCurrent,
      totalInvested,
      returns: ((totalCurrent - totalInvested) / totalInvested * 100).toFixed(2) + '%',
    })
  } catch (err) {
    console.error('NAV refresh error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Public GET — returns today's NAV for a single scheme code
export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'code param required' }, { status: 400 })

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`, { next: { revalidate: 3600 } })
    const data = await res.json()
    return NextResponse.json({
      code,
      name: data.meta?.scheme_name || '',
      nav: data.data?.[0]?.nav || 0,
      date: data.data?.[0]?.date || '',
    })
  } catch {
    return NextResponse.json({ error: 'NAV fetch failed' }, { status: 500 })
  }
}
