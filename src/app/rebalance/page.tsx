'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

// Target vs current
const TARGET  = { Equity: 70, Debt: 10, Gold: 10, Hybrid: 10 };
const CURRENT = { Equity: 74.1, Debt: 4.0, Gold: 13.0, Hybrid: 8.0, Other: 0.9 };
const COLORS: Record<string, string> = {
  Equity: '#1f8a5b', Debt: '#2a6fdb', Gold: '#c89a3a', Hybrid: '#b87a3e', Other: '#8b8773',
};

type Action = {
  action: 'Sell' | 'Buy';
  fund: string;
  reason: string;
  amt: number;
  alternatives?: { name: string; amc: string; why: string }[];
};

const ACTIONS: Action[] = [
  {
    action: 'Sell',
    fund: 'Invesco Gold ETF FoF',
    reason: 'Gold over target by 3%. Book partial gains tax-free under ₹1.25 L exemption.',
    amt: 170000,
    alternatives: [
      { name: 'SBI Gold ETF',        amc: 'SBI',   why: '0.65% expense ratio vs 0.85% — same exposure, lower drag over 10 yrs.' },
      { name: 'Nippon India Gold BeES', amc: 'Nippon', why: 'India\'s largest gold ETF, tighter tracking error (0.18%).' },
    ],
  },
  {
    action: 'Buy',
    fund: 'SBI Low Duration Fund',
    reason: 'Debt underweight by 6pp. Add safety cushion before expected rate cut cycle.',
    amt: 330000,
  },
  {
    action: 'Sell',
    fund: 'ICICI Pru Technology',
    reason: 'Negative alpha −16% over 14 months. Sectoral concentration not paying off.',
    amt: 210000,
    alternatives: [
      { name: 'Axis Multicap Fund',      amc: 'Axis',  why: '+6.8% alpha, broader sector base, 0.6% lower TER. Captures tech upside without single-sector risk.' },
      { name: 'Parag Parikh Flexi Cap',  amc: 'PPFAS', why: 'Best-in-class consistency. 21.4% XIRR, lower beta (0.85). International tech exposure built-in.' },
    ],
  },
  {
    action: 'Buy',
    fund: 'Axis Multicap Fund',
    reason: 'Strong alpha +6.8%. Increase allocation to high-quality flexible mandate.',
    amt: 250000,
  },
];

export default function RebalancePage() {
  const [done, setDone] = useState<number[]>([]);
  const [expandedAlt, setExpandedAlt] = useState<number | null>(null);
  const [modal, setModal] = useState<'execute' | 'schedule' | 'success' | null>(null);
  const [scheduleFreq, setScheduleFreq] = useState<'monthly' | 'quarterly'>('monthly');

  const driftRows = Object.keys(TARGET).map(k => ({
    name: k,
    current: CURRENT[k as keyof typeof CURRENT] || 0,
    target: TARGET[k as keyof typeof TARGET] || 0,
    drift: (CURRENT[k as keyof typeof CURRENT] || 0) - (TARGET[k as keyof typeof TARGET] || 0),
  }));
  const totalDrift = driftRows.reduce((s, d) => s + Math.abs(d.drift), 0);
  const buys = ACTIONS.filter(a => a.action === 'Buy').reduce((s, a) => s + a.amt, 0);
  const sells = ACTIONS.filter(a => a.action === 'Sell').reduce((s, a) => s + a.amt, 0);
  const netBuy = buys - sells;

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            AI-DRIVEN ALLOCATION
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)', maxWidth: 820 }}>
              Drift detected. <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>Smart Rebalance</em> ready.
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal('schedule')} style={btnGhost}>📅 Schedule monthly</button>
              <button onClick={() => setModal('execute')} style={btnPrimary}>⇄ Execute rebalance</button>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            Folio AI continuously monitors your allocation. When it drifts past your tolerance, we suggest the smallest set of trades to bring it back — and offer 2 alternative funds for every sell.
          </div>
        </div>

        {/* Drift hero */}
        <div style={{ background: 'linear-gradient(135deg, #fde8e8 0%, var(--surface) 60%)', border: '1px solid var(--border)', borderRadius: 24, padding: 32, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ padding: '5px 12px', borderRadius: 99, background: 'var(--down-soft)', color: 'var(--down)', fontSize: 11.5, fontWeight: 600 }}>⚠ Drift +{totalDrift.toFixed(1)}pp</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Last rebalanced 4 months ago</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 32, alignItems: 'end' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              You&apos;re <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--down)', fontStyle: 'italic' }}>over-weight</em> small caps.
            </h2>
            <Metric label="CURRENT BETA"   value="0.96" sub="exposure to market" />
            <Metric label="AFTER REBALANCE" value="0.88" sub="−0.08 reduction" tone="up" />
            <Metric label="TAX IMPACT"     value="₹0" sub="harvest stays under exemption" tone="up" />
          </div>
          <div style={{ marginTop: 16, fontSize: 13.5, color: 'var(--ink-2)', maxWidth: 720, lineHeight: 1.55 }}>
            Small caps rallied 38% this year, pushing your allocation above target. Rebalancing now locks in gains and reduces drawdown risk.
          </div>
        </div>

        {/* Allocation comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>CURRENT VS TARGET</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {driftRows.map((d, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{d.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: Math.abs(d.drift) > 2 ? 'var(--down)' : 'var(--ink-2)' }}>
                      {d.current.toFixed(1)}% / {d.target}%
                      {Math.abs(d.drift) > 0.5 && <span style={{ marginLeft: 6, color: d.drift > 0 ? 'var(--down)' : 'var(--ink-3)' }}>
                        {d.drift > 0 ? '↑' : '↓'} {Math.abs(d.drift).toFixed(1)}pp
                      </span>}
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: 8, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${d.target}%`, background: 'var(--border-strong)', opacity: 0.3 }} />
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${d.current}%`, background: COLORS[d.name] || 'var(--ink-3)', borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>BALANCE SCORE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" width={130} height={130} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={totalDrift > 15 ? 'var(--down)' : totalDrift > 8 ? 'var(--gold)' : 'var(--up)'}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(1 - totalDrift / 40) * 264} 264`}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
                    {Math.round(100 - totalDrift * 2.5)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/ 100</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1, color: 'var(--ink)' }}>
                  {totalDrift > 15 ? 'Off-balance' : totalDrift > 8 ? 'Slight drift' : 'Well balanced'}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>
                  Your portfolio has drifted {totalDrift.toFixed(1)}pp from target. Rebalancing now would take ~5 minutes and brings beta to 0.88.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action plan */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>
                REBALANCE ACTION PLAN
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Execute in order · {done.length}/{ACTIONS.length} completed · Tap any Sell to see 2 alternative funds</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              Net: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: netBuy >= 0 ? 'var(--up)' : 'var(--down)' }}>
                {netBuy >= 0 ? 'Buy ' : 'Sell '} ₹{Math.abs(netBuy / 100000).toFixed(1)} L
              </span>
            </div>
          </div>
          {ACTIONS.map((a, i) => {
            const isDone = done.includes(i);
            const isExpanded = expandedAlt === i;
            const hasAlt = !!a.alternatives && a.alternatives.length > 0;
            return (
              <div key={i} style={{ borderBottom: i < ACTIONS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{
                  padding: '18px 24px',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', alignItems: 'center', gap: 16,
                  opacity: isDone ? 0.5 : 1,
                }}>
                  <button
                    onClick={() => setDone(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i])}
                    style={{
                      width: 22, height: 22, borderRadius: 7,
                      border: '1.5px solid ' + (isDone ? 'var(--ink)' : 'var(--border-strong)'),
                      background: isDone ? 'var(--ink)' : 'transparent',
                      color: isDone ? 'var(--bg)' : 'transparent',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{isDone ? '✓' : ''}</button>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 99, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                        background: a.action === 'Buy' ? 'var(--up-soft)' : 'var(--down-soft)',
                        color: a.action === 'Buy' ? 'var(--up)' : 'var(--down)',
                      }}>{a.action.toUpperCase()}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{a.fund}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{a.reason}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: a.action === 'Buy' ? 'var(--up)' : 'var(--down)' }}>
                    {a.action === 'Buy' ? '+' : '−'}₹{(a.amt / 100000).toFixed(1)} L
                  </div>
                  {hasAlt ? (
                    <button
                      onClick={() => setExpandedAlt(isExpanded ? null : i)}
                      style={{
                        padding: '6px 12px', borderRadius: 99, fontSize: 11.5, fontWeight: 500,
                        background: isExpanded ? 'var(--ink)' : 'transparent',
                        color: isExpanded ? 'var(--bg)' : 'var(--brand-2)',
                        border: '1px solid ' + (isExpanded ? 'var(--ink)' : 'var(--brand-2)'),
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}>
                      {isExpanded ? '× Hide' : '⇄ See 2 alternatives'}
                    </button>
                  ) : <span />}
                </div>

                {/* Alternatives expansion */}
                {isExpanded && hasAlt && (
                  <div style={{ padding: '0 24px 22px 60px', display: 'grid', gap: 10 }}>
                    <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>
                      INSTEAD OF SELLING THE PROCEEDS BACK, REDEPLOY TO:
                    </div>
                    {a.alternatives!.map((alt, j) => (
                      <div key={j} style={{
                        background: 'var(--brand-soft)', borderRadius: 14, padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9,
                          background: 'var(--brand-2)', color: 'var(--bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-serif)', fontSize: 16, flexShrink: 0,
                        }}>{j + 1}</div>
                        <div style={{ flex: 1, minWidth: 240 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{alt.name} <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 400 }}>· {alt.amc}</span></div>
                          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.5 }}>{alt.why}</div>
                        </div>
                        <button style={{
                          padding: '7px 14px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
                          background: 'var(--ink)', color: 'var(--bg)',
                          border: 'none', cursor: 'pointer',
                        }}>Buy this →</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* ── EXECUTE MODAL ────────────────────────────────────────── */}
      {modal === 'execute' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>CONFIRM REBALANCE</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Execute 4 trades?</h2>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Folio will place these orders via your linked broker. Equity trades execute at next available market price (T+1 for MFs). You can cancel within 15 minutes.
          </div>
          <div style={{ marginTop: 20, padding: 18, background: 'var(--surface-2)', borderRadius: 14, fontSize: 13 }}>
            <Row label="Total sells" value={`₹${(sells / 100000).toFixed(2)} L`} />
            <Row label="Total buys"  value={`₹${(buys / 100000).toFixed(2)} L`} />
            <Row label="Net cash flow" value={`${netBuy >= 0 ? 'Add' : 'Withdraw'} ₹${(Math.abs(netBuy) / 100000).toFixed(2)} L`} bold />
            <Row label="Est. tax impact" value="₹0 (within LTCG exemption)" tone="up" />
            <Row label="Linked broker" value="Groww · ●●●● 4210" />
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setModal(null)} style={btnGhost}>Cancel</button>
            <button onClick={() => setModal('success')} style={btnPrimary}>✓ Place orders</button>
          </div>
        </Modal>
      )}

      {modal === 'success' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: 'var(--up-soft)', color: 'var(--up)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)', textAlign: 'center' }}>Orders placed.</h2>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.6 }}>
            4 trades sent to Groww. You&apos;ll get confirmation emails as each fills. Reference: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>RB-{Date.now().toString(36).toUpperCase()}</span>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => setModal(null)} style={btnPrimary}>Done</button>
          </div>
        </Modal>
      )}

      {modal === 'schedule' && (
        <Modal onClose={() => setModal(null)}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>AUTO-REBALANCE</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Schedule rebalance</h2>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>
            Folio will automatically rebalance when drift exceeds 5pp, on your chosen frequency. You&apos;ll get a notification 24 hrs before each execution.
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            {(['monthly', 'quarterly'] as const).map(f => (
              <button key={f} onClick={() => setScheduleFreq(f)} style={{
                flex: 1, padding: '14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                background: scheduleFreq === f ? 'var(--brand-soft)' : 'transparent',
                color: scheduleFreq === f ? 'var(--ink)' : 'var(--ink-2)',
                border: '1.5px solid ' + (scheduleFreq === f ? 'var(--brand-2)' : 'var(--border)'),
                cursor: 'pointer', textTransform: 'capitalize',
              }}>{f}</button>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setModal(null)} style={btnGhost}>Cancel</button>
            <button onClick={() => setModal('success')} style={btnPrimary}>✓ Activate</button>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10, 10, 10, 0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: 24, padding: 32,
        maxWidth: 480, width: '100%',
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
      }}>{children}</div>
    </div>
  );
}

function Row({ label, value, bold, tone }: { label: string; value: string; bold?: boolean; tone?: 'up' | 'down' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontWeight: bold ? 700 : 500,
        color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)',
      }}>{value}</span>
    </div>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'up' | 'down' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 4vw, 48px)', lineHeight: 1, letterSpacing: '-0.03em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

const btnGhost: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
  background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)',
  cursor: 'pointer',
};

const btnPrimary: React.CSSProperties = {
  padding: '11px 20px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
};
