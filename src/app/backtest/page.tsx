'use client';

import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function BacktestPage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · BACKTESTING
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Backtesting is not connected yet.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            We removed the pre-filled benchmark chart. Backtesting will be enabled only after we connect historical NAV series for your actual funds.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
            Historical NAV engine required.
          </h2>

          <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 760 }}>
            To avoid misleading returns, this page will stay in a trusted empty state until we calculate performance from verified historical NAV data.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            <Link href="/dashboard" style={btnPrimary}>Dashboard →</Link>
            <Link href="/portfolio" style={btnGhost}>View holdings</Link>
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