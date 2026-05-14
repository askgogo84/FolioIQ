'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Link from 'next/link';

const PREFERENCES = [
  { label: 'Risk Profile', value: 'Aggressive', desc: 'Equity-heavy · 12+ year horizon' },
  { label: 'Investment Style', value: 'Active + Index Mix', desc: '6 active funds · 1 index · 1 sectoral' },
  { label: 'Tax Bracket', value: '30% slab', desc: 'New regime · FY 2025-26' },
  { label: 'Goal Focus', value: 'Wealth Creation', desc: 'Long-term equity compounding' },
];

const SECTIONS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'security',    label: 'Security' },
  { key: 'plan',        label: 'Plan & Billing' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<string>('overview');
  const [editing, setEditing] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // editable user state — in a real app this would come from / sync to Supabase
  const [user, setUser] = useState({
    name: 'Aarav Sharma',
    email: 'aarav@folioiq.in',
    phone: '+91 ••••• 84210',
    pan: 'AAAPS1234K',
    dob: '1988-03-22',
    city: 'Bengaluru',
    risk: 'Aggressive',
    horizon: '12+ years',
  });
  const [draft, setDraft] = useState(user);

  const stats = [
    { label: 'YEARS INVESTING', value: '4.8', sub: '' },
    { label: 'TOTAL INVESTED', value: '₹35.20', unit: 'L', sub: '' },
    { label: 'FUNDS HELD', value: '8', sub: 'across 4 AMCs' },
    { label: 'XIRR', value: '18.4%', sub: 'lifetime', tone: 'up' as const },
  ];

  const initials = user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = () => {
    setUser(draft);
    setEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px' }}>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
            ACCOUNT
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(56px, 8vw, 110px)', lineHeight: 0.92, letterSpacing: '-0.04em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              Profile
            </h1>
            <button style={btnGhost}>↗ Share portfolio</button>
          </div>
          <div style={{ marginTop: 14, fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 720 }}>
            Personal details, risk profile, and the data that powers your portfolio intelligence.
          </div>
        </div>

        {/* Identity card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24,
          padding: 32, marginBottom: 24,
          display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{
            width: 124, height: 124, borderRadius: 22,
            background: 'linear-gradient(135deg, #0891b2, #1f6b50)',
            color: '#fff', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-serif)', fontSize: 52, letterSpacing: '-0.04em',
          }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>
              MEMBER SINCE · AUG 2021
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: 0.95, letterSpacing: '-0.03em', fontWeight: 400, margin: 0, color: 'var(--ink)' }}>
              {user.name}
            </h2>
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
              {user.email} · {user.phone}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              <Badge tone="up">✓ KYC verified</Badge>
              <Badge tone="brand">Plus member</Badge>
              <Badge tone="gold">{user.risk} risk</Badge>
              <Badge tone="violet">Top 18% returns</Badge>
            </div>
          </div>
          <button
            onClick={() => { setDraft(user); setEditing(true); }}
            style={btnPrimary}
          >
            ✎ Edit profile
          </button>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 22 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(38px, 4.5vw, 56px)', lineHeight: 1, letterSpacing: '-0.03em', color: s.tone === 'up' ? 'var(--up)' : 'var(--ink)' }}>{s.value}</span>
                {s.unit && <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{s.unit}</span>}
              </div>
              {s.sub && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8 }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setTab(s.key)} style={{
              padding: '12px 18px', fontSize: 13, fontWeight: 500,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: tab === s.key ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: tab === s.key ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: -1,
            }}>{s.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <Row href="/dashboard" title="Portfolio Overview" desc="View detailed analytics and performance" cta="Go to Dashboard →" />
            <Row href="/sips" title="SIP Tracker" desc="₹45,500/mo across 8 active plans" cta="View SIPs →" />
            <Row href="/goals" title="Goal Planner" desc="3 active goals · ₹4.2 Cr target" cta="Manage Goals →" />
            <Row href="/capital-gains" title="Tax Reports" desc="FY 2025-26 · Ready for ITR filing" cta="View Reports →" />
          </div>
        )}

        {tab === 'preferences' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {PREFERENCES.map((p, i) => (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 22 }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 8 }}>{p.value}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'security' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <Row title="Password" desc="Last changed 2 months ago" cta="Update →" />
            <Row title="Two-factor authentication" desc="✓ Enabled · Authenticator app" cta="Manage →" />
            <Row title="Active sessions" desc="2 devices · Bengaluru, IN" cta="View →" />
            <Row title="Login history" desc="Last 30 days · 47 logins" cta="View →" />
          </div>
        )}

        {tab === 'plan' && (
          <div style={{ background: 'linear-gradient(135deg, var(--brand-soft), var(--surface))', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>CURRENT PLAN</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Plus · ₹349/mo</h2>
            <div style={{ marginTop: 16, fontSize: 14, color: 'var(--ink-2)' }}>
              Unlimited Folio AI queries · CAS upload · Tax harvesting · Smart rebalance · Priority support.
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button style={btnPrimary}>Manage subscription</button>
              <button style={btnGhost}>View invoices</button>
            </div>
          </div>
        )}

      </div>

      {/* ── EDIT MODAL ───────────────────────────────────────────── */}
      {editing && (
        <div onClick={() => setEditing(false)} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(10, 10, 10, 0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'auto',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', borderRadius: 24, padding: 32,
            maxWidth: 540, width: '100%', maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
          }}>
            <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>EDIT PROFILE</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 38, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}>Your details</h2>
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-3)' }}>
              Updates sync to your KYC and tax reports.
            </div>

            <div style={{ marginTop: 24, display: 'grid', gap: 14 }}>
              <Field label="Full Name" value={draft.name}  onChange={v => setDraft({ ...draft, name: v })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Email"  value={draft.email} onChange={v => setDraft({ ...draft, email: v })} type="email" />
                <Field label="Phone"  value={draft.phone} onChange={v => setDraft({ ...draft, phone: v })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="PAN"  value={draft.pan} onChange={v => setDraft({ ...draft, pan: v.toUpperCase() })} />
                <Field label="Date of Birth"  value={draft.dob} onChange={v => setDraft({ ...draft, dob: v })} type="date" />
              </div>
              <Field label="City"  value={draft.city} onChange={v => setDraft({ ...draft, city: v })} />

              <div>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 8 }}>RISK PROFILE</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['Conservative', 'Moderate', 'Aggressive'].map(r => (
                    <button key={r} onClick={() => setDraft({ ...draft, risk: r })} style={{
                      padding: '12px', borderRadius: 12, fontSize: 12.5, fontWeight: 500,
                      background: draft.risk === r ? 'var(--brand-soft)' : 'transparent',
                      color: draft.risk === r ? 'var(--ink)' : 'var(--ink-2)',
                      border: '1.5px solid ' + (draft.risk === r ? 'var(--brand-2)' : 'var(--border)'),
                      cursor: 'pointer',
                    }}>{r}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={btnGhost}>Cancel</button>
              <button onClick={handleSave} style={btnPrimary}>✓ Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Saved toast */}
      {savedToast && (
        <div style={{
          position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: 'var(--bg)', padding: '12px 24px', borderRadius: 99,
          fontSize: 13, fontWeight: 500, zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'var(--brand-2)' }}>✓</span> Profile updated successfully
        </div>
      )}
    </AppLayout>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <input
        type={type || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 13.5,
          background: 'var(--bg)', color: 'var(--ink)',
          border: '1px solid var(--border)', outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'up' | 'brand' | 'gold' | 'violet' }) {
  const map = {
    up:     { bg: 'var(--up-soft)',    fg: 'var(--up)' },
    brand:  { bg: 'var(--brand-soft)', fg: 'var(--brand-2)' },
    gold:   { bg: '#f7e9c8',           fg: 'var(--gold)' },
    violet: { bg: '#e8e0fa',           fg: 'var(--violet)' },
  };
  const { bg, fg } = map[tone];
  return (
    <span style={{ padding: '5px 11px', borderRadius: 99, background: bg, color: fg, fontSize: 11.5, fontWeight: 600 }}>
      {children}
    </span>
  );
}

function Row({ href, title, desc, cta }: { href?: string; title: string; desc: string; cta: string }) {
  const content = (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
      padding: '18px 22px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
      textDecoration: 'none', cursor: href ? 'pointer' : 'default',
    }}>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{desc}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand-2)' }}>{cta}</div>
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
}

const btnGhost: React.CSSProperties = {
  padding: '10px 18px', borderRadius: 99, fontSize: 12.5, fontWeight: 500,
  background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--border)',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};

const btnPrimary: React.CSSProperties = {
  padding: '11px 20px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
  background: 'var(--ink)', color: 'var(--bg)', border: 'none',
  cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
};
