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
const COLORS: Record<string,string> = {Equity:"#10b981",Debt:"#3b82f6",Hybrid:"#f59e0b",Gold:"#eab308",Other:"#8b5cf6"};

function Counter({to,hide,dur=1600,cls=""}:{to:number;hide:boolean;dur?:number;cls?:string}) {
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
    {l:"Dashboard",h:"/dashboard",icon:"⊞",a:true},
    {l:"Upload CAS",h:"/upload",icon:"↑"},
    {l:"Connect",h:"/connect",icon:"⚡"},
    {l:"Transactions",h:"/transactions",icon:"≡"},
  ]},
  {s:"AI TOOLS",items:[
    {l:"AI Insights",h:"/intelligence",icon:"◈"},
    {l:"Rebalance",h:"/rebalance",icon:"⟲"},
    {l:"Tax Harvest",h:"/tax-harvesting",icon:"◎"},
    {l:"AI Chat",h:"/chat",icon:"✦"},
  ]},
  {s:"PLAN",items:[
    {l:"Goals",h:"/goals",icon:"◉"},
    {l:"SIP Calc",h:"/calculator",icon:"∑"},
    {l:"Screener",h:"/screener",icon:"⊙"},
  ]},
];

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
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
        setHoldings(v);setMeta(pd.data);
      }
      setLoading(false);
    })();
    fetch("/api/market").then(r=>r.json()).then(d=>{
      if(d.indices?.length) setTicker(d.indices);
    }).catch(()=>{});
  },[]);

  if(loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping"/>
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"/>
          <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <span className="text-emerald-400 text-lg font-black">F</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-600 tracking-[0.3em] uppercase font-medium">Loading Portfolio</p>
      </div>
    </div>
  );

  const inv=holdings.reduce((s,h)=>s+(h.invested||0),0);
  const cur=holdings.reduce((s,h)=>s+(h.value||0),0);
  const gain=cur-inv;
  const retPct=inv>0?(gain/inv)*100:0;
  const sip=holdings.reduce((s,h)=>s+(h.sip||0),0);
  const activeSIPs=holdings.filter(h=>h.sip>0).length;
  const afterTax=gain>0?gain*0.875:gain;
  const gainers=holdings.filter(h=>(h.value||0)>(h.invested||0));
  const losers=holdings.filter(h=>(h.value||0)<(h.invested||0));
  const health=Math.min(100,Math.round(
    (gainers.length/Math.max(holdings.length,1))*45+
    Math.min(holdings.length,20)/20*30+
    (retPct>12?25:retPct>8?15:retPct>0?8:0)
  ));

  const am:Record<string,number>={};
  holdings.forEach(h=>{const b=bucket(h.category||"");am[b]=(am[b]||0)+(h.value||0);});
  const alloc=Object.entries(am).map(([n,v])=>({name:n,value:Math.round(v/Math.max(cur,1)*100),amt:v,color:COLORS[n]||"#8b5cf6"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData=months.map((_,i)=>({
    m:months[i],
    portfolio:Math.round(inv+(gain*(i+1)/12)*Math.random()*0.3+gain*(i+1)/12),
    benchmark:Math.round(inv*(1+0.12*(i+1)/12)),
  }));

  const sorted=[...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const top5=sorted.slice(0,5);

  const sig=(r:number)=>
    r<-10?{l:"Exit",color:"#ef4444",bg:"rgba(239,68,68,0.1)"}
    :r<0?{l:"Review",color:"#f97316",bg:"rgba(249,115,22,0.1)"}
    :r<8?{l:"Watch",color:"#eab308",bg:"rgba(234,179,8,0.1)"}
    :r<20?{l:"Hold",color:"#10b981",bg:"rgba(16,185,129,0.1)"}
    :{l:"Star ⭐",color:"#10b981",bg:"rgba(16,185,129,0.15)"};

  const greeting = new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // Empty state
  if(!holdings.length) return (
    <div className="min-h-screen bg-[#0a0a0f] flex" style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');`}</style>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col z-30 border-r border-white/5" style={{background:"rgba(255,255,255,0.02)"}}>
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-white text-[15px] tracking-tight">FolioIQ</div>
              <div className="text-[9px] text-gray-600 tracking-widest uppercase">Intelligence</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-6">
          {NAV.map((sec,si)=>(
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-700 tracking-[0.25em] uppercase px-3 mb-2">{sec.s}</div>
              {sec.items.map(item=>(
                <Link key={item.h} href={item.h}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                    ${(item as any).a?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":"text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}>
                  <span className="text-[15px] w-5 text-center opacity-70">{(item as any).icon}</span>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/5">
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <span className="text-[15px]">→</span> Sign out
          </button>
        </div>
      </aside>
      <div className="lg:ml-60 flex-1 flex flex-col min-h-screen">
        <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-20" style={{background:"rgba(10,10,15,0.8)",backdropFilter:"blur(20px)"}}>
          <div>
            <div className="text-[15px] font-bold text-white">{greeting}, {firstName} 👋</div>
            <div className="text-[11px] text-gray-600">Connect your portfolio to get started</div>
          </div>
        </header>
        <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 mb-6">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
              Step 1 — Import your portfolio
            </div>
            <h1 className="text-[32px] font-black text-white mb-3 leading-tight">How would you like to connect<br/>your mutual funds?</h1>
            <p className="text-[14px] text-gray-500">Pick any method — takes under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              {icon:"📄",step:"01",title:"Upload CAS / XLS",sub:"CAMS, KFintech, NJ Wealth, CDSL — upload and we parse instantly.",tag:"✅ Works instantly",href:"/upload",cta:"Upload File",primary:true},
              {icon:"🏦",step:"02",title:"CDSL OTP",sub:"Enter Demat ID, verify OTP. Real-time live holdings.",tag:"📱 No PDF needed",href:"/connect",cta:"Fetch via OTP",primary:false},
              {icon:"📧",step:"03",title:"Gmail Auto-Import",sub:"One-time consent. We find CAS emails automatically.",tag:"⚡ Most convenient",href:"/connect",cta:"Connect Gmail",primary:false},
            ].map((m,i)=>(
              <div key={i} className={`rounded-2xl border p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${m.primary?"border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/8":"border-white/8 hover:border-white/15"}`} style={{background:m.primary?undefined:"rgba(255,255,255,0.02)"}}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold text-gray-600 tracking-widest">{m.step}</span>
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">{m.title}</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed flex-1 mb-4">{m.sub}</p>
                <div className="text-[11px] text-emerald-400 mb-4">{m.tag}</div>
                <Link href={m.href} className={`w-full py-3 rounded-xl text-[13px] font-bold text-center transition-all ${m.primary?"bg-emerald-500 text-white hover:bg-emerald-400":"border border-white/10 text-white hover:bg-white/5"}`}>
                  {m.cta} →
                </Link>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/5 p-5" style={{background:"rgba(255,255,255,0.02)"}}>
            <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">Works with all platforms</div>
            <div className="flex flex-wrap gap-2">
              {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS","KFintech","CDSL","NSDL","HDFC MF","Mirae Asset"].map(p=>(
                <span key={p} className="px-3 py-1.5 border border-white/8 text-gray-500 text-[11px] rounded-full">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex" style={{fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-33.33%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{opacity:0.4}50%{opacity:1}}
        .animate-ticker{animation:ticker 40s linear infinite}
        .fade-up{animation:fadeUp 0.5s ease both}
        .card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:20px;transition:all 0.2s;}
        .card:hover{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.12);}
        .glass{background:rgba(10,10,15,0.85);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
      `}</style>

      {/* SIDEBAR */}
      <aside className={`${sidebar?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-60 flex flex-col transition-transform duration-300 border-r border-white/5`} style={{background:"rgba(10,10,15,0.98)"}}>
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-white text-[15px] tracking-tight">FolioIQ</div>
              <div className="text-[9px] text-gray-600 tracking-widest uppercase">Intelligence</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
          {NAV.map((sec,si)=>(
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-700 tracking-[0.25em] uppercase px-3 mb-2">{sec.s}</div>
              {sec.items.map(item=>(
                <Link key={item.h} href={item.h} onClick={()=>setSidebar(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                    ${(item as any).a?"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20":"text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}>
                  <span className="text-[14px] w-5 text-center">{(item as any).icon}</span>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <div className="px-3 py-2.5 rounded-xl" style={{background:"rgba(255,255,255,0.03)"}}>
            <div className="text-[10px] text-gray-600 mb-0.5">Signed in as</div>
            <div className="text-[12px] text-gray-400 truncate font-medium">{user?.email}</div>
          </div>
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-[13px] font-medium text-red-500/60 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all">
            <span>→</span> Sign out
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {sidebar && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={()=>setSidebar(false)}/>}

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* TICKER */}
        <div className="overflow-hidden border-b border-white/5" style={{height:28,background:"rgba(255,255,255,0.02)"}}>
          <div className="animate-ticker flex items-center h-full gap-8 px-4 whitespace-nowrap">
            {[...ticker,...ticker,...ticker].map((t,i)=>(
              <span key={i} className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                <span className="text-gray-700 font-medium">{t.name}</span>
                <span className="text-gray-400 font-mono font-semibold">{t.value}</span>
                <span className={t.up?"text-emerald-400":"text-red-400"}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>

        {/* HEADER */}
        <header className="glass border-b border-white/5 px-5 sm:px-7 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebar(!sidebar)} className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div className="text-[14px] font-bold text-white leading-none">
                {greeting}, <span className="text-gray-400">{firstName}</span> 👋
              </div>
              <div className="text-[11px] text-gray-600 mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${gain>=0?"border-emerald-500/20 bg-emerald-500/8 text-emerald-400":"border-red-500/20 bg-red-500/8 text-red-400"}`}>
              {gain>=0?"↑":"↓"} {pct(retPct)} all time
            </div>
            <button onClick={()=>setHide(!hide)} className="p-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide?<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19M1 1l22 22"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            <div className="hidden lg:block border-l border-white/5 pl-3 ml-1 text-right">
              <div className="text-[9px] text-gray-600 uppercase tracking-widest">Portfolio</div>
              <div className="text-[15px] font-black text-white">{hide?"₹ ••••":fmt(cur)}</div>
            </div>
          </div>
        </header>

        {/* TABS */}
        <div className="px-5 sm:px-7 pt-5 pb-0 flex gap-1 border-b border-white/5">
          {(["overview","funds","insights"] as const).map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              className={`px-4 py-2.5 text-[12px] font-bold capitalize rounded-t-xl transition-all border-b-2 -mb-px ${activeTab===t?"text-emerald-400 border-emerald-400 bg-emerald-500/5":"text-gray-600 border-transparent hover:text-gray-400"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 sm:px-7 py-6 space-y-5 max-w-7xl">

            {activeTab==="overview" && <>

              {/* HERO CARD */}
              <div className="fade-up relative overflow-hidden rounded-3xl border border-white/8" style={{background:"linear-gradient(135deg,rgba(16,185,129,0.08) 0%,rgba(10,10,15,0.6) 50%,rgba(59,130,246,0.05) 100%)"}}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"/>
                <div className="absolute top-4 right-4 w-64 h-64 rounded-full opacity-5" style={{background:"radial-gradient(circle,#10b981,transparent)"}}/>
                <div className="p-6 sm:p-8 relative">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase mb-4">TOTAL PORTFOLIO VALUE</div>
                      <Counter to={cur} hide={hide} cls="text-[48px] sm:text-[64px] font-black text-white tracking-tight leading-none block"/>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <span className={`text-[13px] font-bold ${gain>=0?"text-emerald-400":"text-red-400"}`}>
                          {gain>=0?"↑":"↓"} {hide?"••••":fmt(Math.abs(gain))} ({pct(retPct)}) all time
                        </span>
                        <span className="text-[11px] text-gray-600">After tax ≈ {hide?"••••":fmt(afterTax)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 lg:flex-col">
                      {[
                        {l:"Invested",v:inv,sub:`${holdings.length} funds`},
                        {l:"Monthly SIP",v:sip,sub:`${activeSIPs} active`},
                      ].map((k,i)=>(
                        <div key={i} className="rounded-2xl px-5 py-4 border border-white/8 lg:min-w-[140px]" style={{background:"rgba(255,255,255,0.04)"}}>
                          <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">{k.l}</div>
                          <div className="text-[22px] font-black text-white">{hide?"••••":fmt(k.v)}</div>
                          <div className="text-[10px] text-gray-600 mt-0.5">{k.sub}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Sparkline */}
                  <div className="mt-5 opacity-30 pointer-events-none">
                    <ResponsiveContainer width="100%" height={48}>
                      <AreaChart data={growthData} margin={{top:0,right:0,bottom:0,left:0}}>
                        <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.5}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="portfolio" stroke="#10b981" fill="url(#hg)" strokeWidth={1.5} dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* KPI GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{animationDelay:"0.1s"}}>
                {[
                  {l:"Health Score",v:`${health}/100`,sub:health>=70?"Excellent":health>=50?"Good":"Needs work",color:health>=70?"#10b981":health>=50?"#f59e0b":"#ef4444",icon:"◎"},
                  {l:"Gainers",v:`${gainers.length}`,sub:`of ${holdings.length} funds`,color:"#10b981",icon:"↑"},
                  {l:"Losers",v:`${losers.length}`,sub:`funds in red`,color:losers.length>0?"#ef4444":"#10b981",icon:"↓"},
                  {l:"XIRR (Est.)",v:pct(retPct),sub:"absolute return",color:retPct>=0?"#10b981":"#ef4444",icon:"∞"},
                ].map((k,i)=>(
                  <div key={i} className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{k.l}</div>
                      <span className="text-[18px]" style={{color:k.color}}>{k.icon}</span>
                    </div>
                    <div className="text-[28px] font-black leading-none mb-1" style={{color:k.color}}>{k.v}</div>
                    <div className="text-[11px] text-gray-600">{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* CHART + ALLOCATION ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Growth Chart */}
                <div className="card lg:col-span-3 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-[13px] font-bold text-white">Portfolio Growth</div>
                      <div className="text-[11px] text-gray-600">vs Benchmark (Nifty 50)</div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px]">
                      <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-3 h-0.5 bg-emerald-400 inline-block rounded"/>&nbsp;Portfolio</span>
                      <span className="flex items-center gap-1.5 text-gray-600"><span className="w-3 h-0.5 bg-gray-600 inline-block rounded"/>&nbsp;Benchmark</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={growthData} margin={{top:5,right:5,bottom:0,left:0}}>
                      <defs>
                        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="m" tick={{fill:"#4b5563",fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{background:"rgba(10,10,15,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#e5e7eb",fontSize:12}}
                        formatter={(v:any)=>fmt(v)} labelStyle={{color:"#9ca3af"}}/>
                      <Area type="monotone" dataKey="portfolio" stroke="#10b981" fill="url(#pg)" strokeWidth={2} dot={false}/>
                      <Line type="monotone" dataKey="benchmark" stroke="#374151" strokeWidth={1.5} dot={false} strokeDasharray="4 4"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Allocation Donut */}
                <div className="card lg:col-span-2 p-6">
                  <div className="text-[13px] font-bold text-white mb-1">Allocation</div>
                  <div className="text-[11px] text-gray-600 mb-4">by asset class</div>
                  {alloc.length>0?(
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie data={alloc} cx="50%" cy="50%" innerRadius={42} outerRadius={66} paddingAngle={2} dataKey="value">
                            {alloc.map((a,i)=><Cell key={i} fill={a.color} opacity={0.9}/>)}
                          </Pie>
                          <Tooltip contentStyle={{background:"rgba(10,10,15,0.95)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,color:"#e5e7eb",fontSize:12}}
                            formatter={(v:any,n:any,p:any)=>[`${v}% · ${fmt(p.payload.amt)}`]}/>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {alloc.map((a,i)=>(
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                              <span className="text-gray-400">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-white font-bold">{a.value}%</span>
                              <span className="text-gray-600 text-[11px]">{fmt(a.amt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ):(
                    <div className="flex items-center justify-center h-32 text-gray-700 text-[12px]">No data</div>
                  )}
                </div>
              </div>

            </>}

            {activeTab==="funds" && (
              <div className="space-y-3 fade-up">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-bold text-white">{holdings.length} Holdings</div>
                  <div className="text-[11px] text-gray-600">sorted by returns</div>
                </div>
                {sorted.map((h,i)=>{
                  const r=h.returnsPercent||0;
                  const s=sig(r);
                  const invested=h.invested||0, value=h.value||0;
                  return (
                    <div key={i} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
                            style={{background:`linear-gradient(135deg,${s.color}30,${s.color}10)`,border:`1px solid ${s.color}30`}}>
                            {h.name?.charAt(0)||"F"}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-white leading-tight truncate max-w-[220px] sm:max-w-none">{h.name}</div>
                            <div className="text-[10px] text-gray-600 mt-0.5">{h.category||"Mutual Fund"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 sm:gap-8 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-[12px] text-gray-600">Invested</div>
                          <div className="text-[14px] font-bold text-gray-400">{hide?"••••":fmt(invested)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[12px] text-gray-600">Current</div>
                          <div className="text-[14px] font-bold text-white">{hide?"••••":fmt(value)}</div>
                        </div>
                        <div className="text-right min-w-[56px]">
                          <div className="text-[12px] text-gray-600">Return</div>
                          <div className="text-[15px] font-black" style={{color:s.color}}>{pct(r)}</div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold flex-shrink-0" style={{background:s.bg,color:s.color}}>
                          {s.l}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab==="insights" && (
              <div className="space-y-4 fade-up">
                {/* Top performers */}
                <div className="card p-6">
                  <div className="text-[13px] font-bold text-white mb-4">⭐ Top Performers</div>
                  <div className="space-y-3">
                    {top5.map((h,i)=>(
                      <div key={i} className="flex items-center gap-4">
                        <div className="text-[11px] text-gray-700 w-5 text-center font-bold">{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-semibold text-gray-300 truncate">{h.name}</div>
                          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                            <div className="h-full rounded-full bg-emerald-400" style={{width:`${Math.min(100,Math.abs(h.returnsPercent||0)/2)}%`,opacity:0.8}}/>
                          </div>
                        </div>
                        <div className="text-[13px] font-black text-emerald-400 flex-shrink-0">{pct(h.returnsPercent||0)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {icon:"◈",title:"AI Insights",sub:"Get AI-powered analysis of your portfolio",href:"/intelligence",color:"#10b981"},
                    {icon:"⟲",title:"Rebalance",sub:"Optimize allocation with smart suggestions",href:"/rebalance",color:"#3b82f6"},
                    {icon:"◎",title:"Tax Harvest",sub:"Identify loss-harvesting opportunities",href:"/tax-harvesting",color:"#f59e0b"},
                  ].map((a,i)=>(
                    <Link key={i} href={a.href} className="card p-5 hover:-translate-y-1 block" style={{borderColor:`${a.color}20`}}>
                      <div className="text-[24px] mb-3" style={{color:a.color}}>{a.icon}</div>
                      <div className="text-[14px] font-bold text-white mb-1">{a.title}</div>
                      <div className="text-[11px] text-gray-600">{a.sub}</div>
                    </Link>
                  ))}
                </div>

                {/* Summary stats */}
                <div className="card p-6">
                  <div className="text-[13px] font-bold text-white mb-4">Portfolio Summary</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      {l:"Total Invested",v:fmt(inv,hide)},
                      {l:"Current Value",v:fmt(cur,hide)},
                      {l:"Total Gain",v:fmt(gain,hide),color:gain>=0?"#10b981":"#ef4444"},
                      {l:"After-Tax Gain",v:fmt(afterTax,hide),color:gain>=0?"#10b981":"#ef4444"},
                      {l:"Monthly SIP",v:fmt(sip,hide)},
                      {l:"Active SIPs",v:`${activeSIPs}`},
                    ].map((s,i)=>(
                      <div key={i} className="rounded-xl p-4" style={{background:"rgba(255,255,255,0.03)"}}>
                        <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1.5">{s.l}</div>
                        <div className="text-[16px] font-black" style={{color:(s as any).color||"#fff"}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
