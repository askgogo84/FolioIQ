'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/utils/supabase/client';

const CAS_SOURCES = [
  { id: 'cams', logo: 'CA', tone: '#c1392b', label: 'Request from CAMS',         url: 'https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement' },
  { id: 'kfin', logo: 'KF', tone: '#1f6b50', label: 'Request from KFintech',     url: 'https://mfs.kfintech.com/investor/General/ConsolidatedAccountStatement' },
  { id: 'nsdl', logo: 'NS', tone: '#2952ff', label: 'Request from NSDL (e-CAS)', url: 'https://eservices.nsdl.com/AccStatement/ConsolidatedAccountStatment.html' },
];

const NJ_STEPS = [
  { n: '01', t: 'Login to NJ Wealth',     d: 'Go to njindiaonline.in and log in.' },
  { n: '02', t: 'Open Valuation Report',  d: 'Consolidated → Valuation Report → set your date filter.' },
  { n: '03', t: 'Save as PDF',            d: 'Click "Mail Back" (PDF arrives in email) OR use browser Print → Save as PDF.' },
  { n: '04', t: 'Upload below',           d: 'Drop the PDF here — we auto-detect NJ format and parse all funds.' },
];

export default function UploadCASPage() {
  const router   = useRouter();
  const casRef   = useRef<HTMLInputElement>(null);
  const njRef    = useRef<HTMLInputElement>(null);

  const [tab,        setTab]       = useState<'cas' | 'nj'>('cas');
  const [casFile,    setCasFile]   = useState<File | null>(null);
  const [njFile,     setNjFile]    = useState<File | null>(null);
  const [dragActive, setDragActive]= useState(false);
  const [uploading,  setUploading] = useState(false);
  const [status,     setStatus]    = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userId,     setUserId]    = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
  }, []);

  const pickFile = (f: File | null, isCas: boolean) => {
    if (!f) return;
    isCas ? setCasFile(f) : setNjFile(f);
    setStatus(null);
  };

  const handleDrop = useCallback((e: React.DragEvent, isCas: boolean) => {
    e.preventDefault(); setDragActive(false);
    pickFile(e.dataTransfer.files[0] ?? null, isCas);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upload = async () => {
    const file = tab === 'cas' ? casFile : njFile;
    if (!file)   { setStatus({ type: 'error', message: 'Please select a file first.' }); return; }
    if (!userId) { setStatus({ type: 'error', message: 'Please sign in first.' }); return; }

    setUploading(true); setStatus(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('userId', userId);
      const res  = await fetch(tab === 'nj' ? '/api/upload/nj' : '/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && (data.success || data.fundsCount)) {
        const count = data.fundCount ?? data.fundsCount ?? '?';
        const val   = data.totalValue ? ` · ₹${(data.totalValue / 100000).toFixed(2)} L current` : '';
        setStatus({ type: 'success', message: `✓ ${count} funds imported${val}. Going to dashboard…` });
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Upload failed. Please try again.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' });
    } finally {
      setUploading(false);
    }
  };

  const active = tab === 'cas' ? casFile : njFile;
  const isCas  = tab === 'cas';

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>IMPORT</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,5.5vw,80px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 400, margin: '0 0 14px', color: 'var(--ink)' }}>
            Bring your <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>entire</em> portfolio<br />in 30 seconds.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 580, margin: 0 }}>
            CAS from CAMS/KFintech, or your NJ Wealth valuation report — we parse everything automatically.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, maxWidth: 680 }}>
          {[
            { key: 'cas', icon: '📄', label: 'CAS Statement',      sub: 'CAMS · KFintech · NSDL', color: 'var(--brand)' },
            { key: 'nj',  icon: '🏢', label: 'NJ Wealth Report',   sub: 'Valuation PDF or Excel', color: '#c1392b'      },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as 'cas' | 'nj'); setStatus(null); }} style={{
              padding: '18px 20px', borderRadius: 18, cursor: 'pointer', textAlign: 'left',
              background: tab === t.key ? 'var(--ink)' : 'var(--surface)',
              color:      tab === t.key ? 'var(--bg)' : 'var(--ink)',
              border:    `1.5px solid ${tab === t.key ? 'var(--ink)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 11.5, opacity: 0.6 }}>{t.sub}</div>
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>

          {/* Drop zone */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, overflow: 'hidden' }}>

            <div
              onClick={() => (isCas ? casRef : njRef).current?.click()}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => handleDrop(e, isCas)}
              style={{
                padding: '44px 36px', textAlign: 'center', cursor: 'pointer',
                borderBottom: `1px dashed ${dragActive ? 'var(--brand)' : 'var(--border-strong)'}`,
                background: dragActive ? 'color-mix(in oklab, var(--brand) 6%, var(--surface-2))' : 'var(--surface-2)',
                transition: 'all .15s',
              }}>

              <div style={{
                width: 88, height: 88, borderRadius: 24,
                background: isCas ? 'var(--brand)' : '#c1392b',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: `0 0 40px -8px ${isCas ? 'color-mix(in oklab, var(--brand) 60%, transparent)' : 'rgba(193,57,43,0.4)'}`,
              }}>
                {isCas
                  ? <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--bg-deep)" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  : <span style={{ fontFamily: 'var(--font-serif)', fontSize: 34, color: '#fff', fontWeight: 400, letterSpacing: '-0.02em' }}>NJ</span>
                }
              </div>

              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px,3vw,38px)', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 10, color: 'var(--ink)' }}>
                {isCas ? 'Drop your CAS PDF here' : 'Drop your NJ Wealth PDF here'}
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 22 }}>
                {isCas
                  ? 'CAMS · KFintech · NSDL — any CAS format'
                  : 'Valuation Report PDF — downloaded from NJ portal or emailed to you'}
              </div>

              <input ref={casRef} type="file" accept=".pdf"            style={{ display: 'none' }} onChange={e => pickFile(e.target.files?.[0] ?? null, true)}  />
              <input ref={njRef}  type="file" accept=".pdf,.xls,.xlsx" style={{ display: 'none' }} onChange={e => pickFile(e.target.files?.[0] ?? null, false)} />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={e => { e.stopPropagation(); (isCas ? casRef : njRef).current?.click(); }} style={{
                  padding: '11px 22px', borderRadius: 99, background: 'var(--ink)', color: 'var(--bg)',
                  border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                }}>Browse files</button>
                <button onClick={e => { e.stopPropagation(); isCas ? setCasFile(null) : setNjFile(null); setStatus(null); }} style={{
                  padding: '11px 22px', borderRadius: 99, background: 'transparent', color: 'var(--ink-2)',
                  border: '1px solid var(--border)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                }}>Clear</button>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-4)' }}>
                {isCas ? 'PDF only · Max 10 MB' : 'PDF or Excel (.xls/.xlsx) · Max 10 MB'}
              </div>
            </div>

            {/* Selected file */}
            {active && (
              <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6"/></svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{(active.size / 1024).toFixed(1)} KB · ready to upload</div>
                </div>
                <button onClick={() => isCas ? setCasFile(null) : setNjFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            {/* Upload button */}
            <div style={{ padding: '18px 22px' }}>
              <button onClick={upload} disabled={uploading || !active} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', padding: '14px', borderRadius: 14,
                background: active ? (isCas ? 'var(--brand)' : '#c1392b') : 'var(--surface-2)',
                color:  active ? (isCas ? 'var(--bg-deep)' : '#fff') : 'var(--ink-3)',
                border: 'none', fontSize: 14.5, fontWeight: 600,
                cursor: active && !uploading ? 'pointer' : 'not-allowed',
                opacity: uploading ? 0.7 : 1, transition: 'all .15s',
              }}>
                {uploading
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Parsing portfolio…</>
                  : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                     {isCas ? 'Upload CAS & Analyze' : 'Upload NJ Report & Analyze'}</>
                }
              </button>

              {status && (
                <div style={{
                  marginTop: 10, padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500,
                  background: status.type === 'success' ? 'var(--up-soft)' : 'var(--down-soft)',
                  color:      status.type === 'success' ? 'var(--up)' : 'var(--down)',
                  border: `1px solid ${status.type === 'success' ? 'color-mix(in oklab,var(--up) 30%,transparent)' : 'color-mix(in oklab,var(--down) 30%,transparent)'}`,
                }}>{status.message}</div>
              )}
              <p style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', marginTop: 10 }}>
                🔒 End-to-end encrypted · Read-only · Never shared
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isCas ? (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>GET YOUR CAS</div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 16, color: 'var(--ink)' }}>Email yourself the statement</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {CAS_SOURCES.map(src => (
                      <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12,
                        border: '1px solid var(--border)', background: 'var(--surface-2)', textDecoration: 'none',
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: src.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: '#fff', flexShrink: 0 }}>{src.logo}</div>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{src.label}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                      </a>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>HOW IT WORKS</div>
                  {[
                    { n:'01', t:'Request CAS', d:'2 minutes via CAMS or KFintech. Free, arrives by email.' },
                    { n:'02', t:'Drop it here', d:'We parse every fund, folio, and NAV.' },
                    { n:'03', t:'Dashboard ready', d:'XIRR, tax savings, rebalance plan — instantly.' },
                  ].map((s,i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 14 : 0 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--brand)', opacity: 0.5, flexShrink: 0, width: 28, lineHeight: 1 }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: 'var(--ink)' }}>{s.t}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>HOW TO GET THE PDF FROM NJ</div>
                  {NJ_STEPS.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < NJ_STEPS.length - 1 ? 14 : 0 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: '#c1392b', opacity: 0.6, flexShrink: 0, width: 28, lineHeight: 1 }}>{s.n}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: 'var(--ink)' }}>{s.t}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                  <a href="https://njindiaonline.in" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginTop: 18, padding: '11px', borderRadius: 12,
                    background: '#c1392b', color: '#fff',
                    textDecoration: 'none', fontSize: 13, fontWeight: 600,
                  }}>Open NJ Wealth portal →</a>
                </div>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24, padding: 24 }}>
                  <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 14 }}>WHAT WE EXTRACT</div>
                  {['Fund names + ISIN codes', 'Units held + current NAV', 'Amount invested per fund', 'Current value + gain/loss', 'XIRR per scheme', 'Category (Equity/Debt/Gold)'].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-2)', marginBottom: i < 5 ? 9 : 0 }}>
                      <span style={{ color: 'var(--up)', fontWeight: 700 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
