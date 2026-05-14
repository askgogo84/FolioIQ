'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/utils/supabase/client';

const CAS_SOURCES = [
  { id: 'cams',   logo: 'CA', tone: '#c1392b', label: 'Request from CAMS',       url: 'https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement' },
  { id: 'kfin',   logo: 'KF', tone: '#1f6b50', label: 'Request from KFintech',   url: 'https://mfs.kfintech.com/investor/General/ConsolidatedAccountStatement' },
  { id: 'nsdl',   logo: 'NS', tone: '#2952ff', label: 'Request from NSDL (e-CAS)', url: 'https://eservices.nsdl.com/AccStatement/ConsolidatedAccountStatment.html' },
];

export default function UploadCASPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Get authenticated userId on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data?.user?.id ?? null);
    });
  }, []);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f => {
      const ok = ['application/pdf', 'text/csv', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(f.type)
        || f.name.match(/\.(pdf|csv|xls|xlsx)$/i);
      return ok && f.size <= 10 * 1024 * 1024;
    });
    setFiles(valid);
    setStatus(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleUpload = async () => {
    if (!files.length) { setStatus({ type: 'error', message: 'Please select a file first.' }); return; }
    if (!userId) { setStatus({ type: 'error', message: 'Please sign in to upload your CAS.' }); return; }

    setUploading(true);
    setStatus(null);

    try {
      const fd = new FormData();
      fd.append('file', files[0]);
      fd.append('userId', userId);

      // Detect NJ Wealth reports by reading the first ~2KB as text
      // NJ PDFs contain "NJ India" or "NJ Wealth" or "Valuation Report" in the filename
      const isNJ = files[0].name.toLowerCase().includes('nj') ||
                   files[0].name.toLowerCase().includes('val_rpt') ||
                   files[0].name.toLowerCase().includes('valuation');

      const endpoint = isNJ ? '/api/upload/nj' : '/api/upload';
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.success) {
        const count = data.fundCount ?? data.fundsCount ?? 'your';
        const val = data.totalValue ? ` · ₹${(data.totalValue / 100000).toFixed(2)} L current` : '';
        setStatus({ type: 'success', message: `✓ Parsed ${count} funds${val}. Redirecting to dashboard…` });
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

  return (
    <AppLayout>
      <div style={{ padding: '28px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>Import</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px,5.5vw,80px)', lineHeight: 0.98, letterSpacing: '-0.03em', fontWeight: 400, margin: '0 0 16px', color: 'var(--ink)' }}>
            Bring your <em style={{ color: 'var(--brand)', fontStyle: 'italic' }}>entire</em> portfolio<br />in 30 seconds.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 580 }}>
            Drop a CAMS or KFintech statement — we&apos;ll parse 100% of your transactions, holdings, and SIPs across all AMCs. <strong>NJ Wealth valuation reports also supported.</strong> End-to-end encrypted.
          </p>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>

          {/* Drop zone */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 24, overflow: 'hidden',
          }}>
            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              style={{
                padding: '52px 40px', textAlign: 'center',
                borderBottom: `1px dashed ${dragActive ? 'var(--brand)' : 'var(--border-strong)'}`,
                background: dragActive ? 'color-mix(in oklab, var(--brand) 6%, var(--surface-2))' : 'var(--surface-2)',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              <div style={{
                width: 96, height: 96, borderRadius: 28,
                background: 'var(--brand)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
                boxShadow: '0 0 48px -8px color-mix(in oklab, var(--brand) 60%, transparent)',
              }}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--bg-deep)" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
              </div>

              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px,3.5vw,48px)', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 12, color: 'var(--ink)' }}>
                Drop your CAS PDF here
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
                Or click to browse. We support CAMS, KFintech, NSDL CAS — and NJ Wealth valuation PDFs.
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  style={{
                    padding: '12px 24px', borderRadius: 999,
                    background: 'var(--ink)', color: 'var(--bg)', border: 'none',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}>
                  Browse files
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setFiles([]); setStatus(null); }}
                  style={{
                    padding: '12px 24px', borderRadius: 999,
                    background: 'var(--surface)', color: 'var(--ink-2)',
                    border: '1px solid var(--border)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                  }}>
                  Clear
                </button>
              </div>

              <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-4)' }}>
                PDF only (CAMS / KFintech CAS) · Max 10MB
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 12 }}>
                  Selected — {files.length} file{files.length > 1 ? 's' : ''}
                </div>
                {files.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    background: 'var(--surface-2)', border: '1px solid var(--border)', marginBottom: 8,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button + status */}
            <div style={{ padding: '20px 28px' }}>
              <button
                onClick={handleUpload}
                disabled={uploading || !files.length}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  width: '100%', padding: '15px', borderRadius: 14,
                  background: files.length ? 'var(--brand)' : 'var(--surface-3)',
                  color: files.length ? 'var(--bg-deep)' : 'var(--ink-4)',
                  border: 'none', fontSize: 15, fontWeight: 600,
                  cursor: files.length && !uploading ? 'pointer' : 'not-allowed',
                  transition: 'all .15s', opacity: uploading ? 0.7 : 1,
                }}>
                {uploading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Parsing your portfolio…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    Upload & Analyze
                  </>
                )}
              </button>

              {status && (
                <div style={{
                  marginTop: 14, padding: '12px 16px', borderRadius: 12,
                  background: status.type === 'success' ? 'var(--up-soft)' : 'var(--down-soft)',
                  color: status.type === 'success' ? 'var(--up)' : 'var(--down)',
                  border: `1px solid ${status.type === 'success' ? 'color-mix(in oklab, var(--up) 30%, transparent)' : 'color-mix(in oklab, var(--down) 30%, transparent)'}`,
                  fontSize: 13.5, fontWeight: 500,
                }}>
                  {status.message}
                </div>
              )}

              <p style={{ fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 14 }}>
                🔒 End-to-end encrypted · Read-only · We never access your broker
              </p>
            </div>
          </div>

          {/* Right panel — Get your CAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 28,
            }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>
                Get your CAS
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 20, color: 'var(--ink)' }}>
                Email yourself the statement
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {CAS_SOURCES.map(src => (
                  <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 14,
                    border: '1px solid var(--border)', background: 'var(--surface-2)',
                    textDecoration: 'none', transition: 'all .12s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: src.tone, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 11, color: 'white', flexShrink: 0,
                    }}>{src.logo}</div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{src.label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </a>
                ))}
              </div>

              {/* NJ Wealth section */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 10 }}>
                  OR — NJ WEALTH CLIENTS
                </div>
                <div style={{
                  display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 14,
                  background: 'var(--brand-soft)', border: '1px solid var(--border)',
                  alignItems: 'flex-start',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#c1392b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>NJ</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Upload your NJ Valuation Report PDF</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
                      1. Login at <strong>njindiaonline.in</strong><br />
                      2. Go to <strong>Consolidated → Valuation Report</strong><br />
                      3. Set date range → click <strong>Mail Back</strong> or print to PDF<br />
                      4. Drop the PDF here — we detect it automatically
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 28,
            }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 16 }}>
                How it works
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { n: '01', title: 'Request your CAS', body: 'Takes 2 minutes via CAMS or KFintech. Free, arrives in your email inbox.' },
                  { n: '02', title: 'Drop it here', body: 'We parse 100% of it — every fund, folio, transaction, and NAV.' },
                  { n: '03', title: 'Get your dashboard', body: 'Instant XIRR, tax savings, rebalance plan. No jargon.' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1, color: 'var(--brand)', opacity: 0.5, flexShrink: 0, width: 32 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--ink)' }}>{s.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{s.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AppLayout>
  );
}
