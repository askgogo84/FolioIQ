'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

type SIP = {
  id: string;
  fund: string;
  cat: string;
  amount: number;
  nextDate: string;
  status: 'active' | 'paused';
  logo: string;
  tone: string;
  startedMonths: number;
  totalInvested: number;
  currentValue: number;
};

const SIPS: SIP[] = [
  { id: 'ppfc', fund: 'Parag Parikh Flexi Cap',     cat: 'Flexi Cap', amount: 15000, nextDate: 'Jun 5',  status: 'active', logo: 'PP', tone: '#0f3d2e', startedMonths: 58, totalInvested: 870000, currentValue: 1124000 },
  { id: 'mira', fund: 'Mirae Asset Large Cap',      cat: 'Large Cap', amount: 10000, nextDate: 'Jun 7',  status: 'active', logo: 'MA', tone: '#c89a3a', startedMonths: 42, totalInvested: 420000, currentValue: 489000 },
  { id: 'axsm', fund: 'Axis Small Cap',             cat: 'Small Cap', amount: 8000,  nextDate: 'Jun 10', status: 'active', logo: 'AX', tone: '#c1392b', startedMonths: 36, totalInvested: 288000, currentValue: 392000 },
  { id: 'hdfc', fund: 'HDFC Mid-Cap Opportunities', cat: 'Mid Cap',   amount: 5000,  nextDate: 'Jun 12', status: 'active', logo: 'HD', tone: '#2952ff', startedMonths: 30, totalInvested: 150000, currentValue: 214000 },
  { id: 'icic', fund: 'ICICI Pru Nifty 50 Index',   cat: 'Index',     amount: 4000,  nextDate: 'Jun 15', status: 'active', logo: 'IC', tone: '#1f6b50', startedMonths: 24, totalInvested: 96000,  currentValue: 104000 },
  { id: 'sbib', fund: 'SBI Bluechip',               cat: 'Large Cap', amount: 2500,  nextDate: 'Jun 18', status: 'active', logo: 'SB', tone: '#0d4a7d', startedMonths: 48, totalInvested: 120000, currentValue: 161000 },
  { id: 'kotk', fund: 'Kotak Emerging Equity',      cat: 'Mid Cap',   amount: 1000,  nextDate: 'Jun 20', status: 'paused', logo: 'KE', tone: '#6b3fd4', startedMonths: 18, totalInvested: 18000,  currentValue: 19500 },
];

const fmtINR = (n: number) => '₹' + n.toLocaleString('en-IN');
const fmtL = (n: number) => '₹' + (n / 100000).toFixed(2) + ' L';

export default function SipsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'paused'>('all');

  const totalMonthly = SIPS.filter(s => s.status === 'active').reduce((s, x) => s + x.amount, 0);
  const totalInvested = SIPS.reduce((s, x) => s + x.totalInvested, 0);
  const totalValue = SIPS.reduce((s, x) => s + x.currentValue, 0);
  const totalGain = totalValue - totalInvested;
  const gainPct = (totalGain / totalInvested) * 100;

  const filtered = SIPS.filter(s => filter === 'all' || s.status === filter);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · SIPs
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>₹{(totalMonthly / 1000).toFixed(1)}K</em> compounding monthly.
            </h1>
            <button style={btnPrimary}>+ New SIP</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Your systematic plans, every contribution and every rupee they&apos;ve earned. Pause, modify, or top-up — Folio handles the mandate updates automatically.
          </div>
        </div>

        {/* Stats */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '24px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          <Stat label="MONTHLY OUTGO" value={fmtINR(totalMonthly)} sub={`${SIPS.filter(s => s.status === 'active').length} active plans`} />
          <Stat label="INVESTED LIFETIME" value={fmtL(totalInvested)} />
          <Stat label="CURRENT VALUE" value={fmtL(totalValue)} sub={`+${fmtL(totalGain)} gain`} tone="up" />
          <Stat label="SIP XIRR" value="17.2%" sub={`+${gainPct.toFixed(1)}% total`} tone="up" />
        </div>

        {/* Next billing strip */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
          border: '1px solid var(--border)', borderRadius: 18, padding: 22, marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>📅</div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>NEXT BILLING CYCLE</div>
              <div style={{ fontSize: 14.5, color: 'var(--ink)', marginTop: 4 }}>
                <strong>{SIPS.filter(s => s.status === 'active').length} SIPs</strong> totalling <strong>{fmtINR(totalMonthly)}</strong> · first deduction on <strong>Jun 5</strong>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Mandate: HDFC •••• 4210 · UPI Autopay</div>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {(['all', 'active', 'paused'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 500,
              background: filter === f ? 'var(--ink)' : 'transparent',
              color: filter === f ? 'var(--bg)' : 'var(--ink-2)',
              border: '1px solid ' + (filter === f ? 'var(--ink)' : 'var(--border)'),
              cursor: 'pointer', textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>

        {/* SIPs list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '2.5fr 0.9fr 1fr 1fr 1fr 0.9fr',
            padding: '14px 24px', borderBottom: '1px solid var(--border)',
            fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500,
          }}>
            <div>Fund</div>
            <div style={{ textAlign: 'right' }}>Amount</div>
            <div style={{ textAlign: 'right' }}>Invested</div>
            <div style={{ textAlign: 'right' }}>Value</div>
            <div style={{ textAlign: 'right' }}>Next</div>
            <div style={{ textAlign: 'right' }}>Status</div>
          </div>
          {filtered.map((s, i) => {
            const gain = ((s.currentValue - s.totalInvested) / s.totalInvested) * 100;
            return (
              <div key={s.id} style={{
                display: 'grid', gridTemplateColumns: '2.5fr 0.9fr 1fr 1fr 1fr 0.9fr',
                padding: '16px 24px', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: s.status === 'paused' ? 0.55 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: s.tone, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, letterSpacing: '-0.02em', flexShrink: 0,
                  }}>{s.logo}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{s.fund}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{s.cat} · {Math.floor(s.startedMonths / 12)}y {s.startedMonths % 12}m old</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                  {fmtINR(s.amount)}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-2)' }}>
                  {fmtL(s.totalInvested)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)', fontWeight: 600 }}>{fmtL(s.currentValue)}</div>
                  <div style={{ fontSize: 11, color: gain >= 0 ? 'var(--up)' : 'var(--down)', marginTop: 2 }}>
                    {gain >= 0 ? '+' : ''}{gain.toFixed(1)}%
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-2)' }}>{s.nextDate}</div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 10.5, fontWeight: 600,
                    background: s.status === 'active' ? 'var(--up-soft)' : 'var(--surface-2)',
                    color: s.status === 'active' ? 'var(--up)' : 'var(--ink-3)',
                    textTransform: 'capitalize',
                  }}>{s.status === 'active' ? '● Active' : '⏸ Paused'}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AppLayout>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: tone === 'up' ? 'var(--up)' : 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '11px 20px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
};
