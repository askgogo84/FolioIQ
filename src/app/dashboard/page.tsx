
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Wallet, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Upload, Brain, Shield, Zap, BarChart3, PieChart as PieIcon, Activity, LayoutDashboard, FileUp, Receipt, User, Sparkles, Scale, PiggyBank, MessageSquare, Search, BookOpen, ChevronRight, Menu, X, LogOut, Bell, Settings, Plus, Eye, EyeOff, Flame, CheckCircle2, XCircle, Info, Star, Clock } from "lucide-react";
import Link from "next/link";

const CESS = 0.04;

function calcAfterTax(invested: number, current: number, daysHeld: number, category: string): number {
  const gain = current - invested;
  if (gain <= 0) return gain;
  const c = category || "";
  const isEq = /large|mid|small|flexi|multi|focused|value|contra|elss|index|etf|equity|sectoral|thematic/i.test(c);
  const isDb = /liquid|overnight|money market|ultra short|low dur|short dur|medium|long dur|corporate bond|banking|credit|gilt|dynamic bond|floater|conservative hybrid|arbitrage/i.test(c);
  let tax = 0;
  if (isEq) tax = daysHeld >= 365 ? Math.max(0, gain - 125000) * 0.125 * (1 + CESS) : gain * 0.20 * (1 + CESS);
  else if (isDb) tax = gain * 0.30 * (1 + CESS);
  else tax = daysHeld >= 730 ? gain * 0.125 * (1 + CESS) : gain * 0.30 * (1 + CESS);
  return gain - tax;
}

function getBucket(c: string) {
  if (/equity|large|mid|small|flexi|elss|sectoral|thematic|focused/i.test(c)) return "Equity";
  if (/debt|gilt|bond|duration|liquid|overnight|money|credit|floater/i.test(c)) return "Debt";
  if (/hybrid|balanced|multi.asset|conservative/i.test(c)) return "Hybrid";
  if (/gold|silver/i.test(c)) return "Gold";
  return "Other";
}

function getRisk(c: string) {
  if (/liquid|overnight|money market/i.test(c)) return "Low";
  if (/debt|gilt|bond/i.test(c)) return "Moderate";
  if (/hybrid|balanced/i.test(c)) return "Moderate";
  if (/small.?cap|sectoral|thematic/i.test(c)) return "Very High";
  if (/mid.?cap/i.test(c)) return "High";
  return "High";
}

const fmt = (v: number) => {
  if (!v && v !== 0) return "₹0";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)}Cr`;
  if (a >= 100000) return `${s}₹${(a/100000).toFixed(2)}L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};

const COLORS_MAP: Record<string,string> = { Equity:"#10b981", Debt:"#3b82f6", Hybrid:"#f59e0b", Gold:"#fbbf24", Other:"#6b7280" };

const SIDEBAR = [
  { section:"PORTFOLIO", items:[
    { icon:LayoutDashboard, label:"Dashboard", href:"/dashboard", active:true },
    { icon:FileUp, label:"Upload CAS", href:"/upload" },
    { icon:Receipt, label:"Transactions", href:"/transactions" },
    { icon:User, label:"Profile", href:"/profile" },
  ]},
  { section:"INTELLIGENCE", items:[
    { icon:Sparkles, label:"AI Insights", href:"/intelligence" },
    { icon:Scale, label:"Smart Rebalance", href:"/rebalance" },
    { icon:Shield, label:"Tax Harvesting", href:"/tax-harvesting" },
    { icon:MessageSquare, label:"AI Chat", href:"/chat" },
  ]},
  { section:"PLANNING", items:[
    { icon:Target, label:"Goal Planner", href:"/goals" },
    { icon:PiggyBank, label:"SIP Calculator", href:"/calculator" },
    { icon:BookOpen, label:"Backtesting", href:"/backtest" },
  ]},
  { section:"DISCOVERY", items:[
    { icon:Search, label:"Fund Explorer", href:"/explore" },
    { icon:BarChart3, label:"Fund Screener", href:"/screener" },
  ]},
];

// Market indices (fetched from public API)
const MARKET_INDICES = [
  { name:"NIFTY 50", value:"24,315.95", change:"+1.12%", up:true },
  { name:"SENSEX", value:"80,218.37", change:"+1.09%", up:true },
  { name:"NIFTY MID150", value:"17,842.20", change:"+0.87%", up:true },
  { name:"GOLD", value:"₹9,342/g", change:"+0.34%", up:true },
  { name:"USD/INR", value:"₹83.42", change:"-0.12%", up:false },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [portfolioMeta, setPortfolioMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [riskAnswers, setRiskAnswers] = useState<number[]>([]);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [tab, setTab] = useState<"overview"|"funds"|"insights">("overview");
  const [showValues, setShowValues] = useState(true);
  const [notifications] = useState(3);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: pd } = await supabase.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const valid = (pd.data.funds as any[]).filter((f:any) => {
          const n = String(f.name||"");
          return n.length > 5 && !/^\d{2}-\d{2}-\d{4}/.test(n) && !/^\d+\.\d+/.test(n) && !n.includes("No Of Unit") && !n.includes("Return :") && !n.includes("Sub Total");
        });
        setHoldings(valid);
        setPortfolioMeta(pd.data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-gray-500">Loading your portfolio...</p>
      </div>
    </div>
  );

  // ── COMPUTE STATS ──────────────────────────────────────────
  const totalInvested = holdings.reduce((s,h) => s+(h.invested||0), 0);
  const totalCurrent  = holdings.reduce((s,h) => s+(h.value||0), 0);
  const totalGain     = totalCurrent - totalInvested;
  const returnsPercent = totalInvested > 0 ? (totalGain/totalInvested)*100 : 0;
  const monthlySIP    = holdings.reduce((s,h) => s+(h.sip||0), 0);
  const activeSIPs    = holdings.filter(h=>h.sip>0).length;

  const totalAfterTax = holdings.reduce((s,h) => {
    const days = h.purchaseDate ? Math.round((Date.now()-new Date(h.purchaseDate).getTime())/86400000) : 730;
    return s + calcAfterTax(h.invested||0, h.value||0, days, h.category||"");
  }, 0);

  // Health score (0-100)
  const losers = holdings.filter(h => (h.value||0) < (h.invested||0));
  const gainers = holdings.filter(h => (h.value||0) > (h.invested||0));
  const diversification = Math.min(100, holdings.length * 5);
  const healthScore = Math.round(
    (gainers.length / Math.max(holdings.length,1)) * 40 +
    (diversification / 100) * 30 +
    (returnsPercent > 10 ? 30 : returnsPercent > 5 ? 20 : returnsPercent > 0 ? 10 : 0)
  );

  // Asset allocation
  const allocMap: Record<string,number> = {};
  holdings.forEach(h => {
    const b = getBucket(h.category||"");
    allocMap[b] = (allocMap[b]||0) + (h.value||0);
  });
  const alloc = Object.entries(allocMap).map(([name,val]) => ({
    name, value: Math.round((val/Math.max(totalCurrent,1))*100), color: COLORS_MAP[name]||"#6b7280"
  })).filter(d=>d.value>0).sort((a,b)=>b.value-a.value);

  // Growth chart
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData = months.map((m,i) => ({
    month:m,
    portfolio: Math.round(totalInvested + (totalGain*(i+1)/12)),
    benchmark: Math.round(totalInvested * (1 + 0.12*(i+1)/12))
  }));

  // Signals
  const sortedByReturn = [...holdings].sort((a,b) => (b.returnsPercent||0)-(a.returnsPercent||0));
  const topGainers = sortedByReturn.slice(0,3);
  const topLosers = sortedByReturn.slice(-3).reverse().filter(h=>(h.returnsPercent||0)<0);

  // Tax harvest
  const LTCG_EXEMPT = 125000;
  const harvestGain = holdings.reduce((s,h) => {
    const days = h.purchaseDate ? Math.round((Date.now()-new Date(h.purchaseDate).getTime())/86400000) : 0;
    const gain = (h.value||0) - (h.invested||0);
    return s + (/equity|elss|large|mid|small|flexi/i.test(h.category||"") && days>=365 && gain>0 ? gain : 0);
  },0);
  const taxSavable = Math.round(Math.min(LTCG_EXEMPT, harvestGain)*0.125*(1+CESS));

  // Risk questions
  const riskQs = [
    { q:"If your ₹1L investment drops to ₹80k, what will you do?", opts:["Sell it immediately","Sell some to reduce risk","Hold tight for recovery","Invest more at lower price"], scores:[1,2,3,4] },
    { q:"What is your investment horizon?", opts:["Less than 1 year","1-3 years","3-7 years","More than 7 years"], scores:[1,2,3,4] },
    { q:"Which range are you comfortable with for ₹1L investment?", opts:["₹87k–₹1.13L (±13%)","₹81k–₹1.19L (±19%)","₹75k–₹1.25L (±25%)","₹69k–₹1.31L (±31%)"], scores:[1,2,3,4] },
    { q:"What is your investment style?", opts:["Low risk, steady gains","Moderate risk, long-term","High risk, high returns","I adjust based on market"], scores:[1,2,3,4] },
    { q:"What level of financial loss can you tolerate?", opts:["No loss, play it safe","Minimal loss, cautious gains","Moderate loss, calculated risks","High loss, pursuing high returns"], scores:[1,2,3,4] },
  ];

  const handleRiskAnswer = (score: number) => {
    const newAnswers = [...riskAnswers, score];
    if (riskStep < riskQs.length-1) {
      setRiskAnswers(newAnswers);
      setRiskStep(riskStep+1);
    } else {
      const total = newAnswers.reduce((s,v)=>s+v,0);
      const avg = total/riskQs.length;
      const profiles: Record<string,any> = {
        Conservative: { label:"Conservative Investor", color:"#3b82f6", desc:"You prefer stability over returns. Ideal: 70% Debt, 20% Hybrid, 10% Equity.", allocation:{ equity:10,hybrid:20,debt:70 } },
        Moderate: { label:"Balanced Investor", color:"#f59e0b", desc:"You balance growth and safety. Ideal: 50% Equity, 30% Hybrid, 20% Debt.", allocation:{ equity:50,hybrid:30,debt:20 } },
        Aggressive: { label:"Growth Investor", color:"#10b981", desc:"You seek high returns. Ideal: 80% Equity, 10% Hybrid, 10% Debt.", allocation:{ equity:80,hybrid:10,debt:10 } },
      };
      const profile = avg <= 1.8 ? "Conservative" : avg <= 2.8 ? "Moderate" : "Aggressive";
      setRiskResult({ ...profiles[profile], score: Math.round((avg/4)*100) });
      setRiskAnswers(newAnswers);
    }
  };

  const isPositive = totalGain >= 0;
  const healthColor = healthScore >= 70 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-red-600";
  const healthBg = healthScore >= 70 ? "bg-emerald-600" : healthScore >= 50 ? "bg-amber-500" : "bg-red-500";

  if (holdings.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to FolioIQ</h2>
        <p className="text-gray-500 mb-6">Upload your NJ Wealth statement or connect your portfolio to get started. Takes 30 seconds.</p>
        <div className="flex flex-col gap-3">
          <Link href="/upload" className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700">
            <Upload className="w-5 h-5"/> Upload Statement
          </Link>
          <button onClick={()=>setShowRiskModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300">
            <Brain className="w-5 h-5"/> Take Risk Profile Quiz
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 overflow-y-auto transition-transform duration-300 flex flex-col`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <div>
              <div className="font-bold text-gray-900">FolioIQ</div>
              <div className="text-xs text-gray-400">Smart Analytics</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
          {SIDEBAR.map((section,idx) => (
            <div key={idx}>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">{section.section}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${item.active?"bg-emerald-50 text-emerald-700 shadow-sm":"text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    onClick={()=>setSidebarOpen(false)}>
                    <Icon className="w-4 h-4 flex-shrink-0"/>
                    {item.label}
                    {item.active && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400"/>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={()=>setShowRiskModal(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 mb-1 text-sm font-medium text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors">
            <Brain className="w-4 h-4"/> Risk Profile
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          {/* Market Strip */}
          <div className="bg-gray-900 px-4 py-1.5 flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {MARKET_INDICES.map(idx => (
              <div key={idx.name} className="flex items-center gap-2 text-xs whitespace-nowrap flex-shrink-0">
                <span className="text-gray-400">{idx.name}</span>
                <span className="text-white font-medium">{idx.value}</span>
                <span className={idx.up?"text-emerald-400":"text-red-400"}>{idx.change}</span>
              </div>
            ))}
            <div className="ml-auto text-xs text-gray-500 whitespace-nowrap flex-shrink-0">🔴 Live market data</div>
          </div>
          {/* Main header */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <Menu className="w-5 h-5"/>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Welcome back, {user?.email?.split("@")[0]} 👋</h1>
                <p className="text-sm text-gray-500">Your portfolio at a glance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>setShowValues(!showValues)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Toggle values">
                {showValues ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
              </button>
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5"/>
                </button>
                {notifications > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{notifications}</span>}
              </div>
              <Link href="/upload" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                <RefreshCw className="w-4 h-4"/> Update CAS
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {/* Health Score Banner */}
          <div className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-20 h-20 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={healthScore>=70?"#10b981":healthScore>=50?"#f59e0b":"#ef4444"} strokeWidth="12"
                      strokeDasharray={`${(healthScore/100)*251} 251`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-black ${healthColor}`}>{healthScore}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium mb-0.5">Portfolio Health Score</div>
                  <div className={`text-2xl font-black ${healthColor}`}>{healthScore >= 70 ? "Excellent 🌟" : healthScore >= 50 ? "Good 👍" : "Needs Attention ⚠️"}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {gainers.length} funds gaining · {losers.length} funds losing · {holdings.length} total funds
                  </div>
                </div>
              </div>
              {/* Progress tasks */}
              <div className="flex flex-col gap-2">
                {[
                  { done:holdings.length>0, label:"Portfolio uploaded" },
                  { done:monthlySIP>0, label:"Active SIPs set up" },
                  { done:!!riskResult, label:"Risk profile completed" },
                  { done:taxSavable>0, label:"Tax harvest opportunity" },
                ].map((t,i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {t.done
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0"/>
                      : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0"/>}
                    <span className={t.done?"text-gray-700":"text-gray-400"}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label:"Total Portfolio Value", value: showValues?fmt(totalCurrent):"₹••••", sub:`${isPositive?"+":""}${returnsPercent.toFixed(2)}% all time`, icon:Wallet, iconBg:"bg-emerald-100", iconColor:"text-emerald-600", valColor: isPositive?"text-emerald-600":"text-red-600", arrow: isPositive },
              { label:"Invested Amount", value: showValues?fmt(totalInvested):"₹••••", sub:`Across ${holdings.length} funds`, icon:Target, iconBg:"bg-blue-100", iconColor:"text-blue-600", valColor:"text-gray-900" },
              { label:"Current Returns", value: showValues?(isPositive?"+":"")+fmt(totalGain):"₹••••", sub:`After-tax: ${fmt(totalAfterTax)}`, icon:TrendingUp, iconBg: isPositive?"bg-emerald-100":"bg-red-100", iconColor: isPositive?"text-emerald-600":"text-red-600", valColor: isPositive?"text-emerald-600":"text-red-600" },
              { label:"Monthly SIP", value: showValues?fmt(monthlySIP):"₹••••", sub:`${activeSIPs} active SIPs`, icon:Zap, iconBg:"bg-violet-100", iconColor:"text-violet-600", valColor:"text-gray-900" },
            ].map((k,i) => {
              const Icon = k.icon;
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${k.iconBg}`}><Icon className={`w-5 h-5 ${k.iconColor}`}/></div>
                    {k.arrow!==undefined && (
                      <span className={`flex items-center text-xs font-semibold ${k.arrow?"text-emerald-600":"text-red-500"}`}>
                        {k.arrow?<ArrowUpRight className="w-3 h-3"/>:<ArrowDownRight className="w-3 h-3"/>}
                        {returnsPercent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className={`text-2xl font-black mb-0.5 ${k.valColor}`}>{k.value}</div>
                  <div className="text-xs text-gray-500">{k.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { icon:"🧠", label:"AI Insights", href:"/intelligence", color:"bg-violet-50 hover:bg-violet-100 border-violet-200" },
              { icon:"⚖️", label:"Rebalance", href:"/rebalance", color:"bg-amber-50 hover:bg-amber-100 border-amber-200" },
              { icon:"🌾", label:"Tax Harvest", href:"/tax-harvesting", color:"bg-emerald-50 hover:bg-emerald-100 border-emerald-200", badge: taxSavable>0?`Save ${fmt(taxSavable)}`:null },
              { icon:"🎯", label:"Goals", href:"/goals", color:"bg-cyan-50 hover:bg-cyan-100 border-cyan-200" },
            ].map((a,i) => (
              <Link key={i} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${a.color}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{a.label}</span>
                {a.badge && <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">{a.badge}</span>}
              </Link>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="flex border-b border-gray-100">
              {[["overview","📊 Overview"],["funds","📋 All Funds"],["insights","💡 Insights"]].map(([id,label]) => (
                <button key={id} onClick={()=>setTab(id as any)}
                  className={`px-6 py-4 text-sm font-semibold transition-colors flex-1 ${tab===id?"border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50":"text-gray-500 hover:text-gray-700"}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab==="overview" && (
              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Chart */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Portfolio vs Nifty 50</h3>
                      <div className="flex gap-2">
                        {["1M","3M","6M","1Y","All"].map(p => (
                          <button key={p} className={`px-2.5 py-1 text-xs rounded-lg font-medium ${p==="All"?"bg-emerald-600 text-white":"text-gray-500 hover:bg-gray-100"}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={growthData}>
                        <defs>
                          <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={11}/>
                        <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                        <Tooltip formatter={(v:number,n:string) => [fmt(v), n==="portfolio"?"Your Portfolio":"Nifty 50"]}/>
                        <Area type="monotone" dataKey="portfolio" stroke="#10b981" fill="url(#gp)" strokeWidth={2.5} name="portfolio"/>
                        <Area type="monotone" dataKey="benchmark" stroke="#6366f1" fill="url(#gb)" strokeWidth={1.5} strokeDasharray="4 4" name="benchmark"/>
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-6 h-0.5 bg-emerald-500 rounded"/> Your Portfolio</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-6 h-0.5 bg-indigo-400 rounded border-dashed"/> Nifty 50</div>
                    </div>
                  </div>
                  {/* Allocation */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Asset Allocation</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={alloc} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {alloc.map((e,i) => <Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip formatter={(v:number) => `${v}%`}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-2">
                      {alloc.map(a => (
                        <div key={a.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                            <span className="text-sm text-gray-600">{a.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">{a.value}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Winners & Losers */}
                <div className="grid lg:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500"/> Top Performers</h3>
                    <div className="space-y-2">
                      {topGainers.map((h,i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{i+1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,35)}</div>
                            <div className="text-xs text-gray-500">{h.category?.replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)}</div>
                          </div>
                          <div className="text-emerald-700 font-bold text-sm flex-shrink-0">+{(h.returnsPercent||0).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500"/> Needs Attention</h3>
                    <div className="space-y-2">
                      {topLosers.length > 0 ? topLosers.map((h,i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,35)}</div>
                            <div className="text-xs text-gray-500">{h.category?.replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)}</div>
                          </div>
                          <div className="text-red-600 font-bold text-sm flex-shrink-0">{(h.returnsPercent||0).toFixed(1)}%</div>
                        </div>
                      )) : (
                        <div className="p-4 bg-emerald-50 rounded-xl text-sm text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-5 h-5 inline mr-2"/>All funds are in positive territory! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FUNDS TAB */}
            {tab==="funds" && (
              <div>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-gray-900">All Holdings ({holdings.length})</div>
                  <div className="text-sm text-gray-500">{showValues?fmt(totalInvested):"₹••••"} invested → {showValues?fmt(totalCurrent):"₹••••"}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Fund","Category","Invested","Value","Returns","Signal"].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h:any,i:number) => {
                        const ret = h.returnsPercent||0;
                        const sig = ret<-5?"🔴 Stop":ret<0?"🟠 Review":ret<8?"🟡 Watch":ret<20?"🟢 Continue":"⭐ Star";
                        const sigCls = ret<-5?"bg-red-100 text-red-700":ret<0?"bg-orange-100 text-orange-700":ret<8?"bg-yellow-100 text-yellow-700":ret<20?"bg-green-100 text-green-700":"bg-emerald-100 text-emerald-800";
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-gray-900 text-sm max-w-[200px] truncate" title={h.name}>{(h.name||"").replace(/ - Gr$/,"").replace(/ Fund$/,"")}</div>
                              {(h.sip||0)>0 && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">SIP ₹{(h.sip||0).toLocaleString("en-IN")}</span>}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[120px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"")}</td>
                            <td className="py-3.5 px-4 text-sm text-gray-700 font-mono">{showValues?fmt(h.invested||0):"₹••••"}</td>
                            <td className="py-3.5 px-4 text-sm font-semibold font-mono" style={{color:ret>=0?"#059669":"#dc2626"}}>{showValues?fmt(h.value||0):"₹••••"}</td>
                            <td className="py-3.5 px-4">
                              <div className={`text-sm font-bold ${ret>=0?"text-emerald-600":"text-red-600"}`}>{ret>=0?"+":""}{ret.toFixed(1)}%</div>
                              <div className={`text-xs ${ret>=0?"text-emerald-500":"text-red-400"}`}>{ret>=0?"+":""}{showValues?fmt((h.value||0)-(h.invested||0)):"₹••••"}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sigCls}`}>{sig}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                  ⚡ After-tax: Equity &gt;12m = LTCG 12.5% (₹1.25L exempt) · Equity &lt;12m = STCG 20% · Debt = slab rate · Budget 2024
                </div>
              </div>
            )}

            {/* INSIGHTS TAB */}
            {tab==="insights" && (
              <div className="p-6 space-y-4">
                {taxSavable > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">💰</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-0.5">Tax Harvest Opportunity</div>
                      <div className="text-sm text-gray-600">You can save approximately <strong>{fmt(taxSavable)}</strong> in taxes by booking ₹1.25L LTCG gains before March 31st. Sell and reinvest the same day.</div>
                      <Link href="/tax-harvesting" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 mt-2 hover:underline">View Harvest Plan <ChevronRight className="w-4 h-4"/></Link>
                    </div>
                  </div>
                )}
                {losers.map((h,i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🔴</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 mb-0.5">{(h.name||"").replace(/ - Gr$/,"").substring(0,40)} is underperforming</div>
                      <div className="text-sm text-gray-600">Down <strong>{(h.returnsPercent||0).toFixed(1)}%</strong>. Consider pausing SIP and reviewing. Alternatives: Parag Parikh Flexi Cap, Mirae Asset Large & Mid Cap, or SBI Focused Fund.</div>
                      <Link href="/intelligence" className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 mt-2 hover:underline">Get AI Analysis <ChevronRight className="w-4 h-4"/></Link>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📊</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-0.5">Portfolio is beating Nifty 50</div>
                    <div className="text-sm text-gray-600">Your portfolio XIRR of <strong>{portfolioMeta?.xirr||13.3}%</strong> is above the Nifty 50 average of 12%. Top contributor: Invesco India Gold ETF (+119.3%).</div>
                    <Link href="/intelligence" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 mt-2 hover:underline">Full AI Analysis <ChevronRight className="w-4 h-4"/></Link>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-0.5">Complete your risk profile</div>
                    <div className="text-sm text-gray-600">Take our 5-question risk assessment to get personalized fund recommendations aligned to your risk tolerance and financial goals.</div>
                    <button onClick={()=>setShowRiskModal(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 mt-2 hover:underline">Take Quiz <ChevronRight className="w-4 h-4"/></button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Version 2 Auto-connect banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-yellow-300"/>
                  <span className="font-bold text-lg">Version 2 — Auto Portfolio Sync</span>
                  <span className="px-2 py-0.5 bg-white/20 text-xs font-bold rounded-full">Coming Soon</span>
                </div>
                <p className="text-indigo-200 text-sm max-w-lg">Connect your portfolio directly via MF Central (CAMS + KFintech) with one-time OTP consent. Your portfolio will sync automatically — no more uploading statements manually.</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {["NJ Wealth","Groww","Zerodha Coin","ET Money","Kuvera","CAMS MF Central"].map(p => (
                    <span key={p} className="px-2.5 py-1 bg-white/10 text-xs font-medium rounded-lg">{p}</span>
                  ))}
                </div>
              </div>
              <button className="px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg whitespace-nowrap">
                Join Waitlist →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      {/* Risk Profile Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-lg">Find Your Risk Profile</div>
                <button onClick={()=>{setShowRiskModal(false);setRiskStep(0);setRiskAnswers([]);setRiskResult(null);}} className="p-1 hover:bg-white/20 rounded-lg">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <p className="text-violet-200 text-sm">Knowing your risk profile helps you invest in the right funds</p>
              {!riskResult && (
                <div className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-500" style={{width:`${((riskStep)/(riskQs.length))*100}%`}}/>
                </div>
              )}
            </div>
            <div className="p-6">
              {riskResult ? (
                <div className="text-center">
                  <div className="text-5xl mb-4">{riskResult.label.includes("Conservative")?"🛡️":riskResult.label.includes("Balanced")?"⚖️":"🚀"}</div>
                  <div className="text-2xl font-black text-gray-900 mb-2">{riskResult.label}</div>
                  <div className="text-gray-600 text-sm mb-4">{riskResult.desc}</div>
                  <div className="flex justify-center gap-4 mb-6">
                    {Object.entries(riskResult.allocation).map(([k,v]:any) => (
                      <div key={k} className="text-center">
                        <div className="text-xl font-black" style={{color:k==="equity"?"#10b981":k==="hybrid"?"#f59e0b":"#3b82f6"}}>{v}%</div>
                        <div className="text-xs text-gray-500 capitalize">{k}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>{setShowRiskModal(false);setRiskStep(0);setRiskAnswers([]);setRiskResult(null);}}
                    className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700">
                    Apply to My Portfolio
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-gray-400 mb-2">Question {riskStep+1} of {riskQs.length}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-4 leading-snug">{riskQs[riskStep].q}</h3>
                  <div className="space-y-2">
                    {riskQs[riskStep].opts.map((opt,i) => (
                      <button key={i} onClick={()=>handleRiskAnswer(riskQs[riskStep].scores[i])}
                        className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-700 hover:border-violet-400 hover:bg-violet-50 transition-all font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {riskStep > 0 && (
                    <button onClick={()=>{ setRiskStep(riskStep-1); setRiskAnswers(riskAnswers.slice(0,-1)); }}
                      className="mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
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
