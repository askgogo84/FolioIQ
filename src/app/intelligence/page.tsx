'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type DbHolding = {
  scheme_code: string;
  scheme_name: string;
  category: string;
  amc: string;
  invested_amount: number;
  current_value: number;
};

type Holding = {
  id: string;
  name: string;
  category: string;
  amc: string;
  invested: number;
  current: number;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function fmtL(n: number): string {
  return '₹' + (n / 100000).toFixed(2) + 'L';
}

function buildAllocation(holdings: Holding[]) {
  const total = holdings.reduce((s, h) => s + h.current, 0) || 1;
  const buckets: Record<string, number> = {};

  for (const h of holdings) {
    const cat = h.category || 'Other';
    buckets[cat] = (buckets[cat] || 0) + h.current;
  }

  return Object.entries(buckets)
    .map(([label, value]) => ({ label, value, pct: (value / total) * 100 }))
    .sort((a, b) => b.value - a.value);
}

export default function IntelligencePage() {
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
          amc: r.amc || '',
          invested: toNumber(r.invested_amount),
          current: toNumber(r.current_value),
        })));
      })
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const invested = holdings.reduce((s, h) => s + h.invested, 0);
    const current = holdings.reduce((s, h) => s + h.current, 0);
    const gain = current - invested;
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
    return { invested, current, gain, gainPct, count: holdings.length };
  }, [holdings]);

  const allocation = useMemo(() => buildAllocation(holdings), [holdings]);
  const top = allocation[0];
  const second = allocation[1];

  const insights = useMemo(() => {
    if (!holdings.length) {
      return [{
        label: 'CONNECT PORTFOLIO',
        title: 'Upload CAS to unlock real insights.',
        body: 'No live holdings were found. Upload your CAS or connect your portfolio to generate allocation, concentration, and risk insights.',
        href: '/upload',
        cta: 'Upload CAS',
        tone: 'var(--brand)',
      }];
    }

    const list = [];

    if (top) {
      list.push({
        label: 'ALLOCATION CHECK',
        title: top.pct >= 65 ? `Portfolio concentrated in ${top.label}.` : `${top.label} is your largest allocation.`,
        body: second
          ? `${top.label} is ${top.pct.toFixed(1)}% of your portfolio, followed by ${second.label} at ${second.pct.toFixed(1)}%. Review whether this matches your intended risk profile.`
          : `${top.label} is ${top.pct.toFixed(1)}% of your portfolio. Review whether this matches your intended risk profile.`,
        href: '/rebalance',
        cta: 'Review allocation',
        tone: top.pct >= 65 ? 'var(--down)' : 'var(--brand)',
      });
    }

    const debt = allocation.find(a => a.label.toLowerCase().includes('debt') || a.label.toLowerCase().includes('arbitrage'));
    if (!debt || debt.pct < 15) {
      list.push({
        label: 'RISK BALANCE',
        title: 'Debt allocation looks low.',
        body: `Debt and arbitrage exposure appears to be ${debt ? debt.pct.toFixed(1) : '0.0'}%. This is not a recommendation, but it is worth reviewing if your goal requires lower volatility.`,
        href: '/rebalance',
        cta: 'Check balance',
        tone: 'var(--gold)',
      });
    }

    const topFund = [...holdings].sort((a, b) => b.current - a.current)[0];
    const total = totals.current || 1;
    const topFundPct = topFund ? (topFund.current / total) * 100 : 0;

    if (topFund && topFundPct >= 15) {
      list.push({
        label: 'CONCENTRATION',
        title: `${topFund.name} is your largest fund.`,
        body: `${topFund.name} is ${topFundPct.toFixed(1)}% of your portfolio. Large single-fund concentration can be fine, but should be intentional.`,
        href: '/portfolio',
        cta: 'View holdings',
        tone: 'var(--violet)',
      });
    }

    list.push({
      label: 'PORTFOLIO VALUE',
      title: `Current value is ${fmtINR(totals.current)}.`,
      body: `Invested amount is ${fmtINR(totals.invested)} and unrealised gain is ${fmtINR(totals.gain)} (${totals.gainPct.toFixed(2)}%). Values are based on your live holdings table.`,
      href: '/dashboard',
      cta: 'Open dashboard',
      tone: totals.gain >= 0 ? 'var(--up)' : 'var(--down)',
    });

    return list;
  }, [allocation, holdings, second, top, totals]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ✦ FOLIO AI · LIVE INSIGHTS
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Insights from <em style={{ color: 'var(--brand-2)', fontStyle: 'italic' }}>{loading ? 'your portfolio' : `${totals.count} funds`}</em>.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            These insights are generated from your current holdings and allocation. No model portfolio, invented alpha, or hardcoded recommendations are shown.
          </div>
        </div>

        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '20px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          <Signal label="Current value" value={loading ? '—' : fmtL(totals.current)} />
          <Signal label="Invested" value={loading ? '—' : fmtL(totals.invested)} />
          <Signal label="Unrealised gain" value={loading ? '—' : fmtL(totals.gain)} tone={totals.gain >= 0 ? 'up' : 'down'} />
          <Signal label="Top category" value={loading || !top ? '—' : `${top.pct.toFixed(1)}%`} sub={top?.label || ''} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 18 }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ins.tone }} />
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>{ins.label}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>{ins.title}</h3>
              <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{ins.body}</div>
              <Link href={ins.href} style={{ display: 'inline-flex', marginTop: 18, alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 99, background: 'var(--ink)', color: 'var(--bg)', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
                {ins.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function Signal({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 34, lineHeight: 1, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}