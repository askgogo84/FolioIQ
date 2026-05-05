"use client";

import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Activity, Home, LayoutDashboard, Upload, 
  Search, User, Sparkles, Brain, ArrowUpRight, ArrowDownRight,
  BarChart3, Globe, Zap, Info
} from "lucide-react";
import Link from "next/link";

const indices = [
  { name: "Nifty 50", value: 24580.34, change: 1.24, changeVal: 301.45, high: 24612.80, low: 24278.90, volume: "₹12,450 Cr" },
  { name: "Sensex", value: 80845.12, change: 1.18, changeVal: 942.30, high: 80956.40, low: 79912.60, volume: "₹8,230 Cr" },
  { name: "Nifty Bank", value: 52340.15, change: -0.45, changeVal: -236.80, high: 52890.20, low: 52120.40, volume: "₹4,120 Cr" },
  { name: "Nifty IT", value: 38920.50, change: 2.15, changeVal: 820.40, high: 39120.30, low: 38100.10, volume: "₹3,890 Cr" },
  { name: "Nifty Midcap 100", value: 52340.80, change: 0.85, changeVal: 440.20, high: 52560.40, low: 51900.60, volume: "₹5,670 Cr" },
  { name: "Nifty Smallcap 100", value: 18920.45, change: 1.56, changeVal: 290.60, high: 19010.20, low: 18630.40, volume: "₹3,450 Cr" },
];

const sectors = [
  { name: "Technology", change: 2.15, topGainer: "Infosys +3.2%", topLoser: "Wipro -0.8%", sentiment: "Bullish" },
  { name: "Banking", change: -0.45, topGainer: "HDFC Bank +1.1%", topLoser: "SBI -2.3%", sentiment: "Bearish" },
  { name: "Auto", change: 1.35, topGainer: "Tata Motors +4.1%", topLoser: "M&M -0.5%", sentiment: "Bullish" },
  { name: "Pharma", change: 0.65, topGainer: "Sun Pharma +2.8%", topLoser: "Cipla -1.2%", sentiment: "Neutral" },
  { name: "FMCG", change: -0.25, topGainer: "HUL +0.9%", topLoser: "ITC -1.5%", sentiment: "Neutral" },
  { name: "Infrastructure", change: 1.85, topGainer: "L&T +3.5%", topLoser: "Adani Ports -0.3%", sentiment: "Bullish" },
  { name: "Energy", change: 0.95, topGainer: "Reliance +1.8%", topLoser: "ONGC -0.7%", sentiment: "Bullish" },
  { name: "Metals", change: -1.20, topGainer: "Tata Steel +0.5%", topLoser: "JSW Steel -2.8%", sentiment: "Bearish" },
];

const marketMood = {
  score: 68,
  label: "Greed",
  description: "Markets are optimistic. Good time for SIPs, be cautious with lump sums.",
  color: "green"
};

const topMFs = [
  { name: "Nippon India Small Cap", category: "Small Cap", returns1Y: 16.47, aum: "₹32,000 Cr", trend: "up" },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", returns1Y: 16.81, aum: "₹45,000 Cr", trend: "up" },
  { name: "SBI Technology Opportunities", category: "Sectoral", returns1Y: 9.50, aum: "₹8,500 Cr", trend: "up" },
  { name: "ICICI Pru Technology", category: "Sectoral", returns1Y: -14.15, aum: "₹11,000 Cr", trend: "down" },
  { name: "Invesco India Gold ETF FoF", category: "Gold", returns1Y: 34.69, aum: "₹450 Cr", trend: "up" },
];

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState("indices");

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Market Overview</h1>
          </div>
          <p className="text-slate-600">Live market data and sector trends to guide your investments</p>
        </div>

        {/* Market Mood Indicator */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-${marketMood.color}-100 rounded-full flex items-center justify-center`}>
                <Activity className={`w-8 h-8 text-${marketMood.color}-600`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Market Mood: <span className={`text-${marketMood.color}-600`}>{marketMood.label}</span></h2>
                <p className="text-sm text-slate-600 max-w-xl">{marketMood.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">{marketMood.score}/100</p>
              <p className="text-xs text-slate-500">Fear ← → Greed</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" style={{ width: `${marketMood.score}%` }} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "indices", label: "Market Indices", icon: BarChart3 },
            { id: "sectors", label: "Sector Trends", icon: Zap },
            { id: "funds", label: "Top Performing Funds", icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* Indices Tab */}
        {activeTab === "indices" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {indices.map((idx) => (
              <div key={idx.name} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{idx.name}</h3>
                  <span className={`flex items-center gap-1 text-sm font-semibold ${idx.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {idx.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {idx.change >= 0 ? '+' : ''}{idx.change}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-3">{idx.value.toLocaleString('en-IN')}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div><span className="text-slate-400">High:</span> {idx.high.toLocaleString('en-IN')}</div>
                  <div><span className="text-slate-400">Low:</span> {idx.low.toLocaleString('en-IN')}</div>
                  <div className="col-span-2"><span className="text-slate-400">Volume:</span> {idx.volume}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sectors Tab */}
        {activeTab === "sectors" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sector) => (
              <div key={sector.name} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{sector.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    sector.sentiment === "Bullish" ? "bg-green-100 text-green-700" :
                    sector.sentiment === "Bearish" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {sector.sentiment}
                  </span>
                </div>
                <p className={`text-2xl font-bold mb-3 ${sector.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {sector.change >= 0 ? '+' : ''}{sector.change}%
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">{sector.topGainer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">{sector.topLoser}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Funds Tab */}
        {activeTab === "funds" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Top Performing Funds (1 Year)</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {topMFs.map((fund, i) => (
                <div key={fund.name} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">{i + 1}</span>
                    <div>
                      <h4 className="font-medium text-slate-900">{fund.name}</h4>
                      <p className="text-sm text-slate-500">{fund.category} • {fund.aum}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${fund.returns1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fund.returns1Y >= 0 ? '+' : ''}{fund.returns1Y}%
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      fund.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {fund.trend === "up" ? "↗ Rising" : "↘ Falling"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What This Means Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">💡 What Should You Do Today?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>Market is in "Greed" zone (68/100):</strong> Great time to continue your SIPs, but avoid large lump sum investments right now.</li>
                <li>• <strong>IT sector is booming (+2.15%):</strong> If you hold tech funds, they're recovering. But don't chase - stick to your plan.</li>
                <li>• <strong>Banking is down (-0.45%):</strong> Good entry point for banking funds if you have a long-term horizon.</li>
                <li>• <strong>Gold is surging (+34.69% YTD):</strong> Your gold allocation is working as a hedge. Maintain 10% allocation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


