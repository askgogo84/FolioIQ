'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type Insight = {
  kind: string;
  label: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  tone: string;
  alternatives?: { name: string; amc: string; why: string }[];
};

const INSIGHTS: Insight[] = [
  {
    kind: 'urgent',
    label: 'TAX HARVEST · 320 DAYS LEFT',
    title: 'Pocket ₹15,655 in LTCG savings',
    body: 'Your LTCG is at ₹1.04 L — 83% of the ₹1.25 L exemption. Sell-and-rebuy your eligible Mirae and PPFC lots before March 31 to reset cost basis tax-free.',
    cta: 'Execute harvest',
    href: '/capital-gains',
    tone: '#1f6b50',
  },
  {
    kind: 'rebalance',
    label: 'REBALANCE · DRIFT +4.1pp',
    title: 'You\'re over-weight small caps',
    body: 'Small caps rallied 38% this year and now sit 24.1% of book vs your 18% target. Trimming back locks in gains and reduces drawdown risk.',
    cta: 'Review rebalance',
    href: '/rebalance',
    tone: 'var(--violet)',
  },
  {
    kind: 'underperform',
    label: 'EXIT CANDIDATE · NEGATIVE ALPHA',
    title: 'ICICI Pru Technology is dragging',
    body: 'Down −16% over 14 months while the sectoral index is flat. Sectoral bets aren\'t paying — redeploy to broader mandates.',
    cta: 'See switch plan',
    href: '/rebalance',
    tone: 'var(--down)',
    alternatives: [
      { name: 'Axis Multicap Fund',     amc: 'Axis',  why: '+6.8% alpha, 0.6% lower TER, broader sector base. Captures tech upside without single-sector concentration.' },
      { name: 'Parag Parikh Flexi Cap', amc: 'PPFAS', why: '21.4% XIRR vs your current 14.2%, lower beta (0.85). International tech exposure built-in via Google, Meta, Amazon.' },
    ],
  },
  {
    kind: 'opportunity',
    label: 'OPPORTUNITY · DEBT UNDERWEIGHT',
    title: 'Debt is 6pp under target',
    body: 'With rate cuts likely this cycle, adding ₹3.3 L to a low duration fund cushions equity drawdowns and locks higher yields before the cut.',
    cta: 'See debt picks',
    href: '/explore',
    tone: 'var(--gold)',
    alternatives: [
      { name: 'SBI Low Duration Fund',  amc: 'SBI',   why: '7.4% YTM, AAA-skewed portfolio, 0.45% TER. Best risk-adjusted return in category over 3 yrs.' },
      { name: 'HDFC Low Duration Fund', amc: 'HDFC',  why: '7.2% YTM, consistent top-quartile performer. Slightly higher TER but tighter duration discipline.' },
    ],
  },
];

const SIGNALS = [
  { label: 'Portfolio Beta',  value: '0.96', sub: '−0.04 vs Nifty', tone: 'up' },
  { label: 'Sharpe Ratio',    value: '1.42', sub: '3-yr', tone: 'up' },
  { label: 'Max Drawdown',    value: '−18.2%', sub: '2024 correction', tone: 'down' },
  { label: 'Alpha vs Nifty',  value: '+7.0%', sub: 'XIRR delta', tone: 'up' },
];

export default function IntelligencePage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ✦ FOLIO AI · INSIGHTS
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Four moves <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>worth ₹2.1 L</em> this quarter.
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Personalised analysis of your 8 funds — tax angles, drift, alpha leaks, and where to add. Every sell or switch comes with 2 named alternatives.
          </div>
        </div>

        {/* Signals row */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '20px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          {SIGNALS.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: s.tone === 'up' ? 'var(--up)' : s.tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Insight cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 28 }}>
          {INSIGHTS.map((ins, i) => {
            const isExpanded = expanded === i;
            const hasAlt = !!ins.alternatives && ins.alternatives.length > 0;
            return (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26,
                position: 'relative', overflow: 'hidden',
                gridColumn: isExpanded ? 'span 2' : 'span 1',
                transition: 'grid-column 0.2s',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ins.tone }} />
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
                  {ins.label}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
                  {ins.title}
                </h3>
                <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{ins.body}</div>

                <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                  <Link href={ins.href} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 16px', borderRadius: 99,
                    background: 'var(--ink)', color: 'var(--bg)',
                    fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
                  }}>{ins.cta} →</Link>
                  {hasAlt && (
                    <button onClick={() => setExpanded(isExpanded ? null : i)} style={{
                      padding: '9px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                      background: isExpanded ? 'var(--brand-soft)' : 'transparent',
                      color: 'var(--brand-2)',
                      border: '1px solid var(--brand-2)',
                      cursor: 'pointer',
                    }}>
                      {isExpanded ? '× Hide alternatives' : '⇄ See 2 alternatives'}
                    </button>
                  )}
                </div>

                {/* Expanded alternatives */}
                {isExpanded && hasAlt && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'grid', gap: 10 }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>
                      RECOMMENDED ALTERNATIVES
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {ins.alternatives!.map((alt, j) => (
                        <div key={j} style={{
                          background: 'var(--brand-soft)', borderRadius: 14, padding: 16,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 8,
                              background: 'var(--brand-2)', color: 'var(--bg)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-serif)', fontSize: 14, flexShrink: 0,
                            }}>{j + 1}</div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{alt.name}</div>
                              <div style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{alt.amc}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>{alt.why}</div>
                          <button style={{
                            marginTop: 12, width: '100%', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                            background: 'var(--ink)', color: 'var(--bg)',
                            border: 'none', cursor: 'pointer',
                          }}>Add to portfolio →</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ask Folio CTA */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
          border: '1px solid var(--border)', borderRadius: 24, padding: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>NEED A SPECIFIC ANSWER?</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 4vw, 48px)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>
              Ask Folio AI anything.
            </h3>
            <div style={{ marginTop: 10, fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 560 }}>
              &quot;Should I switch to PPFC direct?&quot; · &quot;Stress test my portfolio against 2008&quot; · &quot;Plan retirement at 55&quot;
            </div>
          </div>
          <Link href="/chat" style={{
            padding: '14px 26px', borderRadius: 99, background: 'var(--ink)', color: 'var(--bg)',
            fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            ✦ Start chat
          </Link>
        </div>

      </div>
    </AppLayout>
  );
}
