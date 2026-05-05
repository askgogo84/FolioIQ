"use client";

import { useState } from "react";
import { Target, MessageSquare,  
  Calculator, ArrowLeft, Home, LayoutDashboard, Upload, Search, User, Sparkles,
  Brain, TrendingDown, TrendingUp, AlertCircle, CheckCircle, DollarSign,
  Calendar, Shield, ChevronRight, Info
} from "lucide-react";
import Link from "next/link";

// Loss-making funds from portfolio
const lossFunds = [
  { 
    name: "ICICI Pru Technology", 
    currentValue: 206017, 
    investedValue: 239988, 
    loss: 33971, 
    lossPct: -14.15,
    holdingPeriod: "1.5 years",
    type: "STCG", // Short Term Capital Gain (held < 1 year for equity)
    taxRate: 15,
    taxSaved: 5095
  },
  { 
    name: "Invesco India Infrastructure", 
    currentValue: 249813, 
    investedValue: 239988, 
    loss: 0, 
    lossPct: 3.99,
    holdingPeriod: "2.1 years",
    type: "LTCG",
    taxRate: 10,
    taxSaved: 0
  },
  { 
    name: "Nippon India Multi Cap", 
    currentValue: 109670, 
    investedValue: 109994, 
    loss: 324, 
    lossPct: -0.62,
    holdingPeriod: "8 months",
    type: "STCG",
    taxRate: 15,
    taxSaved: 48
  },
  { 
    name: "Invesco India Smallcap", 
    currentValue: 111086, 
    investedValue: 109994, 
    loss: 0, 
    lossPct: 2.09,
    holdingPeriod: "1.2 years",
    type: "STCG",
    taxRate: 15,
    taxSaved: 0
  },
  { 
    name: "PGIM India Flexi Cap", 
    currentValue: 361021, 
    investedValue: 339983, 
    loss: 0, 
    lossPct: 4.06,
    holdingPeriod: "2.5 years",
    type: "LTCG",
    taxRate: 10,
    taxSaved: 0
  },
  { 
    name: "HDFC Flexi Cap Fund", 
    currentValue: 263243, 
    investedValue: 259987, 
    loss: 0, 
    lossPct: 4.80,
    holdingPeriod: "3.1 years",
    type: "LTCG",
    taxRate: 10,
    taxSaved: 0
  },
  { 
    name: "Mirae Asset Large & Midcap", 
    currentValue: 122893, 
    investedValue: 119994, 
    loss: 0, 
    lossPct: 2.34,
    holdingPeriod: "1.8 years",
    type: "STCG",
    taxRate: 15,
    taxSaved: 0
  },
  { 
    name: "Nippon India Small Cap", 
    currentValue: 522494, 
    investedValue: 361249, 
    loss: 0, 
    lossPct: 16.47,
    holdingPeriod: "2.3 years",
    type: "LTCG",
    taxRate: 10,
    taxSaved: 0
  },
];

const actualLossFunds = lossFunds.filter(f => f.loss > 0);
const totalHarvestableLoss = actualLossFunds.reduce((sum, f) => sum + f.loss, 0);
const totalTaxSaved = actualLossFunds.reduce((sum, f) => sum + f.taxSaved, 0);

// LTCG Exemption tracking
const ltcgExemptionLimit = 125000;
const currentLtcgGains = 85000; // Example: user has some gains this year
const remainingExemption = ltcgExemptionLimit - currentLtcgGains;

export default function TaxHarvestingPage() {
  const [selectedFunds, setSelectedFunds] = useState<string[]>(actualLossFunds.map(f => f.name));
  const [showInfo, setShowInfo] = useState(false);

  const toggleFund = (name: string) => {
    setSelectedFunds(prev => 
      prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
    );
  };

  const selectedLoss = lossFunds
    .filter(f => selectedFunds.includes(f.name))
    .reduce((sum, f) => sum + f.loss, 0);
  
  const selectedTaxSaved = lossFunds
    .filter(f => selectedFunds.includes(f.name))
    .reduce((sum, f) => sum + f.taxSaved, 0);

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
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/intelligence" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Insights
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-slate-900">Tax Loss Harvesting</h1>
          </div>
          <p className="text-slate-600">Legally reduce your tax liability by selling loss-making investments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-xs font-medium text-slate-500">Harvestable</span>
            </div>
            <span className="text-3xl font-bold text-red-600">₹{totalHarvestableLoss.toLocaleString()}</span>
            <p className="text-sm text-slate-600 mt-1">Total Losses Available</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-slate-500">Tax Saved</span>
            </div>
            <span className="text-3xl font-bold text-green-600">₹{selectedTaxSaved.toLocaleString()}</span>
            <p className="text-sm text-slate-600 mt-1">Estimated Savings</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">FY 2025-26</span>
            </div>
            <span className="text-3xl font-bold text-blue-600">₹{remainingExemption.toLocaleString()}</span>
            <p className="text-sm text-slate-600 mt-1">LTCG Exemption Left</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
              <span className="text-xs font-medium text-slate-500">Strategy</span>
            </div>
            <span className="text-3xl font-bold text-purple-600">{actualLossFunds.length}</span>
            <p className="text-sm text-slate-600 mt-1">Funds to Harvest</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How Tax Loss Harvesting Works</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. <strong>Sell loss-making funds</strong> before March 31 to realize capital losses</li>
                <li>2. <strong>Losses offset gains</strong> from other investments in the same financial year</li>
                <li>3. <strong>Remaining losses</strong> can be carried forward for 8 years</li>
                <li>4. <strong>Reinvest immediately</strong> in similar (but not identical) funds to maintain market exposure</li>
              </ol>
              <p className="text-sm text-blue-700 mt-3">
                <strong>Important:</strong> Wait 2-3 months before re-buying the same fund to avoid "wash sale" rules.
              </p>
            </div>
          </div>
        </div>

        {/* Fund Selection */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select Funds to Harvest</h2>
              <p className="text-sm text-slate-500">Choose loss-making funds to sell before March 31, 2026</p>
            </div>
            <button 
              onClick={() => setSelectedFunds(actualLossFunds.map(f => f.name))}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
          </div>

          <div className="space-y-3">
            {lossFunds.map((fund) => {
              const isSelected = selectedFunds.includes(fund.name);
              const hasLoss = fund.loss > 0;
              
              return (
                <div 
                  key={fund.name}
                  onClick={() => hasLoss && toggleFund(fund.name)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    hasLoss 
                      ? isSelected 
                        ? "bg-red-50 border-red-300 cursor-pointer" 
                        : "bg-white border-slate-200 hover:border-red-300 cursor-pointer"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      hasLoss 
                        ? isSelected ? "bg-red-600 border-red-600" : "border-slate-300"
                        : "border-slate-200 bg-slate-100"
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <h4 className={`font-medium ${hasLoss ? 'text-slate-900' : 'text-slate-500'}`}>{fund.name}</h4>
                      <p className="text-sm text-slate-500">Held for {fund.holdingPeriod} • {fund.type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-semibold ${fund.loss > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {fund.loss > 0 ? '-' : '+'}₹{Math.abs(fund.loss).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{fund.lossPct}%</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-sm font-semibold text-slate-900">
                        {hasLoss ? `₹${fund.taxSaved.toLocaleString()}` : '-'}
                      </p>
                      <p className="text-xs text-slate-500">Tax Saved</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Summary */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Selected Losses</p>
                <p className="text-2xl font-bold text-red-600">₹{selectedLoss.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total Tax Saved</p>
                <p className="text-2xl font-bold text-green-600">₹{selectedTaxSaved.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Tax Harvesting Action Plan</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-red-600">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Sell Selected Funds</h3>
                <p className="text-sm text-slate-600 mb-2">Sell {selectedFunds.length} funds before March 31, 2026 to realize losses for FY 2025-26</p>
                <div className="flex gap-2">
                  {selectedFunds.map(name => (
                    <span key={name} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                      {name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-amber-600">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Offset Your Gains</h3>
                <p className="text-sm text-slate-600">
                  These losses will offset ₹{selectedLoss.toLocaleString()} of capital gains. 
                  Remaining exemption: ₹{Math.max(0, remainingExemption - selectedLoss).toLocaleString()}.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-green-600">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Reinvest Wisely</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Immediately reinvest in similar-category funds to stay invested. Wait 2-3 months before re-buying the same fund.
                </p>
                <Link 
                  href="/intelligence" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  View AI Rebalance Plan
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Rules Reference */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tax Rules Quick Reference</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Equity STCG (Held &lt; 1 year)
              </h3>
              <p className="text-sm text-slate-600">Tax Rate: <strong>15%</strong> flat</p>
              <p className="text-sm text-slate-600">Losses can offset only STCG gains</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Equity LTCG (Held &gt; 1 year)
              </h3>
              <p className="text-sm text-slate-600">Tax Rate: <strong>10%</strong> above ₹1.25L exemption</p>
              <p className="text-sm text-slate-600">Losses can offset LTCG and STCG gains</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            *Disclaimer: Tax calculations are estimates. Consult a CA for precise tax planning. FolioIQ does not provide tax advice.
          </p>
        </div>
      </div>
    </div>
  );
}

