'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtPct = (n: number, d = 2) => (n >= 0 ? '+' : '') + n.toFixed(d) + '%';

const WATCH = [
  { name: 'Quant Small Cap Fund', amc: 'Quant', ret1: 38.4, nav: 282.41, day: 1.8, added: '2 weeks ago', logo: 'QT', tone: '#c1392b' },
  { name: 'Tata Digital India', amc: 'Tata', ret1: 42.6, nav: 48.20, day: 2.3, added: '1 month ago', logo: 'TT', tone: '#1f6b50' },
  { name: 'Motilal Oswal L&M', amc: 'Motilal', ret1: 34.2, nav: 64.18, day: -0.4, added: '3 days ago', logo: 'MO', tone: '#7a3ec1' },
  { name: 'Nippon Large Cap', amc: 'Nippon', ret1: 24.1, nav: 71.83, day: 0.6, added: '1 week ago', logo: 'NP', tone: '#0d4a7d' },
];

function Logo({ logo, tone, size = 36 }: { logo: string; tone: string; size?: number }) {
  return <div style={{ width: size, height: size, borderRadius: size * .3, background: tone, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * .33, color: 'white', flexShrink: 0 }}>{logo}</div>;
}

function Spark({ seed = 1, color = 'var(--up)' }: { seed?: number; color?: string }) {
  const n = 40; const pts: number[] = []; let v = 50; let s = seed;
  for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; v += (s / 233280 - .45) * 6; pts.push(v); }
  const mn = Math.min(...pts), mx = Math.max(...pts), rng = mx - mn || 1;
  const d = 'M ' + pts.map((p, i) => `${(i / (n - 1)) * 120} ${32 - ((p - mn) / rng) * 28 - 2}`).join(' L ');
  return <svg width="120" height="32" viewBox="0 0 120 32" style={{ display: 'block' }}><path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export default function WatchlistPage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>Watchlist</div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,5.5vw,80px)', lineHeight: .98, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Funds you're stalking
            </h1>
            <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 600 }}>
              Track funds you're considering. We'll alert you on NAV moves, manager changes, and rating updates.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink)', cursor: 'pointer' }}>
              🔔 Alerts
            </button>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', background: 'var(--brand)', color: 'var(--bg-deep)', cursor: 'pointer' }}>
              + Add fund
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'On watchlist', value: '4', sub: 'across 4 categories' },
            { label: 'Avg 1Y return', value: '+27.4%', sub: '+11.2% vs Nifty', up: true },
            { label: 'Alerts triggered', value: '3', sub: 'this week' },
            { label: 'In your portfolio', value: '0', sub: 'ready to invest' },
          ].map((s, i) => (
            <div key={i} style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: s.up ? 'var(--up)' : 'var(--ink)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['Fund', 'NAV today', '1Y return', '30d trend', 'Added', 'Alerts', ''].map((h, i) => (
                  <th key={i} style={{ padding: '14px 18px', fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', textAlign: i > 0 ? 'right' : 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WATCH.map((w, i) => (
                <tr key={i} style={{ transition: 'background .12s' }}
                  onMouseEnter={e => Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(td => (td as HTMLElement).style.background = 'var(--surface-2)')}
                  onMouseLeave={e => Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(td => (td as HTMLElement).style.background = '')}>
                  <td style={{ padding: '16px 18px', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Logo logo={w.logo} tone={w.tone} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{w.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{w.amc}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                    <div style={{ fontWeight: 500 }}>₹{w.nav.toFixed(2)}</div>
                    <div style={{ color: w.day >= 0 ? 'var(--up)' : 'var(--down)', fontSize: 11 }}>{fmtPct(w.day)}</div>
                  </td>
                  <td style={{ padding: '16px 18px', textAlign: 'right', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--up)', fontWeight: 500 }}>
                    {fmtPct(w.ret1, 1)}
                  </td>
                  <td style={{ padding: '16px 18px', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <Spark seed={i + 9} color={w.day >= 0 ? 'var(--up)' : 'var(--down)'} />
                  </td>
                  <td style={{ padding: '16px 18px', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none', color: 'var(--ink-3)', fontSize: 12 }}>{w.added}</td>
                  <td style={{ padding: '16px 18px', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: 'color-mix(in oklab,var(--gold) 14%,var(--surface))', color: 'var(--gold)', fontSize: 10, fontWeight: 500 }}>
                      🔔 NAV &gt; 1%
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px', borderBottom: i < WATCH.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-2)', cursor: 'pointer' }}>Compare</button>
                      <button style={{ padding: '5px 10px', borderRadius: 8, fontSize: 11, border: 'none', background: 'var(--brand)', color: 'var(--bg-deep)', fontWeight: 600, cursor: 'pointer' }}>Invest</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compare card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>Side-by-side</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.02em', fontWeight: 400, margin: '0 0 18px', color: 'var(--ink)' }}>Compare watchlist funds</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 680 }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 18px', fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>Metric</th>
                  {WATCH.map((w, i) => (
                    <th key={i} style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', textAlign: 'right', minWidth: 140 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <Logo logo={w.logo} tone={w.tone} size={26} />
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)' }}>{w.name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: '1Y return', vals: WATCH.map(w => fmtPct(w.ret1, 1)), up: true },
                  { label: 'Current NAV', vals: WATCH.map(w => `₹${w.nav.toFixed(2)}`), up: false },
                  { label: 'Today', vals: WATCH.map(w => fmtPct(w.day)), auto: true, raw: WATCH.map(w => w.day) },
                ].map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '14px 18px', fontSize: 12, color: 'var(--ink-3)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} style={{ padding: '14px 18px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, borderBottom: '1px solid var(--border)', color: row.up ? 'var(--up)' : row.auto ? ((row.raw![j] >= 0) ? 'var(--up)' : 'var(--down)') : 'var(--ink)' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
