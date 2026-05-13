"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
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
const COLORS: Record<string,string> = {Equity:"#059669",Debt:"#2563eb",Hybrid:"#d97706",Gold:"#ca8a04",Other:"#7c3aed"};

function Counter({to,hide,dur=1400,cls=""}:{to:number;hide:boolean;dur?:number;cls?:string}) {
  const [v,setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(()=>{
    if(hide){setV(to);return;}
    const t0=performance.now();
    const tick=(now:number)=>{
      const p=Math.min((now-t0)/dur,1);
      setV(Math.round(to*(1-Math.pow(1-p,3))));
      if(p<1) raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf.current);
  },[to,hide]);
  if(hide) return <span className={cls}>₹ ••••</span>;
  return <span className={cls}>{fmt(v)}</span>;
}

const NAV = [
  {s:"PORTFOLIO",items:[
    {l:"Dashboard",h:"/dashboard",a:true},
    {l:"Upload CAS",h:"/upload"},
    {l:"Connect",h:"/connect"},
    {l:"Transactions",h:"/transactions"},
  ]},
  {s:"AI TOOLS",items:[
    {l:"AI Insights",h:"/intelligence"},
    {l:"Rebalance",h:"/rebalance"},
    {l:"Tax Harvest",h:"/tax-harvesting"},
    {l:"AI Chat",h:"/chat"},
  ]},
  {s:"PLAN",items:[
    {l:"Goals",h:"/goals"},
    {l:"SIP Calculator",h:"/calculator"},
    {l:"Screener",h:"/screener"},
  ]},
];

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview"|"funds"|"insights">("overview");
  const [ticker, setTicker] = useState<any[]>([
    {name:"NIFTY 50",value:"24,315",change:"+1.12%",up:true},
    {name:"SENSEX",value:"80,218",change:"+1.09%",up:true},
    {name:"MIDCAP 150",value:"17,842",change:"+0.87%",up:true},
    {name:"GOLD",value:"₹9,342/g",change:"+0.34%",up:true},
    {name:"USD/INR",value:"₹83.42",change:"-0.12%",up:false},
    {name:"NIFTY IT",value:"38,621",change:"-0.54%",up:false},
    {name:"10Y GSEC",value:"6.87%",change:"-0.04%",up:false},
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
    fetch("/api/market").then(r=>r.json()).then(d=>{ if(d.indices?.length) setTicker(d.indices); }).catch(()=>{});
  },[]);

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
  const alloc=Object.entries(am).map(([n,v])=>({name:n,value:Math.round(v/Math.max(cur,1)*100),amt:v,color:COLORS[n]||"#7c3aed"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData=months.map((_,i)=>({m:months[i],portfolio:Math.round(inv+(gain*(i+1)/12)),benchmark:Math.round(inv*(1+0.12*(i+1)/12))}));
  const sorted=[...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const greeting=new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening";
  const firstName=user?.user_metadata?.full_name?.split(" ")[0]||user?.email?.split("@")[0]||"there";

  const sig=(r:number)=>
    r<-10?{l:"Exit",color:"#dc2626",bg:"#fef2f2",border:"#fecaca"}
    :r<0?{l:"Review",color:"#ea580c",bg:"#fff7ed",border:"#fed7aa"}
    :r<8?{l:"Watch",color:"#d97706",bg:"#fffbeb",border:"#fde68a"}
    :r<20?{l:"Hold",color:"#059669",bg:"#f0fdf4",border:"#bbf7d0"}
    :{l:"Star ⭐",color:"#059669",bg:"#ecfdf5",border:"#6ee7b7"};

  if(loading) return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center" style={{fontFamily:"'Sora',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');`}</style>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
          <span className="text-white text-xl font-black">F</span>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
        </div>
      </div>
    </div>
  );

  // Sidebar component
  const SidebarContent = () => (
    <>
      <div className="px-5 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-black">F</span>
          </div>
          <div>
            <div className="font-black text-gray-900 text-[14px] tracking-tight leading-none">FolioIQ</div>
            <div className="text-[9px] text-emerald-600 tracking-widest uppercase font-semibold mt-0.5">Portfolio Intelligence</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-2.5 py-4 overflow-y-auto space-y-5">
        {NAV.map((sec,si)=>(
          <div key={si}>
            <div className="text-[9px] font-bold text-gray-400 tracking-[0.25em] uppercase px-3 mb-1.5">{sec.s}</div>
            {sec.items.map(item=>(
              <Link key={item.h} href={item.h} onClick={()=>setSidebar(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold mb-0.5 transition-all
                  ${(item as any).a?"bg-gray-900 text-white shadow-sm":"text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                {item.l}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="px-2.5 py-3 border-t border-gray-100 space-y-0.5">
        <div className="px-3 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="text-[10px] text-gray-400 mb-0.5">Signed in</div>
          <div className="text-[12px] text-gray-700 font-semibold truncate">{user?.email}</div>
        </div>
        <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all">
          Sign out
        </button>
      </div>
    </>
  );

  // Empty state
  if(!holdings.length) return (
    <div className="min-h-screen bg-[#F8F9FB] flex" style={{fontFamily:"'Sora',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap'); @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}} .ticker{animation:ticker 40s linear infinite}`}</style>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex-col z-30 shadow-sm">
        <SidebarContent/>
      </aside>
      <div className="lg:ml-56 flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
          <div className="text-[15px] font-bold text-gray-900">{greeting}, {firstName} 👋</div>
          <div className="text-[11px] text-gray-400">Connect your portfolio to unlock insights</div>
        </header>
        <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Step 1 — Import your portfolio
            </div>
            <h1 className="text-[32px] font-black text-gray-900 mb-3 leading-tight">Connect your mutual funds</h1>
            <p className="text-[14px] text-gray-500">Takes under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {icon:"📄",step:"01",title:"Upload CAS / XLS",sub:"CAMS, KFintech, NJ Wealth, CDSL — parse instantly.",tag:"✅ Works instantly",href:"/upload",cta:"Upload File",primary:true},
              {icon:"🏦",step:"02",title:"CDSL OTP",sub:"Enter Demat ID, verify OTP. Real-time live holdings.",tag:"📱 No PDF needed",href:"/connect",cta:"Fetch via OTP",primary:false},
              {icon:"📧",step:"03",title:"Gmail Import",sub:"One-time consent. We find CAS emails automatically.",tag:"⚡ Most convenient",href:"/connect",cta:"Connect Gmail",primary:false},
            ].map((m,i)=>(
              <div key={i} className={`rounded-2xl border p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg ${m.primary?"bg-gray-900 border-gray-800":"bg-white border-gray-100 hover:border-gray-200"}`}>
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-[10px] font-bold tracking-widest ${m.primary?"text-gray-500":"text-gray-400"}`}>{m.step}</span>
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <h3 className={`text-[15px] font-bold mb-2 ${m.primary?"text-white":"text-gray-900"}`}>{m.title}</h3>
                <p className={`text-[12px] leading-relaxed flex-1 mb-4 ${m.primary?"text-gray-400":"text-gray-500"}`}>{m.sub}</p>
                <div className={`text-[11px] mb-4 font-semibold ${m.primary?"text-emerald-400":"text-gray-400"}`}>{m.tag}</div>
                <Link href={m.href} className={`w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all ${m.primary?"bg-emerald-500 text-white hover:bg-emerald-400":"bg-gray-900 text-white hover:bg-gray-800"}`}>
                  {m.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex" style={{fontFamily:"'Sora',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .ticker-anim{animation:ticker 45s linear infinite}
        .fade-up{animation:fadeUp 0.4s ease both}
        .card{background:white;border:1px solid #f1f5f9;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 1px 2px rgba(0,0,0,0.02);transition:all 0.2s}
        .card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.08);transform:translateY(-1px)}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
      `}</style>

      {/* SIDEBAR */}
      <aside className={`${sidebar?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 shadow-xl lg:shadow-sm`}>
        <SidebarContent/>
      </aside>
      {sidebar&&<div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setSidebar(false)}/>}

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* TICKER */}
        <div className="overflow-hidden bg-gray-900" style={{height:30}}>
          <div className="ticker-anim flex items-center h-full gap-8 px-4 whitespace-nowrap">
            {[...ticker,...ticker,...ticker].map((t,i)=>(
              <span key={i} className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                <span className="text-gray-500 font-medium tracking-wide">{t.name}</span>
                <span className="text-gray-200 font-mono font-semibold">{t.value}</span>
                <span className={`font-bold ${t.up?"text-emerald-400":"text-red-400"}`}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>

        {/* HEADER */}
        <header className="bg-white border-b border-gray-100 px-5 sm:px-7 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebar(!sidebar)} className="lg:hidden p-2 -ml-1 text-gray-400 hover:bg-gray-100 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div className="text-[14px] font-bold text-gray-900">{greeting}, <span className="text-gray-500">{firstName}</span> 👋</div>
              <div className="text-[11px] text-gray-400">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${gain>=0?"bg-emerald-50 border-emerald-100 text-emerald-700":"bg-red-50 border-red-100 text-red-700"}`}>
              {gain>=0?"↑":"↓"} {pct(retPct)} all time
            </div>
            <button onClick={()=>setHide(!hide)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title={hide?"Show values":"Hide values"}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide?<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19M1 1l22 22"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            <div className="hidden lg:block border-l border-gray-100 pl-4 ml-1 text-right">
              <div className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">Portfolio</div>
              <div className="text-[15px] font-black text-gray-900">{hide?"₹ ••••":fmt(cur)}</div>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="bg-white border-b border-gray-100 px-5 sm:px-7 flex gap-1">
          {(["overview","funds","insights"] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`px-4 py-3 text-[12px] font-bold capitalize border-b-2 -mb-px transition-all ${activeTab===t?"border-gray-900 text-gray-900":"border-transparent text-gray-400 hover:text-gray-600"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 sm:px-7 py-6 space-y-5 max-w-7xl">

            {activeTab==="overview" && <>

              {/* HERO CARD */}
              <div className="fade-up bg-gray-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-gray-900/20">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 -translate-y-1/2 translate-x-1/4" style={{background:"radial-gradient(circle,#10b981,transparent)"}}/>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5 translate-y-1/2 -translate-x-1/4" style={{background:"radial-gradient(circle,#3b82f6,transparent)"}}/>
                <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase mb-3">TOTAL PORTFOLIO VALUE</div>
                    <Counter to={cur} hide={hide} cls="text-[48px] sm:text-[60px] font-black text-white tracking-tight leading-none block"/>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className={`text-[13px] font-bold ${gain>=0?"text-emerald-400":"text-red-400"}`}>
                        {gain>=0?"↑":"↓"} {hide?"••••":fmt(Math.abs(gain))} ({pct(retPct)}) all time
                      </span>
                      <span className="text-[11px] text-gray-500">Est. after-tax: {hide?"••••":fmt(afterTax)}</span>
                    </div>
                    <div className="mt-5 opacity-20 pointer-events-none">
                      <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={growthData} margin={{top:0,right:0,bottom:0,left:0}}>
                          <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                          <Area type="monotone" dataKey="portfolio" stroke="#10b981" fill="url(#hg)" strokeWidth={2} dot={false}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex gap-3 lg:flex-col flex-shrink-0">
                    {[
                      {l:"Invested",v:inv,sub:`${holdings.length} funds`},
                      {l:"Monthly SIP",v:sip,sub:`${activeSIPs} active`},
                    ].map((k,i)=>(
                      <div key={i} className="rounded-xl px-5 py-4 border border-white/10 bg-white/5 lg:min-w-[130px]">
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1.5 font-semibold">{k.l}</div>
                        <div className="text-[20px] font-black text-white">{hide?"••••":fmt(k.v)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPI GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {l:"Portfolio Health",v:`${health}/100`,sub:health>=70?"Excellent 🎯":health>=50?"Good":"Needs work",accent:"#059669"},
                  {l:"Gainers",v:`${gainers.length}`,sub:`of ${holdings.length} funds`,accent:"#059669"},
                  {l:"Losers",v:`${losers.length}`,sub:"in the red",accent:losers.length>0?"#dc2626":"#059669"},
                  {l:"Abs. Return",v:pct(retPct),sub:"all time",accent:retPct>=0?"#059669":"#dc2626"},
                ].map((k,i)=>(
                  <div key={i} className="card p-5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{k.l}</div>
                    <div className="text-[28px] font-black leading-none mb-1" style={{color:k.accent}}>{k.v}</div>
                    <div className="text-[11px] text-gray-500 font-medium">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* CHART + PIE */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="card lg:col-span-3 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[14px] font-bold text-gray-900">Portfolio Growth</div>
                      <div className="text-[11px] text-gray-400">vs Nifty 50 benchmark</div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-semibold">
                      <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded"/> Portfolio</span>
                      <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-0.5 bg-gray-300 inline-block rounded"/> Benchmark</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={growthData} margin={{top:5,right:5,bottom:0,left:0}}>
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#059669" stopOpacity={0.15}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="m" tick={{fill:"#9ca3af",fontSize:10,fontFamily:"Sora"}} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{background:"white",border:"1px solid #f1f5f9",borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",color:"#111827",fontSize:12,fontFamily:"Sora"}} formatter={(v:any)=>fmt(v)} labelStyle={{color:"#6b7280"}}/>
                      <Area type="monotone" dataKey="portfolio" stroke="#059669" fill="url(#pg)" strokeWidth={2} dot={false}/>
                      <Line type="monotone" dataKey="benchmark" stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="4 4"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="card lg:col-span-2 p-6">
                  <div className="text-[14px] font-bold text-gray-900 mb-1">Allocation</div>
                  <div className="text-[11px] text-gray-400 mb-4">by asset class</div>
                  {alloc.length>0?(
                    <>
                      <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                          <Pie data={alloc} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                            {alloc.map((a,i)=><Cell key={i} fill={a.color}/>)}
                          </Pie>
                          <Tooltip contentStyle={{background:"white",border:"1px solid #f1f5f9",borderRadius:12,boxShadow:"0 4px 16px rgba(0,0,0,0.08)",fontSize:12,fontFamily:"Sora"}} formatter={(v:any,n:any,p:any)=>[`${v}% · ${fmt(p.payload.amt)}`]}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-1">
                        {alloc.map((a,i)=>(
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{backgroundColor:a.color}}/>
                              <span className="text-gray-600 font-medium">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-gray-900">{a.value}%</span>
                              <span className="text-gray-400 text-[11px]">{fmt(a.amt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ):(
                    <div className="flex items-center justify-center h-32 text-gray-400 text-[12px]">No data yet</div>
                  )}
                </div>
              </div>

              {/* TOP FUNDS STRIP */}
              {sorted.slice(0,3).length>0&&(
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sorted.slice(0,3).map((h,i)=>{
                    const r=h.returnsPercent||0;
                    const s=sig(r);
                    return (
                      <div key={i} className="card p-5 border-l-4" style={{borderLeftColor:s.color}}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="text-[12px] font-bold text-gray-900 leading-tight line-clamp-2">{h.name}</div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0" style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>{s.l}</span>
                        </div>
                        <div className="text-[22px] font-black" style={{color:s.color}}>{pct(r)}</div>
                        <div className="text-[11px] text-gray-400 mt-1">{hide?"••••":fmt(h.value||0)} current</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>}

            {activeTab==="funds" && (
              <div className="space-y-2.5 fade-up">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[14px] font-bold text-gray-900">{holdings.length} Holdings</div>
                  <div className="text-[11px] text-gray-400 font-medium">sorted by returns</div>
                </div>
                {sorted.map((h,i)=>{
                  const r=h.returnsPercent||0;
                  const s=sig(r);
                  const invested=h.invested||0, value=h.value||0;
                  return (
                    <div key={i} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black flex-shrink-0 border" style={{background:s.bg,color:s.color,borderColor:s.border}}>
                          {(h.name||"F").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-gray-900 truncate">{h.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">{h.category||"Mutual Fund"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 sm:gap-8 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-semibold mb-0.5">Invested</div>
                          <div className="text-[13px] font-bold text-gray-600">{hide?"••••":fmt(invested)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-gray-400 font-semibold mb-0.5">Current</div>
                          <div className="text-[13px] font-black text-gray-900">{hide?"••••":fmt(value)}</div>
                        </div>
                        <div className="text-right min-w-[52px]">
                          <div className="text-[10px] text-gray-400 font-semibold mb-0.5">Return</div>
                          <div className="text-[16px] font-black" style={{color:s.color}}>{pct(r)}</div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-black border" style={{background:s.bg,color:s.color,borderColor:s.border}}>
                          {s.l}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab==="insights" && (
              <div className="space-y-5 fade-up">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {l:"Total Invested",v:fmt(inv,hide),color:"#374151"},
                    {l:"Current Value",v:fmt(cur,hide),color:"#374151"},
                    {l:"Total Gain",v:fmt(gain,hide),color:gain>=0?"#059669":"#dc2626"},
                    {l:"Est. After Tax",v:fmt(afterTax,hide),color:gain>=0?"#059669":"#dc2626"},
                  ].map((s,i)=>(
                    <div key={i} className="card p-5">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{s.l}</div>
                      <div className="text-[18px] font-black" style={{color:s.color}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="card p-6">
                  <div className="text-[14px] font-bold text-gray-900 mb-5">Top Performers</div>
                  <div className="space-y-4">
                    {sorted.slice(0,5).map((h,i)=>(
                      <div key={i} className="flex items-center gap-4">
                        <div className="text-[12px] font-black text-gray-300 w-5">#{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-bold text-gray-800 truncate mb-1.5">{h.name}</div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${Math.min(100,Math.abs(h.returnsPercent||0)/2)}%`}}/>
                          </div>
                        </div>
                        <div className="text-[14px] font-black text-emerald-600 flex-shrink-0">{pct(h.returnsPercent||0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {icon:"◈",title:"AI Insights",sub:"Smart portfolio analysis",href:"/intelligence",color:"#059669",bg:"#f0fdf4"},
                    {icon:"⟲",title:"Rebalance",sub:"Optimize your allocation",href:"/rebalance",color:"#2563eb",bg:"#eff6ff"},
                    {icon:"◎",title:"Tax Harvest",sub:"Spot loss-harvesting wins",href:"/tax-harvesting",color:"#d97706",bg:"#fffbeb"},
                  ].map((a,i)=>(
                    <Link key={i} href={a.href} className="card p-5 block hover:shadow-md">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 font-bold" style={{background:a.bg,color:a.color}}>{a.icon}</div>
                      <div className="text-[14px] font-bold text-gray-900 mb-1">{a.title}</div>
                      <div className="text-[11px] text-gray-500">{a.sub}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
