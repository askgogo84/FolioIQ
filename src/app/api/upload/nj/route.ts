import { NextRequest, NextResponse } from 'next/server';

// ── Supabase admin client (bypasses RLS) ─────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function mapCategory(name: string, subType: string): string {
  const s = (name + ' ' + subType).toLowerCase();
  if (/gold|silver/.test(s)) return 'Gold';
  if (/arbitrage/.test(s)) return 'Debt';
  if (/debt|liquid|gilt|bond|duration|overnight/.test(s)) return 'Debt';
  if (/hybrid|balanced/.test(s)) return 'Hybrid';
  return 'Equity';
}

function extractAMC(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('parag parikh')) return 'PPFAS';
  if (n.includes('axis')) return 'Axis';
  if (n.includes('hdfc')) return 'HDFC';
  if (n.includes('icici')) return 'ICICI Prudential';
  if (n.includes('sbi')) return 'SBI';
  if (n.includes('mirae')) return 'Mirae Asset';
  if (n.includes('nippon')) return 'Nippon India';
  if (n.includes('invesco')) return 'Invesco';
  if (n.includes('canara')) return 'Canara Robeco';
  if (n.includes('pgim')) return 'PGIM India';
  if (n.includes('kotak')) return 'Kotak';
  return 'Other';
}

type FundRow = {
  name: string;
  isin: string;
  invested: number;
  units: number;
  currentNAV: number;
  currentValue: number;
  subType: string;
};

// ── Parse XLS/XLSX ────────────────────────────────────────────────────────────
async function parseXLS(buffer: Buffer): Promise<FundRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const funds: FundRow[] = [];
  let currentFund = '';
  let currentISIN = '';
  let currentSubType = '';

  for (const row of rows) {
    const cells = row.map(c => String(c ?? '').trim());
    const joined = cells.join('|');

    // Detect fund name header rows (non-numeric, contains fund keywords)
    const firstCell = cells[0] || '';
    if (
      firstCell.length > 5 &&
      !firstCell.match(/^\d/) &&
      !joined.includes('Sub Total') &&
      !joined.includes('Grand Total') &&
      !joined.includes('Investor') &&
      !joined.includes('Sr.') &&
      (firstCell.includes('Fund') || firstCell.includes('ETF') ||
       firstCell.includes('ELSS') || firstCell.includes('Arbitrage') ||
       firstCell.includes('Gold') || firstCell.includes('Cap') ||
       firstCell.includes('Flexi') || firstCell.includes('SBI'))
    ) {
      currentFund = firstCell;
      currentISIN = '';
      currentSubType = '';
    }

    // Grab ISIN from any row
    const isinMatch = joined.match(/INF[A-Z0-9]{9}/);
    if (isinMatch && !currentISIN) currentISIN = isinMatch[0];

    // Detect subtype
    const subtypes = ['ELSS', 'Small Cap', 'Multi Cap', 'Flexi Cap', 'Large and Mid Cap',
      'Gold Plan', 'Arbitrage', 'Thematic', 'Sectoral', 'Gold'];
    for (const st of subtypes) {
      if (joined.includes(st) && !currentSubType) { currentSubType = st; break; }
    }

    // Sub Total row
    if (joined.includes('Sub Total') && currentFund) {
      const nums = cells
        .map(c => parseFloat(c.replace(/,/g, '')))
        .filter(n => !isNaN(n) && n > 0);

      if (nums.length >= 2) {
        const invested = nums[0];
        const units = nums.length >= 4 ? nums[3] : nums[1];
        const currentValue = nums[nums.length >= 6 ? nums.length - 4 : 1];

        if (invested > 100 && currentValue > 100) {
          funds.push({
            name: currentFund,
            isin: currentISIN,
            invested,
            units: isNaN(units) ? 0 : units,
            currentNAV: units > 0 ? currentValue / units : 0,
            currentValue,
            subType: currentSubType,
          });
        }
      }
      currentFund = '';
      currentISIN = '';
      currentSubType = '';
    }
  }
  return funds;
}

// ── Parse PDF via Claude API (document understanding) ─────────────────────────
async function parsePDFViaClaude(buffer: Buffer): Promise<FundRow[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const base64 = buffer.toString('base64');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `This is an NJ Wealth / NJ India Invest "Scheme Wise - Valuation Report" PDF.

Extract each mutual fund scheme's Sub Total row data. For each scheme, return:
- name: the fund name (section header before the rows)
- isin: ISIN code from the rows (starts with INF)
- subType: transaction sub-type (ELSS, Small Cap, Multi Cap, Flexi Cap, Large and Mid Cap, Gold Plan, Arbitrage, Thematic, Sectoral)
- invested: total invested amount in Rs (first number in Sub Total row, no commas)
- units: total units (4th number in Sub Total row)  
- currentValue: current value in Rs (large number near end of Sub Total row before percentages)

The Sub Total row format is: "Sub Total  [invested]  0.00  [avg_nav]  [units]  [current_nav]  [current_value]  0.00  0.00  [current_value]  [annualized_%]  [abs_%]"

Return ONLY valid JSON array, no markdown, no other text:
[{"name":"Axis ELSS Tax Saver Fund - Gr","isin":"INF846K01131","subType":"ELSS","invested":42410.73,"units":1677.665,"currentValue":152600.07}]

Include ALL funds found in the document.`,
          },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data.content?.find((b: {type: string}) => b.type === 'text')?.text ?? '';

  // Extract JSON array robustly
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error(`No JSON array in Claude response. Got: ${text.slice(0, 300)}`);

  const parsed = JSON.parse(match[0]) as Array<{
    name: string; isin: string; subType: string;
    invested: number; units: number; currentValue: number;
  }>;

  return parsed.map(f => ({
    name: String(f.name || ''),
    isin: String(f.isin || ''),
    subType: String(f.subType || ''),
    invested: Number(f.invested) || 0,
    units: Number(f.units) || 0,
    currentNAV: (Number(f.units) > 0) ? Number(f.currentValue) / Number(f.units) : 0,
    currentValue: Number(f.currentValue) || 0,
  }));
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (!userId) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const isPDF = /\.pdf$/i.test(file.name);
    const isXLS = /\.(xls|xlsx)$/i.test(file.name);

    if (!isPDF && !isXLS) {
      return NextResponse.json({
        error: 'Please upload a PDF or Excel file (.pdf, .xls, .xlsx) from NJ Wealth.',
      }, { status: 400 });
    }

    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 12 MB.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let funds: FundRow[];
    try {
      funds = isPDF ? await parsePDFViaClaude(buffer) : await parseXLS(buffer);
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
      return NextResponse.json({ error: `Could not parse file: ${msg}` }, { status: 422 });
    }

    if (!funds.length) {
      return NextResponse.json({
        error: 'No fund data found. Please upload an NJ Wealth Scheme-wise Valuation Report.',
      }, { status: 422 });
    }

    // Build DB rows
    const now = new Date().toISOString();
    const rows = funds
      .filter(f => f.name && f.invested > 0 && f.currentValue > 0)
      .map(f => ({
        user_id: userId,
        scheme_code: f.isin || `NJ_${f.name.slice(0, 20).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`,
        scheme_name: f.name,
        category: mapCategory(f.name, f.subType),
        amc: extractAMC(f.name),
        units: f.units,
        avg_nav: f.units > 0 ? +(f.invested / f.units).toFixed(4) : 0,
        current_nav: +f.currentNAV.toFixed(4),
        purchase_date: new Date().toISOString().slice(0, 10),
        sip_amount: 0,
        invested_amount: +f.invested.toFixed(2),
        current_value: +f.currentValue.toFixed(2),
        updated_at: now,
      }));

    // Delete existing holdings and re-insert
    await supabaseAdmin.from('portfolio_holdings').delete().eq('user_id', userId);
    const { error: insertErr } = await supabaseAdmin.from('portfolio_holdings').insert(rows);

    if (insertErr) {
      console.error('[NJ upload] Insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    const totalInvested = rows.reduce((s, r) => s + r.invested_amount, 0);
    const totalValue    = rows.reduce((s, r) => s + r.current_value, 0);

    return NextResponse.json({
      success: true,
      source: isPDF ? 'nj_pdf' : 'nj_excel',
      fundCount: rows.length,
      fundsCount: rows.length,   // compat with upload page
      totalInvested: +totalInvested.toFixed(2),
      totalValue:    +totalValue.toFixed(2),
      gain:          +(totalValue - totalInvested).toFixed(2),
      gainPct:       totalInvested > 0
        ? +((totalValue - totalInvested) / totalInvested * 100).toFixed(2)
        : 0,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[NJ upload] Unhandled error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
