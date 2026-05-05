"use client";

import { useState } from "react";
import { MessageSquare,  
  Brain, AlertTriangle, TrendingUp, Shield, 
  Target, Zap, ChevronRight, Home, 
  LayoutDashboard, Upload, Search, User, Sparkles,
  PieChart, Activity, DollarSign, AlertCircle, CheckCircle,
  XCircle, Info, ArrowRight, RefreshCw, Lightbulb
} from "lucide-react";
import Link from "next/link";

// Portfolio data based on actual portfolio
const portfolioFunds = [
  { name: "Invesco India Gold ETF FoF", category: "Gold", value: 723776, returns: 34.69, risk: "Moderate", sharpe: 1.8, alpha: 8.2, rating: "Buy", health: 92, expense: 0.15, aum: "₹450 Cr", sip: 5500 },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", value: 633035, returns: 16.81, risk: "Moderate-High", sharpe: 1.2, alpha: 3.1, rating: "Buy", health: 88, expense: 0.94, aum: "₹45,000 Cr", sip: 5000 },
  { name: "Nippon India Small Cap", category: "Small Cap", value: 522494, returns: 16.47, risk: "High", sharpe: 1.1, alpha: 2.8, rating: "Hold", health: 75, expense: 0.82, aum: "₹32,000 Cr", sip: 10000 },
  { name: "Kotak Arbitrage Fund", category: "Arbitrage", value: 454999, returns: 6.68, risk: "Low", sharpe: 0.8, alpha: 0.5, rating: "Hold", health: 65, expense: 0.42, aum: "₹12,000 Cr", sip: 0 },
  { name: "PGIM India Flexi Cap", category: "Flexi Cap", value: 361021, returns: 4.06, risk: "Moderate-High", sharpe: 0.4, alpha: -2.1, rating: "Sell", health: 42, expense: 0.89, aum: "₹8,500 Cr", sip: 10000 },
  { name: "Invesco India Arbitrage", category: "Arbitrage", value: 341109, returns: 6.65, risk: "Low", sharpe: 0.8, alpha: 0.4, rating: "Hold", health: 68, expense: 0.38, aum: "₹6,200 Cr", sip: 0 },
  { name: "ICICI Pru ELSS Tax Saver", category: "ELSS", value: 277737, returns: 12.89, risk: "Moderate-High", sharpe: 0.9, alpha: 1.2, rating: "Buy", health: 78, expense: 1.15, aum: "₹15,000 Cr", sip: 0 },
  { name: "HDFC Flexi Cap Fund", category: "Flexi Cap", value: 263243, returns: 4.80, risk: "Moderate-High", sharpe: 0.5, alpha: -1.5, rating: "Sell", health: 45, expense: 0.95, aum: "₹22,000 Cr", sip: 10000 },
  { name: "Invesco India Infrastructure", category: "Sectoral", value: 249813, returns: 3.99, risk: "High", sharpe: 0.3, alpha: -3.2, rating: "Sell", health: 38, expense: 1.05, aum: "₹3,800 Cr", sip: 10000 },
  { name: "Axis Multicap Fund", category: "Multi Cap", value: 215804, returns: 21.21, risk: "Moderate-High", sharpe: 1.5, alpha: 6.8, rating: "Buy", health: 90, expense: 0.87, aum: "₹9,500 Cr", sip: 0 },
  { name: "ICICI Pru Technology", category: "Sectoral", value: 206017, returns: -14.15, risk: "Very High", sharpe: -0.5, alpha: -8.5, rating: "Sell", health: 25, expense: 1.25, aum: "₹11,000 Cr", sip: 10000 },
  { name: "Mirae Asset ELSS", category: "ELSS", value: 188622, returns: 11.65, risk: "Moderate-High", sharpe: 0.8, alpha: 0.9, rating: "Hold", health: 72, expense: 0.72, aum: "₹18,000 Cr", sip: 6000 },
  { name: "Axis ELSS Tax Saver", category: "ELSS", value: 155247, returns: 11.76, risk: "Moderate-High", sharpe: 0.85, alpha: 1.1, rating: "Buy", health: 76, expense: 0.68, aum: "₹28,000 Cr", sip: 0 },
  { name: "Mirae Asset Large & Midcap", category: "Large & Mid", value: 122893, returns: 2.34, risk: "Moderate-High", sharpe: 0.3, alpha: -1.8, rating: "Sell", health: 48, expense: 0.75, aum: "₹14,000 Cr", sip: 5000 },
  { name: "Invesco India Smallcap", category: "Small Cap", value: 111086, returns: 2.09, risk: "High", sharpe: 0.2, alpha: -2.5, rating: "Sell", health: 40, expense: 0.95, aum: "₹5,200 Cr", sip: 5000 },
  { name: "Nippon India Multi Cap", category: "Multi Cap", value: 109670, returns: -0.62, risk: "Moderate-High", sharpe: 0.0, alpha: -3.8, rating: "Sell", health: 35, expense: 0.88, aum: "₹7,800 Cr", sip: 10000 },
  { name: "Canara Robeco ELSS", category: "ELSS", value: 89892, returns: 11.85, risk: "Moderate-High", sharpe: 0.82, alpha: 1.0, rating: "Hold", health: 74, expense: 0.65, aum: "₹6,500 Cr", sip: 10000 },
];

// Alternate fund recommendations for Sell-rated funds
const alternateFunds: Record<string, Array<{name: string, category: string, returns1Y: string, reason: string, risk: string}>> = {
  "PGIM India Flexi Cap": [
    { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", returns1Y: "16.81%", reason: "Same category, top quartile returns, lower expense", risk: "Moderate-High" },
    { name: "Canara Robeco Equity Diversified", category: "Flexi Cap", returns1Y: "14.2%", reason: "Consistent performer, better Sharpe ratio", risk: "Moderate-High" }
  ],
  "HDFC Flexi Cap Fund": [
    { name: "Axis Flexi Cap Fund", category: "Flexi Cap", returns1Y: "13.5%", reason: "Better alpha generation, lower expense ratio", risk: "Moderate-High" },
    { name: "Mirae Asset Flexi Cap", category: "Flexi Cap", returns1Y: "12.8%", reason: "Strong fund house track record", risk: "Moderate-High" }
  ],
  "Invesco India Infrastructure": [
    { name: "Tata Infrastructure Fund", category: "Sectoral", returns1Y: "8.5%", reason: "Better infrastructure sector exposure", risk: "High" },
    { name: "L&T Infrastructure Fund", category: "Sectoral", returns1Y: "7.2%", reason: "More diversified infrastructure play", risk: "High" }
  ],
  "ICICI Pru Technology": [
    { name: "SBI Technology Opportunities", category: "Sectoral", returns1Y: "9.5%", reason: "Better tech sector fund, recovering faster", risk: "Very High" },
    { name: "Tata Digital India Fund", category: "Sectoral", returns1Y: "8.1%", reason: "Digital India theme, broader tech exposure", risk: "Very High" }
  ],
  "Mirae Asset Large & Midcap": [
    { name: "Canara Robeco Large & Midcap", category: "Large & Mid", returns1Y: "11.2%", reason: "Consistent outperformer in category", risk: "Moderate-High" },
    { name: "Kotak Equity Opportunities", category: "Large & Mid", returns1Y: "10.5%", reason: "Better risk-adjusted returns", risk: "Moderate-High" }
  ],
  "Invesco India Smallcap": [
    { name: "Nippon India Small Cap", category: "Small Cap", returns1Y: "16.47%", reason: "Already in portfolio, top performer", risk: "High" },
    { name: "Axis Small Cap Fund", category: "Small Cap", returns1Y: "15.2%", reason: "Better downside protection", risk: "High" }
  ],
  "Nippon India Multi Cap": [
    { name: "Axis Multicap Fund", category: "Multi Cap", returns1Y: "21.21%", reason: "Already in portfolio, best in category", risk: "Moderate-High" },
    { name: "Kotak Multicap Fund", category: "Multi Cap", returns1Y: "13.8%", reason: "Balanced large-mid-small allocation", risk: "Moderate-High" }
  ]
};

const totalValue = portfolioFunds.reduce((sum, f) => sum + f.value, 0);
const avgReturns = portfolioFunds.reduce((sum, f) => sum + (f.returns * f.value), 0) / totalValue;
const weightedSharpe = portfolioFunds.reduce((sum, f) => sum + (f.sharpe * f.value), 0) / totalValue;
const weightedHealth = portfolioFunds.reduce((sum, f) => sum + (f.health * f.value), 0) / totalValue;

const categoryAlloc = portfolioFunds.reduce((acc, f) => {
  acc[f.category] = (acc[f.category] || 0) + f.value;
  return acc;
}, {} as Record<string, number>);

const riskCounts = portfolioFunds.reduce((acc, f) => {
  const risk = f.risk.includes("Very High") ? "Very High" : f.risk.includes("High") ? "High" : f.risk.includes("Moderate") ? "Moderate" : "Low";
  acc[risk] = (acc[risk] || 0) + f.value;
  return acc;
}, {} as Record<string, number>);

const sellFunds = portfolioFunds.filter(f => f.rating === "Sell");
const totalSellValue = sellFunds.reduce((sum, f) => sum + f.value, 0);

export default function IntelligencePage() {
  const [selectedFund, setSelectedFund] = useState<typeof portfolioFunds[0] | null>(null);
  const [showRebalance, setShowRebalance] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain, active: true },
  ];

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRatingIcon = (rating: string) => {
    if (rating === "Buy") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (rating === "Sell") return <XCircle className="w-5 h-5 text-red-600" />;
    return <Info className="w-5 h-5 text-yellow-600" />;
  };

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
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">AI Portfolio Intelligence</h1>
          </div>
          <p className="text-slate-600">Smart insights powered by quantitative analysis</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Overall</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{Math.round(weightedHealth)}</span>
              <span className="text-sm text-slate-500 mb-1">/100</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Portfolio Health Score</p>
            <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${weightedHealth >= 80 ? 'bg-green-500' : weightedHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${weightedHealth}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-slate-500">Weighted Avg</span>
            </div>
            <span className="text-3xl font-bold text-green-600">{avgReturns.toFixed(1)}%</span>
            <p className="text-sm text-slate-600 mt-1">Portfolio Returns</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium text-slate-500">Risk-Adjusted</span>
            </div>
            <span className="text-3xl font-bold text-purple-600">{weightedSharpe.toFixed(2)}</span>
            <p className="text-sm text-slate-600 mt-1">Sharpe Ratio</p>
          </div>

          <Link href="/tax-harvesting" className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-medium text-slate-500">Potential</span>
            </div>
            <span className="text-3xl font-bold text-orange-600">₹28,400</span>
            <p className="text-sm text-slate-600 mt-1">Tax Savings Available →</p>
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Smart Alerts & Recommendations</h2>
            </div>
            <button 
              onClick={() => setShowRebalance(!showRebalance)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {showRebalance ? "Hide Rebalance Plan" : "View Rebalance Plan"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">High Sector Concentration</h3>
                  <p className="text-sm text-slate-600 mb-3">34% of portfolio in Flexi Cap funds. Consider diversifying into Large Cap or Debt.</p>
                  <button 
                    onClick={() => setActiveTab("allocation")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View Allocation →
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 mt-0.5 text-red-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">{sellFunds.length} Underperforming Funds</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {sellFunds.map(f => f.name.split(" ").slice(0, 3).join(" ")).join(", ")} are lagging benchmarks.
                  </p>
                  <button 
                    onClick={() => { setActiveTab("overview"); setShowRebalance(true); }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Review Funds →
                  </button>
                </div>
              </div>
            </div>

            <Link href="/tax-harvesting" className="p-4 rounded-lg border bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 mt-0.5 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">Tax Loss Harvesting Opportunity</h3>
                  <p className="text-sm text-slate-600 mb-3">You can save ~₹28,000 in taxes by harvesting losses from ICICI Tech and Invesco Infra.</p>
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Calculate Savings →
                  </span>
                </div>
              </div>
            </Link>

            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">Strong Gold Allocation</h3>
                  <p className="text-sm text-slate-600 mb-3">Invesco Gold ETF is outperforming with 34.69% returns. Good hedge against equity volatility.</p>
                  <button 
                    onClick={() => setSelectedFund(portfolioFunds[0])}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Analyze →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rebalance Plan Section */}
        {showRebalance && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">AI Rebalance Plan</h2>
              <span className="text-sm text-slate-500">Sell {sellFunds.length} funds → Reallocate ₹{(totalSellValue/100000).toFixed(1)}L</span>
            </div>

            <div className="space-y-6">
              {sellFunds.map((fund) => (
                <div key={fund.name} className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                        <p className="text-sm text-slate-500">{fund.category} • Current Value: ₹{(fund.value/100000).toFixed(1)}L • Returns: {fund.returns}%</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Exit</span>
                  </div>

                  <div className="ml-9">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Replace with:</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(alternateFunds[fund.name] || []).map((alt) => (
                        <div key={alt.name} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900">{alt.name}</h4>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">{alt.returns1Y}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{alt.category} • {alt.risk}</p>
                          <div className="flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <p className="text-xs text-slate-500">{alt.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Recommended Allocation for Sold Amount</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-500 mb-1">Large Cap / Index</p>
                    <p className="text-lg font-bold text-slate-900">₹{(totalSellValue * 0.35 / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-slate-500 mt-1">35% of exit value</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-500 mb-1">Debt / Arbitrage</p>
                    <p className="text-lg font-bold text-slate-900">₹{(totalSellValue * 0.25 / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-slate-500 mt-1">25% for stability</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-slate-500 mb-1">Multi / Flexi Cap</p>
                    <p className="text-lg font-bold text-slate-900">₹{(totalSellValue * 0.40 / 100000).toFixed(1)}L</p>
                    <p className="text-xs text-slate-500 mt-1">40% in quality funds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 mb-8">
          <div className="flex border-b border-slate-100">
            {[
              { id: "overview", label: "Fund Analysis", icon: PieChart },
              { id: "allocation", label: "Allocation", icon: Target },
              { id: "risk", label: "Risk Analysis", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Individual Fund Health</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Buy</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Hold</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> Sell</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {portfolioFunds.map((fund) => (
                    <div 
                      key={fund.name}
                      onClick={() => setSelectedFund(fund)}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getRatingIcon(fund.rating)}
                        <div>
                          <h4 className="font-medium text-slate-900">{fund.name}</h4>
                          <p className="text-sm text-slate-500">{fund.category} • {fund.aum}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`font-semibold ${fund.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {fund.returns >= 0 ? '+' : ''}{fund.returns}%
                          </p>
                          <p className="text-xs text-slate-500">Returns</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{(fund.value / 100000).toFixed(1)}L</p>
                          <p className="text-xs text-slate-500">Value</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getHealthColor(fund.health)}`}>
                          {fund.health}/100
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          fund.rating === "Buy" ? "bg-green-100 text-green-700" :
                          fund.rating === "Sell" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {fund.rating}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "allocation" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Category Allocation</h3>
                  <div className="space-y-3">
                    {Object.entries(categoryAlloc).sort((a, b) => b[1] - a[1]).map(([category, value]) => {
                      const pct = ((value / totalValue) * 100).toFixed(1);
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-32 text-sm font-medium text-slate-700">{category}</div>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm font-semibold text-slate-900">{pct}%</span>
                            <span className="text-xs text-slate-500 ml-1">({(value/100000).toFixed(1)}L)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Risk Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(riskCounts).sort((a, b) => b[1] - a[1]).map(([risk, value]) => {
                      const pct = ((value / totalValue) * 100).toFixed(1);
                      return (
                        <div key={risk} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-32 text-sm font-medium text-slate-700">{risk}</div>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  risk === "Low" ? "bg-green-500" :
                                  risk === "Moderate" ? "bg-yellow-500" :
                                  risk === "High" ? "bg-orange-500" :
                                  "bg-red-500"
                                }`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm font-semibold text-slate-900">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "risk" && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h4 className="font-semibold text-red-800 mb-2">High Risk Exposure</h4>
                    <p className="text-2xl font-bold text-red-600">{(riskCounts["High"] / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-red-600 mt-1">{((riskCounts["High"] || 0) / totalValue * 100).toFixed(1)}% of portfolio</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h4 className="font-semibold text-amber-800 mb-2">Concentration Risk</h4>
                    <p className="text-2xl font-bold text-amber-600">34%</p>
                    <p className="text-sm text-amber-600 mt-1">in Flexi Cap category</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Underperformers</h4>
                    <p className="text-2xl font-bold text-blue-600">{sellFunds.length} Funds</p>
                    <p className="text-sm text-blue-600 mt-1">Below benchmark returns</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-4">Risk Mitigation Suggestions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Reduce Small Cap exposure</p>
                        <p className="text-sm text-slate-600">Current: {((categoryAlloc["Small Cap"] || 0) / totalValue * 100).toFixed(1)}% → Recommended: &lt;8% for moderate risk profile</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Add Debt allocation</p>
                        <p className="text-sm text-slate-600">Missing debt funds. Add 15-20% for stability.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">Exit underperformers</p>
                        <p className="text-sm text-slate-600">Consider selling {sellFunds.slice(0, 3).map(f => f.name.split(" ").slice(0, 2).join(" ")).join(", ")} and others</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fund Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedFund(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedFund.name}</h3>
                <p className="text-sm text-slate-500">{selectedFund.category}</p>
              </div>
              <button onClick={() => setSelectedFund(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                <span className="text-slate-500 text-xl">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">Health Score</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedFund.health}/100</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-1">AI Rating</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    selectedFund.rating === "Buy" ? "bg-green-100 text-green-700" :
                    selectedFund.rating === "Sell" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {selectedFund.rating}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Current Value</span>
                  <span className="font-semibold text-slate-900">₹{(selectedFund.value/100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Returns</span>
                  <span className={`font-semibold ${selectedFund.returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedFund.returns >= 0 ? '+' : ''}{selectedFund.returns}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Sharpe Ratio</span>
                  <span className="font-semibold text-slate-900">{selectedFund.sharpe}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Alpha</span>
                  <span className={`font-semibold ${selectedFund.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedFund.alpha >= 0 ? '+' : ''}{selectedFund.alpha}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Expense Ratio</span>
                  <span className="font-semibold text-slate-900">{selectedFund.expense}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">AUM</span>
                  <span className="font-semibold text-slate-900">{selectedFund.aum}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Monthly SIP</span>
                  <span className="font-semibold text-slate-900">{selectedFund.sip > 0 ? `₹${selectedFund.sip.toLocaleString()}` : 'No SIP'}</span>
                </div>
              </div>

              {/* Alternate Funds for Sell-rated */}
              {selectedFund.rating === "Sell" && alternateFunds[selectedFund.name] && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Suggested Replacements
                  </h4>
                  <div className="space-y-2">
                    {alternateFunds[selectedFund.name].map((alt) => (
                      <div key={alt.name} className="bg-white rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">{alt.name}</span>
                          <span className="text-sm font-semibold text-green-600">{alt.returns1Y}</span>
                        </div>
                        <p className="text-xs text-slate-500">{alt.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">AI Recommendation</h4>
                <p className="text-sm text-slate-600">
                  {selectedFund.rating === "Buy" ? "Strong fundamentals with positive alpha. Consider increasing allocation." :
                   selectedFund.rating === "Sell" ? "Underperforming benchmark with negative alpha. Consider exiting position and switching to suggested alternatives above." :
                   "Stable performer. Maintain current allocation."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  {selectedFund.rating === "Buy" ? "Increase SIP" : selectedFund.rating === "Sell" ? "Exit Fund" : "Keep SIP"}
                </button>
                <button 
                  onClick={() => setSelectedFund(null)}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


