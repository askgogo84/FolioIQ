"use client";

import { useState, useMemo } from "react";
import { 
  History, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  TrendingUp, DollarSign, Calendar, ArrowRight, Info, CheckCircle
} from "lucide-react";
import Link from "next/link";

const backtestScenarios = [
  { fund: "Parag Parikh Flexi Cap", monthlySIP: 10000, startYear: 2021, years: 5, actualReturn: 12.8, finalCorpus: 824000, totalInvested: 600000, wealthGained: 224000 },
  { fund: "Nippon India Small Cap", monthlySIP: 10000, startYear: 2020, years: 6, actualReturn: 15.2, finalCorpus: 1125000, totalInvested: 720000, wealthGained: 405000 },
  { fund: "Invesco India Gold ETF", monthlySIP: 5000, startYear: 2022, years: 4, actualReturn: 11.5, finalCorpus: 312000, totalInvested: 240000, wealthGained: 72000 },
  { fund: "Axis Bluechip Fund", monthlySIP: 15000, startYear: 2019, years: 7, actualReturn: 11.2, finalCorpus: 1850000, totalInvested: 1260000, wealthGained: 590000 },
];

export default function BacktestPage() {
  const [selectedScenario, setSelectedScenario] = useState(backtestScenarios[0]);
  const [customSIP, setCustomSIP] = useState(10000);
  const [customYears, setCustomYears] = useState(5);

  const projection = useMemo(() => {
    let corpus = 0;
    const yearlyData = [];
    for (let year = 1; year <= customYears; year++) {
      for (let month = 1; month <= 12; month++) {
        corpus = (corpus + customSIP) * (1 + selectedScenario.actualReturn / 100 / 12);
      }
      yearlyData.push({
        year,
        invested: customSIP * 12 * year,
        corpus: Math.round(corpus),
        wealth: Math.round(corpus - customSIP * 12 * year)
      });
    }
    return {
      finalCorpus: Math.round(corpus),
      totalInvested: customSIP * 12 * customYears,
      wealthGained: Math.round(corpus - customSIP * 12 * customYears),
      yearlyData
    };
  }, [selectedScenario, customSIP, customYears]);

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Backtesting</h1>
          <p className="text-slate-600">See what your returns would have been with historical data</p>
        </div>

        {/* Scenario Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Select a Fund & Scenario</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {backtestScenarios.map((s) => (
              <button
                key={s.fund}
                onClick={() => setSelectedScenario(s)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedScenario.fund === s.fund 
                    ? 'border-blue-500 bg-blue-50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{s.fund}</h4>
                  {selectedScenario.fund === s.fund && <CheckCircle className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex gap-4 text-sm text-slate-500">
                  <span>SIP: ₹{s.monthlySIP.toLocaleString()}</span>
                  <span>{s.years} years</span>
                  <span className="text-green-600">+{s.actualReturn}% CAGR</span>
                </div>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Monthly SIP Amount</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={customSIP}
                  onChange={(e) => setCustomSIP(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-lg font-bold text-slate-900 w-24 text-right">₹{customSIP.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Investment Period</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={customYears}
                  onChange={(e) => setCustomYears(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-lg font-bold text-slate-900 w-24 text-right">{customYears} years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <DollarSign className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">₹{(projection.totalInvested / 100000).toFixed(1)}L</p>
            <p className="text-sm text-slate-500">Total Invested</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">₹{(projection.finalCorpus / 100000).toFixed(1)}L</p>
            <p className="text-sm text-slate-500">Final Corpus</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <History className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">₹{(projection.wealthGained / 100000).toFixed(1)}L</p>
            <p className="text-sm text-slate-500">Wealth Gained</p>
          </div>
        </div>

        {/* Year-by-Year Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Year-by-Year Projection</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-slate-500">Year</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Monthly SIP</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Total Invested</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Corpus Value</th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-slate-500">Wealth Gained</th>
                </tr>
              </thead>
              <tbody>
                {projection.yearlyData.map((row) => (
                  <tr key={row.year} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-6 font-medium text-slate-900">Year {row.year}</td>
                    <td className="py-3 px-6 text-right text-slate-600">₹{customSIP.toLocaleString()}</td>
                    <td className="py-3 px-6 text-right text-slate-600">₹{(row.invested / 100000).toFixed(1)}L</td>
                    <td className="py-3 px-6 text-right font-bold text-green-600">₹{(row.corpus / 100000).toFixed(1)}L</td>
                    <td className="py-3 px-6 text-right font-semibold text-purple-600">₹{(row.wealth / 100000).toFixed(1)}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Backtesting uses historical returns and assumes consistent SIP amounts. 
            Past performance does not guarantee future results. Market conditions, fund manager changes, and economic factors can significantly impact actual returns.
          </p>
        </div>
      </div>
    </div>
  );
}
