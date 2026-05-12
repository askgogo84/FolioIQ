
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import Link from "next/link";

// ── ICONS (inline SVGs for zero bundle impact) ──────────────
const Icon = ({ d, size=16, cls="" }: { d:string, size?:number, cls?:string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <path d={d}/>
  </svg>
);

// ── UTILITIES ────────────────────────────────────────────────
const fmt = (v: number, hide=false): string => {
  if (hide) return "₹ ••••••";
  if (!v && v !== 0) return "₹0";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)} Cr`;
  if (a >= 100000) return `${s}₹${(a/100000).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};
const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const getBucket = (c="") => /equity|large|mid|small|flexi|elss|sectoral|thematic|focused/i.test(c) ? "Equity"
  : /debt|gilt|bond|duration|liquid|overnight|money|credit|floater/i.test(c) ? "Debt"
  : /hybrid|balanced|multi.asset/i.test(c) ? "Hybrid"
  : /gold|silver/i.test(c) ? "Gold" : "Other";
const PALETTE = { Equity:"#16a34a", Debt:"#2563eb", Hybrid:"#d97706", Gold:"#ca8a04", Other:"#64748b" };

// ── ANIMATED NUMBER ──────────────────────────────────────────
function AnimNum({ target, prefix="₹", suffix="", hide=false, dur=1200, className="" }:
  { target:number, prefix?:string, suffix?:string, hide?:boolean, dur?:number, className?:string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (hide) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(target * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, hide, dur]);
  if (hide) return <span className={className}>₹ ••••••</span>;
  const a = Math.abs(val), s = val < 0 ? "−" : "";
  let str = a >= 10000000 ? `${s}${prefix}${(a/10000000).toFixed(2)} Cr`
    : a >= 100000 ? `${s}${prefix}${(a/100000).toFixed(2)} L`
    : `${s}${prefix}${Math.round(a).toLocaleString("en-IN")}`;
  return <span className={className}>{str}{suffix}</span>;
}

// ── MARKET TICKER DATA ───────────────────────────────────────
// Fallback static data until live fetch completes
const DEFAULT_TICKER = [
  { n:"NIFTY 50", v:"--", c:"--", up:true },
  { n:"SENSEX", v:"--", c:"--", up:true },
  { n:"NIFTY MIDCAP", v:"--", c:"--", up:true },
  { n:"SMALLCAP 250", v:"--", c:"--", up:true },
  { n:"GOLD", v:"--", c:"--", up:true },
  { n:"USD/INR", v:"--", c:"--", up:false },
];

const RISK_QS = [
  { q:"Your ₹1L drops to ₹80k in a crash. You...", opts:["Sell everything immediately","Sell half to cut losses","Hold — markets recover","Buy more at the dip"], s:[1,2,3,4] },
  { q:"Your investment horizon is...", opts:["Less than 1 year","1–3 years","3–7 years","7+ years"], s:[1,2,3,4] },
  { q:"You're comfortable with monthly portfolio swings of...", opts:["< 5%","5–10%","10–20%","20% or more"], s:[1,2,3,4] },
  { q:"Your investment goal is...", opts:["Protect capital at all costs","Steady growth, low volatility","Aggressive long-term wealth","Maximum returns, any risk"], s:[1,2,3,4] },
  { q:"When markets fall 30%, you...", opts:["Can't sleep at night","Feel anxious but hold","Stay calm, it's temporary","Get excited — opportunity!"], s:[1,2,3,4] },
];

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [tab, setTab] = useState<"overview"|"funds"|"insights">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [riskAns, setRiskAns] = useState<number[]>([]);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [tickerPaused, setTickerPaused] = useState(false);
  const [liveIndices, setLiveIndices] = useState(DEFAULT_TICKER);

  // Fetch live market data every 5 minutes
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const r = await fetch('/api/market');
        const d = await r.json();
        if (d.indices?.length > 0) {
          setLiveIndices(d.indices.map((idx: any) => ({ n: idx.name, v: idx.value, c: idx.change, up: idx.up })));
        }
      } catch {}
    };
    fetchMarket();
    const interval = setInterval(fetchMarket, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: pd } = await sb.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const valid = (pd.data.funds as any[]).filter((f:any) => {
          const n = String(f.name||"");
          return n.length > 5 && !/^\d{2}-\d{2}-\d{4}/.test(n) && !/^\d+\.\d+/.test(n)
            && !["No Of Unit","Return :","Sub Total"].some(x => n.includes(x));
        });
        setHoldings(valid);
        setMeta(pd.data);
      }
      setLoading(false);
    })();
  }, []);

  const logout = async () => { await sb.auth.signOut(); router.push("/"); };

  const handleRisk = (s: number) => {
    const ans = [...riskAns, s];
    if (riskStep < RISK_QS.length - 1) { setRiskAns(ans); setRiskStep(riskStep + 1); }
    else {
      const avg = ans.reduce((a,b)=>a+b,0)/RISK_QS.length;
      setRiskResult(avg<=1.8 ? { t:"Conservative",e:"🛡️",col:"#3b82f6",rec:"70% Debt · 20% Hybrid · 10% Equity",desc:"You prioritise capital safety over growth. Focus on short-duration debt and liquid funds." }
        : avg<=2.8 ? { t:"Balanced",e:"⚖️",col:"#f59e0b",rec:"50% Equity · 30% Hybrid · 20% Debt",desc:"You seek steady growth with moderate risk. Mix of large-cap equity and hybrid funds." }
        : { t:"Aggressive",e:"🚀",col:"#16a34a",rec:"80% Equity · 10% Hybrid · 10% Debt",desc:"You target maximum long-term returns. Small & mid cap funds with long SIP horizon." });
    }
  };

  // Loading
  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"/>
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"/>
        </div>
        <p className="text-sm text-gray-400 tracking-wide">Loading your portfolio</p>
      </div>
    </div>
  );

  // ── COMPUTE ──────────────────────────────────────────────
  const totalInv = holdings.reduce((s,h)=>s+(h.invested||0),0);
  const totalCur = holdings.reduce((s,h)=>s+(h.value||0),0);
  const totalGain = totalCur - totalInv;
  const retPct = totalInv>0 ? (totalGain/totalInv)*100 : 0;
  const sip = holdings.reduce((s,h)=>s+(h.sip||0),0);
  const activeSIPs = holdings.filter(h=>h.sip>0).length;
  const afterTax = totalGain * 0.875; // simplified

  // Daily simulation
  const daySeed = (totalCur % 7) / 7 - 0.4;
  const dayAmt = totalCur * daySeed * 0.018;
  const dayPct = daySeed * 0.018 * 100;
  const dayUp = dayAmt >= 0;

  // Health
  const gainers = holdings.filter(h=>(h.value||0)>(h.invested||0));
  const losers  = holdings.filter(h=>(h.value||0)<(h.invested||0));
  const health = Math.min(100, Math.round((gainers.length/Math.max(holdings.length,1))*40 + Math.min(holdings.length,20)/20*30 + (retPct>12?30:retPct>8?20:retPct>0?10:0)));
  const hColor = health>=70?"#16a34a":health>=50?"#d97706":"#dc2626";

  // Alloc
  const allocMap: Record<string,number> = {};
  holdings.forEach(h=>{ const b=getBucket(h.category||""); allocMap[b]=(allocMap[b]||0)+(h.value||0); });
  const alloc = Object.entries(allocMap).map(([name,val])=>({ name, value:Math.round(val/Math.max(totalCur,1)*100), amt:val, color:PALETTE[name as keyof typeof PALETTE]||"#64748b" })).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  // Growth chart
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const growth = months.map((_,i)=>({ m:months[i], p:Math.round(totalInv+(totalGain*(i+1)/12)), n:Math.round(totalInv*(1+0.12*(i+1)/12)) }));

  // Tax
  const taxSave = Math.round(Math.min(125000, holdings.reduce((s,h)=>{ const g=(h.value||0)-(h.invested||0); return s+(/equity|elss/i.test(h.category||"")&&g>0?g:0); },0))*0.125*1.04);

  // Sorted
  const sorted = [...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const top3 = sorted.slice(0,3);
  const bot3 = sorted.slice(-3).reverse().filter(h=>(h.returnsPercent||0)<0);

  const sig = (r:number) => r<-10?{ l:"Exit",bg:"bg-red-50",text:"text-red-600",dot:"bg-red-500" }
    : r<0?{ l:"Review",bg:"bg-orange-50",text:"text-orange-600",dot:"bg-orange-500" }
    : r<8?{ l:"Watch",bg:"bg-amber-50",text:"text-amber-600",dot:"bg-amber-500" }
    : r<20?{ l:"Hold",bg:"bg-emerald-50",text:"text-emerald-600",dot:"bg-emerald-500" }
    : { l:"Star",bg:"bg-emerald-100",text:"text-emerald-700",dot:"bg-emerald-600" };

  // ── NO PORTFOLIO ──────────────────────────────────────────
  if (holdings.length === 0) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-200">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FolioIQ</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">Upload your NJ Wealth XLS or any CAS statement to unlock your full portfolio intelligence report.</p>
        <Link href="/upload" className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload Statement
        </Link>
      </div>
    </div>
  );

  const Sidebar = () => (
    <aside className={`${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-out`}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-black">F</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm tracking-tight">FolioIQ</div>
            <div className="text-[10px] text-gray-400 tracking-widest uppercase">Portfolio Intelligence</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {[
          { label:"PORTFOLIO", items:[
            { label:"Dashboard", href:"/dashboard", active:true, icon:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
            { label:"Upload CAS", href:"/upload", icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" },
            { label:"Transactions", href:"/transactions", icon:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
            { label:"Profile", href:"/profile", icon:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
          ]},
          { label:"INTELLIGENCE", items:[
            { label:"AI Insights", href:"/intelligence", icon:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
            { label:"Smart Rebalance", href:"/rebalance", icon:"M12 20v-6M6 20V10M18 20V4" },
            { label:"Tax Harvesting", href:"/tax-harvesting", icon:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
            { label:"AI Chat", href:"/chat", icon:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
          ]},
          { label:"PLANNING", items:[
            { label:"Goal Planner", href:"/goals", icon:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
            { label:"SIP Calculator", href:"/calculator", icon:"M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3M13 3h8M21 3v8M11 13L21 3" },
            { label:"Backtesting", href:"/backtest", icon:"M3 3v18h18" },
          ]},
          { label:"DISCOVERY", items:[
            { label:"Fund Explorer", href:"/explore", icon:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" },
            { label:"Fund Screener", href:"/screener", icon:"M4 6h16M4 12h8m-8 6h16" },
          ]},
        ].map((section,si) => (
          <div key={si} className="mb-5">
            <div className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase px-3 mb-2">{section.label}</div>
            {section.items.map(item => (
              <Link key={item.href} href={item.href} onClick={()=>setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                  ${(item as any).active ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d={(item as any).icon}/>
                </svg>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        <button onClick={()=>{setShowRisk(true);setRiskStep(0);setRiskAns([]);setRiskResult(null);}}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
          Risk Profile
        </button>
        <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>
      <Sidebar/>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── TICKER ── */}
        <div className="bg-gray-950 overflow-hidden flex-shrink-0" style={{height:32}}>
          <div className="flex items-center h-full" onMouseEnter={()=>setTickerPaused(true)} onMouseLeave={()=>setTickerPaused(false)}>
            <div className={`flex gap-8 px-4 whitespace-nowrap text-[11px] ${tickerPaused?"":"animate-[ticker_40s_linear_infinite]"}`}
              style={{animationPlayState:tickerPaused?"paused":"running"}}>
              {[...liveIndices,...liveIndices,...liveIndices].map((t,i)=>(
                <span key={i} className="flex items-center gap-2">
                  <span className="text-gray-500">{t.n}</span>
                  <span className="text-gray-200 font-mono font-medium">{t.v}</span>
                  <span className={t.up?"text-emerald-400":"text-red-400"}>{t.c}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <h1 className="text-[15px] font-semibold text-gray-900 leading-none">
                {new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}, <span className="text-gray-700">{user?.email?.split("@")[0]}</span>
              </h1>
              <p className="text-[11px] text-gray-400 mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Today's P&L pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${dayUp?"bg-emerald-50 border-emerald-100 text-emerald-700":"bg-red-50 border-red-100 text-red-700"}`}>
              <span className="text-base leading-none">{dayUp?"↑":"↓"}</span>
              <span>{dayUp?"+":""}{fmt(dayAmt, hide)}</span>
              <span className="opacity-60">({dayUp?"+":""}{dayPct.toFixed(2)}%)</span>
              <span className="opacity-40 font-normal">today</span>
            </div>
            <button onClick={()=>setHide(!hide)} title="Toggle values" className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            <Link href="/upload" className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 text-white rounded-xl text-[12px] font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              <span className="hidden sm:inline">Update CAS</span>
            </Link>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

            {/* ── KPI ROW ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label:"Portfolio Value", val:totalCur, sub:`${pct(retPct)} all time`, accent:retPct>=0?"text-emerald-600":"text-red-500", trend:retPct>=0 },
                { label:"Amount Invested", val:totalInv, sub:`Across ${holdings.length} funds`, accent:"text-gray-500", trend:null },
                { label:"Total Returns", val:totalGain, sub:`After-tax ≈ ${fmt(afterTax,hide)}`, accent:totalGain>=0?"text-emerald-600":"text-red-500", trend:totalGain>=0 },
                { label:"Monthly SIP", val:sip, sub:`${activeSIPs} active SIPs`, accent:"text-gray-500", trend:null },
              ].map((k,i)=>(
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">{k.label}</span>
                    {k.trend!==null && (
                      <span className={`text-[11px] font-semibold ${k.trend?"text-emerald-500":"text-red-500"}`}>
                        {k.trend?"↑":"↓"}
                      </span>
                    )}
                  </div>
                  <AnimNum target={k.val} hide={hide} className="text-[22px] sm:text-[26px] font-bold text-gray-900 block tracking-tight leading-none"/>
                  <div className={`text-[11px] mt-2 font-medium ${k.accent}`}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* ── HEALTH + DAILY ROW ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Health */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition-all">
                <div className="relative flex-shrink-0">
                  <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                    <circle cx="36" cy="36" r="30" fill="none" stroke={hColor} strokeWidth="8"
                      strokeDasharray={`${(health/100)*188.5} 188.5`} strokeLinecap="round"
                      style={{transition:"stroke-dasharray 1.5s cubic-bezier(.4,0,.2,1)"}}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center rotate-90">
                    <span className="text-[18px] font-black" style={{color:hColor}}>{health}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Health Score</div>
                  <div className="text-[16px] font-bold text-gray-900">{health>=70?"Excellent":health>=50?"Good":"Needs Review"}</div>
                  <div className="text-[11px] text-gray-400 mt-1">{gainers.length} of {holdings.length} funds profitable</div>
                </div>
              </div>

              {/* Daily P&L */}
              <div className={`sm:col-span-2 rounded-2xl border p-5 flex items-center justify-between gap-4 hover:shadow-md transition-all ${dayUp?"bg-emerald-50 border-emerald-100":"bg-red-50 border-red-100"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${dayUp?"bg-emerald-100":"bg-red-100"}`}>
                    {dayUp?"📈":"📉"}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-800">
                      Portfolio {dayUp?"gained":"declined"} today
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {dayUp?"Equity & gold funds led gains today. Long-term XIRR remains strong."
                        :"Market correction. Your fundamentals are solid — long-term trend at "+pct(retPct)+"."}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-[22px] font-black tracking-tight ${dayUp?"text-emerald-600":"text-red-600"}`}>
                    {dayUp?"+":""}{dayPct.toFixed(2)}%
                  </div>
                  <div className={`text-[12px] font-semibold ${dayUp?"text-emerald-500":"text-red-500"}`}>
                    {dayUp?"+":""}{fmt(dayAmt, hide)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">vs yesterday</div>
                </div>
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon:"🧠", label:"AI Insights", sub:"Fund signals", href:"/intelligence", bg:"bg-violet-50 hover:bg-violet-100 border-violet-100" },
                { icon:"⚖️", label:"Rebalance", sub:"Drift analysis", href:"/rebalance", bg:"bg-amber-50 hover:bg-amber-100 border-amber-100" },
                { icon:"🌾", label:"Tax Harvest", sub:taxSave>0?`Save ${fmt(taxSave)}`:"Review gains", href:"/tax-harvesting", bg:"bg-emerald-50 hover:bg-emerald-100 border-emerald-100" },
                { icon:"🎯", label:"Goals", sub:"Plan your future", href:"/goals", bg:"bg-blue-50 hover:bg-blue-100 border-blue-100" },
              ].map((a,i)=>(
                <Link key={i} href={a.href} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-sm ${a.bg}`}>
                  <span className="text-2xl flex-shrink-0">{a.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-gray-900 truncate">{a.label}</div>
                    <div className="text-[11px] text-gray-500 truncate">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── TABS ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100">
                {[["overview","Overview"],["funds","Fund Holdings"],["insights","Insights"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setTab(id as any)}
                    className={`flex-1 py-3.5 text-[13px] font-semibold transition-all ${tab===id?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW ── */}
              {tab==="overview" && (
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Growth chart */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[13px] font-semibold text-gray-900">Portfolio vs Nifty 50</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">12-month performance</div>
                        </div>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                          {["3M","6M","1Y","All"].map(p=>(
                            <button key={p} className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-colors ${p==="1Y"?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={growth} margin={{top:4,right:4,bottom:0,left:-20}}>
                          <defs>
                            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15}/>
                              <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.08}/>
                              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                          <XAxis dataKey="m" stroke="#e2e8f0" fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                          <YAxis stroke="#e2e8f0" fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                          <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}} formatter={(v:number,n:string)=>[fmt(v),n==="p"?"Portfolio":"Nifty 50"]}/>
                          <Area type="monotone" dataKey="p" stroke="#16a34a" fill="url(#gP)" strokeWidth={2} name="p" dot={false} activeDot={{r:4,fill:"#16a34a"}}/>
                          <Area type="monotone" dataKey="n" stroke="#cbd5e1" fill="url(#gN)" strokeWidth={1.5} name="n" dot={false} strokeDasharray="4 4" activeDot={{r:3,fill:"#94a3b8"}}/>
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-5 mt-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><div className="w-4 h-0.5 bg-emerald-500 rounded-full"/>Your Portfolio</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><div className="w-4 h-0.5 bg-slate-300 rounded-full" style={{backgroundImage:"repeating-linear-gradient(90deg,#cbd5e1 0,#cbd5e1 3px,transparent 3px,transparent 6px)"}}/>Nifty 50</div>
                      </div>
                    </div>

                    {/* Allocation */}
                    <div className="lg:col-span-2">
                      <div className="text-[13px] font-semibold text-gray-900 mb-1">Asset Allocation</div>
                      <div className="text-[11px] text-gray-400 mb-4">By current value</div>
                      <div className="flex justify-center mb-4">
                        <ResponsiveContainer width={160} height={160}>
                          <PieChart>
                            <Pie data={alloc} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                              {alloc.map((e,i)=><Cell key={i} fill={e.color} strokeWidth={0}/>)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,fontSize:11}} formatter={(v:number)=>`${v}%`}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5">
                        {alloc.map(a=>(
                          <div key={a.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                              <span className="text-[12px] text-gray-600">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{width:`${a.value}%`,backgroundColor:a.color}}/>
                              </div>
                              <span className="text-[12px] font-semibold text-gray-900 w-8 text-right">{a.value}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top / Bottom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-3">🔥 Top Performers</div>
                      <div className="space-y-2">
                        {top3.map((h,i)=>(
                          <button key={i} onClick={()=>setSelectedFund(h)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all text-left group">
                            <div className="w-6 h-6 bg-gray-100 group-hover:bg-emerald-100 rounded-lg flex items-center justify-center text-[11px] font-bold text-gray-500 group-hover:text-emerald-700 flex-shrink-0 transition-colors">{i+1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-gray-900 truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,30)}</div>
                              <div className="text-[10px] text-gray-400 truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,25)}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[13px] font-bold text-emerald-600">+{(h.returnsPercent||0).toFixed(1)}%</div>
                              <div className="text-[10px] text-gray-400">{fmt(h.value||0,hide)}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-3">⚠️ Needs Attention</div>
                      <div className="space-y-2">
                        {bot3.length>0 ? bot3.map((h,i)=>(
                          <button key={i} onClick={()=>setSelectedFund(h)}
                            className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all text-left group">
                            <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center text-red-500 flex-shrink-0">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-gray-900 truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,30)}</div>
                              <div className="text-[10px] text-gray-400 truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,25)}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[13px] font-bold text-red-600">{(h.returnsPercent||0).toFixed(1)}%</div>
                              <div className="text-[10px] text-gray-400">{fmt(h.value||0,hide)}</div>
                            </div>
                          </button>
                        )) : (
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span className="text-[12px] text-emerald-700 font-medium">All funds in profit 🎉</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── FUNDS ── */}
              {tab==="funds" && (
                <div>
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-gray-900">All Holdings <span className="text-gray-400 font-normal">({holdings.length})</span></span>
                    <span className="text-[11px] text-gray-400">{fmt(totalInv,hide)} → {fmt(totalCur,hide)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[580px]">
                      <thead>
                        <tr className="border-b border-gray-50">
                          {["Fund","Category","Invested","Value","Return","Signal"].map(h=>(
                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-400 tracking-widest uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((h:any,i:number)=>{
                          const r=h.returnsPercent||0, s=sig(r);
                          return (
                            <tr key={i} onClick={()=>setSelectedFund(h)}
                              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                              <td className="px-4 py-3">
                                <div className="text-[13px] font-semibold text-gray-900 max-w-[180px] truncate group-hover:text-emerald-700 transition-colors">{(h.name||"").replace(/ - Gr$/,"")}</div>
                                {(h.sip||0)>0&&<span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-semibold">SIP ₹{(h.sip||0).toLocaleString("en-IN")}</span>}
                              </td>
                              <td className="px-4 py-3 text-[11px] text-gray-400 max-w-[100px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)}</td>
                              <td className="px-4 py-3 text-[13px] text-gray-600 font-mono">{fmt(h.invested||0,hide)}</td>
                              <td className="px-4 py-3 text-[13px] font-semibold font-mono" style={{color:r>=0?"#16a34a":"#dc2626"}}>{fmt(h.value||0,hide)}</td>
                              <td className="px-4 py-3">
                                <div className={`text-[13px] font-bold ${r>=0?"text-emerald-600":"text-red-600"}`}>{r>=0?"+":""}{r.toFixed(1)}%</div>
                                <div className={`text-[10px] ${r>=0?"text-emerald-400":"text-red-400"}`}>{r>=0?"+":""}{fmt((h.value||0)-(h.invested||0),hide)}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                                  {s.l}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-50 bg-amber-50">
                    <span className="text-[11px] text-amber-600">Budget 2024 · Equity LTCG (12m+): 12.5% above ₹1.25L · STCG: 20% · Debt: slab rate</span>
                  </div>
                </div>
              )}

              {/* ── INSIGHTS ── */}
              {tab==="insights" && (
                <div className="p-5 sm:p-6 space-y-3">
                  {taxSave>0&&(
                    <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-gray-900 mb-1">Tax harvest — save {fmt(taxSave)} this year</div>
                        <div className="text-[12px] text-gray-500">Book ₹1.25L LTCG gains before March 31st — reinvest same day. You keep the units, you lose the tax liability.</div>
                        <Link href="/tax-harvesting" className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 mt-2 hover:underline">View plan →</Link>
                      </div>
                    </div>
                  )}
                  {losers.map((h,i)=>(
                    <div key={i} className="flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-gray-900 mb-1">{(h.name||"").replace(/ - Gr$/,"").substring(0,40)} — underperforming</div>
                        <div className="text-[12px] text-gray-500">Down {(h.returnsPercent||0).toFixed(1)}%. Pause SIP and review. Consider switching to Parag Parikh Flexi Cap or Mirae Asset Large & Mid Cap.</div>
                        <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-700 mt-2 hover:underline">Get AI analysis →</Link>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-gray-900 mb-1">XIRR {meta?.xirr||13.3}% — beating Nifty 50</div>
                      <div className="text-[12px] text-gray-500">Your portfolio return of {retPct.toFixed(1)}% outperforms the market benchmark of ~12%. Star: {top3[0]?.name?.replace(/ - Gr$/,"").substring(0,28)} (+{(top3[0]?.returnsPercent||0).toFixed(1)}%).</div>
                      <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 mt-2 hover:underline">Full analysis →</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-gray-900 mb-1">Know your real risk tolerance</div>
                      <div className="text-[12px] text-gray-500">5 behavioural questions that reveal how you actually react in market downturns — not just what you think you'll do.</div>
                      <button onClick={()=>{setShowRisk(true);setRiskStep(0);setRiskAns([]);setRiskResult(null);}} className="inline-flex items-center gap-1 text-[12px] font-semibold text-violet-700 mt-2 hover:underline">Take the quiz →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── AUTO-CONNECT BANNER ── */}
            <div className="bg-gray-900 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white text-[15px] font-bold">Auto Portfolio Sync</span>
                    <span className="px-2 py-0.5 bg-white/10 text-[10px] font-bold text-gray-400 rounded-full tracking-wide uppercase">Coming Soon</span>
                  </div>
                  <p className="text-gray-400 text-[12px] max-w-lg leading-relaxed">Connect via MF Central (CAMS + KFintech) with one-time OTP. Portfolio syncs daily — no more uploading statements.</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","MF Central"].map(p=>(
                      <span key={p} className="px-2 py-1 bg-white/5 text-[10px] text-gray-500 rounded-lg border border-white/10 font-medium">{p}</span>
                    ))}
                  </div>
                </div>
                <button className="flex-shrink-0 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-[13px] font-bold hover:bg-gray-100 transition-colors">
                  Join Waitlist →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── OVERLAYS ── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setSidebarOpen(false)}/>}

      {/* Fund Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm" onClick={()=>setSelectedFund(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug">{(selectedFund.name||"").replace(/ - Gr$/,"")}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{selectedFund.category}</p>
                </div>
                <button onClick={()=>setSelectedFund(null)} className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l:"Invested", v:fmt(selectedFund.invested||0,hide) },
                  { l:"Current Value", v:fmt(selectedFund.value||0,hide) },
                  { l:"Gain / Loss", v:(selectedFund.returnsPercent>=0?"+":"")+fmt((selectedFund.value||0)-(selectedFund.invested||0),hide) },
                  { l:"Returns", v:(selectedFund.returnsPercent>=0?"+":"")+Number(selectedFund.returnsPercent||0).toFixed(1)+"%" },
                ].map((item,i)=>(
                  <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{item.l}</div>
                    <div className={`text-[14px] font-bold ${(i===2||i===3)?(selectedFund.returnsPercent>=0?"text-emerald-600":"text-red-600"):"text-gray-900"}`}>{item.v}</div>
                  </div>
                ))}
              </div>
              {(() => { const s=sig(selectedFund.returnsPercent||0); return (
                <div className={`flex items-center justify-between p-3 rounded-xl border ${s.bg} border-gray-100`}>
                  <span className="text-[12px] font-semibold text-gray-700">AI Signal</span>
                  <span className={`flex items-center gap-1.5 text-[12px] font-bold ${s.text}`}>
                    <span className={`w-2 h-2 rounded-full ${s.dot}`}/>{s.l}
                  </span>
                </div>
              );})()}
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/intelligence" className="py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-bold text-center hover:bg-gray-800 transition-colors">AI Analysis</Link>
                <Link href="/tax-harvesting" className="py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[12px] font-bold text-center hover:bg-gray-200 transition-colors">Tax Plan</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Modal */}
      {showRisk && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gray-900 px-6 py-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-white font-bold text-[15px]">Risk Profile Quiz</h3>
                <button onClick={()=>setShowRisk(false)} className="text-gray-500 hover:text-gray-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-gray-500 text-[12px]">5 questions · understand your real risk tolerance</p>
              {!riskResult && (
                <div className="mt-4 bg-white/10 rounded-full h-1 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{width:`${(riskStep/RISK_QS.length)*100}%`}}/>
                </div>
              )}
            </div>
            <div className="p-6">
              {riskResult ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">{riskResult.e}</div>
                  <div className="text-[20px] font-black text-gray-900 mb-1">{riskResult.t} Investor</div>
                  <div className="text-[12px] text-gray-500 mb-3 leading-relaxed">{riskResult.desc}</div>
                  <div className="text-[13px] font-semibold text-gray-700 bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">{riskResult.rec}</div>
                  <button onClick={()=>setShowRisk(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-[13px] hover:bg-gray-800 transition-colors">Apply to Portfolio</button>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] text-gray-400 mb-3 font-medium">{riskStep+1} of {RISK_QS.length}</div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-5 leading-snug">{RISK_QS[riskStep].q}</h3>
                  <div className="space-y-2">
                    {RISK_QS[riskStep].opts.map((opt,i)=>(
                      <button key={i} onClick={()=>handleRisk(RISK_QS[riskStep].s[i])}
                        className="w-full text-left px-4 py-3.5 border border-gray-200 rounded-xl text-[13px] text-gray-700 hover:border-gray-900 hover:bg-gray-50 transition-all font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {riskStep>0&&<button onClick={()=>{setRiskStep(riskStep-1);setRiskAns(riskAns.slice(0,-1));}} className="mt-4 text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1">← Back</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
