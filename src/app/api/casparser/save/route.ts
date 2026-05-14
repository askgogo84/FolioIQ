import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// Map any AMFI/scheme type string to one of our 4 buckets
function mapCategory(type: string): string {
  const t = (type || '').toLowerCase();
  if (/equity|elss|index|etf|large|mid|small|flexi|multi/.test(t)) return 'Equity';
  if (/debt|liquid|gilt|bond|overnight|duration/.test(t)) return 'Debt';
  if (/hybrid|balanced/.test(t)) return 'Hybrid';
  if (/gold|silver|commodity/.test(t)) return 'Gold';
  return 'Equity';
}

type CASFolio = {
  folio?: string;
  amc?: string;
  schemes?: CASScheme[];
};

type CASScheme = {
  scheme_name?: string;
  name?: string;
  scheme_type?: string;
  category?: string;
  scheme_code?: string;
  amfi_code?: string;
  isin?: string;
  amc?: string;
  nav?: number;
  last_nav?: number;
  units?: number;
  balance_units?: number;
  cost_value?: number;
  purchase_cost?: number;
  invested_value?: number;
  sip_amount?: number;
  open?: { date?: string };
};

type CASData = {
  mutual_funds?: CASFolio[];
  investor?: { name?: string; pan?: string };
};

type HoldingRow = {
  user_id: string;
  scheme_code: string;
  scheme_name: string;
  category: string;
  amc: string;
  units: number;
  avg_nav: number;
  current_nav: number;
  purchase_date: string;
  sip_amount: number;
  invested_amount: number;
  current_value: number;
  updated_at: string;
};

function extractHoldings(cas: CASData, userId: string): HoldingRow[] {
  const rows: HoldingRow[] = [];
  for (const folio of cas.mutual_funds || []) {
    for (const scheme of folio.schemes || []) {
      const nav = scheme.nav || scheme.last_nav || 0;
      const units = scheme.units || scheme.balance_units || 0;
      const invested = scheme.cost_value || scheme.purchase_cost || scheme.invested_value || 0;
      const current = nav * units;
      const code = scheme.scheme_code || scheme.amfi_code || scheme.isin || '';
      const name = scheme.scheme_name || scheme.name || '';

      if (units > 0 && name && code) {
        rows.push({
          user_id: userId,
          scheme_code: String(code),
          scheme_name: name,
          category: mapCategory(scheme.scheme_type || scheme.category || ''),
          amc: folio.amc || scheme.amc || '',
          units: Number(units),
          avg_nav: units > 0 ? Number(invested) / Number(units) : 0,
          current_nav: Number(nav),
          purchase_date: scheme.open?.date || new Date().toISOString().slice(0, 10),
          sip_amount: Number(scheme.sip_amount || 0),
          invested_amount: Number(invested),
          current_value: Number(current),
          updated_at: new Date().toISOString(),
        });
      }
    }
  }
  return rows;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: casData } = await req.json();
    const rows = extractHoldings(casData as CASData, user.id);

    if (rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No holdings found in CAS. The portfolio may be empty or the file format is unsupported.',
      });
    }

    const admin = createAdminClient();

    // Wipe existing holdings for this user, then insert fresh
    // (simpler and more reliable than upserting on a composite key)
    await admin.from('portfolio_holdings').delete().eq('user_id', user.id);

    const { error } = await admin.from('portfolio_holdings').insert(rows);
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalInvested = rows.reduce((s, r) => s + r.invested_amount, 0);
    const totalValue = rows.reduce((s, r) => s + r.current_value, 0);

    return NextResponse.json({
      success: true,
      fundCount: rows.length,
      totalInvested,
      totalValue,
      gain: totalValue - totalInvested,
      gainPct: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Save route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
