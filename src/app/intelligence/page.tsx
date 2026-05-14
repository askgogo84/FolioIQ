'use client';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

const INSIGHTS = [
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
    body: 'Down −16% over 14 months while the sectoral index is flat. Switch to Axis Multicap (+6.8% alpha) and recover roughly ₹50K over 3 years on the same capital.',
    cta: 'See switch plan',
    href: '/intelligence',
    tone: 'var(--down)',
  },
  {
    kind: 'opportunity',
    label: 'OPPORTUNITY · DEBT UNDERWEIGHT',
    title: 'Debt is 6pp under target',
    body: 'With rate cuts likely this cycle, adding ₹3.3 L to SBI Low Duration cushions equity drawdowns and locks higher yields before the cut.',
    cta: 'Add to debt',
    href: '/explore',
    tone: 'var(--gold)',
  },
];

const SIGNALS = [
  { label: 'Portfolio Beta',  value: '0.96', sub: '−0.04 vs Nifty', tone: 'up' },
  { label: 'Sharpe Ratio',    value: '1.42', sub: '3-yr', tone: 'up' },
  { label: 'Max Drawdown',    value: '−18.2%', sub: '2024 correction', tone: 'down' },
  { label: 'Alpha vs Nifty',  value: '+7.0%', sub: 'XIRR delta', tone: 'up' },
];

export default function IntelligencePage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* ── Headline ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ✦ FOLIO AI · INSIGHTS
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Four moves <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>worth ₹2.1 L</em> this quarter.
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Personalised analysis of your 8 funds — tax angles, drift, alpha leaks, and where to add. Updated continuously from your CAS, NAVs, and the broader Indian fund universe.
          </div>
        </div>

        {/* ── Signals row ───────────────────────────────────────── */}
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

        {/* ── Insight cards ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 28 }}>
          {INSIGHTS.map((ins, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: ins.tone }} />
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
                {ins.label}
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
                {ins.title}
              </h3>
              <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{ins.body}</div>
              <Link href={ins.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                marginTop: 18, padding: '9px 16px', borderRadius: 99,
                background: 'var(--ink)', color: 'var(--bg)',
                fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
              }}>
                {ins.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* ── Ask Folio CTA ─────────────────────────────────────── */}
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
