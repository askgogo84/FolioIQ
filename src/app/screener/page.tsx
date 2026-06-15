'use client';

import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function ScreenerPage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            DISCOVER · FUND SCREENER
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Screener data is not connected yet.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            We removed the pre-filled fund list. The screener will show results only after we connect a verified fund universe and screening metrics.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
            Nothing to screen yet.
          </h2>

          <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 760 }}>
            Your portfolio pages are live. Fund screening requires trusted external metrics like returns, AUM, expense ratio, risk, and category rankings.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            <Link href="/portfolio" style={btnPrimary}>View holdings →</Link>
            <Link href="/dashboard" style={btnGhost}>Dashboard</Link>
          </div>
        </div>
      </div>
    </AppLayout>
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

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  padding: '11px 18px',
  borderRadius: 999,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--ink-2)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};