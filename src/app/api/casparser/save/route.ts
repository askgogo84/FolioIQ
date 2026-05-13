import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

function mapCategory(type: string): string {
  const t = (type||'').toLowerCase()
  if (/equity|elss|index|etf|large|mid|small|flexi|multi/.test(t)) return 'Equity'
  if (/debt|liquid|gilt|bond|overnight|duration/.test(t)) return 'Debt'
  if (/hybrid|balanced/.test(t)) return 'Hybrid'
  if (/gold|silver/.test(t)) return 'Gold'
  return 'Equity'
}

function extractFunds(cas: any): any[] {
  const funds: any[] = []
  for (const folio of (cas.mutual_funds||[])) {
    for (const scheme of (folio.schemes||[])) {
      const nav = scheme.nav||scheme.last_nav||0
      const units = scheme.units||scheme.balance_units||0
      const value = nav*units
      const invested = scheme.cost_value||scheme.purchase_cost||scheme.invested_value||0
      if (units > 0 && (scheme.scheme_name||scheme.name)) {
        funds.push({
          name: scheme.scheme_name||scheme.name||'',
          category: mapCategory(scheme.scheme_type||scheme.category||''),
          isin: scheme.isin||'',
          schemeCode: scheme.scheme_code||scheme.amfi_code||'',
          folio: folio.folio||'',
          amc: folio.amc||scheme.amc||'',
          units, nav, value, invested,
          returnsPercent: invested>0?((value-invested)/invested)*100:0,
          sip: scheme.sip_amount||0,
          lastUpdated: new Date().toISOString(),
        })
      }
    }
  }
  return funds
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: casData, metadata } = await req.json()
    const funds = extractFunds(casData)
    const inv = funds.reduce((s:number,f:any)=>s+(f.invested||0),0)
    const cur = funds.reduce((s:number,f:any)=>s+(f.value||0),0)

    await createAdminClient().from('portfolios').upsert({
      user_id: user.id,
      data: {
        funds, totalInvested: inv, totalCurrent: cur,
        investorName: casData.investor?.name||'',
        pan: casData.investor?.pan||'',
        source: metadata?.method||'casparser',
        casType: metadata?.cas_type||'',
        parsedAt: new Date().toISOString(),
      },
      raw_cas: casData,
      source: metadata?.method||'casparser',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.json({ success:true, fundCount:funds.length, totalInvested:inv, totalValue:cur })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
