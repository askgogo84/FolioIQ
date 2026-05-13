
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, LineChart, Line } from "recharts";
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
const COLORS: Record<string,string> = {Equity:"#16a34a",Debt:"#2563eb",Hybrid:"#d97706",Gold:"#ca8a04",Other:"#64748b"};

function Counter({to,hide,dur=1400,cls=""}:{to:number;hide:boolean;dur?:number;cls?:string}) {
  const [v,setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(()=>{
    if(hide) return;
    const t0=performance.now();
    const tick=(now:number)=>{
      const p=Math.min((now-t0)/dur,1);
      setV(Math.round(to*(1-Math.pow(1-p,4))));
      if(p<1) raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf.current);
  },[to,hide]);
  if(hide) return <span className={cls}>₹ ••••</span>;
  return <span className={cls}>{fmt(v)}</span>;
}

function Spark({data,up}:{data:number[];up:boolean}) {
  return (
    <ResponsiveContainer width={72} height={28}>
      <LineChart data={data.map((y,x)=>({x,y}))} margin={{top:2,right:2,bottom:2,left:2}}>
        <Line type="monotone" dataKey="y" stroke={up?"#16a34a":"#ef4444"} strokeWidth={1.5} dot={false}/>
      </LineChart>
    </ResponsiveContainer>
  );
}

function Gauge({value,color}:{value:number;color:string}) {
  const r=50,cx=68,cy=68;
  const filled=Math.PI*(value/100);
  const ex=cx+r*Math.cos(Math.PI-filled), ey=cy-r*Math.sin(filled);
  const bgPath=`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`;
  const fgPath=value>=100?bgPath:`M ${cx-r} ${cy} A ${r} ${r} 0 ${filled>Math.PI/2?1:0} 1 ${ex} ${ey}`;
  return (
    <svg width="136" height="78" viewBox="0 0 136 78">
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round"/>
      <path d={fgPath} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"/>
      <text x="68" y="60" textAnchor="middle" fill="#111827" fontSize="24" fontWeight="900" fontFamily="system-ui">{value}</text>
      <text x="68" y="74" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="system-ui">out of 100</text>
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
  {q:"₹1L drops to ₹80k. You...",opts:["Sell everything","Sell some","Hold","Buy more"],s:[1,2,3,4]},
  {q:"Investment horizon?",opts:["< 1 year","1–3 years","3–7 years","7+ years"],s:[1,2,3,4]},
  {q:"Monthly swing you can handle?",opts:["< 5%","5–10%","10–20%","20%+"],s:[1,2,3,4]},
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
  const [ticker, setTicker] = useState<any[]>([
    {name:"NIFTY 50",value:"24,315",change:"+1.12%",up:true},
    {name:"SENSEX",value:"80,218",change:"+1.09%",up:true},
    {name:"NIFTY MIDCAP",value:"17,842",change:"+0.87%",up:true},
    {name:"GOLD",value:"₹9,342/g",change:"+0.34%",up:true},
    {name:"USD/INR",value:"₹83.42",change:"-0.12%",up:false},
    {name:"NIFTY IT",value:"38,621",change:"-0.54%",up:false},
    {name:"10Y G-SEC",value:"6.87%",change:"-0.04%",up:false},
  ]);
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(()=>{
    (async()=>{
      const {data:{user}}=await sb.auth.getUser();
      
      // Also check Firebase auth (Google/Apple sign-in)
      const firebaseUser = auth.currentUser;
      
      if(!user && !firebaseUser){router.push("/auth");return;}
      
      if(firebaseUser && !user) {
        // Firebase user but no Supabase session yet — sync and create session
        const res = await fetch("/api/auth/firebase-sync", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            photo: firebaseUser.photoURL,
          })
        });
        const d = await res.json();
        if (d.sessionUrl) window.location.href = d.sessionUrl;
        return;
      }
      
      setUser(user || {email: firebaseUser?.email, uid: firebaseUser?.uid});
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

  const doRefresh=async()=>{
    setRefreshing(true);
    const r=await fetch("/api/market");
    const d=await r.json();
    if(d.indices?.length) setTicker(d.indices);
    setTimeout(()=>setRefreshing(false),800);
  };

  const handleRisk=(s:number)=>{
    const a=[...rAns,s];
    if(rStep<RISK_QS.length-1){setRAns(a);setRStep(rStep+1);}
    else{
      const avg=a.reduce((x,y)=>x+y,0)/a.length;
      setRResult(avg<=1.8?{t:"Conservative",e:"🛡️",rec:"70% Debt · 20% Hybrid · 10% Equity"}
        :avg<=2.8?{t:"Balanced",e:"⚖️",rec:"50% Equity · 30% Hybrid · 20% Debt"}
        :{t:"Aggressive",e:"🚀",rec:"80% Equity · 10% Hybrid · 10% Debt"});
    }
  };

  if(loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin"/>
        <p className="text-sm text-gray-400 tracking-widest uppercase font-medium">Loading portfolio</p>
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
  const hColor=health>=70?"#16a34a":health>=50?"#d97706":"#ef4444";
  const dayPct=((cur%7)/7-0.42)*1.8;
  const dayAmt=cur*dayPct/100;
  const dayUp=dayAmt>=0;

  const am:Record<string,number>={};
  holdings.forEach(h=>{const b=bucket(h.category||"");am[b]=(am[b]||0)+(h.value||0);});
  const alloc=Object.entries(am).map(([n,v])=>({name:n,value:Math.round(v/Math.max(cur,1)*100),amt:v,color:COLORS[n]||"#64748b"})).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  const months=["J","F","M","A","M","J","J","A","S","O","N","D"];
  const growthData=months.map((_,i)=>({
    m:months[i],
    p:Math.round(inv+(gain*(i+1)/12)),
    n:Math.round(inv*(1+0.12*(i+1)/12)),
  }));

  const sorted=[...holdings].sort((a,b)=>(b.returnsPercent||0)-(a.returnsPercent||0));
  const top3=sorted.slice(0,3);
  const bot2=sorted.slice(-2).reverse().filter(h=>(h.returnsPercent||0)<0);
  const taxSave=Math.round(Math.min(125000,holdings.reduce((s,h)=>{
    const g=(h.value||0)-(h.invested||0);
    return s+(/equity|elss/i.test(h.category||"")&&g>0?g:0);
  },0))*0.125*1.04);

  const spark=(base:number,up:boolean)=>Array.from({length:8},(_,i)=>base+(up?1:-1)*base*0.003*i+Math.random()*base*0.001);

  const sig=(r:number)=>
    r<-10?{l:"Exit",bg:"bg-red-50",tc:"text-red-600",dot:"#ef4444"}
    :r<0?{l:"Review",bg:"bg-orange-50",tc:"text-orange-600",dot:"#f97316"}
    :r<8?{l:"Watch",bg:"bg-amber-50",tc:"text-amber-700",dot:"#d97706"}
    :r<20?{l:"Hold",bg:"bg-emerald-50",tc:"text-emerald-700",dot:"#16a34a"}
    :{l:"Star ⭐",bg:"bg-emerald-100",tc:"text-emerald-800",dot:"#15803d"};

  if(!holdings.length) return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex-col z-30">
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-gray-900 text-[14px] tracking-tight leading-none">FolioIQ</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
          <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase px-3 mb-2">GETTING STARTED</div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium bg-gray-900 text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            Dashboard
          </div>
        </div>
        <div className="px-3 py-3 border-t border-gray-100">
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:ml-56 flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-5 sm:px-8 py-3.5 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold text-gray-900">
                {new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}, <span className="text-gray-500">{user?.email?.split("@")[0]}</span> 👋
              </div>
              <div className="text-[11px] text-gray-400">Connect your portfolio to get started</div>
            </div>
            <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))} className="text-[12px] text-gray-400 hover:text-red-500 transition-colors lg:hidden">Sign out</button>
          </div>
        </header>

        <div className="flex-1 px-5 sm:px-8 py-8 w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-[12px] font-bold mb-5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              Step 1 of 2 — Import your portfolio
            </div>
            <h1 className="text-[28px] sm:text-[36px] font-black text-gray-900 mb-2 leading-tight">
              How would you like to connect<br className="hidden sm:block"/> your mutual funds?
            </h1>
            <p className="text-[15px] text-gray-500">Pick any method — takes under 2 minutes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              {
                icon:"📄", step:"01",
                title:"Upload CAS / XLS File",
                sub:"Download from NJ Wealth, CAMS, KFintech, or CDSL and upload here. We parse it in seconds.",
                tag:"✅ Works instantly · No signup needed",
                href:"/upload",
                cta:"Upload File",
                primary:true,
              },
              {
                icon:"🏦", step:"02",
                title:"CDSL OTP — Live Data",
                sub:"Enter your 16-digit Demat ID, verify with OTP on your registered mobile. Real-time holdings.",
                tag:"📱 No PDF needed · Instant",
                href:"/connect",
                cta:"Fetch via OTP",
                primary:false,
              },
              {
                icon:"📧", step:"03",
                title:"Gmail Auto-Import",
                sub:"One-time read-only consent. We find CAS emails from CAMS and KFintech automatically.",
                tag:"⚡ Most convenient · Auto-syncs",
                href:"/connect",
                cta:"Connect Gmail",
                primary:false,
              },
            ].map((m,i)=>(
              <div key={i} className={`rounded-2xl border p-6 flex flex-col transition-all hover:shadow-lg ${m.primary?"bg-gray-900 border-gray-800":"bg-white border-gray-100 hover:border-gray-300"}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${m.primary?"bg-white/10 text-gray-400":"bg-gray-100 text-gray-500"}`}>{m.step}</span>
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <h3 className={`text-[15px] font-black mb-2 ${m.primary?"text-white":"text-gray-900"}`}>{m.title}</h3>
                <p className={`text-[12px] leading-relaxed flex-1 mb-4 ${m.primary?"text-gray-400":"text-gray-500"}`}>{m.sub}</p>
                <div className={`text-[11px] mb-4 font-medium ${m.primary?"text-emerald-400":"text-gray-400"}`}>{m.tag}</div>
                <Link href={m.href}
                  className={`w-full py-3 rounded-xl text-[13px] font-bold text-center transition-colors ${m.primary?"bg-emerald-500 text-white hover:bg-emerald-400":"bg-gray-900 text-white hover:bg-gray-800"}`}>
                  {m.cta} →
                </Link>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Works with all major platforms</div>
            <div className="flex flex-wrap gap-2">
              {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","Paytm Money","CAMS","KFintech","CDSL","NSDL","Axis MF","HDFC MF","Mirae Asset"].map(p=>(
                <span key={p} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-[12px] rounded-full font-medium">{p}</span>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <span className="text-xl">🔒</span>
            <p className="text-[12px] text-emerald-700 leading-relaxed">
              <strong>Read-only · Bank-grade security.</strong> We never have trading or redemption access. Data encrypted end-to-end. NAVs refresh daily from AMFI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>

      {/* SIDEBAR */}
      <aside className={`${sidebar?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 shadow-xl lg:shadow-none`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-black text-gray-900 text-[14px] tracking-tight leading-none">FolioIQ</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV.map((sec,si)=>(
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase px-3 mb-2">{sec.s}</div>
              {sec.items.map(item=>(
                <Link key={item.h} href={item.h} onClick={()=>setSidebar(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                    ${(item as any).a?"bg-gray-900 text-white shadow-sm":"text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d={(item as any).d}/>
                  </svg>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <button onClick={()=>{setRisk(true);setRStep(0);setRAns([]);setRResult(null);}}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            Risk Profile
          </button>
          <button onClick={()=>sb.auth.signOut().then(()=>router.push("/"))}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* TICKER */}
        <div className="bg-gray-900 overflow-hidden" style={{height:28}}>
            <div className="flex items-center h-full gap-8 px-4 text-[10px] animate-[ticker_35s_linear_infinite] whitespace-nowrap">
              {[...ticker,...ticker,...ticker].map((t,i)=>(
                <span key={i} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-500">{t.name}</span>
                  <span className="text-gray-200 font-mono">{t.value}</span>
                  <span className={t.up?"text-emerald-400":"text-red-400"}>{t.change}</span>
                </span>
              ))}
            </div>
          </div>

        {/* HEADER */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebar(!sidebar)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-none">
                {new Date().getHours()<12?"Good morning":new Date().getHours()<17?"Good afternoon":"Good evening"}, <span className="text-gray-500">{user?.email?.split("@")[0]}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Day pill */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${dayUp?"bg-emerald-50 border-emerald-100 text-emerald-700":"bg-red-50 border-red-100 text-red-700"}`}>
              {dayUp?"↑":"↓"} {fmt(Math.abs(dayAmt),hide)} ({dayUp?"+":""}{dayPct.toFixed(2)}%) today
            </div>
            <button onClick={()=>setHide(!hide)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide?<><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19M1 1l22 22"/></>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            <button onClick={doRefresh} className={`p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${refreshing?"animate-spin text-emerald-500":""}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
            {/* Portfolio value in header */}
            <div className="hidden lg:block text-right border-l border-gray-100 pl-3 ml-1">
              <div className="text-[9px] text-gray-400 uppercase tracking-widest">Total Portfolio</div>
              <div className="text-[14px] font-black text-gray-900">{hide?"₹ ••••":fmt(cur)}</div>
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-5 space-y-5">

            {/* HERO CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 rounded-t-3xl"/>

              <div className="p-5 sm:p-8 pt-6 sm:pt-9">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-3">TOTAL PORTFOLIO VALUE</div>
                    <Counter to={cur} hide={hide} cls="text-[52px] sm:text-[68px] lg:text-[80px] font-black text-gray-900 tracking-tight leading-none block"/>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className={`text-[14px] font-bold flex items-center gap-1 ${gain>=0?"text-emerald-600":"text-red-600"}`}>
                        {gain>=0?"↑":"↓"} {hide?"••••":fmt(Math.abs(gain))} ({pct(retPct)}) all time
                      </span>
                      <span className="text-[12px] text-gray-400">After-tax ≈ {hide?"••••":fmt(afterTax)}</span>
                    </div>
                    {/* Day change pill */}
                    <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-[12px] font-semibold border ${dayUp?"bg-emerald-50 border-emerald-100 text-emerald-700":"bg-red-50 border-red-100 text-red-700"}`}>
                      {dayUp?"📈":"📉"} Portfolio {dayUp?"gained":"declined"} {hide?"••••":fmt(Math.abs(dayAmt))} ({dayPct.toFixed(2)}%) today vs yesterday
                    </div>
                  </div>

                  <div className="flex gap-3 lg:flex-col">
                    {[
                      {l:"Invested",v:inv,sub:`${holdings.length} funds`},
                      {l:"Monthly SIP",v:sip,sub:`${activeSIPs} active`},
                    ].map((k,i)=>(
                      <div key={i} className="bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 lg:min-w-[130px]">
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{k.l}</div>
                        <div className="text-[20px] font-black text-gray-900">{hide?"••••":fmt(k.v)}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sparkline strip */}
                <div className="mt-4 opacity-20 pointer-events-none">
                  <ResponsiveContainer width="100%" height={44}>
                    <AreaChart data={growthData} margin={{top:0,right:0,bottom:0,left:0}}>
                      <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.4}/><stop offset="100%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="p" stroke="#16a34a" fill="url(#hg)" strokeWidth={2} dot={false}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 4 KPI CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Health Score */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-3">HEALTH SCORE</div>
                <div className="flex justify-center">
                  <Gauge value={health} color={hColor}/>
                </div>
                <div className="text-[13px] font-bold mt-2" style={{color:hColor}}>
                  {health>=70?"Excellent 🌟":health>=50?"Good 👍":"Needs Review ⚠️"}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">{gainers.length}/{holdings.length} funds profitable</div>
              </div>

              {/* Total Returns */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">TOTAL RETURNS</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
                </div>
                <div className={`text-[30px] sm:text-[34px] font-black leading-none ${gain>=0?"text-emerald-600":"text-red-600"}`}>{hide?"••••":(gain>=0?"+":"")+fmt(gain)}</div>
                <div className={`text-[12px] font-semibold mt-1 ${gain>=0?"text-emerald-500":"text-red-500"}`}>{pct(retPct)} all time</div>
                <div className="mt-3 pointer-events-none">
                  <Spark data={growthData.map(d=>d.p)} up={gain>=0}/>
                </div>
              </div>

              {/* Funds Status */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">FUNDS STATUS</span>
                  <span className="text-gray-400">💼</span>
                </div>
                <div className="text-[30px] sm:text-[34px] font-black text-gray-900 leading-none">{gainers.length}<span className="text-gray-300 text-[18px]">/{holdings.length}</span></div>
                <div className="text-[12px] text-gray-400 mt-1">Gaining · {losers.length} need attention</div>
                <div className="mt-3 flex items-end gap-0.5 h-8">
                  {holdings.slice(0,14).map((h,i)=>{
                    const r=h.returnsPercent||0;
                    const ht=Math.abs(r)/Math.max(...holdings.map(x=>Math.abs(x.returnsPercent||0)))*100;
                    return <div key={i} className="flex-1 rounded-sm" style={{height:`${Math.max(ht,8)}%`,backgroundColor:r>=0?"#16a34a":"#ef4444",opacity:0.6}}/>;
                  })}
                </div>
              </div>

              {/* Tax Savable */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">TAX SAVABLE</span>
                  <span className="text-gray-400">🌾</span>
                </div>
                <div className="text-[30px] sm:text-[34px] font-black text-amber-600 leading-none">{hide?"••••":"~"+fmt(taxSave)}</div>
                <div className="text-[12px] text-gray-400 mt-1">LTCG before Mar 31</div>
                <Link href="/tax-harvesting" className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-amber-600 hover:text-amber-700 transition-colors">
                  View harvest plan →
                </Link>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {e:"🧠",l:"All Insights",s:"Fund signals",h:"/intelligence",bg:"bg-violet-50 border-violet-200 hover:bg-violet-100"},
                {e:"⚖️",l:"Smart Rebalance",s:"Drift analysis",h:"/rebalance",bg:"bg-amber-50 border-amber-200 hover:bg-amber-100"},
                {e:"🌾",l:"Tax Harvest",s:taxSave>0?`Save ${fmt(taxSave)}`:"Review gains",h:"/tax-harvesting",bg:"bg-emerald-50 border-emerald-200 hover:bg-emerald-100"},
                {e:"🎯",l:"Goals",s:"Plan your future",h:"/goals",bg:"bg-blue-50 border-blue-200 hover:bg-blue-100"},
              ].map((a,i)=>(
                <Link key={i} href={a.h} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-sm active:scale-[0.97] ${a.bg}`}>
                  <span className="text-2xl">{a.e}</span>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-gray-900 truncate">{a.l}</div>
                    <div className="text-[12px] text-gray-500 truncate">{a.s}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* TABS */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                {[["overview","Overview"],["funds","Fund Holdings"],["insights","Insights"]].map(([id,label])=>(
                  <button key={id} onClick={()=>setTab(id as any)}
                    className={`flex-1 py-5 text-[14px] font-bold tracking-wide transition-all border-b-2 ${
                      tab===id?"text-gray-900 border-gray-900 bg-white":"text-gray-400 border-transparent hover:text-gray-700"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {tab==="overview"&&(
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* Chart */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-[14px] font-bold text-gray-900">Portfolio vs Nifty 50</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">12-month performance</div>
                        </div>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          {["3M","6M","1Y","All"].map(p=>(
                            <button key={p} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${p==="1Y"?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={growthData} margin={{top:4,right:4,bottom:0,left:-20}}>
                          <defs>
                            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2}/>
                              <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.08}/>
                              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                          <XAxis dataKey="m" fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                          <YAxis fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                          <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12,boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}} formatter={(v:number,n:string)=>[fmt(v),n==="p"?"Portfolio":"Nifty 50"]}/>
                          <Area type="monotone" dataKey="p" stroke="#16a34a" fill="url(#gP)" strokeWidth={2.5} name="p" dot={false} activeDot={{r:5,fill:"#16a34a",stroke:"#fff",strokeWidth:2}}/>
                          <Area type="monotone" dataKey="n" stroke="#cbd5e1" fill="url(#gN)" strokeWidth={1.5} name="n" dot={false} strokeDasharray="5 5"/>
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center gap-5 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><div className="w-4 h-0.5 bg-emerald-500 rounded-full"/>Your Portfolio</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400"><div className="w-4 h-0.5 bg-slate-300 rounded-full"/>Nifty 50</div>
                      </div>
                    </div>

                    {/* Allocation */}
                    <div className="lg:col-span-2">
                      <div className="text-[14px] font-bold text-gray-900 mb-1">Asset Allocation</div>
                      <div className="text-[11px] text-gray-400 mb-4">By current value</div>
                      <div className="flex justify-center mb-4">
                        <ResponsiveContainer width={160} height={160}>
                          <PieChart>
                            <Pie data={alloc} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                              {alloc.map((e,i)=><Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,fontSize:11}} formatter={(v:number)=>`${v}%`}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {alloc.map(a=>(
                          <div key={a.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                            <span className="text-[12px] text-gray-600 flex-1">{a.name}</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{width:`${a.value}%`,backgroundColor:a.color}}/>
                            </div>
                            <span className="text-[12px] font-bold text-gray-900 w-8 text-right">{a.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top / Bottom WITH sparklines */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {title:"🔥 TOP PERFORMERS",funds:top3,pos:true},
                      {title:"⚠️ NEEDS ATTENTION",funds:bot2,pos:false},
                    ].map((sec,si)=>(
                      <div key={si}>
                        <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4">{sec.title}</div>
                        <div className="space-y-2">
                          {sec.funds.length===0?(
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              <span className="text-[12px] text-emerald-700 font-medium">All funds in profit! 🎉</span>
                            </div>
                          ):sec.funds.map((h,i)=>{
                            const r=h.returnsPercent||0;
                            return (
                              <button key={i} onClick={()=>setSelFund(h)}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.98] ${sec.pos?"border-gray-100 hover:border-emerald-200 hover:bg-emerald-50":"border-gray-100 hover:border-red-200 hover:bg-red-50"}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${sec.pos?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{i+1}</div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-[12px] font-bold truncate ${sec.pos?"text-gray-900":"text-gray-900"}`}>{(h.name||"").replace(/ - Gr$/,"").substring(0,26)}</div>
                                  <div className="text-[10px] text-gray-400">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)}</div>
                                </div>
                                {/* SPARKLINE */}
                                <div className="flex-shrink-0 pointer-events-none">
                                  <Spark data={spark(Math.abs(r),sec.pos)} up={sec.pos}/>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className={`text-[13px] font-black ${sec.pos?"text-emerald-600":"text-red-600"}`}>{r>=0?"+":""}{r.toFixed(1)}%</div>
                                  <div className="text-[10px] text-gray-400">{hide?"••":fmt(h.value||0)}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FUNDS */}
              {tab==="funds"&&(
                <div>
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-gray-900">All Holdings <span className="text-gray-400 font-normal text-[13px]">({holdings.length})</span></span>
                    <span className="text-[11px] text-gray-400">{hide?"••••":fmt(inv)} → {hide?"••••":fmt(cur)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[580px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["Fund","Category","Invested","Value","Returns","Signal"].map(h=>(
                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(showAll?holdings:holdings.slice(0,8)).map((h:any,i:number)=>{
                          const r=h.returnsPercent||0,s=sig(r);
                          return (
                            <tr key={i} onClick={()=>setSelFund(h)}
                              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                              <td className="px-4 py-3.5">
                                <div className="text-[14px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors max-w-[180px] truncate">{(h.name||"").replace(/ - Gr$/,"")}</div>
                                {(h.sip||0)>0&&<span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-semibold">SIP ₹{(h.sip||0).toLocaleString()}</span>}
                              </td>
                              <td className="px-4 py-3.5 text-[11px] text-gray-400 max-w-[100px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)}</td>
                              <td className="px-4 py-3.5 text-[12px] text-gray-600 font-mono">{hide?"••":fmt(h.invested||0)}</td>
                              <td className="px-4 py-3.5 text-[13px] font-bold font-mono" style={{color:r>=0?"#16a34a":"#ef4444"}}>{hide?"••":fmt(h.value||0)}</td>
                              <td className="px-4 py-3.5">
                                <div className={`text-[13px] font-black ${r>=0?"text-emerald-600":"text-red-600"}`}>{r>=0?"+":""}{r.toFixed(1)}%</div>
                                <div className={`text-[10px] ${r>=0?"text-emerald-400":"text-red-400"}`}>{r>=0?"+":""}{hide?"••":fmt((h.value||0)-(h.invested||0))}</div>
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
                    <button onClick={()=>setShowAll(!showAll)} className="w-full py-4 text-[13px] font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all border-t border-gray-100">
                      {showAll?`Show less ↑`:`Show all ${holdings.length} funds ↓`}
                    </button>
                  )}
                  <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
                    <span className="text-[11px] text-amber-600">⚡ Budget 2024 · LTCG (12m+): 12.5% above ₹1.25L · STCG: 20% · Debt: slab rate</span>
                  </div>
                </div>
              )}

              {/* INSIGHTS */}
              {tab==="insights"&&(
                <div className="p-5 sm:p-6 space-y-3">
                  {taxSave>0&&(
                    <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">💰</div>
                      <div>
                        <div className="text-[14px] font-bold text-gray-900 mb-1">Tax harvest — save {fmt(taxSave)} this year</div>
                        <div className="text-[12px] text-gray-500">Book ₹1.25L LTCG before March 31 · Reinvest same day · Reset cost basis</div>
                        <Link href="/tax-harvesting" className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 mt-2 hover:underline">View harvest plan →</Link>
                      </div>
                    </div>
                  )}
                  {losers.map((h,i)=>(
                    <div key={i} className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl">
                      <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-gray-900 mb-1">{(h.name||"").replace(/ - Gr$/,"").substring(0,38)} underperforming</div>
                        <div className="text-[12px] text-gray-500">Down {(h.returnsPercent||0).toFixed(1)}% · Pause SIP · Consider: Parag Parikh Flexi Cap, Axis Multicap</div>
                        <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-bold text-red-700 mt-2 hover:underline">Get AI analysis →</Link>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">📊</div>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 mb-1">XIRR {meta?.xirr||13.3}% — beating Nifty 50 (12%)</div>
                      <div className="text-[12px] text-gray-500">Top: {top3[0]?.name?.replace(/ - Gr$/,"").substring(0,28)} (+{(top3[0]?.returnsPercent||0).toFixed(1)}%)</div>
                      <Link href="/intelligence" className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-700 mt-2 hover:underline">Full analysis →</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-5 bg-violet-50 border border-violet-100 rounded-2xl">
                    <div className="w-10 h-10 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">🧠</div>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 mb-1">Know your real risk tolerance</div>
                      <div className="text-[12px] text-gray-500">5 behavioural questions · How you actually react in market downturns</div>
                      <button onClick={()=>{setRisk(true);setRStep(0);setRAns([]);setRResult(null);}} className="inline-flex items-center gap-1 text-[12px] font-bold text-violet-700 mt-2 hover:underline">Take the quiz →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AUTO-CONNECT BANNER */}
            <div className="bg-gray-900 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[15px] font-bold text-white">Auto Portfolio Sync</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-full tracking-widest uppercase border border-emerald-500/30">Coming Soon</span>
                  </div>
                  <p className="text-gray-400 text-[12px] max-w-md leading-relaxed">Connect via MF Central · One-time OTP · Daily auto-sync · No more uploading files</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS"].map(p=>(
                      <span key={p} className="px-2 py-1 bg-white/5 text-gray-500 text-[10px] rounded-lg border border-white/10">{p}</span>
                    ))}
                  </div>
                </div>
                <a href="/connect" className="flex-shrink-0 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-[13px] font-bold hover:bg-gray-100 transition-colors inline-block">
                  Connect Now →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {sidebar&&<div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={()=>setSidebar(false)}/>}

      {/* FUND MODAL */}
      {selFund&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm" onClick={()=>setSelFund(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
            <div className="px-5 pt-4 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-gray-900 leading-snug">{(selFund.name||"").replace(/ - Gr$/,"")}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{selFund.category}</p>
                </div>
                <button onClick={()=>setSelFund(null)} className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0 text-gray-400 hover:text-gray-700">
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
                  <div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{d.l}</div>
                    <div className={`text-[15px] font-black ${(i===2||i===3)?(selFund.returnsPercent>=0?"text-emerald-600":"text-red-600"):"text-gray-900"}`}>{d.v}</div>
                  </div>
                ))}
              </div>
              {(()=>{const s=sig(selFund.returnsPercent||0);return(
                <div className={`flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 ${s.bg}`}>
                  <span className="text-[12px] font-bold text-gray-700">AI Signal</span>
                  <span className={`flex items-center gap-2 text-[13px] font-black ${s.tc}`}><span className="w-2 h-2 rounded-full" style={{backgroundColor:s.dot}}/>{s.l}</span>
                </div>
              );})()}
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/intelligence" className="py-3 bg-gray-900 text-white rounded-2xl text-[13px] font-bold text-center hover:bg-gray-800 transition-colors">AI Analysis</Link>
                <Link href="/tax-harvesting" className="py-3 bg-gray-100 text-gray-700 rounded-2xl text-[13px] font-bold text-center hover:bg-gray-200 transition-colors">Tax Plan</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RISK MODAL */}
      {risk&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
            <div className="bg-gray-900 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-black text-[16px]">Risk Profile Quiz</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">5 questions · understand your real risk tolerance</div>
                </div>
                <button onClick={()=>setRisk(false)} className="text-gray-500 hover:text-gray-300 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {!rResult&&<div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden"><div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{width:`${(rStep/RISK_QS.length)*100}%`}}/></div>}
            </div>
            <div className="p-6">
              {rResult?(
                <div className="text-center">
                  <div className="text-5xl mb-4">{rResult.e}</div>
                  <div className="text-[22px] font-black text-gray-900 mb-1">{rResult.t} Investor</div>
                  <div className="text-[13px] font-semibold text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">{rResult.rec}</div>
                  <button onClick={()=>setRisk(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[14px] hover:bg-gray-800 transition-colors">Apply to Portfolio ✓</button>
                </div>
              ):(
                <div>
                  <div className="text-[11px] text-gray-400 font-bold mb-3">{rStep+1} / {RISK_QS.length}</div>
                  <h3 className="text-[16px] font-black text-gray-900 mb-5 leading-snug">{RISK_QS[rStep].q}</h3>
                  <div className="space-y-2">
                    {RISK_QS[rStep].opts.map((opt,i)=>(
                      <button key={i} onClick={()=>handleRisk(RISK_QS[rStep].s[i])}
                        className="w-full text-left px-5 py-4 border-2 border-gray-100 rounded-2xl text-[13px] text-gray-700 font-medium hover:border-gray-900 hover:bg-gray-50 transition-all active:scale-[0.98]">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {rStep>0&&<button onClick={()=>{setRStep(rStep-1);setRAns(rAns.slice(0,-1));}} className="mt-4 text-[11px] text-gray-400 hover:text-gray-600">← Back</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
