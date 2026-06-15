'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type DbHolding = {
  scheme_code: string | null;
  scheme_name: string | null;
  invested_amount: number | string | null;
  current_value: number | string | null;
  updated_at?: string | null;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function fmtL(n: number): string {
  return '₹' + (n / 100000).toFixed(2) + ' L';
}

export default function TransactionsPage() {
  const [holdings, setHoldings] = useState<DbHolding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio/holdings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setHoldings((data.holdings || []) as DbHolding[]))
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const invested = holdings.reduce((s, h) => s + toNumber(h.invested_amount), 0);
    const current = holdings.reduce((s, h) => s + toNumber(h.current_value), 0);
    const gain = current - invested;
    const latest = holdings.map(h => h.updated_at || '').filter(Boolean).sort().at(-1) || '';
    return { invested, current, gain, latest };
  }, [holdings]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
              ACTIVITY
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 88px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Transactions are not connected yet.
            </h1>

            <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
              Your holdings and NAV values are live, but a verified transaction ledger has not been imported yet. This page will stay empty until we save real purchase, redemption, switch, SIP, or dividend rows.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <Stat label="Funds tracked" value={loading ? '—' : String(holdings.length)} />
          <Stat label="Invested" value={loading ? '—' : fmtL(totals.invested)} />
          <Stat label="Current value" value={loading ? '—' : fmtL(totals.current)} />
          <Stat label="Unrealised gain" value={loading ? '—' : fmtL(totals.gain)} tone={totals.gain >= 0 ? 'up' : 'down'} />
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
            TRUSTED LEDGER REQUIRED
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
            No transaction rows found.
          </h2>

          <p style={{ color: 'var(--ink-2)', lineHeight: 1.65, maxWidth: 760 }}>
            To avoid showing invented activity, FolioKey will not display transaction history until the CAS/NJ parser stores actual transactions for your account.
          </p>

          {totals.latest && (
            <p style={{ color: 'var(--ink-3)', fontSize: 12.5, marginTop: 8 }}>
              Latest holdings refresh: {new Date(totals.latest).toLocaleString('en-IN')}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
            <Link href="/upload" style={btnPrimary}>Upload statement →</Link>
            <Link href="/portfolio" style={btnGhost}>View holdings</Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20 }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>{value}</div>
    </div>
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