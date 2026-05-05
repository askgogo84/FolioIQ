'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setLoggingOut(false);
    }
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/upload', label: 'Upload CAS', icon: '📤' },
    { href: '/transactions', label: 'Transactions', icon: '📋' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  const intelligenceLinks = [
    { href: '/intelligence', label: 'AI Insights', icon: '🤖' },
    { href: '/rebalance', label: 'Smart Rebalance', icon: '⚖️' },
    { href: '/tax-harvesting', label: 'Tax Harvesting', icon: '🌾' },
    { href: '/chat', label: 'AI Chat', icon: '💬' },
  ];

  const planningLinks = [
    { href: '/goals', label: 'Goal Planner', icon: '🎯' },
    { href: '/calculator', label: 'SIP Calculator', icon: '🧮' },
    { href: '/backtest', label: 'Backtesting', icon: '📈' },
  ];

  const discoveryLinks = [
    { href: '/screener', label: 'Fund Explorer', icon: '🔍' },
    { href: '/compare', label: 'Fund Screener', icon: '📊' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">F</span>
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900">FolioIQ</div>
            <div className="text-xs text-gray-400">Smart Analytics</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {/* Portfolio */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Portfolio</div>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${isActive(l.href) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>

        {/* Intelligence */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Intelligence</div>
          {intelligenceLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${isActive(l.href) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>

        {/* Planning */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Planning</div>
          {planningLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${isActive(l.href) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>

        {/* Discovery */}
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">Discovery</div>
          {discoveryLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${isActive(l.href) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
          <span>🚪</span>
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
     }
