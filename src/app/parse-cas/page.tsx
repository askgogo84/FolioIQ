'use client';

import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

export default function ParseCASPage() {
  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            CAS PARSER
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)', maxWidth: 900 }}>
            Upload CAS to refresh your real portfolio.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            This screen no longer displays example parsed funds. Use the live upload flow so holdings are saved to Supabase and reflected in Dashboard, Holdings, SIPs, and Insights.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 30 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
              LIVE FLOW
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, letterSpacing: '-0.03em', margin: 0, color: 'var(--ink)' }}>
              Go to Upload CAS.
            </h2>

            <p style={{ marginTop: 14, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.65 }}>
              The upload page is the correct production path. It connects parsed holdings to your authenticated Supabase user instead of showing placeholder output.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <Link href="/upload" style={btnPrimary}>Upload CAS →</Link>
              <Link href="/dashboard" style={btnGhost}>Back to dashboard</Link>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 30 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
              DATA TRUST
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {[
                ['No invented funds', 'This page does not show parsed holdings unless they come from a real upload.'],
                ['Supabase only', 'Saved holdings must belong to the logged-in user.'],
                ['Dashboard sync', 'After upload, refresh NAV from Dashboard to get latest AMFI values.'],
              ].map(([title, body]) => (
                <div key={title} style={{ padding: 16, borderRadius: 16, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 14 }}>{title}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 12.5, lineHeight: 1.55, marginTop: 4 }}>{body}</div>
                </div>
              ))}
            </div>
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