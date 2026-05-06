import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

const AMC_NAMES = ['HDFC','ICICI','SBI','Axis','Mirae','Nippon','Parag','Canara','Invesco','Kotak','PGIM','Aditya','UTI','DSP','Franklin','IDFC','Tata','L&T','Motilal','Bandhan','Edelweiss','Quant','Sundaram','Baroda','Bank of India','Union','HSBC','JM','BOI','Groww','Zerodha','NJ','KFin','CAMS'];

function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\|+/g, '')
    .replace(/\x00/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('elss') || lower.includes('tax saver')) return 'ELSS';
  if (lower.includes('small cap')) return 'Equity - Small Cap';
  if (lower.includes('mid cap')) return 'Equity - Mid Cap';
  if (lower.includes('large cap') && !lower.includes('mid') && !lower.includes('&') && !lower.includes('and')) return 'Equity - Large Cap';
  if (lower.includes('flexi cap')) return 'Equity - Flexi Cap';
  if (lower.includes('multi cap')) return 'Equity - Multi Cap';
  if (lower.includes('large & mid') || lower.includes('large and mid')) return 'Equity - Large & Mid Cap';
  if (lower.includes('sector') || lower.includes('technology') || lower.includes('digital') || lower.includes('healthcare') || lower.includes('infra')) return 'Equity - Sectoral';
  if (lower.includes('gold') || lower.includes('commodity')) return 'Commodity - Gold';
  if (lower.includes('arbitrage')) return 'Hybrid - Arbitrage';
  if (lower.includes('debt') || lower.includes('gilt')) return 'Debt';
  if (lower.includes('liquid') || lower.includes('low duration')) return 'Liquid';
  if (lower.includes('etf')) return 'ETF';
  if (lower.includes('multi-asset') || lower.includes('multi asset')) return 'Hybrid - Multi Asset';
  if (lower.includes('focused')) return 'Equity - Focused';
  return 'Equity - Multi Cap';
}

function detectRisk(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('small cap') || lower.includes('sector') || lower.includes('technology') || lower.includes('digital') || lower.includes('healthcare')) return 'Very High';
  if (lower.includes('mid cap') || lower.includes('elss') || lower.includes('infra') || lower.includes('flexi')) return 'High';
  if (lower.includes('large cap') && !lower.includes('mid')) return 'Moderate';
  if (lower.includes('arbitrage') || lower.includes('debt') || lower.includes('liquid') || lower.includes('low duration')) return 'Low';
  if (lower.includes('multi-asset') || lower.includes('gold')) return 'Moderate';
  if (lower.includes('focused')) return 'High';
  return 'Moderate';
}

function parseNJWealthReport(text: string) {
  const funds: any[] = [];
  const lines = text.split('\n');
  let currentFund: string | null = null;
  let currentInvested = 0, currentValue = 0, currentReturnPct = 0, currentGain = 0;
  let grandTotalInvested = 0, grandTotalValue = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let isFund = false;
    for (const amc of AMC_NAMES) {
      if (line.includes(amc) && (line.includes('Fund') || line.includes('ETF') || line.includes('Plan'))) {
        if (!line.includes('Sub Total') && !line.includes('Grand Total')) {
          if (i + 1 < lines.length && /^\d+\|/.test(lines[i + 1].trim())) {
            isFund = true; break;
          }
        }
      }
    }

    if (isFund) {
      if (currentFund && currentValue > 0) {
        funds.push({
          name: sanitizeText(currentFund),
          invested: Math.round(currentInvested * 100) / 100,
          value: Math.round(currentValue * 100) / 100,
          returns: Math.round(currentGain * 100) / 100,
          returnsPercent: Math.round(currentReturnPct * 100) / 100,
          category: detectCategory(currentFund),
          risk: detectRisk(currentFund),
          rating: 4, sip: 0,
        });
      }
      currentFund = line.trim();
      currentInvested = 0; currentValue = 0; currentReturnPct = 0; currentGain = 0;
      continue;
    }

    if (line.includes('Sub Total') && currentFund) {
      const parts = line.split('|');
      const nums: number[] = [];
      for (const p of parts) {
        const pClean = p.trim().replace(/,/g, '');
        if (pClean && /^\d+(?:\.\d+)?$/.test(pClean)) nums.push(parseFloat(pClean));
      }
      if (nums.length >= 2) { currentInvested = nums[0]; currentValue = nums[nums.length - 1]; }
      continue;
    }

    if (line.includes('Return :') && currentFund && line.includes('Weighted Avg')) {
      const retMatch = line.match(/Return\s*:\s*([\d\-.]+)%/);
      const gainMatch = line.match(/Gain\s*\/\s*\(Loss\)\s*:\s*₹\s*([\d,\.\-]+)/);
      if (retMatch) currentReturnPct = parseFloat(retMatch[1]);
      if (gainMatch) currentGain = parseFloat(gainMatch[1].replace(/,/g, ''));
      continue;
    }

    if (line.includes('Grand Total')) {
      const parts = line.split('|');
      const nums: number[] = [];
      for (const p of parts) {
        const pClean = p.trim().replace(/,/g, '');
        if (pClean && /^\d+(?:\.\d+)?$/.test(pClean)) nums.push(parseFloat(pClean));
      }
      if (nums.length >= 2) { grandTotalInvested = nums[0]; grandTotalValue = nums[nums.length - 1]; }
      continue;
    }
  }

  if (currentFund && currentValue > 0) {
    funds.push({
      name: sanitizeText(currentFund),
      invested: Math.round(currentInvested * 100) / 100,
      value: Math.round(currentValue * 100) / 100,
      returns: Math.round(currentGain * 100) / 100,
      returnsPercent: Math.round(currentReturnPct * 100) / 100,
      category: detectCategory(currentFund),
      risk: detectRisk(currentFund),
      rating: 4, sip: 0,
    });
  }

  return { funds, grandTotalInvested, grandTotalValue };
}

function parseGenericTable(text: string) {
  const funds: any[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const hasFundName = AMC_NAMES.some(amc => trimmed.includes(amc)) && (trimmed.includes('Fund') || trimmed.includes('ETF') || trimmed.includes('Plan'));
    if (hasFundName) {
      const numberMatches = trimmed.match(/[₹Rs.]?\s*([\d,]+(?:\.\d{2})?)/g);
      const numbers = numberMatches ? numberMatches.map(n => parseFloat(n.replace(/[₹Rs.,\s]/g, ''))).filter(n => !isNaN(n) && n > 100) : [];
      if (numbers.length >= 2) {
        const name = trimmed.split(/[|\t]/)[0].trim();
        funds.push({
          name: sanitizeText(name), category: detectCategory(name),
          value: numbers[numbers.length - 1], invested: numbers[0],
          returns: numbers[numbers.length - 1] - numbers[0],
          returnsPercent: numbers[0] > 0 ? ((numbers[numbers.length - 1] - numbers[0]) / numbers[0] * 100) : 0,
          sip: 0, rating: 4, risk: detectRisk(name),
        });
      }
    }
  }
  return funds;
}

function calculateMetrics(funds: any[], grandTotalInvested?: number, grandTotalValue?: number) {
  const totalValue = grandTotalValue || funds.reduce((sum, f) => sum + (f.value || 0), 0);
  const investedAmount = grandTotalInvested || funds.reduce((sum, f) => sum + (f.invested || 0), 0);
  const currentReturns = totalValue - investedAmount;
  const returnsPercent = investedAmount > 0 ? (currentReturns / investedAmount * 100) : 0;
  const monthlySIP = funds.reduce((sum, f) => sum + (f.sip || 0), 0);
  const totalSIPs = funds.filter(f => (f.sip || 0) > 0).length;
  const equity = funds.filter(f => f.category?.includes('Equity')).reduce((s, f) => s + (f.value || 0), 0);
  const debt = funds.filter(f => f.category?.includes('Debt')).reduce((s, f) => s + (f.value || 0), 0);
  const hybrid = funds.filter(f => f.category?.includes('Hybrid')).reduce((s, f) => s + (f.value || 0), 0);
  const gold = funds.filter(f => f.category?.includes('Gold') || f.category?.includes('Commodity')).reduce((s, f) => s + (f.value || 0), 0);
  const liquid = funds.filter(f => f.category?.includes('Liquid')).reduce((s, f) => s + (f.value || 0), 0);
  const totalForAlloc = totalValue || 1;
  return {
    totalValue, investedAmount, currentReturns,
    returnsPercent: Math.round(returnsPercent * 100) / 100,
    xirr: Math.round(returnsPercent * 0.3 * 100) / 100,
    healthScore: Math.min(95, Math.max(40, 60 + (returnsPercent > 15 ? 20 : returnsPercent > 5 ? 10 : -10))),
    monthlySIP, totalSIPs,
    allocation: {
      equity: Math.round((equity / totalForAlloc) * 100) || 0,
      debt: Math.round((debt / totalForAlloc) * 100) || 0,
      hybrid: Math.round((hybrid / totalForAlloc) * 100) || 0,
      international: 0,
      gold: Math.round((gold / totalForAlloc) * 100) || 0,
      liquid: Math.round((liquid / totalForAlloc) * 100) || 0,
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Please sign in first' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const validExts = ['.pdf', '.csv', '.xlsx', '.xls'];
    if (!validExts.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return NextResponse.json({ error: 'Invalid file type. Upload PDF, CSV, or Excel only.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 10MB.' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    let text = '';
    let funds: any[] = [];
    let grandTotalInvested = 0, grandTotalValue = 0;
    let parserUsed = 'unknown';

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        text = new TextDecoder().decode(bytes);
        const result = parseNJWealthReport(text);
        funds = result.funds; grandTotalInvested = result.grandTotalInvested; grandTotalValue = result.grandTotalValue;
        parserUsed = 'nj-csv';
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        // Proper binary XLS/XLSX parsing using XLSX library
        try {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(Buffer.from(bytes), { type: 'buffer', cellDates: true });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][];
          
          // NJ Wealth XLS format: fund name row → transaction rows → Sub Total row
          let currentFundName = '';
          let firstDate = '';
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i].map((c: unknown) => String(c ?? '').trim());
            const col0 = row[0] || '';
            
            // Skip metadata rows
            const skipWords = ['Sr. No.', 'Sub Total', 'Grand Total', 'Return :', 'Note :', 'Folio', 'Anti Money', 'Address', 'City', 'Phone', 'Mobile', 'E-Mail', 'Your Company'];
            if (skipWords.some(w => col0.startsWith(w))) {
              if (col0 === 'Grand Total') {
                const nums = row.filter((c: string) => c && /^[\d,.]+$/.test(c.replace(/,/g,''))).map((c: string) => parseFloat(c.replace(/,/g,'')));
                if (nums.length >= 2) { grandTotalInvested = nums[0]; grandTotalValue = nums[nums.length - 1]; }
              }
              continue;
            }
            
            // Detect fund name row: col0 has text, cols 1-5 are empty
            const restEmpty = row.slice(1, 6).every((c: string) => !c || c === '0' || c === '-');
            const isFundName = col0.length > 5 && !/^\d/.test(col0) && restEmpty && !col0.includes('|');
            
            if (isFundName) {
              currentFundName = col0.replace(/\s*-\s*Gr$/, '').replace(/\s*- Growth$/, '').trim();
              firstDate = '';
              continue;
            }
            
            // Detect first transaction date
            if (/^\d+$/.test(col0) && currentFundName && !firstDate && row[4]) {
              const dateStr = String(row[4]);
              const m = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/);
              if (m) firstDate = m[3] + '-' + m[2] + '-' + m[1];
            }
            
            // Sub Total row: col5=invested, col8=units, col10=currentValue
            if (col0 === 'Sub Total' && currentFundName) {
              const invested = parseFloat(String(row[5] || '0').replace(/,/g, '')) || 0;
              const units = parseFloat(String(row[8] || '0').replace(/,/g, '')) || 0;
              const curValue = parseFloat(String(row[10] || row[9] || '0').replace(/,/g, '')) || 0;
              
              // Get return % from next row
              let retPct = 0, gain = 0;
              if (i + 1 < rows.length) {
                const nextRow = rows[i + 1].map((c: unknown) => String(c ?? ''));
                const nextText = nextRow.join(' ');
                const retMatch = nextText.match(/Weighted Avg\. Abs\. Return\s*:\s*([\d\-.]+)%/);
                const gainMatch = nextText.match(/Gain \/ \(Loss\)\s*:\s*Rs\.\s*([\d,.\-]+)/);
                if (retMatch) retPct = parseFloat(retMatch[1]);
                if (gainMatch) gain = parseFloat(gainMatch[1].replace(/,/g, ''));
              }
              
              if (invested > 0 && currentFundName) {
                funds.push({
                  name: sanitizeText(currentFundName),
                  invested,
                  value: curValue || units * (invested / (units || 1)),
                  returns: gain,
                  returnsPercent: retPct,
                  category: detectCategory(currentFundName),
                  risk: detectRisk(currentFundName),
                  rating: 4,
                  sip: 0,
                  units,
                  purchaseDate: firstDate,
                });
              }
              currentFundName = '';
              firstDate = '';
            }
          }
          
          if (funds.length > 0) {
            parserUsed = 'nj-xls-binary';
          } else {
            // Fallback: try as text
            text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
            const result = parseNJWealthReport(text);
            funds = result.funds; grandTotalInvested = result.grandTotalInvested || 0; grandTotalValue = result.grandTotalValue || 0;
            parserUsed = 'nj-xls-text-fallback';
          }
        } catch (xlsErr) {
          console.error('XLS parse error:', xlsErr);
          text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
          const result = parseNJWealthReport(text);
          funds = result.funds; grandTotalInvested = result.grandTotalInvested || 0; grandTotalValue = result.grandTotalValue || 0;
          parserUsed = 'nj-xls-text-fallback';
        }
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
        const result = parseNJWealthReport(text);
        funds = result.funds; grandTotalInvested = result.grandTotalInvested; grandTotalValue = result.grandTotalValue;
        parserUsed = 'nj-pdf';
        if (funds.length === 0) { funds = parseGenericTable(text); parserUsed = 'generic-pdf'; }
      }
    } catch (parseErr) { console.error('Parse error:', parseErr); }

    if (funds.length === 0 && text) { funds = parseGenericTable(text); parserUsed = 'generic-fallback'; }
    if (funds.length === 0) {
      const numbers = text.match(/[\d,]+(?:\.\d{2})?/g) || [];
      const bigNumbers = numbers.map(n => parseFloat(n.replace(/,/g, ''))).filter(n => !isNaN(n) && n > 1000);
      if (bigNumbers.length >= 3) {
        funds = [{ name: sanitizeText(file.name.replace(/\.[^/.]+$/, '')) + ' Portfolio', category: 'Mixed', value: bigNumbers[bigNumbers.length - 1] || 0, invested: bigNumbers[0] || bigNumbers[bigNumbers.length - 1] * 0.7, returns: 0, returnsPercent: 0, sip: 0, rating: 3, risk: 'Moderate' }];
        parserUsed = 'number-extract';
      }
    }

    if (funds.length === 0) {
      return NextResponse.json({ error: 'Could not extract fund data. Supported: NJ Wealth CAS, CAMS/Karvy PDF, Excel/CSV exports.', parserUsed, preview: text.substring(0, 300).replace(/[^\x20-\x7E\n]/g, '') }, { status: 422 });
    }

    const metrics = calculateMetrics(funds, grandTotalInvested || undefined, grandTotalValue || undefined);
    const transactions = funds.filter(f => (f.sip || 0) > 0).map((f, i) => ({ date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'SIP', fund: f.name, amount: f.sip, units: 0, nav: 0 }));
    const comparison = funds.slice(0, 5).map(f => ({ name: f.name, returns1Y: Math.round((f.returnsPercent || 0) * 0.8 * 100) / 100, returns3Y: Math.round((f.returnsPercent || 0) * 0.6 * 100) / 100, returns5Y: Math.round((f.returnsPercent || 0) * 0.5 * 100) / 100, risk: f.risk, aum: Math.round((f.value || 0) / 100000) }));

    const alerts = [];
    if (metrics.allocation.equity > 80) alerts.push({ type: 'warning', title: 'High Equity Exposure', message: `${metrics.allocation.equity}% in equity. Consider balancing.`, action: 'Rebalance' });
    if (metrics.returnsPercent < 0) alerts.push({ type: 'warning', title: 'Negative Returns', message: `Portfolio down ${Math.abs(metrics.returnsPercent).toFixed(1)}%. Review allocation.`, action: 'Analyze' });
    if (metrics.returnsPercent > 15) alerts.push({ type: 'success', title: 'Strong Performance', message: `Returns at ${metrics.returnsPercent.toFixed(1)}%. Great job!`, action: 'View' });
    if (funds.some(f => f.category?.includes('Sectoral') && (f.value || 0) > metrics.totalValue * 0.2)) alerts.push({ type: 'info', title: 'Sector Concentration', message: 'High allocation to sectoral funds. Consider diversifying.', action: 'Review' });
    if (alerts.length === 0) alerts.push({ type: 'success', title: 'Portfolio Healthy', message: `Returns at ${metrics.returnsPercent.toFixed(1)}%. Keep investing!`, action: 'View' });

    const sanitizedFunds = funds.map(f => ({
      name: sanitizeText(f.name),
      category: sanitizeText(f.category),
      value: f.value || 0,
      invested: f.invested || 0,
      returns: f.returns || 0,
      returnsPercent: f.returnsPercent || 0,
      sip: f.sip || 0,
      rating: f.rating || 4,
      risk: sanitizeText(f.risk),
    }));

    const portfolioData = {
      user_id: user.id,
      filename: sanitizeText(file.name),
      file_size: file.size,
      file_type: file.type || 'application/octet-stream',
      uploaded_at: new Date().toISOString(),
      data: {
        totalValue: metrics.totalValue,
        investedAmount: metrics.investedAmount,
        currentReturns: metrics.currentReturns,
        returnsPercent: metrics.returnsPercent,
        xirr: metrics.xirr,
        healthScore: metrics.healthScore,
        monthlySIP: metrics.monthlySIP,
        totalSIPs: metrics.totalSIPs,
        allocation: metrics.allocation,
        funds: sanitizedFunds,
        goals: [
          { name: 'Retirement Corpus', target: Math.round(metrics.totalValue * 10), current: Math.round(metrics.totalValue), progress: Math.min(100, Math.round((metrics.totalValue / (metrics.totalValue * 10)) * 1000) / 10), years: 20 },
          { name: 'Wealth Building', target: Math.round(metrics.totalValue * 5), current: Math.round(metrics.totalValue), progress: Math.min(100, Math.round((metrics.totalValue / (metrics.totalValue * 5)) * 1000) / 10), years: 10 },
          { name: 'Emergency Fund', target: Math.round(metrics.totalValue * 1.5), current: Math.round(metrics.totalValue * 0.3), progress: 20, years: 3 },
          { name: 'Child Education', target: Math.round(metrics.totalValue * 3), current: Math.round(metrics.totalValue * 0.5), progress: 16.7, years: 12 },
        ],
        taxHarvesting: { potentialSavings: Math.round(Math.abs(metrics.currentReturns) * 0.1), stclAvailable: 0, ltclAvailable: 0, recommendedActions: 0 },
        alerts,
      },
      transactions,
      comparison,
    };

    const { error: dbError } = await adminSupabase.from('portfolios').upsert(portfolioData, { onConflict: 'user_id' });
    if (dbError) {
      console.error('DB Error:', dbError);
      return NextResponse.json({ error: 'Failed to save: ' + dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Parsed ${funds.length} funds from ${file.name} using ${parserUsed}. Redirecting...`,
      fundsFound: funds.length,
      totalValue: metrics.totalValue,
      investedAmount: metrics.investedAmount,
      redirect: '/dashboard',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Try again.' }, { status: 500 });
  }
}
