import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

type HoldingRow = {
  id: string
  scheme_code: string | null
  scheme_name: string | null
  units: number | string | null
  invested_amount: number | string | null
  current_nav: number | string | null
  current_value: number | string | null
}

function toNumber(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function fetchLatestNav(schemeCode: string): Promise<{ nav: number; date: string } | null> {
  try {
    const latestRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (latestRes.ok) {
      const latestData = await latestRes.json()
      const item = Array.isArray(latestData?.data) ? latestData.data[0] : latestData?.data
      const nav = Number(item?.nav ?? latestData?.nav ?? 0)
      const date = String(item?.date ?? latestData?.date ?? '')
      if (Number.isFinite(nav) && nav > 0) return { nav, date }
    }

    const fullRes = await fetch(`https://api.mfapi.in/mf/${schemeCode}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!fullRes.ok) return null

    const fullData = await fullRes.json()
    const item = Array.isArray(fullData?.data) ? fullData.data[0] : null
    const nav = Number(item?.nav ?? 0)
    const date = String(item?.date ?? '')

    if (Number.isFinite(nav) && nav > 0) return { nav, date }
    return null
  } catch {
    return null
  }
}

// POST: Refresh logged-in user's portfolio_holdings NAVs
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = createAdminClient()

    const { data: rows, error } = await admin
      .from('portfolio_holdings')
      .select('id, scheme_code, scheme_name, units, invested_amount, current_nav, current_value')
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!rows?.length) {
      return NextResponse.json({ error: 'No holdings found' }, { status: 404 })
    }

    let updated = 0
    let skipped = 0
    const funds: Array<{ schemeCode: string; name: string; nav: number; value: number; navDate: string }> = []

    for (const row of rows as HoldingRow[]) {
      const schemeCode = row.scheme_code?.trim()
      const units = toNumber(row.units)

      if (!schemeCode || units <= 0) {
        skipped++
        continue
      }

      const latest = await fetchLatestNav(schemeCode)

      if (!latest) {
        skipped++
        continue
      }

      const currentValue = Number((units * latest.nav).toFixed(2))

      const { error: updateError } = await admin
        .from('portfolio_holdings')
        .update({
          current_nav: latest.nav,
          current_value: currentValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id)
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      updated++
      funds.push({
        schemeCode,
        name: row.scheme_name || schemeCode,
        nav: latest.nav,
        value: currentValue,
        navDate: latest.date,
      })
    }

    const { data: refreshedRows, error: refreshedError } = await admin
      .from('portfolio_holdings')
      .select('invested_amount, current_value')
      .eq('user_id', user.id)

    if (refreshedError) {
      return NextResponse.json({ error: refreshedError.message }, { status: 500 })
    }

    const totalCurrent = (refreshedRows || []).reduce((s, r) => s + toNumber(r.current_value), 0)
    const totalInvested = (refreshedRows || []).reduce((s, r) => s + toNumber(r.invested_amount), 0)
    const gain = totalCurrent - totalInvested
    const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0

    return NextResponse.json({
      success: true,
      source: 'mfapi.in',
      refreshedAt: new Date().toISOString(),
      total: rows.length,
      updated,
      skipped,
      totalCurrent,
      totalInvested,
      gain,
      gainPct,
      funds,
    })
  } catch (err) {
    console.error('NAV refresh error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// GET: Get current NAV for any scheme code
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const name = url.searchParams.get('name')

  if (!code && !name) {
    return NextResponse.json({ error: 'Provide ?code= or ?name=' }, { status: 400 })
  }

  try {
    if (code) {
      const latest = await fetchLatestNav(code)
      return NextResponse.json({
        schemeCode: code,
        nav: latest?.nav || 0,
        date: latest?.date || '',
      })
    }

    const searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(name!)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    const results = await searchRes.json()
    return NextResponse.json({ results: Array.isArray(results) ? results.slice(0, 10) : [] })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}