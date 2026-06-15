'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type DbHolding = {
  scheme_code: string | null;
  scheme_name: string | null;
  category: string | null;
  invested_amount: number | string | null;
  current_value: number | string | null;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export default function ComparePage() {
  const [holdings, setHoldings] = useState<DbHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio/holdings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setHoldings((data.holdings || []) as DbHolding[]))
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  const topHoldings = useMemo(() => {
    return [...holdings]
      .map(h => ({
        name: h.scheme_name || 'Unnamed fund',
        category: h.category || 'Other',
        invested: toNumber(h.invested_amount),
        current: toNumber(h.current_value),
      }))
      .sort((a, b) => b.current - a.current)
      .slice(0, 2);
  }, [holdings]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            COMPARE
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Compare your own holdings.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            This page uses only your current holdings. External fund comparison metrics are not connected yet.
          </div>
        </div>

        {loading && <StateCard title="Loading holdings…" body="Checking your portfolio records." />}

        {!loading && topHoldings.length < 2 && (
          <StateCard title="Need at least two holdings." body="Upload or connect your portfolio to compare fund values." />
        )}

        {!loading && topHoldings.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {topHoldings.map((h, i) => {
              const gain = h.current - h.invested;
              const gainPct = h.invested > 0 ? (gain / h.invested) * 100 : 0;

              return (
                <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 28 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
                    Holding {i + 1}
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
                    {h.name}
                  </h2>

                  <div style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: 13 }}>{h.category}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 24 }}>
                    <Metric label="Invested" value={fmtINR(h.invested)} />
                    <Metric label="Current" value={fmtINR(h.current)} />
                    <Metric label="Gain" value={fmtINR(gain)} tone={gain >= 0 ? 'up' : 'down'} />
                    <Metric label="Return" value={`${gainPct.toFixed(2)}%`} tone={gain >= 0 ? 'up' : 'down'} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <Link href="/portfolio" style={btnPrimary}>View all holdings →</Link>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)', marginTop: 8 }}>{value}</div>
    </div>
  );
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>{title}</h2>
      <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 720 }}>{body}</p>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  padding: '11px 18px',
  borderRadius: 999,
  background: 'var(--ink)',
  color: 'var(--bg)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};