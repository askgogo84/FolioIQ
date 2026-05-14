'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// ── Market ticker ─────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  { sym: 'NIFTY 50',   val: '23,412.60', chg: +0.14 },
  { sym: 'SENSEX',     val: '74,608.98', chg: +0.07 },
  { sym: 'NIFTY BANK', val: '53,456.15', chg: -0.27 },
  { sym: 'NIFTY IT',   val: '29,394.20', chg: +1.21 },
  { sym: 'INDIA VIX',  val: '19.42',     chg: +0.75 },
  { sym: 'USD/INR',    val: '95.71',     chg: +0.43 },
  { sym: 'GOLD',       val: '₹1,62,010', chg: +4.52 },
  { sym: 'BTC/USD',    val: '$79,547',   chg: -1.60 },
];

// ── Navigation groups (matching design exactly) ───────────────────────
const NAV = [
  {
    label: 'PORTFOLIO',
    color: '#ff3d8b', // magenta
    items: [
      { href: '/dashboard',    label: 'Dashboard',    icon: Home },
      { href: '/upload',       label: 'Upload CAS',   icon: Upload },
      { href: '/connect',      label: 'Auto-Connect', icon: Bolt, badge: '⚡' },
      { href: '/transactions', label: 'Transactions', icon: ArrowsUpDown },
      { href: '/portfolio',    label: 'Holdings',     icon: PieChart },
      { href: '/profile',      label: 'Profile',      icon: User },
    ],
  },
  {
    label: 'AI INSIGHTS',
    color: '#8c5cff', // violet
    items: [
      { href: '/intelligence', label: 'AI Insights',    icon: Sparkle },
      { href: '/rebalance',    label: 'Smart Rebalance', icon: Shuffle },
      { href: '/capital-gains',label: 'Tax Harvesting',  icon: Leaf },
      { href: '/chat',         label: 'AI Chat',         icon: Chat },
    ],
  },
  {
    label: 'PLANNING',
    color: '#38e5ff', // cyan
    items: [
      { href: '/goals',      label: 'Goal Planner',  icon: Target },
      { href: '/sips',       label: 'SIPs',          icon: Repeat },
      { href: '/calculator', label: 'SIP Calculator', icon: Calculator },
      { href: '/backtest',   label: 'Backtesting',   icon: Rewind },
    ],
  },
  {
    label: 'DISCOVER',
    color: '#e8b14a', // gold
    items: [
      { href: '/explore',       label: 'Fund Explorer', icon: Search },
      { href: '/screener',      label: 'Fund Screener', icon: Filter },
      { href: '/watchlist',     label: 'Watchlist',     icon: Eye },
      { href: '/reports',       label: 'Reports & Tax', icon: FileText },
    ],
  },
];

// ── Inline SVG icons ───────────────────────────────────────────────────
function Icon({ d, size = 16 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
function Home({ size = 16 }) { return <Icon size={size} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />; }
function Upload({ size = 16 }) { return <Icon size={size} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />; }
function Bolt({ size = 16 }) { return <Icon size={size} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />; }
function ArrowsUpDown({ size = 16 }) { return <Icon size={size} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />; }
function PieChart({ size = 16 }) { return <Icon size={size} d="M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10z" />; }
function User({ size = 16 }) { return <Icon size={size} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />; }
function Sparkle({ size = 16 }) { return <Icon size={size} d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />; }
function Shuffle({ size = 16 }) { return <Icon size={size} d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />; }
function Leaf({ size = 16 }) { return <Icon size={size} d="M2 22c1.25-1.25 2.69-2.16 4.17-2.76C7.85 18.53 10.31 18 13 18c1.81 0 3.57.45 5.11 1.27A10 10 0 0 0 21 12C21 6.48 16.52 2 11 2c-2.07 0-4 .63-5.6 1.7L2 22z" />; }
function Chat({ size = 16 }) { return <Icon size={size} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />; }
function Target({ size = 16 }) { return <Icon size={size} d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />; }
function Repeat({ size = 16 }) { return <Icon size={size} d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />; }
function Calculator({ size = 16 }) { return <Icon size={size} d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M8 6h8M8 10h8M8 14h4" />; }
function Rewind({ size = 16 }) { return <Icon size={size} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />; }
function Search({ size = 16 }) { return <Icon size={size} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />; }
function Filter({ size = 16 }) { return <Icon size={size} d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />; }
function Eye({ size = 16 }) { return <Icon size={size} d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />; }
function FileText({ size = 16 }) { return <Icon size={size} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8" />; }
function Bell({ size = 16 }) { return <Icon size={size} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />; }
function Sun({ size = 16 }) { return <Icon size={size} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />; }
function Moon({ size = 16 }) { return <Icon size={size} d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />; }
function Settings({ size = 16 }) { return <Icon size={size} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />; }

// ── AppLayout ─────────────────────────────────────────────────────────
export default function AppLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [tickers, setTickers] = useState(TICKER_FALLBACK);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
  };

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem('folioiq-theme') as 'dark' | 'light' | null;
    const t = saved || 'light';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('folioiq-theme', next);
  };

  // Live ticker — normalize API {name,value,change,up} → {sym,val,chg}
  const normTicker = (d: any[]) => d.map(t => ({
    sym: t.sym ?? t.name ?? '',
    val: t.val ?? t.value ?? '',
    chg: typeof t.chg === 'number' ? t.chg
       : typeof t.change === 'string' ? parseFloat(t.change.replace('%',''))
       : t.up === true ? 0.01 : -0.01,
  }));
  useEffect(() => {
    const load = () => fetch('/api/market').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length) setTickers(normTicker(d));
    }).catch(() => {});
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const items = [...tickers, ...tickers, ...tickers];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: collapsed ? '72px 1fr' : '244px 1fr', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside style={{
        background: 'var(--bg-deep)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
        padding: collapsed ? '20px 10px' : '20px 16px',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '6px 0 18px' : '6px 6px 20px',
          borderBottom: '1px solid var(--border)', marginBottom: 14,
        }}>
          <Link href="/dashboard" style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'var(--brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 0 1px var(--brand), 0 0 22px -4px color-mix(in oklab, var(--brand) 60%, transparent)',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--bg-deep)', fontStyle: 'italic', lineHeight: 1 }}>ƒ</span>
          </Link>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--ink)' }}>FolioIQ</div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--brand)', marginTop: 4, fontWeight: 500 }}>Portfolio Intelligence</div>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 20 }}>
              {!collapsed && (
                <div style={{
                  fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em',
                  color: group.color, padding: '0 12px 8px', textTransform: 'uppercase',
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && gi > 0 && (
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 6px 10px' }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const IconComp = item.icon;
                  return (
                    <Link key={item.href} href={item.href} style={{
                      display: 'flex', alignItems: 'center', gap: 11,
                      padding: collapsed ? '10px' : '9px 12px',
                      borderRadius: 11,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: active ? 'var(--surface-3)' : 'transparent',
                      color: active ? 'var(--ink)' : 'var(--ink-2)',
                      fontSize: 13.5, fontWeight: active ? 600 : 500,
                      letterSpacing: '-0.005em',
                      position: 'relative',
                      textDecoration: 'none',
                      transition: 'background .1s',
                    }}>
                      {active && !collapsed && (
                        <div style={{
                          position: 'absolute', left: -16, top: 8, bottom: 8,
                          width: 3, background: 'var(--brand)',
                          borderRadius: '0 3px 3px 0',
                        }} />
                      )}
                      <span style={{
                        width: 22, height: 22, borderRadius: 7,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: active ? 'var(--brand)' : 'var(--ink-3)',
                        flexShrink: 0,
                      }}>
                        <IconComp size={16} />
                      </span>
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.badge && (
                            <span style={{ color: '#e8b14a', fontSize: 13 }}>{item.badge}</span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Plus upgrade card */}
        {!collapsed && (
          <div style={{
            padding: 14, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--surface-3), var(--surface-2))',
            border: '1px solid var(--border)',
            margin: '8px 0', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 20%, transparent), transparent 70%)',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                <Sparkle size={11} />
                <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--brand)', fontWeight: 600 }}>Plus+</span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, lineHeight: 1.15, marginBottom: 8, color: 'var(--ink)' }}>Unlock the full vault</div>
              <Link href="/pricing" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '8px 0', borderRadius: 10,
                background: 'var(--brand)', color: 'var(--bg-deep)',
                fontSize: 11.5, fontWeight: 600, textDecoration: 'none',
              }}>
                Try 30 days free →
              </Link>
            </div>
          </div>
        )}

        {/* User row + logout */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Link href="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 8px',
            textDecoration: 'none', borderRadius: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--brand), var(--brand-2))',
              color: 'var(--bg-deep)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 11, letterSpacing: '-0.02em',
              flexShrink: 0,
            }}>AS</div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Aarav Sharma</div>
                <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 1 }}>Plus member · ⚙</div>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: collapsed ? '8px' : '8px 10px',
              borderRadius: 10, border: 'none',
              background: 'transparent', cursor: loggingOut ? 'wait' : 'pointer',
              color: 'var(--ink-3)', fontSize: 12,
              width: '100%', justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {!collapsed && (
              <span>{loggingOut ? 'Signing out…' : 'Sign out'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'color-mix(in oklab, var(--bg) 92%, transparent)',
          backdropFilter: 'blur(16px) saturate(160%)',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Ticker strip */}
          <div style={{
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden', position: 'relative',
            height: 34, display: 'flex', alignItems: 'center',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to right, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, background: 'linear-gradient(to left, var(--bg), transparent)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', gap: 48, animation: 'marquee 80s linear infinite', whiteSpace: 'nowrap', paddingLeft: 24 }}>
              {items.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexShrink: 0, fontSize: 12 }}>
                  <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 500 }}>{t.sym}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--ink-2)' }}>{t.val}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: t.chg >= 0 ? 'var(--up)' : 'var(--down)' }}>
                    {t.chg >= 0 ? '▲' : '▼'} {Math.abs(t.chg).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main toolbar */}
          <div style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 13px', borderRadius: 12,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--ink-3)', fontSize: 13,
              minWidth: 320, cursor: 'pointer',
            }}>
              <Search size={14} />
              <span style={{ flex: 1 }}>Search funds, holdings, goals…</span>
              <kbd style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--ink-3)' }}>⌘K</kbd>
            </div>

            <div style={{ flex: 1 }} />

            {/* NSE Live */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'var(--up-soft)', color: 'var(--up)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--up)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>NSE · Live</span>
            </div>

            {/* Bell */}
            <button style={{ padding: 9, borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--ink-2)', position: 'relative', cursor: 'pointer' }}>
              <Bell size={17} />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: 'var(--accent)', borderRadius: 99, boxShadow: '0 0 0 2px var(--bg)' }} />
            </button>

            {/* Theme */}
            <button onClick={toggleTheme} style={{ padding: 9, borderRadius: 10, background: 'transparent', border: 'none', color: 'var(--ink-2)', cursor: 'pointer' }} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Ask Folio */}
            <Link href="/chat" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 99,
              background: 'var(--ink)', color: 'var(--bg)',
              fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              <Sparkle size={13} /> Ask Folio
            </Link>

            {/* Invest */}
            <Link href="/explore" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 14px', borderRadius: 99,
              background: 'var(--brand)', color: 'var(--bg-deep)',
              fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              + Invest
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
