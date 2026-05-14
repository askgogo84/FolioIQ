'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type Stage = 'loading' | 'ready' | 'connecting' | 'saving' | 'success' | 'error';

type SaveResult = {
  success?: boolean;
  fundCount?: number;
  totalInvested?: number;
  totalValue?: number;
  gain?: number;
  gainPct?: number;
  error?: string;
};

const SUPPORTED_BROKERS = [
  { name: 'Zerodha',   tag: 'Coin / Console',  tone: '#387ed1', logo: 'Z' },
  { name: 'Groww',     tag: 'MF + Stocks',      tone: '#00c899', logo: 'G' },
  { name: 'Kuvera',    tag: 'Direct MF',        tone: '#7b3aed', logo: 'K' },
  { name: 'Paytm Money', tag: 'MF + Stocks',    tone: '#00b9f1', logo: 'P' },
  { name: 'ICICI Direct', tag: 'Full Service', tone: '#a51c30', logo: 'IC' },
  { name: 'Upstox',    tag: 'Discount',         tone: '#7c4dff', logo: 'U' },
  { name: 'HDFC Sec',  tag: 'Full Service',     tone: '#004c8f', logo: 'HD' },
  { name: 'AngelOne',  tag: 'Discount',         tone: '#f47216', logo: 'AO' },
];

export default function ConnectPage() {
  const router = useRouter();
  const params = useSearchParams();
  const fromOnboarding = params.get('from') === 'onboarding';

  const [stage, setStage] = useState<Stage>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch a session token from CAS Parser as soon as the page loads
  useEffect(() => {
    fetch('/api/casparser/token')
      .then(r => r.json())
      .then(d => {
        if (d.access_token) {
          setAccessToken(d.access_token);
          setStage('ready');
        } else {
          setError(d.error || 'Failed to initialize CAS Parser');
          setStage('error');
        }
      })
      .catch(e => {
        setError(String(e));
        setStage('error');
      });
  }, []);

  const openWidget = useCallback(async () => {
    if (!accessToken) return;
    setStage('connecting');
    setError(null);

    try {
      const { open } = await import('@cas-parser/connect');

      const widgetResult = await open({
        accessToken,
        config: {
          enableCdslFetch: true,
          enableInbox: false,
          enableGenerator: false,
          homeLayout: 'actions',
        },
      });

      if (widgetResult.status === 'closed') {
        setStage('ready');
        return;
      }

      if (widgetResult.status === 'error') {
        setError(widgetResult.error?.message || 'Import failed. Please try again.');
        setStage('ready');
        return;
      }

      // Success — save to FolioIQ Supabase
      setStage('saving');
      const saveRes = await fetch('/api/casparser/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: widgetResult.data, metadata: widgetResult.metadata }),
      });
      const saved: SaveResult = await saveRes.json();

      if (saved.success) {
        setResult(saved);
        setStage('success');
        setTimeout(() => router.push('/dashboard'), 2500);
      } else {
        setError(saved.error || 'Failed to save portfolio. Please try again.');
        setStage('ready');
      }
    } catch (e: unknown) {
      console.error('Widget error:', e);
      const msg = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      setError(msg);
      setStage('ready');
    }
  }, [accessToken, router]);

  const fmt = (v?: number) =>
    !v ? '—' : v >= 100000 ? `₹${(v / 100000).toFixed(2)} L` : `₹${Math.round(v).toLocaleString('en-IN')}`;

  // ── SUCCESS STATE ─────────────────────────────────────────────────
  if (stage === 'success' && result) {
    return (
      <AppLayout>
        <div style={{ padding: '60px 40px 80px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: 99,
            background: 'var(--up-soft)', color: 'var(--up)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, marginBottom: 22,
          }}>✓</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 6.5vw, 84px)', lineHeight: 0.96, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Portfolio <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>imported</em>.
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)' }}>
            We pulled {result.fundCount} funds from your demat. Redirecting to your dashboard…
          </div>
          <div style={{
            marginTop: 32, padding: 28,
            background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
            border: '1px solid var(--border)', borderRadius: 24,
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
          }}>
            <Result label="FUNDS"     value={result.fundCount?.toString() || '0'} />
            <Result label="INVESTED"  value={fmt(result.totalInvested)} />
            <Result label="CURRENT"   value={fmt(result.totalValue)} tone="up" sub={result.gainPct ? `${result.gainPct >= 0 ? '+' : ''}${result.gainPct.toFixed(2)}%` : undefined} />
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── MAIN STATE ────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ⚡ AUTO-CONNECT · CAS PARSER
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Skip the upload. <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>Pull everything.</em>
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            One tap pulls your entire mutual fund portfolio from CDSL or NSDL — no CAS PDF, no password sharing. Powered by CAS Parser, India&apos;s most-used portfolio API.
          </div>
        </div>

        {/* Primary CTA card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
          border: '1px solid var(--border)', borderRadius: 24, padding: 36, marginBottom: 28,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>
                {fromOnboarding ? 'STEP 2 OF 3 · TAKES 60 SECONDS' : 'RECOMMENDED'}
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 4.5vw, 56px)', lineHeight: 1, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
                Pull live from CDSL / NSDL.
              </h2>
              <div style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 540 }}>
                Verify with your PAN and registered mobile OTP. Folio reads holdings directly from the depository — same data your AMC reports to SEBI.
              </div>
              {error && (
                <div style={{
                  marginTop: 16, padding: 12, borderRadius: 10,
                  background: 'var(--down-soft)', color: 'var(--down)',
                  fontSize: 12.5, fontWeight: 500,
                }}>
                  ⚠ {error}
                </div>
              )}
            </div>
            <button
              onClick={openWidget}
              disabled={stage !== 'ready'}
              style={{
                padding: '16px 32px', borderRadius: 99,
                background: stage === 'ready' ? 'var(--ink)' : 'var(--surface-2)',
                color: stage === 'ready' ? 'var(--bg)' : 'var(--ink-3)',
                fontSize: 14, fontWeight: 600,
                border: 'none', cursor: stage === 'ready' ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
              {stage === 'loading'    && '⟳ Initialising…'}
              {stage === 'ready'      && '⚡ Connect now →'}
              {stage === 'connecting' && '⟳ Opening widget…'}
              {stage === 'saving'     && '⟳ Saving portfolio…'}
              {stage === 'error'      && '⚠ Retry'}
            </button>
          </div>
        </div>

        {/* Privacy + How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginBottom: 32 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>How it works</h3>
            <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
              {[
                { n: '01', t: 'Enter PAN + mobile', d: 'Both must match your demat registration.' },
                { n: '02', t: 'Verify OTP',         d: 'Sent to your CDSL/NSDL-linked mobile.' },
                { n: '03', t: 'Holdings sync',      d: 'We pull every fund. Takes ~30 seconds.' },
              ].map(s => (
                <div key={s.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--brand-2)', flexShrink: 0, lineHeight: 1, letterSpacing: '-0.02em', width: 32 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{s.t}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>What we don&apos;t see</h3>
            <div style={{ marginTop: 18, display: 'grid', gap: 11 }}>
              {[
                'Your broker passwords or trading PIN',
                'Bank account credentials',
                'Permission to trade or transact',
                'Anything beyond holdings you authorise',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--up)', fontWeight: 700 }}>✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
              CAS Parser is SEBI / SEBI-RA compliant and ISO 27001 certified. All data encrypted in transit and at rest.
            </div>
          </div>
        </div>

        {/* Supported brokers strip (informational, not clickable connect) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Works with every broker</h3>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>via CDSL/NSDL</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {SUPPORTED_BROKERS.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                background: 'var(--surface-2)', borderRadius: 12,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: b.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{b.logo}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>{b.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 1 }}>{b.tag}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            Since CAS Parser pulls from CDSL/NSDL directly, every Indian broker that reports to the depository is supported — even those not listed above.
          </div>
        </div>

        {/* Fallback: manual upload */}
        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
          Prefer to upload a CAS PDF instead? <Link href="/upload" style={{ color: 'var(--brand-2)', fontWeight: 600 }}>Upload manually →</Link>
        </div>

      </div>
    </AppLayout>
  );
}

function Result({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--up)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
