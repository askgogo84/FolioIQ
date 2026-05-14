'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';

const BROKERS = [
  { id: 'zerodha',  name: 'Zerodha',  tag: 'Coin · MF', tone: '#387ed1', logo: 'Z', connected: false, type: 'broker' },
  { id: 'groww',    name: 'Groww',    tag: 'MF · Stocks', tone: '#00c899', logo: 'G', connected: true,  type: 'broker' },
  { id: 'kuvera',   name: 'Kuvera',   tag: 'Direct MF',   tone: '#7b3aed', logo: 'K', connected: false, type: 'broker' },
  { id: 'paytm',    name: 'Paytm Money', tag: 'Stocks · MF', tone: '#00b9f1', logo: 'P', connected: false, type: 'broker' },
  { id: 'icici',    name: 'ICICI Direct', tag: 'Full Service', tone: '#a51c30', logo: 'IC', connected: false, type: 'broker' },
  { id: 'upstox',   name: 'Upstox',   tag: 'Discount', tone: '#7c4dff', logo: 'U', connected: false, type: 'broker' },
];

const AAS = [
  { id: 'onemoney', name: 'OneMoney',  desc: 'RBI-licensed AA · 11 banks',  tone: '#0f3d2e', logo: 'OM' },
  { id: 'finvu',    name: 'Finvu',     desc: 'RBI-licensed AA · 14 banks',  tone: '#c89a3a', logo: 'FV' },
  { id: 'cams',     name: 'CAMS FinServ', desc: 'RBI-licensed AA · MF + Banks', tone: '#1f6b50', logo: 'CA' },
];

export default function ConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null);

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* ── Headline ──────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ⚡ AUTO-CONNECT · ACCOUNT AGGREGATOR
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
            Skip the upload. <em style={{ fontFamily: 'var(--font-serif)', color: 'var(--brand-2)', fontStyle: 'italic' }}>Sync everything.</em>
          </h1>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Link your brokers and demat through India&apos;s RBI-licensed Account Aggregator network. Read-only, consent-based, revocable in one tap. No screen scraping. No password sharing.
          </div>
        </div>

        {/* ── Status banner ─────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))',
          border: '1px solid var(--border)', borderRadius: 20, padding: 24,
          marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>CURRENT STATUS</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              1 broker connected · <span style={{ color: 'var(--up)' }}>auto-sync on</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
              Last sync: 4 minutes ago · Next: in 2 hours · Frequency: every 4 hours
            </div>
          </div>
          <button style={btnPrimary}>Sync now</button>
        </div>

        {/* ── Brokers ───────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Brokers & platforms</h2>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>6 supported</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {BROKERS.map(b => (
              <div key={b.id} style={{
                background: 'var(--surface)', border: '1px solid ' + (b.connected ? 'var(--up)' : 'var(--border)'),
                borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden',
              }}>
                {b.connected && (
                  <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, color: 'var(--up)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>● Connected</div>
                )}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: b.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em',
                }}>{b.logo}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{b.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 16 }}>{b.tag}</div>
                <button
                  onClick={() => setConnecting(b.id)}
                  disabled={b.connected}
                  style={{
                    width: '100%', padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    background: b.connected ? 'transparent' : 'var(--ink)',
                    color: b.connected ? 'var(--ink-3)' : 'var(--bg)',
                    border: '1px solid ' + (b.connected ? 'var(--border)' : 'var(--ink)'),
                    cursor: b.connected ? 'default' : 'pointer',
                  }}>
                  {b.connected ? 'Manage' : (connecting === b.id ? 'Opening AA…' : 'Connect')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Account Aggregators ───────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Account Aggregators</h2>
            <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>RBI-licensed</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {AAS.map(a => (
              <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: a.tone, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: '-0.02em',
                }}>{a.logo}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 16 }}>{a.desc}</div>
                <button style={{ ...btnGhost, width: '100%' }}>Connect via {a.name}</button>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ──────────────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)', marginBottom: 18 }}>How Auto-Connect works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { n: '01', t: 'Pick your AA', d: 'Choose any RBI-licensed Account Aggregator.' },
              { n: '02', t: 'Verify with bank', d: 'Authorise via your registered mobile number.' },
              { n: '03', t: 'Grant consent',  d: 'Select read-only access for 1–12 months.' },
              { n: '04', t: 'Auto-sync',       d: 'We pull data every 4 hours. Revoke anytime.' },
            ].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--brand-2)', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.n}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginTop: 8 }}>{s.t}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}

const btnGhost: React.CSSProperties = {
  padding: '9px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
  background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)',
  cursor: 'pointer',
};

const btnPrimary: React.CSSProperties = {
  padding: '11px 22px', borderRadius: 99, fontSize: 13, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none', cursor: 'pointer',
};
