"use client";

import { useState, useMemo } from "react";
import { 
  Calculator, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  TrendingUp, PiggyBank, ArrowRight, Target, ChevronRight, Info
} from "lucide-react";
import Link from "next/link";

export default function CalculatorPage() {
  const [monthlySIP, setMonthlySIP] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUp, setStepUp] = useState(10);
  const [showStepUp, setShowStepUp] = useState(true);

  const results = useMemo(() => {
    let totalInvested = 0;
    let corpus = 0;
    let yearlyData = [];
    let currentSIP = monthlySIP;

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        totalInvested += currentSIP;
        corpus = (corpus + currentSIP) * (1 + returnRate / 100 / 12);
      }
      yearlyData.push({
        year,
        invested: totalInvested,
        corpus: Math.round(corpus),
        sip: currentSIP
      });
      if (showStepUp) {
        currentSIP = Math.round(currentSIP * (1 + stepUp / 100));
      }
    }

    return {
      totalInvested: Math.round(totalInvested),
      finalCorpus: Math.round(corpus),
      wealthGained: Math.round(corpus - totalInvested),
      yearlyData
    };
  }, [monthlySIP, returnRate, years, stepUp, showStepUp]);

  // Without step-up for comparison
  const withoutStepUp = useMemo(() => {
    let totalInvested = 0;
    let corpus = 0;
    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        totalInvested += monthlySIP;
        corpus = (corpus + monthlySIP) * (1 + returnRate / 100 / 12);
      }
    }
    return Math.round(corpus);
  }, [monthlySIP, returnRate, years]);

  const formatCurrency = (num: number) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString()}`;
  };

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
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-slate-900">SIP Calculator</h1>
          </div>
          <p className="text-slate-600">Plan your wealth creation with step-up SIP projections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <h2 className="font-semibold text-slate-900">Investment Details</h2>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Monthly SIP</label>
                  <span className="text-sm font-semibold text-blue-600">₹{monthlySIP.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={monthlySIP}
                  onChange={(e) => setMonthlySIP(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>₹500</span>
                  <span>₹1L</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Expected Return</label>
                  <span className="text-sm font-semibold text-blue-600">{returnRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="20"
                  step="0.5"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>6%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Time Period</label>
                  <span className="text-sm font-semibold text-blue-600">{years} years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 yr</span>
                  <span>30 yrs</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStepUp(!showStepUp)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${showStepUp ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showStepUp ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-slate-700">Annual Step-up</span>
              </div>

              {showStepUp && (
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Step-up Rate</label>
                    <span className="text-sm font-semibold text-blue-600">{stepUp}% / year</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={stepUp}
                    onChange={(e) => setStepUp(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>20%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Goal Links */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                Link to Your Goals
              </h3>
              <div className="space-y-3">
                <Link href="/goals" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Child Education</p>
                    <p className="text-xs text-slate-500">Needs ₹15,000/month</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <Link href="/goals" className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Retirement</p>
                    <p className="text-xs text-slate-500">Needs ₹45,500/month</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <PiggyBank className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(results.totalInvested)}</p>
                <p className="text-sm text-slate-500">Total Invested</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{formatCurrency(results.finalCorpus)}</p>
                <p className="text-sm text-slate-500">Final Corpus</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <Calculator className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(results.wealthGained)}</p>
                <p className="text-sm text-slate-500">Wealth Gained</p>
              </div>
            </div>

            {/* Step-up Benefit */}
            {showStepUp && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Step-up SIP gives you {formatCurrency(results.finalCorpus - withoutStepUp)} more!
                  </p>
                  <p className="text-xs text-green-700">
                    Without step-up: {formatCurrency(withoutStepUp)} → With {stepUp}% step-up: {formatCurrency(results.finalCorpus)}
                  </p>
                </div>
              </div>
            )}

            {/* Year-by-Year Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Year-by-Year Growth</h3>
                <span className="text-xs text-slate-500">{years} years projection</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Year</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Monthly SIP</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Total Invested</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Corpus Value</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Wealth Gained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearlyData.map((row) => (
                      <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm font-medium text-slate-900">Year {row.year}</td>
                        <td className="py-3 px-4 text-right text-sm text-slate-600">₹{row.sip.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-sm text-slate-600">{formatCurrency(row.invested)}</td>
                        <td className="py-3 px-4 text-right text-sm font-bold text-green-600">{formatCurrency(row.corpus)}</td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-purple-600">{formatCurrency(row.corpus - row.invested)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

