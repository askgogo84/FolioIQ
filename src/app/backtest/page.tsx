'use client';
import { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';

type Period = '1Y' | '3Y' | '5Y' | '10Y';

// Synthetic monthly returns (slightly noisy) for: portfolio vs nifty vs sensex
function genReturns(months: number, mean: number, vol: number, seed: number) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const out: number[] = [];
  for (let i = 0; i < months; i++) {
    // approximate normal via 2 uniforms
    const u = rand() + rand() - 1;
    out.push(mean / 12 + vol / Math.sqrt(12) * u);
  }
  return out;
}

const PERIODS: Record<Period, number> = { '1Y': 12, '3Y': 36, '5Y': 60, '10Y': 120 };

function compound(monthlyReturns: number[], invest: number) {
  let v = invest;
  const path = [v];
  for (const r of monthlyReturns) {
    v = v * (1 + r);
    path.push(v);
  }
  return path;
}

export default function BacktestPage() {
  const [period, setPeriod] = useState<Period>('5Y');
  const [invest, setInvest] = useState(1000000);

  const data = useMemo(() => {
    const m = PERIODS[period];
    const port = genReturns(m, 0.184, 0.18, 42);   // 18.4% CAGR / 18% vol
    const nfty = genReturns(m, 0.114, 0.16, 7);    // 11.4% CAGR / 16% vol
    const sens = genReturns(m, 0.118, 0.155, 99);  // 11.8% / 15.5%
    return {
      port: compound(port, invest),
      nfty: compound(nfty, invest),
      sens: compound(sens, invest),
    };
  }, [period, invest]);

  const final = {
    port: data.port[data.port.length - 1],
    nfty: data.nfty[data.nfty.length - 1],
    sens: data.sens[data.sens.length - 1],
  };

  const cagr = (final: number, start: number, months: number) =>
    (Math.pow(final / start, 12 / months) - 1) * 100;

  const months = PERIODS[period];

  // Max drawdown of portfolio
  let peak = data.port[0];
  let maxDD = 0;
  for (const v of data.port) {
    peak = Math.max(peak, v);
    maxDD = Math.min(maxDD, (v - peak) / peak);
  }

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · BACKTESTING
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            How would <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>your portfolio</em> have done?
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            Replay your current allocation across actual market history. Compare against Nifty 50 and Sensex benchmarks, see max drawdowns, and stress-test against crisis windows.
          </div>
        </div>

        {/* Controls */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22,
          marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {(Object.keys(PERIODS) as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                padding: '9px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
                background: period === p ? 'var(--ink)' : 'transparent',
                color: period === p ? 'var(--bg)' : 'var(--ink-2)',
                border: '1px solid ' + (period === p ? 'var(--ink)' : 'var(--border)'),
                cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>INITIAL INVESTMENT</span>
            <select
              value={invest}
              onChange={e => setInvest(parseInt(e.target.value))}
              style={{
                padding: '8px 12px', borderRadius: 10, fontSize: 13,
                background: 'var(--surface-2)', color: 'var(--ink)',
                border: '1px solid var(--border)', cursor: 'pointer',
              }}>
              <option value={100000}>₹1 L</option>
              <option value={500000}>₹5 L</option>
              <option value={1000000}>₹10 L</option>
              <option value={2500000}>₹25 L</option>
              <option value={5000000}>₹50 L</option>
              <option value={10000000}>₹1 Cr</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 4 }}>
                GROWTH OF ₹{(invest / 100000).toFixed(0)} L · {period}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 38, lineHeight: 1, color: 'var(--brand-2)' }}>
                ₹{(final.port / 100000).toFixed(1)} L final
              </div>
            </div>
            <div style={{ display: 'flex', gap: 18, fontSize: 11 }}>
              <Legend color="var(--brand-2)" label="Your portfolio" />
              <Legend color="var(--ink-2)" label="Nifty 50" />
              <Legend color="var(--ink-3)" label="Sensex" />
            </div>
          </div>
          <LineChart
            series={[
              { values: data.port, color: 'var(--brand-2)', width: 1.0 },
              { values: data.nfty, color: 'var(--ink-2)',   width: 0.6, dashed: true },
              { values: data.sens, color: 'var(--ink-3)',   width: 0.6, dashed: true },
            ]}
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <Stat label="YOUR CAGR" value={`${cagr(final.port, invest, months).toFixed(2)}%`} tone="up" />
          <Stat label="VS NIFTY" value={`+${(cagr(final.port, invest, months) - cagr(final.nfty, invest, months)).toFixed(2)} pp`} tone="up" />
          <Stat label="MAX DRAWDOWN" value={`${(maxDD * 100).toFixed(1)}%`} tone="down" />
          <Stat label="FINAL VALUE" value={`₹${(final.port / 100000).toFixed(1)} L`} sub={`+₹${((final.port - invest) / 100000).toFixed(1)} L gain`} />
        </div>

        {/* Stress scenarios */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)', marginBottom: 6 }}>
            Stress scenarios
          </h3>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>How your current portfolio would behave in historical crisis windows.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { name: '2008 GFC',        loss: -42.3, dur: '14 months', recover: '23 months' },
              { name: '2020 COVID crash', loss: -28.7, dur: '2 months',  recover: '6 months'  },
              { name: '2022 Tech rout',   loss: -19.4, dur: '8 months',  recover: '11 months' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 20, background: 'var(--surface-2)', borderRadius: 14 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{s.name}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, color: 'var(--down)', letterSpacing: '-0.02em' }}>
                  {s.loss.toFixed(1)}%
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8 }}>Peak-to-trough: {s.dur} · Recovery: {s.recover}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)' }}>
      <span style={{ width: 14, height: 2, background: color, borderRadius: 99 }} /> {label}
    </span>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'up' | 'down' }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1, letterSpacing: '-0.03em', color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function LineChart({ series }: { series: { values: number[]; color: string; width: number; dashed?: boolean }[] }) {
  const max = Math.max(...series.flatMap(s => s.values));
  const min = Math.min(...series.flatMap(s => s.values));
  const range = max - min || 1;
  const w = 100, h = 100;
  const len = series[0].values.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 280, display: 'block' }}>
      {series.map((s, idx) => {
        const path = s.values.map((v, i) => {
          const x = (i / (len - 1)) * w;
          const y = h - ((v - min) / range) * h * 0.92 - h * 0.04;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        return (
          <path key={idx} d={path} fill="none" stroke={s.color}
            strokeWidth={s.width} strokeDasharray={s.dashed ? '1.5,1' : undefined}
            vectorEffect="non-scaling-stroke" />
        );
      })}
    </svg>
  );
}
