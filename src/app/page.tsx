
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// Inline SVG dashboard preview - no external images needed
const DashboardPreview = () => (
  <svg viewBox="0 0 560 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-2xl">
    {/* Window chrome */}
    <rect width="560" height="340" rx="12" fill="#0f0f0f"/>
    <rect x="0" y="0" width="560" height="36" rx="12" fill="#1a1a1a"/>
    <rect x="0" y="24" width="560" height="12" fill="#1a1a1a"/>
    <circle cx="16" cy="18" r="5" fill="#ef4444" opacity="0.8"/>
    <circle cx="30" cy="18" r="5" fill="#f59e0b" opacity="0.8"/>
    <circle cx="44" cy="18" r="5" fill="#22c55e" opacity="0.8"/>
    <text x="56" y="22" fill="#444" fontSize="9" fontFamily="monospace">folio-iq.vercel.app/dashboard</text>

    {/* Sidebar */}
    <rect x="0" y="36" width="120" height="304" fill="#111"/>
    <rect x="8" y="48" width="36" height="14" rx="4" fill="#1f1f1f"/>
    <text x="50" y="59" fill="#888" fontSize="7" fontFamily="system-ui">FolioIQ</text>
    {[72,90,108,130,148,166,188,206].map((y, i) => (
      <rect key={i} x="8" y={y} width={i===0?104:88} height="12" rx="3" fill={i===0?"#16a34a":"#1a1a1a"}/>
    ))}

    {/* Main content */}
    {/* Dark hero card */}
    <rect x="128" y="44" width="424" height="100" rx="10" fill="#111827"/>
    <text x="140" y="60" fill="#6b7280" fontSize="7" fontFamily="system-ui" fontWeight="600" letterSpacing="1">TOTAL PORTFOLIO VALUE</text>
    <text x="140" y="84" fill="white" fontSize="26" fontFamily="system-ui" fontWeight="900">₹55.33 L</text>
    <text x="140" y="98" fill="#16a34a" fontSize="9" fontFamily="system-ui">↑ ₹16.22L (+41.46%) all time</text>
    <text x="140" y="112" fill="#4b5563" fontSize="8" fontFamily="system-ui">After-tax ≈ ₹14.19 L</text>
    {/* Mini sparkline in hero */}
    <polyline points="300,125 320,115 340,108 360,118 380,105 400,98 420,100 440,92 460,88 480,82 500,75 520,70 540,68" stroke="#16a34a" strokeWidth="1.5" fill="none" opacity="0.6"/>
    <rect x="128" y="48" width="424" height="100" rx="10" fill="url(#hg)" opacity="0.15"/>
    <defs>
      <linearGradient id="hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient>
      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity="0.3"/><stop offset="100%" stopColor="#16a34a" stopOpacity="0"/></linearGradient>
    </defs>
    {/* Today strip */}
    <rect x="128" y="130" width="424" height="18" rx="0" fill="#052e16" opacity="0.8"/>
    <text x="140" y="142" fill="#16a34a" fontSize="7.5" fontFamily="system-ui">📉 Portfolio declined ₹16,361 (−0.30%) today vs yesterday</text>

    {/* KPI row */}
    {[
      {x:128, label:"HEALTH SCORE", val:"94/100", sub:"Excellent"},
      {x:238, label:"TOTAL RETURNS", val:"+₹16.22L", sub:"+41.46% all time"},
      {x:348, label:"FUNDS GAINING", val:"17 / 19", sub:"2 need attention"},
      {x:458, label:"TAX SAVABLE", val:"~₹16,250", sub:"LTCG before Mar 31"},
    ].map((k,i)=>(
      <g key={i}>
        <rect x={k.x} y="152" width="102" height="52" rx="8" fill="#1a1a1a"/>
        <text x={k.x+8} y="163" fill="#555" fontSize="6" fontFamily="system-ui" fontWeight="700" letterSpacing="0.5">{k.label}</text>
        <text x={k.x+8} y="180" fill="white" fontSize="11" fontFamily="system-ui" fontWeight="900">{k.val}</text>
        <text x={k.x+8} y="196" fill={i===1?"#16a34a":"#6b7280"} fontSize="7" fontFamily="system-ui">{k.sub}</text>
      </g>
    ))}

    {/* Chart area */}
    <rect x="128" y="210" width="280" height="90" rx="8" fill="#111"/>
    <text x="138" y="224" fill="white" fontSize="8" fontFamily="system-ui" fontWeight="700">Portfolio vs Nifty 50</text>
    {/* Chart bars suggestion */}
    <polyline points="138,290 165,275 190,268 215,280 240,260 265,250 290,245 315,238 340,230 365,220 390,215" stroke="#16a34a" strokeWidth="1.5" fill="none"/>
    <polyline points="138,290 165,280 190,276 215,283 240,268 265,262 290,260 315,256 340,252 365,246 390,242" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" fill="none"/>
    {/* Fill under line */}
    <polygon points="138,290 165,275 190,268 215,280 240,260 265,250 290,245 315,238 340,230 365,220 390,215 390,295 138,295" fill="url(#cg)"/>

    {/* Pie chart */}
    <rect x="416" y="210" width="136" height="90" rx="8" fill="#111"/>
    <text x="424" y="224" fill="white" fontSize="8" fontFamily="system-ui" fontWeight="700">Allocation</text>
    <circle cx="460" cy="268" r="28" fill="none" stroke="#1f2937" strokeWidth="12"/>
    <circle cx="460" cy="268" r="28" fill="none" stroke="#16a34a" strokeWidth="12" strokeDasharray="128 48" strokeDashoffset="-12" strokeLinecap="round"/>
    <circle cx="460" cy="268" r="28" fill="none" stroke="#d97706" strokeWidth="12" strokeDasharray="40 136" strokeDashoffset="-140" strokeLinecap="round"/>
    <circle cx="460" cy="268" r="28" fill="none" stroke="#ca8a04" strokeWidth="12" strokeDasharray="36 140" strokeDashoffset="-180" strokeLinecap="round"/>
    {[{c:"#16a34a",l:"Equity 73%"},{c:"#d97706",l:"Hybrid 14%"},{c:"#ca8a04",l:"Gold 13%"}].map((d,i)=>(
      <g key={i}>
        <circle cx="496" cy={238+i*14} r="4" fill={d.c}/>
        <text x="504" y={242+i*14} fill="#9ca3af" fontSize="7" fontFamily="system-ui">{d.l}</text>
      </g>
    ))}
  </svg>
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const sb = createClient();
  useEffect(() => { sb.auth.getUser().then(({data}) => setUser(data.user)); }, []);

  return (
    <div className="min-h-screen bg-white" style={{fontFamily:"'Inter var',system-ui,sans-serif"}}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">F</span>
            </div>
            <span className="font-black text-gray-900 tracking-tight">FolioIQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500">
            {[["Features","#features"],["How it works","#how"],["Screener","/screener"]].map(([l,h])=>(
              <a key={h} href={h} className="hover:text-gray-900 transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (
              <Link href="/dashboard" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors">Dashboard →</Link>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 text-gray-600 rounded-xl text-[13px] font-semibold hover:bg-gray-100 transition-colors hidden sm:block">Sign in</Link>
                <Link href="/auth" className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors">Get Started →</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-16 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-60"/>
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40"/>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-white to-transparent"/>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-10 sm:mb-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-[12px] font-bold mb-6 shadow-lg">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/>
              India's smartest mutual fund portfolio analyzer
            </div>

            {/* Headline with gradient */}
            <h1 className="text-[36px] sm:text-[52px] md:text-[68px] font-black text-gray-900 leading-[1.05] tracking-tight mb-5">
              Your money,{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">finally</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 6 Q100 0 200 6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </span>{" "}
              working for you.
            </h1>

            <p className="text-[16px] sm:text-[18px] text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
              Upload your CAS statement → get instant AI signals, after-tax returns, tax harvest plan, and rebalancing advice. No jargon. Just clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-6">
              <Link href="/auth" className="flex items-center gap-2 px-7 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:-translate-y-0.5 active:translate-y-0">
                Analyze my portfolio free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/screener" className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 rounded-2xl font-semibold text-[15px] border-2 border-gray-200 hover:border-gray-900 transition-all">
                Browse funds
              </Link>
            </div>

            <p className="text-[12px] text-gray-400">Free forever · No credit card · Works with NJ Wealth, Groww, Zerodha, ET Money</p>
          </div>

          {/* Dashboard preview SVG */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-violet-500/20 rounded-3xl blur-2xl"/>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xl shadow-gray-900/20">
              <DashboardPreview/>
            </div>
            {/* Floating badges */}
            <div className="absolute -right-4 top-8 hidden sm:flex items-center gap-2 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="text-[12px] font-black text-gray-900">94/100</div>
                <div className="text-[10px] text-gray-500">Health Score</div>
              </div>
            </div>
            <div className="absolute -left-4 bottom-12 hidden sm:flex items-center gap-2 bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3">
              <span className="text-2xl">💰</span>
              <div>
                <div className="text-[12px] font-black text-emerald-600">Save ₹16,250</div>
                <div className="text-[10px] text-gray-500">Tax harvest ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          {[
            { v:"₹2.4Cr+", l:"Portfolios analyzed" },
            { v:"41.46%", l:"Best portfolio return" },
            { v:"₹28,400", l:"Avg tax saved/year" },
            { v:"63+", l:"Funds in screener" },
          ].map((s,i)=>(
            <div key={i} className="text-center">
              <div className="text-[24px] sm:text-[28px] font-black text-gray-900 leading-none">{s.v}</div>
              <div className="text-[12px] text-gray-500 mt-1 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-[12px] font-bold mb-4 border border-violet-100">Everything you need</div>
            <h2 className="text-[28px] sm:text-[36px] md:text-[44px] font-black text-gray-900 leading-tight mb-4">Built for the serious<br className="hidden sm:block"/> Indian investor</h2>
            <p className="text-gray-500 text-[15px] max-w-xl mx-auto">Everything IndiaMoney, Kuvera, and Value Research have — with plain-language explanations most platforms don't dare give.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon:"🧠", title:"AI Buy/Hold/Sell Signals", desc:"Every fund in your portfolio gets a clear signal with the reason in plain English. No confusing star ratings.", col:"bg-violet-50 border-violet-100", iconBg:"bg-violet-100", tag:"vs Wright Research" },
              { icon:"💰", title:"After-Tax Returns", desc:"See what you actually keep after LTCG, STCG & 4% cess. Budget 2024 rules applied automatically.", col:"bg-amber-50 border-amber-100", iconBg:"bg-amber-100", tag:"Unique in India" },
              { icon:"🌾", title:"Tax Harvest Planner", desc:"Shows exactly which funds to redeem before March 31 to use your ₹1.25L annual LTCG exemption.", col:"bg-emerald-50 border-emerald-100", iconBg:"bg-emerald-100", tag:"Save ₹15,000+ /yr" },
              { icon:"⚖️", title:"Smart Rebalancing", desc:"Detects allocation drift and gives you a step-by-step plan — buy X, sell Y — in rupee amounts.", col:"bg-blue-50 border-blue-100", iconBg:"bg-blue-100", tag:"vs Kuvera" },
              { icon:"🎯", title:"Goal-Tagged Portfolios", desc:"Tag every fund to a life goal. FolioIQ protects your education and emergency funds from bad rebalance advice.", col:"bg-pink-50 border-pink-100", iconBg:"bg-pink-100", tag:"Novel feature" },
              { icon:"🔍", title:"Fund Screener (63 funds)", desc:"Filter by category, AMC, risk, 1Y/3Y/5Y returns. Watchlist any fund. See Value Research data in one place.", col:"bg-slate-50 border-slate-200", iconBg:"bg-slate-100", tag:"vs Value Research" },
            ].map((f,i)=>(
              <div key={i} className={`p-5 sm:p-6 rounded-2xl border ${f.col} hover:shadow-md transition-all group`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-11 h-11 ${f.iconBg} rounded-2xl flex items-center justify-center text-xl`}>{f.icon}</div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-full">{f.tag}</span>
                </div>
                <h3 className="text-[15px] font-black text-gray-900 mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-[12px] font-bold mb-4">3 steps</div>
            <h2 className="text-[28px] sm:text-[36px] font-black text-gray-900 mb-3">Up and running in 2 minutes</h2>
            <p className="text-gray-500 text-[15px]">No account linking, no broker access, no risk.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { n:"01", icon:"📥", title:"Upload your CAS", desc:"Download the NJ Wealth XLS or CAMS CAS PDF. Drag and drop it. We parse it in seconds — no manual entry." },
              { n:"02", icon:"🤖", title:"AI analyzes instantly", desc:"Our AI scores every fund on returns, alpha, expense ratio, and risk. Generates Buy/Hold/Sell signals." },
              { n:"03", icon:"📊", title:"Take action", desc:"See exactly what to sell, what to continue, and how to save tax. All in plain English, not finance jargon." },
            ].map((s,i)=>(
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{s.n}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-[16px] font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[36px] font-black text-gray-900 mb-3">How FolioIQ stacks up</h2>
            <p className="text-gray-500 text-[15px]">vs IndiaMoney · Kuvera · Value Research · Wright Research</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="text-left px-5 py-4 text-[13px] font-bold">Feature</th>
                  <th className="px-5 py-4 text-[13px] font-black text-emerald-400">FolioIQ</th>
                  <th className="px-5 py-4 text-[13px] font-bold text-gray-400">IndiaMoney</th>
                  <th className="px-5 py-4 text-[13px] font-bold text-gray-400">Value Research</th>
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
                  <tr key={i} className={i%2===0?"bg-white":"bg-gray-50"}>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-gray-700">{feat}</td>
                    {vals.map((v,vi)=>(
                      <td key={vi} className="px-5 py-3.5 text-center text-[13px]">
                        <span className={v==="✅"?"text-emerald-600 font-bold":v==="❌"?"text-gray-300":"text-amber-600 font-medium"}>{v}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
            <span className="text-white text-3xl font-black">F</span>
          </div>
          <h2 className="text-[32px] sm:text-[44px] font-black text-white mb-4 leading-tight">
            Stop guessing.<br/>
            <span className="text-emerald-400">Start knowing.</span>
          </h2>
          <p className="text-gray-400 text-[16px] mb-8 leading-relaxed max-w-xl mx-auto">
            Upload your portfolio in 30 seconds. Get the same clarity a SEBI-registered advisor would give you — for free.
          </p>
          <Link href="/auth"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[16px] hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-400/30 hover:-translate-y-0.5">
            Analyze my portfolio — it's free
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <p className="text-gray-600 text-[12px] mt-4">No credit card · No broker access · Data never stored permanently</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-black">F</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">FolioIQ</span>
            <span className="text-gray-300">·</span>
            <span className="text-[12px] text-gray-400">India's AI Portfolio Intelligence Platform</span>
          </div>
          <div className="flex gap-6 text-[12px] text-gray-400">
            <Link href="/screener" className="hover:text-gray-700">Fund Screener</Link>
            <Link href="/calculator" className="hover:text-gray-700">SIP Calculator</Link>
            <Link href="/auth" className="hover:text-gray-700">Sign in</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            FolioIQ is not SEBI-registered. Information provided is for educational purposes only and does not constitute investment advice. 
            Mutual fund investments are subject to market risks. Past performance is not indicative of future returns. 
            Always consult a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </footer>
    </div>
  );
}
