// Shared data, formatters, and components for FolioIQ pages
// This is the Next.js equivalent of data.jsx + shared.jsx + charts.jsx

export const fmtINR = (n: number, opts: { short?: boolean; dec?: number } = {}): string => {
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
};

export const fmtPct = (n: number, dec = 2) => (n >= 0 ? '+' : '') + n.toFixed(dec) + '%';

export const PORTFOLIO = {
  user: { name: 'Aarav Sharma', email: 'aarav@folioiq.in', avatar: 'AS', plan: 'Plus' },
  totals: { current: 4847263, invested: 3520000, dayChange: 18420, dayPct: 0.38, totalGain: 1327263, totalPct: 37.71, xirr: 18.4, cagr: 16.2 },
};

export const HOLDINGS = [
  { id: 'ppfc', name: 'Parag Parikh Flexi Cap', cat: 'Flexi Cap', amc: 'PPFAS', logo: 'PP', tone: '#0f3d2e', units: 1842.31, nav: 78.42, invested: 128000, current: 144430, gain: 16430, pct: 12.83, xirr: 21.4, day: 0.42, alloc: 29.8 },
  { id: 'mira', name: 'Mirae Asset Large Cap', cat: 'Large Cap', amc: 'Mirae', logo: 'MA', tone: '#c89a3a', units: 3120.74, nav: 104.10, invested: 280000, current: 324790, gain: 44790, pct: 16.00, xirr: 14.2, day: 0.18, alloc: 26.7 },
  { id: 'axsm', name: 'Axis Small Cap', cat: 'Small Cap', amc: 'Axis', logo: 'AX', tone: '#c1392b', units: 4901.20, nav: 88.91, invested: 320000, current: 435800, gain: 115800, pct: 36.19, xirr: 28.7, day: -1.22, alloc: 24.1 },
  { id: 'icic', name: 'ICICI Pru Nifty 50 Index', cat: 'Index', amc: 'ICICI', logo: 'IC', tone: '#1f6b50', units: 5210.55, nav: 62.34, invested: 300000, current: 324900, gain: 24900, pct: 8.30, xirr: 11.1, day: 0.25, alloc: 13.9 },
  { id: 'hdfc', name: 'HDFC Mid-Cap Opportunities', cat: 'Mid Cap', amc: 'HDFC', logo: 'HD', tone: '#2952ff', units: 2410.99, nav: 142.20, invested: 240000, current: 342840, gain: 102840, pct: 42.85, xirr: 24.8, day: 0.91, alloc: 5.5 },
  { id: 'sbib', name: 'SBI Bluechip', cat: 'Large Cap', amc: 'SBI', logo: 'SB', tone: '#0d4a7d', units: 1820.10, nav: 88.32, invested: 120000, current: 160770, gain: 40770, pct: 33.97, xirr: 16.4, day: 0.07, alloc: 4.0 },
  { id: 'kotn', name: 'Kotak Emerging Equity', cat: 'Mid Cap', amc: 'Kotak', logo: 'KO', tone: '#7a3ec1', units: 980.51, nav: 140.40, invested: 90000, current: 137650, gain: 47650, pct: 52.94, xirr: 31.4, day: -0.55, alloc: 3.4 },
  { id: 'gold', name: 'Nippon Gold BeES (ETF)', cat: 'Commodity', amc: 'Nippon', logo: 'NP', tone: '#9c7a1c', units: 520.00, nav: 62.10, invested: 30000, current: 32290, gain: 2290, pct: 7.63, xirr: 9.6, day: 0.38, alloc: 1.8 },
];

export const ALLOC_ASSET = [
  { label: 'Equity', pct: 84.5, color: '#1f8a5b' },
  { label: 'Debt', pct: 9.2, color: '#c89a3a' },
  { label: 'Gold/ETF', pct: 3.4, color: '#b87a3e' },
  { label: 'Intl', pct: 1.9, color: '#2a6fdb' },
  { label: 'Cash', pct: 1.0, color: '#8b8773' },
];

export const ALLOC_CAP = [
  { label: 'Large Cap', pct: 42.1, color: '#0f3d2e' },
  { label: 'Mid Cap', pct: 18.4, color: '#1f6b50' },
  { label: 'Small Cap', pct: 24.1, color: '#7cf6c2' },
  { label: 'Flexi', pct: 9.8, color: '#c89a3a' },
  { label: 'Other', pct: 5.6, color: '#b3ad9c' },
];

export const ALLOC_SECTOR = [
  { label: 'Financials', pct: 28.4 }, { label: 'IT', pct: 18.1 },
  { label: 'Consumer', pct: 12.6 }, { label: 'Energy', pct: 9.4 },
  { label: 'Auto', pct: 7.8 }, { label: 'Pharma', pct: 6.2 },
  { label: 'Materials', pct: 5.1 }, { label: 'Telecom', pct: 4.0 }, { label: 'Other', pct: 8.4 },
];

export const SIPS = [
  { fund: 'Parag Parikh Flexi Cap', amount: 15000, day: 5, next: 'Jun 05', status: 'Active', since: 'Mar 2022', total: 21, logo: 'PP', tone: '#0f3d2e' },
  { fund: 'Mirae Asset Large Cap', amount: 10000, day: 7, next: 'Jun 07', status: 'Active', since: 'Aug 2021', total: 33, logo: 'MA', tone: '#c89a3a' },
  { fund: 'Axis Small Cap', amount: 8000, day: 10, next: 'Jun 10', status: 'Active', since: 'Jan 2022', total: 28, logo: 'AX', tone: '#c1392b' },
  { fund: 'HDFC Mid-Cap Opportunities', amount: 5000, day: 15, next: 'Jun 15', status: 'Active', since: 'Jun 2023', total: 11, logo: 'HD', tone: '#2952ff' },
  { fund: 'ICICI Pru Nifty 50 Index', amount: 7000, day: 20, next: 'Jun 20', status: 'Paused', since: 'Feb 2022', total: 24, logo: 'IC', tone: '#1f6b50' },
];

export const GOALS = [
  { name: 'Down payment — Bengaluru apartment', icon: 'home', target: 8000000, current: 2840000, by: 'Mar 2029', monthly: 42000, onTrack: true, tone: '#1f6b50' },
  { name: "Aanya — undergrad fund", icon: 'goal', target: 5000000, current: 1120000, by: 'Jul 2034', monthly: 18000, onTrack: true, tone: '#c89a3a' },
  { name: 'Retirement nest egg', icon: 'leaf', target: 50000000, current: 4847263, by: 'Apr 2049', monthly: 35000, onTrack: false, tone: '#0f3d2e' },
  { name: 'Bali sabbatical', icon: 'flame', target: 600000, current: 412000, by: 'Dec 2026', monthly: 14000, onTrack: true, tone: '#c1392b' },
];

export const TX = [
  { date: '2026-05-12', kind: 'SIP', fund: 'Parag Parikh Flexi Cap', amount: 15000, units: 191.3, nav: 78.42, status: 'Completed', logo: 'PP', tone: '#0f3d2e' },
  { date: '2026-05-10', kind: 'SIP', fund: 'Mirae Asset Large Cap', amount: 10000, units: 96.1, nav: 104.10, status: 'Completed', logo: 'MA', tone: '#c89a3a' },
  { date: '2026-05-08', kind: 'Buy', fund: 'HDFC Mid-Cap Opportunities', amount: 25000, units: 175.8, nav: 142.20, status: 'Completed', logo: 'HD', tone: '#2952ff' },
  { date: '2026-05-03', kind: 'Dividend', fund: 'SBI Bluechip', amount: 1820, units: 0, nav: 88.32, status: 'Credited', logo: 'SB', tone: '#0d4a7d' },
  { date: '2026-04-22', kind: 'Switch', fund: 'Axis Bluechip → Axis Small Cap', amount: 40000, units: 449.9, nav: 88.91, status: 'Completed', logo: 'AX', tone: '#c1392b' },
  { date: '2026-04-15', kind: 'Redeem', fund: 'ICICI Pru Nifty 50 Index', amount: 30000, units: 481.2, nav: 62.34, status: 'Settled', logo: 'IC', tone: '#1f6b50' },
  { date: '2026-04-05', kind: 'SIP', fund: 'Parag Parikh Flexi Cap', amount: 15000, units: 194.2, nav: 77.22, status: 'Completed', logo: 'PP', tone: '#0f3d2e' },
  { date: '2026-04-01', kind: 'Buy', fund: 'Kotak Emerging Equity', amount: 20000, units: 142.4, nav: 140.40, status: 'Completed', logo: 'KO', tone: '#7a3ec1' },
];

export const WATCH = [
  { name: 'Quant Small Cap Fund', amc: 'Quant', ret1: 38.4, nav: 282.41, day: 1.8, added: '2 weeks ago', logo: 'QT', tone: '#c1392b' },
  { name: 'Tata Digital India', amc: 'Tata', ret1: 42.6, nav: 48.20, day: 2.3, added: '1 month ago', logo: 'TT', tone: '#1f6b50' },
  { name: 'Motilal Oswal L&M', amc: 'Motilal', ret1: 34.2, nav: 64.18, day: -0.4, added: '3 days ago', logo: 'MO', tone: '#7a3ec1' },
  { name: 'Nippon Large Cap', amc: 'Nippon', ret1: 24.1, nav: 71.83, day: 0.6, added: '1 week ago', logo: 'NP', tone: '#0d4a7d' },
];

export const EXPLORE_FUNDS = [
  { id: 'qnte', name: 'Quant Small Cap Fund', cat: 'Small Cap', amc: 'Quant', logo: 'QT', tone: '#c1392b', rating: 5, aum: 21340, ret1: 38.4, ret3: 42.1, ret5: 35.2, exp: 0.62, risk: 'Very High' },
  { id: 'nipi', name: 'Nippon India Large Cap', cat: 'Large Cap', amc: 'Nippon', logo: 'NP', tone: '#0d4a7d', rating: 5, aum: 24180, ret1: 24.1, ret3: 21.4, ret5: 18.2, exp: 0.74, risk: 'Moderate' },
  { id: 'hdmi', name: 'HDFC Mid-Cap Opportunities', cat: 'Mid Cap', amc: 'HDFC', logo: 'HD', tone: '#2952ff', rating: 5, aum: 62210, ret1: 32.8, ret3: 28.1, ret5: 24.6, exp: 0.81, risk: 'High' },
  { id: 'mela', name: 'Motilal Oswal Large & Midcap', cat: 'L&M', amc: 'Motilal', logo: 'MO', tone: '#7a3ec1', rating: 4, aum: 6420, ret1: 34.2, ret3: 25.7, ret5: 21.4, exp: 0.69, risk: 'High' },
  { id: 'kohy', name: 'Kotak Hybrid Equity', cat: 'Hybrid', amc: 'Kotak', logo: 'KO', tone: '#7a3ec1', rating: 4, aum: 5810, ret1: 18.1, ret3: 14.8, ret5: 13.1, exp: 0.51, risk: 'Moderate' },
  { id: 'tata', name: 'Tata Digital India', cat: 'Sectoral', amc: 'Tata', logo: 'TT', tone: '#1f6b50', rating: 5, aum: 11420, ret1: 42.6, ret3: 24.8, ret5: 28.9, exp: 0.32, risk: 'Very High' },
  { id: 'edel', name: 'Edelweiss Greater China Equity', cat: 'Intl', amc: 'Edelweiss', logo: 'ED', tone: '#c89a3a', rating: 3, aum: 1820, ret1: 8.4, ret3: -3.1, ret5: 6.2, exp: 1.42, risk: 'Very High' },
  { id: 'inde', name: 'Bandhan Nifty 50 Index', cat: 'Index', amc: 'Bandhan', logo: 'BN', tone: '#1f8a5b', rating: 4, aum: 1240, ret1: 21.4, ret3: 18.4, ret5: 15.2, exp: 0.10, risk: 'Moderate' },
];

// ── React components (shared) ─────────────────────────────────────────

export function LogoBubble({ logo, tone, size = 36 }: { logo: string; tone: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      background: tone, display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: size * 0.33,
      color: 'white', flexShrink: 0, letterSpacing: '0.01em',
    }}>{logo}</div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{sub}</div>}
    </div>
  );
}

export function PageHeader({
  title, subtitle, kicker, actions,
}: {
  title: React.ReactNode;
  subtitle?: string;
  kicker?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0, maxWidth: 720 }}>
        {kicker && <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{kicker}</div>}
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,5.5vw,80px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
          {title}
        </h1>
        {subtitle && <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55, maxWidth: 600, color: 'var(--ink-2)' }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

export function TabSet({ tabs, value, onChange }: {
  tabs: (string | { value: string; label: string })[];
  value: string;
  onChange: (v: string) => void;
}) {
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
            border: active ? '1px solid var(--border)' : '1px solid transparent',
            boxShadow: active ? 'var(--shadow-sm)' : 'none',
            cursor: 'pointer',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// Sparkline SVG
export function Sparkline({ data, w = 80, h = 28, stroke = 'var(--up)', fill = false }: {
  data: number[]; w?: number; h?: number; stroke?: string; fill?: boolean;
}) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h * 0.85 - h * 0.075}`);
  const d = 'M ' + pts.join(' L ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <path d={`${d} L ${w},${h} L 0,${h} Z`} fill={stroke} opacity="0.12" />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Simple sparkline data generator
export function SPARK(seed = 1, n = 40) {
  const pts: number[] = []; let v = 50; let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    v += (s / 233280 - 0.45) * 6;
    pts.push(v);
  }
  return pts;
}
