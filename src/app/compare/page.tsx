"use client";

import { useState } from "react";
import { 
  Scale, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  TrendingUp, Shield, DollarSign, Star, ChevronDown, X, CheckCircle,
  BarChart3, Award, Users
} from "lucide-react";
import Link from "next/link";

interface Fund {
  name: string;
  category: string;
  returns1Y: number;
  returns3Y: number;
  returns5Y: number;
  expense: number;
  aum: string;
  risk: string;
  sharpe: number;
  alpha: number;
  beta: number;
  rating: number;
  fundManager: string;
  minInvestment: string;
  topHoldings: string[];
  inception: string;
}

const allFunds: Fund[] = [
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", returns1Y: 16.81, returns3Y: 14.2, returns5Y: 12.8, expense: 0.94, aum: "₹45,000 Cr", risk: "Moderate-High", sharpe: 1.2, alpha: 3.1, beta: 0.95, rating: 5, fundManager: "Rajeev Thakkar", minInvestment: "₹1,000", topHoldings: ["HDFC Bank", "ICICI Bank", "Microsoft", "Amazon", "Tata Motors"], inception: "2013" },
  { name: "Axis Bluechip Fund", category: "Large Cap", returns1Y: 15.2, returns3Y: 12.5, returns5Y: 11.2, expense: 0.95, aum: "₹28,000 Cr", risk: "Moderate", sharpe: 1.0, alpha: 1.8, beta: 0.88, rating: 4, fundManager: "Shreyash Devalkar", minInvestment: "₹500", topHoldings: ["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"], inception: "2010" },
  { name: "Nippon India Small Cap", category: "Small Cap", returns1Y: 16.47, returns3Y: 18.5, returns5Y: 15.2, expense: 0.82, aum: "₹32,000 Cr", risk: "High", sharpe: 1.1, alpha: 2.8, beta: 1.05, rating: 4, fundManager: "Samir Rachh", minInvestment: "₹500", topHoldings: ["Elgi Equipments", "JK Cement", "V-Guard", "NAVIN FLUORINE", "Timken"], inception: "2013" },
  { name: "Invesco India Gold ETF FoF", category: "Gold", returns1Y: 34.69, returns3Y: 15.2, returns5Y: 11.5, expense: 0.15, aum: "₹450 Cr", risk: "Moderate", sharpe: 1.8, alpha: 8.2, beta: 0.3, rating: 5, fundManager: "Neelesh Dhamnaskar", minInvestment: "₹100", topHoldings: ["Invesco India Gold ETF"], inception: "2011" },
  { name: "SBI Small Cap Fund", category: "Small Cap", returns1Y: 22.1, returns3Y: 16.8, returns5Y: 14.5, expense: 0.85, aum: "₹18,900 Cr", risk: "High", sharpe: 1.15, alpha: 3.5, beta: 1.02, rating: 4, fundManager: "R. Srinivasan", minInvestment: "₹500", topHoldings: ["Elgi Equipments", "JK Cement", "Timken India", "V-Guard", "NAVIN FLUORINE"], inception: "2009" },
  { name: "HDFC Corporate Bond", category: "Debt", returns1Y: 8.5, returns3Y: 7.2, returns5Y: 6.8, expense: 0.42, aum: "₹3,120 Cr", risk: "Low", sharpe: 0.8, alpha: 0.5, beta: 0.15, rating: 4, fundManager: "Anil Bamboli", minInvestment: "₹100", topHoldings: ["HDFC Ltd", "LIC Housing", "Power Finance", "REC Ltd", "NHAI"], inception: "2010" },
  { name: "ICICI Pru Balanced Advantage", category: "Hybrid", returns1Y: 12.8, returns3Y: 10.5, returns5Y: 9.2, expense: 1.1, aum: "₹15,600 Cr", risk: "Moderate", sharpe: 0.9, alpha: 1.5, beta: 0.65, rating: 4, fundManager: "Sankaran Naren", minInvestment: "₹100", topHoldings: ["ICICI Bank", "Reliance", "HDFC Bank", "Infosys", "TCS"], inception: "2006" },
  { name: "Nifty 50 Index Fund", category: "Index", returns1Y: 13.1, returns3Y: 11.8, returns5Y: 11.5, expense: 0.2, aum: "₹42,000 Cr", risk: "Moderate", sharpe: 0.95, alpha: -0.1, beta: 1.0, rating: 4, fundManager: "Index Tracking", minInvestment: "₹100", topHoldings: ["Reliance", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"], inception: "2010" },
  { name: "Canara Robeco Equity Diversified", category: "Flexi Cap", returns1Y: 14.2, returns3Y: 13.8, returns5Y: 12.1, expense: 0.88, aum: "₹12,000 Cr", risk: "Moderate-High", sharpe: 1.05, alpha: 2.5, beta: 0.92, rating: 4, fundManager: "Shridatta Bhandwaldar", minInvestment: "₹5,000", topHoldings: ["HDFC Bank", "ICICI Bank", "Reliance", "Infosys", "Bajaj Finance"], inception: "2009" },
  { name: "Axis Small Cap Fund", category: "Small Cap", returns1Y: 15.2, returns3Y: 17.1, returns5Y: 14.8, expense: 0.78, aum: "₹8,500 Cr", risk: "High", sharpe: 1.05, alpha: 2.2, beta: 0.98, rating: 4, fundManager: "Anupam Tiwari", minInvestment: "₹500", topHoldings: ["Galaxy Surfactants", "CCL Products", "Astra Microwave", "Fine Organic", "Rossari Biotech"], inception: "2013" },
];

function getWinner(funds: Fund[], metric: keyof Fund): Fund | null {
  if (funds.length < 2) return null;
  const numericMetrics = ["returns1Y", "returns3Y", "returns5Y", "sharpe", "alpha", "rating"];
  const lowerIsBetter = ["expense", "beta"];
  
  if (numericMetrics.includes(metric as string)) {
    return funds.reduce((best, f) => (f[metric] as number) > (best[metric] as number) ? f : best);
  }
  if (lowerIsBetter.includes(metric as string)) {
    return funds.reduce((best, f) => (f[metric] as number) < (best[metric] as number) ? f : best);
  }
  return null;
}

export default function ComparePage() {
  const [selectedFunds, setSelectedFunds] = useState<Fund[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const addFund = (fund: Fund) => {
    if (selectedFunds.length < 3 && !selectedFunds.find(f => f.name === fund.name)) {
      setSelectedFunds([...selectedFunds, fund]);
    }
    setShowDropdown(false);
  };

  const removeFund = (name: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.name !== name));
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
    { name: "AI Insights", href: "/intelligence", icon: Brain },
  ];

  type RowDef = {
  label: string;
  key: keyof Fund;
  format: (v: any) => string;
  color: boolean;
  lowerBetter?: boolean;
};

const comparisonRows: RowDef[] = [
    { label: "1 Year Returns", key: "returns1Y", format: (v) => `${(v as number) >= 0 ? '+' : ''}${v}%`, color: true },
    { label: "3 Year Returns", key: "returns3Y", format: (v) => `${(v as number) >= 0 ? '+' : ''}${v}%`, color: true },
    { label: "5 Year Returns", key: "returns5Y", format: (v) => `${(v as number) >= 0 ? '+' : ''}${v}%`, color: true },
    { label: "Expense Ratio", key: "expense", format: (v) => `${v}%`, color: false, lowerBetter: true },
    { label: "Sharpe Ratio", key: "sharpe", format: (v) => (v as number).toFixed(2), color: false },
    { label: "Alpha", key: "alpha", format: (v) => `${(v as number) >= 0 ? '+' : ''}${v}%`, color: true },
    { label: "Beta", key: "beta", format: (v) => (v as number).toFixed(2), color: false, lowerBetter: true },
    { label: "AUM", key: "aum", format: (v) => String(v), color: false },
    { label: "Risk Level", key: "risk", format: (v) => String(v), color: false },
    { label: "Fund Manager", key: "fundManager", format: (v) => String(v), color: false },
    { label: "Min Investment", key: "minInvestment", format: (v) => String(v), color: false },
    { label: "Inception", key: "inception", format: (v) => String(v), color: false },
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
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Fund Comparison</h1>
          </div>
          <p className="text-slate-600">Compare up to 3 funds side-by-side on every metric</p>
        </div>

        {/* Fund Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            {selectedFunds.map((fund) => (
              <div key={fund.name} className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-medium text-slate-900 text-sm">{fund.name}</span>
                <button onClick={() => removeFund(fund.name)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-blue-200">
                  <X className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            ))}
            
            {selectedFunds.length < 3 && (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Fund</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-medium text-slate-400 px-3 py-2">Select a fund to compare</p>
                      {allFunds.filter(f => !selectedFunds.find(sf => sf.name === f.name)).map((fund) => (
                        <button
                          key={fund.name}
                          onClick={() => addFund(fund)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-slate-900">{fund.name}</p>
                          <p className="text-xs text-slate-500">{fund.category} • {fund.returns1Y}% returns</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {selectedFunds.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header Row */}
            <div className="grid border-b border-slate-200" style={{ gridTemplateColumns: `200px repeat(${selectedFunds.length}, 1fr)` }}>
              <div className="p-4 bg-slate-50 font-semibold text-slate-900 text-sm">Metric</div>
              {selectedFunds.map((fund) => (
                <div key={fund.name} className="p-4 border-l border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: fund.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm">{fund.name}</h3>
                  <p className="text-xs text-slate-500">{fund.category}</p>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            {comparisonRows.map((row) => {
              const winner = getWinner(selectedFunds, row.key);
              return (
                <div key={row.label} className="grid border-b border-slate-100 hover:bg-slate-50 transition-colors" style={{ gridTemplateColumns: `200px repeat(${selectedFunds.length}, 1fr)` }}>
                  <div className="p-4 text-sm font-medium text-slate-700 bg-slate-50/50">{row.label}</div>
                  {selectedFunds.map((fund) => {
                    const value = fund[row.key];
                    const isWinner = winner?.name === fund.name;
                    const numValue = typeof value === 'number' ? value : 0;
                    
                    return (
                      <div key={fund.name} className={`p-4 border-l border-slate-100 ${isWinner ? 'bg-green-50/50' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${
                            row.color ? (numValue >= 0 ? 'text-green-600' : 'text-red-600') : 'text-slate-900'
                          }`}>
                            {row.format(value as string | number)}
                          </span>
                          {isWinner && <CheckCircle className="w-4 h-4 text-green-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Top Holdings Row */}
            <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: `200px repeat(${selectedFunds.length}, 1fr)` }}>
              <div className="p-4 text-sm font-medium text-slate-700 bg-slate-50/50">Top Holdings</div>
              {selectedFunds.map((fund) => (
                <div key={fund.name} className="p-4 border-l border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {fund.topHoldings.map((h) => (
                      <span key={h} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{h}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${selectedFunds.length}, 1fr)` }}>
              <div className="p-4 text-sm font-medium text-slate-700 bg-slate-50/50">Action</div>
              {selectedFunds.map((fund) => (
                <div key={fund.name} className="p-4 border-l border-slate-100">
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Add to Watchlist
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Funds to Compare</h3>
            <p className="text-slate-500 mb-6">Add up to 3 funds to see a detailed side-by-side comparison</p>
            <button 
              onClick={() => setShowDropdown(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Start Comparing
            </button>
          </div>
        )}

        {/* Quick Compare Suggestions */}
        {selectedFunds.length === 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Popular Comparisons</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { funds: ["Parag Parikh Flexi Cap", "Canara Robeco Equity Diversified"], label: "Top Flexi Cap Funds" },
                { funds: ["Nippon India Small Cap", "SBI Small Cap Fund", "Axis Small Cap Fund"], label: "Small Cap Battle" },
                { funds: ["Axis Bluechip Fund", "Nifty 50 Index Fund"], label: "Active vs Passive" },
              ].map((group, i) => (
                <button
                  key={i}
                  onClick={() => {
                    group.funds.forEach(name => {
                      const fund = allFunds.find(f => f.name === name);
                      if (fund && selectedFunds.length < 3) {
                        setSelectedFunds(prev => prev.find(f => f.name === name) ? prev : [...prev, fund]);
                      }
                    });
                  }}
                  className="bg-white rounded-xl border border-slate-200 p-4 text-left hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-semibold text-slate-900 mb-2">{group.label}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.funds.map(f => (
                      <span key={f} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{f.split(" ").slice(0, 2).join(" ")}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



