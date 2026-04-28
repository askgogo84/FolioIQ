import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-1'
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const holdings = (data || []).map((row: any) => ({
      schemeCode: row.scheme_code,
      schemeName: row.scheme_name,
      category: row.category,
      amc: row.amc,
      units: row.units,
      avgNav: row.avg_nav,
      purchaseDate: row.purchase_date,
      sipAmount: row.sip_amount,
      investedAmount: row.invested_amount,
      currentValue: row.current_value,
    }))

    return NextResponse.json({ success: true, holdings })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Load failed' }, { status: 500 })
  }
}
