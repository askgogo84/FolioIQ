"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import Link from "next/link";

const fmt = (v: number, hide = false) => {
  if (hide) return "₹ ••••";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)} Cr`;
  if (a >= 100000) return `${s}₹${(a/100000).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};
const pct = (v: number) => `${v>=0?"+":""}${v.toFixed(2)}%`;
const bucket = (c="") =>
  /equity|large|mid|small|flexi|elss|sectoral|thematic/i.test(c)?"Equity"
  :/debt|gilt|bond|liquid|overnight|credit/i.test(c)?"Debt"
  :/hybrid|balanced/i.test(c)?"Hybrid"
  :/gold|silver/i.test(c)?"Gold":"Other";
const COLORS: Record<string,string> = {Equity:"#16a34a",Debt:"#2563eb",Hybrid:"#f59e0b",Gold:"#ca8a04",Other:"#7c3aed"};
const PASTEL: Record<string,string> = {Equity:"#dcfce7",Debt:"#dbeafe",Hybrid:"#fef3c7",Gold:"#fef9c3",Other:"#ede9fe"};

function AnimNum({to,hide,prefix="",suffix="",dur=1200,cls=""}:{to:number;hide:boolean;prefix?:string;suffix?:string;dur?:number;cls?:string}) {
  const [v,setV]=useState(0);
  const raf=useRef<number>(0);
  useEffect(()=>{
    if(hide){setV(to);return;}
    const t0=performance.now();
    const tick=(now:number)=>{const p=Math.min((now-t0)/dur,1);setV(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)raf.current=requestAnimationFrame(tick);};
    raf.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf.current);
  },[to,hide]);
  if(hide)return<span className={cls}>{prefix}••••{suffix}</span>;
  return<span className={cls}>{prefix}{fmt(v)}{suffix}</span>;
}

const NAV_ITEMS = [
  {group:"PORTFOLIO",items:[{l:"Dashboard",h:"/dashboard",active:true},{l:"Upload CAS",h:"/upload"},{l:"Connect",h:"/connect"},{l:"Transactions",h:"/transactions"}]},
  {group:"AI TOOLS",items:[{l:"AI Insights",h:"/intelligence"},{l:"Rebalance",h:"/rebalance"},{l:"Tax Harvest",h:"/tax-harvesting"},{l:"AI Chat",h:"/chat"}]},
  {group:"PLAN",items:[{l:"Goals",h:"/goals"},{l:"SIP Calculator",h:"/calculator"},{l:"Screener",h:"/screener"}]},
];

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings,setHoldings]=useState<any[]>([]);
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [hide,setHide]=useState(false);
  const [mobileNav,setMobileNav]=useState(false);
  const [tab,setTab]=useState<"overview"|"holdings"|"insights">("overview");
  const [ticker,setTicker]=useState<any[]>([
    {name:"NIFTY 50",value:"24,315.95",change:"+1.12%",up:true},
    {name:"SENSEX",value:"80,218.37",change:"+1.09%",up:true},
    {name:"MIDCAP 150",value:"17,842.28",change:"+0.87%",up:true},
    {name:"SMALLCAP 250",value:"9,421.55",change:"+1.34%",up:true},
    {name:"NIFTY IT",value:"38,621.48",change:"-0.54%",up:false},
    {name:"GOLD",value:"₹9,342/g",change:"+0.34%",up:true},
    {name:"USD/INR",value:"₹83.42",change:"-0.12%",up:false},
    {name:"10Y G-SEC",value:"6.87%",change:"-0.04%",up:false},
  ]);

  useEffect(()=>{
    (async()=>{
      const {data:{user}}=await sb.auth.getUser();
      if(!user){router.push("/auth");return;}
      setUser(user);
      const {data:pd}=await sb.from("portfolios").select("data").eq("user_id",user.id).maybeSingle();
      if(pd?.data?.funds){
        const v=(pd.data.funds as any[]).filter((f:any)=>{
          const n=String(f.name||"");
          return n.length>5&&!/^\d{2}-\d{2}-\d{4}/.test(n)&&!n.includes("No Of Unit")&&!n.includes("Sub Total");
        });
        setHoldings(v);
      }
      setLoading(false);
    })();
    fetch("/api/market").then(r=>r.json()).then(d=>{if(d.indices?.length)setTicker(d.indices);}).catch(()=>{});
  },[]);

  if(loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center"><span className="text-white font-black text-lg">F</span></div>
        <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{animationDelay:`${i*0.12}s`}}/>)}</div>
      </div>
    </div>
  );

  // Computed values
  const inv=holdings.reduce((s,h)=>s+(h.invested||0),0);
  const cur=holdings.reduce((s,h)=>s+(h.value||0),0);
  const gain=cur-inv;
  const retPct=inv>0?(gain/inv)*100:0;
  const sip=holdings.reduce((s,h)=>s+(h.sip||0),0);
  const activeSIPs=holdings.filter(h=>h.sip>0).length;
  const afterTax=gain>0?gain*0.875:gain;
  const gainers=holdings.filter(h=>(h.value||0)>(h.invested||0));
  const losers=holdings.filter(h=>(h.value||0)<(h.invested||0));
  const health=Math.min(100,Math.round((gainers.length/Math.max(holdings.length,1))*45+Math.min(holdings.length,20)/20*30+(retPct>12?25:retPct>8?15:retPct>0?8:0)));

  const am:Record<string,number>={};
  holdings.forEach(h=>{const b=bucket(h.category||"");am[b]=(am[b]||0)+(h.value||0);});
  const alloc=Object.entries(am).map(([n,v])=>({name:n,value:Math.round(v/Math.max(cur,1)*100),amt:v,color:COLORS[n]||"#7c3aed",pastel:PASTEL[n]||"#ede9fe"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData=months.map((_,i)=>({m:months[i],portfolio:Math.round(inv+(gain*(i+1)/12)),benchmark:Math.round(inv*(1+0.12*(i+1)/12))}));

  const sorted=[...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const topGainers=sorted.slice(0,5);
  const topLosers=[...holdings].sort((a,b)=>(a.returnsPercent||0)-(b.returnsPercent||0)).slice(0,5);

  // Category bar data
  const catData=Object.entries(am).map(([name,value])=>({name,value:Math.round(value/1000)/100,color:COLORS[name]||"#7c3aed"}));

  const greeting=new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening";
  const firstName=user?.user_metadata?.full_name?.split(" ")[0]||user?.email?.split("@")[0]||"there";

  const sig=(r:number)=>r<-10?{l:"Exit",c:"#dc2626",bg:"#fef2f2"}:r<0?{l:"Review",c:"#ea580c",bg:"#fff7ed"}:r<8?{l:"Watch",c:"#ca8a04",bg:"#fefce8"}:r<20?{l:"Hold",c:"#16a34a",bg:"#f0fdf4"}:{l:"Star",c:"#15803d",bg:"#dcfce7"};

  // Empty portfolio state
  if(!holdings.length) return (
    <div className="min-h-screen bg-gray-50 flex">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); *{font-family:'Plus Jakarta Sans',system-ui,sans-serif} @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}} .tk{animation:ticker 40s linear infinite}`}</style>
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col fixed inset-y-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center"><span className="text-white text-sm font-black">F</span></div>
          <div><div className="font-black text-gray-900 text-[14px]">FolioIQ</div><div className="text-[9px] text-green-600 font-bold tracking-widest uppercase">Portfolio Intelligence</div></div>
        </div>
        <nav className="flex-1 p-3 space-y-4">{NAV_ITEMS.map((g,gi)=><div key={gi}><div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase px-2 mb-1">{g.group}</div>{g.items.map(item=><Link key={item.h} href={item.h} className={`flex items-center px-3 py-2.5 rounded-xl text-[13px] font-semibold mb-0.5 ${item.active?"bg-gray-900 text-white":"text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>{item.l}</Link>)}</div>)}</nav>
        <div className="p-3 border-t border-gray-100"><div className="px-3 py-2 bg-gray-50 rounded-xl mb-2"><div className="text-[10px] text-gray-400">Signed in as</div><div className="text-[11px] font-bold text-gray-700 truncate">{user?.email}</div></div><button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))} className="w-full text-left px-3 py-2 text-[13px] font-semibold text-red-500 hover:bg-red-50 rounded-xl">Sign out</button></div>
      </aside>
      <div className="lg:ml-60 flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-4"><div className="font-bold text-gray-900">{greeting}, {firstName} 👋</div><div className="text-[11px] text-gray-400">Connect your portfolio to get started</div></header>
        <div className="flex-1 p-8 max-w-4xl w-full mx-auto">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Connect your portfolio</h1>
          <p className="text-gray-500 mb-8">Import your mutual fund holdings — takes under 2 minutes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{icon:"📄",title:"Upload CAS / XLS",desc:"CAMS, KFintech, NJ Wealth, CDSL",tag:"Instant",href:"/upload",primary:true},{icon:"🏦",title:"CDSL OTP Fetch",desc:"Enter Demat ID, verify via OTP",tag:"Real-time",href:"/connect"},{icon:"📧",title:"Gmail Auto-Import",desc:"Read-only, finds CAS emails",tag:"Convenient",href:"/connect"}].map((m,i)=>(
              <div key={i} className={`rounded-2xl p-6 border flex flex-col ${m.primary?"bg-gray-900 border-gray-800":"bg-white border-gray-100"}`}>
                <div className="text-3xl mb-4">{m.icon}</div>
                <div className={`font-bold text-[15px] mb-1 ${m.primary?"text-white":"text-gray-900"}`}>{m.title}</div>
                <div className={`text-[12px] flex-1 mb-4 ${m.primary?"text-gray-400":"text-gray-500"}`}>{m.desc}</div>
                <Link href={m.href} className={`py-2.5 px-4 rounded-xl text-[13px] font-bold text-center ${m.primary?"bg-green-500 text-white hover:bg-green-400":"bg-gray-900 text-white hover:bg-gray-800"}`}>{m.tag} →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{font-family:'Plus Jakarta Sans',system-ui,sans-serif}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}
        .tk{animation:ticker 45s linear infinite}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fin{animation:fadeIn 0.35s ease both}
        .card{background:white;border-radius:14px;border:1px solid #e8ecf0;box-shadow:0 1px 4px rgba(0,0,0,0.04)}
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${mobileNav?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}>
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-black">F</span>
          </div>
          <div>
            <div className="font-black text-gray-900 text-[14px] leading-none">FolioIQ</div>
            <div className="text-[9px] text-green-600 font-bold tracking-widest uppercase mt-0.5">Intelligence</div>
          </div>
        </div>
        <nav className="flex-1 p-2.5 overflow-y-auto space-y-4">
          {NAV_ITEMS.map((g,gi)=>(
            <div key={gi}>
              <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase px-2.5 mb-1">{g.group}</div>
              {g.items.map(item=>(
                <Link key={item.h} href={item.h} onClick={()=>setMobileNav(false)}
                  className={`flex items-center px-2.5 py-2.5 rounded-xl text-[13px] font-semibold mb-0.5 transition-colors ${item.active?"bg-gray-900 text-white":"text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-2.5 border-t border-gray-100">
          <div className="px-2.5 py-2 bg-gray-50 rounded-xl mb-1.5">
            <div className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Logged in</div>
            <div className="text-[11px] font-bold text-gray-700 truncate">{user?.email}</div>
          </div>
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="w-full px-2.5 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 rounded-xl text-left transition-colors">
            Sign out
          </button>
        </div>
      </aside>
      {mobileNav&&<div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={()=>setMobileNav(false)}/>}

      {/* ── MAIN ── */}
      <div className="lg:ml-56 flex-1 flex flex-col min-w-0">

        {/* TICKER */}
        <div className="bg-gray-900 overflow-hidden flex-shrink-0" style={{height:28}}>
          <div className="tk flex items-center h-full gap-8 px-4 whitespace-nowrap">
            {[...ticker,...ticker,...ticker].map((t,i)=>(
              <span key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-gray-500 text-[10px] font-semibold">{t.name}</span>
                <span className="text-gray-100 text-[10px] font-mono font-bold">{t.value}</span>
                <span className={`text-[10px] font-bold ${t.up?"text-green-400":"text-red-400"}`}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>

        {/* TOPBAR */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between gap-4 flex-shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={()=>setMobileNav(!mobileNav)} className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <span className="font-bold text-gray-900 text-[15px]">{greeting}, {firstName}</span>
              <span className="text-gray-400 text-[13px] ml-2 hidden sm:inline">{new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-bold border ${gain>=0?"bg-green-50 text-green-700 border-green-200":"bg-red-50 text-red-700 border-red-200"}`}>
              {gain>=0?"▲":"▼"} {pct(retPct)} all time
            </div>
            <button onClick={()=>setHide(!hide)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{hide?<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19M1 1l22 22"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
            </button>
            <div className="h-8 w-px bg-gray-100 hidden sm:block"/>
            <div className="hidden sm:block text-right">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Portfolio Value</div>
              <div className="text-[15px] font-black text-gray-900 leading-none">{hide?"₹ ••••":fmt(cur)}</div>
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 flex gap-0 flex-shrink-0">
          {(["overview","holdings","insights"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-5 py-3 text-[13px] font-bold capitalize border-b-2 transition-all -mb-px ${tab===t?"border-gray-900 text-gray-900":"border-transparent text-gray-400 hover:text-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {tab==="overview" && (
            <div className="space-y-4 fin">

              {/* ROW 1 — VALUE HERO + 5 KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

                {/* Big portfolio card — spans 2 cols on all screens */}
                <div className="col-span-2 bg-gray-900 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 80% 20%, #10b981 0%, transparent 60%), radial-gradient(circle at 20% 80%, #3b82f6 0%, transparent 60%)"}}/>
                  <div className="relative">
                    <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">Total Portfolio</div>
                    <div className="text-[36px] sm:text-[42px] font-black text-white leading-none mb-2">
                      {hide?"₹ ••••":fmt(cur)}
                    </div>
                    <div className={`text-[12px] font-bold mb-4 ${gain>=0?"text-green-400":"text-red-400"}`}>
                      {gain>=0?"▲":"▼"} {hide?"••••":fmt(Math.abs(gain))} &nbsp;·&nbsp; {pct(retPct)}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/8 rounded-xl px-3 py-2.5">
                        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Invested</div>
                        <div className="text-[16px] font-black text-white">{hide?"••••":fmt(inv)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{holdings.length} funds</div>
                      </div>
                      <div className="bg-white/8 rounded-xl px-3 py-2.5">
                        <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">Monthly SIP</div>
                        <div className="text-[16px] font-black text-white">{hide?"••••":fmt(sip)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{activeSIPs} active</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI cards */}
                {[
                  {label:"Health Score",value:`${health}`,unit:"/100",sub:health>=70?"Excellent 🎯":health>=50?"Good":"Needs work",color:health>=70?"#16a34a":health>=50?"#ca8a04":"#dc2626",bg:health>=70?"#f0fdf4":health>=50?"#fefce8":"#fef2f2"},
                  {label:"Gainers",value:`${gainers.length}`,unit:`/${holdings.length}`,sub:"funds in green",color:"#16a34a",bg:"#f0fdf4"},
                  {label:"Losers",value:`${losers.length}`,unit:`/${holdings.length}`,sub:"funds in red",color:losers.length>0?"#dc2626":"#16a34a",bg:losers.length>0?"#fef2f2":"#f0fdf4"},
                  {label:"Abs. Return",value:retPct.toFixed(1),unit:"%",sub:"all time",color:retPct>=0?"#16a34a":"#dc2626",bg:retPct>=0?"#f0fdf4":"#fef2f2"},
                  {label:"After-Tax Gain",value:fmt(afterTax,hide),unit:"",sub:"est. LTCG @ 12.5%",color:"#374151",bg:"#f8fafc"},
                ].map((k,i)=>(
                  <div key={i} className="card p-4 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{k.label}</div>
                    <div>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[26px] font-black leading-none" style={{color:k.color}}>{k.value}</span>
                        {k.unit&&<span className="text-[14px] font-bold text-gray-400">{k.unit}</span>}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mt-1">{k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ROW 2 — GROWTH CHART full width */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-gray-900 text-[15px]">Portfolio Growth</div>
                    <div className="text-[11px] text-gray-400">Your portfolio vs Nifty 50 benchmark (simulated)</div>
                  </div>
                  <div className="flex items-center gap-5 text-[11px] font-semibold">
                    <span className="flex items-center gap-1.5 text-green-600"><span className="w-3 h-0.5 bg-green-500 rounded inline-block"/>Portfolio</span>
                    <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 bg-gray-300 rounded inline-block" style={{borderStyle:"dashed"}}/>Nifty 50</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={growthData} margin={{top:5,right:10,bottom:0,left:10}}>
                    <defs>
                      <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
                    <XAxis dataKey="m" tick={{fill:"#9ca3af",fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={(v)=>`₹${(v/100000).toFixed(0)}L`} tick={{fill:"#9ca3af",fontSize:10}} axisLine={false} tickLine={false} width={50}/>
                    <Tooltip contentStyle={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,boxShadow:"0 4px 16px rgba(0,0,0,0.08)",fontSize:12}} formatter={(v:any)=>fmt(v)} labelStyle={{color:"#6b7280",fontWeight:600}}/>
                    <Area type="monotone" dataKey="portfolio" stroke="#16a34a" strokeWidth={2.5} fill="url(#grd)" dot={false}/>
                    <Line type="monotone" dataKey="benchmark" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="5 4"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* ROW 3 — ALLOCATION + CATEGORY BAR + TOP FUNDS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Donut allocation */}
                <div className="card p-5">
                  <div className="font-bold text-gray-900 mb-1">Asset Allocation</div>
                  <div className="text-[11px] text-gray-400 mb-3">by category</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={alloc} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                        {alloc.map((a,i)=><Cell key={i} fill={a.color}/>)}
                      </Pie>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,fontSize:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}} formatter={(v:any,_:any,p:any)=>[`${v}% · ${fmt(p.payload.amt)}`]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-1">
                    {alloc.map((a,i)=>(
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{background:a.color}}/>
                          <span className="text-[12px] text-gray-600 font-medium">{a.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{width:`${a.value}%`,background:a.color}}/>
                          </div>
                          <span className="text-[12px] font-black text-gray-900 w-8 text-right">{a.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category value bar */}
                <div className="card p-5">
                  <div className="font-bold text-gray-900 mb-1">Value by Category</div>
                  <div className="text-[11px] text-gray-400 mb-3">current market value (₹ L)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={catData} margin={{top:5,right:5,bottom:5,left:0}} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false}/>
                      <XAxis dataKey="name" tick={{fill:"#9ca3af",fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fill:"#9ca3af",fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,fontSize:12}} formatter={(v:any)=>[`₹${v} L`]}/>
                      <Bar dataKey="value" radius={[6,6,0,0]}>
                        {catData.map((c,i)=><Cell key={i} fill={c.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 5 funds */}
                <div className="card p-5">
                  <div className="font-bold text-gray-900 mb-3">Top Performers</div>
                  <div className="space-y-3">
                    {topGainers.slice(0,5).map((h,i)=>{
                      const r=h.returnsPercent||0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-[11px] font-black text-green-700 flex-shrink-0">
                            {(h.name||"F").charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-bold text-gray-800 truncate">{h.name}</div>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{width:`${Math.min(100,r/2)}%`}}/>
                            </div>
                          </div>
                          <div className="text-[13px] font-black text-green-600 flex-shrink-0">{pct(r)}</div>
                        </div>
                      );
                    })}
                  </div>
                  {losers.length>0&&(
                    <>
                      <div className="font-bold text-gray-900 mt-5 mb-3">Watch List</div>
                      <div className="space-y-3">
                        {topLosers.filter(h=>(h.returnsPercent||0)<0).slice(0,3).map((h,i)=>{
                          const r=h.returnsPercent||0;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[11px] font-black text-red-600 flex-shrink-0">
                                {(h.name||"F").charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-gray-800 truncate">{h.name}</div>
                                <div className="h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                  <div className="h-full bg-red-400 rounded-full" style={{width:`${Math.min(100,Math.abs(r)/2)}%`}}/>
                                </div>
                              </div>
                              <div className="text-[13px] font-black text-red-500 flex-shrink-0">{pct(r)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ROW 4 — QUICK ACTIONS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {icon:"🤖",title:"AI Insights",sub:"Smart analysis of your portfolio",href:"/intelligence",color:"#16a34a",light:"#f0fdf4"},
                  {icon:"⚖️",title:"Rebalance",sub:"Optimize your allocation",href:"/rebalance",color:"#2563eb",light:"#eff6ff"},
                  {icon:"🌿",title:"Tax Harvest",sub:"Find loss-booking opportunities",href:"/tax-harvesting",color:"#d97706",light:"#fffbeb"},
                  {icon:"💬",title:"AI Chat",sub:"Ask anything about your portfolio",href:"/chat",color:"#7c3aed",light:"#f5f3ff"},
                ].map((a,i)=>(
                  <Link key={i} href={a.href} className="card p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{background:a.light}}>{a.icon}</div>
                    <div>
                      <div className="font-bold text-gray-900 text-[13px]">{a.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{a.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {tab==="holdings" && (
            <div className="fin space-y-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900">{holdings.length} Holdings</div>
                <div className="text-[12px] text-gray-400">sorted by returns</div>
              </div>
              {/* Summary row */}
              <div className="card p-4 grid grid-cols-3 sm:grid-cols-6 gap-4 mb-2">
                {[
                  {l:"Invested",v:fmt(inv,hide)},{l:"Current",v:fmt(cur,hide)},
                  {l:"Gain/Loss",v:fmt(gain,hide),c:gain>=0?"text-green-600":"text-red-500"},
                  {l:"Return",v:pct(retPct),c:retPct>=0?"text-green-600":"text-red-500"},
                  {l:"Monthly SIP",v:fmt(sip,hide)},{l:"Health",v:`${health}/100`,c:"text-green-700"},
                ].map((s,i)=>(
                  <div key={i}>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{s.l}</div>
                    <div className={`text-[15px] font-black ${(s as any).c||"text-gray-900"}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              {sorted.map((h,i)=>{
                const r=h.returnsPercent||0;
                const s=sig(r);
                return (
                  <div key={i} className="card px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0" style={{background:s.bg,color:s.c}}>
                        {(h.name||"F").charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-gray-900 text-[13px] leading-tight truncate">{h.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium mt-0.5">{h.category||"Mutual Fund"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-7 flex-shrink-0 pl-12 sm:pl-0">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">Invested</div>
                        <div className="text-[13px] font-bold text-gray-600 mt-0.5">{hide?"••••":fmt(h.invested||0)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">Current</div>
                        <div className="text-[13px] font-black text-gray-900 mt-0.5">{hide?"••••":fmt(h.value||0)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-semibold">P&L</div>
                        <div className={`text-[13px] font-black mt-0.5 ${r>=0?"text-green-600":"text-red-500"}`}>{pct(r)}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg text-[10px] font-black border w-14 text-center flex-shrink-0" style={{background:s.bg,color:s.c,borderColor:s.c+"33"}}>
                        {s.l}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab==="insights" && (
            <div className="fin space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {l:"Total Invested",v:fmt(inv,hide),c:"text-gray-900"},
                  {l:"Current Value",v:fmt(cur,hide),c:"text-gray-900"},
                  {l:"Total Gain",v:fmt(gain,hide),c:gain>=0?"text-green-600":"text-red-500"},
                  {l:"Est. After Tax",v:fmt(afterTax,hide),c:gain>=0?"text-green-600":"text-red-500"},
                ].map((s,i)=>(
                  <div key={i} className="card p-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{s.l}</div>
                    <div className={`text-[20px] font-black ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                  <div className="font-bold text-gray-900 mb-4">Top 5 Gainers</div>
                  <div className="space-y-3">
                    {topGainers.slice(0,5).map((h,i)=>(
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="text-[12px] font-semibold text-gray-700 truncate flex-1">{h.name}</div>
                        <div className="text-[13px] font-black text-green-600 flex-shrink-0">{pct(h.returnsPercent||0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <div className="font-bold text-gray-900 mb-4">Underperformers</div>
                  <div className="space-y-3">
                    {topLosers.slice(0,5).map((h,i)=>(
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="text-[12px] font-semibold text-gray-700 truncate flex-1">{h.name}</div>
                        <div className={`text-[13px] font-black flex-shrink-0 ${(h.returnsPercent||0)<0?"text-red-500":"text-green-600"}`}>{pct(h.returnsPercent||0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <div className="font-bold text-gray-900 mb-4">Allocation Analysis</div>
                <div className="space-y-3">
                  {alloc.map((a,i)=>(
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-24 text-[12px] font-semibold text-gray-600">{a.name}</div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{width:`${a.value}%`,background:a.color}}/>
                      </div>
                      <div className="w-10 text-right text-[12px] font-black text-gray-900">{a.value}%</div>
                      <div className="w-20 text-right text-[11px] text-gray-400">{fmt(a.amt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
