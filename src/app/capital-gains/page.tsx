"use client";

import { useState } from "react";
import { 
  FileText, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  Download, Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Info, DollarSign
} from "lucide-react";
import Link from "next/link";

const fyYear = "2025-26";

const stcgData = [
  { fund: "ICICI Pru Technology", category: "Sectoral", buyDate: "2024-11-15", sellDate: "2026-03-20", buyNav: 275.50, sellNav: 237.08, units: 421.78, invested: 116200, proceeds: 100000, gain: -16200, tax: 0, type: "STCL" },
  { fund: "Nippon India Multi Cap", category: "Multi Cap", buyDate: "2024-09-10", sellDate: "2026-03-20", buyNav: 110.50, sellNav: 109.00, units: 909.50, invested: 100500, proceeds: 99135, gain: -1365, tax: 0, type: "STCL" },
  { fund: "Invesco India Smallcap", category: "Small Cap", buyDate: "2024-12-05", sellDate: "2026-03-20", buyNav: 108.00, sellNav: 110.00, units: 462.96, invested: 50000, proceeds: 50926, gain: 926, tax: 138, type: "STCG" },
  { fund: "Mirae Asset Large & Midcap", category: "Large & Mid", buyDate: "2024-10-20", sellDate: "2026-03-20", buyNav: 118.00, sellNav: 120.00, units: 423.73, invested: 50000, proceeds: 50847, gain: 847, tax: 127, type: "STCG" },
];

const ltcgData = [
  { fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", buyDate: "2021-03-15", sellDate: "2026-03-20", buyNav: 280.00, sellNav: 401.61, units: 178.57, invested: 50000, proceeds: 71715, gain: 21715, taxable: 0, tax: 0, type: "LTCG" },
  { fund: "Nippon India Small Cap", category: "Small Cap", buyDate: "2020-08-10", sellDate: "2026-03-20", buyNav: 185.00, sellNav: 353.11, units: 270.27, invested: 50000, proceeds: 95435, gain: 45435, taxable: 32935, tax: 3293, type: "LTCG" },
  { fund: "Invesco India Gold ETF FoF", category: "Gold", buyDate: "2022-01-20", sellDate: "2026-03-20", buyNav: 520.00, sellNav: 724.00, units: 192.31, invested: 100000, proceeds: 139231, gain: 39231, taxable: 26731, tax: 2673, type: "LTCG" },
  { fund: "HDFC Flexi Cap Fund", category: "Flexi Cap", buyDate: "2021-06-15", sellDate: "2026-03-20", buyNav: 220.00, sellNav: 259.61, units: 227.27, invested: 50000, proceeds: 59002, gain: 9002, taxable: 0, tax: 0, type: "LTCG" },
  { fund: "PGIM India Flexi Cap", category: "Flexi Cap", buyDate: "2022-04-10", sellDate: "2026-03-20", buyNav: 310.00, sellNav: 316.50, units: 320.51, invested: 99358, proceeds: 101441, gain: 2083, taxable: 0, tax: 0, type: "LTCG" },
];

const summary = {
  stcgGains: stcgData.filter(d => d.type === "STCG").reduce((s, d) => s + d.gain, 0),
  stcgLosses: stcgData.filter(d => d.type === "STCL").reduce((s, d) => s + Math.abs(d.gain), 0),
  stcgTax: stcgData.filter(d => d.type === "STCG").reduce((s, d) => s + d.tax, 0),
  ltcgGains: ltcgData.reduce((s, d) => s + d.gain, 0),
  ltcgExemptionUsed: ltcgData.reduce((s, d) => s + d.taxable, 0),
  ltcgTax: ltcgData.reduce((s, d) => s + d.tax, 0),
  totalTax: stcgData.filter(d => d.type === "STCG").reduce((s, d) => s + d.tax, 0) + ltcgData.reduce((s, d) => s + d.tax, 0),
};

export default function CapitalGainsPage() {
  const [activeTab, setActiveTab] = useState("summary");

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
            <FileText className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-slate-900">Capital Gains Report</h1>
          </div>
          <p className="text-slate-600">Tax-ready report for FY {fyYear}. Ready for ITR filing.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-slate-500">STCG</span>
            </div>
            <p className="text-2xl font-bold text-green-600">₹{summary.stcgGains.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Short Term Gains</p>
            <p className="text-xs text-slate-400 mt-1">Tax: ₹{summary.stcgTax.toLocaleString()} (15%)</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-xs font-medium text-slate-500">STCL</span>
            </div>
            <p className="text-2xl font-bold text-red-600">₹{summary.stcgLosses.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Short Term Losses</p>
            <p className="text-xs text-slate-400 mt-1">Can offset STCG gains</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">LTCG</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">₹{summary.ltcgGains.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Long Term Gains</p>
            <p className="text-xs text-slate-400 mt-1">₹1.25L exempt, rest @ 10%</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <span className="text-xs font-medium text-slate-500">Total Tax</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{summary.totalTax.toLocaleString()}</p>
            <p className="text-sm text-slate-500">Estimated Tax Liability</p>
            <p className="text-xs text-slate-400 mt-1">Before loss harvesting</p>
          </div>
        </div>

        {/* Tax Saving Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Save ₹5,143 more with Tax Loss Harvesting!</h3>
              <p className="text-sm text-green-700">Harvest your STCL losses to reduce tax liability. You have ₹17,565 in harvestable losses.</p>
            </div>
          </div>
          <Link href="/tax-harvesting" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Harvest Now
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "summary", label: "Summary", icon: FileText },
            { id: "stcg", label: "Short Term (STCG/STCL)", icon: Calendar },
            { id: "ltcg", label: "Long Term (LTCG)", icon: Calendar },
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

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Tax Calculation Summary (FY {fyYear})</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium text-slate-900 mb-3">Short Term Capital Gains (Equity - Held &lt; 1 year)</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-slate-500">Total Gains:</span> <span className="font-semibold text-green-600">₹{summary.stcgGains.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">Total Losses:</span> <span className="font-semibold text-red-600">₹{summary.stcgLosses.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">Net Taxable:</span> <span className="font-semibold text-slate-900">₹{Math.max(0, summary.stcgGains - summary.stcgLosses).toLocaleString()}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tax @ 15% on net STCG</span>
                  <span className="text-lg font-bold text-slate-900">₹{Math.max(0, (summary.stcgGains - summary.stcgLosses) * 0.15).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <h4 className="font-medium text-slate-900 mb-3">Long Term Capital Gains (Equity - Held &gt; 1 year)</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-slate-500">Total Gains:</span> <span className="font-semibold text-green-600">₹{summary.ltcgGains.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">Exemption:</span> <span className="font-semibold text-blue-600">₹1,25,000</span></div>
                  <div><span className="text-slate-500">Taxable:</span> <span className="font-semibold text-slate-900">₹{summary.ltcgExemptionUsed.toLocaleString()}</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tax @ 10% on gains above ₹1.25L</span>
                  <span className="text-lg font-bold text-slate-900">₹{summary.ltcgTax.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-amber-900">Total Estimated Tax</h4>
                    <p className="text-sm text-amber-700">Before tax loss harvesting</p>
                  </div>
                  <span className="text-2xl font-bold text-amber-900">₹{summary.totalTax.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Download Tax Report (PDF)
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">
                <Download className="w-4 h-4" />
                Export for CA (Excel)
              </button>
            </div>
          </div>
        )}

        {/* STCG Table */}
        {activeTab === "stcg" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Short Term Transactions (Held &lt; 1 year)</h3>
              <p className="text-sm text-slate-500">Tax Rate: 15% flat on gains. Losses can offset gains.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Fund</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Buy Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Sell Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Invested</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Proceeds</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Gain/Loss</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Tax</th>
                  </tr>
                </thead>
                <tbody>
                  {stcgData.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">{d.fund}</p>
                        <p className="text-xs text-slate-500">{d.category}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(d.buyDate).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(d.sellDate).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600">₹{d.invested.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm text-slate-600">₹{d.proceeds.toLocaleString()}</td>
                      <td className={`py-3 px-4 text-right text-sm font-semibold ${d.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.gain >= 0 ? '+' : ''}₹{d.gain.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900">₹{d.tax.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LTCG Table */}
        {activeTab === "ltcg" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Long Term Transactions (Held &gt; 1 year)</h3>
              <p className="text-sm text-slate-500">First ₹1.25L exempt. Remaining taxed @ 10%.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Fund</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Buy Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Sell Date</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Gain</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Exempt</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Taxable</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Tax @ 10%</th>
                  </tr>
                </thead>
                <tbody>
                  {ltcgData.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900">{d.fund}</p>
                        <p className="text-xs text-slate-500">{d.category}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(d.buyDate).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(d.sellDate).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">+₹{d.gain.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm text-blue-600">₹{Math.max(0, 125000 - (i > 0 ? ltcgData.slice(0, i).reduce((s, x) => s + x.gain, 0) : 0)).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900">₹{d.taxable.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900">₹{d.tax.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-600">
                <strong>Disclaimer:</strong> This report is generated for informational purposes based on your portfolio data. 
                Tax calculations assume standard rates. Actual tax liability may vary based on your total income, other capital gains, and applicable deductions. 
                Please verify with a Chartered Accountant before filing your ITR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

