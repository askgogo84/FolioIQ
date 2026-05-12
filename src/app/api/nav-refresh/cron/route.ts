import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

// Called by Vercel cron at 6PM IST (12:30 UTC) on weekdays
// AMFI publishes NAVs by ~5:30PM IST
export async function GET(req: NextRequest) {
  // Verify this is a Vercel cron call
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  
  // Fetch fresh AMFI NAV data
  const navRes = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
    headers: { 'User-Agent': 'FolioIQ/2.0 NAV-Refresh' },
    cache: 'no-store',
  })
  
  if (!navRes.ok) {
    return NextResponse.json({ error: 'AMFI fetch failed' }, { status: 500 })
  }
  
  const navText = await navRes.text()
  const navMap = parseAMFI(navText)
  
  // Get all users with portfolio holdings
  const { data: portfolios } = await admin
    .from('portfolios')
    .select('user_id, data')
    .not('data', 'is', null)
  
  if (!portfolios?.length) {
    return NextResponse.json({ refreshed: 0, navCount: Object.keys(navMap).length })
  }
  
  let refreshed = 0
  for (const portfolio of portfolios) {
    const funds = portfolio.data?.funds || []
    const hasSchemeCodes = funds.some((f: any) => f.schemeCode)
    
    if (!hasSchemeCodes) continue
    
    const updated = funds.map((f: any) => {
      const nav = navMap[f.schemeCode]
      if (!nav || !f.units) return f
      const newValue = nav.nav * f.units
      return {
        ...f,
        nav: nav.nav,
        value: newValue,
        navDate: nav.date,
        returnsPercent: f.invested > 0 ? ((newValue - f.invested) / f.invested) * 100 : 0,
        lastUpdated: new Date().toISOString(),
      }
    })
    
    const totalCurrent = updated.reduce((s: number, f: any) => s + (f.value || 0), 0)
    await admin.from('portfolios').update({
      data: { ...portfolio.data, funds: updated, totalCurrent, lastNavRefresh: new Date().toISOString() }
    }).eq('user_id', portfolio.user_id)
    
    refreshed++
  }
  
  return NextResponse.json({
    success: true,
    date: new Date().toISOString(),
    navSchemes: Object.keys(navMap).length,
    portfoliosRefreshed: refreshed,
  })
}

function parseAMFI(text: string): Record<string, { nav: number; date: string; name: string }> {
  const map: Record<string, { nav: number; date: string; name: string }> = {}
  for (const line of text.split('\n')) {
    const parts = line.split(';')
    if (parts.length >= 6 && /^\d+$/.test(parts[0]?.trim())) {
      const code = parts[0].trim()
      const nav = parseFloat(parts[4]?.trim())
      const date = parts[5]?.trim() || ''
      const name = parts[3]?.trim() || ''
      if (!isNaN(nav) && nav > 0) map[code] = { nav, date, name }
    }
  }
  return map
}
