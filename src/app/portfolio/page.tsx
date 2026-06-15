'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

// ── AMC colour palette ─────────────────────────────────────────────────
const AMC_TONES: Record<string, string> = {
  'PPFAS': '#0f3d2e', 'Mirae Asset': '#c89a3a', 'Axis': '#c1392b',
  'ICICI Prudential': '#1f6b50', 'HDFC': '#2952ff', 'SBI': '#0d4a7d',
  'Nippon India': '#e63946', 'Kotak': '#2b6cb0', 'Invesco': '#6b46c1',
  'Canara Robeco': '#d97706', 'PGIM India': '#0891b2',
};
function amcTone(amc: string, name: string): string {
  for (const [k, v] of Object.entries(AMC_TONES)) {
    if ((amc || '').includes(k) || k.includes(amc || '') || name.toLowerCase().includes(k.toLowerCase())) return v;
  }
  const h = [...(amc || name)].reduce((a, c) => a + c.charCodeAt(0), 0);
  return ['#1f6b50','#c1392b','#2952ff','#c89a3a','#0d4a7d','#6b46c1','#0891b2'][h % 7];
}
function logoOf(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ── Types ─────────────────────────────────────────────────────────────
type Holding = {
  id: string; name: string; cat: string; amc: string;
  logo: string; tone: string;
  invested: number; current: number; units: number; nav: number;
  gain: number; gainPct: number; alloc: number;
};

// ── Helpers ────────────────────────────────────────────────────────────
const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtL   = (n: number) => '₹' + (n / 100000).toFixed(2) + ' L';

// ── Allocation from holdings ───────────────────────────────────────────
const CAT_PALETTE: Record<string, string> = {
  'Equity': '#1f8a5b', 'ELSS': '#1f8a5b', 'Small Cap': '#38b285',
  'Large Cap': '#0f3d2e', 'Mid Cap': '#1f6b50', 'Flexi Cap': '#c89a3a',
  'Multi Cap': '#c89a3a', 'Gold': '#b87a3e', 'Debt': '#2a6fdb',
  'Arbitrage': '#2a6fdb', 'Hybrid': '#6b46c1', 'Thematic': '#c1392b',
  'Sectoral': '#c1392b', 'Other': '#8b8773',
};
function buildAlloc(holdings: Holding[]) {
  const total = holdings.reduce((s, h) => s + h.current, 0) || 1;
  const bkts: Record<string, number> = {};
  for (const h of holdings) { const c = h.cat || 'Other'; bkts[c] = (bkts[c] || 0) + h.current; }
  return Object.entries(bkts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, val]) => ({ label, pct: (val / total) * 100, color: CAT_PALETTE[label] || '#8b8773' }));
}

export default function PortfolioPage() {
  const [holdings,  setHoldings]  = useState<Holding[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [sortBy,    setSortBy]    = useState<'alloc' | 'gain' | 'invested'>('alloc');
  const [filter,    setFilter]    = useState<string>('All');

  useEffect(() => {
    fetch('/api/portfolio/holdings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const rows = (data.holdings || []) as Array<{
          scheme_code: string; scheme_name: string; category: string; amc: string;
          units: number; avg_nav: number; current_nav: number;
          invested_amount: number; current_value: number;
        }>;
        const totalCurrent = rows.reduce((s, r) => s + r.current_value, 0) || 1;
        const mapped: Holding[] = rows.map((r, i) => ({
          id: r.scheme_code || String(i),
          name: r.scheme_name,
          cat: r.category || 'Equity',
          amc: r.amc || '',
          logo: logoOf(r.scheme_name),
          tone: amcTone(r.amc || '', r.scheme_name),
          invested: r.invested_amount,
          current: r.current_value,
          units: r.units,
          nav: r.current_nav,
          gain: r.current_value - r.invested_amount,
          gainPct: r.invested_amount > 0 ? ((r.current_value - r.invested_amount) / r.invested_amount) * 100 : 0,
          alloc: (r.current_value / totalCurrent) * 100,
        }));
        setHoldings(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totals = holdings.reduce(
    (a, h) => ({ invested: a.invested + h.invested, current: a.current + h.current }),
    { invested: 0, current: 0 }
  );
  const gain    = totals.current - totals.invested;
  const gainPct = totals.invested > 0 ? (gain / totals.invested) * 100 : 0;
  const alloc   = buildAlloc(holdings);

  const cats = ['All', ...Array.from(new Set(holdings.map(h => h.cat)))];
  const filtered = holdings
    .filter(h => filter === 'All' || h.cat === filter)
    .sort((a, b) => {
      if (sortBy === 'alloc') return b.alloc - a.alloc;
      if (sortBy === 'gain') return b.gainPct - a.gainPct;
      return b.invested - a.invested;
    });

  const amcCount = new Set(holdings.map(h => h.amc || 'Other')).size;

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>PORTFOLIO</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Holdings
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/upload" style={btnGhost}>↑ Update data</Link>
              <Link href="/explore" style={btnPrimary}>+ Invest more</Link>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Every position across all your funds, broken down by category, allocation, and contribution to returns.
          </div>
        </div>

        {/* Stat row */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '24px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24,
        }}>
          <Stat label="FUNDS" big={loading ? '—' : holdings.length.toString()} sub={`across ${amcCount} AMCs`} />
          <Stat label="INVESTED" big={loading ? '—' : fmtL(totals.invested)} />
          <Stat label="CURRENT" big={loading ? '—' : fmtL(totals.current)} />
          <Stat label="UNREALISED GAIN" big={loading ? '—' : fmtL(gain)} sub={gain >= 0 ? `+${gainPct.toFixed(2)}%` : `${gainPct.toFixed(2)}%`} tone={gain >= 0 ? 'up' : 'down'} />
          <Stat label="XIRR" big="—" sub="needs 90+ days" />
        </div>

        {/* Asset allocation treemap */}
        {!loading && alloc.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>ASSET MIX · By category</div>
            <div style={{ display: 'flex', height: 64, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 14 }}>
              {alloc.map((a, i) => (
                <div key={i} title={`${a.label}: ${a.pct.toFixed(1)}%`} style={{
                  flexBasis: `${a.pct}%`, background: a.color, minWidth: a.pct > 5 ? 'auto' : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 600, overflow: 'hidden',
                }}>
                  {a.pct > 6 ? `${a.pct.toFixed(0)}%` : ''}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {alloc.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ color: 'var(--ink-2)' }}>{a.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 600 }}>{a.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + sort */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
            {(['alloc', 'gain', 'invested'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{
                padding: '6px 11px', borderRadius: 8, fontSize: 11.5,
                background: sortBy === s ? 'var(--surface-2)' : 'transparent',
                color: sortBy === s ? 'var(--ink)' : 'var(--ink-3)',
                border: '1px solid ' + (sortBy === s ? 'var(--border-strong)' : 'var(--border)'),
                cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize',
              }}>{s === 'invested' ? 'Invested' : s === 'gain' ? 'Gain %' : 'Alloc'}</button>
            ))}
          </div>
        </div>

        {/* Holdings table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.9fr', padding: '14px 24px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div>Fund</div>
            <div style={{ textAlign: 'right' }}>Invested</div>
            <div style={{ textAlign: 'right' }}>Current</div>
            <div style={{ textAlign: 'right' }}>Gain</div>
            <div style={{ textAlign: 'right' }}>Alloc</div>
          </div>

          {loading && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              Loading your portfolio…
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
              No holdings yet.{' '}
              <Link href="/upload" style={{ color: 'var(--brand-2)', textDecoration: 'none' }}>Upload your CAS or NJ Wealth report →</Link>
            </div>
          )}

          {filtered.map((h, i) => (
            <div key={h.id} style={{
              display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.9fr',
              padding: '16px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background .1s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            >
              {/* Fund name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: h.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0,
                }}>{h.logo}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
                    {h.cat}{h.amc ? ` · ${h.amc}` : ''} · {h.alloc.toFixed(1)}% alloc
                  </div>
                </div>
              </div>

              {/* Invested */}
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>
                {fmtINR(h.invested)}
              </div>

              {/* Current */}
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
                {fmtINR(h.current)}
              </div>

              {/* Gain */}
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: h.gainPct >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
                {h.gainPct >= 0 ? '+' : ''}{h.gainPct.toFixed(2)}%
                <div style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--ink-3)' }}>
                  {h.gain >= 0 ? '+' : '−'}₹{Math.abs(Math.round(h.gain)).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Allocation bar */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                  {h.alloc.toFixed(1)}%
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(h.alloc * 3.3, 100)}%`, background: h.tone, borderRadius: 99 }} />
                </div>
              </div>
            </div>
          ))}

          {/* Total row */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '2.4fr 1fr 1fr 1fr 0.9fr',
              padding: '16px 24px', borderTop: '2px solid var(--border)',
              background: 'var(--surface-2)',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>
                Total · {filtered.length} fund{filtered.length !== 1 ? 's' : ''}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                {fmtINR(filtered.reduce((s, h) => s + h.invested, 0))}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {fmtINR(filtered.reduce((s, h) => s + h.current, 0))}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: gain >= 0 ? 'var(--up)' : 'var(--down)' }}>
                {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
              </div>
              <div />
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}

function Stat({ label, big, sub, tone }: { label: string; big: string; sub?: string; tone?: 'up' | 'down' }) {
  const color = tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)';
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em', color }}>{big}</div>
      {sub && <div style={{ fontSize: 11, color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink-3)', marginTop: 5 }}>{sub}</div>}
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
