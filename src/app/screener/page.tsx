"use client";

import { useState, useMemo } from "react";
import { 
  Search, SlidersHorizontal, ArrowUpDown, Star, TrendingUp, 
  Shield, DollarSign, Home, LayoutDashboard, Upload, User, 
  Sparkles, Brain, ChevronDown, X, CheckCircle, Filter
} from "lucide-react";
import Link from "next/link";

const allFunds = [
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", amc: "PPFAS", returns1Y: 16.81, returns3Y: 14.2, returns5Y: 12.8, expense: 0.94, aum: 45000, risk: "Moderate-High", sharpe: 1.2, alpha: 3.1, rating: 5, minSIP: 1000, fundManager: "Rajeev Thakkar" },
  { name: "Nippon India Small Cap", category: "Small Cap", amc: "Nippon", returns1Y: 16.47, returns3Y: 18.5, returns5Y: 15.2, expense: 0.82, aum: 32000, risk: "High", sharpe: 1.1, alpha: 2.8, rating: 4, minSIP: 500, fundManager: "Samir Rachh" },
  { name: "Invesco India Gold ETF FoF", category: "Gold", amc: "Invesco", returns1Y: 34.69, returns3Y: 15.2, returns5Y: 11.5, expense: 0.15, aum: 450, risk: "Moderate", sharpe: 1.8, alpha: 8.2, rating: 5, minSIP: 100, fundManager: "Neelesh Dhamnaskar" },
  { name: "Axis Bluechip Fund", category: "Large Cap", amc: "Axis", returns1Y: 15.2, returns3Y: 12.5, returns5Y: 11.2, expense: 0.95, aum: 28000, risk: "Moderate", sharpe: 1.0, alpha: 1.8, rating: 4, minSIP: 500, fundManager: "Shreyash Devalkar" },
  { name: "SBI Small Cap Fund", category: "Small Cap", amc: "SBI", returns1Y: 22.1, returns3Y: 16.8, returns5Y: 14.5, expense: 0.85, aum: 18900, risk: "High", sharpe: 1.15, alpha: 3.5, rating: 4, minSIP: 500, fundManager: "R. Srinivasan" },
  { name: "HDFC Corporate Bond", category: "Debt", amc: "HDFC", returns1Y: 8.5, returns3Y: 7.2, returns5Y: 6.8, expense: 0.42, aum: 3120, risk: "Low", sharpe: 0.8, alpha: 0.5, rating: 4, minSIP: 100, fundManager: "Anil Bamboli" },
  { name: "ICICI Pru Balanced Advantage", category: "Hybrid", amc: "ICICI", returns1Y: 12.8, returns3Y: 10.5, returns5Y: 9.2, expense: 1.1, aum: 15600, risk: "Moderate", sharpe: 0.9, alpha: 1.5, rating: 4, minSIP: 100, fundManager: "Sankaran Naren" },
  { name: "Nifty 50 Index Fund", category: "Index", amc: "Nippon", returns1Y: 13.1, returns3Y: 11.8, returns5Y: 11.5, expense: 0.2, aum: 42000, risk: "Moderate", sharpe: 0.95, alpha: -0.1, rating: 4, minSIP: 100, fundManager: "Index Tracking" },
  { name: "Canara Robeco Equity Diversified", category: "Flexi Cap", amc: "Canara", returns1Y: 14.2, returns3Y: 13.8, returns5Y: 12.1, expense: 0.88, aum: 12000, risk: "Moderate-High", sharpe: 1.05, alpha: 2.5, rating: 4, minSIP: 5000, fundManager: "Shridatta Bhandwaldar" },
  { name: "Axis Small Cap Fund", category: "Small Cap", amc: "Axis", returns1Y: 15.2, returns3Y: 17.1, returns5Y: 14.8, expense: 0.78, aum: 8500, risk: "High", sharpe: 1.05, alpha: 2.2, rating: 4, minSIP: 500, fundManager: "Anupam Tiwari" },
  { name: "Mirae Asset Large Cap", category: "Large Cap", amc: "Mirae", returns1Y: 14.5, returns3Y: 13.2, returns5Y: 11.8, expense: 0.55, aum: 25000, risk: "Moderate", sharpe: 1.1, alpha: 2.0, rating: 5, minSIP: 1000, fundManager: "Neelesh Surana" },
  { name: "Kotak Equity Arbitrage", category: "Arbitrage", amc: "Kotak", returns1Y: 6.8, returns3Y: 6.2, returns5Y: 5.8, expense: 0.38, aum: 15000, risk: "Low", sharpe: 0.7, alpha: 0.3, rating: 3, minSIP: 500, fundManager: "Deepak Gupta" },
  { name: "Tata Digital India Fund", category: "Sectoral", amc: "Tata", returns1Y: 8.1, returns3Y: 12.5, returns5Y: 10.2, expense: 0.95, aum: 6200, risk: "Very High", sharpe: 0.6, alpha: 1.2, rating: 3, minSIP: 500, fundManager: "Danesh Irani" },
  { name: "SBI Magnum Gilt", category: "Debt", amc: "SBI", returns1Y: 9.2, returns3Y: 7.8, returns5Y: 7.2, expense: 0.45, aum: 8500, risk: "Low", sharpe: 0.75, alpha: 0.8, rating: 4, minSIP: 500, fundManager: "Dinesh Ahuja" },
  { name: "Aditya Birla Sun Life Frontline", category: "Large Cap", amc: "ABSL", returns1Y: 13.8, returns3Y: 12.1, returns5Y: 10.8, expense: 0.88, aum: 22000, risk: "Moderate", sharpe: 0.98, alpha: 1.5, rating: 4, minSIP: 500, fundManager: "Mahesh Patil" },
];

const categories = ["All", "Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Multi Cap", "ELSS", "Index", "Debt", "Hybrid", "Arbitrage", "Gold", "Sectoral"];
const amcs = ["All", "Axis", "SBI", "HDFC", "ICICI", "Nippon", "Invesco", "Mirae", "Canara", "Kotak", "Tata", "ABSL", "PPFAS"];
const riskLevels = ["All", "Low", "Moderate", "Moderate-High", "High", "Very High"];

export default function ScreenerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [amcFilter, setAmcFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [minReturn, setMinReturn] = useState(0);
  const [maxExpense, setMaxExpense] = useState(2);
  const [sortBy, setSortBy] = useState("returns1Y");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFund, setSelectedFund] = useState<typeof allFunds[0] | null>(null);

  const filtered = useMemo(() => {
    let result = allFunds.filter(f => {
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== "All" && f.category !== categoryFilter) return false;
      if (amcFilter !== "All" && f.amc !== amcFilter) return false;
      if (riskFilter !== "All" && f.risk !== riskFilter) return false;
      if (f.returns1Y < minReturn) return false;
      if (f.expense > maxExpense) return false;
      return true;
    });
    
    result.sort((a, b) => {
      const valA = a[sortBy as keyof typeof a] as number;
      const valB = b[sortBy as keyof typeof b] as number;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
    
    return result;
  }, [searchQuery, categoryFilter, amcFilter, riskFilter, minReturn, maxExpense, sortBy, sortOrder]);

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Fund Screener</h1>
          <p className="text-slate-600">Discover the perfect mutual fund from {allFunds.length}+ options</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search funds by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">AMC</label>
                <select value={amcFilter} onChange={(e) => setAmcFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  {amcs.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Risk</label>
                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  {riskLevels.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Min 1Y Return: {minReturn}%</label>
                <input type="range" min="0" max="50" value={minReturn} onChange={(e) => setMinReturn(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">{filtered.length} funds match your criteria</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Sort by:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <option value="returns1Y">1Y Returns</option>
                <option value="returns3Y">3Y Returns</option>
                <option value="expense">Expense Ratio</option>
                <option value="aum">AUM</option>
                <option value="sharpe">Sharpe Ratio</option>
              </select>
              <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} className="p-1 hover:bg-slate-100 rounded">
                <ArrowUpDown className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((fund) => (
            <div 
              key={fund.name}
              onClick={() => setSelectedFund(fund)}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">{fund.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{fund.category}</span>
                      <span>•</span>
                      <span>{fund.amc}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        fund.risk === "Low" ? "bg-green-100 text-green-700" :
                        fund.risk === "Moderate" ? "bg-blue-100 text-blue-700" :
                        fund.risk === "High" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>{fund.risk}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${fund.returns1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {fund.returns1Y >= 0 ? '+' : ''}{fund.returns1Y}%
                    </p>
                    <p className="text-xs text-slate-500">1Y Return</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{fund.expense}%</p>
                    <p className="text-xs text-slate-500">Expense</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{(fund.aum / 1000).toFixed(1)}K Cr</p>
                    <p className="text-xs text-slate-500">AUM</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: fund.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No funds match your filters. Try adjusting your criteria.</p>
          </div>
        )}
      </div>

      {/* Fund Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedFund(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedFund.name}</h3>
                <p className="text-sm text-slate-500">{selectedFund.category} • {selectedFund.amc}</p>
              </div>
              <button onClick={() => setSelectedFund(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-600">+{selectedFund.returns1Y}%</p>
                <p className="text-xs text-slate-500">1Y Return</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedFund.sharpe}</p>
                <p className="text-xs text-slate-500">Sharpe Ratio</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{selectedFund.expense}%</p>
                <p className="text-xs text-slate-500">Expense Ratio</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{(selectedFund.aum / 1000).toFixed(1)}K Cr</p>
                <p className="text-xs text-slate-500">AUM</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Fund Manager</span>
                <span className="font-medium text-slate-900">{selectedFund.fundManager}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Min SIP</span>
                <span className="font-medium text-slate-900">₹{selectedFund.minSIP}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">3Y Returns</span>
                <span className="font-medium text-green-600">+{selectedFund.returns3Y}%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">5Y Returns</span>
                <span className="font-medium text-green-600">+{selectedFund.returns5Y}%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                Add to Watchlist
              </button>
              <button className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                Start SIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

