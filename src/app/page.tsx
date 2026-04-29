"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Brain, Zap, ChevronRight, ArrowUpRight, Wallet, Clock, Star, Info, Target, PieChart as PieIcon, Activity, Upload, Search, Filter, Bell, Menu, X, User, Settings, Layers, BarChart3, Award, Lightbulb, Sparkles } from "lucide-react";

interface MutualFund {
  id: string; schemeName: string; amc: string; category: string; subCategory: string;
  nav: number; units: number; investedAmount: number; currentValue: number;
  absoluteReturn: number; xirr: number; rating: number;
  riskLevel: "Low" | "Moderate" | "High" | "Very High";
  expenseRatio: number; aum: number; fundManager: string; benchmark: string;
  holdings: { name: string; sector: string; weight: number }[];
  sipAmount?: number; sipDate?: string; purchaseDate: string; status: "Active" | "Paused" | "Redeemed";
  dayChange?: number; dayChangePercent?: number;
}

const FUNDS: MutualFund[] = [
  { id: "1", schemeName: "Nippon India Small Cap Fund", amc: "Nippon India", category: "Equity", subCategory: "Small Cap", nav: 147.85, units: 1014.52, investedAmount: 100000, currentValue: 150000, absoluteReturn: 50.0, xirr: 28.5, rating: 5, riskLevel: "Very High", expenseRatio: 0.82, aum: 45000, fundManager: "Samir Rachh", benchmark: "Nifty Smallcap 250 TRI", holdings: [{name:"KPIT Technologies",sector:"IT",weight:4.2},{name:"Tejas Networks",sector:"Telecom",weight:3.8},{name:"Mishra Dhatu",sector:"Metals",weight:3.5}], sipAmount: 5000, sipDate: "5th of every month", purchaseDate: "2022-01-05", status: "Active", dayChange: 1250, dayChangePercent: 0.84 },
  { id: "2", schemeName: "SBI Bluechip Equity Fund", amc: "SBI Mutual Fund", category: "Equity", subCategory: "Large Cap", nav: 72.45, units: 1380.26, investedAmount: 75000, currentValue: 100000, absoluteReturn: 33.33, xirr: 18.2, rating: 4, riskLevel: "Moderate", expenseRatio: 1.05, aum: 32000, fundManager: "Sohini Andani", benchmark: "S&P BSE 100", holdings: [{name:"HDFC Bank",sector:"Financial",weight:9.5},{name:"ICICI Bank",sector:"Financial",weight:8.2},{name:"Reliance",sector:"Energy",weight:7.8}], sipAmount: 3000, sipDate: "10th of every month", purchaseDate: "2021-06-10", status: "Active", dayChange: 420, dayChangePercent: 0.42 },
  { id: "3", schemeName: "Mirae Asset Emerging Bluechip", amc: "Mirae Asset", category: "Equity", subCategory: "Large & Mid Cap", nav: 95.30, units: 1573.98, investedAmount: 100000, currentValue: 150000, absoluteReturn: 50.0, xirr: 22.4, rating: 5, riskLevel: "High", expenseRatio: 0.76, aum: 28000, fundManager: "Neelesh Surana", benchmark: "Nifty LargeMidcap 250", holdings: [{name:"HDFC Bank",sector:"Financial",weight:7.2},{name:"Axis Bank",sector:"Financial",weight:5.8},{name:"Infosys",sector:"IT",weight:5.5}], sipAmount: 5000, sipDate: "15th of every month", purchaseDate: "2021-03-15", status: "Active", dayChange: 890, dayChangePercent: 0.59 },
  { id: "4", schemeName: "HDFC Balanced Advantage Fund", amc: "HDFC Mutual Fund", category: "Hybrid", subCategory: "Balanced Advantage", nav: 42.15, units: 4744.96, investedAmount: 150000, currentValue: 200000, absoluteReturn: 33.33, xirr: 15.8, rating: 4, riskLevel: "Moderate", expenseRatio: 0.92, aum: 55000, fundManager: "Gopal Agrawal", benchmark: "CRISIL Hybrid 50+50", holdings: [{name:"ICICI Bank",sector:"Financial",weight:6.5},{name:"TCS",sector:"IT",weight:5.2},{name:"GOI 2024",sector:"G-Sec",weight:12.0}], sipAmount: 10000, sipDate: "1st of every month", purchaseDate: "2020-08-01", status: "Active", dayChange: 340, dayChangePercent: 0.17 },
  { id: "5", schemeName: "Axis Long Term Equity Fund", amc: "Axis Mutual Fund", category: "Equity", subCategory: "ELSS (Tax Saver)", nav: 68.90, units: 725.69, investedAmount: 50000, currentValue: 50000, absoluteReturn: 0, xirr: -2.1, rating: 3, riskLevel: "High", expenseRatio: 1.15, aum: 18000, fundManager: "Jinesh Gopani", benchmark: "S&P BSE 200", holdings: [{name:"Bajaj Finance",sector:"Financial",weight:8.5},{name:"Titan",sector:"Consumer",weight:6.2},{name:"M&M",sector:"Auto",weight:5.8}], purchaseDate: "2023-01-01", status: "Active", dayChange: -180, dayChangePercent: -0.36 },
  { id: "6", schemeName: "ICICI Pru Liquid Fund", amc: "ICICI Prudential", category: "Debt", subCategory: "Liquid", nav: 100.15, units: 4992.51, investedAmount: 500000, currentValue: 500000, absoluteReturn: 6.5, xirr: 6.8, rating: 5, riskLevel: "Low", expenseRatio: 0.15, aum: 45000, fundManager: "Rahul Goswami", benchmark: "CRISIL Liquid Fund Index", holdings: [{name:"T-Bills 91D",sector:"G-Sec",weight:25.0},{name:"CD HDFC Bank",sector:"CD",weight:15.0},{name:"CP L&T",sector:"CP",weight:12.0}], purchaseDate: "2024-01-01", status: "Active", dayChange: 12, dayChangePercent: 0.002 },
  { id: "7", schemeName: "Quant Tax Plan", amc: "Quant Mutual Fund", category: "Equity", subCategory: "ELSS (Tax Saver)", nav: 185.45, units: 539.23, investedAmount: 75000, currentValue: 100000, absoluteReturn: 33.33, xirr: 24.8, rating: 5, riskLevel: "High", expenseRatio: 0.64, aum: 12000, fundManager: "Sanjeev Sharma", benchmark: "S&P BSE 200", holdings: [{name:"Adani Ports",sector:"Infrastructure",weight:8.2},{name:"Bajaj Finance",sector:"Financial",weight:7.5},{name:"Tata Motors",sector:"Auto",weight:6.8}], sipAmount: 2500, sipDate: "20th of every month", purchaseDate: "2022-04-20", status: "Active", dayChange: 520, dayChangePercent: 0.52 },
  { id: "8", schemeName: "PGIM India Midcap Opportunities", amc: "PGIM India", category: "Equity", subCategory: "Mid Cap", nav: 52.30, units: 1912.05, investedAmount: 75000, currentValue: 100000, absoluteReturn: 33.33, xirr: 19.5, rating: 4, riskLevel: "High", expenseRatio: 0.93, aum: 22000, fundManager: "Aniruddha Naha", benchmark: "Nifty Midcap 150 TRI", holdings: [{name:"Persistent Systems",sector:"IT",weight:6.5},{name:"Cholamandalam Finance",sector:"Financial",weight:5.8},{name:"Schaeffler India",sector:"Auto",weight:5.2}], sipAmount: 3000, sipDate: "12th of every month", purchaseDate: "2021-09-12", status: "Active", dayChange: 380, dayChangePercent: 0.38 },
];

const AI_INSIGHTS = [
  { id:"i1", type:"warning", title:"Small Cap Overexposure", description:"Your portfolio has 35% in small cap funds vs recommended 15%. Market volatility risk is elevated.", impact:"High risk in market downturns", priority:"High", icon: AlertTriangle },
  { id:"i2", type:"opportunity", title:"Tax Saver ELSS Limit Not Utilized", description:"You've invested ₹50,000 in ELSS but can claim ₹1.5L under 80C. Consider increasing SIP to ₹12,500/month.", impact:"Save ₹31,200 in taxes annually", priority:"High", icon: Star },
  { id:"i3", type:"action", title:"Axis Long Term Underperforming", description:"This fund has underperformed category average by 8% over 3 years. Consider switching to Quant Tax Plan.", impact:"Potential 8-12% better returns", priority:"Medium", icon: Zap },
  { id:"i4", type:"info", title:"Perfect Emergency Fund Allocation", description:"Your ₹5L liquid fund allocation covers 6 months of expenses. Well done!", impact:"Financial security maintained", priority:"Low", icon: CheckCircle },
  { id:"i5", type:"opportunity", title:"Debt Allocation Opportunity", description:"Current debt allocation is only 28%. For your age profile, 40% debt is recommended for stability.", impact:"Better risk-adjusted returns", priority:"Medium", icon: Lightbulb },
  { id:"i6", type:"success", title:"Nifty 50 Outperformance", description:"Your portfolio XIRR of 18.5% beats Nifty 50's 15.2% over 3 years. Great fund selection!", impact:"Alpha generation confirmed", priority:"Low", icon: Award },
];

const formatCurrency = (v: number) => { if (v >= 10000000) return `₹${(v/10000000).toFixed(2)}Cr`; if (v >= 100000) return `₹${(v/100000).toFixed(2)}L`; if (v >= 1000) return `₹${(v/1000).toFixed(1)}K`; return `₹${v.toFixed(0)}`; };
const getRiskColor = (risk: string) => { switch(risk) { case "Low": return "bg-emerald-100 text-emerald-700"; case "Moderate": return "bg-blue-100 text-blue-700"; case "High": return "bg-orange-100 text-orange-700"; case "Very High": return "bg-red-100 text-red-700"; default: return "bg-slate-100 text-slate-700"; } };
const getInsightColor = (type: string) => { switch(type) { case "warning": return { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" }; case "opportunity": return { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" }; case "action": return { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" }; case "info": return { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-600", badge: "bg-slate-100 text-slate-600" }; case "success": return { bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600", badge: "bg-purple-100 text-purple-700" }; default: return { bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-600", badge: "bg-slate-100 text-slate-600" }; } };

export default function FolioIQ() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard" | "upload" | "fund-detail">("landing");
  const [selectedFund, setSelectedFund] = useState<MutualFund | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const summary = useMemo(() => {
    const totalInvested = FUNDS.reduce((s, f) => s + f.investedAmount, 0);
    const currentValue = FUNDS.reduce((s, f) => s + f.currentValue, 0);
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    const weightedXirr = FUNDS.reduce((s, f) => s + (f.xirr * f.investedAmount), 0) / totalInvested;
    const activeSIPs = FUNDS.filter(f => f.sipAmount && f.status === "Active").length;
    const monthlySIP = FUNDS.reduce((s, f) => s + (f.sipAmount || 0), 0);
    const dayChange = FUNDS.reduce((s, f) => s + (f.dayChange || 0), 0);
    const dayChangePercent = (dayChange / currentValue) * 100;
    let score = 70; if (absoluteReturn > 20) score += 10; if (activeSIPs >= 3) score += 5; if (FUNDS.some(f => f.riskLevel === "Low")) score += 5; if (absoluteReturn < 0) score -= 15; score = Math.min(100, Math.max(0, score));
    return { totalInvested, currentValue, absoluteReturn, xirr: weightedXirr, totalFunds: FUNDS.length, activeSIPs, monthlySIP, dayChange, dayChangePercent, score };
  }, []);

  const categoryData = useMemo(() => { const cats: Record<string, number> = {}; FUNDS.forEach(f => { cats[f.category] = (cats[f.category] || 0) + f.currentValue; }); return Object.entries(cats).map(([name, value]) => ({ name, value, color: name === "Equity" ? "#10b981" : name === "Debt" ? "#3b82f6" : name === "Hybrid" ? "#f59e0b" : "#8b5cf6" })); }, []);
  const subCategoryData = useMemo(() => { const subs: Record<string, number> = {}; FUNDS.forEach(f => { subs[f.subCategory] = (subs[f.subCategory] || 0) + f.currentValue; }); return Object.entries(subs).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value); }, []);
  const sectorData = [{ name: "Financial", value: 35, fullMark: 100 }, { name: "IT", value: 22, fullMark: 100 }, { name: "Auto", value: 12, fullMark: 100 }, { name: "Consumer", value: 10, fullMark: 100 }, { name: "Energy", value: 8, fullMark: 100 }, { name: "Others", value: 13, fullMark: 100 }];
  const performanceData = [{ month: "Jan", equity: 8.5, debt: 0.8, hybrid: 4.2 }, { month: "Feb", equity: -2.1, debt: 0.6, hybrid: 1.8 }, { month: "Mar", equity: 5.3, debt: 0.7, hybrid: 3.1 }, { month: "Apr", equity: 3.2, debt: 0.5, hybrid: 2.4 }, { month: "May", equity: 6.8, debt: 0.9, hybrid: 4.5 }, { month: "Jun", equity: -1.5, debt: 0.7, hybrid: 0.8 }];
  const riskData = [{ subject: "Diversification", A: 85, fullMark: 100 }, { subject: "Risk Balance", A: 60, fullMark: 100 }, { subject: "Tax Efficiency", A: 75, fullMark: 100 }, { subject: "Cost Control", A: 70, fullMark: 100 }, { subject: "Liquidity", A: 90, fullMark: 100 }, { subject: "Growth", A: 80, fullMark: 100 }];

  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: "2s"}} />
        </div>
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FolioIQ</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm text-slate-400 hover:text-white transition hidden sm:block">Features</button>
            <button className="text-sm text-slate-400 hover:text-white transition hidden sm:block">Pricing</button>
            <button onClick={() => setCurrentView("dashboard")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-lg shadow-emerald-500/25">Get Started</button>
          </div>
        </nav>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">AI-Powered Portfolio Intelligence</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Make better<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">mutual fund</span><br />
                decisions.
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Upload your portfolio and FolioIQ tells you what to fix, what to keep, and what to add next. Smart analysis that anyone can understand.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView("dashboard")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center gap-2 shadow-lg shadow-emerald-500/25">
                  Check your portfolio <ChevronRight size={18} />
                </button>
                <button onClick={() => setCurrentView("upload")} className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition">
                  Upload CAS
                </button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center"><p className="text-2xl font-bold text-white">5 sec</p><p className="text-xs text-slate-500 uppercase tracking-wider">Portfolio Scan</p></div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center"><p className="text-2xl font-bold text-white">AI</p><p className="text-xs text-slate-500 uppercase tracking-wider">Powered Checks</p></div>
                <div className="w-px h-10 bg-slate-700" />
                <div className="text-center"><p className="text-2xl font-bold text-white">Simple</p><p className="text-xs text-slate-500 uppercase tracking-wider">Action Plan</p></div>
              </div>
            </div>
            <div className="relative lg:pl-8">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Portfolio Health</h3>
                      <div className="flex items-end gap-2 mt-1"><span className="text-5xl font-bold text-slate-900">{summary.score}</span><span className="text-sm text-slate-400 mb-2">/100</span></div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${summary.score >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{summary.score >= 70 ? "Healthy" : "Needs Work"}</div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000" style={{width: `${summary.score}%`}} />
                  </div>
                  <div className="space-y-3">
                    {AI_INSIGHTS.slice(0, 3).map(insight => (
                      <div key={insight.id} className={`flex items-start gap-3 p-3 rounded-xl ${getInsightColor(insight.type).bg} border ${getInsightColor(insight.type).border}`}>
                        <insight.icon size={16} className={getInsightColor(insight.type).icon + " mt-0.5 shrink-0"} />
                        <div><p className="text-xs font-semibold text-slate-800">{insight.title}</p><p className="text-[10px] text-slate-500 mt-0.5">{insight.impact}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-xl shadow-emerald-500/20 animate-bounce" style={{animationDuration: "3s"}}><TrendingUp size={24} /></div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl"><Zap size={24} className="text-amber-500" /></div>
            </div>
          </div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why FolioIQ?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to make smarter mutual fund decisions, powered by AI</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{ icon: Brain, title: "AI Analysis", desc: "Get personalized recommendations based on your portfolio" }, { icon: Zap, title: "Risk Assessment", desc: "Understand your risk exposure across categories" }, { icon: Target, title: "Tax Optimization", desc: "Maximize tax savings with smart harvesting" }, { icon: BarChart3, title: "Visual Analytics", desc: "Beautiful charts for portfolio breakdown" }, { icon: Award, title: "Instant Insights", desc: "5-second portfolio health check" }, { icon: Lightbulb, title: "Expert Grading", desc: "Portfolio score with actionable fixes" }].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition">
                  <feature.icon size={24} className="text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "fund-detail" && selectedFund) {
    const f = selectedFund;
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentView("dashboard")} className="p-2 hover:bg-slate-100 rounded-lg transition"><ChevronRight size={20} className="text-slate-500 rotate-180" /></button>
            <div><h1 className="font-bold text-slate-800">{f.schemeName}</h1><p className="text-xs text-slate-500">{f.amc} • {f.subCategory}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${f.absoluteReturn >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{f.absoluteReturn >= 0 ? "+" : ""}{f.absoluteReturn.toFixed(1)}% Return</span>
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${getRiskColor(f.riskLevel)}`}>{f.riskLevel} Risk</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[{ label: "Current Value", value: formatCurrency(f.currentValue), color: "text-slate-900" }, { label: "Invested", value: formatCurrency(f.investedAmount), color: "text-slate-600" }, { label: "XIRR", value: `${f.xirr.toFixed(1)}%`, color: f.xirr >= 0 ? "text-emerald-600" : "text-red-600" }, { label: "Units", value: f.units.toFixed(2), color: "text-slate-900" }].map((metric, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm"><p className="text-xs text-slate-500 mb-1">{metric.label}</p><p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p></div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-500" /> NAV Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={[{month:"Jan", nav: f.nav * 0.85}, {month:"Feb", nav: f.nav * 0.82}, {month:"Mar", nav: f.nav * 0.90}, {month:"Apr", nav: f.nav * 0.95}, {month:"May", nav: f.nav * 0.98}, {month:"Jun", nav: f.nav}]}>
                    <defs><linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"}} />
                    <Area type="monotone" dataKey="nav" stroke="#10b981" fillOpacity={1} fill="url(#navGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18} className="text-blue-500" /> Top Holdings</h3>
                <div className="space-y-4">
                  {f.holdings.map((h, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">{h.name.charAt(0)}</div>
                        <div><p className="text-sm font-semibold text-slate-800">{h.name}</p><p className="text-xs text-slate-500">{h.sector}</p></div>
                      </div>
                      <div className="text-right"><p className="text-sm font-bold text-slate-800">{h.weight}%</p><div className="w-32 h-2 bg-slate-100 rounded-full mt-1"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${h.weight * 5}%`}} /></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-4">Fund Details</h3>
                <div className="space-y-3 text-sm">
                  {[{ label: "Fund Manager", value: f.fundManager }, { label: "Category", value: f.category }, { label: "Benchmark", value: f.benchmark }, { label: "Expense Ratio", value: `${f.expenseRatio}%` }, { label: "AUM", value: `₹${f.aum}Cr` }, { label: "Risk", value: f.riskLevel, isRisk: true }, { label: "Rating", value: "★".repeat(f.rating) + "☆".repeat(5-f.rating), isRating: true }].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500">{item.label}</span>
                      <span className={`font-medium ${item.isRisk ? (f.riskLevel === "Low" ? "text-emerald-600" : f.riskLevel === "Moderate" ? "text-blue-600" : f.riskLevel === "High" ? "text-orange-600" : "text-red-600") : item.isRating ? "text-amber-500" : "text-slate-800"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {f.sipAmount && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2"><Clock size={16} /> SIP Active</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-emerald-600">Amount</span><span className="font-bold text-emerald-800">₹{f.sipAmount.toLocaleString()}/month</span></div>
                    <div className="flex justify-between"><span className="text-emerald-600">Date</span><span className="font-medium text-emerald-800">{f.sipDate}</span></div>
                  </div>
                </div>
              )}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2"><Brain size={16} /> AI Recommendation</h3>
                <p className="text-sm text-amber-700 leading-relaxed">{f.absoluteReturn < 0 ? "This fund is underperforming. Consider reviewing your allocation or switching to a better alternative in the same category." : f.riskLevel === "Very High" ? "Strong performer but high volatility. Ensure this fits your risk appetite and overall allocation." : "Solid fund with consistent performance. Continue your SIP to benefit from rupee cost averaging."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed lg:static lg:translate-x-0 z-40 w-64 h-screen bg-white border-r border-slate-200 transition-transform duration-300`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md"><TrendingUp size={20} className="text-white" /></div>
            <span className="font-bold text-slate-800 text-lg">FolioIQ</span>
          </div>
          <nav className="space-y-1">
            {[{id:"overview", icon:PieIcon, label:"Overview"}, {id:"holdings", icon:Layers, label:"Holdings"}, {id:"analysis", icon:BarChart3, label:"Analysis"}, {id:"insights", icon:Brain, label:"AI Insights"}].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${activeTab === item.id ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}><item.icon size={18} /> {item.label}</button>
            ))}
            <button onClick={() => setCurrentView("upload")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 font-medium text-sm transition"><Upload size={18} /> Upload CAS</button>
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-5 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center"><User size={16} className="text-slate-600" /></div>
            <div className="flex-1"><p className="text-sm font-medium text-slate-800">Portfolio</p><p className="text-xs text-slate-500">{summary.totalFunds} funds</p></div>
            <Settings size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
          </div>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition"><Menu size={20} className="text-slate-600" /></button>
            <h2 className="font-semibold text-slate-800 text-lg">{activeTab === "overview" ? "Portfolio Overview" : activeTab === "holdings" ? "Your Holdings" : activeTab === "analysis" ? "Portfolio Analysis" : "AI Insights"}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition relative"><Bell size={18} className="text-slate-500" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            <button onClick={() => setCurrentView("upload")} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition shadow-sm"><Upload size={16} /> Upload</button>
          </div>
        </header>
        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Portfolio Health Score</h3>
                    <div className="flex items-end gap-2 mt-1"><span className="text-5xl font-bold">{summary.score}</span><span className="text-sm text-slate-400 mb-1">/100</span></div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${summary.score >= 70 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{summary.score >= 70 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}{summary.score >= 70 ? "Healthy" : "Needs Work"}</div>
                    <p className="text-xs text-slate-500 mt-1">{summary.totalFunds} funds analyzed</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-1000" style={{width: `${summary.score}%`}} />
                </div>
                <div className="flex items-center gap-6 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Excellent (80-100)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-teal-400 rounded-full" /> Good (60-79)</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full" /> Needs Work (0-59)</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[{label:"Current Value", value:formatCurrency(summary.currentValue), icon:Wallet, color:"emerald", trend:`↑ ${summary.dayChangePercent.toFixed(2)}%`, sub:`+${formatCurrency(summary.dayChange)} today`}, {label:"Total Invested", value:formatCurrency(summary.totalInvested), icon:DollarSign, color:"blue", sub:`Across ${summary.totalFunds} funds`}, {label:"Total Returns", value:`${summary.absoluteReturn >= 0 ? "+" : ""}${summary.absoluteReturn.toFixed(1)}%`, icon:ArrowUpRight, color:"purple", sub:`XIRR: ${summary.xirr.toFixed(1)}%`, isReturn:true}, {label:"Monthly SIP", value:formatCurrency(summary.monthlySIP), icon:Clock, color:"orange", sub:`${summary.activeSIPs} active SIPs`}].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                      <div className={`p-1.5 bg-${card.color}-50 rounded-lg`}><card.icon size={14} className={`text-${card.color}-600`} /></div>
                    </div>
                    <p className={`text-2xl font-bold ${card.isReturn ? (summary.absoluteReturn >= 0 ? "text-emerald-600" : "text-red-600") : "text-slate-900"}`}>{card.value}</p>
                    <div className="flex items-center gap-2 mt-1">{card.trend && <span className={`text-xs font-semibold ${card.color === "emerald" ? "text-emerald-600 bg-emerald-50" : "text-slate-600 bg-slate-50"} px-2 py-0.5 rounded-full`}>{card.trend}</span>}<span className="text-xs text-slate-400">{card.sub}</span></div>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2"><PieIcon size={16} className="text-emerald-500" /> Asset Allocation</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">{categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip formatter={(value: number) => formatCurrency(value)} /><Legend verticalAlign="bottom" height={36} iconType="circle" /></PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500" /> Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={subCategoryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} /><XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} /><YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={100} /><Tooltip formatter={(value: number) => formatCurrency(value)} /><Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2"><Activity size={16} className="text-purple-500" /> Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="month" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} /><Tooltip contentStyle={{borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"}} /><Legend /><Area type="monotone" dataKey="equity" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Equity" /><Area type="monotone" dataKey="debt" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Debt" /><Area type="monotone" dataKey="hybrid" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Hybrid" /></AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2"><Target size={16} className="text-red-500" /> Risk Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={riskData}><PolarGrid stroke="#e2e8f0" /><PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 12}} /><PolarAngleAxis angle={30} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10}} /><Radar name="Your Portfolio" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} /></RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {activeTab === "holdings" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Your Funds ({FUNDS.length})</h3>
                  <div className="flex items-center gap-2"><button className="p-2 hover:bg-slate-100 rounded-lg transition"><Search size={16} className="text-slate-400" /></button><button className="p-2 hover:bg-slate-100 rounded-lg transition"><Filter size={16} className="text-slate-400" /></button></div>
                </div>
                <div className="divide-y divide-slate-50">
                  {FUNDS.map((fund, index) => (
                    <div key={`${fund.id}-${index}`} onClick={() => { setSelectedFund(fund); setCurrentView("fund-detail"); }} className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{fund.schemeName}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${fund.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{fund.status}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><span>{fund.amc}</span><span>•</span><span>{fund.subCategory}</span><span>•</span><span>Exp: {fund.expenseRatio}%</span></div>
                        </div>
                        <div className="text-right mr-6 hidden sm:block"><p className="text-sm font-bold text-slate-900">{formatCurrency(fund.currentValue)}</p><p className="text-xs text-slate-500">{formatCurrency(fund.investedAmount)} invested</p></div>
                        <div className="text-right w-20 shrink-0"><p className={`text-sm font-bold ${fund.absoluteReturn >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fund.absoluteReturn >= 0 ? "+" : ""}{fund.absoluteReturn.toFixed(1)}%</p><p className="text-xs text-slate-500">XIRR {fund.xirr.toFixed(1)}%</p></div>
                        <ChevronRight size={16} className="text-slate-300 ml-2 shrink-0" />
                      </div>
                      {fund.sipAmount && <div className="mt-2 flex items-center gap-2"><span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">SIP ₹{fund.sipAmount.toLocaleString()}/month</span></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "analysis" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm mb-4">Sector Allocation</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={sectorData}><PolarGrid stroke="#e2e8f0" /><PolarAngleAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} /><PolarAngleAxis angle={30} domain={[0, 100]} tick={{fill: '#94a3b8', fontSize: 10}} /><Radar name="Allocation %" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} /></RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-800 text-sm mb-4">Return Comparison</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={FUNDS.map(f => ({ name: f.schemeName.substring(0, 15), return: f.xirr, benchmark: f.xirr - 2 }))}><CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" /><XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-45} textAnchor="end" height={80} /><YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} /><Tooltip /><Legend /><Bar dataKey="return" fill="#10b981" name="Your XIRR" radius={[4, 4, 0, 0]} /><Bar dataKey="benchmark" fill="#94a3b8" name="Category Avg" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          {activeTab === "insights" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4"><Brain size={24} className="text-emerald-400" /><div><h3 className="font-bold text-lg">AI Portfolio Advisor</h3><p className="text-sm text-slate-400">Personalized recommendations based on your portfolio</p></div></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center"><p className="text-2xl font-bold text-emerald-400">{AI_INSIGHTS.filter(i => i.priority === "High").length}</p><p className="text-xs text-slate-400">High Priority</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-amber-400">{AI_INSIGHTS.filter(i => i.priority === "Medium").length}</p><p className="text-xs text-slate-400">Medium Priority</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-blue-400">{AI_INSIGHTS.filter(i => i.priority === "Low").length}</p><p className="text-xs text-slate-400">Low Priority</p></div>
                </div>
              </div>
              <div className="space-y-4">
                {AI_INSIGHTS.map(insight => {
                  const colors = getInsightColor(insight.type);
                  return (
                    <div key={insight.id} className={`${colors.bg} border ${colors.border} rounded-xl p-5 hover:shadow-md transition`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${colors.bg} shrink-0`}><insight.icon size={20} className={colors.icon} /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-slate-800">{insight.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${insight.priority === "High" ? "bg-red-100 text-red-700" : insight.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{insight.priority}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-2">{insight.description}</p>
                          <div className="flex items-center gap-2"><Target size={14} className="text-slate-400" /><span className="text-xs font-medium text-slate-700">Impact: {insight.impact}</span></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}