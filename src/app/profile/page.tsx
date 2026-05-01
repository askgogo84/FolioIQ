"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  TrendingUp, Shield, AlertTriangle, Activity,
  Upload, ArrowRight, Wallet, Building2,
  AlertCircle, ChevronRight, RefreshCw, Zap,
  Target, BarChart3, PieChart as PieIcon,
  User, LogOut, Bell, Plus, Layers, Search,
  Star, ArrowUpRight, ArrowDownRight, Filter,
  Sun, Moon, Sparkles, Bot, Send, X, Menu
} from "lucide-react";

// ─── Theme Constants ───
const THEME = {
  bg: "bg-slate-50",
  card: "bg-white",
  cardBorder: "border-slate-200",
  text: "text-slate-900",
  textSecondary: "text-slate-500",
  textMuted: "text-slate-400",
  accent: "emerald",
  accentColor: "text-emerald-600",
  accentBg: "bg-emerald-600",
  accentLight: "bg-emerald-50",
  danger: "text-red-500",
  warning: "text-amber-500",
  success: "text-emerald-600",
  header: "bg-white border-b border-slate-200",
  hover: "hover:bg-slate-50",
  input: "bg-white border-slate-300 text-slate-900 placeholder-slate-400",
};

// ─── 12 Funds Data ───
const ALL_FUNDS = [
  { name: "Axis Long Term Equity", category: "ELSS", invested: 120000, current: 145000, returns: 20.8, xirr: 12.5, rating: "B", risk: "High", sip: 10000, allocation: 26.2, amc: "Axis", stars: 3 },
  { name: "SBI Bluechip Fund", category: "Large Cap", invested: 80000, current: 95000, returns: 18.7, xirr: 11.2, rating: "A", risk: "Moderate", sip: 5000, allocation: 17.2, amc: "SBI", stars: 4 },
  { name: "Mirae Asset Emerging", category: "Mid Cap", invested: 60000, current: 78000, returns: 30.0, xirr: 18.3, rating: "A+", risk: "High", sip: 5000, allocation: 14.1, amc: "Mirae", stars: 5 },
  { name: "Nippon India Small Cap", category: "Small Cap", invested: 50000, current: 52000, returns: 4.0, xirr: 2.5, rating: "C", risk: "Very High", sip: 3000, allocation: 9.4, amc: "Nippon", stars: 2 },
  { name: "HDFC Balanced Advantage", category: "Balanced", invested: 45000, current: 51000, returns: 13.3, xirr: 8.7, rating: "A", risk: "Moderate", sip: 3000, allocation: 9.2, amc: "HDFC", stars: 4 },
  { name: "ICICI Pru Liquid Fund", category: "Liquid", invested: 25000, current: 26200, returns: 4.8, xirr: 4.2, rating: "A", risk: "Low", sip: 0, allocation: 4.7, amc: "ICICI", stars: 4 },
  { name: "Canara Robeco Equity", category: "Large Cap", invested: 35000, current: 41000, returns: 17.1, xirr: 10.5, rating: "A", risk: "Moderate", sip: 2500, allocation: 7.4, amc: "Canara", stars: 4 },
  { name: "Kotak Small Cap", category: "Small Cap", invested: 18000, current: 19500, returns: 8.3, xirr: 5.1, rating: "B", risk: "Very High", sip: 1500, allocation: 3.5, amc: "Kotak", stars: 3 },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", invested: 22000, current: 28500, returns: 29.5, xirr: 17.8, rating: "A+", risk: "High", sip: 2000, allocation: 5.1, amc: "PPFAS", stars: 5 },
  { name: "UTI Nifty 50 Index", category: "Index", invested: 15000, current: 17800, returns: 18.7, xirr: 11.0, rating: "A", risk: "Moderate", sip: 1500, allocation: 3.2, amc: "UTI", stars: 4 },
  { name: "PGIM India Midcap", category: "Mid Cap", invested: 12000, current: 15500, returns: 29.2, xirr: 16.5, rating: "A", risk: "High", sip: 1000, allocation: 2.8, amc: "PGIM", stars: 4 },
  { name: "Edelweiss Aggressive Hybrid", category: "Hybrid", invested: 10000, current: 11500, returns: 15.0, xirr: 9.2, rating: "A", risk: "Moderate", sip: 1000, allocation: 2.4, amc: "Edelweiss", stars: 4 },
];

const TOTAL_INVESTED = ALL_FUNDS.reduce((s, f) => s + f.invested, 0);
const TOTAL_CURRENT = ALL_FUNDS.reduce((s, f) => s + f.current, 0);
const TOTAL_RETURNS = TOTAL_CURRENT - TOTAL_INVESTED;
const XIRR = 13.7;

const PORTFOLIO_HISTORY = [
  { month: "Jan", value: 420000, invested: 400000 },
  { month: "Feb", value: 435000, invested: 415000 },
  { month: "Mar", value: 445000, invested: 430000 },
  { month: "Apr", value: 460000, invested: 445000 },
  { month: "May", value: 475000, invested: 460000 },
  { month: "Jun", value: 490000, invested: 475000 },
  { month: "Jul", value: 505000, invested: 490000 },
  { month: "Aug", value: 520000, invested: 492000 },
  { month: "Sep", value: 535000, invested: 492000 },
  { month: "Oct", value: 548000, invested: 492000 },
  { month: "Nov", value: 555000, invested: 492000 },
  { month: "Dec", value: 562000, invested: 492000 },
];

const ALLOCATION_DATA = [
  { name: "Large Cap", value: 24.6, color: "#10b981" },
  { name: "Mid Cap", value: 16.9, color: "#3b82f6" },
  { name: "Small Cap", value: 12.9, color: "#f59e0b" },
  { name: "ELSS", value: 26.2, color: "#8b5cf6" },
  { name: "Balanced", value: 9.2, color: "#ec4899" },
  { name: "Liquid", value: 4.7, color: "#06b6d4" },
  { name: "Flexi Cap", value: 5.1, color: "#f97316" },
];

// ─── Formatters ───
const formatCurrency = (n: number) => "₹" + (n / 100000).toFixed(2) + "L";
const formatFull = (n: number) => "₹" + n.toLocaleString("en-IN");
const formatPercent = (n: number) => (n > 0 ? "+" : "") + n.toFixed(1) + "%";

// ─── UI Components ───
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 border-b border-slate-100 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-semibold text-slate-900 ${className}`}>{children}</h3>;
}

function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function Button({ children, onClick, className = "", variant = "default" }: any) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return <button onClick={onClick} className={`${base} ${variants[variant as keyof typeof variants]} px-4 py-2.5 text-sm ${className}`}>{children}</button>;
}

function ScoreRing({ score, label, size = 100, color = "#10b981" }: { score: number; label: string; size?: number; color?: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const getLabel = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Poor";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="8" fill="none"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
        score >= 80 ? "bg-emerald-50 text-emerald-700" : score >= 60 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
      }`}>{getLabel(score)}</span>
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend, icon: Icon, color }: any) {
  const isPositive = (trend || 0) >= 0;
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {formatPercent(trend)}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

// ─── AI Chat Panel ───
function AIChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: "👋 Hi! I'm your FolioIQ AI. Ask me about your portfolio, fund recommendations, tax savings, or market trends.", time: "Just now" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const lower = input.toLowerCase();
      let response = "I analyzed your ₹5.62L portfolio. Health Score: 80/100. Key insight: Your small cap allocation (12.9%) is within limits. Top performer: Mirae Asset Emerging (+30%).";
      if (lower.includes("risk")) response = "🎯 Risk Score: 6.2/10 (Moderate-High). Concern: 12.9% small cap. Strength: 24.6% large cap stability. Suggestion: Add balanced advantage fund.";
      else if (lower.includes("tax")) response = "💰 Tax Opportunity: ELSS at ₹1.2L. 80C limit is ₹1.5L. Increase Axis ELSS SIP by ₹2,500/month to save ₹30K more!";
      else if (lower.includes("return") || lower.includes("xirr")) response = "📈 XIRR: 13.7%. Best: Mirae Asset (18.3%). Worst: Nippon Small Cap (2.5%). Switch Nippon to Quant Small Cap.";
      else if (lower.includes("rebalance")) response = "⚖️ Rebalance: 1) Reduce Nippon Small Cap to 5%, 2) Increase SBI Bluechip to 22%, 3) Add 10% international via Parag Parikh.";
      else if (lower.includes("sip")) response = "💳 Active SIPs: ₹28,500/month across 10 funds. Highest: Axis ELSS (₹10K). Annual SIP: ₹3.42L.";
      else if (lower.includes("goal") || lower.includes("retire")) response = "🎯 At 13.7% XIRR with ₹28.5K/month SIP, portfolio could reach ₹2.1Cr in 15 years. Want a specific scenario?";
      setMessages((prev) => [...prev, { role: "assistant", content: response, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <motion.div initial={{ x: 500 }} animate={{ x: isOpen ? 0 : 500 }} transition={{ type: "spring", damping: 25 }}
      className="fixed right-0 top-0 h-full w-[420px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          <div><p className="font-semibold text-white">FolioIQ AI</p><p className="text-xs text-emerald-100">Powered by Claude 3.7</p></div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg"><X className="w-5 h-5 text-white" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${msg.role === "user" ? "bg-emerald-600 text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"}`}>
              <p>{msg.content}</p><p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-emerald-200" : "text-slate-400"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {isTyping && <div className="flex items-center gap-2 text-slate-400"><div className="flex gap-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} /></div><span className="text-xs">AI analyzing...</span></div>}
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex gap-2 mb-3 flex-wrap">
          {["Risk Analysis", "Tax Tips", "Rebalance", "SIP Review", "Goal Planning"].map((s) => (
            <button key={s} onClick={() => setInput(s)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-emerald-300 hover:text-emerald-600">{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your portfolio..." className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-900" />
          <button onClick={handleSend} className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Profile Page ───
export default function ProfilePage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("value");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPortfolio({
        currentValue: TOTAL_CURRENT,
        totalInvested: TOTAL_INVESTED,
        totalReturns: TOTAL_RETURNS,
        totalReturnsPercent: ((TOTAL_RETURNS / TOTAL_INVESTED) * 100),
        xirr: XIRR,
        monthlySIP: ALL_FUNDS.reduce((s, f) => s + f.sip, 0),
        activeSIPs: ALL_FUNDS.filter(f => f.sip > 0).length,
        healthScore: 80,
        investmentScore: 80,
        diversificationScore: 60,
        riskScore: 72,
        riskAppetite: "Moderate",
        totalFunds: ALL_FUNDS.length,
        totalAmcs: new Set(ALL_FUNDS.map(f => f.amc)).size,
        fundsAtRisk: 2,
        monthlyData: PORTFOLIO_HISTORY,
        allocation: ALLOCATION_DATA,
        topHoldings: ALL_FUNDS.slice(0, 4).map(f => ({ name: f.name, value: f.current, percent: f.allocation, return: f.returns })),
        allHoldings: ALL_FUNDS,
      });
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredFunds = ALL_FUNDS.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFunds = [...filteredFunds].sort((a, b) => {
    if (sortBy === "value") return b.current - a.current;
    if (sortBy === "returns") return b.returns - a.returns;
    if (sortBy === "risk") return b.risk.localeCompare(a.risk);
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  const p = portfolio;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">FolioIQ</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">AI-Powered Portfolio Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700">Market Live</span>
            </div>
            <button onClick={() => setAiOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
              <Sparkles className="w-4 h-4" /> AI Assistant
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">GM</div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Here's how your investments are performing</p>
        </div>

        {/* Top Value Card */}
        <div className="mb-6 flex justify-end">
          <Card className="w-fit">
            <CardContent className="py-4 px-6">
              <p className="text-xs text-slate-500">Current Value</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(p.currentValue)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+{formatPercent(p.totalReturnsPercent)}</span>
                <span className="text-xs text-slate-400">{formatCurrency(p.totalReturns)} returns</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Rings */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="flex justify-center py-6"><ScoreRing score={p.investmentScore} label="Investment Score" color="#10b981" /></CardContent></Card>
          <Card><CardContent className="flex justify-center py-6"><ScoreRing score={p.diversificationScore} label="Diversification" color="#3b82f6" /></CardContent></Card>
          <Card><CardContent className="flex justify-center py-6"><ScoreRing score={p.healthScore} label="Health Score" color="#f59e0b" /></CardContent></Card>
          <Card><CardContent className="flex justify-center py-6"><ScoreRing score={p.riskScore} label="Risk Score" color="#ef4444" /></CardContent></Card>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <MetricCard title="Total Invested" value={formatCurrency(p.totalInvested)} subtitle="Initial capital" icon={Wallet} color="bg-emerald-100 text-emerald-600" />
          <MetricCard title="Total Return" value={formatCurrency(p.totalReturns)} subtitle={`${formatPercent(p.totalReturnsPercent)} absolute`} trend={p.totalReturnsPercent} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
          <MetricCard title="Total Funds" value={p.totalFunds.toString()} subtitle="Active schemes" icon={PieIcon} color="bg-blue-100 text-blue-600" />
          <MetricCard title="Total AMCs" value={p.totalAmcs.toString()} subtitle="Fund houses" icon={Building2} color="bg-blue-100 text-blue-600" />
          <MetricCard title="Funds at Risk" value={p.fundsAtRisk.toString()} subtitle="Need attention" icon={AlertTriangle} color="bg-red-100 text-red-600" />
          <MetricCard title="Risk Appetite" value={p.riskAppetite} subtitle="Your profile" icon={Shield} color="bg-amber-100 text-amber-600" />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> Portfolio Value Trend</CardTitle>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-1 bg-emerald-500 rounded" /> Value</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-3 h-1 bg-slate-300 rounded" /> Invested</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={p.monthlyData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="invested" stroke="#cbd5e1" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieIcon className="w-5 h-5 text-emerald-600" /> Asset Allocation</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={p.allocation} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={3} dataKey="value">
                    {p.allocation.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {p.allocation.map((item: any) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-medium text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Holdings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> Top Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {p.topHoldings.map((fund: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {fund.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-slate-900 truncate">{fund.name}</p>
                      <p className="font-semibold text-sm text-slate-900">{formatCurrency(fund.value)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fund.percent}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-10">{fund.percent}%</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${fund.return > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                        {fund.return > 0 ? "+" : ""}{fund.return.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ALL HOLDINGS - Complete Table */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2"><Layers className="w-5 h-5 text-emerald-600" /> All Holdings ({ALL_FUNDS.length} Funds)</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search funds..."
                    className="pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500 w-48" />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500">
                  <option value="value">Sort by Value</option>
                  <option value="returns">Sort by Returns</option>
                  <option value="risk">Sort by Risk</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase">Fund</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Value</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Invested</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">Returns</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">XIRR</th>
                    <th className="text-center py-3 px-6 text-xs font-medium text-slate-500 uppercase">Rating</th>
                    <th className="text-center py-3 px-6 text-xs font-medium text-slate-500 uppercase">Risk</th>
                    <th className="text-right py-3 px-6 text-xs font-medium text-slate-500 uppercase">SIP</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFunds.map((fund, idx) => {
                    const isPositive = fund.returns > 0;
                    const isGradeA = fund.rating.startsWith("A");
                    return (
                      <motion.tr key={fund.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {fund.amc[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-900">{fund.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500">{fund.category}</span>
                                <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < fund.stars ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                                ))}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="font-semibold text-sm text-slate-900">{formatFull(fund.current)}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-sm text-slate-500">{formatFull(fund.invested)}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                            {isPositive ? "+" : ""}{fund.returns.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-sm text-slate-600">{fund.xirr.toFixed(1)}%</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            isGradeA ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>{fund.rating}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`text-xs font-medium ${
                            fund.risk === "Low" ? "text-emerald-600" : fund.risk === "Moderate" ? "text-blue-600" : fund.risk === "High" ? "text-amber-600" : "text-red-500"
                          }`}>{fund.risk}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <p className="text-sm font-medium text-slate-900">{fund.sip > 0 ? `₹${(fund.sip / 1000).toFixed(1)}K` : "—"}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fund.allocation}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-10">{fund.allocation}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-emerald-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">Update Portfolio</p>
              <p className="text-sm text-slate-500 mt-1">Upload new CAS to refresh analysis</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">Deep Analysis</p>
              <p className="text-sm text-slate-500 mt-1">Fund analysis, overlap detection, AI recommendations</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-900">Risk Profile</p>
              <p className="text-sm text-slate-500 mt-1">Assess risk appetite and get allocation advice</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">{p.fundsAtRisk} funds need attention</p>
              <p className="text-xs text-amber-600">Some holdings are underperforming. Review in Deep Analysis.</p>
            </div>
          </div>
          <Button variant="outline" className="text-amber-700 border-amber-300 hover:bg-amber-100">Review</Button>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
