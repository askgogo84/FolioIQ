'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

type Goal = {
  id: string;
  title: string;
  emoji: string;
  target: number;
  current: number;
  monthlySIP: number;
  targetYear: number;
  expectedReturn: number; // % CAGR
  tone: string;
};

const GOALS: Goal[] = [
  { id: 'ret',  title: 'Retirement Corpus',     emoji: '🌅', target: 30000000, current: 4847000, monthlySIP: 25000, targetYear: 2042, expectedReturn: 12, tone: '#0f3d2e' },
  { id: 'kid',  title: 'Kid\'s Higher Education', emoji: '🎓', target: 8000000,  current: 1240000, monthlySIP: 15000, targetYear: 2035, expectedReturn: 11, tone: '#c89a3a' },
  { id: 'home', title: 'Second Home (Bengaluru)', emoji: '🏡', target: 12000000, current: 2100000, monthlySIP: 8000,  targetYear: 2032, expectedReturn: 10, tone: '#2952ff' },
  { id: 'car',  title: 'Dream Car',              emoji: '🚗', target: 2500000,  current: 480000,  monthlySIP: 5000,  targetYear: 2028, expectedReturn: 9,  tone: '#c1392b' },
];

const fmtL = (n: number) => '₹' + (n / 100000).toFixed(1) + ' L';
const fmtCr = (n: number) => n >= 10000000 ? '₹' + (n / 10000000).toFixed(2) + ' Cr' : fmtL(n);

// Projected value: FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r * (1+r)  (monthly compounding)
function projectValue(g: Goal): number {
  const years = g.targetYear - new Date().getFullYear();
  const r = g.expectedReturn / 100 / 12;
  const n = years * 12;
  const fvCurrent = g.current * Math.pow(1 + r, n);
  const fvSIP = g.monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return fvCurrent + fvSIP;
}

export default function GoalsPage() {
  const [selected, setSelected] = useState<string>(GOALS[0].id);
  const active = GOALS.find(g => g.id === selected) || GOALS[0];

  const totalTarget = GOALS.reduce((s, g) => s + g.target, 0);
  const totalCurrent = GOALS.reduce((s, g) => s + g.current, 0);
  const totalSIP = GOALS.reduce((s, g) => s + g.monthlySIP, 0);
  const projected = projectValue(active);
  const onTrack = projected >= active.target;
  const yearsLeft = active.targetYear - new Date().getFullYear();

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · GOALS
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Four lives, <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>one portfolio</em>.
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Every ₹ in your portfolio is working toward something specific. Track progress, adjust SIPs, and see whether you&apos;re on pace — for each life event independently.
          </div>
        </div>

        {/* Summary row */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20,
          padding: '24px 28px', marginBottom: 28,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }}>
          <Stat label="TOTAL TARGET"    value={fmtCr(totalTarget)} />
          <Stat label="ACCUMULATED"     value={fmtL(totalCurrent)} sub={`${((totalCurrent / totalTarget) * 100).toFixed(1)}% complete`} tone="up" />
          <Stat label="MONTHLY SIP"     value={'₹' + totalSIP.toLocaleString('en-IN')} sub="across 4 goals" />
          <Stat label="ACTIVE GOALS"    value={GOALS.length.toString()} sub="next: Dream Car · 2028" />
        </div>

        {/* Goal switcher pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {GOALS.map(g => (
            <button key={g.id} onClick={() => setSelected(g.id)} style={{
              padding: '10px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
              background: selected === g.id ? 'var(--ink)' : 'transparent',
              color: selected === g.id ? 'var(--bg)' : 'var(--ink-2)',
              border: '1px solid ' + (selected === g.id ? 'var(--ink)' : 'var(--border)'),
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
            }}>
              <span>{g.emoji}</span> {g.title}
            </button>
          ))}
        </div>

        {/* Active goal detail */}
        <div style={{
          background: `linear-gradient(135deg, ${onTrack ? 'var(--up-soft)' : 'var(--down-soft)'} 0%, var(--surface) 60%)`,
          border: '1px solid var(--border)', borderRadius: 24, padding: 36, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 36 }}>{active.emoji}</span>
            <div>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>GOAL · {active.targetYear} · {yearsLeft} years out</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1, letterSpacing: '-0.02em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
                {active.title}
              </h2>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 28 }}>
            <Metric label="TARGET"           value={fmtCr(active.target)} />
            <Metric label="TODAY"            value={fmtL(active.current)} sub={`${((active.current / active.target) * 100).toFixed(1)}% there`} />
            <Metric label="MONTHLY SIP"      value={`₹${active.monthlySIP.toLocaleString('en-IN')}`} sub={`${active.expectedReturn}% expected CAGR`} />
            <Metric
              label="PROJECTED AT GOAL"
              value={fmtCr(projected)}
              sub={onTrack ? `+${fmtCr(projected - active.target)} surplus` : `${fmtCr(active.target - projected)} short`}
              tone={onTrack ? 'up' : 'down'}
            />
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Progress toward target</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
                {fmtL(active.current)} / {fmtCr(active.target)}
              </span>
            </div>
            <div style={{ position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${Math.min(100, (active.current / active.target) * 100)}%`,
                background: `linear-gradient(90deg, ${active.tone}, var(--brand-2))`,
                borderRadius: 99,
              }} />
            </div>
          </div>

          {!onTrack && (
            <div style={{
              marginTop: 22, padding: 18, borderRadius: 14,
              background: 'var(--down-soft)', border: '1px solid var(--down)',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', flex: 1, minWidth: 220 }}>
                <strong>Off pace.</strong> At your current SIP, you&apos;ll reach roughly {fmtCr(projected)} by {active.targetYear} — a shortfall of {fmtCr(active.target - projected)}.
                Bump SIP to <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{Math.ceil(active.monthlySIP * (active.target / projected) / 500) * 500}</span>/mo to get back on track.
              </div>
              <button style={btnPrimary}>Increase SIP</button>
            </div>
          )}

          {onTrack && (
            <div style={{
              marginTop: 22, padding: 18, borderRadius: 14,
              background: 'var(--up-soft)', border: '1px solid var(--up)',
              fontSize: 13.5, color: 'var(--ink)',
            }}>
              <strong>On track.</strong> At your current SIP, you&apos;ll comfortably cross the target with a surplus of {fmtCr(projected - active.target)}.
            </div>
          )}
        </div>

        {/* All goals list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>ALL GOALS</div>
          </div>
          {GOALS.map((g, i) => {
            const pct = (g.current / g.target) * 100;
            return (
              <div key={g.id} onClick={() => setSelected(g.id)} style={{
                padding: '18px 24px', cursor: 'pointer',
                borderBottom: i < GOALS.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'grid', gridTemplateColumns: '36px 2fr 1.5fr 1fr 1fr', alignItems: 'center', gap: 16,
                background: selected === g.id ? 'var(--surface-2)' : 'transparent',
              }}>
                <span style={{ fontSize: 22 }}>{g.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{g.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>by {g.targetYear} · ₹{g.monthlySIP.toLocaleString('en-IN')}/mo SIP</div>
                </div>
                <div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: g.tone, borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>{pct.toFixed(1)}%</div>
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>
                  {fmtL(g.current)}
                </div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
                  {fmtCr(g.target)}
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
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 3.5vw, 44px)', lineHeight: 1, letterSpacing: '-0.03em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
};
