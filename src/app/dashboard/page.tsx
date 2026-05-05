"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area,
  CartesianGrid, XAxis, YAxis
} from "recharts";
import {
  TrendingUp, Wallet, Target, AlertTriangle, ArrowUpRight, ArrowDownRight,
  RefreshCw, Upload, Brain, Shield, Zap, BarChart3, PieChart as PieIcon, Activity,
  LayoutDashboard, FileUp, Receipt, User, Sparkles, Scale, PiggyBank,
  MessageSquare, Search, BookOpen, ChevronRight, Menu, X, LogOut
} from "lucide-react";
import Link from "next/link";

const COLORS = {
  equity: "#10b981", debt: "#3b82f6", hybrid: "#f59e0b",
  gold: "#fbbf24", liquid: "#8b5cf6", international: "#ec4899"
};

const sidebarItems = [
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

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/auth"); return; }
        setUser(user);

        const { data: portfolioData, error: dbError } = await supabase
          .from("portfolios")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (dbError || !portfolioData?.data) {
          setError("No portfolio found. Please upload your CAS statement.");
          setLoading(false);
          return;
        }

        setPortfolio(portfolioData.data);
      } catch (err) {
        setError("Failed to load portfolio data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase, router]);

  const formatCurrency = (value: number) => {
    if (!value) return "₹0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Portfolio Found</h2>
          <p className="text-gray-600 mb-6">{error || "Upload your CAS statement to see your portfolio analysis."}</p>
          <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
            <Upload className="w-4 h-4" /> Upload CAS Statement
          </Link>
        </div>
      </div>
    );
  }

  const alloc = portfolio.allocation || {};
  const allocationData = [
    { name: "Equity", value: alloc.equity || 0, color: COLORS.equity },
    { name: "Debt", value: alloc.debt || 0, color: COLORS.debt },
    { name: "Hybrid", value: alloc.hybrid || 0, color: COLORS.hybrid },
    { name: "Gold", value: alloc.gold || 0, color: COLORS.gold },
    { name: "Liquid", value: alloc.liquid || 0, color: COLORS.liquid },
    { name: "International", value: alloc.international || 0, color: COLORS.international },
  ].filter(item => item.value > 0);

  const isPositive = (portfolio.currentReturns || 0) >= 0;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const baseValue = portfolio.investedAmount || 0;
  const currentValue = portfolio.totalValue || 0;
  const monthlyGrowth = (currentValue - baseValue) / 12;
  const growthData = months.map((month, i) => ({
    month,
    value: Math.round(baseValue + (monthlyGrowth * (i + 1)))
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FolioIQ</h1>
              <p className="text-xs text-gray-500">Smart Analytics</p>
            </div>
          </div>

          <nav className="space-y-6">
            {sidebarItems.map((section, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">{section.section}</h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.active || false;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 mt-8 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email?.split("@")[0] || "Investor"}</h1>
                <p className="text-gray-500 mt-1">Your portfolio at a glance</p>
              </div>
              <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" /> Update CAS
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg"><Wallet className="w-5 h-5 text-emerald-600" /></div>
                <span className="text-sm font-medium text-gray-600">Total Portfolio Value</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{portfolio.returnsPercent?.toFixed(2) || 0}% all time</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg"><Target className="w-5 h-5 text-blue-600" /></div>
                <span className="text-sm font-medium text-gray-600">Invested Amount</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(portfolio.investedAmount)}</p>
              <p className="text-sm text-gray-500 mt-2">Across {portfolio.funds?.length || 0} funds</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${isPositive ? "bg-emerald-100" : "bg-red-100"}`}>
                  <TrendingUp className={`w-5 h-5 ${isPositive ? "text-emerald-600" : "text-red-600"}`} />
                </div>
                <span className="text-sm font-medium text-gray-600">Current Returns</span>
              </div>
              <p className={`text-3xl font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                {isPositive ? "+" : ""}{formatCurrency(portfolio.currentReturns)}
              </p>
              <p className="text-sm text-gray-500 mt-2">XIRR: {portfolio.xirr?.toFixed(2) || 0}% p.a.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg"><Zap className="w-5 h-5 text-purple-600" /></div>
                <span className="text-sm font-medium text-gray-600">Monthly SIP</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(portfolio.monthlySIP)}</p>
              <p className="text-sm text-gray-500 mt-2">{portfolio.totalSIPs || 0} active SIPs</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Brain, label: "AI Insights", href: "/intelligence", color: "bg-violet-100 text-violet-600" },
              { icon: Scale, label: "Rebalance", href: "/rebalance", color: "bg-amber-100 text-amber-600" },
              { icon: Shield, label: "Tax Harvest", href: "/tax-harvesting", color: "bg-rose-100 text-rose-600" },
              { icon: Target, label: "Goals", href: "/goals", color: "bg-cyan-100 text-cyan-600" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg ${action.color}`}><Icon className="w-5 h-5" /></div>
                  <span className="text-sm font-medium text-gray-900">{action.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Portfolio Growth</h3>
                </div>
                <div className="flex gap-2">
                  {["1M","3M","6M","1Y","3Y","All"].map((p) => (
                    <button key={p} className={`px-3 py-1 text-xs rounded-lg font-medium ${p==="All"?"bg-emerald-600 text-white":"bg-gray-100 text-gray-600"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.equity} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.equity} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Value"]} />
                  <Area type="monotone" dataKey="value" stroke={COLORS.equity} fill="url(#colorValue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <PieIcon className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Asset Allocation</h3>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fund Holdings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fund Holdings</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fund Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Returns</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {portfolio.funds?.map((fund: any, index: number) => {
                    const fundPositive = (fund.returns || 0) >= 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{fund.name}</p>
                          <p className="text-xs text-gray-500">{fund.risk} Risk</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{fund.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">{formatCurrency(fund.invested)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">{formatCurrency(fund.value)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className={`text-sm font-medium ${fundPositive ? "text-emerald-600" : "text-red-500"}`}>
                            {fundPositive ? "+" : ""}{fund.returnsPercent?.toFixed(1)}%
                          </div>
                          <div className={`text-xs ${fundPositive ? "text-emerald-600" : "text-red-500"}`}>
                            {fundPositive ? "+" : ""}{formatCurrency(fund.returns || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            fund.risk === "Low" ? "bg-green-100 text-green-700" :
                            fund.risk === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                            fund.risk === "High" ? "bg-orange-100 text-orange-700" :
                            "bg-red-100 text-red-700"
                          }`}>{fund.risk}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alerts */}
          {portfolio.alerts?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolio.alerts.map((alert: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  alert.type === "warning" ? "bg-amber-50 border-amber-200" :
                  alert.type === "success" ? "bg-emerald-50 border-emerald-200" :
                  "bg-blue-50 border-blue-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.type === "warning" ? "text-amber-600" :
                      alert.type === "success" ? "text-emerald-600" :
                      "text-blue-600"
                    }`} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
