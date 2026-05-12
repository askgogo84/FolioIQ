"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const NAV = [
  { section: "PORTFOLIO", items: [
    { label: "Dashboard", href: "/dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { label: "Upload CAS", href: "/upload", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" },
    { label: "Transactions", href: "/transactions", icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
    { label: "Profile", href: "/profile", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  ]},
  { section: "INTELLIGENCE", items: [
    { label: "AI Insights", href: "/intelligence", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
    { label: "Smart Rebalance", href: "/rebalance", icon: "M12 20v-6M6 20V10M18 20V4" },
    { label: "Tax Harvesting", href: "/tax-harvesting", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { label: "AI Chat", href: "/chat", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  ]},
  { section: "PLANNING", items: [
    { label: "Goal Planner", href: "/goals", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { label: "SIP Calculator", href: "/calculator", icon: "M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3M13 3h8M21 3v8M11 13L21 3" },
    { label: "Backtesting", href: "/backtest", icon: "M3 3v18h18" },
  ]},
  { section: "DISCOVERY", items: [
    { label: "Fund Explorer", href: "/explore", icon: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" },
    { label: "Fund Screener", href: "/screener", icon: "M4 6h16M4 12h8m-8 6h16" },
  ]},
];

const SI = ({ d }: { d: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);

export default function AppLayout({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const path = usePathname();
  const sb = createClient();

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth");
      else setUser(data.user);
    });
  }, []);

  const logout = async () => { await sb.auth.signOut(); router.push("/"); };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'Inter var',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-out shadow-xl lg:shadow-none`}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm tracking-tight leading-none">FolioIQ</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV.map((section, si) => (
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase px-3 mb-1.5">{section.section}</div>
              {section.items.map(item => {
                const active = path === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                      ${active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                    <SI d={item.icon}/>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <div className="px-3 py-2 text-[11px] text-gray-400 truncate">{user?.email}</div>
          <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            {title && <h1 className="text-[15px] font-bold text-gray-900 leading-none truncate">{title}</h1>}
            {subtitle && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-[12px] text-gray-400 hover:text-gray-700 hidden sm:block">← Dashboard</Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>}
    </div>
  );
}
