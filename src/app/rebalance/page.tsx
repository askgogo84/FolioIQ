"use client";

import { useState } from "react";
import { MessageSquare,  
  RefreshCw, CheckCircle, ArrowRight, Home, LayoutDashboard, Upload, 
  Search, User, Sparkles, Brain, TrendingUp, Shield, Target, 
  PieChart, AlertTriangle, DollarSign, ChevronRight, Zap, X
} from "lucide-react";
import Link from "next/link";

const currentAllocation = [
  { category: "Flexi Cap", current: 34.2, target: 20, color: "bg-blue-500", value: 1892282 },
  { category: "Small Cap", current: 12.3, target: 8, color: "bg-orange-500", value: 680580 },
  { category: "ELSS", current: 18.5, target: 15, color: "bg-green-500", value: 1023251 },
  { category: "Arbitrage", current: 14.3, target: 15, color: "bg-purple-500", value: 796108 },
  { category: "Sectoral", current: 12.8, target: 5, color: "bg-red-500", value: 707843 },
  { category: "Gold", current: 7.9, target: 10, color: "bg-yellow-500", value: 723776 },
  { category: "Debt", current: 0, target: 12, color: "bg-slate-500", value: 0 },
  { category: "Large Cap", current: 0, target: 15, color: "bg-indigo-500", value: 0 },
];

const rebalanceActions = [
  { action: "SELL", fund: "ICICI Pru Technology", value: 206017, reason: "Sectoral overexposure, -14.15% returns", category: "Sectoral" },
  { action: "SELL", fund: "Invesco India Infrastructure", value: 249813, reason: "Underperforming sectoral fund", category: "Sectoral" },
  { action: "SELL", fund: "PGIM India Flexi Cap", value: 361021, reason: "Negative alpha, poor Sharpe ratio", category: "Flexi Cap" },
  { action: "SELL", fund: "HDFC Flexi Cap Fund", value: 263243, reason: "Underperforming vs category average", category: "Flexi Cap" },
  { action: "SELL", fund: "Mirae Asset Large & Midcap", value: 122893, reason: "Low returns, better alternatives exist", category: "Large & Mid" },
  { action: "SELL", fund: "Invesco India Smallcap", value: 111086, reason: "Better small cap funds available", category: "Small Cap" },
  { action: "SELL", fund: "Nippon India Multi Cap", value: 109670, reason: "Negative returns, poor fund manager", category: "Multi Cap" },
  { action: "REDUCE", fund: "Nippon India Small Cap", value: 200000, reason: "Reduce to 8% target allocation", category: "Small Cap" },
];

const buyActions = [
  { action: "BUY", fund: "Nippon India Index Fund (Nifty 50)", value: 500000, reason: "Low-cost index exposure, 0.2% expense", category: "Large Cap" },
  { action: "BUY", fund: "SBI Magnum Gilt Fund", value: 400000, reason: "Government debt for stability, 7.5% yield", category: "Debt" },
  { action: "BUY", fund: "Invesco India Gold ETF", value: 150000, reason: "Increase gold hedge to 10%", category: "Gold" },
  { action: "BUY", fund: "Canara Robeco Equity Tax Saver", value: 100000, reason: "Top ELSS fund, better than current ELSS", category: "ELSS" },
  { action: "INCREASE_SIP", fund: "Parag Parikh Flexi Cap", amount: 5000, reason: "Best performing flexi cap, increase SIP", category: "Flexi Cap" },
  { action: "INCREASE_SIP", fund: "Axis Multicap Fund", amount: 3000, reason: "Strong performer, add more via SIP", category: "Multi Cap" },
];

export default function RebalancePage() {
  const [applied, setApplied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);

  const totalSell = rebalanceActions.filter(a => a.action === "SELL").reduce((s, a) => s + a.value, 0);
  const totalBuy = buyActions.filter(a => a.action === "BUY").reduce((s, a) => s + a.value, 0);

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
        <div className="mb-8">
          <Link href="/intelligence" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 text-sm">
            <ArrowRight className="w-4 h-4 rotate-180" />Back to AI Insights
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Smart Rebalancing Engine</h1>
          </div>
          <p className="text-slate-600">One-click portfolio optimization based on AI analysis</p>
        </div>

        {!applied ? (
          <>
            {/* Before/After Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-slate-500" />
                  <h2 className="font-semibold text-slate-900">Current Allocation</h2>
                  <span className="ml-auto px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Suboptimal</span>
                </div>
                <div className="space-y-3">
                  {currentAllocation.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{cat.category}</span>
                        <span className="text-slate-500">{cat.current}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${Math.min(cat.current * 2, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold text-slate-900">68</p><p className="text-xs text-slate-500">Health Score</p></div>
                  <div><p className="text-lg font-bold text-slate-900">10.2%</p><p className="text-xs text-slate-500">Exp. Returns</p></div>
                  <div><p className="text-lg font-bold text-red-600">High</p><p className="text-xs text-slate-500">Risk Level</p></div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-6 relative overflow-hidden">
                <div className="absolute top-3 right-3 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">AI OPTIMIZED</div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-slate-900">Target Allocation</h2>
                  <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Optimal</span>
                </div>
                <div className="space-y-3">
                  {currentAllocation.map(cat => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{cat.category}</span>
                        <span className="text-slate-500">{cat.target}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.target * 2}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold text-green-600">85</p><p className="text-xs text-slate-500">Health Score</p></div>
                  <div><p className="text-lg font-bold text-green-600">13.8%</p><p className="text-xs text-slate-500">Exp. Returns</p></div>
                  <div><p className="text-lg font-bold text-green-600">Moderate</p><p className="text-xs text-slate-500">Risk Level</p></div>
                </div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">+3.6%</p>
                <p className="text-sm text-slate-600">Higher Expected Returns</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">-17 pts</p>
                <p className="text-sm text-slate-600">Risk Reduction</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
                <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">-0.35%</p>
                <p className="text-sm text-slate-600">Lower Avg Expense</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-600">+17</p>
                <p className="text-sm text-slate-600">Health Score Gain</p>
              </div>
            </div>

            {/* Rebalance Steps */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Rebalancing Actions</h2>
              
              <div className="space-y-6">
                {/* Step 1: Sell */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">1</div>
                    <h3 className="font-semibold text-slate-900">Sell / Reduce ({rebalanceActions.length} actions)</h3>
                    <span className="ml-auto text-sm font-semibold text-red-600">₹{(totalSell/100000).toFixed(1)}L</span>
                  </div>
                  <div className="space-y-2 ml-8">
                    {rebalanceActions.map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${action.action === "SELL" ? "bg-red-200 text-red-700" : "bg-orange-200 text-orange-700"}`}>
                            {action.action}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{action.fund}</p>
                            <p className="text-xs text-slate-500">{action.reason}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">₹{(action.value/100000).toFixed(1)}L</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Buy */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">2</div>
                    <h3 className="font-semibold text-slate-900">Buy / Increase ({buyActions.length} actions)</h3>
                    <span className="ml-auto text-sm font-semibold text-green-600">₹{(totalBuy/100000).toFixed(1)}L</span>
                  </div>
                  <div className="space-y-2 ml-8">
                    {buyActions.map((action, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${action.action === "BUY" ? "bg-green-200 text-green-700" : "bg-blue-200 text-blue-700"}`}>
                            {action.action === "INCREASE_SIP" ? "SIP +" : "BUY"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{action.fund}</p>
                            <p className="text-xs text-slate-500">{action.reason}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {action.action === "INCREASE_SIP" ? `+₹${action.amount.toLocaleString()}/mo` : `₹${(action.value!/100000).toFixed(1)}L`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Fix My Portfolio
              </button>
              <Link href="/tax-harvesting" className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                <DollarSign className="w-5 h-5" />
                Save Tax First
              </Link>
            </div>
          </>
        ) : (
          /* Applied State */
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Rebalance Plan Generated!</h2>
            <p className="text-slate-600 mb-8">Your optimized portfolio is ready. Expected improvements:</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-3xl font-bold text-green-600">85</p>
                <p className="text-sm text-slate-500">New Health Score</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-3xl font-bold text-blue-600">13.8%</p>
                <p className="text-sm text-slate-500">Expected Returns</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-3xl font-bold text-purple-600">Moderate</p>
                <p className="text-sm text-slate-500">Risk Level</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                View Updated Dashboard
              </Link>
              <button onClick={() => setApplied(false)} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                Modify Plan
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">Confirm Rebalance</h3>
                <button onClick={() => setShowConfirm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <p className="text-slate-600 mb-6">
                This will generate a rebalancing plan involving <strong>{rebalanceActions.length} sell</strong> and <strong>{buyActions.length} buy</strong> actions. 
                You can execute these through your broker.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> This is a recommendation only. Please consult your financial advisor before making changes. Exit loads and tax implications apply.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowConfirm(false); setApplied(true); }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Generate Plan
                </button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


