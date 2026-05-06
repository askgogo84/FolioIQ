import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// ─── NJ WEALTH SCHEME VALUATION XLS PARSER ──────────────────
// Correctly handles the exact format:
// Fund Name row (col0 = fund name, rest empty)
// Data rows: Sr.No | Investor | UCC | ISIN | Date | Amount | DivReinv | NAV | Units | CurrentNAV | CurrentValue
// Sub Total row: col0="Sub Total", col5=totalInvested, col8=totalUnits, col10=totalCurrentValue
async function parseNJWealthXLS(buffer: Buffer) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const results = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];

    let currentFund = '';
    let firstPurchaseDate = '';

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].map(c => String(c ?? '').trim());
      const col0 = row[0] || '';

      // Skip header / metadata rows
      const skipWords = ['Sr. No.', 'Sub Total', 'Grand Total', 'Return :', 'Note :', 'Current Value',
        'Folio No.', 'Highlighted', 'ISIN column', 'This Report', 'For Scheme', 'Anti Money',
        'Address', 'City', 'Pincode', 'Phone', 'E-Mail', 'Mobile', 'Name', 'Off-Address', 'Your'];
      if (skipWords.some(w => col0.startsWith(w))) continue;

      // Detect fund name row: col0 has text, col1-col4 are empty, does NOT start with digit
      const restEmpty = row.slice(1, 6).every(c => !c || c === '0' || c === '-');
      const isFundName = col0.length > 5 && !/^\d/.test(col0) && restEmpty
        && !col0.includes('|') && !col0.startsWith('Type') && !col0.startsWith('Valuation');

      if (isFundName) {
        currentFund = col0.replace(/\s*-\s*Gr$/, '').replace(/\s*- Growth$/, '').trim();
        firstPurchaseDate = '';
        continue;
      }

      // Detect transaction row: col0 is a number (Sr. No.)
      if (/^\d+$/.test(col0) && currentFund) {
        // col4 = Date, grab first purchase date
        if (!firstPurchaseDate && row[4]) {
          const dateStr = String(row[4]);
          // Convert DD-MM-YYYY to YYYY-MM-DD
          const m = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
          if (m) firstPurchaseDate = `${m[3]}-${m[2]}-${m[1]}`;
          else firstPurchaseDate = dateStr;
        }
        continue;
      }

      // Sub Total row
      if (col0 === 'Sub Total' && currentFund) {
        const totalInvested = parseFloat(String(row[5]).replace(/,/g, '')) || 0;
        const totalUnits = parseFloat(String(row[8]).replace(/,/g, '')) || 0;
        const currentValue = parseFloat(String(row[10]).replace(/,/g, '')) || 0;
        const currentNAV = totalUnits > 0 ? currentValue / totalUnits : 0;
        const avgNAV = totalUnits > 0 ? totalInvested / totalUnits : 0;

        if (totalInvested > 0 && currentFund) {
          results.push({
            name: currentFund,
            invested: totalInvested,
            units: totalUnits,
            avgNav: avgNAV,
            currentNAV: currentNAV,
            currentValue: currentValue,
            purchaseDate: firstPurchaseDate || new Date(Date.now() - 2*365*86400000).toISOString().split('T')[0],
            sipAmount: 0,
          });
        }
        currentFund = '';
        firstPurchaseDate = '';
      }
    }
  }
  return results;
}

// ─── CLAUDE VISION PARSER (PDF / Screenshots) ──────────────
async function parseWithVision(base64: string, mediaType: string) {
  const isPDF = mediaType === 'application/pdf';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `You are an expert at extracting Indian mutual fund data from NJ Wealth, Kuvera, Groww, Zerodha Coin, ET Money, CAMS CAS PDF statements.
For NJ Wealth Scheme Valuation Reports: find all "Sub Total" rows. Each has: Total Invested Amount, Total Units, Current NAV, Current Value.
The fund name appears just above the transactions as a standalone row.
Return ONLY a valid JSON array, no markdown, no explanation.`,
      messages: [{
        role: 'user',
        content: [
          {
            type: isPDF ? 'document' : 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Extract ALL mutual fund holdings. For NJ Wealth reports, use the "Sub Total" rows for each fund section.

Return JSON array:
[{
  "name": "Fund name (without - Gr or - Growth suffix)",
  "invested": 34903.77,
  "units": 341.776,
  "avgNav": 102.12,
  "currentNAV": 197.45,
  "currentValue": 67484.35,
  "purchaseDate": "2022-09-06",
  "sipAmount": 5000
}]

Rules:
- invested = Total Amount invested (Sub Total col)
- currentValue = Current Value from Sub Total row
- purchaseDate = earliest transaction date in that fund section (DD-MM-YYYY -> YYYY-MM-DD)
- sipAmount = SIP installment amount if shown, else 0
- Extract ALL funds shown
- RETURN ONLY THE JSON ARRAY`,
          },
        ],
      }],
    }),
  });
  const d = await res.json();
  const text = d.content?.[0]?.text || '[]';
  try { return JSON.parse(text.replace(/```json\n?|```\n?/g, '').trim()); }
  catch { const m = text.match(/\[[\s\S]*\]/); return m ? JSON.parse(m[0]) : []; }
}

// ─── AMFI FUND MATCHER ──────────────────────────────────────
async function matchToAMFI(name: string): Promise<{ schemeCode: string; schemeName: string; category: string; amc: string } | null> {
  const clean = name.replace(/ - (Gr|Growth|Regular|Reg Gr|Direct|Dir|Dividend).*$/i, '').trim().substring(0, 45);
  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(clean)}`, { signal: AbortSignal.timeout(7000) });
    const results = await res.json();
    if (!results?.length) return null;
    const isDirect = name.toLowerCase().includes('direct');
    let match = results[0];
    for (const r of results.slice(0, 12)) {
      const sn = r.schemeName.toLowerCase();
      if (isDirect && sn.includes('direct') && (sn.includes('growth') || sn.includes('gr'))) { match = r; break; }
      if (!isDirect && !sn.includes('direct') && (sn.includes('growth') || sn.endsWith('gr'))) { match = r; break; }
    }
    const detail = await (await fetch(`https://api.mfapi.in/mf/${match.schemeCode}`, { signal: AbortSignal.timeout(7000) })).json();
    return { schemeCode: String(match.schemeCode), schemeName: match.schemeName, category: detail?.meta?.scheme_category || 'Equity Scheme', amc: detail?.meta?.fund_house || '' };
  } catch { return null; }
}

// ─── MAIN HANDLER ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());
    let rawFunds: Array<{ name: string; invested: number; units: number; avgNav: number; currentNAV: number; currentValue: number; purchaseDate: string; sipAmount: number }> = [];
    let parseMethod = '';
    let preEnriched = false;

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const nj = await parseNJWealthXLS(buffer);
      if (nj.length > 0) { rawFunds = nj; parseMethod = 'nj-xls'; preEnriched = true; }
      else {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(buffer, { type: 'buffer' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, unknown>[];
        rawFunds = rows.map(r => ({
          name: String(r['Fund Name'] || r['Scheme Name'] || r['Fund'] || r['scheme_name'] || '').trim(),
          invested: parseFloat(String(r['Invested Amount'] || r['Total Invested Value'] || r['invested'] || '0').replace(/,/g, '')),
          units: parseFloat(String(r['Units'] || r['Balance Units'] || r['units'] || '0').replace(/,/g, '')),
          avgNav: parseFloat(String(r['Avg NAV'] || r['avg_nav'] || '0').replace(/,/g, '')),
          currentNAV: parseFloat(String(r['Current NAV'] || r['Cur. NAV'] || r['nav'] || '0').replace(/,/g, '')),
          currentValue: parseFloat(String(r['Current Value'] || r['Market Value'] || '0').replace(/,/g, '')),
          purchaseDate: String(r['Purchase Date'] || r['Date'] || '').trim(),
          sipAmount: parseFloat(String(r['SIP Amount'] || r['sip_amount'] || '0').replace(/,/g, '')),
        })).filter(h => h.name.length > 3);
        parseMethod = 'excel-generic';
      }
    } else if (filename.endsWith('.csv')) {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer.toString('utf-8'), { type: 'string' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, unknown>[];
      rawFunds = rows.map(r => ({
        name: String(r['Fund Name'] || r['Scheme Name'] || r['Fund'] || '').trim(),
        invested: parseFloat(String(r['Invested Amount'] || '0').replace(/,/g, '')),
        units: parseFloat(String(r['Units'] || '0').replace(/,/g, '')),
        avgNav: parseFloat(String(r['Avg NAV'] || '0').replace(/,/g, '')),
        currentNAV: parseFloat(String(r['Current NAV'] || '0').replace(/,/g, '')),
        currentValue: parseFloat(String(r['Current Value'] || '0').replace(/,/g, '')),
        purchaseDate: String(r['Purchase Date'] || '').trim(),
        sipAmount: parseFloat(String(r['SIP Amount'] || '0').replace(/,/g, '')),
      })).filter(h => h.name.length > 3);
      parseMethod = 'csv';
    } else if (filename.endsWith('.pdf')) {
      rawFunds = await parseWithVision(buffer.toString('base64'), 'application/pdf');
      parseMethod = 'vision-pdf'; preEnriched = true;
    } else if (filename.match(/\.(jpg|jpeg|png|webp)$/i)) {
      const mt: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpeg';
      rawFunds = await parseWithVision(buffer.toString('base64'), mt[ext] || 'image/jpeg');
      parseMethod = 'vision-image'; preEnriched = true;
    } else {
      return NextResponse.json({ error: 'Unsupported file. Upload .xlsx, .xls, .csv, .pdf, .jpg, or .png' }, { status: 400 });
    }

    if (!rawFunds.length) {
      return NextResponse.json({ error: 'No mutual fund holdings found in this file. Check the format or use an NJ Wealth / Kuvera statement.', parseMethod }, { status: 422 });
    }

    // Match each fund to AMFI + upsert to Supabase
    const matched = [];
    const unmatched: string[] = [];
    const BATCH = 3;

    for (let i = 0; i < rawFunds.length; i += BATCH) {
      const results = await Promise.allSettled(rawFunds.slice(i, i + BATCH).map(async (f) => {
        if (!f.name || f.name.length < 3) return null;
        const amfi = await matchToAMFI(f.name);
        if (!amfi) { unmatched.push(f.name); return null; }

        let units = f.units || 0;
        let avgNav = f.avgNav || 0;
        const invested = f.invested || 0;
        const currentValue = f.currentValue || 0;
        const currentNAV = f.currentNAV || 0;

        if (!units && invested && avgNav) units = invested / avgNav;
        if (!avgNav && invested && units) avgNav = invested / units;
        if (!units) units = 100;

        // Parse & normalise purchase date
        let pd = f.purchaseDate || '';
        const m = pd.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
        if (m) pd = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        if (!pd.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const d = new Date(); d.setFullYear(d.getFullYear() - 2);
          pd = d.toISOString().split('T')[0];
        }

        // Upsert to Supabase portfolio_holdings
        const { error } = await adminSupabase.from('portfolio_holdings').upsert({
          user_id: user.id,
          scheme_code: amfi.schemeCode,
          scheme_name: amfi.schemeName,
          category: amfi.category,
          amc: amfi.amc,
          units,
          avg_nav: avgNav,
          purchase_date: pd,
          sip_amount: f.sipAmount || 0,
          invested_amount: invested,
          current_value: currentValue,
          current_nav: currentNAV,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,scheme_code' });

        if (error) console.error('Upsert error for', f.name, ':', error.message);

        return {
          ...amfi, units, avgNav, purchaseDate: pd,
          sipAmount: f.sipAmount || 0, investedAmount: invested,
          preEnrichedCurrentValue: currentValue, preEnrichedCurrentNAV: currentNAV,
          originalName: f.name, matchConfidence: (units > 0 && avgNav > 0) ? 'high' : 'low',
        };
      }));
      for (const r of results) if (r.status === 'fulfilled' && r.value) matched.push(r.value);
    }

    return NextResponse.json({
      success: true, parseMethod, preEnriched,
      totalExtracted: rawFunds.length, totalMatched: matched.length,
      unmatched, holdings: matched,
      message: `Successfully imported ${matched.length} of ${rawFunds.length} funds`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Upload handler error:', msg);
    return NextResponse.json({ error: 'Failed to process file: ' + msg }, { status: 500 });
  }
        }
