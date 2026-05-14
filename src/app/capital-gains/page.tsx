'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

// FY 25-26 tax data
const SUMMARY = {
  stcgGains: 1773,
  stcgLosses: 17565,
  ltcgGains: 117466,
  ltcgExempt: 125000,
  ltcgUsed: 104000,
  totalTax: 6231,
  taxSavings: 15655,
  daysToDeadline: 320,
  eligibleLots: 5,
  recommendedLots: 2,
};

const STCG = [
  { fund: 'ICICI Pru Technology',     cat: 'Sectoral', buy: '2024-11-15', sell: '2026-03-20', invested: 116200, proceeds: 100000, gain: -16200, type: 'STCL' },
  { fund: 'Nippon India Multi Cap',   cat: 'Multi Cap', buy: '2024-09-10', sell: '2026-03-20', invested: 100500, proceeds: 99135,  gain: -1365,  type: 'STCL' },
  { fund: 'Invesco India Smallcap',   cat: 'Small Cap', buy: '2024-12-05', sell: '2026-03-20', invested: 50000,  proceeds: 50926,  gain: 926,    type: 'STCG' },
  { fund: 'Mirae Asset Large & Mid',  cat: 'Large & Mid', buy: '2024-10-20', sell: '2026-03-20', invested: 50000,  proceeds: 50847,  gain: 847,    type: 'STCG' },
];

const LTCG = [
  { fund: 'Parag Parikh Flexi Cap',    cat: 'Flexi Cap', buy: '2021-03-15', sell: '2026-03-20', invested: 50000,  proceeds: 71715,  gain: 21715,  taxable: 0,     harvest: true },
  { fund: 'Nippon India Small Cap',    cat: 'Small Cap', buy: '2020-08-10', sell: '2026-03-20', invested: 50000,  proceeds: 95435,  gain: 45435,  taxable: 32935, harvest: true },
  { fund: 'Invesco India Gold ETF FoF', cat: 'Gold',     buy: '2022-01-20', sell: '2026-03-20', invested: 100000, proceeds: 139231, gain: 39231,  taxable: 26731, harvest: false },
  { fund: 'HDFC Flexi Cap Fund',       cat: 'Flexi Cap', buy: '2021-06-15', sell: '2026-03-20', invested: 50000,  proceeds: 59002,  gain: 9002,   taxable: 0,     harvest: false },
  { fund: 'PGIM India Flexi Cap',      cat: 'Flexi Cap', buy: '2022-04-10', sell: '2026-03-20', invested: 99358,  proceeds: 101441, gain: 2083,   taxable: 0,     harvest: false },
];

const fmtINR = (n: number) => '₹' + Math.abs(n).toLocaleString('en-IN');

export default function CapitalGainsPage() {
  const [tab, setTab] = useState<'summary' | 'stcg' | 'ltcg'>('summary');

  const ltcgPct = (SUMMARY.ltcgUsed / SUMMARY.ltcgExempt) * 100;

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* ── Headline ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            TAX · LTCG HARVESTING
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Pocket <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>₹{SUMMARY.taxSavings.toLocaleString('en-IN')}</em> in tax savings.
            </h1>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnGhost}>Learn how it works</button>
              <button style={btnPrimary}>🍃 Execute harvest</button>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 760 }}>
            Indian LTCG up to ₹1.25 L per year is tax-free. Folio AI scans your eligible lots, sells &amp; re-buys to reset cost basis tax-free — letting future gains compound from a higher base.
          </div>
        </div>

        {/* ── Stat row ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <BigStat
            label="LTCG HARVESTABLE"
            value={`₹${(SUMMARY.ltcgUsed / 100000).toFixed(2)} L`}
            sub="under ₹1.25 L exemption"
            highlight
          />
          <BigStat
            label="TAX SAVINGS"
            value={`₹${SUMMARY.taxSavings.toLocaleString('en-IN')}`}
            sub="at 10% LTCG rate"
          />
          <BigStat
            label="DEADLINE"
            value="Mar 31"
            sub={`${SUMMARY.daysToDeadline} days from today`}
          />
          <BigStat
            label="ELIGIBLE LOTS"
            value={`${SUMMARY.recommendedLots}/${SUMMARY.eligibleLots}`}
            sub="recommended for harvest"
          />
        </div>

        {/* ── Exemption usage bar ───────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500 }}>
              ANNUAL LTCG EXEMPTION · FY 25-26
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>
              ₹{SUMMARY.ltcgUsed.toLocaleString('en-IN')} of ₹{SUMMARY.ltcgExempt.toLocaleString('en-IN')}
            </div>
          </div>
          <div style={{ position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${ltcgPct}%`, background: 'linear-gradient(90deg, var(--up), var(--brand-2))', borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
            <span>₹0</span>
            <span style={{ color: 'var(--up)', fontWeight: 600 }}>{ltcgPct.toFixed(1)}% used</span>
            <span>₹1,25,000</span>
          </div>
        </div>

        {/* ── Save more CTA banner ──────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--up-soft), var(--surface))',
          border: '1px solid var(--border)', borderRadius: 18, padding: 22, marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--up)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Save ₹5,143 more with Tax Loss Harvesting</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 3 }}>Harvest your STCL losses to reduce tax liability. You have ₹17,565 in harvestable losses.</div>
            </div>
          </div>
          <button style={{ ...btnPrimary, background: 'var(--up)' }}>Harvest Now</button>
        </div>

        {/* ── Tab bar ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[
            { key: 'summary', label: 'Summary' },
            { key: 'stcg',    label: 'Short Term (STCG/STCL)' },
            { key: 'ltcg',    label: 'Long Term (LTCG)' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as 'summary' | 'stcg' | 'ltcg')} style={{
              padding: '10px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
              background: tab === t.key ? 'var(--ink)' : 'transparent',
              color: tab === t.key ? 'var(--bg)' : 'var(--ink-2)',
              border: '1px solid ' + (tab === t.key ? 'var(--ink)' : 'var(--border)'),
              cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── Summary tab ───────────────────────────────────────── */}
        {tab === 'summary' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            <Card title="Short Term Capital Gains" subtitle="Equity · Held < 1 year">
              <Line label="Total Gains" value={`+${fmtINR(SUMMARY.stcgGains)}`} tone="up" />
              <Line label="Total Losses" value={`−${fmtINR(SUMMARY.stcgLosses)}`} tone="down" />
              <Line label="Net Taxable" value="₹0" />
              <Line label="Tax @ 15% on net" value="₹0" highlight />
            </Card>
            <Card title="Long Term Capital Gains" subtitle="Equity · Held > 1 year">
              <Line label="Total Gains" value={`+${fmtINR(SUMMARY.ltcgGains)}`} tone="up" />
              <Line label="₹1.25 L Exemption" value={`−${fmtINR(SUMMARY.ltcgExempt)}`} />
              <Line label="Net Taxable" value={fmtINR(Math.max(0, SUMMARY.ltcgGains - SUMMARY.ltcgExempt))} />
              <Line label="Tax @ 10%" value={fmtINR(SUMMARY.totalTax)} highlight />
            </Card>
          </div>
        )}

        {/* ── STCG/STCL tab ─────────────────────────────────────── */}
        {tab === 'stcg' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <TableHeader cols={['Fund', 'Hold Period', 'Invested', 'Proceeds', 'Gain/Loss', 'Type']} />
            {STCG.map((r, i) => (
              <TableRow key={i} last={i === STCG.length - 1}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.fund}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.cat}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>{r.buy} → {r.sell}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>{fmtINR(r.invested)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{fmtINR(r.proceeds)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: r.gain >= 0 ? 'var(--up)' : 'var(--down)' }}>
                  {r.gain >= 0 ? '+' : '−'}{fmtINR(r.gain)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Pill tone={r.type === 'STCG' ? 'down' : 'up'}>{r.type}</Pill>
                </div>
              </TableRow>
            ))}
          </div>
        )}

        {/* ── LTCG tab ──────────────────────────────────────────── */}
        {tab === 'ltcg' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
            <TableHeader cols={['Fund', 'Hold Period', 'Invested', 'Proceeds', 'LTCG', 'Action']} />
            {LTCG.map((r, i) => (
              <TableRow key={i} last={i === LTCG.length - 1}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{r.fund}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{r.cat}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>{r.buy} → {r.sell}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>{fmtINR(r.invested)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{fmtINR(r.proceeds)}</div>
                <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--up)' }}>
                  +{fmtINR(r.gain)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {r.harvest
                    ? <Pill tone="up">Harvest</Pill>
                    : <Pill tone="muted">Hold</Pill>}
                </div>
              </TableRow>
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────
function BigStat({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? 'var(--brand-soft)' : 'var(--surface)',
      border: '1px solid var(--border)', borderRadius: 18, padding: 22,
    }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 4vw, 52px)', lineHeight: 1, letterSpacing: '-0.03em', color: highlight ? 'var(--up)' : 'var(--ink)' }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 10 }}>{sub}</div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3, marginBottom: 18 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function Line({ label, value, tone, highlight }: { label: string; value: string; tone?: 'up' | 'down'; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '10px 0',
      borderTop: highlight ? '1px solid var(--border)' : 'none',
      marginTop: highlight ? 8 : 0,
      paddingTop: highlight ? 14 : 10,
    }}>
      <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: highlight ? 600 : 400 }}>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: highlight ? 16 : 13,
        fontWeight: 600,
        color: tone === 'up' ? 'var(--up)' : tone === 'down' ? 'var(--down)' : 'var(--ink)',
      }}>{value}</span>
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 0.8fr',
      padding: '14px 24px', borderBottom: '1px solid var(--border)',
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500,
    }}>
      {cols.map((c, i) => (
        <div key={i} style={{ textAlign: i >= 2 ? 'right' : 'left' }}>{c}</div>
      ))}
    </div>
  );
}

function TableRow({ children, last }: { children: React.ReactNode; last: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 0.8fr',
      padding: '16px 24px', alignItems: 'center',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      {children}
    </div>
  );
}

function Pill({ children, tone }: { children: React.ReactNode; tone: 'up' | 'down' | 'muted' }) {
  const map = {
    up:    { bg: 'var(--up-soft)',   fg: 'var(--up)' },
    down:  { bg: 'var(--down-soft)', fg: 'var(--down)' },
    muted: { bg: 'var(--surface-2)', fg: 'var(--ink-3)' },
  };
  const { bg, fg } = map[tone];
  return <span style={{ padding: '4px 10px', borderRadius: 99, background: bg, color: fg, fontSize: 11, fontWeight: 600 }}>{children}</span>;
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
