import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = body.userId || 'demo-user-1'
    const holdings = Array.isArray(body.holdings) ? body.holdings : []

    const supabase = createServerSupabaseClient()

    const deleteResult = await supabase
      .from('portfolios')
      .delete()
      .eq('user_id', userId)

    if (deleteResult.error) {
      return NextResponse.json({ success: false, error: deleteResult.error.message }, { status: 500 })
    }

    if (!holdings.length) {
      return NextResponse.json({ success: true, saved: 0 })
    }

    const rows = holdings.map((h: any) => ({
      user_id: userId,
      scheme_code: h.schemeCode || h.scheme_code || null,
      scheme_name: h.schemeName || h.scheme_name || null,
      category: h.category || null,
      amc: h.amc || null,
      units: Number(h.units || 0),
      avg_nav: Number(h.avgNav || h.avg_nav || 0),
      purchase_date: h.purchaseDate || h.purchase_date || null,
      sip_amount: Number(h.sipAmount || h.sip_amount || 0),
      invested_amount: Number(h.investedAmount || h.invested_amount || 0),
      current_value: Number(h.currentValue || h.current_value || 0),
    }))

    const insertResult = await supabase.from('portfolios').insert(rows)

    if (insertResult.error) {
      return NextResponse.json({ success: false, error: insertResult.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: rows.length })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Save failed' }, { status: 500 })
  }
}
