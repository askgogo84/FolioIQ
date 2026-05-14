'use client';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    desc: 'Get started with portfolio tracking.',
    features: [
      'Upload CAS or NJ Wealth report',
      'Dashboard with holdings overview',
      'Basic XIRR calculation',
      '3 Folio AI queries / month',
      'Goal planner (2 goals)',
    ],
    cta: 'Current plan',
    active: true,
    tone: 'var(--surface)',
  },
  {
    name: 'Plus',
    price: '₹199',
    period: '/month',
    desc: 'Full portfolio intelligence.',
    features: [
      'Everything in Free',
      'Unlimited Folio AI queries',
      'Auto-Connect (CDSL/NSDL sync)',
      'Smart Rebalance with alternatives',
      'Tax Harvest planner (LTCG + STCL)',
      'Unlimited goals',
      'Backtest + SIP calculator',
      'Priority support',
    ],
    cta: 'Try 30 days free →',
    active: false,
    highlight: true,
    tone: 'var(--brand)',
  },
  {
    name: 'Plus Annual',
    price: '₹1,499',
    period: '/year',
    desc: 'Best value — save ₹889.',
    badge: 'Save 37%',
    features: [
      'Everything in Plus',
      '2 months free vs monthly',
      'Early access to new features',
    ],
    cta: 'Get annual →',
    active: false,
    tone: 'var(--violet)',
  },
];

export default function PricingPage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 40, maxWidth: 680 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>PRICING</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 90px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Simple pricing.<br /><em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>No surprises.</em>
          </h1>
          <div style={{ marginTop: 16, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Start free — connect your portfolio in 60 seconds. Upgrade when you need AI, tax intelligence, or rebalancing.
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, maxWidth: 960 }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight ? 'linear-gradient(135deg, var(--brand-soft), var(--surface))' : 'var(--surface)',
              border: `1.5px solid ${plan.highlight ? 'var(--brand-2)' : 'var(--border)'}`,
              borderRadius: 24, padding: 28,
              position: 'relative', overflow: 'hidden',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: 18, right: 18,
                  padding: '4px 10px', borderRadius: 99,
                  background: 'var(--violet)', color: '#fff',
                  fontSize: 10.5, fontWeight: 700,
                }}>{plan.badge}</div>
              )}
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 48, letterSpacing: '-0.03em', color: 'var(--ink)', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{plan.period}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 22, lineHeight: 1.5 }}>{plan.desc}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--ink-2)' }}>
                    <span style={{ color: 'var(--up)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              {plan.active ? (
                <div style={{
                  padding: '12px', borderRadius: 12, textAlign: 'center',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  fontSize: 13, color: 'var(--ink-3)', fontWeight: 500,
                }}>{plan.cta}</div>
              ) : (
                <Link href="/connect" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '13px', borderRadius: 12,
                  background: plan.highlight ? 'var(--ink)' : 'transparent',
                  color: plan.highlight ? 'var(--bg)' : 'var(--ink)',
                  border: plan.highlight ? 'none' : '1.5px solid var(--border)',
                  fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
                }}>{plan.cta}</Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div style={{ marginTop: 48, maxWidth: 680 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 24 }}>Common questions</h2>
          {[
            { q: 'Is my portfolio data secure?', a: 'Yes. All data is encrypted at rest and in transit. We are read-only — we never have permission to trade or transact on your behalf.' },
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from Profile → Plan & Billing at any time. You\'ll retain access until the end of your billing period.' },
            { q: 'What counts as an AI query?', a: 'Each message you send to Folio AI (the chat) counts as one query. Automated insights on your dashboard don\'t count.' },
            { q: 'Does it work with all Indian brokers?', a: 'Via CAS upload (CAMS/KFintech) — yes, all AMCs. Via Auto-Connect (CDSL/NSDL) — yes, every SEBI-registered broker.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{item.q}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
