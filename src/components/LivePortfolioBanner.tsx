'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Summary = {
  fundCount: number;
  totalInvested: number;
  totalCurrent: number;
  totalGain: number;
  gainPct: number;
  lastUpdated: string;
};

type Response = {
  connected: boolean;
  reason?: string;
  summary?: Summary;
  user?: { name: string; email: string };
};

// Drops in at the top of /dashboard. When real Supabase data exists, shows
// a "Live · ₹X.XX L · synced N min ago" banner. When not, shows a connect CTA.
// Existing dashboard cards (HeroValue, PerfBlock, etc.) continue to use mock data
// until we migrate them block-by-block. This banner is the trust signal that data
// is flowing.
export default function LivePortfolioBanner() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio/me')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  if (loading) return null;

  // Connected — real data exists
  if (data?.connected && data.summary) {
    const s = data.summary;
    const updatedAt = new Date(s.lastUpdated);
    const minsAgo = Math.floor((Date.now() - updatedAt.getTime()) / 60000);
    const updatedLabel = minsAgo < 1 ? 'just now'
                      : minsAgo < 60 ? `${minsAgo} min ago`
                      : minsAgo < 1440 ? `${Math.floor(minsAgo / 60)}h ago`
                      : `${Math.floor(minsAgo / 1440)}d ago`;
    const fmtL = (n: number) => n >= 10000000
      ? `₹${(n / 10000000).toFixed(2)} Cr`
      : `₹${(n / 100000).toFixed(2)} L`;

    return (
      <div style={{
        background: 'linear-gradient(135deg, var(--up-soft) 0%, var(--surface) 80%)',
        border: '1px solid var(--border)', borderRadius: 18, padding: '18px 24px',
        marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 99, background: 'var(--up)',
            animation: 'pulse-dot 2s infinite', display: 'inline-block',
          }} />
          <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--up)', fontWeight: 700 }}>
            LIVE · CONNECTED
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          <Stat label="Funds"        value={s.fundCount.toString()} />
          <Stat label="Invested"     value={fmtL(s.totalInvested)} />
          <Stat label="Current"      value={fmtL(s.totalCurrent)} />
          <Stat label="Gain"         value={fmtL(s.totalGain)} sub={`${s.gainPct >= 0 ? '+' : ''}${s.gainPct.toFixed(2)}%`} tone={s.gainPct >= 0 ? 'up' : 'down'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Synced {updatedLabel}</span>
          <Link href="/connect" style={{
            padding: '8px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: 'var(--ink)', color: 'var(--bg)', textDecoration: 'none',
          }}>↻ Re-sync</Link>
        </div>
      </div>
    );
  }

  // Not connected — show demo banner
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
      border: '1px solid var(--border)', borderRadius: 18, padding: '18px 24px',
      marginBottom: 24,
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'var(--brand-2)', color: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>⚡</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 600 }}>
              DEMO MODE
            </span>
            <span style={{ padding: '2px 7px', borderRadius: 99, background: 'var(--surface-2)', fontSize: 10, color: 'var(--ink-2)', fontWeight: 500 }}>
              Aarav Sharma · sample data
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
            Connect your demat to see <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>your</em> real portfolio.
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
            60-second sync from CDSL or NSDL · No password sharing
          </div>
        </div>
      </div>
      <Link href="/connect" style={{
        padding: '12px 22px', borderRadius: 99, fontSize: 13, fontWeight: 600,
        background: 'var(--ink)', color: 'var(--bg)', textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
      }}>⚡ Connect now →</Link>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
        {sub && <span style={{ fontSize: 11.5, fontWeight: 600, color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink-2)' }}>{sub}</span>}
      </div>
    </div>
  );
}
