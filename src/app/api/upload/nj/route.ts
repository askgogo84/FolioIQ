import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// ── Category mapping ─────────────────────────────────────────────────────────
function mapCategory(subType: string, fundName: string): string {
  const s = (subType + ' ' + fundName).toLowerCase();
  if (/gold|silver/.test(s)) return 'Gold';
  if (/arbitrage/.test(s)) return 'Debt';          // arbitrage = debt-like risk
  if (/elss|tax saver/.test(s)) return 'Equity';
  if (/small cap/.test(s)) return 'Equity';
  if (/mid cap|midcap/.test(s)) return 'Equity';
  if (/large.*mid|multi cap|multicap|flexi/.test(s)) return 'Equity';
  if (/large cap/.test(s)) return 'Equity';
  if (/liquid|overnight|debt|gilt|bond|duration/.test(s)) return 'Debt';
  if (/hybrid|balanced/.test(s)) return 'Hybrid';
  if (/infrastructure|thematic|sectoral/.test(s)) return 'Equity';
  if (/index|nifty|sensex/.test(s)) return 'Equity';
  return 'Equity';
}

// ── AMC extraction from fund name ─────────────────────────────────────────────
function extractAMC(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('axis')) return 'Axis';
  if (n.includes('hdfc')) return 'HDFC';
  if (n.includes('icici')) return 'ICICI Prudential';
  if (n.includes('sbi')) return 'SBI';
  if (n.includes('mirae')) return 'Mirae Asset';
  if (n.includes('nippon')) return 'Nippon India';
  if (n.includes('parag parikh')) return 'PPFAS';
  if (n.includes('invesco')) return 'Invesco';
  if (n.includes('canara robeco')) return 'Canara Robeco';
  if (n.includes('pgim')) return 'PGIM India';
  if (n.includes('kotak')) return 'Kotak';
  if (n.includes('uti')) return 'UTI';
  if (n.includes('dsp')) return 'DSP';
  if (n.includes('franklin')) return 'Franklin';
  if (n.includes('aditya birla') || n.includes('absl')) return 'Aditya Birla';
  if (n.includes('tata')) return 'Tata';
  if (n.includes('L&T') || n.includes('bandhan')) return 'Bandhan';
  if (n.includes('motilal')) return 'Motilal Oswal';
  return 'Unknown';
}

// ── Parse NJ Wealth PDF text ──────────────────────────────────────────────────
// The NJ PDF has a consistent pattern:
// Fund Name section header (e.g. "Axis ELSS Tax Saver Fund - Gr")
// Then rows with: investor UCC ISIN FolioNo Date SubType Amount ... Nav Units ... CurrentNAV CurrentValue ... AbsReturn
// Then "Sub Total" with aggregated numbers
// We extract per-fund aggregates from the Sub Total lines.

interface FundSummary {
  name: string;
  subType: string;
  isin: string;
  invested: number;
  units: number;
  currentNAV: number;
  currentValue: number;
  annualizedReturn: number;
}

function parseNJText(text: string): FundSummary[] {
  const funds: FundSummary[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentFund = '';
  let currentISIN = '';
  let currentSubType = '';

  // Pattern: detect fund section headers — lines that end with "- Gr" or "- Growth" or similar
  // and don't start with numbers/dates
  const fundHeaderRegex = /^([A-Za-z][\w\s\-&().]+(?:Fund|Scheme|ETF|FoF|Cap|Flexi|ELSS|Liquid|Gilt|Income|Hybrid|Plan)[\w\s\-&()]*)$/i;

  // Sub Total line pattern: "Sub Total  [invested]  0.00  [avgNAV]  [units]  [currentValue]  0.00  0.00  [total]  [xirr]  [abs]"
  // We extract: invested, units, currentValue, xirr from sub total lines
  const subTotalRegex = /Sub Total\s+([\d,]+\.?\d*)\s+[\d,.]+\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+[\d,.]+\s+[\d,.]+\s+([\d,]+\.?\d*)\s+(-?[\d.]+)\s+(-?[\d.]+)/;

  // ISIN regex — appears in rows  
  const isinRegex = /\b(INF\w{7,12}|IN[A-Z0-9]{10})\b/;

  // Sub type detection from rows
  const subTypeRegex = /\b(ELSS|Small Cap|Large Cap|Mid Cap|Multi Cap|Flexi Cap|Arbitrage|Gold Plan|Thematic|Sectoral|Hybrid)\b/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect fund section header
    if (fundHeaderRegex.test(line) && !line.startsWith('Sub Total') && !line.match(/^\d/) && !line.includes(':')) {
      currentFund = line;
      currentISIN = '';
      currentSubType = '';
    }

    // Extract ISIN from data rows
    const isinMatch = line.match(isinRegex);
    if (isinMatch && !currentISIN) {
      currentISIN = isinMatch[1];
    }

    // Extract sub type
    const stMatch = line.match(subTypeRegex);
    if (stMatch && !currentSubType) {
      currentSubType = stMatch[1];
    }

    // Extract Sub Total row
    if (line.startsWith('Sub Total') && currentFund) {
      const m = line.match(subTotalRegex);
      if (m) {
        const invested = parseFloat(m[1].replace(/,/g, ''));
        // m[2] = avgNAV, m[3] = units, m[4] = ...
        // The columns after Sub Total in NJ format are:
        // Amount | DivReinv(0.00) | avgNAV | totalUnits | currentValue | DivR(0) | DivP(0) | Total | XIRR | AbsReturn
        // Let me be more careful — try a simpler split approach
        const parts = line.replace(/Sub Total\s+/, '').trim().split(/\s+/);
        // Filter to numeric parts
        const nums = parts.map(p => parseFloat(p.replace(/,/g, ''))).filter(n => !isNaN(n));
        
        if (nums.length >= 5) {
          // nums[0] = invested amount
          // nums[1] = 0.00 (div reinvest)
          // nums[2] = avg NAV
          // nums[3] = total units
          // nums[4] = current value (but this is per the last transaction's current NAV date)
          // nums[-3] = total current value (after the 0s)
          // nums[-2] = annualized return (XIRR)
          // nums[-1] = abs return

          // Find current value — it's the last large number before the return percentages
          // Strategy: last 3 numbers are total, xirr, absReturn; 4th from end is currentValue
          const xirr = nums[nums.length - 2];
          const totalVal = nums[nums.length - 3];
          const totalUnits = nums[3] || 0;
          
          // Current NAV: currentValue / totalUnits
          const currentNAV = totalUnits > 0 ? totalVal / totalUnits : 0;

          if (invested > 0 && totalVal > 0 && currentFund) {
            funds.push({
              name: currentFund,
              subType: currentSubType || '',
              isin: currentISIN || '',
              invested,
              units: totalUnits,
              currentNAV,
              currentValue: totalVal,
              annualizedReturn: xirr,
            });
          }
        }
      }
      // Reset for next fund
      currentISIN = '';
      currentSubType = '';
    }
  }

  return funds;
}

// ── Main route ────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!file.name.match(/\.pdf$/i)) return NextResponse.json({ error: 'Please upload a PDF file' }, { status: 400 });

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text using pdf-parse
    // Dynamic import to avoid build issues with pdf-parse
    let pdfText = '';
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text || '';
    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr);
      return NextResponse.json({ error: 'Could not read PDF. Make sure it is not password-protected.' }, { status: 400 });
    }

    // Detect NJ Wealth format
    if (!pdfText.includes('NJ') && !pdfText.includes('Sub Total') && !pdfText.includes('Current Value')) {
      return NextResponse.json({
        error: 'This does not look like an NJ Wealth valuation report. Please upload a CAS PDF from CAMS or KFintech instead.',
      }, { status: 400 });
    }

    // Parse the funds
    const funds = parseNJText(pdfText);

    if (funds.length === 0) {
      // Fallback: use Claude API to extract from the PDF text directly
      return NextResponse.json({
        error: 'Could not parse fund data from this PDF. Try uploading a CAS from CAMS instead.',
        debug: 'zero_funds_parsed',
      }, { status: 422 });
    }

    // Build portfolio_holdings rows
    const now = new Date().toISOString();
    const rows = funds.map(f => ({
      user_id: user.id,
      scheme_code: f.isin || f.name.slice(0, 20).replace(/\s+/g, '_'),
      scheme_name: f.name,
      category: mapCategory(f.subType, f.name),
      amc: extractAMC(f.name),
      units: f.units,
      avg_nav: f.units > 0 ? f.invested / f.units : 0,
      current_nav: f.currentNAV,
      purchase_date: new Date().toISOString().slice(0, 10),
      sip_amount: 0,
      invested_amount: f.invested,
      current_value: f.currentValue,
      updated_at: now,
    }));

    // Wipe existing and insert fresh
    const admin = createAdminClient();
    await admin.from('portfolio_holdings').delete().eq('user_id', user.id);
    const { error: insertErr } = await admin.from('portfolio_holdings').insert(rows);

    if (insertErr) {
      console.error('Insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    const totalInvested = rows.reduce((s, r) => s + r.invested_amount, 0);
    const totalValue = rows.reduce((s, r) => s + r.current_value, 0);

    return NextResponse.json({
      success: true,
      source: 'nj_wealth',
      fundCount: rows.length,
      totalInvested,
      totalValue,
      gain: totalValue - totalInvested,
      gainPct: totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('NJ parse route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
