
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const STATS = [
  { value: "₹2.4Cr+", label: "Portfolios Analyzed" },
  { value: "19", label: "Fund Types Supported" },
  { value: "12.5%", label: "Avg XIRR Improved" },
  { value: "₹28,400", label: "Avg Tax Saved/Year" },
];

const FEATURES = [
  { icon: "🧠", title: "AI Portfolio Intelligence", desc: "Stop, Continue, or Increase signals for every fund. Plain-language explanations, not just ratings.", badge: "vs Wright Research", color: "from-violet-500 to-purple-600" },
  { icon: "📊", title: "After-Tax Returns", desc: "See what you actually keep after LTCG, STCG & cess. Budget 2024 rules applied automatically.", badge: "Unique", color: "from-emerald-500 to-teal-600" },
  { icon: "🎯", title: "Goal-Based Analysis", desc: "We never recommend selling your emergency fund for a mid-cap. Funds tagged to life goals.", badge: "vs Dezerv", color: "from-orange-500 to-amber-600" },
  { icon: "🌾", title: "Tax Harvest Calculator", desc: "Book ₹1.25L LTCG gains tax-free every FY. Exact funds, units to sell, and same-day reinvest plan.", badge: "Save ₹15K+", color: "from-green-500 to-emerald-600" },
  { icon: "⚖️", title: "Smart Rebalancing", desc: "Portfolio drifted from 60:40 to 80:20? Get a one-click rebalance plan with exact amounts.", badge: null, color: "from-blue-500 to-indigo-600" },
  { icon: "💬", title: "AI Chat Advisor", desc: "Ask Should I stop my ICICI Tech SIP and get a specific answer with 2-3 alternative funds.", badge: "GPT-4 Powered", color: "from-pink-500 to-rose-600" },
  { icon: "🔍", title: "Fund Screener", desc: "Filter 20,000+ AMFI funds by category, returns, risk, AUM. Find the right fund in 30 seconds.", badge: null, color: "from-cyan-500 to-blue-600" },
  { icon: "📅", title: "SIP Calendar", desc: "All your upcoming SIP debits in one view. Never miss a mandate or overdraft warning again.", badge: null, color: "from-yellow-500 to-orange-600" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Upload Your Statement", desc: "NJ Wealth XLS, Kuvera PDF, Groww, Zerodha Coin, CAMS CAS. Any format works.", icon: "📤" },
  { step: "2", title: "AI Parses Instantly", desc: "All funds, invested amounts, current values extracted in seconds. No manual entry.", icon: "⚡" },
  { step: "3", title: "Get Your Intelligence Report", desc: "After-tax returns, health score, Stop/Continue/Increase signals, tax harvest opportunities.", icon: "📊" },
  { step: "4", title: "Take Action", desc: "Specific fund alternatives, goal tagging, rebalance plan. All actionable, not just insights.", icon: "🎯" },
];

const TESTIMONIALS = [
  { quote: "Finally an app that shows what I actually keep after taxes. My XIRR was 15% but after-tax it is 11.2%. Eye-opening.", name: "Kiran S.", role: "Software Engineer, Bengaluru", avatar: "KS" },
  { quote: "The AI flagged my ICICI Tech SIP as loss-making and suggested 3 alternatives with exact percentages to switch. Exactly what I needed.", name: "Priya M.", role: "CA, Mumbai", avatar: "PM" },
  { quote: "Uploaded my NJ Wealth statement, got all 19 funds parsed in 10 seconds. No other app does this for XLS files.", name: "Goverdhan M.", role: "Business Owner, Bangalore", avatar: "GM" },
];

const VS_TABLE = [
  { feature: "After-tax returns (Budget 2024)", folio: true, wright: false, dezerv: false, kuvera: false },
  { feature: "NJ Wealth XLS parser", folio: true, wright: false, dezerv: false, kuvera: false },
  { feature: "Goal-tagged fund protection", folio: true, wright: false, dezerv: true, kuvera: false },
  { feature: "Tax harvest calculator", folio: true, wright: false, dezerv: true, kuvera: true },
  { feature: "2-3 specific fund alternatives", folio: true, wright: true, dezerv: true, kuvera: false },
  { feature: "Multi-portfolio family support", folio: true, wright: false, dezerv: false, kuvera: true },
  { feature: "AI chat with your portfolio data", folio: true, wright: false, dezerv: false, kuvera: false },
  { feature: "Free forever", folio: true, wright: false, dezerv: true, kuvera: true },
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl text-gray-900">FolioIQ</span>
            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Beta</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how" className="hover:text-gray-900">How it works</a>
            <a href="#compare" className="hover:text-gray-900">vs Others</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth" className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">Sign in</Link>
                <Link href="/auth?signup=true" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-6 border border-emerald-200">
            <span>🇮🇳</span> India&#39;s only MF analyzer with after-tax returns
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
            Your portfolio<br />
            <span className="text-emerald-600">tells the truth.</span><br />
            <span className="text-gray-400">Do you know it?</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your NJ Wealth statement and get AI-powered Stop, Continue, Increase signals for every fund — with real after-tax returns and specific alternatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={user ? "/dashboard" : "/auth?signup=true"}
              className="px-8 py-4 bg-emerald-600 text-white rounded-xl text-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:scale-105">
              {user ? "View Dashboard →" : "Analyse My Portfolio Free →"}
            </Link>
            <Link href="/upload"
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl text-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all">
              📤 Upload Statement
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="mx-auto px-4 py-1 bg-gray-700 rounded text-gray-300 text-xs">folio-iq.vercel.app/dashboard</div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { l: "Portfolio Value", v: "₹55.33L", c: "text-gray-900", sub: "+41.46% all time" },
                    { l: "Invested", v: "₹39.11L", c: "text-gray-700", sub: "Across 19 funds" },
                    { l: "After-Tax Returns", v: "+₹16.22L", c: "text-emerald-600", sub: "You keep ₹15.07L" },
                    { l: "Monthly SIP", v: "₹91,000", c: "text-gray-900", sub: "14 active SIPs" },
                  ].map((k) => (
                    <div key={k.l} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">{k.l}</div>
                      <div className={"text-xl font-bold " + k.c}>{k.v}</div>
                      <div className="text-xs text-emerald-600 mt-0.5">{k.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Invesco India Gold ETF", ret: "+119.3%", signal: "🟢 Increase", bg: "bg-green-50 border-green-200" },
                    { name: "ICICI Prudential Technology", ret: "-14.2%", signal: "🔴 Stop SIP", bg: "bg-red-50 border-red-200" },
                    { name: "Parag Parikh Flexi Cap", ret: "+69.0%", signal: "🟡 Continue", bg: "bg-yellow-50 border-yellow-200" },
                  ].map((f) => (
                    <div key={f.name} className={"rounded-lg p-3 border " + f.bg}>
                      <div className="text-xs font-semibold text-gray-900 mb-1 truncate">{f.name}</div>
                      <div className="text-sm font-bold text-gray-900">{f.ret}</div>
                      <div className="text-xs mt-1 font-medium">{f.signal}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-emerald-200 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">From upload to insight in 30 seconds</h2>
            <p className="text-gray-500 text-lg">No manual entry. No spreadsheets. Just upload and get your intelligence report.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-100">{s.icon}</div>
                <div className="text-sm font-bold text-emerald-600 mb-1">Step {s.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Everything you need. Nothing you don&#39;t.</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built specifically for Indian mutual fund investors. Addresses every gap in Kuvera, Groww, and Wright Research.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow group">
                <div className={"w-12 h-12 rounded-xl bg-gradient-to-br " + f.color + " flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform"}>{f.icon}</div>
                {f.badge && <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2 border border-emerald-200">{f.badge}</span>}
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">How FolioIQ compares</h2>
            <p className="text-gray-500 text-lg">The things that matter most to Indian investors.</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">Feature</th>
                  <th className="py-4 px-4 text-center"><div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-bold">FolioIQ</div></th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500">Wright</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500">Dezerv</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-gray-500">Kuvera</th>
                </tr>
              </thead>
              <tbody>
                {VS_TABLE.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-6 text-sm text-gray-700 font-medium">{row.feature}</td>
                    {[row.folio, row.wright, row.dezerv, row.kuvera].map((v, j) => (
                      <td key={j} className="py-3 px-4 text-center text-lg">{v ? "✅" : "❌"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Investors who finally understand their portfolio</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex mb-4">{[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400">★</span>)}</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&#34;{t.quote}&#34;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 to-emerald-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Start knowing your real returns today</h2>
          <p className="text-emerald-200 text-lg mb-10">Upload your statement. Free forever. No credit card. No calls from advisors.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={user ? "/dashboard" : "/auth?signup=true"} className="px-8 py-4 bg-white text-emerald-700 rounded-xl text-lg font-bold hover:bg-gray-50 shadow-xl transition-all hover:scale-105">
              {user ? "Go to Dashboard →" : "Get Started Free →"}
            </Link>
            <Link href="/upload" className="px-8 py-4 border-2 border-emerald-400 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all">
              📤 Upload My Statement
            </Link>
          </div>
          <p className="text-emerald-300 text-sm mt-6">Supports NJ Wealth · Kuvera · Groww · Zerodha Coin · ET Money · CAMS CAS</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xs">F</span></div>
                <span className="font-bold text-white">FolioIQ</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs">India&#39;s only mutual fund analyzer that shows after-tax returns with AI-powered insights.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <div className="text-white font-semibold mb-3">Product</div>
                {[["Dashboard","/dashboard"],["Upload Statement","/upload"],["AI Insights","/intelligence"],["Tax Harvesting","/tax-harvesting"],["Goal Planner","/goals"]].map(([l,h]) => (
                  <Link key={l} href={h} className="block text-gray-500 hover:text-gray-300 mb-1">{l}</Link>
                ))}
              </div>
              <div>
                <div className="text-white font-semibold mb-3">Account</div>
                {[["Sign In","/auth"],["Sign Up Free","/auth?signup=true"],["Upload CAS","/upload"],["AI Chat","/chat"]].map(([l,h]) => (
                  <Link key={l} href={h} className="block text-gray-500 hover:text-gray-300 mb-1">{l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <span>© 2026 FolioIQ. Not SEBI registered. Not investment advice.</span>
            <span>Budget 2024 tax rules applied. Mutual fund investments are subject to market risks.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
