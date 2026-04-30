"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Brain, Zap, ChevronRight, ArrowUpRight, Wallet, Clock, Star, Info, Target, PieChart as PieIcon, Activity, Upload, Search, Filter, Bell, Menu, X, User, Settings, Layers, BarChart3, Award, Lightbulb, Sparkles, Banknote, LogOut } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

interface FundData {
  name: string;
  category: string;
  value: number;
  invested: number;
  returns: number;
  units?: number;
  nav?: number;
  folio?: string;
}

interface PortfolioData {
  fileName: string;
  uploadDate: string;
  funds: FundData[];
  summary: {
    currentValue: number;
    totalInvested: number;
    totalReturns: string;
    fundCount: number;
  };
}

const DEFAULT_FUNDS: FundData[] = [
  { name: "SBI Bluechip Fund - Direct Growth", category: "Large Cap", value: 450000, invested: 380000, returns: 18.42, units: 12500, nav: 36.00 },
  { name: "HDFC Mid-Cap Opportunities - Direct Growth", category: "Mid Cap", value: 320000, invested: 280000, returns: 14.29, units: 8000, nav: 40.00 },
  { name: "Axis Small Cap Fund - Direct Growth", category: "Small Cap", value: 180000, invested: 150000, returns: 20.00, units: 6000, nav: 30.00 },
  { name: "ICICI Pru Balanced Advantage - Direct", category: "Hybrid", value: 250000, invested: 230000, returns: 8.70, units: 10000, nav: 25.00 },
  { name: "Nippon India Liquid Fund - Direct", category: "Liquid", value: 150000, invested: 150000, returns: 6.50, units: 15000, nav: 10.00 },
  { name: "Mirae Asset Tax Saver Fund - Direct", category: "ELSS", value: 200000, invested: 160000, returns: 25.00, units: 5000, nav: 40.00 },
  { name: "Kotak Equity Arbitrage - Direct", category: "Arbitrage", value: 100000, invested: 95000, returns: 5.26, units: 5000, nav: 20.00 },
  { name: "Canara Robeco Equity Hybrid - Direct", category: "Balanced", value: 100000, invested: 92000, returns: 8.70, units: 4000, nav: 25.00 },
];

function formatCurrency(value: number): string {
  if (value >= 100000) {
    return `?${(value / 100000).toFixed(2)}L`;
  }
  return `?${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `?${value.toLocaleString("en-IN")}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPortfolio = () => {
      try {
        const saved = localStorage.getItem("folioiq_portfolio");
        if (saved) {
          const data = JSON.parse(saved);
          setPortfolio(data);
        } else {
          const totalValue = DEFAULT_FUNDS.reduce((sum, f) => sum + f.value, 0);
          const totalInvested = DEFAULT_FUNDS.reduce((sum, f) => sum + f.invested, 0);
          setPortfolio({
            fileName: "Demo Portfolio",
            uploadDate: new Date().toISOString(),
            funds: DEFAULT_FUNDS,
            summary: {
              currentValue: totalValue,
              totalInvested,
              totalReturns: (((totalValue - totalInvested) / totalInvested) * 100).toFixed(2),
              fundCount: DEFAULT_FUNDS.length,
            }
          });
        }
      } catch (error) {
        console.error("Error loading portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolio();
  }, []);

  const funds = portfolio?.funds || DEFAULT_FUNDS;
  const summary = portfolio?.summary || {
    currentValue: DEFAULT_FUNDS.reduce((sum, f) => sum + f.value, 0),
    totalInvested: DEFAULT_FUNDS.reduce((sum, f) => sum + f.invested, 0),
    totalReturns: "20.0",
    fundCount: DEFAULT_FUNDS.length,
  };

  const totalReturnsValue = summary.currentValue - summary.totalInvested;
  const totalReturnsPercent = ((totalReturnsValue / summary.totalInvested) * 100).toFixed(2);

  const assetAllocation = useMemo(() => {
    const allocation: Record<string, number> = {};
    funds.forEach((fund) => {
      const type = fund.category === "Liquid" || fund.category === "Debt" ? "Debt" : fund.category === "Hybrid" || fund.category === "Balanced" ? "Hybrid" : "Equity";
      allocation[type] = (allocation[type] || 0) + fund.value;
    });
    return Object.entries(allocation).map(([name, value]) => ({ name, value }));
  }, [funds]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    funds.forEach((fund) => {
      categories[fund.category] = (categories[fund.category] || 0) + fund.value;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [funds]);

  const performanceData = [
    { month: "Jan", Debt: 8, Equity: 12, Hybrid: 10 },
    { month: "Feb", Debt: 7, Equity: 8, Hybrid: 6 },
    { month: "Mar", Debt: 6, Equity: 5, Hybrid: 4 },
    { month: "Apr", Debt: 7, Equity: 9, Hybrid: 7 },
    { month: "May", Debt: 8, Equity: 11, Hybrid: 9 },
    { month: "Jun", Debt: 7, Equity: 10, Hybrid: 8 },
  ];

  const riskData = [
    { subject: "Equity", A: 80, fullMark: 100 },
    { subject: "Debt", A: 40, fullMark: 100 },
    { subject: "Hybrid", A: 60, fullMark: 100 },
    { subject: "Gold", A: 30, fullMark: 100 },
    { subject: "Real Estate", A: 20, fullMark: 100 },
    { subject: "Cash", A: 50, fullMark: 100 },
  ];

  const aiInsights = [
    { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", title: "Small Cap Overexposure", desc: "High risk in market downturns. Consider reducing small cap allocation to 15%." },
    { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", title: "Tax Saver ELSS Limit Not Utilized", desc: "Save ?31,200 in taxes annually. You can invest ?1.5L more in ELSS." },
    { icon: Star, color: "text-blue-500", bg: "bg-blue-50", title: "Axis Long Term Underperforming", desc: "Potential 8-12% better returns with fund switch recommendation." },
    { icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50", title: "Portfolio Rebalancing Needed", desc: "Current allocation is 65% equity. Target: 60% equity, 25% debt, 15% hybrid." },
    { icon: Lightbulb, color: "text-orange-500", bg: "bg-orange-50", title: "SIP Increase Opportunity", desc: "Increase monthly SIP by ?5,000 to reach ?50L corpus 2 years earlier." },
    { icon: Award, color: "text-pink-500", bg: "bg-pink-50", title: "Emergency Fund Status", desc: "Liquid fund covers 4 months expenses. Target: 6 months. Add ?50K to liquid." },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl text-gray-900">FolioIQ</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/upload")} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Portfolio
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700"><Bell className="w-5 h-5" /></button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-gray-600" /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">Portfolio Health Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold">80</span>
                <span className="text-gray-400">/100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4 h-4 mr-1" />
                Healthy
              </span>
              <p className="text-sm text-gray-400 mt-1">{summary.fundCount} funds analyzed</p>
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "80%" }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Current Value</p>
              <Wallet className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.currentValue)}</p>
            <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" />
              +{totalReturnsPercent}% all time
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Total Invested</p>
              <Banknote className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalInvested)}</p>
            <p className="text-sm text-gray-500 mt-1">Across {summary.fundCount} funds</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Total Returns</p>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">+{totalReturnsPercent}%</p>
            <p className="text-sm text-gray-500 mt-1">XIRR: 13.7%</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500 uppercase tracking-wider">Monthly SIP</p>
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">?28.5K</p>
            <p className="text-sm text-gray-500 mt-1">6 active SIPs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-500" />
              Asset Allocation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetAllocation} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `?${(value / 100000).toFixed(0)}L`} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Monthly Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Debt" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Equity" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Hybrid" stackId="1" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Risk Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar name="Current" dataKey="A" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`${insight.bg} rounded-lg p-4 border border-gray-100`}>
                <div className="flex items-start gap-3">
                  <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{insight.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              Holdings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fund Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {funds.map((fund, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{fund.name}</p>
                      {fund.folio && <p className="text-sm text-gray-500">Folio: {fund.folio}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {fund.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrencyFull(fund.invested)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrencyFull(fund.value)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${fund.returns >= 0 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {fund.returns >= 0 ? "+" : ""}{fund.returns}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

