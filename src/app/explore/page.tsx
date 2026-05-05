"use client";

import { useState } from "react";
import { MessageSquare,  Brain, Search, Home, LayoutDashboard, Upload, User, Sparkles, X, TrendingUp, Shield, DollarSign, BarChart3, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

interface Fund {
  name: string;
  category: string;
  returns1Y: string;
  returns3Y: string;
  risk: string;
  aum: string;
  rating: number;
  expense: string;
  fundManager: string;
  description: string;
  topHoldings: string[];
  minInvestment: string;
  sipAvailable: boolean;
}

const funds: Fund[] = [
  {
    name: "Axis Bluechip Fund",
    category: "Equity: Large Cap",
    returns1Y: "15.2%",
    returns3Y: "12.8%",
    risk: "Moderate",
    aum: "₹2,450 Cr",
    rating: 5,
    expense: "1.2%",
    fundManager: "Shreyash Devalkar",
    description: "A top-performing large-cap fund focusing on bluechip companies with consistent track record.",
    topHoldings: ["Reliance Industries", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"],
    minInvestment: "₹500",
    sipAvailable: true
  },
  {
    name: "SBI Small Cap Fund",
    category: "Equity: Small Cap",
    returns1Y: "22.1%",
    returns3Y: "18.5%",
    risk: "High",
    aum: "₹1,890 Cr",
    rating: 4,
    expense: "1.5%",
    fundManager: "R. Srinivasan",
    description: "High-growth potential fund investing in emerging small-cap companies.",
    topHoldings: ["Elgi Equipments", "JK Cement", "Timken India", "V-Guard Industries", "NAVIN FLUORINE"],
    minInvestment: "₹500",
    sipAvailable: true
  },
  {
    name: "HDFC Corporate Bond",
    category: "Debt: Corporate Bond",
    returns1Y: "8.5%",
    returns3Y: "7.2%",
    risk: "Low",
    aum: "₹3,120 Cr",
    rating: 4,
    expense: "0.8%",
    fundManager: "Anil Bamboli",
    description: "Stable returns through investment in high-quality corporate bonds.",
    topHoldings: ["HDFC Ltd", "LIC Housing Finance", "Power Finance Corp", "REC Ltd", "NHAI"],
    minInvestment: "₹100",
    sipAvailable: true
  },
  {
    name: "ICICI Pru Balanced Advantage",
    category: "Hybrid: Balanced Advantage",
    returns1Y: "12.8%",
    returns3Y: "10.5%",
    risk: "Moderate",
    aum: "₹1,560 Cr",
    rating: 4,
    expense: "1.1%",
    fundManager: "Sankaran Naren",
    description: "Dynamic allocation between equity and debt based on market conditions.",
    topHoldings: ["ICICI Bank", "Reliance Industries", "HDFC Bank", "Infosys", "TCS"],
    minInvestment: "₹100",
    sipAvailable: true
  },
  {
    name: "Tata ELSS Tax Saver",
    category: "Equity: ELSS",
    returns1Y: "14.3%",
    returns3Y: "11.2%",
    risk: "Moderate",
    aum: "₹980 Cr",
    rating: 3,
    expense: "1.3%",
    fundManager: "Tejas Desai",
    description: "Tax-saving fund with 3-year lock-in period and equity exposure.",
    topHoldings: ["Tata Motors", "HDFC Bank", "Reliance Industries", "Infosys", "ICICI Bank"],
    minInvestment: "₹500",
    sipAvailable: true
  },
  {
    name: "Nifty 50 Index Fund",
    category: "Index: Large Cap",
    returns1Y: "13.1%",
    returns3Y: "11.8%",
    risk: "Moderate",
    aum: "₹4,200 Cr",
    rating: 4,
    expense: "0.2%",
    fundManager: "Index Tracking",
    description: "Low-cost passive fund tracking Nifty 50 index with minimal tracking error.",
    topHoldings: ["Reliance Industries", "HDFC Bank", "ICICI Bank", "Infosys", "TCS"],
    minInvestment: "₹100",
    sipAvailable: true
  }
];

export default function ExplorePage() {
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFunds = funds.filter(fund => 
    fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fund.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search, active: true },
    { name: "AI Insights", href: "/intelligence", icon: Brain },{ name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Explore Funds</h1>
          <p className="text-slate-600">Discover top-performing mutual funds across categories</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search funds by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex gap-3 mb-8 justify-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Upload className="w-4 h-4" />
            Upload
          </Link>
          <Link href="/profile" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <User className="w-4 h-4" />
            Profile
          </Link>
        </div>

        {/* Funds Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund) => (
            <div key={fund.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                    <p className="text-sm text-slate-500">{fund.category}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: fund.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">1Y Returns</p>
                    <p className="text-lg font-bold text-green-600">{fund.returns1Y}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Risk</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      fund.risk === "Low" ? "bg-green-100 text-green-700" :
                      fund.risk === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {fund.risk}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">AUM</p>
                    <p className="text-sm font-semibold text-slate-900">{fund.aum}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Expense</p>
                    <p className="text-sm font-semibold text-slate-900">{fund.expense}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFund(fund)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fund Details Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedFund.name}</h2>
                <p className="text-sm text-slate-500">{selectedFund.category}</p>
              </div>
              <button
                onClick={() => setSelectedFund(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{selectedFund.returns1Y}</p>
                  <p className="text-xs text-slate-600">1Y Returns</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{selectedFund.returns3Y}</p>
                  <p className="text-xs text-slate-600">3Y Returns</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{selectedFund.aum}</p>
                  <p className="text-xs text-slate-600">AUM</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Fund Manager</span>
                  <span className="font-medium text-slate-900">{selectedFund.fundManager}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Expense Ratio</span>
                  <span className="font-medium text-slate-900">{selectedFund.expense}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Risk Level</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedFund.risk === "Low" ? "bg-green-100 text-green-700" :
                    selectedFund.risk === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>{selectedFund.risk}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">Min Investment</span>
                  <span className="font-medium text-slate-900">{selectedFund.minInvestment}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-600">SIP Available</span>
                  <span className="font-medium text-green-600">{selectedFund.sipAvailable ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">About Fund</h4>
                <p className="text-sm text-slate-600">{selectedFund.description}</p>
              </div>

              {/* Top Holdings */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Top Holdings</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFund.topHoldings.map((holding) => (
                    <span key={holding} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                      {holding}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Add to Watchlist
                </button>
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Start SIP
                </button>
                <button 
                  onClick={() => setSelectedFund(null)}
                  className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
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




