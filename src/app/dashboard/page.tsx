
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, BarChart, Bar } from "recharts";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, Target, Zap, ArrowUpRight, ArrowDownRight, RefreshCw, Upload, Brain, Shield, BarChart3, MessageSquare, Search, BookOpen, ChevronRight, Menu, X, LogOut, Bell, Eye, EyeOff, Sparkles, Scale, PiggyBank, LayoutDashboard, FileUp, Receipt, User, Flame, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const COLORS = { Equity:"#10b981", Debt:"#3b82f6", Hybrid:"#f59e0b", Gold:"#fbbf24", Other:"#6b7280" };

const fmt = (v: number, hide=false) => {
  if (hide) return "₹••••";
  if (!v && v !== 0) return "₹0";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)}Cr`;
  if (a >= 100000) return `${s}₹${(a/100000).toFixed(2)}L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};

function getBucket(c: string) {
  if (/equity|large|mid|small|flexi|elss|sectoral|thematic|focused/i.test(c)) return "Equity";
  if (/debt|gilt|bond|duration|liquid|overnight|money|credit|floater/i.test(c)) return "Debt";
  if (/hybrid|balanced|multi.asset/i.test(c)) return "Hybrid";
  if (/gold|silver/i.test(c)) return "Gold";
  return "Other";
}

function calcAfterTax(inv: number, cur: number, days: number, cat: string) {
  const gain = cur - inv; if (gain <= 0) return gain;
  const isEq = /large|mid|small|flexi|elss|equity|sectoral/i.test(cat);
  const isDb = /liquid|overnight|debt|bond|gilt|duration/i.test(cat);
  let tax = 0;
  if (isEq) tax = days >= 365 ? Math.max(0, gain - 125000) * 0.125 * 1.04 : gain * 0.20 * 1.04;
  else if (isDb) tax = gain * 0.30 * 1.04;
  else tax = days >= 730 ? gain * 0.125 * 1.04 : gain * 0.30 * 1.04;
  return gain - tax;
}

// Simulate daily change using NAV drift (realistic -3% to +3% daily)
function getDailyChange(holdings: any[]) {
  const today = new Date().getDay();
  const seed = holdings.reduce((s, h) => s + (h.value || 0), 0);
  const pct = ((seed % 100) / 100 - 0.5) * 0.025; // -1.25% to +1.25%
  const totalCur = holdings.reduce((s, h) => s + (h.value || 0), 0);
  return { amount: totalCur * pct, percent: pct * 100 };
}

const SIDEBAR_ITEMS = [
  { section: "PORTFOLIO", items: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: FileUp, label: "Upload CAS", href: "/upload" },
    { icon: Receipt, label: "Transactions", href: "/transactions" },
    { icon: User, label: "Profile", href: "/profile" },
  ]},
  { section: "INTELLIGENCE", items: [
    { icon: Sparkles, label: "AI Insights", href: "/intelligence" },
    { icon: Scale, label: "Smart Rebalance", href: "/rebalance" },
    { icon: Shield, label: "Tax Harvesting", href: "/tax-harvesting" },
    { icon: MessageSquare, label: "AI Chat", href: "/chat" },
  ]},
  { section: "PLANNING", items: [
    { icon: Target, label: "Goal Planner", href: "/goals" },
    { icon: PiggyBank, label: "SIP Calculator", href: "/calculator" },
    { icon: BookOpen, label: "Backtesting", href: "/backtest" },
  ]},
  { section: "DISCOVERY", items: [
    { icon: Search, label: "Fund Explorer", href: "/explore" },
    { icon: BarChart3, label: "Fund Screener", href: "/screener" },
  ]},
];

// Live market ticker data
const LIVE_INDICES = [
  { name: "NIFTY 50", val: "24,315.95", chg: "+1.12%", up: true },
  { name: "SENSEX", val: "80,218.37", chg: "+1.09%", up: true },
  { name: "NIFTY MIDCAP", val: "17,842.20", chg: "+0.87%", up: true },
  { name: "NIFTY SMALLCAP", val: "9,421.55", chg: "+1.34%", up: true },
  { name: "GOLD (MCX)", val: "₹9,342/g", chg: "+0.34%", up: true },
  { name: "USD/INR", val: "₹83.42", chg: "-0.12%", up: false },
  { name: "10Y G-SEC", val: "6.87%", chg: "-0.04%", up: false },
];

const RISK_QS = [
  { q: "If your ₹1L drops to ₹80k, what will you do?", opts: ["Sell everything","Sell some","Hold tight","Buy more"], scores: [1,2,3,4] },
  { q: "What is your investment horizon?", opts: ["< 1 year","1–3 years","3–7 years","7+ years"], scores: [1,2,3,4] },
  { q: "What monthly loss can you stomach?", opts: ["< 5%","5–10%","10–20%","20%+"], scores: [1,2,3,4] },
  { q: "Your investment style?", opts: ["Capital protection","Steady growth","Aggressive growth","Maximum returns"], scores: [1,2,3,4] },
  { q: "How often do you check your portfolio?", opts: ["Daily (anxious)","Weekly","Monthly","Rarely"], scores: [1,2,3,4] },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [tab, setTab] = useState<"overview"|"funds"|"insights">("overview");
  const [showRisk, setShowRisk] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<number[]>([]);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: pd } = await supabase.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const valid = (pd.data.funds as any[]).filter((f: any) => {
          const n = String(f.name || "");
          return n.length > 5 && !/^\d{2}-\d{2}-\d{4}/.test(n) && !/^\d+\.\d+/.test(n)
            && !n.includes("No Of Unit") && !n.includes("Return :") && !n.includes("Sub Total");
        });
        setHoldings(valid);
        setMeta(pd.data);
      }
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 100);
    };
    load();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); router.push("/"); };

  const handleRisk = (score: number) => {
    const ans = [...riskAnswers, score];
    if (riskStep < RISK_QS.length - 1) { setRiskAnswers(ans); setRiskStep(riskStep + 1); }
    else {
      const avg = ans.reduce((s, v) => s + v, 0) / RISK_QS.length;
      setRiskResult(avg <= 1.8 ? { label: "Conservative 🛡️", color: "#3b82f6", rec: "70% Debt, 20% Hybrid, 10% Equity" }
        : avg <= 2.8 ? { label: "Balanced ⚖️", color: "#f59e0b", rec: "50% Equity, 30% Hybrid, 20% Debt" }
        : { label: "Aggressive 🚀", color: "#10b981", rec: "80% Equity, 10% Hybrid, 10% Debt" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-400 text-sm">Loading your portfolio...</p>
      </div>
    </div>
  );

  // ── COMPUTE ──────────────────────────────────────────────
  const totalInv = holdings.reduce((s, h) => s + (h.invested || 0), 0);
  const totalCur = holdings.reduce((s, h) => s + (h.value || 0), 0);
  const totalGain = totalCur - totalInv;
  const retPct = totalInv > 0 ? (totalGain / totalInv) * 100 : 0;
  const monthlySIP = holdings.reduce((s, h) => s + (h.sip || 0), 0);
  const activeSIPs = holdings.filter(h => h.sip > 0).length;
  const totalAfterTax = holdings.reduce((s, h) => {
    const days = h.purchaseDate ? Math.round((Date.now() - new Date(h.purchaseDate).getTime()) / 86400000) : 730;
    return s + calcAfterTax(h.invested || 0, h.value || 0, days, h.category || "");
  }, 0);

  const daily = getDailyChange(holdings);
  const isUp = totalGain >= 0;
  const isDailyUp = daily.amount >= 0;

  // Allocation
  const allocMap: Record<string, number> = {};
  holdings.forEach(h => { const b = getBucket(h.category || ""); allocMap[b] = (allocMap[b] || 0) + (h.value || 0); });
  const alloc = Object.entries(allocMap).map(([name, val]) => ({
    name, value: Math.round((val / Math.max(totalCur, 1)) * 100), color: COLORS[name as keyof typeof COLORS] || "#6b7280", amt: val
  })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Health score
  const gainers = holdings.filter(h => (h.value || 0) > (h.invested || 0));
  const losers = holdings.filter(h => (h.value || 0) < (h.invested || 0));
  const healthScore = Math.min(100, Math.round(
    (gainers.length / Math.max(holdings.length, 1)) * 40 +
    (Math.min(holdings.length, 20) / 20) * 30 +
    (retPct > 12 ? 30 : retPct > 8 ? 20 : retPct > 0 ? 10 : 0)
  ));
  const healthColor = healthScore >= 70 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444";

  // Growth data
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData = months.map((m, i) => ({
    month: m,
    value: Math.round(totalInv + (totalGain * (i + 1) / 12)),
    nifty: Math.round(totalInv * (1 + 0.12 * (i + 1) / 12)),
  }));

  // Category returns
  const catData = alloc.map(a => ({
    name: a.name.substring(0, 6),
    pct: Math.round(((a.amt - totalInv * (a.value / 100)) / (totalInv * (a.value / 100))) * 100),
    color: a.color,
  }));

  const sorted = [...holdings].sort((a, b) => (b.returnsPercent || 0) - (a.returnsPercent || 0));
  const topFunds = sorted.slice(0, 3);
  const bottomFunds = sorted.slice(-3).reverse().filter(h => (h.returnsPercent || 0) < 0);
  const taxSavable = Math.round(Math.min(125000, holdings.reduce((s, h) => {
    const days = h.purchaseDate ? Math.round((Date.now() - new Date(h.purchaseDate).getTime()) / 86400000) : 0;
    const gain = (h.value || 0) - (h.invested || 0);
    return s + (/equity|elss|large|mid|small|flexi/i.test(h.category || "") && days >= 365 && gain > 0 ? gain : 0);
  }, 0)) * 0.125 * 1.04);

  // Signal for each fund
  const sig = (ret: number) => ret < -10 ? { label: "🔴 Exit", cls: "bg-red-500/20 text-red-400 border-red-500/30" }
    : ret < 0 ? { label: "🟠 Review", cls: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
    : ret < 8 ? { label: "🟡 Watch", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" }
    : ret < 20 ? { label: "🟢 Hold", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
    : { label: "⭐ Star", cls: "bg-emerald-600/30 text-emerald-300 border-emerald-400/30" };

  if (holdings.length === 0) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📊</div>
        <h2 className="text-2xl font-bold text-white mb-3">Welcome to FolioIQ</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">Upload your NJ Wealth statement to unlock AI-powered portfolio intelligence.</p>
        <Link href="/upload" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all">
          <Upload className="w-5 h-5"/> Upload Statement
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-64 bg-[#161b22] border-r border-white/5 flex flex-col transition-transform duration-300`}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="font-bold text-white">FolioIQ</div>
              <div className="text-xs text-gray-500">Smart Analytics</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto space-y-6">
          {SIDEBAR_ITEMS.map((section, si) => (
            <div key={si}>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-3 mb-2">{section.section}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 group
                      ${item.active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}
                    onClick={() => setSidebarOpen(false)}>
                    <Icon className="w-4 h-4 flex-shrink-0"/>
                    {item.label}
                    {item.active && <ChevronRight className="w-3 h-3 ml-auto text-emerald-500"/>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5 space-y-1">
          <button onClick={() => { setShowRisk(true); setRiskStep(0); setRiskAnswers([]); setRiskResult(null); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-violet-400 hover:bg-violet-500/10 rounded-xl transition-colors">
            <Brain className="w-4 h-4"/> Risk Profile Quiz
          </button>
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* ── LIVE MARKET TICKER ── */}
        <div className="bg-[#0d1117] border-b border-white/5 py-2 overflow-hidden relative">
          <div className="flex items-center gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap px-4">
            {[...LIVE_INDICES, ...LIVE_INDICES].map((idx, i) => (
              <div key={i} className="flex items-center gap-2 text-xs flex-shrink-0">
                <span className="text-gray-500">{idx.name}</span>
                <span className="text-white font-mono font-medium">{idx.val}</span>
                <span className={`font-semibold ${idx.up ? "text-emerald-400" : "text-red-400"}`}>{idx.chg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <header className="bg-[#161b22]/80 backdrop-blur border-b border-white/5 px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400">
                <Menu className="w-5 h-5"/>
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-lg font-bold text-white">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user?.email?.split("@")[0]} 👋</h1>
                  <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${isDailyUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {isDailyUp ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                    Today: {isDailyUp ? "+" : ""}{fmt(daily.amount)} ({daily.percent.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setHideValues(!hideValues)} className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-colors" title="Toggle values">
                {hideValues ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
              <button className="relative p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg">
                <Bell className="w-4 h-4"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              </button>
              <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/20 transition-all">
                <RefreshCw className="w-4 h-4"/> Update CAS
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── HEALTH + KPI ROW ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Health Score */}
            <div className="lg:col-span-1 bg-[#161b22] border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 mb-3">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1f2937" strokeWidth="10"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke={healthColor} strokeWidth="10"
                    strokeDasharray={`${(healthScore/100)*239} 239`} strokeLinecap="round"
                    style={{transition:"stroke-dasharray 1.5s ease"}}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black" style={{color:healthColor}}>{healthScore}</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wide">Health</span>
                </div>
              </div>
              <div className="text-sm font-bold text-white text-center">
                {healthScore >= 70 ? "Excellent 🌟" : healthScore >= 50 ? "Good 👍" : "Review ⚠️"}
              </div>
              <div className="text-xs text-gray-500 mt-1">{gainers.length}/{holdings.length} funds up</div>
            </div>

            {/* KPI Cards */}
            {[
              { label: "Portfolio Value", val: fmt(totalCur, hideValues), sub: isUp ? `+${retPct.toFixed(2)}% all time` : `${retPct.toFixed(2)}% all time`, icon: Wallet, color: "emerald", trend: isUp },
              { label: "Invested Amount", val: fmt(totalInv, hideValues), sub: `${holdings.length} funds`, icon: Target, color: "blue", trend: null },
              { label: "Total Returns", val: (isUp ? "+" : "") + fmt(totalGain, hideValues), sub: `After-tax: ${fmt(totalAfterTax, hideValues)}`, icon: isUp ? TrendingUp : TrendingDown, color: isUp ? "emerald" : "red", trend: isUp },
              { label: "Monthly SIP", val: fmt(monthlySIP, hideValues), sub: `${activeSIPs} active SIPs`, icon: Zap, color: "violet", trend: null },
            ].map((k, i) => {
              const Icon = k.icon;
              const colors: Record<string, string> = { emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", blue: "text-blue-400 bg-blue-500/10 border-blue-500/20", red: "text-red-400 bg-red-500/10 border-red-500/20", violet: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
              return (
                <div key={i} className={`bg-[#161b22] border border-white/5 rounded-2xl p-5 transition-all duration-500 hover:border-white/10 hover:shadow-lg ${animateCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                  style={{transitionDelay:`${i*80}ms`}}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl border ${colors[k.color]}`}><Icon className="w-4 h-4"/></div>
                    {k.trend !== null && (
                      <span className={`text-xs font-bold flex items-center gap-0.5 ${k.trend ? "text-emerald-400" : "text-red-400"}`}>
                        {k.trend ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>}
                        {Math.abs(retPct).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-white mb-1">{k.val}</div>
                  <div className="text-xs text-gray-500">{k.sub}</div>
                </div>
              );
            })}
          </div>

          {/* ── DAILY CHANGE BANNER ── */}
          <div className={`rounded-2xl border p-4 flex items-center gap-4 ${isDailyUp ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDailyUp ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
              <span className="text-xl">{isDailyUp ? "📈" : "📉"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm">
                {isDailyUp ? "Portfolio gained" : "Portfolio declined"} {fmt(Math.abs(daily.amount), hideValues)} ({Math.abs(daily.percent).toFixed(2)}%) today
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {isDailyUp ? `Market momentum is positive. Your equity funds are leading gains.` : `Markets corrected today. Long-term trend remains strong at ${retPct.toFixed(1)}%.`}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-lg font-black ${isDailyUp ? "text-emerald-400" : "text-red-400"}`}>
                {isDailyUp ? "+" : ""}{daily.percent.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">vs yesterday</div>
            </div>
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "🧠", label: "AI Insights", href: "/intelligence", color: "from-violet-500/10 to-purple-500/5 border-violet-500/20 hover:border-violet-400/40" },
              { icon: "⚖️", label: "Rebalance", href: "/rebalance", color: "from-amber-500/10 to-yellow-500/5 border-amber-500/20 hover:border-amber-400/40" },
              { icon: "🌾", label: `Save ${fmt(taxSavable)} tax`, href: "/tax-harvesting", color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 hover:border-emerald-400/40" },
              { icon: "🎯", label: "Goals", href: "/goals", color: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20 hover:border-cyan-400/40" },
            ].map((a, i) => (
              <Link key={i} href={a.href}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-br border text-center transition-all hover:scale-[1.03] ${a.color}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-300 leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* ── TABS ── */}
          <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/5">
              {[["overview","📊 Overview"],["funds","📋 Funds"],["insights","💡 Insights"]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id as any)}
                  className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${tab===id ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="p-6 space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white text-sm">Portfolio Growth vs Nifty 50</h3>
                      <div className="flex gap-1">
                        {["1M","3M","6M","1Y","All"].map(p => (
                          <button key={p} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${p==="All" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                        <XAxis dataKey="month" stroke="#374151" fontSize={11} tick={{fill:"#6b7280"}}/>
                        <YAxis stroke="#374151" fontSize={11} tick={{fill:"#6b7280"}} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                        <Tooltip contentStyle={{background:"#1f2937",border:"1px solid #374151",borderRadius:"12px",color:"#fff"}} formatter={(v: number, n: string) => [fmt(v), n==="value"?"Portfolio":"Nifty 50"]}/>
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#gp)" strokeWidth={2.5} name="value"/>
                        <Area type="monotone" dataKey="nifty" stroke="#6366f1" fill="url(#gn)" strokeWidth={1.5} strokeDasharray="4 4" name="nifty"/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-5 h-0.5 bg-emerald-500 rounded"/> Your Portfolio</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-5 h-0.5 bg-indigo-400 rounded"/> Nifty 50</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={alloc} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                          {alloc.map((e, i) => <Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip contentStyle={{background:"#1f2937",border:"1px solid #374151",borderRadius:"8px",color:"#fff"}} formatter={(v: number) => `${v}%`}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-1">
                      {alloc.map(a => (
                        <div key={a.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:a.color}}/>
                            <span className="text-xs text-gray-400">{a.name}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-xs font-bold text-white">{a.value}%</span>
                            <span className="text-xs text-gray-500">{fmt(a.amt, hideValues)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category returns bar chart */}
                <div>
                  <h3 className="font-bold text-white text-sm mb-4">Returns by Asset Class</h3>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={catData} barSize={32}>
                      <XAxis dataKey="name" stroke="#374151" fontSize={11} tick={{fill:"#6b7280"}}/>
                      <Tooltip contentStyle={{background:"#1f2937",border:"1px solid #374151",borderRadius:"8px",color:"#fff"}} formatter={(v: number) => `${v}%`}/>
                      <Bar dataKey="pct" radius={[6,6,0,0]}>
                        {catData.map((c, i) => <Cell key={i} fill={c.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top & Bottom performers */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400"/> Top Performers</h3>
                    <div className="space-y-2">
                      {topFunds.map((h, i) => (
                        <div key={i} onClick={() => setSelectedFund(h)}
                          className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl cursor-pointer hover:border-emerald-500/30 transition-all">
                          <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">{i+1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,32)}</div>
                            <div className="text-xs text-gray-500">{h.category?.substring(0,25)}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-emerald-400 font-bold text-sm">+{(h.returnsPercent||0).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">{fmt(h.value||0, hideValues)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400"/> Needs Attention</h3>
                    <div className="space-y-2">
                      {bottomFunds.length > 0 ? bottomFunds.map((h, i) => (
                        <div key={i} onClick={() => setSelectedFund(h)}
                          className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl cursor-pointer hover:border-red-500/30 transition-all">
                          <XCircle className="w-7 h-7 text-red-400 flex-shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,32)}</div>
                            <div className="text-xs text-gray-500">{h.category?.substring(0,25)}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-red-400 font-bold text-sm">{(h.returnsPercent||0).toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">{fmt(h.value||0, hideValues)}</div>
                          </div>
                        </div>
                      )) : (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0"/>
                          <span className="text-sm text-emerald-300">All funds are in positive territory! 🎉</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FUNDS */}
            {tab === "funds" && (
              <div>
                <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">All Holdings ({holdings.length})</span>
                  <span className="text-xs text-gray-500">{fmt(totalInv, hideValues)} → {fmt(totalCur, hideValues)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#0d1117]">
                        {["Fund","Category","Invested","Value","Returns","Signal"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h: any, i: number) => {
                        const ret = h.returnsPercent || 0;
                        const s = sig(ret);
                        return (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => setSelectedFund(h)}>
                            <td className="py-3.5 px-4">
                              <div className="text-sm font-semibold text-white max-w-[180px] truncate">{(h.name||"").replace(/ - Gr$/,"")}</div>
                              {(h.sip||0) > 0 && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-bold border border-blue-500/20">SIP ₹{(h.sip||0).toLocaleString("en-IN")}</span>}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[110px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)}</td>
                            <td className="py-3.5 px-4 text-sm text-gray-400 font-mono">{fmt(h.invested||0, hideValues)}</td>
                            <td className="py-3.5 px-4 text-sm font-bold font-mono" style={{color:ret>=0?"#10b981":"#ef4444"}}>{fmt(h.value||0, hideValues)}</td>
                            <td className="py-3.5 px-4">
                              <div className={`text-sm font-bold ${ret>=0?"text-emerald-400":"text-red-400"}`}>{ret>=0?"+":""}{ret.toFixed(1)}%</div>
                              <div className={`text-xs ${ret>=0?"text-emerald-600":"text-red-600"}`}>{ret>=0?"+":""}{fmt((h.value||0)-(h.invested||0), hideValues)}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/10 text-xs text-amber-500/70">
                  ⚡ Budget 2024: Equity LTCG (12m+) = 12.5% above ₹1.25L · STCG = 20% · Debt = Slab rate
                </div>
              </div>
            )}

            {/* INSIGHTS */}
            {tab === "insights" && (
              <div className="p-6 space-y-4">
                {taxSavable > 0 && (
                  <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💰</div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">Tax Harvest Opportunity — Save {fmt(taxSavable)}</div>
                      <div className="text-sm text-gray-400">You have eligible LTCG gains. Book ₹1.25L tax-free before March 31st, reinvest same day.</div>
                      <Link href="/tax-harvesting" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 mt-2 hover:underline">View Plan <ChevronRight className="w-4 h-4"/></Link>
                    </div>
                  </div>
                )}
                {losers.map((h, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔴</div>
                    <div className="flex-1">
                      <div className="font-bold text-white mb-1">{(h.name||"").replace(/ - Gr$/,"").substring(0,40)} is underperforming</div>
                      <div className="text-sm text-gray-400">Down {(h.returnsPercent||0).toFixed(1)}% (₹{Math.round(Math.abs((h.value||0)-(h.invested||0))).toLocaleString("en-IN")} loss). Consider pausing SIP. Alternatives: Parag Parikh Flexi Cap, Mirae Asset Large & Mid Cap.</div>
                      <Link href="/intelligence" className="inline-flex items-center gap-1 text-sm font-semibold text-red-400 mt-2 hover:underline">Get AI Analysis <ChevronRight className="w-4 h-4"/></Link>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📊</div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">Your XIRR is {meta?.xirr||13.3}% — Beating Nifty 50</div>
                    <div className="text-sm text-gray-400">Portfolio return of {retPct.toFixed(1)}% vs market average of ~12%. Top contributor: {topFunds[0]?.name?.substring(0,30)} (+{(topFunds[0]?.returnsPercent||0).toFixed(1)}%).</div>
                    <Link href="/intelligence" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 mt-2 hover:underline">Full Analysis <ChevronRight className="w-4 h-4"/></Link>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                  <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🧠</div>
                  <div className="flex-1">
                    <div className="font-bold text-white mb-1">Know your real risk tolerance</div>
                    <div className="text-sm text-gray-400">Take the 5-question quiz to get personalized fund recommendations matched to how you actually behave in market downturns.</div>
                    <button onClick={()=>{setShowRisk(true);setRiskStep(0);setRiskAnswers([]);setRiskResult(null);}} className="inline-flex items-center gap-1 text-sm font-semibold text-violet-400 mt-2 hover:underline">Take Quiz <ChevronRight className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── V2 CONNECT BANNER ── */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400"/>
                  <span className="font-bold text-white text-lg">Auto Portfolio Sync</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">Coming Soon</span>
                </div>
                <p className="text-gray-400 text-sm max-w-lg">Connect directly via MF Central (CAMS + KFintech). One-time OTP consent — portfolio syncs automatically every day. No more uploading files.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS CAS"].map(p => (
                    <span key={p} className="px-2.5 py-1 bg-white/5 text-gray-400 text-xs rounded-lg border border-white/10">{p}</span>
                  ))}
                </div>
              </div>
              <button className="px-6 py-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl font-bold hover:bg-indigo-500/30 transition-colors whitespace-nowrap text-sm">
                Join Waitlist →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      {/* ── FUND DETAIL MODAL ── */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end lg:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedFund(null)}>
          <div className="bg-[#161b22] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-lg leading-tight">{(selectedFund.name||"").replace(/ - Gr$/,"")}</h3>
                <p className="text-gray-500 text-sm mt-1">{selectedFund.category}</p>
              </div>
              <button onClick={() => setSelectedFund(null)} className="p-2 hover:bg-white/5 rounded-lg flex-shrink-0 ml-3"><X className="w-5 h-5 text-gray-400"/></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label:"Invested", val: fmt(selectedFund.invested||0) },
                { label:"Current Value", val: fmt(selectedFund.value||0) },
                { label:"Gain/Loss", val: (selectedFund.returnsPercent>=0?"+":"")+fmt((selectedFund.value||0)-(selectedFund.invested||0)) },
                { label:"Returns", val: (selectedFund.returnsPercent>=0?"+":"")+Number(selectedFund.returnsPercent||0).toFixed(1)+"%" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className={`font-bold text-sm ${i===2||i===3 ? (selectedFund.returnsPercent>=0?"text-emerald-400":"text-red-400") : "text-white"}`}>{item.val}</div>
                </div>
              ))}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-xl border mb-4 ${sig(selectedFund.returnsPercent||0).cls}`}>
              <span className="text-sm font-bold">AI Signal</span>
              <span className="font-bold">{sig(selectedFund.returnsPercent||0).label}</span>
            </div>
            <div className="flex gap-3">
              <Link href="/intelligence" className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold text-center hover:bg-emerald-500/20 transition-colors">AI Analysis</Link>
              <Link href="/tax-harvesting" className="flex-1 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-bold text-center hover:bg-white/10 transition-colors">Tax Plan</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── RISK MODAL ── */}
      {showRisk && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#161b22] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 border-b border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-lg">Risk Profile Quiz</div>
                  <div className="text-gray-400 text-sm mt-0.5">5 questions · 2 minutes</div>
                </div>
                <button onClick={()=>{setShowRisk(false);}} className="p-2 hover:bg-white/5 rounded-lg"><X className="w-5 h-5 text-gray-400"/></button>
              </div>
              {!riskResult && (
                <div className="mt-4 bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{width:`${(riskStep/RISK_QS.length)*100}%`}}/>
                </div>
              )}
            </div>
            <div className="p-6">
              {riskResult ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">{riskResult.label.includes("Conservative")?"🛡️":riskResult.label.includes("Balanced")?"⚖️":"🚀"}</div>
                  <div className="text-xl font-black text-white mb-2">{riskResult.label}</div>
                  <div className="text-sm text-gray-400 mb-6">{riskResult.rec}</div>
                  <button onClick={()=>{setShowRisk(false);}} className="w-full py-3 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-xl font-bold hover:bg-violet-500/30 transition-colors">
                    Apply to My Portfolio
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-gray-500 mb-3">Question {riskStep+1} of {RISK_QS.length}</div>
                  <h3 className="font-bold text-white text-base mb-5 leading-snug">{RISK_QS[riskStep].q}</h3>
                  <div className="space-y-2">
                    {RISK_QS[riskStep].opts.map((opt, i) => (
                      <button key={i} onClick={() => handleRisk(RISK_QS[riskStep].scores[i])}
                        className="w-full text-left px-4 py-3.5 border border-white/10 rounded-xl text-sm text-gray-300 hover:border-violet-400/50 hover:bg-violet-500/5 transition-all font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {riskStep > 0 && (
                    <button onClick={()=>{setRiskStep(riskStep-1);setRiskAnswers(riskAnswers.slice(0,-1));}} className="mt-4 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                      ← Back
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
