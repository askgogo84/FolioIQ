"use client";

import { useState } from "react";
import { 
  History, Home, LayoutDashboard, Upload, Search, User, Sparkles, Brain,
  ArrowUpRight, ArrowDownRight, RefreshCw, Download, Filter,
  Calendar, DollarSign, CheckCircle, X
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  date: string;
  fund: string;
  category: string;
  type: "BUY" | "SELL" | "SIP" | "DIVIDEND";
  amount: number;
  units: number;
  nav: number;
  status: "Completed" | "Pending" | "Failed";
}

const transactions: Transaction[] = [
  { id: "TXN001", date: "2026-04-15", fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", type: "SIP", amount: 5000, units: 12.45, nav: 401.61, status: "Completed" },
  { id: "TXN002", date: "2026-04-15", fund: "Nippon India Small Cap", category: "Small Cap", type: "SIP", amount: 10000, units: 28.32, nav: 353.11, status: "Completed" },
  { id: "TXN003", date: "2026-04-15", fund: "ICICI Pru Technology", category: "Sectoral", type: "SIP", amount: 10000, units: 42.18, nav: 237.08, status: "Completed" },
  { id: "TXN004", date: "2026-04-15", fund: "HDFC Flexi Cap Fund", category: "Flexi Cap", type: "SIP", amount: 10000, units: 38.52, nav: 259.61, status: "Completed" },
  { id: "TXN005", date: "2026-04-15", fund: "Invesco India Infrastructure", category: "Sectoral", type: "SIP", amount: 10000, units: 41.68, nav: 239.93, status: "Completed" },
  { id: "TXN006", date: "2026-04-15", fund: "Axis Multicap Fund", category: "Multi Cap", type: "SIP", amount: 10000, units: 46.51, nav: 215.01, status: "Completed" },
  { id: "TXN007", date: "2026-04-15", fund: "Mirae Asset ELSS", category: "ELSS", type: "SIP", amount: 6000, units: 50.00, nav: 120.00, status: "Completed" },
  { id: "TXN008", date: "2026-04-15", fund: "Mirae Asset Large & Midcap", category: "Large & Mid", type: "SIP", amount: 5000, units: 41.67, nav: 120.00, status: "Completed" },
  { id: "TXN009", date: "2026-04-15", fund: "Invesco India Smallcap", category: "Small Cap", type: "SIP", amount: 5000, units: 45.45, nav: 110.00, status: "Completed" },
  { id: "TXN010", date: "2026-04-15", fund: "Nippon India Multi Cap", category: "Multi Cap", type: "SIP", amount: 10000, units: 91.74, nav: 109.00, status: "Completed" },
  { id: "TXN011", date: "2026-04-15", fund: "Canara Robeco ELSS", category: "ELSS", type: "SIP", amount: 10000, units: 166.67, nav: 60.00, status: "Completed" },
  { id: "TXN012", date: "2026-03-15", fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", type: "SIP", amount: 5000, units: 12.82, nav: 390.02, status: "Completed" },
  { id: "TXN013", date: "2026-03-15", fund: "Nippon India Small Cap", category: "Small Cap", type: "SIP", amount: 10000, units: 29.15, nav: 343.05, status: "Completed" },
  { id: "TXN014", date: "2026-03-15", fund: "ICICI Pru Technology", category: "Sectoral", type: "SIP", amount: 10000, units: 40.98, nav: 244.02, status: "Completed" },
  { id: "TXN015", date: "2026-03-10", fund: "Invesco India Gold ETF FoF", category: "Gold", type: "BUY", amount: 100000, units: 138.12, nav: 724.00, status: "Completed" },
  { id: "TXN016", date: "2026-02-15", fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", type: "SIP", amount: 5000, units: 13.20, nav: 378.79, status: "Completed" },
  { id: "TXN017", date: "2026-02-15", fund: "Nippon India Small Cap", category: "Small Cap", type: "SIP", amount: 10000, units: 30.12, nav: 332.00, status: "Completed" },
  { id: "TXN018", date: "2026-01-15", fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", type: "SIP", amount: 5000, units: 13.51, nav: 370.10, status: "Completed" },
  { id: "TXN019", date: "2026-01-15", fund: "Axis ELSS Tax Saver", category: "ELSS", type: "BUY", amount: 50000, units: 416.67, nav: 120.00, status: "Completed" },
  { id: "TXN020", date: "2025-12-15", fund: "Parag Parikh Flexi Cap", category: "Flexi Cap", type: "SIP", amount: 5000, units: 13.89, nav: 360.00, status: "Completed" },
];

export default function TransactionsPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterFund, setFilterFund] = useState<string>("ALL");
  const [dateRange, setDateRange] = useState<string>("ALL");

  const funds = [...new Set(transactions.map(t => t.fund))];

  const filtered = transactions.filter(t => {
    if (filterType !== "ALL" && t.type !== filterType) return false;
    if (filterFund !== "ALL" && t.fund !== filterFund) return false;
    if (dateRange !== "ALL") {
      const txDate = new Date(t.date);
      const now = new Date();
      if (dateRange === "30D" && (now.getTime() - txDate.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;
      if (dateRange === "90D" && (now.getTime() - txDate.getTime()) > 90 * 24 * 60 * 60 * 1000) return false;
      if (dateRange === "1Y" && (now.getTime() - txDate.getTime()) > 365 * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const totalInvested = filtered.filter(t => t.type === "BUY" || t.type === "SIP").reduce((s, t) => s + t.amount, 0);
  const totalSIPCount = filtered.filter(t => t.type === "SIP").length;
  const totalBuyCount = filtered.filter(t => t.type === "BUY").length;

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
            <History className="w-8 h-8 text-slate-600" />
            <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
          </div>
          <p className="text-slate-600">Track all your investments, SIPs, and redemptions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <History className="w-6 h-6 text-blue-600 mb-3" />
            <p className="text-2xl font-bold text-slate-900">{filtered.length}</p>
            <p className="text-sm text-slate-500">Total Transactions</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <DollarSign className="w-6 h-6 text-green-600 mb-3" />
            <p className="text-2xl font-bold text-green-600">₹{(totalInvested/100000).toFixed(1)}L</p>
            <p className="text-sm text-slate-500">Total Invested</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <RefreshCw className="w-6 h-6 text-purple-600 mb-3" />
            <p className="text-2xl font-bold text-purple-600">{totalSIPCount}</p>
            <p className="text-sm text-slate-500">SIP Transactions</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <ArrowUpRight className="w-6 h-6 text-orange-600 mb-3" />
            <p className="text-2xl font-bold text-orange-600">{totalBuyCount}</p>
            <p className="text-sm text-slate-500">Lump Sum Buys</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">Filters:</span>
            </div>
            
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="SIP">SIP</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="DIVIDEND">Dividend</option>
            </select>

            <select 
              value={filterFund} 
              onChange={(e) => setFilterFund(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Funds</option>
              {funds.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Time</option>
              <option value="30D">Last 30 Days</option>
              <option value="90D">Last 90 Days</option>
              <option value="1Y">Last 1 Year</option>
            </select>

            <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Fund</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Amount</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">Units</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500">NAV</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">{txn.fund}</p>
                      <p className="text-xs text-slate-500">{txn.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        txn.type === "SIP" ? "bg-purple-100 text-purple-700" :
                        txn.type === "BUY" ? "bg-green-100 text-green-700" :
                        txn.type === "SELL" ? "bg-red-100 text-red-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {txn.type === "SIP" ? <RefreshCw className="w-3 h-3" /> :
                         txn.type === "BUY" ? <ArrowUpRight className="w-3 h-3" /> :
                         txn.type === "SELL" ? <ArrowDownRight className="w-3 h-3" /> :
                         <DollarSign className="w-3 h-3" />}
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-slate-900">₹{txn.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm text-slate-600">{txn.units.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-sm text-slate-600">₹{txn.nav.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filtered.length === 0 && (
            <div className="p-16 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No transactions match your filters</p>
            </div>
          )}
        </div>

        {/* Monthly SIP Summary */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly SIP Summary (April 2026)</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transactions
              .filter(t => t.type === "SIP" && t.date === "2026-04-15")
              .map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{txn.fund.split(" ").slice(0, 2).join(" ")}</p>
                    <p className="text-xs text-slate-500">{txn.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">₹{txn.amount.toLocaleString()}</span>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm text-slate-600">Total Monthly SIP</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{transactions.filter(t => t.type === "SIP" && t.date === "2026-04-15").reduce((s, t) => s + t.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
