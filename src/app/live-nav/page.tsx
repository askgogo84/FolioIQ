"use client";

import { useState, useEffect } from "react";
import { 
  Activity, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw,
  Clock, AlertCircle, CheckCircle
} from "lucide-react";
import Link from "next/link";

const liveFunds = [
  { name: "Invesco India Gold ETF FoF", nav: 724.15, change: 2.35, changePct: 0.32, prevNav: 721.80, category: "Gold", status: "up" },
  { name: "Parag Parikh Flexi Cap", nav: 402.10, change: 1.25, changePct: 0.31, prevNav: 400.85, category: "Flexi Cap", status: "up" },
  { name: "Nippon India Small Cap", nav: 354.20, change: 0.85, changePct: 0.24, prevNav: 353.35, category: "Small Cap", status: "up" },
  { name: "Axis Multicap Fund", nav: 216.50, change: 0.45, changePct: 0.21, prevNav: 216.05, category: "Multi Cap", status: "up" },
  { name: "ICICI Pru Technology", nav: 235.80, change: -1.28, changePct: -0.54, prevNav: 237.08, category: "Sectoral", status: "down" },
  { name: "Invesco India Infrastructure", nav: 238.50, change: -1.43, changePct: -0.60, prevNav: 239.93, category: "Sectoral", status: "down" },
  { name: "HDFC Flexi Cap Fund", nav: 258.90, change: -0.71, changePct: -0.27, prevNav: 259.61, category: "Flexi Cap", status: "down" },
  { name: "Mirae Asset ELSS", nav: 120.35, change: 0.15, changePct: 0.12, prevNav: 120.20, category: "ELSS", status: "up" },
];

const marketStatus = {
  isOpen: true,
  lastUpdated: "3:15 PM",
  nextUpdate: "3:30 PM",
  marketChange: 1.24
};

export default function LiveNavPage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const totalDayChange = liveFunds.reduce((sum, f) => sum + (f.change * f.nav / 100), 0);
  const portfolioValue = liveFunds.reduce((sum, f) => {
    const units = f.name.includes("Gold") ? 998.15 : f.name.includes("Parag") ? 1574.32 : f.name.includes("Nippon") ? 1479.12 : 1000;
    return sum + (f.nav * units);
  }, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FolioIQ</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                  <item.icon className="w-4 h-4" />{item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Live NAV Tracker</h1>
            <p className="text-slate-600">Real-time fund prices and day&apos;s performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              marketStatus.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {marketStatus.isOpen ? 'Market Open' : 'Market Closed'}
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>

        {/* Portfolio Snapshot */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Live Portfolio Value</p>
            <p className="text-3xl font-bold text-slate-900">₹{(portfolioValue / 100000).toFixed(1)}L</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600">+{marketStatus.marketChange}% today</span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Day&apos;s Gain/Loss</p>
            <p className={`text-3xl font-bold ${totalDayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalDayChange >= 0 ? '+' : ''}₹{Math.abs(totalDayChange).toFixed(0)}
            </p>
            <p className="text-xs text-slate-400 mt-2">Across {liveFunds.length} funds</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500 mb-1">Last Updated</p>
            <p className="text-3xl font-bold text-slate-900">{marketStatus.lastUpdated}</p>
            <p className="text-xs text-slate-400 mt-2">Next: {marketStatus.nextUpdate}</p>
          </div>
        </div>

        {/* Fund Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Fund NAVs</h3>
            <span className="text-xs text-slate-500">Auto-refreshes every 30s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500">Fund</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500">Category</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">NAV</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Day Change</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Change %</th>
                  <th className="text-center py-3 px-6 text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {liveFunds.map((fund) => (
                  <tr key={fund.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-900">{fund.name}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">{fund.category}</td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-semibold text-slate-900">₹{fund.nav.toFixed(2)}</p>
                      <p className="text-xs text-slate-400">Prev: ₹{fund.prevNav.toFixed(2)}</p>
                    </td>
                    <td className={`py-4 px-6 text-right font-semibold ${fund.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fund.change >= 0 ? '+' : ''}{fund.change.toFixed(2)}
                    </td>
                    <td className={`py-4 px-6 text-right font-semibold ${fund.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fund.change >= 0 ? '+' : ''}{fund.changePct.toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        fund.status === "up" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {fund.status === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {fund.status === "up" ? 'Rising' : 'Falling'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Note */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">Market Hours</p>
            <p className="text-xs text-amber-700">NAVs update between 9:15 AM and 3:30 PM IST on trading days. After market close, the last available NAV is displayed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
