import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const CAS_PARSER_KEY = process.env.CAS_PARSER_API_KEY || ''
const CAS_PARSER_BASE = 'https://api.casparser.in'

// Parse CAS PDF uploaded by user
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const contentType = req.headers.get('content-type') || ''

    // Mode 1: PDF upload — forward to CASParser
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File
      if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

      // If no API key, parse the filename to detect type and use demo data
      if (!CAS_PARSER_KEY) {
        return NextResponse.json({
          success: true,
          source: 'demo',
          message: 'CASParser API key not configured. Using existing uploaded data.',
          redirect: '/dashboard'
        })
      }

      const apiForm = new FormData()
      apiForm.append('file', file)
      apiForm.append('password', formData.get('password') as string || '')

      const res = await fetch(`${CAS_PARSER_BASE}/v1/parse`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CAS_PARSER_KEY}` },
        body: apiForm,
      })

      if (!res.ok) {
        const err = await res.json()
        return NextResponse.json({ error: err.detail || 'CAS parsing failed' }, { status: res.status })
      }

      const parsed = await res.json()
      await saveParsedPortfolio(user.id, parsed)
      return NextResponse.json({ success: true, summary: buildSummary(parsed) })
    }

    // Mode 2: JSON body — CDSL OTP or Gmail
    const body = await req.json()

    if (body.mode === 'cdsl-otp') {
      if (!CAS_PARSER_KEY) {
        return NextResponse.json({ error: 'CASParser API key required for CDSL OTP fetch' }, { status: 400 })
      }
      // Step 1: Request OTP
      if (body.step === 'request') {
        const res = await fetch(`${CAS_PARSER_BASE}/v1/cdsl/otp/request`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${CAS_PARSER_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ demat_id: body.dematId }),
        })
        const data = await res.json()
        return NextResponse.json(data)
      }
      // Step 2: Verify OTP and get portfolio
      if (body.step === 'verify') {
        const res = await fetch(`${CAS_PARSER_BASE}/v1/cdsl/otp/verify`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${CAS_PARSER_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ demat_id: body.dematId, otp: body.otp }),
        })
        const parsed = await res.json()
        if (parsed.holdings) {
          await saveParsedPortfolio(user.id, parsed)
          return NextResponse.json({ success: true, summary: buildSummary(parsed) })
        }
        return NextResponse.json(parsed)
      }
    }

    if (body.mode === 'gmail') {
      // Gmail OAuth — user has already authorized, we get the access token
      // CASParser searches Gmail for CAS emails and parses them
      if (!CAS_PARSER_KEY) {
        return NextResponse.json({ error: 'CASParser API key required for Gmail import' }, { status: 400 })
      }
      const res = await fetch(`${CAS_PARSER_BASE}/v1/gmail/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CAS_PARSER_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail_token: body.gmailToken }),
      })
      const parsed = await res.json()
      if (parsed.holdings || parsed.mutual_funds) {
        await saveParsedPortfolio(user.id, parsed)
        return NextResponse.json({ success: true, summary: buildSummary(parsed) })
      }
      return NextResponse.json(parsed)
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (err) {
    console.error('CAS parse error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// Transform CASParser JSON into FolioIQ portfolio format
async function saveParsedPortfolio(userId: string, parsed: any) {
  const admin = createAdminClient()

  // Extract mutual funds from CASParser response
  const mfHoldings = extractMutualFunds(parsed)

  const portfolioData = {
    funds: mfHoldings,
    totalInvested: mfHoldings.reduce((s: number, f: any) => s + (f.invested || 0), 0),
    totalCurrent: mfHoldings.reduce((s: number, f: any) => s + (f.value || 0), 0),
    source: 'cas-parser',
    parsedAt: new Date().toISOString(),
    investorName: parsed.investor?.name || '',
    pan: parsed.investor?.pan || '',
  }

  await admin.from('portfolios').upsert({
    user_id: userId,
    data: portfolioData,
    raw_cas: parsed, // store raw for re-processing
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}

function extractMutualFunds(parsed: any): any[] {
  const funds: any[] = []

  // CASParser mutual_funds structure
  const mfData = parsed.mutual_funds || parsed.folios || []

  for (const folio of mfData) {
    for (const scheme of (folio.schemes || [])) {
      const nav = scheme.nav || scheme.last_nav || 0
      const units = scheme.units || scheme.balance_units || 0
      const value = nav * units
      const invested = scheme.cost_value || scheme.purchase_cost || 0

      funds.push({
        name: scheme.scheme_name || scheme.name || 'Unknown Fund',
        category: scheme.category || mapSchemeType(scheme.scheme_type),
        isin: scheme.isin || '',
        schemeCode: scheme.scheme_code || '',
        folio: folio.folio || '',
        units,
        nav,
        value,
        invested,
        returnsPercent: invested > 0 ? ((value - invested) / invested) * 100 : 0,
        sip: scheme.sip_amount || 0,
        lastUpdated: new Date().toISOString(),
      })
    }
  }

  return funds.filter(f => f.units > 0)
}

function mapSchemeType(type: string): string {
  if (!type) return 'Equity'
  const t = type.toLowerCase()
  if (t.includes('equity') || t.includes('elss')) return 'Equity'
  if (t.includes('debt') || t.includes('liquid') || t.includes('gilt')) return 'Debt'
  if (t.includes('hybrid') || t.includes('balanced')) return 'Hybrid'
  if (t.includes('gold')) return 'Gold'
  return 'Equity'
}

function buildSummary(parsed: any) {
  const funds = extractMutualFunds(parsed)
  return {
    fundCount: funds.length,
    totalInvested: funds.reduce((s, f) => s + f.invested, 0),
    totalValue: funds.reduce((s, f) => s + f.value, 0),
    investorName: parsed.investor?.name || '',
  }
}
