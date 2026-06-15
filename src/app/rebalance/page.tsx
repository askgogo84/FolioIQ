'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type DbHolding = {
  scheme_code: string;
  scheme_name: string;
  category: string;
  invested_amount: number;
  current_value: number;
};

type Holding = {
  id: string;
  name: string;
  category: string;
  invested: number;
  current: number;
};

const DEFAULT_TARGET: Record<string, number> = {
  Equity: 60,
  Debt: 20,
  Gold: 10,
  Hybrid: 10,
};

const COLORS: Record<string, string> = {
  Equity: '#1f8a5b',
  Debt: '#2a6fdb',
  Gold: '#c89a3a',
  Hybrid: '#b87a3e',
  Arbitrage: '#2a6fdb',
  Other: '#8b8773',
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function normaliseCategory(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('debt') || c.includes('arbitrage') || c.includes('liquid') || c.includes('duration')) return 'Debt';
  if (c.includes('gold')) return 'Gold';
  if (c.includes('hybrid') || c.includes('balanced')) return 'Hybrid';
  if (c.includes('equity') || c.includes('cap') || c.includes('elss') || c.includes('sector') || c.includes('index')) return 'Equity';
  return cat || 'Other';
}

function buildAllocation(holdings: Holding[]) {
  const total = holdings.reduce((s, h) => s + h.current, 0) || 1;
  const buckets: Record<string, number> = {};

  for (const h of holdings) {
    const cat = normaliseCategory(h.category);
    buckets[cat] = (buckets[cat] || 0) + h.current;
  }

  return Object.entries(buckets)
    .map(([label, value]) => ({ label, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export default function RebalancePage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio/holdings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const rows = (data.holdings || []) as DbHolding[];
        setHoldings(rows.map((r, i) => ({
          id: r.scheme_code || String(i),
          name: r.scheme_name,
          category: r.category || 'Other',
          invested: toNumber(r.invested_amount),
          current: toNumber(r.current_value),
        })));
      })
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  const totalCurrent = holdings.reduce((s, h) => s + h.current, 0);
  const allocation = useMemo(() => buildAllocation(holdings), [holdings]);

  const driftRows = useMemo(() => {
    const labels = Array.from(new Set([...Object.keys(DEFAULT_TARGET), ...allocation.map(a => a.label)]));

    return labels.map(label => {
      const current = allocation.find(a => a.label === label)?.pct || 0;
      const target = DEFAULT_TARGET[label] || 0;
      const drift = current - target;
      return { label, current, target, drift, value: totalCurrent * Math.abs(drift) / 100 };
    }).sort((a, b) => Math.abs(b.drift) - Math.abs(a.drift));
  }, [allocation, totalCurrent]);

  const totalDrift = driftRows.reduce((s, d) => s + Math.abs(d.drift), 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - totalDrift * 1.5)));

  const actionRows = driftRows.filter(d => Math.abs(d.drift) >= 5);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            SMART REBALANCE · LIVE ALLOCATION
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)', maxWidth: 900 }}>
            Review your portfolio <em style={{ color: 'var(--brand-2)', fontStyle: 'italic' }}>drift</em>.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            This page compares your live allocation against a default planning target. It does not execute trades or show invented fund recommendations.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ padding: '5px 12px', borderRadius: 99, background: totalDrift > 20 ? 'var(--down-soft)' : 'var(--brand-soft)', color: totalDrift > 20 ? 'var(--down)' : 'var(--brand)', fontSize: 11.5, fontWeight: 600 }}>
              Drift {loading ? '—' : `${totalDrift.toFixed(1)}pp`}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Default target: Equity 60%, Debt 20%, Gold 10%, Hybrid 10%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 28, alignItems: 'end' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              {loading ? 'Checking allocation.' : actionRows.length ? 'Review suggested allocation shifts.' : 'Your allocation is close to target.'}
            </h2>
            <Metric label="Balance score" value={loading ? '—' : `${score}/100`} />
            <Metric label="Portfolio value" value={loading ? '—' : fmtINR(totalCurrent)} />
          </div>

          <div style={{ marginTop: 16, fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 760, lineHeight: 1.55 }}>
            Use this as a planning view only. Set your own target allocation before making any buy/sell decision.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>CURRENT VS DEFAULT TARGET</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {driftRows.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{d.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: Math.abs(d.drift) >= 5 ? 'var(--down)' : 'var(--ink-2)' }}>
                      {d.current.toFixed(1)}% / {d.target.toFixed(0)}%
                      {Math.abs(d.drift) >= 1 && <span style={{ marginLeft: 6 }}>
                        {d.drift > 0 ? 'above' : 'below'} by {Math.abs(d.drift).toFixed(1)}pp
                      </span>}
                    </span>
                  </div>

                  <div style={{ position: 'relative', height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(d.target, 100)}%`, background: 'var(--border-strong)', opacity: 0.35 }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(d.current, 100)}%`, background: COLORS[d.label] || 'var(--ink-3)', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>REVIEW ITEMS</div>

            {loading && <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading live holdings…</div>}

            {!loading && !holdings.length && (
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>
                No holdings found. <Link href="/upload" style={{ color: 'var(--brand-2)' }}>Upload CAS</Link> to calculate drift.
              </div>
            )}

            {!loading && holdings.length > 0 && actionRows.length === 0 && (
              <div style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
                No category is more than 5 percentage points away from the default target.
              </div>
            )}

            {!loading && actionRows.length > 0 && (
              <div style={{ display: 'grid', gap: 12 }}>
                {actionRows.map((a, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14, background: 'var(--surface-2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                      <div style={{ fontWeight: 600 }}>{a.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', color: a.drift > 0 ? 'var(--down)' : 'var(--brand)' }}>
                        {a.drift > 0 ? 'Reduce' : 'Add'} ~{fmtINR(a.value)}
                      </div>
                    </div>
                    <div style={{ color: 'var(--ink-3)', fontSize: 12.5, lineHeight: 1.5 }}>
                      Current allocation is {a.current.toFixed(1)}% vs default target {a.target.toFixed(0)}%. This is a planning estimate, not an execution instruction.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}