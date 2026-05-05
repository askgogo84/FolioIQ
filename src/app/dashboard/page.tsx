"use client";

import { useState } from "react";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Upload, Receipt, User, Sparkles, Scale, 
  DollarSign, MessageSquare, Target, Calculator, TrendingUp,
  Search, Filter, BarChart2, Globe, Activity, FileText, 
  Download, FileCode, LogOut, Menu, X,
  TrendingUp as TrendingUpIcon, TrendingDown, Wallet, AlertTriangle, 
  PieChart, LogIn, Shield,
  IndianRupee, BarChart3, PiggyBank, Landmark
} from "lucide-react";

// INLINE Sidebar - built into this file, no imports that can fail
function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarItems = [
    { title: "PORTFOLIO", items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Upload CAS", href: "/upload", icon: Upload },
      { name: "Transactions", href: "/transactions", icon: Receipt },
      { name: "Profile", href: "/profile", icon: User },
    ]},
    { title: "AI INTELLIGENCE", items: [
      { name: "AI Insights", href: "/intelligence", icon: Sparkles },
      { name: "Smart Rebalance", href: "/rebalance", icon: Scale },
      { name: "Tax Harvesting", href: "/tax-harvesting", icon: DollarSign },
      { name: "AI Chat", href: "/chat", icon: MessageSquare },
    ]},
    { title: "PLANNING", items: [
      { name: "Goal Planner", href: "/goals", icon: Target },
      { name: "SIP Calculator", href: "/calculator", icon: Calculator },
      { name: "Backtesting", href: "/backtest", icon: TrendingUp },
    ]},
    { title: "DISCOVERY", items: [
      { name: "Fund Explorer", href: "/explore", icon: Search },
      { name: "Fund Screener", href: "/screener", icon: Filter },
      { name: "Fund Compare", href: "/compare", icon: BarChart2 },
      { name: "Market Overview", href: "/market", icon: Globe },
      { name: "Live NAV", href: "/live-nav", icon: Activity },
    ]},
    { title: "REPORTS", items: [
      { name: "Capital Gains", href: "/capital-gains", icon: FileText },
      { name: "Export Reports", href: "/reports", icon: Download },
      { name: "PDF Parser", href: "/parse-cas", icon: FileCode },
    ]},
  ];

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200">
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col h-screen overflow-y-auto`}>
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div><h1 className="text-xl font-bold text-slate-900">FolioIQ</h1><p className="text-xs text-slate-400">Smart Analytics</p></div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                      <Icon className="h-4 w-4" />{item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link href="/auth" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="h-4 w-4" />Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function DashboardPage() {
  const { portfolio, hasUpload, isLoading, isDemo, isAuthenticated } = usePortfolioData();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("1Y");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const chartData = [
    { month: 'Jan', value: 4200000 }, { month: 'Feb', value: 4450000 }, { month: 'Mar', value: 4380000 },
    { month: 'Apr', value: 4620000 }, { month: 'May', value: 4780000 }, { month: 'Jun', value: 4950000 },
    { month: 'Jul', value: 5120000 }, { month: 'Aug', value: 5280000 }, { month: 'Sep', value: 5450000 },
    { month: 'Oct', value: 5380000 }, { month: 'Nov', value: 5530000 }, { month: 'Dec', value: 5530000 },
  ];

  const allocationData = [
    { name: 'Equity', value: portfolio.allocation.equity, color: '#10b981' },
    { name: 'Debt', value: portfolio.allocation.debt, color: '#3b82f6' },
    { name: 'Hybrid', value: portfolio.allocation.hybrid, color: '#f59e0b' },
    { name: 'International', value: portfolio.allocation.international, color: '#8b5cf6' },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  const chartWidth = 800; const chartHeight = 250; const padding = 40;
  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((d.value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `${padding},${chartHeight - padding} ${points} ${chartWidth - padding},${chartHeight - padding}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {isDemo && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Viewing Demo Portfolio — 
                  {!isAuthenticated ? (
                    <><Link href="/auth" className="underline font-semibold hover:text-amber-900">Sign in</Link> to see your real data or <Link href="/upload" className="underline font-semibold hover:text-amber-900">upload your CAS</Link></>
                  ) : (
                    <><Link href="/upload" className="underline font-semibold hover:text-amber-900">Upload your CAS</Link> to see your actual portfolio</>
                  )}
                </span>
              </div>
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-white">DEMO MODE</Badge>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{isAuthenticated ? `Welcome back, ${user?.email?.split('@')[0] || 'Investor'}` : 'Welcome to FolioIQ'}</h1>
              <p className="text-slate-500 mt-1">{isDemo ? "Here's a preview of what your dashboard will look like" : "Your portfolio at a glance"}</p>
            </div>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <Link href="/upload"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><Upload className="h-4 w-4 mr-2" />{hasUpload ? "Update CAS" : "Upload CAS"}</Button></Link>
              ) : (
                <Link href="/auth"><Button className="bg-emerald-600 hover:bg-emerald-700 text-white"><LogIn className="h-4 w-4 mr-2" />Sign In</Button></Link>
              )}
            </div>
          </div>

          {/* Cards, Charts, Table - same as before */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><Wallet className="h-4 w-4 text-slate-400" />Total Portfolio Value</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-slate-900">{formatCurrency(portfolio.totalValue)}</div><div className="flex items-center gap-1 mt-1"><TrendingUpIcon className="h-4 w-4 text-emerald-500" /><span className="text-sm text-emerald-600 font-medium">+{portfolio.returnsPercent}%</span><span className="text-xs text-slate-400">all time</span></div></CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><IndianRupee className="h-4 w-4 text-slate-400" />Invested Amount</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-slate-900">{formatCurrency(portfolio.investedAmount)}</div><div className="text-xs text-slate-400 mt-1">Across {portfolio.funds.length} funds</div></CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><TrendingUpIcon className="h-4 w-4 text-slate-400" />Current Returns</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-emerald-600">+{formatCurrency(portfolio.currentReturns)}</div><div className="text-xs text-slate-400 mt-1">XIRR: {portfolio.xirr}% p.a.</div></CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2"><PiggyBank className="h-4 w-4 text-slate-400" />Monthly SIP</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-slate-900">{formatCurrency(portfolio.monthlySIP)}</div><div className="text-xs text-slate-400 mt-1">{portfolio.totalSIPs} active SIPs</div></CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
              <CardHeader><div className="flex items-center justify-between"><CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-500" />Portfolio Growth</CardTitle><div className="flex gap-1">{["1M", "3M", "6M", "1Y", "3Y", "All"].map((range) => (<Button key={range} variant={timeRange === range ? "default" : "outline"} size="sm" onClick={() => setTimeRange(range)} className={timeRange === range ? "bg-emerald-600 text-white" : "border-slate-300 text-slate-600"}>{range}</Button>))}</div></div></CardHeader>
              <CardContent><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64">{[0, 1, 2, 3, 4].map(i => (<line key={i} x1={padding} y1={padding + i * (chartHeight - 2 * padding) / 4} x2={chartWidth - padding} y2={padding + i * (chartHeight - 2 * padding) / 4} stroke="#e2e8f0" strokeDasharray="4" />))}<polygon points={areaPoints} fill="url(#gradient)" opacity="0.3" /><defs><linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs><polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" />{chartData.map((d, i) => { const x = padding + (i / (chartData.length - 1)) * (chartWidth - 2 * padding); const y = chartHeight - padding - ((d.value - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding); return (<g key={i}><circle cx={x} cy={y} r="4" fill="#10b981" /><text x={x} y={chartHeight - 10} textAnchor="middle" fontSize="12" fill="#64748b">{d.month}</text></g>); })}</svg></CardContent>
            </Card>
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader><CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2"><PieChart className="h-5 w-5 text-blue-500" />Asset Allocation</CardTitle></CardHeader>
              <CardContent><svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">{allocationData.map((item, index) => { const startAngle = allocationData.slice(0, index).reduce((sum, d) => sum + (d.value / 100) * 360, 0); const endAngle = startAngle + (item.value / 100) * 360; const largeArc = item.value > 50 ? 1 : 0; const startRad = (startAngle - 90) * Math.PI / 180; const endRad = (endAngle - 90) * Math.PI / 180; const x1 = 100 + 80 * Math.cos(startRad); const y1 = 100 + 80 * Math.sin(startRad); const x2 = 100 + 80 * Math.cos(endRad); const y2 = 100 + 80 * Math.sin(endRad); return (<path key={index} d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={item.color} />); })}<circle cx="100" cy="100" r="40" fill="white" /></svg><div className="space-y-2 mt-4">{allocationData.map((item) => (<div key={item.name} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-sm text-slate-600">{item.name}</span></div><span className="text-sm font-medium text-slate-900">{item.value}%</span></div>))}</div></CardContent>
            </Card>
          </div>

          {/* Fund Holdings */}
          <Card className="bg-white border-slate-200 shadow-sm mb-8">
            <CardHeader><CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Landmark className="h-5 w-5 text-violet-500" />Fund Holdings</CardTitle></CardHeader>
            <CardContent><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-slate-200"><th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Fund Name</th><th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th><th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Invested</th><th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Current Value</th><th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Returns</th><th className="text-center py-3 px-4 text-sm font-medium text-slate-500">SIP</th><th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Rating</th></tr></thead><tbody>{portfolio.funds.map((fund, index) => (<tr key={index} className="border-b border-slate-100 hover:bg-slate-50"><td className="py-3 px-4"><div className="font-medium text-slate-900">{fund.name}</div><div className="text-xs text-slate-400">{fund.risk} Risk</div></td><td className="py-3 px-4"><Badge variant="outline" className="border-slate-300 text-slate-600">{fund.category}</Badge></td><td className="py-3 px-4 text-right text-slate-600">{formatCurrency(fund.invested)}</td><td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(fund.value)}</td><td className="py-3 px-4 text-right"><div className={`flex items-center justify-end gap-1 ${fund.returns >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{fund.returns >= 0 ? <TrendingUpIcon className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}<span className="font-medium">{fund.returnsPercent}%</span></div><div className="text-xs text-slate-400">{formatCurrency(fund.returns)}</div></td><td className="py-3 px-4 text-center text-slate-600">{fund.sip > 0 ? formatCurrency(fund.sip) : '-'}</td><td className="py-3 px-4 text-center"><div className="flex justify-center">{Array.from({ length: 5 }).map((_, i) => (<svg key={i} className={`w-4 h-4 ${i < fund.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div></td></tr>))}</tbody></table></div></CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
