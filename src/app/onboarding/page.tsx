'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

type Risk = 'Conservative' | 'Moderate' | 'Aggressive';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [risk, setRisk] = useState<Risk>('Moderate');
  const [horizon, setHorizon] = useState('5-10 years');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user's email/name to greet them
  useEffect(() => {
    fetch('/api/portfolio/me')
      .then(r => r.json())
      .then(d => {
        if (d.user?.email) setUserEmail(d.user.email);
        if (d.user?.name) setName(d.user.name);
      })
      .catch(() => {});
  }, []);

  const next = () => setStep(s => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  const back = () => setStep(s => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const goConnect = () => router.push('/connect?from=onboarding');

  return (
    <AppLayout>
      <div style={{ padding: '40px 40px 80px', maxWidth: 820, margin: '0 auto' }}>

        {/* Progress strip */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: s <= step ? 'var(--brand-2)' : 'var(--surface-2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* STEP 1 — Welcome */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
              STEP 1 OF 3 · 90 SECONDS TOTAL
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(54px, 7.5vw, 104px)', lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Welcome to <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>FolioIQ</em>.
            </h1>
            <div style={{ marginTop: 20, fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 620 }}>
              We&apos;ll set you up in three steps: get to know you, pull your portfolio from your demat, and unlock personalised tax + rebalance moves.
            </div>

            <div style={{ marginTop: 36, display: 'grid', gap: 14 }}>
              <Field label="What should we call you?" value={name} onChange={setName} placeholder="e.g. Aarav Sharma" />

              <div>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8, marginTop: 14 }}>HOW DO YOU FEEL ABOUT MARKET VOLATILITY?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {(['Conservative', 'Moderate', 'Aggressive'] as Risk[]).map(r => (
                    <button key={r} onClick={() => setRisk(r)} style={{
                      padding: '16px 14px', borderRadius: 14, fontSize: 13, fontWeight: 500,
                      background: risk === r ? 'var(--brand-soft)' : 'transparent',
                      color: risk === r ? 'var(--ink)' : 'var(--ink-2)',
                      border: '1.5px solid ' + (risk === r ? 'var(--brand-2)' : 'var(--border)'),
                      cursor: 'pointer', textAlign: 'left',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{r}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {r === 'Conservative' && 'I lose sleep on red days'}
                        {r === 'Moderate' && 'I can handle 15% drawdowns'}
                        {r === 'Aggressive' && 'I&apos;m here for 30+ yrs of compounding'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8, marginTop: 14 }}>INVESTMENT HORIZON</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {['< 3 years', '3-5 years', '5-10 years', '10+ years'].map(h => (
                    <button key={h} onClick={() => setHorizon(h)} style={{
                      padding: '12px', borderRadius: 12, fontSize: 12.5, fontWeight: 500,
                      background: horizon === h ? 'var(--brand-soft)' : 'transparent',
                      color: horizon === h ? 'var(--ink)' : 'var(--ink-2)',
                      border: '1.5px solid ' + (horizon === h ? 'var(--brand-2)' : 'var(--border)'),
                      cursor: 'pointer',
                    }}>{h}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between' }}>
              <Link href="/dashboard" style={btnGhost}>Skip for now</Link>
              <button onClick={next} disabled={!name.trim()} style={{
                ...btnPrimary,
                opacity: name.trim() ? 1 : 0.4,
                cursor: name.trim() ? 'pointer' : 'not-allowed',
              }}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Connect */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
              STEP 2 OF 3 · 60 SECONDS
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(46px, 6.5vw, 84px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Hi {name.split(' ')[0]}, let&apos;s pull your <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>portfolio</em>.
            </h1>
            <div style={{ marginTop: 18, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 620 }}>
              We sync directly from CDSL or NSDL using your PAN and registered mobile number. No CAS PDFs to find, no passwords to share.
            </div>

            <div style={{
              marginTop: 32, padding: 28,
              background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
              border: '1px solid var(--border)', borderRadius: 20,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
                {[
                  { t: '60 sec', d: 'Total time' },
                  { t: 'Read-only', d: 'Holdings only, no trades' },
                  { t: 'Free', d: 'On Plus plan' },
                ].map((b, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{b.t}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>{b.d}</div>
                  </div>
                ))}
              </div>
              <button onClick={goConnect} style={{ ...btnPrimary, width: '100%', padding: '16px', fontSize: 14 }}>
                ⚡ Open CAS Parser
              </button>
            </div>

            <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>
              You&apos;ll be redirected to the secure CAS Parser flow, then back here when done.
            </div>

            <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnGhost}>← Back</button>
              <button onClick={next} style={btnGhost}>Skip and explore demo →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Ready */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
              STEP 3 OF 3 · YOU&apos;RE READY
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(54px, 7.5vw, 104px)', lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              All set, <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>{name.split(' ')[0]}</em>.
            </h1>
            <div style={{ marginTop: 20, fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 620 }}>
              You&apos;re seeing a demo portfolio for now. Hit Connect anytime from the sidebar to pull your real holdings.
            </div>

            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Tile href="/dashboard" emoji="📊" t="Dashboard" d="Holdings, allocation, performance" />
              <Tile href="/intelligence" emoji="✦" t="Folio AI Insights" d="Tax + rebalance moves worth ₹2.1 L" />
              <Tile href="/chat" emoji="💬" t="Ask Folio" d="Personalised portfolio Q&amp;A" />
              <Tile href="/connect" emoji="⚡" t="Connect later" d="Pull live data from CDSL/NSDL" />
            </div>

            <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={back} style={btnGhost}>← Back</button>
              <Link href="/dashboard" style={btnPrimary}>Go to Dashboard →</Link>
            </div>
          </div>
        )}

        {userEmail && (
          <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11.5, color: 'var(--ink-3)' }}>
            Signed in as {userEmail}
          </div>
        )}

      </div>
    </AppLayout>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 14,
          background: 'var(--surface)', color: 'var(--ink)',
          border: '1px solid var(--border)', outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function Tile({ href, emoji, t, d }: { href: string; emoji: string; t: string; d: string }) {
  return (
    <Link href={href} style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18,
      padding: 22, textDecoration: 'none', display: 'flex', gap: 14, alignItems: 'center',
    }}>
      <div style={{ fontSize: 28 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>{d}</div>
      </div>
    </Link>
  );
}

const btnGhost: React.CSSProperties = {
  padding: '11px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
  background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};

const btnPrimary: React.CSSProperties = {
  padding: '12px 22px', borderRadius: 99, fontSize: 13, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};
