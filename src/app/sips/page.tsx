'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

type DbHolding = {
  scheme_code: string | null;
  scheme_name: string | null;
  category: string | null;
  amc: string | null;
  sip_amount: number | string | null;
  invested_amount: number | string | null;
  current_value: number | string | null;
};

type SipRow = {
  id: string;
  fund: string;
  category: string;
  amc: string;
  amount: number;
  invested: number;
  current: number;
  logo: string;
};

function toNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function logoOf(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'MF';
}

function fmtINR(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function fmtL(n: number): string {
  return '₹' + (n / 100000).toFixed(2) + ' L';
}

export default function SipsPage() {
  const [rows, setRows] = useState<SipRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio/holdings', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const holdings = (data.holdings || []) as DbHolding[];
        const mapped = holdings
          .map((h, i) => {
            const fund = h.scheme_name || 'Unnamed fund';
            return {
              id: h.scheme_code || String(i),
              fund,
              category: h.category || 'Other',
              amc: h.amc || '',
              amount: toNumber(h.sip_amount),
              invested: toNumber(h.invested_amount),
              current: toNumber(h.current_value),
              logo: logoOf(fund),
            };
          })
          .filter(h => h.amount > 0);

        setRows(mapped);
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const monthly = rows.reduce((s, r) => s + r.amount, 0);
    const invested = rows.reduce((s, r) => s + r.invested, 0);
    const current = rows.reduce((s, r) => s + r.current, 0);
    const gain = current - invested;
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
    return { monthly, invested, current, gain, gainPct };
  }, [rows]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · SIPs
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            SIPs from your live holdings.
          </h1>

          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            We only show SIPs detected in your portfolio holdings. Mandate edits and bank auto-pay controls are not connected yet.
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          <Stat label="Detected SIPs" value={loading ? '—' : String(rows.length)} />
          <Stat label="Monthly amount" value={loading ? '—' : fmtINR(totals.monthly)} />
          <Stat label="Invested in SIP funds" value={loading ? '—' : fmtL(totals.invested)} />
          <Stat label="Current value" value={loading ? '—' : fmtL(totals.current)} sub={totals.invested ? `${totals.gainPct.toFixed(2)}% total gain` : undefined} tone={totals.gain >= 0 ? 'up' : 'down'} />
        </div>

        {loading && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, color: 'var(--ink-3)' }}>
            Loading SIP data…
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 34 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
              No SIPs detected yet.
            </h2>
            <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 680 }}>
              Your holdings are live, but `sip_amount` is empty or zero for the current records. Upload the latest CAS/NJ report with SIP details to populate this page.
            </p>
            <Link href="/upload" style={btnPrimary}>Upload latest statement →</Link>
          </div>
        )}

        {!loading && rows.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', padding: '14px 24px', borderBottom: '1px solid var(--border)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>
              <div>Fund</div>
              <div style={{ textAlign: 'right' }}>Monthly SIP</div>
              <div style={{ textAlign: 'right' }}>Invested</div>
              <div style={{ textAlign: 'right' }}>Current</div>
            </div>

            {rows.map((s, i) => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', padding: '16px 24px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand)', color: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {s.logo}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{s.fund}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.category}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink)', fontWeight: 600 }}>{fmtINR(s.amount)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>{fmtL(s.invested)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>{fmtL(s.current)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: tone === 'up' ? 'var(--up)' : 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  marginTop: 18,
  padding: '11px 18px',
  borderRadius: 999,
  background: 'var(--ink)',
  color: 'var(--bg)',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};