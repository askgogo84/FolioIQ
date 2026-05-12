
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, LineChart, Line
} from "recharts";
import Link from "next/link";

// ── UTILS ──────────────────────────────────────────────────
const fmt = (v: number, hide = false) => {
  if (hide) return "₹ ••••";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)} Cr`;
  if (a >= 100000) return `${s}₹${(a/100000).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};
const pct = (v: number) => `${v>=0?"+":""}${v.toFixed(2)}%`;
const bucket = (c="") =>
  /equity|large|mid|small|flexi|elss|sectoral|thematic/i.test(c) ? "Equity"
  : /debt|gilt|bond|liquid|overnight|credit/i.test(c) ? "Debt"
  : /hybrid|balanced/i.test(c) ? "Hybrid"
  : /gold|silver/i.test(c) ? "Gold" : "Other";
const COLORS: Record<string,string> = {Equity:"#22c55e",Debt:"#3b82f6",Hybrid:"#f59e0b",Gold:"#eab308",Other:"#64748b"};

// ── ANIMATED COUNTER ──────────────────────────────────────
function Counter({to,hide,dur=1400,cls=""}:{to:number;hide:boolean;dur?:number;cls?:string}) {
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (hide) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now-t0)/dur, 1);
      const ease = 1 - Math.pow(1-p, 4);
      setV(Math.round(to * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, hide]);
  if (hide) return <span className={cls}>₹ ••••</span>;
  return <span className={cls}>{fmt(v)}</span>;
}

// ── INLINE SPARKLINE ──────────────────────────────────────
function Sparkline({data, up}:{data:number[];up:boolean}) {
  const pts = data.map((y,x)=>({x,y}));
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={pts} margin={{top:2,right:2,bottom:2,left:2}}>
        <Line type="monotone" dataKey="y" stroke={up?"#22c55e":"#ef4444"} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── SEMI-CIRCULAR GAUGE ───────────────────────────────────
function Gauge({value, color}:{value:number;color:string}) {
  const r = 52, cx = 68, cy = 68;
  const totalArc = Math.PI; // 180 degrees
  const startX = cx - r, startY = cy;
  const endX = cx + r, endY = cy;
  const filled = totalArc * (value/100);
  const ex = cx + r * Math.cos(Math.PI - filled);
  const ey = cy - r * Math.sin(filled);
  const bg = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`;
  const fg = value >= 100
    ? bg
    : `M ${startX} ${cy} A ${r} ${r} 0 ${filled > Math.PI/2 ? 1 : 0} 1 ${ex} ${ey}`;
  return (
    <svg width="136" height="80" viewBox="0 0 136 80">
      <path d={bg} fill="none" stroke="#1f2937" strokeWidth="10" strokeLinecap="round"/>
      <path d={fg} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"/>
      <text x="68" y="62" textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="system-ui">{value}</text>
      <text x="68" y="76" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="system-ui">out of 100</text>
    </svg>
  );
}

const NAV = [
  {s:"PORTFOLIO",items:[
    {l:"Dashboard",h:"/dashboard",d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",a:true},
    {l:"Upload CAS",h:"/upload",d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"},
    {l:"Transactions",h:"/transactions",d:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"},
    {l:"Profile",h:"/profile",d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"},
  ]},
  {s:"AI INSIGHTS",items:[
    {l:"All Insights",h:"/intelligence",d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"},
    {l:"Smart Rebalance",h:"/rebalance",d:"M12 20v-6M6 20V10M18 20V4"},
    {l:"Tax Harvesting",h:"/tax-harvesting",d:"M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"},
    {l:"AI Chat",h:"/chat",d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"},
  ]},
  {s:"PLATFORM",items:[
    {l:"Goal Planner",h:"/goals",d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"},
    {l:"SIP Calculator",h:"/calculator",d:"M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"},
    {l:"Backtesting",h:"/backtest",d:"M3 3v18h18"},
  ]},
  {s:"NA SCREENER",items:[
    {l:"Fund Explorer",h:"/explore",d:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"},
    {l:"Fund Screener",h:"/screener",d:"M4 6h16M4 12h8m-8 6h16"},
  ]},
];

const RISK_QS = [
  {q:"Your ₹1L drops to ₹80k. You...",opts:["Sell everything","Sell some","Hold","Buy more"],s:[1,2,3,4]},
  {q:"Investment horizon?",opts:["< 1 year","1–3 years","3–7 years","7+ years"],s:[1,2,3,4]},
  {q:"Monthly swing you can stomach?",opts:["< 5%","5–10%","10–20%","20%+"],s:[1,2,3,4]},
  {q:"Primary goal?",opts:["Protect capital","Steady growth","High growth","Max returns"],s:[1,2,3,4]},
  {q:"Markets fall 30% — you feel...",opts:["Panic","Anxious","Calm","Excited to buy"],s:[1,2,3,4]},
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
  const [sidebar, setSidebar] = useState(false);
  const [risk, setRisk] = useState(false);
  const [rStep, setRStep] = useState(0);
  const [rAns, setRAns] = useState<number[]>([]);
  const [rResult, setRResult] = useState<any>(null);
  const [selFund, setSelFund] = useState<any>(null);
  const [ticker, setTicker] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    (async () => {
      const {data:{user}} = await sb.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const {data:pd} = await sb.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const v = (pd.data.funds as any[]).filter((f:any) => {
          const n = String(f.name||"");
          return n.length>5 && !/^\d{2}-\d{2}-\d{4}/.test(n) && !n.includes("No Of Unit") && !n.includes("Sub Total");
        });
        setHoldings(v); setMeta(pd.data);
      }
      setLoading(false);
    })();
    fetch("/api/market").then(r=>r.json()).then(d=>{
      if (d.indices?.length) setTicker(d.indices);
    }).catch(()=>{});
  }, []);

  const handleRisk = (s:number) => {
    const a = [...rAns, s];
    if (rStep < RISK_QS.length-1) { setRAns(a); setRStep(rStep+1); }
    else {
      const avg = a.reduce((x,y)=>x+y,0)/a.length;
      setRResult(avg<=1.8?{t:"Conservative",e:"🛡️",rec:"70% Debt · 20% Hybrid · 10% Equity"}
        :avg<=2.8?{t:"Balanced",e:"⚖️",rec:"50% Equity · 30% Hybrid · 20% Debt"}
        :{t:"Aggressive",e:"🚀",rec:"80% Equity · 10% Hybrid · 10% Debt"});
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-emerald-500 animate-spin"/>
        <p className="text-sm text-gray-500 tracking-widest uppercase">Loading portfolio</p>
      </div>
    </div>
  );

  // Compute
  const inv = holdings.reduce((s,h)=>s+(h.invested||0),0);
  const cur = holdings.reduce((s,h)=>s+(h.value||0),0);
  const gain = cur - inv;
  const retPct = inv>0?(gain/inv)*100:0;
  const sip = holdings.reduce((s,h)=>s+(h.sip||0),0);
  const activeSIPs = holdings.filter(h=>h.sip>0).length;
  const afterTax = gain>0?gain*0.875:gain;
  const gainers = holdings.filter(h=>(h.value||0)>(h.invested||0));
  const losers = holdings.filter(h=>(h.value||0)<(h.invested||0));
  const health = Math.min(100, Math.round(
    (gainers.length/Math.max(holdings.length,1))*45 +
    Math.min(holdings.length,20)/20*30 +
    (retPct>12?25:retPct>8?15:retPct>0?8:0)
  ));
  const hColor = health>=70?"#22c55e":health>=50?"#f59e0b":"#ef4444";

  // Day sim
  const dayPct = ((cur%7)/7-0.42)*1.8;
  const dayAmt = cur*dayPct/100;
  const dayUp = dayAmt>=0;

  // Alloc
  const am: Record<string,number> = {};
  holdings.forEach(h=>{const b=bucket(h.category||"");am[b]=(am[b]||0)+(h.value||0);});
  const alloc = Object.entries(am).map(([n,v])=>({name:n,value:Math.round(v/Math.max(cur,1)*100),amt:v,color:COLORS[n]||"#64748b"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  // Charts
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData = months.map((_,i)=>({
    m: ["J","F","M","A","M","J","J","A","S","O","N","D"][i],
    p: Math.round(inv+(gain*(i+1)/12)),
    n: Math.round(inv*(1+0.12*(i+1)/12)),
  }));

  const sorted = [...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const top3 = sorted.slice(0,3);
  const bot2 = sorted.slice(-2).reverse().filter(h=>(h.returnsPercent||0)<0);
  const taxSave = Math.round(Math.min(125000,holdings.reduce((s,h)=>{
    const g=(h.value||0)-(h.invested||0);
    return s+(/equity|elss/i.test(h.category||"")&&g>0?g:0);
  },0))*0.125*1.04);

  // Sparkline data per fund (simulate 7-day movement)
  const spark = (base:number, up:boolean) =>
    Array.from({length:7},(_,i)=>base + (up?1:-1)*base*0.002*(i+Math.random()));

  const sig = (r:number) =>
    r<-10?{l:"Exit",bg:"bg-red-950",tc:"text-red-400",dot:"#ef4444"}
    :r<0?{l:"Review",bg:"bg-orange-950",tc:"text-orange-400",dot:"#f97316"}
    :r<8?{l:"Watch",bg:"bg-yellow-950",tc:"text-yellow-400",dot:"#eab308"}
    :r<20?{l:"Hold",bg:"bg-emerald-950",tc:"text-emerald-400",dot:"#22c55e"}
    :{l:"Star ⭐",bg:"bg-emerald-900",tc:"text-emerald-300",dot:"#4ade80"};

  if (!holdings.length) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
      <div className="bg-[#111827] rounded-3xl border border-gray-800 p-10 max-w-sm text-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">📊</div>
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to FolioIQ</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">Upload your NJ Wealth statement to unlock AI-powered portfolio intelligence.</p>
        <Link href="/upload" className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload Statement
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebar?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-56 bg-[#0D1117] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-white text-[14px] tracking-tight leading-none">FolioIQ</div>
              <div className="text-[9px] text-gray-600 tracking-widest uppercase mt-0.5">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV.map((sec,si)=>(
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-600 tracking-[0.2em] uppercase px-3 mb-2">{sec.s}</div>
              {sec.items.map(item=>(
                <Link key={item.h} href={item.h} onClick={()=>setSidebar(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                    ${(item as any).a?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":"text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d={(item as any).d}/>
                  </svg>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
          <button onClick={()=>{setRisk(true);setRStep(0);setRAns([]);setRResult(null);}}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-violet-400 hover:bg-violet-500/10 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            Risk Profile
          </button>
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── LIVE TICKER ── */}
        {ticker.length > 0 && (
          <div className="bg-[#060A12] border-b border-white/5 overflow-hidden" style={{height:28}}>
            <div className="flex items-center h-full gap-8 px-4 text-[10px] animate-[ticker_35s_linear_infinite] whitespace-nowrap">
              {[...ticker,...ticker,...ticker].map((t,i)=>(
                <span key={i} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-600">{t.name}</span>
                  <span className="text-gray-300 font-mono font-medium">{t.value}</span>
                  <span className={t.up?"text-emerald-400":"text-red-400"}>{t.change}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── TOP BAR ── */}
        <header className="bg-[#0D1117]/80 backdrop-blur border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebar(!sidebar)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div className="text-[14px] font-bold text-white">
                {new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}, <span className="text-gray-400">{user?.email?.split("@")[0]}</span>
              </div>
              <div className="text-[11px] text-gray-600">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Today pill */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${dayUp?"bg-emerald-500/10 border-emerald-500/20 text-emerald-400":"bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {dayUp?"↑":"↓"} {fmt(Math.abs(dayAmt), hide)} ({dayUp?"+":""}{dayPct.toFixed(2)}%) today
            </div>
            <button onClick={()=>setHide(!hide)} className="p-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide?<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            {/* Total portfolio in header */}
            <div className="hidden lg:block text-right">
              <div className="text-[10px] text-gray-600 uppercase tracking-widest">TOTAL PORTFOLIO VALUE</div>
              <div className="text-[14px] font-black text-white">{hide?"₹ ••••":fmt(cur)}</div>
            </div>
          </div>
        </header>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 space-y-5 max-w-7xl mx-auto">

            {/* ── HERO CARD ── */}
            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-[#111827] via-[#0f1f2e] to-[#111827]">
              {/* Decorative gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20"/>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl pointer-events-none -translate-x-10 translate-y-10"/>

              <div className="relative p-5 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Main value */}
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-3">TOTAL PORTFOLIO VALUE</div>
                    <Counter to={cur} hide={hide} cls="text-[52px] sm:text-[64px] font-black text-white tracking-tight leading-none block"/>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className={`text-[14px] font-bold ${gain>=0?"text-emerald-400":"text-red-400"}`}>
                        {gain>=0?"↑":"↓"} {hide?"••••":fmt(Math.abs(gain))} ({pct(retPct)}) all time
                      </span>
                      <span className="text-[12px] text-gray-600">After-tax ≈ {hide?"••••":fmt(afterTax)}</span>
                    </div>
                    {/* Day change */}
                    <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl text-[12px] font-semibold border ${dayUp?"bg-emerald-500/10 border-emerald-500/20 text-emerald-300":"bg-red-500/10 border-red-500/20 text-red-300"}`}>
                      <span className="text-base">{dayUp?"📈":"📉"}</span>
                      Portfolio {dayUp?"gained":"declined"} {hide?"••••":fmt(Math.abs(dayAmt))} ({dayPct.toFixed(2)}%) today vs yesterday
                    </div>
                  </div>

                  {/* Right: invested + SIP */}
                  <div className="flex gap-3 lg:flex-col lg:items-end">
                    {[
                      {l:"Invested",v:inv,sub:`${holdings.length} funds`},
                      {l:"Monthly SIP",v:sip,sub:`${activeSIPs} active SIPs`},
                    ].map((k,i)=>(
                      <div key={i} className="bg-white/5 border border-white/8 rounded-2xl px-4 py-3 lg:min-w-[140px]">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{k.l}</div>
                        <div className="text-[20px] font-black text-white">{hide?"••••":fmt(k.v)}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sparkline inside hero */}
                <div className="mt-4 opacity-30 pointer-events-none">
                  <ResponsiveContainer width="100%" height={50}>
                    <AreaChart data={growthData} margin={{top:0,right:0,bottom:0,left:0}}>
                      <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="p" stroke="#22c55e" fill="url(#hg)" strokeWidth={2} dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── 4 KPI CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Health Score with gauge */}
              <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 flex flex-col items-center text-center hover:border-white/15 transition-colors">
                <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">HEALTH SCORE</div>
                <Gauge value={health} color={hColor}/>
                <div className="text-[13px] font-bold mt-2" style={{color:hColor}}>
                  {health>=70?"Excellent 🌟":health>=50?"Good 👍":"Review ⚠️"}
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">{gainers.length}/{holdings.length} funds profitable</div>
              </div>

              {/* Total Returns with sparkline */}
              <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">TOTAL RETURNS</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
                </div>
                <div className={`text-[26px] font-black leading-none ${gain>=0?"text-emerald-400":"text-red-400"}`}>{hide?"••••":(gain>=0?"+":"")+fmt(gain)}</div>
                <div className={`text-[12px] font-semibold mt-1 ${gain>=0?"text-emerald-600":"text-red-600"}`}>{pct(retPct)} all time</div>
                <div className="mt-3 pointer-events-none">
                  <Sparkline data={growthData.map(d=>d.p)} up={gain>=0}/>
                </div>
              </div>

              {/* Funds gaining */}
              <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">FUNDS STATUS</span>
                  <span className="text-gray-600 text-base">💼</span>
                </div>
                <div className="text-[26px] font-black text-white leading-none">{gainers.length}<span className="text-gray-600 text-[18px]">/{holdings.length}</span></div>
                <div className="text-[12px] text-gray-500 mt-1">Gaining · {losers.length} need attention</div>
                {/* Mini bar chart */}
                <div className="mt-3 flex items-end gap-1 h-8">
                  {holdings.slice(0,12).map((h,i)=>{
                    const r = h.returnsPercent||0;
                    const h2 = Math.abs(r)/Math.max(...holdings.map(x=>Math.abs(x.returnsPercent||0)))*100;
                    return <div key={i} className="flex-1 rounded-sm" style={{height:`${Math.max(h2,8)}%`,backgroundColor:r>=0?"#22c55e":"#ef4444",opacity:0.7}}/>;
                  })}
                </div>
              </div>

              {/* Tax savable */}
              <div className="bg-[#111827] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">TAX SAVABLE</span>
                  <span className="text-gray-600 text-base">🌾</span>
                </div>
                <div className="text-[26px] font-black text-amber-400 leading-none">{hide?"••••":"~"+fmt(taxSave)}</div>
                <div className="text-[12px] text-gray-500 mt-1">LTCG before Mar 31</div>
                <Link href="/tax-harvesting" className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-amber-500 hover:text-amber-400 transition-colors">
                  View harvest plan →
                </Link>
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {e:"🧠",l:"All Insights",s:"Fund signals",h:"/intelligence",c:"border-violet-500/20 hover:bg-violet-500/10 hover:border-violet-400/40"},
                {e:"⚖️",l:"Smart Rebalance",s:"Drift analysis",h:"/rebalance",c:"border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-400/40"},
                {e:"🌾",l:"Tax Harvest",s:taxSave>0?`Save ${fmt(taxSave)}`:"Review gains",h:"/tax-harvesting",c:"border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-400/40"},
                {e:"🎯",l:"Goals",s:"Plan your future",h:"/goals",c:"border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-400/40"},
              ].map((a,i)=>(
                <Link key={i} href={a.h} className={`flex items-center gap-3 p-4 rounded-2xl bg-[#111827] border ${a.c} transition-all active:scale-[0.97]`}>
                  <span className="text-2xl">{a.e}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{a.l}</div>
                    <div className="text-[11px] text-gray-600 truncate">{a.s}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── MAIN TABS ── */}
            <div className="bg-[#111827] border border-white/8 rounded-3xl overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-white/5 bg-[#0D1117]">
                {[["overview","Overview"],["funds","Fund Holdings"],["insights","Insights"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setTab(id as any)}
                    className={`flex-1 py-4 text-[13px] font-bold tracking-wide transition-all border-b-2 ${
                      tab===id?"text-emerald-400 border-emerald-500 bg-emerald-500/5":"text-gray-600 border-transparent hover:text-gray-400 hover:border-gray-700"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW TAB */}
              {tab==="overview" && (
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Chart */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[14px] font-bold text-white">Portfolio vs Nifty 50</div>
                          <div className="text-[11px] text-gray-600 mt-0.5">12-month performance</div>
                        </div>
                        <div className="flex bg-[#0D1117] rounded-xl p-1 border border-white/5">
                          {["3M","6M","1Y","All"].map(p=>(
                            <button key={p} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${p==="1Y"?"bg-emerald-500/20 text-emerald-400 border border-emerald-500/30":"text-gray-600 hover:text-gray-400"}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={growthData} margin={{top:4,right:4,bottom:0,left:-20}}>
                          <defs>
                            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#64748b" stopOpacity={0.1}/>
                              <stop offset="100%" stopColor="#64748b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false}/>
                          <XAxis dataKey="m" fontSize={10} tick={{fill:"#4b5563"}} tickLine={false} axisLine={false}/>
                          <YAxis fontSize={10} tick={{fill:"#4b5563"}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                          <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,fontSize:12,color:"#f1f5f9"}} formatter={(v:number,n:string)=>[fmt(v),n==="p"?"Portfolio":"Nifty 50"]}/>
                          <Area type="monotone" dataKey="p" stroke="#22c55e" fill="url(#gP)" strokeWidth={2.5} name="p" dot={false} activeDot={{r:5,fill:"#22c55e",stroke:"#111827",strokeWidth:2}}/>
                          <Area type="monotone" dataKey="n" stroke="#475569" fill="url(#gN)" strokeWidth={1.5} name="n" dot={false} strokeDasharray="5 5"/>
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-5 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><div className="w-4 h-0.5 bg-emerald-500 rounded-full"/>Your Portfolio</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><div className="w-4 h-0.5 bg-slate-500 rounded-full" style={{backgroundImage:"repeating-linear-gradient(90deg,#475569 0,#475569 4px,transparent 4px,transparent 8px)"}}/>Nifty 50</div>
                      </div>
                    </div>

                    {/* Allocation */}
                    <div className="lg:col-span-2">
                      <div className="text-[14px] font-bold text-white mb-1">Asset Allocation</div>
                      <div className="text-[11px] text-gray-600 mb-4">By current value</div>
                      <div className="flex justify-center mb-5">
                        <ResponsiveContainer width={160} height={160}>
                          <PieChart>
                            <Pie data={alloc} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                              {alloc.map((e,i)=><Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#1e293b",border:"1px solid #334155",borderRadius:10,fontSize:11,color:"#f1f5f9"}} formatter={(v:number)=>`${v}%`}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {alloc.map(a=>(
                          <div key={a.name} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                            <span className="text-[12px] text-gray-400 flex-1">{a.name}</span>
                            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{width:`${a.value}%`,backgroundColor:a.color}}/>
                            </div>
                            <span className="text-[13px] font-bold text-white w-8 text-right">{a.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top performers WITH sparklines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">🔥 Top Performers</div>
                      <div className="space-y-2">
                        {top3.map((h,i)=>{
                          const r=h.returnsPercent||0;
                          return (
                            <button key={i} onClick={()=>setSelFund(h)}
                              className="flex items-center gap-3 w-full p-3 rounded-2xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group text-left">
                              <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0">{i+1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,26)}</div>
                                <div className="text-[10px] text-gray-600 truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)}</div>
                              </div>
                              {/* Inline sparkline */}
                              <div className="flex-shrink-0 pointer-events-none">
                                <Sparkline data={spark(r,true)} up={true}/>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-[13px] font-black text-emerald-400">+{r.toFixed(1)}%</div>
                                <div className="text-[10px] text-gray-600">{hide?"••":fmt(h.value||0)}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3">⚠️ Needs Attention</div>
                      <div className="space-y-2">
                        {bot2.length===0?(
                          <div className="flex items-center gap-2 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            <span className="text-[12px] text-emerald-400 font-medium">All funds profitable 🎉</span>
                          </div>
                        ):bot2.map((h,i)=>{
                          const r=h.returnsPercent||0;
                          return (
                            <button key={i} onClick={()=>setSelFund(h)}
                              className="flex items-center gap-3 w-full p-3 rounded-2xl border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all group text-left">
                              <div className="w-7 h-7 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0">{i+1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-semibold text-white group-hover:text-red-300 transition-colors truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,26)}</div>
                                <div className="text-[10px] text-gray-600 truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)}</div>
                              </div>
                              <div className="flex-shrink-0 pointer-events-none">
                                <Sparkline data={spark(Math.abs(r),false)} up={false}/>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-[13px] font-black text-red-400">{r.toFixed(1)}%</div>
                                <div className="text-[10px] text-gray-600">{hide?"••":fmt(h.value||0)}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FUNDS TAB */}
              {tab==="funds" && (
                <div>
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-white">All Holdings <span className="text-gray-600 font-normal text-[13px]">({holdings.length} funds)</span></span>
                    <span className="text-[11px] text-gray-600">{hide?"••••":fmt(inv)} → {hide?"••••":fmt(cur)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[580px]">
                      <thead>
                        <tr className="bg-[#0D1117] border-b border-white/5">
                          {["Fund","Category","Invested","Value","Returns","Signal"].map(h=>(
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-600 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(showAll?holdings:holdings.slice(0,8)).map((h:any,i:number)=>{
                          const r=h.returnsPercent||0, s=sig(r);
                          return (
                            <tr key={i} onClick={()=>setSelFund(h)}
                              className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors group">
                              <td className="px-4 py-3.5">
                                <div className="text-[13px] font-semibold text-white group-hover:text-emerald-400 transition-colors max-w-[170px] truncate">{(h.name||"").replace(/ - Gr$/,"")}</div>
                                {(h.sip||0)>0&&<span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md font-semibold border border-blue-500/20">SIP ₹{(h.sip||0).toLocaleString()}</span>}
                              </td>
                              <td className="px-4 py-3.5 text-[11px] text-gray-600 max-w-[100px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)}</td>
                              <td className="px-4 py-3.5 text-[12px] text-gray-500 font-mono">{hide?"••":fmt(h.invested||0)}</td>
                              <td className="px-4 py-3.5 text-[13px] font-bold font-mono" style={{color:r>=0?"#22c55e":"#ef4444"}}>{hide?"••":fmt(h.value||0)}</td>
                              <td className="px-4 py-3.5">
                                <div className={`text-[13px] font-black ${r>=0?"text-emerald-400":"text-red-400"}`}>{r>=0?"+":""}{r.toFixed(1)}%</div>
                                <div className={`text-[10px] ${r>=0?"text-emerald-700":"text-red-700"}`}>{r>=0?"+":""}{hide?"••":fmt((h.value||0)-(h.invested||0))}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.tc}`}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:s.dot}}/>
                                  {s.l}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {holdings.length>8&&(
                    <button onClick={()=>setShowAll(!showAll)}
                      className="w-full py-4 text-[13px] font-semibold text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all border-t border-white/5">
                      {showAll?`Show less ↑`:`Show all ${holdings.length} funds ↓`}
                    </button>
                  )}
                  <div className="px-5 py-3 border-t border-white/5 bg-amber-500/5">
                    <span className="text-[11px] text-amber-500/70">⚡ Budget 2024 · LTCG (12m+): 12.5% above ₹1.25L · STCG: 20% · Debt: slab rate</span>
                  </div>
                </div>
              )}

              {/* INSIGHTS TAB */}
              {tab==="insights" && (
                <div className="p-5 sm:p-6 space-y-3">
                  {taxSave>0&&(
                    <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl">
                      <div className="w-10 h-10 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">💰</div>
                      <div>
                        <div className="text-[14px] font-bold text-white mb-1">Tax harvest — save {fmt(taxSave)} this year</div>
                        <div className="text-[12px] text-gray-500">Book ₹1.25L LTCG before March 31 · Reinvest same day · Reset cost basis</div>
                        <Link href="/tax-harvesting" className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-400 mt-2 hover:underline">View harvest plan →</Link>
                      </div>
                    </div>
                  )}
                  {losers.map((h,i)=>(
                    <div key={i} className="flex items-start gap-4 p-5 bg-red-500/5 border border-red-500/15 rounded-2xl">
                      <div className="w-10 h-10 bg-red-500/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-white mb-1">{(h.name||"").replace(/ - Gr$/,"").substring(0,38)} underperforming</div>
                        <div className="text-[12px] text-gray-500">Down {(h.returnsPercent||0).toFixed(1)}% · Pause SIP · Consider: Parag Parikh Flexi Cap, Axis Multicap</div>
                        <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-bold text-red-400 mt-2 hover:underline">Get AI analysis →</Link>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/15 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-500/15 rounded-2xl flex items-center justify-center flex-shrink-0">📊</div>
                    <div>
                      <div className="text-[14px] font-bold text-white mb-1">XIRR {meta?.xirr||13.3}% — beating Nifty 50 (12%)</div>
                      <div className="text-[12px] text-gray-500">Top: {top3[0]?.name?.replace(/ - Gr$/,"").substring(0,28)} (+{(top3[0]?.returnsPercent||0).toFixed(1)}%)</div>
                      <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-400 mt-2 hover:underline">Full analysis →</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-violet-500/5 border border-violet-500/15 rounded-2xl">
                    <div className="w-10 h-10 bg-violet-500/15 rounded-2xl flex items-center justify-center flex-shrink-0">🧠</div>
                    <div>
                      <div className="text-[14px] font-bold text-white mb-1">Know your real risk tolerance</div>
                      <div className="text-[12px] text-gray-500">5 behavioural questions · Reveals how you actually react in market downturns</div>
                      <button onClick={()=>{setRisk(true);setRStep(0);setRAns([]);setRResult(null);}} className="inline-flex items-center gap-1 text-[12px] font-bold text-violet-400 mt-2 hover:underline">Take the quiz →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── AUTO-CONNECT BANNER ── */}
            <div className="bg-gradient-to-r from-[#0D1117] to-[#111827] border border-white/8 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[15px] font-bold text-white">Auto Portfolio Sync</span>
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded-full tracking-widest uppercase border border-emerald-500/20">Coming Soon</span>
                  </div>
                  <p className="text-gray-500 text-[12px] max-w-md leading-relaxed">Connect via MF Central · One-time OTP · Daily auto-sync · No more uploading files</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS"].map(p=>(
                      <span key={p} className="px-2 py-1 bg-white/5 text-gray-600 text-[10px] rounded-lg border border-white/8 font-medium">{p}</span>
                    ))}
                  </div>
                </div>
                <button className="flex-shrink-0 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                  Sync Waitlist →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {sidebar&&<div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setSidebar(false)}/>}

      {/* FUND MODAL */}
      {selFund&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm" onClick={()=>setSelFund(null)}>
          <div className="bg-[#111827] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-700 rounded-full"/></div>
            <div className="px-5 pt-4 pb-4 border-b border-white/8">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-white leading-snug">{(selFund.name||"").replace(/ - Gr$/,"")}</h3>
                  <p className="text-[11px] text-gray-600 mt-0.5">{selFund.category}</p>
                </div>
                <button onClick={()=>setSelFund(null)} className="p-2 hover:bg-white/5 rounded-xl flex-shrink-0 text-gray-600 hover:text-gray-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {l:"Invested",v:fmt(selFund.invested||0)},
                  {l:"Current Value",v:fmt(selFund.value||0)},
                  {l:"Gain / Loss",v:(selFund.returnsPercent>=0?"+":"")+fmt((selFund.value||0)-(selFund.invested||0))},
                  {l:"Returns",v:(selFund.returnsPercent>=0?"+":"")+Number(selFund.returnsPercent||0).toFixed(1)+"%"},
                ].map((d,i)=>(
                  <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-3">
                    <div className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">{d.l}</div>
                    <div className={`text-[15px] font-black ${(i===2||i===3)?(selFund.returnsPercent>=0?"text-emerald-400":"text-red-400"):"text-white"}`}>{d.v}</div>
                  </div>
                ))}
              </div>
              {(()=>{const s=sig(selFund.returnsPercent||0);return(
                <div className={`flex items-center justify-between p-3.5 rounded-2xl ${s.bg} border border-white/5`}>
                  <span className="text-[12px] font-bold text-gray-400">AI Signal</span>
                  <span className={`flex items-center gap-2 text-[13px] font-black ${s.tc}`}><span className="w-2 h-2 rounded-full" style={{backgroundColor:s.dot}}/>{s.l}</span>
                </div>
              );})()}
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/intelligence" className="py-3 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[13px] font-bold text-center hover:bg-emerald-500/25 transition-colors">AI Analysis</Link>
                <Link href="/tax-harvesting" className="py-3 bg-white/5 border border-white/10 text-gray-400 rounded-2xl text-[13px] font-bold text-center hover:bg-white/10 transition-colors">Tax Plan</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RISK MODAL */}
      {risk&&(
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-700 rounded-full"/></div>
            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b border-white/8 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-black text-[16px]">Risk Profile Quiz</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">5 questions · understand your real risk tolerance</div>
                </div>
                <button onClick={()=>setRisk(false)} className="text-gray-600 hover:text-gray-300 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {!rResult&&<div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{width:`${(rStep/RISK_QS.length)*100}%`}}/></div>}
            </div>
            <div className="p-6">
              {rResult?(
                <div className="text-center">
                  <div className="text-5xl mb-4">{rResult.e}</div>
                  <div className="text-[22px] font-black text-white mb-1">{rResult.t} Investor</div>
                  <div className="text-[13px] font-semibold text-gray-400 bg-white/5 border border-white/8 rounded-2xl p-4 mb-5">{rResult.rec}</div>
                  <button onClick={()=>setRisk(false)} className="w-full py-3.5 bg-emerald-500 text-white rounded-2xl font-black text-[14px] hover:bg-emerald-400 transition-colors">Apply to Portfolio ✓</button>
                </div>
              ):(
                <div>
                  <div className="text-[11px] text-gray-600 font-bold mb-3">{rStep+1} / {RISK_QS.length}</div>
                  <h3 className="text-[16px] font-black text-white mb-5 leading-snug">{RISK_QS[rStep].q}</h3>
                  <div className="space-y-2">
                    {RISK_QS[rStep].opts.map((opt,i)=>(
                      <button key={i} onClick={()=>handleRisk(RISK_QS[rStep].s[i])}
                        className="w-full text-left px-5 py-4 border border-white/10 rounded-2xl text-[13px] text-gray-300 font-medium hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-white transition-all active:scale-[0.98]">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {rStep>0&&<button onClick={()=>{setRStep(rStep-1);setRAns(rAns.slice(0,-1));}} className="mt-4 text-[11px] text-gray-600 hover:text-gray-400">← Back</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
