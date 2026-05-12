
"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const NAV = [
  { section:"PORTFOLIO", items:[
    {label:"Dashboard",href:"/dashboard",d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"},
    {label:"Upload CAS",href:"/upload",d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"},
    {label:"Transactions",href:"/transactions",d:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"},
    {label:"Profile",href:"/profile",d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
  ]},
  { section:"AI INSIGHTS", items:[
    {label:"AI Insights",href:"/intelligence",d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"},
    {label:"Smart Rebalance",href:"/rebalance",d:"M12 20v-6M6 20V10M18 20V4"},
    {label:"Tax Harvesting",href:"/tax-harvesting",d:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"},
    {label:"AI Chat",href:"/chat",d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},
  ]},
  { section:"PLANNING", items:[
    {label:"Goal Planner",href:"/goals",d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"},
    {label:"SIP Calculator",href:"/calculator",d:"M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"},
    {label:"Backtesting",href:"/backtest",d:"M3 3v18h18"},
  ]},
  { section:"DISCOVER", items:[
    {label:"Fund Explorer",href:"/explore",d:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"},
    {label:"Fund Screener",href:"/screener",d:"M4 6h16M4 12h8m-8 6h16"},
  ]},
];

export default function AppLayout({children,title,subtitle}:{children:React.ReactNode;title?:string;subtitle?:string}) {
  const [sidebar, setSidebar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const path = usePathname();
  const sb = createClient();

  useEffect(() => {
    sb.auth.getUser().then(({data}) => {
      if (!data.user) router.push("/auth");
      else setUser(data.user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>
      {/* Sidebar */}
      <aside className={`${sidebar?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-56 bg-[#0D1117] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out shadow-2xl lg:shadow-none`}>
        <div className="px-5 py-4 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={()=>setSidebar(false)}>
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-white text-[14px] tracking-tight leading-none">FolioIQ</div>
              <div className="text-[9px] text-gray-600 tracking-widest uppercase mt-0.5">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV.map((sec,si)=>(
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-600 tracking-[0.2em] uppercase px-3 mb-2">{sec.section}</div>
              {sec.items.map(item=>{
                const active = path === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={()=>setSidebar(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                      ${active?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":"text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.d}/>
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
          <div className="px-3 py-2 text-[11px] text-gray-600 truncate">{user?.email}</div>
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="bg-[#0D1117]/80 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-3.5 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={()=>setSidebar(!sidebar)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            {title&&<h1 className="text-[15px] font-bold text-white leading-none truncate">{title}</h1>}
            {subtitle&&<p className="text-[11px] text-gray-600 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <Link href="/dashboard" className="flex-shrink-0 text-[12px] text-gray-600 hover:text-gray-300 hidden sm:flex items-center gap-1 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Dashboard
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>

      {sidebar&&<div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setSidebar(false)}/>}
    </div>
  );
}
