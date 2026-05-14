'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ── Ticker data (live via /api/market, fallback hardcoded) ──────────
const TICKER_FALLBACK = [
  { sym: 'NIFTY 50',   val: '23,412.60', chg: +0.14 },
  { sym: 'SENSEX',     val: '74,608.98', chg: +0.07 },
  { sym: 'NIFTY BANK', val: '53,456.15', chg: -0.27 },
  { sym: 'NIFTY IT',   val: '29,394.20', chg: +1.21 },
  { sym: 'INDIA VIX',  val: '19.42',     chg: +0.75 },
  { sym: 'USD/INR',    val: '₹95.71',    chg: +0.43 },
  { sym: 'GOLD',       val: '₹1,62,010', chg: +4.52 },
  { sym: 'BTC/USD',    val: '$79,547',   chg: -1.60 },
];

const FEATURES = [
  {
    icon: '✦',
    title: 'AI Insights tuned to your money',
    body: 'Every signal is computed against your actual holdings — not generic tips. Get rebalance plans, SIP step-up nudges, and tax opportunities.',
    accent: true,
  },
  {
    icon: '◈',
    title: 'Tax-loss harvesting',
    body: 'LTCG up to ₹1.25 L per year is tax-free in India. We auto-identify lots, sell-and-rebuy to reset cost basis.',
  },
  {
    icon: '⇄',
    title: 'Smart rebalance',
    body: 'Drift detected. One-click rebalance plan that minimises tax drag while correcting your allocation to target.',
  },
  {
    icon: '₹',
    title: 'Real returns, after tax',
    body: 'Absolute returns are flattering. We show what you actually keep — XIRR after estimated STCG and LTCG.',
  },
  {
    icon: '◎',
    title: 'Goal-based planning',
    body: 'Set a goal (flat, college, retirement), link holdings, and see if you\'re on track — with month-by-month projections.',
  },
  {
    icon: '⊘',
    title: 'Private by default',
    body: 'Read-only CAS parsing. We never touch your broker account, never store your password, never sell your data.',
  },
];

const STEPS = [
  { num: '01', title: 'Drop your CAS PDF', body: 'Request a Consolidated Account Statement from CAMS or KFintech — both free, both arrive in your inbox in minutes. Upload here.' },
  { num: '02', title: 'We parse 100% of it', body: 'Every fund, every folio, every transaction. We reconcile NAVs and compute your exact XIRR — no rounding, no shortcuts.' },
  { num: '03', title: 'Get your dashboard', body: 'Health score, drift, tax to save, rebalance plan, goal progress. All in one view. Ask Folio AI any question, anytime.' },
];

const INTEGRATIONS = ['CAMS', 'KFintech', 'Zerodha Coin', 'Groww', 'INDmoney', 'Kuvera', 'NSDL e-CAS'];

const TESTIMONIALS = [
  {
    quote: 'Found ₹38K in tax savings in my first session. The harvest plan was four clicks. My CA missed it for three years.',
    name: 'Priya Raghavan',
    role: 'Senior PM, Bengaluru',
    avatar: 'PR',
    tone: '#0f3d2e',
  },
  {
    quote: 'Finally a portfolio tool that thinks in crores, not dollars. The XIRR after-tax view changed how I think about my SIPs.',
    name: 'Vikram Kapoor',
    role: 'Doctor, Mumbai',
    avatar: 'VK',
    tone: '#2952ff',
  },
];

const PRICING = [
  {
    name: 'Individual',
    price: 199,
    period: 'per month',
    annual: '₹1,990/yr (save 2 months)',
    highlight: false,
    features: [
      'Full dashboard & AI insights',
      'Unlimited CAS uploads',
      'Tax-loss harvesting',
      'Smart rebalance plans',
      'Goal planner',
      'AI chat (50 queries/mo)',
    ],
    cta: 'Start free trial',
  },
  {
    name: 'Family',
    price: 349,
    period: 'per month',
    annual: '₹3,490/yr (save 2 months)',
    highlight: true,
    features: [
      'Everything in Individual',
      'Up to 5 family members',
      'Consolidated family view',
      'AI chat (unlimited)',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Start free trial',
  },
];

// ── Sub-components ──────────────────────────────────────────────────

function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('folioiq-theme') as 'dark' | 'light' | null;
    const t = saved || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('folioiq-theme', next);
  };
  return (
    <button onClick={toggle} className="btn ghost" style={{ padding: 9, borderRadius: 999 }} aria-label="Toggle theme">
      {theme === 'dark' ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
      )}
    </button>
  );
}

function TickerStrip() {
  const [tickers, setTickers] = useState(TICKER_FALLBACK);
  useEffect(() => {
    fetch('/api/market').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length) setTickers(d);
    }).catch(() => {});
  }, []);
  const items = [...tickers, ...tickers, ...tickers];
  return (
    <div style={{ borderBottom: '1px solid var(--border)', overflow: 'hidden', position: 'relative', height: 34, display: 'flex', alignItems: 'center', background: 'var(--bg-deep)' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--bg-deep), transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--bg-deep), transparent)', zIndex: 2, pointerEvents: 'none' }}/>
      <div style={{ display: 'flex', gap: 48, animation: 'marquee 80s linear infinite', whiteSpace: 'nowrap', paddingLeft: 32 }}>
        {items.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexShrink: 0, fontSize: 12 }}>
            <span className="label" style={{ fontSize: 9.5 }}>{t.sym}</span>
            <span className="mono" style={{ fontWeight: 500 }}>{t.val}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.chg >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        body::before {
          content: '';
          position: fixed;
          top: 20vh; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--brand) 10%, transparent), transparent 60%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Ticker */}
      <TickerStrip />

      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'color-mix(in oklab, var(--bg) 88%, transparent)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 40px',
        display: 'flex', alignItems: 'center', gap: 32, height: 60,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', flexShrink: 0 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, background: 'var(--brand)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-brand)',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--bg-deep)', fontStyle: 'italic', lineHeight: 1 }}>ƒ</span>
          </span>
          FolioIQ
        </Link>

        <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}>
          {['Features', 'How it works', 'Fund Screener', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, '-')}`} style={{
              padding: '7px 12px', borderRadius: 999, fontSize: 13.5, color: 'var(--ink-2)',
              transition: 'color .12s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}>
              {l}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <ThemeToggle />
          <Link href="/auth" className="btn ghost" style={{ fontSize: 13.5 }}>Sign in</Link>
          <Link href="/auth" className="btn dark" style={{ fontSize: 13.5 }}>Get started →</Link>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section id="features" style={{ textAlign: 'center', padding: '100px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            fontSize: 13, color: 'var(--ink-2)', marginBottom: 36,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--up)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
            India&apos;s smartest mutual fund portfolio analyzer
          </div>

          <h1 className="display-xl" style={{ marginBottom: 28, maxWidth: 900, margin: '0 auto 28px' }}>
            Your money,{' '}
            <em style={{
              color: 'var(--brand)', fontStyle: 'italic',
              textDecoration: 'none',
              background: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>finally</em>{' '}
            working.
          </h1>

          <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Upload your CAS statement and get instant AI signals, after-tax returns, tax harvest plan, and rebalancing advice. No jargon. Just clarity.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/auth" className="btn dark lg">Analyze my portfolio — free →</Link>
            <Link href="/dashboard/explore" className="btn lg" style={{ borderColor: 'var(--border-strong)' }}>Browse 63+ funds</Link>
          </div>

          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Free forever · No credit card · NJ Wealth, Groww, Zerodha, ET Money, CAMS
          </p>
        </section>

        {/* ── Dashboard preview ─────────────────────────────────── */}
        <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)',
            overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
          }}>
            {/* window chrome */}
            <div style={{
              padding: '14px 20px', background: 'var(--surface-2)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 7 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: 99, background: c }} />
                ))}
              </div>
              <span style={{
                flex: 1, textAlign: 'center', fontSize: 12,
                color: 'var(--ink-3)', fontFamily: 'var(--font-mono)',
              }}>
                folio-iq.vercel.app/dashboard
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                background: 'var(--up-soft)', color: 'var(--up)',
              }}>94 / 100</span>
            </div>

            {/* Dashboard body preview */}
            <div style={{ background: 'var(--bg)', padding: '28px 32px', minHeight: 320 }}>
              {/* mini ticker */}
              <div style={{ display: 'flex', gap: 28, marginBottom: 24, flexWrap: 'wrap' }}>
                {TICKER_FALLBACK.slice(0, 5).map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12 }}>
                    <span className="label" style={{ fontSize: 9 }}>{t.sym}</span>
                    <span className="mono">{t.val}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: t.chg >= 0 ? 'var(--up)' : 'var(--down)' }}>
                      {t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 28, alignItems: 'flex-start' }}>
                <div>
                  <div className="label" style={{ marginBottom: 10 }}>Net worth · all accounts</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,6vw,72px)', lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 14 }}>
                    ₹55.33 L
                  </div>
                  <div style={{ color: 'var(--up)', fontSize: 14 }}>
                    ↑ ₹16.22L (+41.46%) all time · After-tax ≈ ₹14.19L
                  </div>
                  <div style={{
                    marginTop: 14, padding: '10px 14px', borderRadius: 12,
                    background: 'var(--down-soft)', color: 'var(--down)', fontSize: 13,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}>
                    📉 Portfolio declined ₹16,361 (−0.30%) today vs yesterday
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { l: 'Invested', v: '₹39.11L' },
                    { l: 'SIP/mo', v: '₹91K' },
                    { l: 'Tax savable', v: '~₹16,250', gold: true },
                  ].map((s, i) => (
                    <div key={i} style={{
                      padding: '14px 18px', borderRadius: 16,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      textAlign: 'center', minWidth: 90,
                    }}>
                      <div className="label" style={{ marginBottom: 6 }}>{s.l}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: s.gold ? 'var(--gold)' : 'var(--ink)' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────── */}
        <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="display-m" style={{ textAlign: 'center', marginBottom: 12 }}>
            Six tools that turn confusion into clarity.
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 17, marginBottom: 56, maxWidth: 540, margin: '0 auto 56px' }}>
            Six tools that turn a confusing spreadsheet of holdings into a clear, actionable plan.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{
                padding: 28,
                background: f.accent ? 'color-mix(in oklab, var(--brand) 12%, var(--surface))' : 'var(--surface)',
                border: f.accent ? '1px solid color-mix(in oklab, var(--brand) 30%, var(--border))' : '1px solid var(--border)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, marginBottom: 18,
                  background: f.accent ? 'var(--brand)' : 'var(--surface-2)',
                  color: f.accent ? 'var(--bg-deep)' : 'var(--brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 600,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 10, lineHeight: 1.15 }}>{f.title}</h3>
                <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────────── */}
        <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div className="card" style={{ padding: '48px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
              {[
                { v: '63+', l: 'Funds covered' },
                { v: '1,840', l: 'MFs in our universe' },
                { v: '₹14.2L', l: 'Avg tax saved per user / yr' },
                { v: '94', l: 'Average portfolio health' },
              ].map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                  padding: '0 24px',
                }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 10, color: 'var(--brand)' }}>{s.v}</div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 14 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section id="how-it-works" style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 className="display-m" style={{ textAlign: 'center', marginBottom: 64 }}>
              From PDF to clarity in 2 minutes.
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
              {STEPS.map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 80, lineHeight: 1, color: 'var(--brand)', opacity: 0.4, marginBottom: 20 }}>{s.num}</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 12 }}>{s.title}</h3>
                  <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.65 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Integrations ──────────────────────────────────────── */}
        <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
          <p className="label" style={{ textAlign: 'center', marginBottom: 24 }}>Works with your existing accounts</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {INTEGRATIONS.map((name, i) => (
              <span key={i} style={{
                padding: '9px 18px', borderRadius: 999,
                border: '1px solid var(--border)', background: 'var(--surface)',
                fontSize: 13.5, fontWeight: 500,
              }}>{name}</span>
            ))}
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────── */}
        <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card" style={{ padding: 36 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, lineHeight: 1.4, marginBottom: 28, fontStyle: 'italic', color: 'var(--ink-2)' }}>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: t.tone, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, color: 'white',
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────────────── */}
        <section id="pricing" style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="display-m" style={{ textAlign: 'center', marginBottom: 12 }}>
            Simple pricing. No surprises.
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 17, marginBottom: 56, maxWidth: 480, margin: '0 auto 56px' }}>
            Start free. Upgrade when you&apos;re ready. Cancel anytime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            {PRICING.map((plan, i) => (
              <div key={i} className="card" style={{
                padding: 36,
                border: plan.highlight ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                background: plan.highlight ? 'color-mix(in oklab, var(--brand) 6%, var(--surface))' : 'var(--surface)',
                position: 'relative', overflow: 'hidden',
              }}>
                {plan.highlight && (
                  <>
                    <div style={{
                      position: 'absolute', top: -40, right: -40, width: 160, height: 160,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 20%, transparent), transparent 70%)',
                    }}/>
                    <span style={{
                      position: 'absolute', top: 18, right: 18,
                      padding: '4px 10px', borderRadius: 999,
                      background: 'var(--brand)', color: 'var(--bg-deep)',
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    }}>MOST POPULAR</span>
                  </>
                )}

                <div style={{ position: 'relative' }}>
                  <div className="label" style={{ marginBottom: 12 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 56, lineHeight: 1, letterSpacing: '-0.03em' }}>₹{plan.price}</span>
                    <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>{plan.period}</span>
                  </div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 28 }}>{plan.annual}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                        <span style={{ color: 'var(--up)', fontSize: 16, lineHeight: 1 }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="/auth" className={`btn ${plan.highlight ? 'primary' : 'dark'}`} style={{ width: '100%', justifyContent: 'center', fontSize: 14 }}>
                    {plan.cta}
                  </Link>
                  <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)', marginTop: 10 }}>
                    14-day free trial · No card required
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section style={{ padding: '0 40px 100px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            padding: '80px 60px', borderRadius: 'var(--radius-xl)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at 50% 0%, color-mix(in oklab, var(--brand) 18%, transparent), transparent 60%)',
              pointerEvents: 'none',
            }}/>
            <div style={{ position: 'relative' }}>
              <h2 className="display-l" style={{ marginBottom: 18 }}>
                Money, finally{' '}
                <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>working.</em>
              </h2>
              <p style={{ color: 'var(--ink-2)', fontSize: 17, marginBottom: 36 }}>
                Free forever. Read-only. Two minutes from CAS to clarity.
              </p>
              <Link href="/auth" className="btn dark lg">Analyze my portfolio — free →</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '60px 40px 40px',
        background: 'var(--bg-deep)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, marginBottom: 14 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--bg-deep)', fontStyle: 'italic' }}>ƒ</span>
                </span>
                FolioIQ
              </div>
              <p style={{ color: 'var(--ink-3)', fontSize: 13.5, lineHeight: 1.65, maxWidth: 280 }}>
                India&apos;s smartest mutual fund portfolio analyzer. AI-powered insights, tax-loss harvesting, and smart rebalancing.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Dashboard', 'Fund Screener', 'Tax Harvesting', 'Smart Rebalance', 'Goal Planner'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Terms', 'Privacy', 'Security', 'Cookies'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ fontSize: 13.5, color: 'var(--ink-3)', transition: 'color .12s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}>
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>
              © 2026 FolioIQ · Made with ♥ in 🇮🇳 India
            </span>
            <span style={{ color: 'var(--ink-4)', fontSize: 11, maxWidth: 480, lineHeight: 1.5, textAlign: 'right' }}>
              Mutual fund investments are subject to market risks. FolioIQ is not a SEBI-registered investment advisor. Read all scheme documents carefully.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
