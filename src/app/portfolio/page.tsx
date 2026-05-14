'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

// ── data ──────────────────────────────────────────────────────────────
const HOLDINGS = [
  { id: 'ppfc', name: 'Parag Parikh Flexi Cap', cat: 'Flexi Cap',  amc: 'PPFAS', logo: 'PP', tone: '#0f3d2e', invested: 1280000, current: 1444300, pct: 12.83, xirr: 21.4, day: 0.42,  alloc: 29.8, units: 3599.1, nav: 401.61 },
  { id: 'mira', name: 'Mirae Asset Large Cap',   cat: 'Large Cap', amc: 'Mirae', logo: 'MA', tone: '#c89a3a', invested: 280000,  current: 324790,  pct: 16.00, xirr: 14.2, day: 0.18,  alloc: 26.7, units: 2706.5, nav: 120.00 },
  { id: 'axsm', name: 'Axis Small Cap',          cat: 'Small Cap', amc: 'Axis',  logo: 'AX', tone: '#c1392b', invested: 320000,  current: 435800,  pct: 36.19, xirr: 28.7, day: -1.22, alloc: 24.1, units: 4358.0, nav: 100.00 },
  { id: 'icic', name: 'ICICI Pru Nifty 50 Index',cat: 'Index',     amc: 'ICICI', logo: 'IC', tone: '#1f6b50', invested: 300000,  current: 324900,  pct: 8.30,  xirr: 11.1, day: 0.25,  alloc: 13.9, units: 1547.1, nav: 210.00 },
  { id: 'hdfc', name: 'HDFC Mid-Cap Opportunities', cat: 'Mid Cap',amc: 'HDFC',  logo: 'HD', tone: '#2952ff', invested: 240000,  current: 342840,  pct: 42.85, xirr: 24.8, day: 0.91,  alloc: 5.5,  units: 2856.6, nav: 120.00 },
  { id: 'sbib', name: 'SBI Bluechip',            cat: 'Large Cap', amc: 'SBI',   logo: 'SB', tone: '#0d4a7d', invested: 120000,  current: 160770,  pct: 33.97, xirr: 16.4, day: 0.07,  alloc: 4.0,  units: 4022.3, nav: 39.97 },
];

const ASSET_MIX = [
  { label: 'Equity',  pct: 84.5, color: '#1f8a5b' },
  { label: 'Debt',    pct: 9.2,  color: '#c89a3a' },
  { label: 'Gold',    pct: 3.4,  color: '#b87a3e' },
  { label: 'Intl',    pct: 1.9,  color: '#2a6fdb' },
  { label: 'Cash',    pct: 1.0,  color: '#8b8773' },
];

const SECTORS = [
  { label: 'Financials', pct: 28.4, color: '#1f8a5b' },
  { label: 'IT',         pct: 18.1, color: '#0891b2' },
  { label: 'Consumer',   pct: 14.2, color: '#c89a3a' },
  { label: 'Energy',     pct: 11.8, color: '#b87a3e' },
  { label: 'Auto',       pct: 7.8,  color: '#6b3fd4' },
  { label: 'Pharma',     pct: 6.4,  color: '#c91a5e' },
  { label: 'Other',      pct: 13.3, color: '#8b8773' },
];

const fmtINR = (n: number) => '₹' + n.toLocaleString('en-IN');
const fmtL = (n: number) => '₹' + (n / 100000).toFixed(2) + ' L';
const fmtK = (n: number) => '₹' + (n / 1000).toFixed(1) + 'K';

export default function PortfolioPage() {
  const [sortBy, setSortBy] = useState<'alloc' | 'gain' | 'xirr'>('alloc');
  const [filter, setFilter] = useState<string>('All');

  const totals = HOLDINGS.reduce(
    (acc, h) => ({ invested: acc.invested + h.invested, current: acc.current + h.current }),
    { invested: 0, current: 0 }
  );
  const gain = totals.current - totals.invested;
  const gainPct = (gain / totals.invested) * 100;
  const dividend = 3600;
  const xirr = 18.4;

  const cats = ['All', ...Array.from(new Set(HOLDINGS.map(h => h.cat)))];
  const filtered = HOLDINGS
    .filter(h => filter === 'All' || h.cat === filter)
    .sort((a, b) => {
      if (sortBy === 'alloc') return b.alloc - a.alloc;
      if (sortBy === 'gain') return b.pct - a.pct;
      return b.xirr - a.xirr;
    });

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* ── Headline ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PORTFOLIO
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Holdings
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnGhost}>⛁ Filter</button>
              <button style={btnGhost}>↓ Export CSV</button>
              <Link href="/explore" style={btnPrimary}>+ Buy more</Link>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Every position across funds, broken down by category, cap, and contribution to returns.
          </div>
        </div>

        {/* ── Stat row ──────────────────────────────────────────── */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '24px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24,
        }}>
          <Stat label="FUNDS" big={HOLDINGS.length.toString()} sub="across 4 AMCs" />
          <Stat label="INVESTED" big={fmtL(totals.invested)} unit="L" />
          <Stat label="CURRENT" big={fmtL(totals.current)} unit="L" />
          <Stat label="UNREALISED GAIN" big={fmtL(gain)} unit="L" sub={`+${gainPct.toFixed(2)}%`} tone="up" />
          <Stat label="DIVIDEND YTD" big={fmtK(dividend)} />
          <Stat label="XIRR" big={xirr.toFixed(1) + '%'} sub="vs Nifty 11.4%" tone="up" />
        </div>

        {/* ── Asset Mix + Sector Exposure ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>

          {/* Asset Mix treemap */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>ASSET MIX</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 0.98, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)', marginBottom: 18 }}>
              By asset class
            </h2>
            <div style={{ display: 'flex', height: 200, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
              {ASSET_MIX.map((a, i) => (
                <div key={i} style={{
                  flexBasis: `${a.pct}%`, background: a.color,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: '14px 16px', color: '#fff', minWidth: 0,
                }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, opacity: 0.92 }}>
                    {a.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {a.pct}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector exposure bars */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>SECTOR EXPOSURE</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 4vw, 52px)', lineHeight: 0.98, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)', marginBottom: 18 }}>
              Where your equity sits
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {SECTORS.map((s, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 60px', alignItems: 'center', gap: 14 }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.pct / 30) * 100}%`, background: s.color, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', textAlign: 'right', fontWeight: 500 }}>
                    {s.pct.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter + sort row ─────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{
                padding: '7px 14px', borderRadius: 99, fontSize: 12,
                background: filter === c ? 'var(--ink)' : 'transparent',
                color: filter === c ? 'var(--bg)' : 'var(--ink-2)',
                border: '1px solid ' + (filter === c ? 'var(--ink)' : 'var(--border)'),
                cursor: 'pointer', fontWeight: 500,
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort by</span>
            {(['alloc', 'gain', 'xirr'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: '6px 11px', borderRadius: 8, fontSize: 11.5,
                background: sortBy === s ? 'var(--surface-2)' : 'transparent',
                color: sortBy === s ? 'var(--ink)' : 'var(--ink-3)',
                border: '1px solid ' + (sortBy === s ? 'var(--border-strong)' : 'var(--border)'),
                cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* ── Holdings table ────────────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.9fr 1fr', padding: '14px 24px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>
            <div>Fund</div>
            <div style={{ textAlign: 'right' }}>Invested</div>
            <div style={{ textAlign: 'right' }}>Current</div>
            <div style={{ textAlign: 'right' }}>Gain</div>
            <div style={{ textAlign: 'right' }}>XIRR</div>
            <div style={{ textAlign: 'right' }}>Today</div>
          </div>
          {filtered.map((h, i) => (
            <div key={h.id} style={{
              display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.9fr 1fr',
              padding: '16px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: h.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0,
                }}>{h.logo}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{h.cat} · {h.amc} · {h.alloc}% alloc</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>{fmtINR(h.invested)}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{fmtINR(h.current)}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: h.pct >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
                {h.pct >= 0 ? '+' : ''}{h.pct.toFixed(2)}%
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>{h.xirr.toFixed(1)}%</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: h.day >= 0 ? 'var(--up)' : 'var(--down)' }}>
                {h.day >= 0 ? '▲' : '▼'} {Math.abs(h.day).toFixed(2)}%
              </div>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────
function Stat({ label, big, unit, sub, tone }: { label: string; big: string; unit?: string; sub?: string; tone?: 'up' | 'down' }) {
  const color = tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)';
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color }}>{big}</span>
        {unit && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: tone === 'up' ? 'var(--up)' : 'var(--ink-3)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

const btnGhost: React.CSSProperties = {
  padding: '9px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
  background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};

const btnPrimary: React.CSSProperties = {
  padding: '9px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
  background: 'var(--brand)', color: 'var(--bg-deep)', border: 'none',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};
