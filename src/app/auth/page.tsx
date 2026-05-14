'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem('folioiq-theme') as 'dark' | 'light' | null;
    const t = saved || 'dark';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('folioiq-theme', next);
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      // 1. Firebase Google popup — works with your existing Firebase config
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Sync to Supabase via firebase-sync route — creates the user there
      //    and returns a magic-link URL to set the Supabase session cookie
      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Sync failed');
      }

      // 3. If we got a session URL (magic link token), navigate to it
      //    — the /auth/callback route will verify and set the Supabase cookie,
      //      then redirect to /dashboard or /onboarding based on holdings count.
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        // Fallback: just go to dashboard (user already exists in Supabase)
        router.push('/dashboard');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); }
    else { setSent(true); }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        body::before {
          content: '';
          position: fixed;
          top: 20vh; left: 50%;
          transform: translateX(-50%);
          width: 800px; height: 800px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--brand) 14%, transparent), transparent 60%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
        body::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -100px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in oklab, var(--accent) 8%, transparent), transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 2,
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
          <span style={{
            width: 32, height: 32, borderRadius: 10, background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-brand)',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--bg-deep)', fontStyle: 'italic', lineHeight: 1 }}>ƒ</span>
          </span>
          FolioIQ
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggleTheme} className="btn ghost" style={{ padding: 9, borderRadius: 999 }} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>
            )}
          </button>
          <Link href="/" style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13.5, color: 'var(--ink-2)' }}>← Back to home</Link>
        </div>
      </header>

      {/* Main */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 140px)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Brand hero */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: '0 0 0 1px var(--brand), 0 0 48px -8px color-mix(in oklab, var(--brand) 80%, transparent)',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, color: 'var(--bg-deep)', fontStyle: 'italic', lineHeight: 1 }}>ƒ</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 44, lineHeight: 1, letterSpacing: '-0.03em', margin: '0 0 8px', fontWeight: 400 }}>
              FolioIQ
            </h1>
            <div style={{ color: 'var(--brand)', fontSize: 13, letterSpacing: '0.02em' }}>
              AI-Powered Portfolio Intelligence
            </div>
          </div>

          {/* Auth card */}
          <div style={{
            background: 'color-mix(in oklab, var(--surface) 70%, transparent)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '32px 28px',
            boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 6px', fontWeight: 400, textAlign: 'center' }}>
              {sent ? 'Check your inbox' : 'Sign in to FolioIQ'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, marginBottom: 24 }}>
              {sent ? `We sent a magic link to ${email}` : 'One tap — no password, no OTP'}
            </p>

            {!sent && (
              <>
                {/* Google */}
                <button onClick={handleGoogle} disabled={loading} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  width: '100%', padding: '14px 18px', borderRadius: 14,
                  fontSize: 14, fontWeight: 600,
                  background: 'var(--ink)', color: 'var(--bg-deep)',
                  border: '1px solid var(--ink)', marginBottom: 10,
                  transition: 'transform .15s', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853"/>
                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18a11.05 11.05 0 0 0 0 9.86l3.66-2.83Z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                </div>

                {/* Magic link */}
                <input
                  type="email"
                  placeholder="aarav@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                  style={{
                    width: '100%', padding: '14px 18px', borderRadius: 14,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14, outline: 'none',
                  }}
                  autoFocus
                />
                <button onClick={handleMagicLink} disabled={loading} style={{
                  width: '100%', marginTop: 8, padding: 14, borderRadius: 14,
                  background: 'var(--brand)', color: 'var(--bg-deep)',
                  border: '1px solid var(--brand)', fontWeight: 600, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? 'Sending…' : 'Send me a magic link'}
                </button>

                {error && (
                  <p style={{ color: 'var(--down)', fontSize: 12.5, marginTop: 10, textAlign: 'center' }}>{error}</p>
                )}

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                  By continuing, you agree to FolioIQ&apos;s <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Terms</a> &amp; <a href="#" style={{ color: 'var(--ink-2)', textDecoration: 'underline' }}>Privacy Policy</a>.<br/>
                  We never access your investments or trading account.
                </p>
              </>
            )}

            {sent && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <p style={{ color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.6 }}>
                  Click the link in your email to sign in. The link expires in 10 minutes.
                </p>
                <button onClick={() => setSent(false)} style={{ marginTop: 20, color: 'var(--ink-3)', fontSize: 13, background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>
                  Use a different email
                </button>
              </div>
            )}
          </div>

          {/* Trust strip */}
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: '🛡', text: 'Read-only' },
              { icon: '🇮🇳', text: 'India-hosted' },
              { icon: '●', text: 'Free forever', pulse: true },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-2)' }}>
                {t.pulse
                  ? <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--up)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}/>
                  : <span>{t.icon}</span>
                }
                <strong style={{ fontWeight: 500 }}>{t.text}</strong>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 11.5, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', gap: 16, marginBottom: 6 }}>
          {['Terms', 'Privacy', 'Security', 'Contact'].map(l => (
            <a key={l} href="#" style={{ color: 'var(--ink-2)' }}>{l}</a>
          ))}
        </div>
        <div>© 2026 FolioIQ · Made in 🇮🇳</div>
      </footer>
    </>
  );
}
