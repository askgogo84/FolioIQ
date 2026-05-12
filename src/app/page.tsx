
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const DashPreview = () => (
  <svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity="0.25"/><stop offset="100%" stopColor="#16a34a" stopOpacity="0"/></linearGradient>
      <linearGradient id="ng" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1"/><stop offset="100%" stopColor="#94a3b8" stopOpacity="0"/></linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#34d399"/><stop offset="50%" stopColor="#22d3ee"/><stop offset="100%" stopColor="#818cf8"/></linearGradient>
    </defs>
    {/* Window */}
    <rect width="800" height="480" rx="16" fill="#f8fafc"/>
    <rect x="0" y="0" width="800" height="44" rx="16" fill="#f1f5f9"/>
    <rect x="0" y="32" width="800" height="12" fill="#f1f5f9"/>
    <circle cx="18" cy="22" r="6" fill="#fca5a5"/>
    <circle cx="36" cy="22" r="6" fill="#fcd34d"/>
    <circle cx="54" cy="22" r="6" fill="#6ee7b7"/>
    <text x="68" y="26" fill="#94a3b8" fontSize="11" fontFamily="monospace">folio-iq.vercel.app/dashboard</text>
    {/* Ticker */}
    <rect x="0" y="44" width="800" height="20" fill="#111827"/>
    {["NIFTY 50  24,315  +1.12%","SENSEX  80,218  +1.09%","GOLD  ₹9,342/g  +0.34%","USD/INR  ₹83.42  -0.12%","MIDCAP  17,842  +0.87%"].map((t,i)=>(
      <text key={i} x={10+i*160} y="57" fill={i===3?"#f87171":"#34d399"} fontSize="9" fontFamily="monospace">{t}</text>
    ))}
    {/* Sidebar */}
    <rect x="0" y="64" width="140" height="416" fill="#ffffff"/>
    <rect x="0" y="64" width="140" height="416" fill="#f8fafc"/>
    <rect x="8" y="72" width="124" height="28" rx="8" fill="#111827"/>
    <text x="20" y="90" fill="white" fontSize="11" fontWeight="bold" fontFamily="system-ui">FolioIQ</text>
    {["Dashboard","Upload CAS","Transactions","","All Insights","Rebalance","Tax Harvest","AI Chat","","Goal Planner","SIP Calculator"].map((label,i)=>(
      <g key={i}>
        {label && <rect x="8" y={108+i*28} width="124" height="22" rx="6" fill={i===0?"#f0fdf4":"transparent"}/>}
        {label && <text x="18" y={123+i*28} fill={i===0?"#15803d":"#6b7280"} fontSize="10" fontFamily="system-ui">{label}</text>}
      </g>
    ))}
    {/* Main content */}
    {/* Hero card */}
    <rect x="148" y="64" width="644" height="148" rx="12" fill="white"/>
    <rect x="148" y="64" width="644" height="4" rx="2" fill="url(#accent)"/>
    <text x="162" y="88" fill="#9ca3af" fontSize="9" fontWeight="bold" fontFamily="system-ui" letterSpacing="1">TOTAL PORTFOLIO VALUE</text>
    <text x="162" y="124" fill="#111827" fontSize="40" fontWeight="900" fontFamily="system-ui">₹55.33 L</text>
    <text x="162" y="146" fill="#16a34a" fontSize="12" fontFamily="system-ui">↑ ₹16.22L (+41.46%) all time  ·  After-tax ≈ ₹14.19L</text>
    <rect x="162" y="157" width="260" height="22" rx="11" fill="#fef2f2"/>
    <text x="172" y="172" fill="#dc2626" fontSize="10" fontFamily="system-ui">📉 Portfolio declined ₹16,361 (-0.30%) today vs yesterday</text>
    <rect x="604" y="76" width="96" height="52" rx="8" fill="#f9fafb"/>
    <text x="614" y="92" fill="#9ca3af" fontSize="9" fontFamily="system-ui">INVESTED</text>
    <text x="614" y="110" fill="#111827" fontSize="16" fontWeight="900" fontFamily="system-ui">₹39.11 L</text>
    <rect x="704" y="76" width="80" height="52" rx="8" fill="#f9fafb"/>
    <text x="714" y="92" fill="#9ca3af" fontSize="9" fontFamily="system-ui">SIP/MO</text>
    <text x="714" y="110" fill="#111827" fontSize="16" fontWeight="900" fontFamily="system-ui">₹91K</text>
    {/* Sparkline in hero */}
    <polyline points="162,200 200,196 240,192 280,197 320,188 360,182 400,178 440,172 480,168 520,162 560,155 600,148 640,140 680,133 720,125 760,118 792,112" stroke="#16a34a" strokeWidth="2" fill="none" opacity="0.3"/>
    {/* KPI row */}
    {[
      {x:148,label:"HEALTH SCORE",val:"94/100",sub:"Excellent 🌟",c:"#16a34a"},
      {x:308,label:"TOTAL RETURNS",val:"+₹16.22L",sub:"+41.46% all time",c:"#16a34a"},
      {x:468,label:"FUNDS GAINING",val:"17/19",sub:"2 need attention",c:"#111827"},
      {x:628,label:"TAX SAVABLE",val:"~₹16,250",sub:"LTCG before Mar 31",c:"#d97706"},
    ].map((k,i)=>(
      <g key={i}>
        <rect x={k.x} y="220" width="152" height="80" rx="10" fill="white"/>
        <text x={k.x+10} y="237" fill="#9ca3af" fontSize="8" fontFamily="system-ui" fontWeight="bold">{k.label}</text>
        <text x={k.x+10} y="264" fill={k.c} fontSize="18" fontWeight="900" fontFamily="system-ui">{k.val}</text>
        <text x={k.x+10} y="282" fill="#6b7280" fontSize="9" fontFamily="system-ui">{k.sub}</text>
        {i===0&&<><path d={`M ${k.x+12} 308 A 30 30 0 0 1 ${k.x+72} 308`} fill="none" stroke="#e5e7eb" strokeWidth="8" strokeLinecap="round"/>
        <path d={`M ${k.x+12} 308 A 30 30 0 0 1 ${k.x+62} 282`} fill="none" stroke="#16a34a" strokeWidth="8" strokeLinecap="round"/></>}
      </g>
    ))}
    {/* Quick actions */}
    {[{x:148,l:"🧠 All Insights",bg:"#f5f3ff"},{x:310,l:"⚖️ Rebalance",bg:"#fffbeb"},{x:472,l:"🌾 Tax Harvest",bg:"#f0fdf4"},{x:634,l:"🎯 Goals",bg:"#eff6ff"}].map((a,i)=>(
      <g key={i}>
        <rect x={a.x} y="308" width="154" height="40" rx="10" fill={a.bg}/>
        <text x={a.x+12} y="333" fill="#111827" fontSize="11" fontFamily="system-ui" fontWeight="600">{a.l}</text>
      </g>
    ))}
    {/* Chart area */}
    <rect x="148" y="356" width="500" height="110" rx="10" fill="white"/>
    <text x="162" y="374" fill="#111827" fontSize="11" fontWeight="bold" fontFamily="system-ui">Portfolio vs Nifty 50</text>
    {/* Area fill */}
    <polygon points="162,448 200,435 240,428 280,438 320,420 360,408 400,400 440,390 480,380 500,370 520,362 540,356 580,348 620,342 648,336 648,448" fill="url(#hg)"/>
    <polyline points="162,448 200,435 240,428 280,438 320,420 360,408 400,400 440,390 480,380 500,370 520,362 540,356 580,348 620,342 648,336" stroke="#16a34a" strokeWidth="2" fill="none"/>
    <polyline points="162,448 200,440 240,436 280,442 320,430 360,424 400,420 440,414 480,408 520,402 560,396 600,390 648,384" stroke="#cbd5e1" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
    {/* Donut */}
    <rect x="656" y="356" width="136" height="110" rx="10" fill="white"/>
    <text x="666" y="374" fill="#111827" fontSize="11" fontWeight="bold" fontFamily="system-ui">Allocation</text>
    <circle cx="706" cy="418" r="28" fill="none" stroke="#e5e7eb" strokeWidth="14"/>
    <circle cx="706" cy="418" r="28" fill="none" stroke="#16a34a" strokeWidth="14" strokeDasharray="128 48" strokeDashoffset="-12"/>
    <circle cx="706" cy="418" r="28" fill="none" stroke="#d97706" strokeWidth="14" strokeDasharray="40 136" strokeDashoffset="-140"/>
    <circle cx="706" cy="418" r="28" fill="none" stroke="#ca8a04" strokeWidth="14" strokeDasharray="36 140" strokeDashoffset="-180"/>
    <text x="748" y="400" fill="#6b7280" fontSize="9" fontFamily="system-ui">● Equity 73%</text>
    <text x="748" y="415" fill="#6b7280" fontSize="9" fontFamily="system-ui">● Hybrid 14%</text>
    <text x="748" y="430" fill="#6b7280" fontSize="9" fontFamily="system-ui">● Gold 13%</text>
  </svg>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const sb = createClient();
  useEffect(()=>{sb.auth.getUser().then(({data})=>setUser(data.user));},[]);

  return (
    <div className="min-h-screen bg-white" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>

      {/* FIXED NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between h-14 px-6 sm:px-10 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">F</span>
            </div>
            <span className="font-black text-gray-900">FolioIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">How it works</a>
            <Link href="/screener" className="hover:text-gray-900 transition-colors">Fund Screener</Link>
          </div>
          <div className="flex items-center gap-2.5">
            {user
              ? <Link href="/dashboard" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors">Dashboard →</Link>
              : <>
                  <Link href="/auth" className="px-4 py-2 text-gray-600 text-[13px] font-semibold hover:bg-gray-100 rounded-xl transition-colors hidden sm:block">Sign in</Link>
                  <Link href="/auth" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors">Get started →</Link>
                </>
            }
          </div>
        </div>
      </nav>

      {/* HERO — FULL BLEED */}
      <section className="pt-14 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 inset-x-0 h-[70%] bg-gradient-to-b from-emerald-50/80 via-white to-white"/>
          <div className="absolute top-24 left-[10%] w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[100px] opacity-50"/>
          <div className="absolute top-32 right-[10%] w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] opacity-40"/>
        </div>

        <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-10 pt-20 pb-12">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-[12px] font-bold mb-8 shadow-lg">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              India's smartest mutual fund portfolio analyzer
            </div>

            <h1 className="text-[44px] sm:text-[64px] lg:text-[80px] font-black text-gray-900 leading-[1.0] tracking-tight mb-6">
              Your money,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">finally</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 10" fill="none">
                  <path d="M0 7 Q100 1 200 7" stroke="#10b981" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </span>{" "}
              working.
            </h1>

            <p className="text-[18px] sm:text-[20px] text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
              Upload your CAS statement and get instant AI signals, after-tax returns, tax harvest plan, and rebalancing advice. No jargon. Just clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-6">
              <Link href="/auth" className="flex items-center gap-2.5 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-[16px] hover:bg-gray-800 transition-all shadow-2xl shadow-gray-900/20 hover:-translate-y-0.5 active:translate-y-0">
                Analyze my portfolio — free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/screener" className="flex items-center gap-2.5 px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-[16px] border-2 border-gray-200 hover:border-gray-900 transition-all">
                Browse 63+ funds
              </Link>
            </div>
            <p className="text-[12px] text-gray-400">Free forever · No credit card · NJ Wealth, Groww, Zerodha, ET Money, CAMS</p>
          </div>

          {/* FULL-WIDTH Dashboard preview */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-blue-500/15 rounded-3xl blur-2xl"/>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.15)]">
              <DashPreview/>
            </div>
            <div className="absolute -right-4 sm:-right-8 top-8 hidden sm:flex items-center gap-3 bg-white border border-gray-100 shadow-2xl rounded-2xl px-4 py-3">
              <span className="text-2xl">🌟</span>
              <div>
                <div className="text-[13px] font-black text-gray-900">94 / 100</div>
                <div className="text-[11px] text-gray-400">Health Score</div>
              </div>
            </div>
            <div className="absolute -left-4 sm:-left-8 bottom-12 hidden sm:flex items-center gap-3 bg-white border border-gray-100 shadow-2xl rounded-2xl px-4 py-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-[13px] font-black text-emerald-600">Save ₹16,250</div>
                <div className="text-[11px] text-gray-400">Tax harvest ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS — FULL BLEED */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-12">
          {[
            {v:"₹2.4 Cr+",l:"Portfolios analyzed"},
            {v:"41.46%",l:"Best portfolio return"},
            {v:"₹28,400",l:"Avg tax saved / year"},
            {v:"63+",l:"Funds in screener"},
          ].map((s,i)=>(
            <div key={i} className="text-center">
              <div className="text-[30px] sm:text-[36px] font-black text-white leading-none">{s.v}</div>
              <div className="text-[13px] text-gray-500 mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES — FULL BLEED */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-[12px] font-bold mb-5 border border-violet-100">Everything you need</div>
            <h2 className="text-[36px] sm:text-[48px] font-black text-gray-900 leading-tight mb-4">Built for the serious<br/>Indian investor</h2>
            <p className="text-[16px] text-gray-500">What IndiaMoney, Kuvera, and Value Research have — with plain-language explanations most platforms won't give you.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {icon:"🧠",title:"AI Buy/Hold/Sell Signals",desc:"Every fund gets a clear signal with plain-English reasoning. No confusing star ratings.",tag:"vs Wright Research",col:"bg-violet-50 border-violet-100"},
              {icon:"💰",title:"After-Tax Returns",desc:"See what you actually keep after LTCG, STCG & 4% cess. Budget 2024 rules applied.",tag:"Unique in India",col:"bg-amber-50 border-amber-100"},
              {icon:"🌾",title:"Tax Harvest Planner",desc:"Exactly which funds to redeem before March 31 to use ₹1.25L annual LTCG exemption.",tag:"Save ₹15,000+/yr",col:"bg-emerald-50 border-emerald-100"},
              {icon:"⚖️",title:"Smart Rebalancing",desc:"Detects allocation drift and gives a step-by-step plan in rupee amounts.",tag:"vs Kuvera",col:"bg-blue-50 border-blue-100"},
              {icon:"🎯",title:"Goal-Tagged Portfolios",desc:"Tag funds to life goals. FolioIQ protects education and emergency funds from bad advice.",tag:"Novel feature",col:"bg-pink-50 border-pink-100"},
              {icon:"🔍",title:"Fund Screener (63 funds)",desc:"Filter by category, AMC, risk, 1Y/3Y/5Y returns. Watchlist any fund. Sort by anything.",tag:"vs Value Research",col:"bg-slate-50 border-slate-200"},
            ].map((f,i)=>(
              <div key={i} className={`p-7 rounded-3xl border ${f.col} hover:shadow-lg transition-all`}>
                <div className="flex items-start justify-between mb-5">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-full">{f.tag}</span>
                </div>
                <h3 className="text-[17px] font-black text-gray-900 mb-2.5">{f.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-[12px] font-bold mb-5">3 steps</div>
            <h2 className="text-[36px] sm:text-[48px] font-black text-gray-900 mb-3">Up and running<br/>in 2 minutes</h2>
            <p className="text-[16px] text-gray-500">No account linking. No broker access. No risk.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {n:"01",icon:"📥",title:"Upload your CAS",desc:"Download your NJ Wealth XLS or CAMS CAS PDF. Drag and drop it. Parsed in seconds."},
              {n:"02",icon:"🤖",title:"AI analyzes instantly",desc:"Every fund scored on returns, alpha, expense ratio, and risk. Buy/Hold/Sell signals generated."},
              {n:"03",icon:"📊",title:"Take action",desc:"See what to sell, what to continue, how to save tax. Plain English — not finance jargon."},
            ].map((s,i)=>(
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-[11px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{s.n}</span>
                  <span className="text-3xl">{s.icon}</span>
                </div>
                <h3 className="text-[18px] font-black text-gray-900 mb-2.5">{s.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 sm:py-28">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-14">
            <h2 className="text-[36px] sm:text-[48px] font-black text-gray-900 mb-3">How we stack up</h2>
            <p className="text-[16px] text-gray-500">vs IndiaMoney · Kuvera · Value Research · Wright Research</p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-6 py-5 text-[14px] font-bold rounded-tl-3xl">Feature</th>
                  <th className="px-6 py-5 text-[14px] font-black text-emerald-400">FolioIQ</th>
                  <th className="px-6 py-5 text-[14px] font-bold text-gray-400">IndiaMoney</th>
                  <th className="px-6 py-5 text-[14px] font-bold text-gray-400 rounded-tr-3xl">Value Research</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["After-tax returns (Budget 2024)","✅","❌","❌"],
                  ["AI Buy/Hold/Sell per fund","✅","Partial","❌"],
                  ["Tax harvest planner","✅","Partial","❌"],
                  ["Plain-language explanations","✅","❌","❌"],
                  ["Fund screener with alpha","✅","❌","✅"],
                  ["Goal-tagged portfolio","✅","✅","❌"],
                  ["Free forever","✅","❌","Partial"],
                ].map(([feat,...vals],i)=>(
                  <tr key={i} className={i%2===0?"bg-white":"bg-gray-50/50"}>
                    <td className="px-6 py-4 text-[14px] font-medium text-gray-700">{feat}</td>
                    {vals.map((v,vi)=>(
                      <td key={vi} className="px-6 py-4 text-center text-[14px]">
                        <span className={v==="✅"?"text-emerald-600 font-black text-[16px]":v==="❌"?"text-gray-200 text-[16px]":"text-amber-600 font-semibold"}>{v}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA — FULL BLEED */}
      <section className="py-24 sm:py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-10 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <span className="text-white text-2xl font-black">F</span>
          </div>
          <h2 className="text-[40px] sm:text-[56px] font-black text-white mb-5 leading-tight">
            Stop guessing.<br/>
            <span className="text-emerald-400">Start knowing.</span>
          </h2>
          <p className="text-gray-400 text-[18px] mb-10 leading-relaxed max-w-xl mx-auto">
            Upload in 30 seconds. Get the clarity a SEBI advisor would give you — for free.
          </p>
          <Link href="/auth"
            className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-2xl font-black text-[18px] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 hover:-translate-y-0.5">
            Analyze my portfolio — it's free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p className="text-gray-600 text-[13px] mt-5">No credit card · No broker access · Data never stored permanently</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">F</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">FolioIQ</span>
            <span className="text-gray-300">·</span>
            <span className="text-[12px] text-gray-400">India's AI Portfolio Intelligence Platform</span>
          </div>
          <div className="flex gap-6 text-[13px] text-gray-400">
            <Link href="/screener" className="hover:text-gray-700">Fund Screener</Link>
            <Link href="/calculator" className="hover:text-gray-700">SIP Calculator</Link>
            <Link href="/auth" className="hover:text-gray-700">Sign in</Link>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 mt-6 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-3xl">
            FolioIQ is not SEBI-registered. Information is for educational purposes only and does not constitute investment advice. Mutual fund investments are subject to market risks. Past performance is not indicative of future returns. Always consult a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
