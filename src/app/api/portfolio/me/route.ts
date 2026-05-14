import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Aggregate by category for asset mix
function aggregateAssetMix(holdings: HoldingRow[]) {
  const buckets: Record<string, number> = {};
  let total = 0;
  for (const h of holdings) {
    buckets[h.category] = (buckets[h.category] || 0) + Number(h.current_value);
    total += Number(h.current_value);
  }
  return Object.entries(buckets).map(([label, value]) => ({
    label,
    pct: total > 0 ? (value / total) * 100 : 0,
    value,
  }));
}

type HoldingRow = {
  scheme_code: string;
  scheme_name: string;
  category: string;
  amc: string;
  units: number;
  avg_nav: number;
  current_nav: number;
  invested_amount: number;
  current_value: number;
  sip_amount: number;
  updated_at: string;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ connected: false, reason: 'unauthenticated' }, { status: 401 });
    }

    const { data: holdings, error } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user.id)
      .order('current_value', { ascending: false });

    if (error) {
      console.error('Holdings fetch error:', error);
      return NextResponse.json({ connected: false, reason: 'db_error', error: error.message });
    }

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ connected: false, reason: 'no_data' });
    }

    const totalInvested = holdings.reduce((s, h: HoldingRow) => s + Number(h.invested_amount || 0), 0);
    const totalCurrent = holdings.reduce((s, h: HoldingRow) => s + Number(h.current_value || 0), 0);
    const totalGain = totalCurrent - totalInvested;
    const gainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    const fundsWithAlloc = holdings.map((h: HoldingRow) => ({
      ...h,
      alloc: totalCurrent > 0 ? (Number(h.current_value) / totalCurrent) * 100 : 0,
      pct: Number(h.invested_amount) > 0
        ? ((Number(h.current_value) - Number(h.invested_amount)) / Number(h.invested_amount)) * 100
        : 0,
    }));

    const lastUpdated = holdings.reduce((latest, h) => {
      const t = new Date(h.updated_at).getTime();
      return t > latest ? t : latest;
    }, 0);

    return NextResponse.json({
      connected: true,
      summary: {
        fundCount: holdings.length,
        totalInvested,
        totalCurrent,
        totalGain,
        gainPct,
        lastUpdated: new Date(lastUpdated).toISOString(),
      },
      holdings: fundsWithAlloc,
      assetMix: aggregateAssetMix(holdings as HoldingRow[]),
      user: {
        name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Investor'),
        email: user.email,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Portfolio fetch error:', msg);
    return NextResponse.json({ connected: false, reason: 'error', error: msg }, { status: 500 });
  }
}
