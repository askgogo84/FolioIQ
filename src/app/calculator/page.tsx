'use client';
import { useState, useMemo } from 'react';
import AppLayout from '@/components/AppLayout';

const fmtINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtCr = (n: number) => n >= 10000000
  ? '₹' + (n / 10000000).toFixed(2) + ' Cr'
  : '₹' + (n / 100000).toFixed(2) + ' L';

export default function CalculatorPage() {
  const [monthly, setMonthly] = useState(15000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(12);
  const [stepUp, setStepUp] = useState(0); // % annual step-up

  const { invested, future, gain, year_by_year } = useMemo(() => {
    let bal = 0;
    let inv = 0;
    let sip = monthly;
    const r = rate / 100 / 12;
    const points: { year: number; invested: number; value: number }[] = [];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        bal = bal * (1 + r) + sip;
        inv += sip;
      }
      points.push({ year: y, invested: inv, value: bal });
      sip = sip * (1 + stepUp / 100);
    }
    return { invested: inv, future: bal, gain: bal - inv, year_by_year: points };
  }, [monthly, years, rate, stepUp]);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            PLANNING · SIP CALCULATOR
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            What if you invested <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>{fmtINR(monthly)}</em> a month?
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Model SIPs with monthly step-ups, varying return assumptions, and time horizons up to 30 years. The math is straightforward — what compounds isn&apos;t.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>

          {/* Controls */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 26 }}>
            <Slider
              label="MONTHLY SIP"
              value={monthly}
              onChange={setMonthly}
              min={500} max={200000} step={500}
              display={fmtINR(monthly)}
            />
            <Slider
              label="DURATION (YEARS)"
              value={years}
              onChange={setYears}
              min={1} max={40} step={1}
              display={`${years} years`}
            />
            <Slider
              label="EXPECTED ANNUAL RETURN"
              value={rate}
              onChange={setRate}
              min={4} max={20} step={0.5}
              display={`${rate}% CAGR`}
            />
            <Slider
              label="ANNUAL STEP-UP"
              value={stepUp}
              onChange={setStepUp}
              min={0} max={20} step={1}
              display={`${stepUp}% / year`}
            />

            <div style={{ marginTop: 26, padding: 16, background: 'var(--brand-soft)', borderRadius: 14, fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>Tip:</strong> A 10% annual step-up doubles your final corpus over 20 years compared to a flat SIP. Try it.
            </div>
          </div>

          {/* Result */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
              border: '1px solid var(--border)', borderRadius: 24, padding: 36, marginBottom: 18,
            }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>
                PROJECTED VALUE AT YEAR {years}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(60px, 9vw, 120px)', lineHeight: 0.92, letterSpacing: '-0.04em', color: 'var(--brand-2)' }}>
                {fmtCr(future)}
              </div>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                <Result label="YOU INVEST" value={fmtCr(invested)} sub={`${fmtINR(monthly)} × ${years * 12} months`} />
                <Result label="MARKET ADDS" value={fmtCr(gain)} sub={`${((gain / invested) * 100).toFixed(0)}% wealth gain`} tone="up" />
              </div>
            </div>

            {/* Growth chart */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>
                  YEAR-BY-YEAR GROWTH
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 11 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
                    <span style={{ width: 10, height: 10, background: 'var(--border-strong)', borderRadius: 3 }} /> Invested
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-3)' }}>
                    <span style={{ width: 10, height: 10, background: 'var(--brand-2)', borderRadius: 3 }} /> Value
                  </span>
                </div>
              </div>
              <Chart points={year_by_year} years={years} />
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

function Slider({ label, value, onChange, min, max, step, display }: {
  label: string; value: number; onChange: (n: number) => void;
  min: number; max: number; step: number; display: string;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--brand-2)' }}
      />
    </div>
  );
}

function Result({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'up' }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em', color: tone === 'up' ? 'var(--up)' : 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function Chart({ points, years }: { points: { year: number; invested: number; value: number }[]; years: number }) {
  const max = Math.max(...points.map(p => p.value));
  const w = 100, h = 100;
  const xStep = w / years;

  const valPath = points.map((p, i) => {
    const x = (i + 1) * xStep;
    const y = h - (p.value / max) * h * 0.9;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const invPath = points.map((p, i) => {
    const x = (i + 1) * xStep;
    const y = h - (p.invested / max) * h * 0.9;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaPath = valPath + ` L ${years * xStep} ${h} L ${xStep} ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: 240, display: 'block' }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-2)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#grad)" />
      <path d={invPath} fill="none" stroke="var(--border-strong)" strokeWidth="0.5" strokeDasharray="1.5,1" vectorEffect="non-scaling-stroke" />
      <path d={valPath} fill="none" stroke="var(--brand-2)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
