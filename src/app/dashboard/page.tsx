'use client';
import { useState, useEffect, useContext, createContext } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

// ΓöÇΓöÇ design tokens via CSS vars (applied via globals.css) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

// ΓöÇΓöÇ DB row type ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
type DbHolding = {
  scheme_code: string;
  scheme_name: string;
  category: string;
  amc: string;
  units: number;
  avg_nav: number;
  current_nav: number;
  invested_amount: number;
  current_value: number;
  sip_amount?: number;
  purchase_date?: string | null;
};

// ΓöÇΓöÇ Derived display holding ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
type DisplayHolding = {
  id: string; name: string; cat: string; amc: string;
  logo: string; tone: string;
  invested: number; current: number;
  pct: number; xirr: number; day: number; alloc: number;
  sipAmount: number;
  purchaseDate: string | null;
};

// ΓöÇΓöÇ Colour palette for AMCs ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const AMC_TONES: Record<string, string> = {
  'PPFAS': '#0f3d2e', 'Mirae Asset': '#c89a3a', 'Axis': '#c1392b',
  'ICICI Prudential': '#1f6b50', 'HDFC': '#2952ff', 'SBI': '#0d4a7d',
  'Nippon India': '#e63946', 'Kotak': '#2b6cb0', 'Invesco': '#6b46c1',
  'Canara Robeco': '#d97706', 'PGIM India': '#0891b2',
};
function amcTone(amc: string): string {
  for (const [k, v] of Object.entries(AMC_TONES)) if (amc.includes(k) || k.includes(amc)) return v;
  const h = [...amc].reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = ['#1f6b50','#c1392b','#2952ff','#c89a3a','#0d4a7d','#6b46c1','#0891b2'];
  return colors[h % colors.length];
}
function logoOf(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ΓöÇΓöÇ Live data context ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
type PortfolioCtx = {
  holdings: DisplayHolding[];
  totals: { current: number; invested: number; gain: number; gainPct: number; fundCount: number; xirr: number | null; };
  loading: boolean;
  userName: string;
};
const PCtx = createContext<PortfolioCtx>({
  holdings: [], totals: { current: 0, invested: 0, gain: 0, gainPct: 0, fundCount: 0, xirr: null },
  loading: true, userName: '',
});

function usePortfolio() { return useContext(PCtx); }

// ΓöÇΓöÇ Allocation computed from real holdings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function allocFromHoldings(holdings: DisplayHolding[]) {
  const total = holdings.reduce((s, h) => s + h.current, 0) || 1;
  const buckets: Record<string, number> = {};
  for (const h of holdings) {
    const cat = h.cat || 'Other';
    buckets[cat] = (buckets[cat] || 0) + h.current;
  }
  const palette: Record<string, string> = {
    'Equity': '#1f8a5b', 'ELSS': '#1f8a5b', 'Small Cap': '#7cf6c2',
    'Large Cap': '#0f3d2e', 'Mid Cap': '#1f6b50', 'Flexi Cap': '#c89a3a',
    'Multi Cap': '#c89a3a', 'Gold': '#b87a3e', 'Debt': '#2a6fdb',
    'Arbitrage': '#2a6fdb', 'Hybrid': '#6b46c1', 'Thematic': '#c1392b',
    'Sectoral': '#c1392b', 'Other': '#8b8773',
  };
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .map(([label, val]) => ({ label, pct: (val / total) * 100, color: palette[label] || '#8b8773' }));
}

// ΓöÇΓöÇ Static fallbacks for chart/perf (cosmetic only) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const PERF_MONTHS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
const PERF_DRIFT  = [0.018,0.022,-0.012,0.028,0.041,0.019,-0.008,0.034,0.027,0.019,0.024,0.031];
const PERF_BENCH  = [0.015,0.018,-0.010,0.022,0.031,0.015,-0.012,0.027,0.021,0.014,0.018,0.022];

// ΓöÇΓöÇ helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function fmtINR(n: number, opts: { short?: boolean; dec?: number } = {}): string {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (opts.short) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
    return `${sign}₹${abs.toFixed(0)}`;
  }
  const s = abs.toFixed(opts.dec ?? 0);
  const [whole, dec] = s.split('.');
  let last = whole.slice(-3), rest = whole.slice(0, -3);
  if (rest) rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const out = rest ? `${rest},${last}` : last;
  return `${sign}₹${out}${dec ? '.' + dec : ''}`;
}
function fmtPct(n: number, dec = 2): string { return (n >= 0 ? '+' : '') + n.toFixed(dec) + '%'; }

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 86400000;
}

function calculatePortfolioXirr(holdings: DisplayHolding[]): number | null {
  const today = new Date();
  const flows: { amount: number; date: Date }[] = [];
  let currentTotal = 0;
  let oldestPurchase: Date | null = null;

  for (const h of holdings) {
    if (!h.purchaseDate || h.invested <= 0 || h.current <= 0) continue;

    const purchaseDate = new Date(h.purchaseDate);
    if (Number.isNaN(purchaseDate.getTime())) continue;

    flows.push({ amount: -h.invested, date: purchaseDate });
    currentTotal += h.current;

    if (!oldestPurchase || purchaseDate < oldestPurchase) {
      oldestPurchase = purchaseDate;
    }
  }

  if (!flows.length || currentTotal <= 0 || !oldestPurchase) return null;

  // Avoid showing misleading annualised XIRR for very new portfolios.
  if (daysBetween(oldestPurchase, today) < 90) return null;

  flows.push({ amount: currentTotal, date: today });

  const startDate = flows[0].date;

  const xnpv = (rate: number) =>
    flows.reduce((sum, flow) => {
      const years = daysBetween(startDate, flow.date) / 365;
      return sum + flow.amount / Math.pow(1 + rate, years);
    }, 0);

  let rate = 0.12;

  for (let i = 0; i < 100; i++) {
    const value = xnpv(rate);
    const epsilon = 1e-6;
    const derivative = (xnpv(rate + epsilon) - value) / epsilon;

    if (!Number.isFinite(value) || !Number.isFinite(derivative) || Math.abs(derivative) < 1e-10) {
      return null;
    }

    const nextRate = rate - value / derivative;

    if (!Number.isFinite(nextRate) || nextRate <= -0.9999 || nextRate > 100) {
      return null;
    }

    if (Math.abs(nextRate - rate) < 1e-7) {
      return nextRate * 100;
    }

    rate = nextRate;
  }

  return null;
}

function sparkPath(seed: number, w: number, h: number): string {
  const n = 40; const pts: number[] = []; let v = 50; let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280; v += (s / 233280 - 0.45) * 6; pts.push(v);
  }
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  return 'M ' + pts.map((p, i) => `${(i / (n - 1)) * w} ${h - ((p - min) / range) * h * 0.85 - h * 0.075}`).join(' L ');
}

function buildPerf(invested: number) {
  let v = invested || 3520000, bench = invested || 3520000;
  return PERF_MONTHS.map((month, i) => {
    v *= (1 + PERF_DRIFT[i]); bench *= (1 + PERF_BENCH[i]);
    return { month, value: Math.round(v), bench: Math.round(bench) };
  });
}

function donutArc(pct: number, total: number, acc: number, R: number, r: number, cx: number, cy: number) {
  const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
  const end = ((acc + pct) / total) * Math.PI * 2 - Math.PI / 2;
  const large = (end - start) > Math.PI ? 1 : 0;
  const x1 = cx + Math.cos(start) * R, y1 = cy + Math.sin(start) * R;
  const x2 = cx + Math.cos(end) * R,   y2 = cy + Math.sin(end) * R;
  const x3 = cx + Math.cos(end) * r,   y3 = cy + Math.sin(end) * r;
  const x4 = cx + Math.cos(start) * r, y4 = cy + Math.sin(start) * r;
  return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${r} ${r} 0 ${large} 0 ${x4} ${y4} Z`;
}

// ΓöÇΓöÇ sub-components ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function LogoBubble({ logo, tone, size = 40 }: { logo: string; tone: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: tone, display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: size * 0.325,
      color: 'white', flexShrink: 0, letterSpacing: '0.02em',
    }}>
      {logo}
    </div>
  );
}

function Sparkline({ seed, w = 80, h = 30, color }: { seed: number; w?: number; h?: number; color: string }) {
  const d = sparkPath(seed, w, h);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TabSet({ tabs, value, onChange }: { tabs: (string | { value: string; label: string })[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12 }}>
      {tabs.map(t => {
        const v = typeof t === 'string' ? t : t.value;
        const l = typeof t === 'string' ? t : t.label;
        const active = v === value;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: '7px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 500,
            background: active ? 'var(--surface)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-3)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none',
            border: active ? '1px solid var(--border)' : '1px solid transparent',
            cursor: 'pointer',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// ΓöÇΓöÇ Hero value card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function HeroValue() {
  const { totals, holdings, loading } = usePortfolio();
  const gainPct = totals.gainPct;
  const gain = totals.gain;
  return (
    <div style={{
      gridColumn: '1 / -1',
      padding: '40px 40px 36px',
      borderRadius: 'var(--radius-xl)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* orbs */}
      <div style={{ position: 'absolute', right: -120, top: -120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 22%, transparent), transparent 65%)', pointerEvents: 'none', filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', left: -80, bottom: -100, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--violet, #8c5cff) 18%, transparent), transparent 70%)', pointerEvents: 'none', filter: 'blur(30px)' }} />

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>Net worth · all accounts</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--up)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
              Live · synced 2 min ago
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(64px, 11vw, 120px)', lineHeight: 0.85, letterSpacing: '-0.05em', fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>
            <span style={{ color: 'var(--ink-3)', fontSize: '0.5em', marginRight: 8, verticalAlign: 'super' }}>₹</span>
            {loading ? '—' : fmtINR(totals.current).replace('₹', '')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, background: gain >= 0 ? 'var(--up-soft)' : 'var(--down-soft)', color: gain >= 0 ? 'var(--up)' : 'var(--down)', border: 'none' }}>
              {gain >= 0 ? 'Γû▓' : 'Γû╝'} {gainPct.toFixed(2)}% all time
            </span>
            <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {fmtINR(gain, { short: true })} {gain >= 0 ? 'gained' : 'lost'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, background: 'var(--brand)', color: 'var(--bg)', border: 'none', cursor: 'pointer' }}>
            <PlusIcon /> Invest now
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', cursor: 'pointer' }}>
            <DownloadIcon /> Statement
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: 'none', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>
            <ShareIcon /> Share
          </button>
        </div>
      </div>

      {/* metrics strip */}
      <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
        {[
          { label: 'Invested', value: fmtINR(totals.invested, { short: true }), sub: `across ${totals.fundCount} funds` },
          { label: 'Total Gain', value: fmtPct(totals.gainPct), sub: fmtINR(totals.gain, { short: true }), up: totals.gain >= 0 },
          {
            label: 'XIRR',
            value: totals.xirr === null ? '—' : fmtPct(totals.xirr, 1),
            sub: totals.xirr === null ? 'needs 90+ days' : 'annualised',
          },
          { label: 'Funds', value: String(totals.fundCount), sub: 'across portfolio' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: s.up ? 'var(--up)' : 'inherit' }}>{s.value}</span>
            <span style={{ color: 'var(--ink-3)', fontSize: 11.5 }}>{s.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Performance chart ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function PerfBlock() {
  const { totals } = usePortfolio();
  const [range, setRange] = useState('1Y');
  const data = buildPerf(totals.invested);
  const W = 760, H = 260;
  const pad = { l: 48, r: 16, t: 18, b: 28 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const allVals = data.flatMap(d => [d.value, d.bench]);
  const minV = Math.min(...allVals) * 0.96, maxV = Math.max(...allVals) * 1.02;
  const range_ = maxV - minV || 1;
  const xs = (i: number) => pad.l + (i / (data.length - 1)) * cW;
  const ys = (v: number) => pad.t + cH - ((v - minV) / range_) * cH;
  const linePath = (key: 'value' | 'bench') => 'M ' + data.map((d, i) => `${xs(i).toFixed(1)} ${ys(d[key]).toFixed(1)}`).join(' L ');
  const areaPath = linePath('value') + ` L ${xs(data.length - 1).toFixed(1)} ${pad.t + cH} L ${xs(0).toFixed(1)} ${pad.t + cH} Z`;

  return (
    <div className="card" style={{ padding: 28, gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
        <div>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>Performance · You vs Nifty 50</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, letterSpacing: '-0.02em' }}>+37.71%</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: 'var(--up-soft)', color: 'var(--up)', border: 'none' }}>Γû▓ +6.4pp vs bench</span>
          </div>
        </div>
        <TabSet tabs={['1M', '3M', '6M', '1Y', '3Y', 'All']} value={range} onChange={setRange} />
      </div>

      <div style={{ marginLeft: -12 }}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 5 }).map((_, i) => {
            const y = pad.t + (i / 4) * cH;
            const v = maxV - (i / 4) * range_;
            return (
              <g key={i}>
                <line x1={pad.l} x2={pad.l + cW} y1={y} y2={y} stroke="var(--border)" strokeDasharray={i === 4 ? '' : '2 4'} />
                <text x={pad.l - 8} y={y + 4} fontSize="10" textAnchor="end" fill="var(--ink-3)" fontFamily="var(--font-mono)">
                  {fmtINR(v, { short: true })}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => (i % 2 === 0 || i === data.length - 1) && (
            <text key={i} x={xs(i)} y={H - 8} fontSize="10" textAnchor="middle" fill="var(--ink-3)" fontFamily="var(--font-mono)">{d.month}</text>
          ))}
          <path d={linePath('bench')} fill="none" stroke="var(--ink-4)" strokeWidth="1.2" strokeDasharray="3 4" />
          <path d={areaPath} fill="url(#pg)" />
          <path d={linePath('value')} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].value)} r="5" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />
          <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].value)} r="10" fill="var(--brand)" opacity="0.15" />
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'center', fontSize: 11.5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, height: 2, background: 'var(--brand)', display: 'inline-block' }} />Your portfolio
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 14, display: 'inline-block', borderTop: '2px dashed var(--ink-4)' }} />Nifty 50 TRI
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--ink-3)' }}>Updated 14 May 2026, 3:42 PM IST</span>
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Allocation donut ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AllocationBlock() {
  const { holdings } = usePortfolio();
  const [view, setView] = useState<'asset' | 'cap'>('asset');
  const realAlloc = allocFromHoldings(holdings);
  const data = realAlloc.length ? realAlloc : [{ label: 'Loading', pct: 100, color: 'var(--surface-3)' }];
  const size = 150, thickness = 20, R = size / 2, r = R - thickness, cx = R, cy = R;
  const total = data.reduce((s, d) => s + d.pct, 0);
  let acc = 0;
  const arcs = data.map(d => {
    const path = donutArc(d.pct, total, acc, R, r, cx, cy);
    acc += d.pct;
    return { path, color: d.color, label: d.label, pct: d.pct };
  });

  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>Allocation</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>by category</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <svg width={size} height={size}>
            {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} />)}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1 }}>{data[0].pct.toFixed(1)}%</div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginTop: 4 }}>{data[0].label}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 10, alignItems: 'center', fontSize: 12.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
            <span>{d.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{d.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ΓöÇΓöÇ AI Promo card ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AIPromo() {
  return (
    <Link href="/chat" style={{
      display: 'block', padding: 28, gridColumn: 'span 2', textAlign: 'left', cursor: 'pointer',
      background: 'linear-gradient(135deg, var(--surface) 0%, color-mix(in oklab, var(--brand) 8%, var(--surface)) 100%)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      position: 'relative', overflow: 'hidden',
      transition: 'transform .15s, box-shadow .15s',
      textDecoration: 'none',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}>
      <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 20%, transparent), transparent 70%)', filter: 'blur(20px)' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, position: 'relative' }}>
        <div style={{ flex: 1, maxWidth: 540 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'var(--brand)', color: 'var(--bg)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 18 }}>
            <SparkleIcon size={11} /> FOLIO AI · 4 NEW INSIGHTS
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 80px)', lineHeight: 0.98, letterSpacing: '-0.03em', marginBottom: 14 }}>
            You&apos;re <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>over-weight</em><br />on small caps.
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.55, marginBottom: 18, maxWidth: 480 }}>
            A 4pp rotation into flexi-cap drops your beta from 0.96 → 0.88 with minimal return drag. Want to see the rebalance plan?
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 99, background: 'var(--ink)', color: 'var(--bg)', fontSize: 13, fontWeight: 600 }}>
            Open Folio AI <ArrowRightIcon />
          </div>
        </div>
        <div style={{ flexShrink: 0, width: 160, height: 160, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px dashed var(--border-strong)' }} />
          <div style={{ position: 'absolute', inset: 16, borderRadius: '50%', border: '1px dashed var(--border-strong)', opacity: 0.6 }} />
          <div style={{ width: 90, height: 90, borderRadius: 24, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 48px -8px color-mix(in oklab, var(--brand) 80%, transparent)' }}>
            <SparkleIcon size={42} color="var(--bg)" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ΓöÇΓöÇ Portfolio health ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function HealthRing() {
  const value = 82, size = 120, R = size / 2 - 8, C = 2 * Math.PI * R;
  const offset = C - (value / 100) * C;
  return (
    <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -60, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 14%, transparent), transparent 70%)' }} />
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 18 }}>Portfolio health</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
        <div style={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size}>
            <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--surface-3)" strokeWidth="10" />
            <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--brand)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={offset} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: size * 0.28, lineHeight: 1 }}>82</div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginTop: 4 }}>of 100</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Strong</div>
          <div style={{ color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
            Diversified across 8 funds, 5 categories. Beating 78% of peers with similar risk.
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: 'var(--up-soft)', color: 'var(--up)', border: 'none' }}>Diversified</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500, background: 'var(--brand-soft)', color: 'var(--brand)', border: 'none' }}>Alpha +6.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Top Holdings table ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function TopHoldings() {
  const { holdings, totals, loading } = usePortfolio();
  const H = holdings;
  return (
    <div className="card" style={{ padding: 0, gridColumn: 'span 2' }}>
      <div style={{ padding: '24px 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>Top holdings</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.4vw, 48px)', lineHeight: 1.02, letterSpacing: '-0.02em' }}>
            {loading ? '…' : `All ${totals.fundCount} funds`}
          </div>
        </div>
        <Link href="/portfolio" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', textDecoration: 'none' }}>
          View portfolio →
        </Link>
      </div>
      {loading || !H.length ? (
        <div style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
          {loading ? 'Loading portfolio…' : (
            <span>No holdings yet. <Link href="/upload" style={{ color: 'var(--brand-2)' }}>Upload your CAS →</Link></span>
          )}
        </div>
      ) : (
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            {['Fund', 'Value', 'Returns', 'Allocation', 'Trend'].map((h, i) => (
              <th key={h} style={{ textAlign: i > 0 ? 'right' : 'left', fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {H.slice(0, 8).map((h, i) => (
            <tr key={h.id} style={{ transition: 'background .12s' }}
              onMouseEnter={e => { Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(td => (td as HTMLElement).style.background = 'var(--surface-2)'); }}
              onMouseLeave={e => { Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(td => (td as HTMLElement).style.background = ''); }}>
              <td style={{ padding: '16px 18px', borderBottom: i < H.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LogoBubble logo={h.logo} tone={h.tone} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{h.name}</div>
                    <div style={{ color: 'var(--ink-3)', fontSize: 11, marginTop: 2 }}>{h.cat} · {h.amc}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '16px 18px', borderBottom: i < H.length - 1 ? '1px solid var(--border)' : 'none', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>{fmtINR(h.current)}</div>
                <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>{fmtINR(h.invested, { short: true })} cost</div>
              </td>
              <td style={{ padding: '16px 18px', borderBottom: i < H.length - 1 ? '1px solid var(--border)' : 'none', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: h.pct >= 0 ? 'var(--up)' : 'var(--down)' }}>{fmtPct(h.pct)}</div>
              </td>
              <td style={{ padding: '16px 18px', borderBottom: i < H.length - 1 ? '1px solid var(--border)' : 'none', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
                  <span>{h.alloc.toFixed(1)}%</span>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-3)', width: 64, overflow: 'hidden' }}>
                    <span style={{ display: 'block', height: '100%', width: `${Math.min(h.alloc * 3, 100)}%`, background: h.tone, borderRadius: 999 }} />
                  </div>
                </div>
              </td>
              <td style={{ padding: '16px 18px', borderBottom: i < H.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <Sparkline seed={i + 1} w={80} h={30} color={h.pct >= 0 ? 'var(--up)' : 'var(--down)'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

// ΓöÇΓöÇ Today's movers (real data) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function TopMovers() {
  const { holdings, loading } = usePortfolio();
  if (loading || !holdings.length) return null;
  const shown = [...holdings].sort((a, b) => b.pct - a.pct).slice(0, 3);
  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 18 }}>Top performers</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {shown.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LogoBubble logo={h.logo} tone={h.tone} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name.split(' ').slice(0, 3).join(' ')}</div>
              <div style={{ color: 'var(--ink-3)', fontSize: 11, marginTop: 2 }}>{h.cat}</div>
            </div>
            <Sparkline seed={i + 1} w={60} h={24} color={h.pct >= 0 ? 'var(--up)' : 'var(--down)'} />
            <div style={{ textAlign: 'right', minWidth: 60 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: h.pct >= 0 ? 'var(--up)' : 'var(--down)' }}>
                {fmtPct(h.pct)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ΓöÇΓöÇ SIPs mini — real sip_amount from holdings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function SipsMini() {
  const { holdings } = usePortfolio();
  const sipFunds = holdings.filter(h => h.sipAmount > 0);
  const totalSIP = sipFunds.reduce((s, h) => s + h.sipAmount, 0);
  return (
    <div className="card" style={{ padding: 28, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--surface), var(--surface-2))' }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in oklab, var(--gold, #e8b14a) 16%, transparent), transparent 70%)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>Monthly SIPs</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {totalSIP > 0 ? fmtINR(totalSIP) : '—'}
          </div>
          <div style={{ color: 'var(--ink-3)', fontSize: 11.5, marginTop: 6 }}>
            {sipFunds.length > 0 ? `${sipFunds.length} active SIPs` : `${holdings.length} funds · SIP data not in report`}
          </div>
        </div>
        <Link href="/sips" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--bg)', textDecoration: 'none' }}>
          <PlusIcon size={12} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
        {holdings.slice(0, 4).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoBubble logo={h.logo} tone={h.tone} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name.split(' ').slice(0, 3).join(' ')}</div>
              <div style={{ color: 'var(--ink-3)', fontSize: 10.5 }}>{h.cat}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>
              {h.sipAmount > 0 ? fmtINR(h.sipAmount, { short: true }) : fmtINR(h.invested, { short: true })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Goals mini — computed from real portfolio corpus ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function GoalsMini() {
  const { totals } = usePortfolio();
  const corpus = totals.current;
  const GOALS = [
    { name: 'Retirement corpus', target: 50000000, tone: '#1f6b50' },
    { name: 'Wealth creation', target: 10000000, tone: '#c89a3a' },
  ];
  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>Active goals</div>
        <Link href="/goals" style={{ display: 'inline-flex', alignItems: 'center', padding: 6, background: 'transparent', color: 'var(--ink-2)', textDecoration: 'none' }}>
          <ArrowRightIcon />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {GOALS.map((g, i) => {
          const pct = Math.min((corpus / g.target) * 100, 100);
          const onTrack = pct >= 15;
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 500 }}>{g.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{pct.toFixed(0)}%</div>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: g.tone, borderRadius: 999, transition: 'width .5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginTop: 6 }}>
                <span style={{ color: 'var(--ink-3)' }}>{fmtINR(corpus, { short: true })} / {fmtINR(g.target, { short: true })}</span>
                <span style={{ color: onTrack ? 'var(--up)' : 'var(--down)' }}>{onTrack ? 'on track' : 'keep investing'}</span>
              </div>
            </div>
          );
        })}
        <Link href="/goals" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, border: '1px dashed var(--border)', color: 'var(--ink-3)', fontSize: 12, textDecoration: 'none', marginTop: 4 }}>
          + Set your own goals →
        </Link>
      </div>
    </div>
  );
}

// ΓöÇΓöÇ Inline SVG icons ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function PlusIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
}
function DownloadIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M12 3v12M6 11l6 6 6-6M5 21h14" /></svg>;
}
function ShareIcon({ size = 13 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8 11 8-4M8 13l8 4" /></svg>;
}
function SparkleIcon({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
}
function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}
function CalendarIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>;
}

// ΓöÇΓöÇ Main page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Good morning');
  const [userName, setUserName] = useState('');
  const [holdings, setHoldings] = useState<DisplayHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch user name
      const { createClient } = await import('@/utils/supabase/client');
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Investor';
        setUserName(name.split(' ')[0]);
      }

      // Fetch real holdings
      const res = await fetch('/api/portfolio/holdings');
      if (res.ok) {
        const data = await res.json();
        const rows: DbHolding[] = data.holdings || [];
        const totalCurrent = rows.reduce((s, r) => s + (r.current_value || 0), 0) || 1;
        const mapped: DisplayHolding[] = rows.map((r, i) => {
          const gain = r.current_value - r.invested_amount;
          const pct = r.invested_amount > 0 ? (gain / r.invested_amount) * 100 : 0;
          return {
            id: r.scheme_code || String(i),
            name: r.scheme_name,
            cat: r.category || 'Equity',
            amc: r.amc || '',
            logo: logoOf(r.scheme_name),
            tone: amcTone(r.amc || r.scheme_name),
            invested: r.invested_amount,
            current: r.current_value,
            pct,
            xirr: 0,
            day: 0,
            alloc: Math.round((r.current_value / totalCurrent) * 1000) / 10,
            sipAmount: r.sip_amount || 0,
            purchaseDate: r.purchase_date || null,
          };
        }).sort((a, b) => b.current - a.current);
        setHoldings(mapped);
        setLastSync(new Date());
      }
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totals = {
    current:   holdings.reduce((s, h) => s + h.current, 0),
    invested:  holdings.reduce((s, h) => s + h.invested, 0),
    gain:      holdings.reduce((s, h) => s + (h.current - h.invested), 0),
    gainPct:   0,
    fundCount: holdings.length,
    xirr:     calculatePortfolioXirr(holdings),
  };
  if (totals.invested > 0) totals.gainPct = (totals.gain / totals.invested) * 100;

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <PCtx.Provider value={{ holdings, totals, loading, userName }}>
    <AppLayout title="Dashboard">
      <div style={{ padding: '28px 40px 120px', maxWidth: 1600, margin: '0 auto', width: '100%' }}>

        {/* page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
              {greeting}{userName ? `, ${userName}` : ''}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 80px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
              Your money is <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>growing</em>.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink-3)', fontSize: 13 }}>
            {lastSync && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Synced {lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button onClick={loadData} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              Γå║ Re-sync
            </button>
            <CalendarIcon /> {today}
          </div>
        </div>

        {/* bento grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <HeroValue />
          <AIPromo />
          <HealthRing />
          <PerfBlock />
          <AllocationBlock />
          <TopHoldings />
          <TopMovers />
          <SipsMini />
          <GoalsMini />
        </div>
      </div>

      <style>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          position: relative;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @media (max-width: 1100px) {
          [data-bento] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          [data-bento] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
    </PCtx.Provider>
  );
}
