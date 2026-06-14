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

type NavEntry = {
  nav: number
  date: string
  name: string
  code: string
  isin1: string
  isin2: string
}

function toNumber(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalise(v: string | null | undefined): string {
  return String(v || '').trim().toUpperCase()
}

function parseAMFI(text: string): Record<string, NavEntry> {
  const map: Record<string, NavEntry> = {}

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line || !line.includes(';')) continue

    const parts = line.split(';').map(p => p.trim())
    if (parts.length < 6) continue

    const code = parts[0]
    if (!/^\d+$/.test(code)) continue

    const isin1 = parts[1] || ''
    const isin2 = parts[2] || ''
    const name = parts[3] || ''

    // AMFI usually: code;isin1;isin2;name;nav;date
    // Keep this defensive in case order changes.
    const p4 = Number(parts[4])
    const p5 = Number(parts[5])
    const nav = Number.isFinite(p4) && p4 > 0 ? p4 : p5
    const date = Number.isFinite(p4) && p4 > 0 ? parts[5] : parts[4]

    if (!Number.isFinite(nav) || nav <= 0) continue

    const entry: NavEntry = { nav, date, name, code, isin1, isin2 }

    map[normalise(code)] = entry
    if (isin1) map[normalise(isin1)] = entry
    if (isin2) map[normalise(isin2)] = entry
  }

  return map
}

function findByName(navMap: Record<string, NavEntry>, schemeName: string | null): NavEntry | null {
  const target = normalise(schemeName)
    .replace(/\s+/g, ' ')
    .replace(/\bREGULAR\b/g, 'REG')
    .replace(/\bGROWTH\b/g, 'GR')

  if (!target) return null

  const entries = Object.values(navMap)

  let match = entries.find(e => normalise(e.name) === target)
  if (match) return match

  match = entries.find(e => {
    const n = normalise(e.name).replace(/\s+/g, ' ')
    return n.includes(target) || target.includes(n)
  })

  return match || null
}

async function fetchAMFINavMap(): Promise<Record<string, NavEntry>> {
  const res = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
    headers: { 'User-Agent': 'FolioKey/1.0 (https://foliokey.app)' },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`AMFI NAVAll fetch failed: ${res.status}`)
  }

  return parseAMFI(await res.text())
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

    const navMap = await fetchAMFINavMap()

    let updated = 0
    let skipped = 0

    const funds: Array<{
      schemeCode: string
      name: string
      nav: number
      value: number
      navDate: string
      matchedBy: string
    }> = []

    const skippedFunds: Array<{ schemeCode: string; name: string; reason: string }> = []

    for (const row of rows as HoldingRow[]) {
      const schemeCode = normalise(row.scheme_code)
      const units = toNumber(row.units)

      if (!schemeCode || units <= 0) {
        skipped++
        skippedFunds.push({
          schemeCode,
          name: row.scheme_name || '',
          reason: !schemeCode ? 'missing scheme_code/ISIN' : 'missing units',
        })
        continue
      }

      let latest = navMap[schemeCode]
      let matchedBy = 'isin_or_code'

      if (!latest) {
        latest = findByName(navMap, row.scheme_name)
        matchedBy = latest ? 'name' : 'none'
      }

      if (!latest) {
        skipped++
        skippedFunds.push({
          schemeCode,
          name: row.scheme_name || '',
          reason: 'not found in AMFI NAVAll by ISIN/code/name',
        })
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
        name: row.scheme_name || latest.name || schemeCode,
        nav: latest.nav,
        value: currentValue,
        navDate: latest.date,
        matchedBy,
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
      source: 'AMFI NAVAll.txt',
      refreshedAt: new Date().toISOString(),
      navEntries: Object.keys(navMap).length,
      total: rows.length,
      updated,
      skipped,
      totalCurrent,
      totalInvested,
      gain,
      gainPct,
      funds,
      skippedFunds,
    })
  } catch (err) {
    console.error('NAV refresh error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}

// GET: public NAV lookup by ISIN/code/name
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const name = url.searchParams.get('name')

  if (!code && !name) {
    return NextResponse.json({ error: 'Provide ?code= or ?name=' }, { status: 400 })
  }

  try {
    const navMap = await fetchAMFINavMap()

    let entry: NavEntry | null = null
    if (code) entry = navMap[normalise(code)] || null
    if (!entry && name) entry = findByName(navMap, name)

    if (!entry) {
      return NextResponse.json({ error: 'NAV not found' }, { status: 404 })
    }

    return NextResponse.json({
      schemeCode: entry.code,
      isin1: entry.isin1,
      isin2: entry.isin2,
      name: entry.name,
      nav: entry.nav,
      date: entry.date,
      source: 'AMFI NAVAll.txt',
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}