"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, CheckCircle, Wallet, Clock, PieChart as PieIcon, Activity, Upload, Bell, User, Home, Layers, BarChart3, Banknote } from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DEFAULT_FUNDS = [
  { name: "SBI Bluechip Fund", category: "Large Cap", value: 450000, invested: 380000, returns: 18.42 },
  { name: "HDFC Mid-Cap", category: "Mid Cap", value: 320000, invested: 280000, returns: 14.29 },
  { name: "Axis Small Cap", category: "Small Cap", value: 180000, invested: 150000, returns: 20.00 },
  { name: "ICICI Balanced", category: "Hybrid", value: 250000, invested: 230000, returns: 8.70 },
  { name: "Nippon Liquid", category: "Liquid", value: 150000, invested: 150000, returns: 6.50 },
  { name: "Mirae Tax Saver", category: "ELSS", value: 200000, invested: 160000, returns: 25.00 },
  { name: "Kotak Arbitrage", category: "Arbitrage", value: 100000, invested: 95000, returns: 5.26 },
  { name: "Canara Hybrid", category: "Balanced", value: 100000, invested: 92000, returns: 8.70 },
];

function formatL(value) { return `₹${(value/100000).toFixed(2)}L`; }
function formatFull(value) { return `₹${value.toLocaleString('en-IN')}`; }

export default function Dashboard() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(localStorage.getItem("folioiq_email") || "");
    const saved = localStorage.getItem('folioiq_portfolio');
    if (saved) {
      setPortfolio(JSON.parse(saved));
    } else {
      const tv = DEFAULT_FUNDS.reduce((s, f) => s + f.value, 0);
      const ti = DEFAULT_FUNDS.reduce((s, f) => s + f.invested, 0);
      setPortfolio({ 
n        fileName: "Demo", 
n        uploadDate: new Date().toISOString(), 
n        funds: DEFAULT_FUNDS, 
n        summary: { currentValue: tv, totalInvested: ti, totalReturns: (((tv - ti) / ti) * 100).toFixed(2), fundCount: DEFAULT_FUNDS.length }
n      });
n    }
n  }, []);
n
n  if (!portfolio) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;
n
n  const funds = portfolio.funds || DEFAULT_FUNDS;
n  const summary = portfolio.summary;
n  const ret = (((summary.currentValue - summary.totalInvested) / summary.totalInvested) * 100).toFixed(2);
n
n  // Asset allocation
n  const allocMap = {};
n  funds.forEach(f => {
n    const t = f.category === 'Liquid' || f.category === 'Debt' ? 'Debt' : f.category === 'Hybrid' || f.category === 'Balanced' ? 'Hybrid' : 'Equity';
n    allocMap[t] = (allocMap[t] || 0) + f.value;
n  });
n  const assetAlloc = Object.keys(allocMap).map(k => ({ name: k, value: allocMap[k] }));
n
n  // Category breakdown
n  const catMap = {};
n  funds.forEach(f => { catMap[f.category] = (catMap[f.category] || 0) + f.value; });
n  const catData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })).sort((a, b) => b.value - a.value);
n
n  return (
n    <div className="min-h-screen bg-gray-50">
n      <header className="bg-white border-b sticky top-0 z-50">
n        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
n          <div className="flex items-center gap-3">
n            <button onClick={()=>router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg"><Home className="w-5 h-5"/></button>
n            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
n            <span className="font-bold text-xl">FolioIQ</span>
n            {email && <span className="text-sm text-gray-500">| {email}</span>}
n          </div>
n          <div className="flex items-center gap-4">
n            <button onClick={()=>router.push('/upload')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-700">
n              <Upload className="w-4 h-4"/> Upload New
n            </button>
n            <Bell className="w-5 h-5 text-gray-500"/>
n            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4"/></div>
n          </div>
n        </div>
n      </header>
n
n      <div className="max-w-7xl mx-auto px-4 py-8">
n        {/* Health Score */}
n        <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white">
n          <div className="flex justify-between mb-4">
n            <div>
n              <p className="text-sm text-gray-400 uppercase">Portfolio Health Score</p>
n              <div className="flex items-baseline gap-2 mt-1"><span className="text-5xl font-bold">80</span><span className="text-gray-400">/100</span></div>
n            </div>
n            <div className="text-right">
n              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-4 h-4 mr-1"/> Healthy</span>
n              <p className="text-sm text-gray-400 mt-1">{summary.fundCount} funds</p>
n            </div>
n          </div>
n          <div className="h-2 bg-gray-700 rounded-full"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{width:'80%'}}/></div>
n        </div>
n
n        {/* Cards */}
n        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
n          <div className="bg-white rounded-xl p-6 border">
n            <div className="flex justify-between mb-2"><p className="text-sm text-gray-500 uppercase">Current Value</p><Wallet className="w-5 h-5 text-emerald-500"/></div>
n            <p className="text-2xl font-bold">{formatL(summary.currentValue)}</p>
n            <p className="text-sm text-emerald-600 mt-1">+{ret}% all time</p>
n          </div>
n          <div className="bg-white rounded-xl p-6 border">
n            <div className="flex justify-between mb-2"><p className="text-sm text-gray-500 uppercase">Total Invested</p><Banknote className="w-5 h-5 text-blue-500"/></div>
n            <p className="text-2xl font-bold">{formatL(summary.totalInvested)}</p>
n            <p className="text-sm text-gray-500 mt-1">Across {summary.fundCount} funds</p>
n          </div>
n          <div className="bg-white rounded-xl p-6 border">
n            <div className="flex justify-between mb-2"><p className="text-sm text-gray-500 uppercase">Total Returns</p><TrendingUp className="w-5 h-5 text-purple-500"/></div>
n            <p className="text-2xl font-bold text-emerald-600">+{ret}%</p>
n            <p className="text-sm text-gray-500 mt-1">XIRR: 13.7%</p>
n          </div>
n          <div className="bg-white rounded-xl p-6 border">
n            <div className="flex justify-between mb-2"><p className="text-sm text-gray-500 uppercase">Monthly SIP</p><Clock className="w-5 h-5 text-orange-500"/></div>
n            <p className="text-2xl font-bold">₹28.5K</p>
n            <p className="text-sm text-gray-500 mt-1">6 active SIPs</p>
n          </div>
n        </div>
n
n        {/* Charts */}
n        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
n          <div className="bg-white rounded-xl p-6 border">
n            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieIcon className="w-5 h-5 text-emerald-500"/> Asset Allocation</h3>
n            <ResponsiveContainer width="100%" height={250}>
n              <PieChart><Pie data={assetAlloc} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
n                {assetAlloc.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
n              </Pie><Tooltip formatter={(v) => formatL(v)}/><Legend/></PieChart>
n            </ResponsiveContainer>
n          </div>
n          <div className="bg-white rounded-xl p-6 border">
n            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500"/> Category Breakdown</h3>
n            <ResponsiveContainer width="100%" height={250}>
n              <BarChart data={catData} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`}/><YAxis type="category" dataKey="name" width={100}/><Tooltip formatter={(v) => formatL(v)}/><Bar dataKey="value" fill="#00C49F" radius={[0, 4, 4, 0]}/></BarChart>
n            </ResponsiveContainer>
n          </div>
n        </div>
n
n        {/* Performance */}
n        <div className="bg-white rounded-xl p-6 border mb-8">
n          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500"/> Monthly Performance</h3>
n          <ResponsiveContainer width="100%" height={300}>
n            <AreaChart data={[{m:'Jan',D:8,E:12,H:10},{m:'Feb',D:7,E:8,H:6},{m:'Mar',D:6,E:5,H:4},{m:'Apr',D:7,E:9,H:7},{m:'May',D:8,E:11,H:9},{m:'Jun',D:7,E:10,H:8}]}>
n              <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis tickFormatter={(v) => `${v}%`}/><Tooltip/><Legend/>
n              <Area type="monotone" dataKey="D" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6}/>
n              <Area type="monotone" dataKey="E" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6}/>
n              <Area type="monotone" dataKey="H" stackId="1" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6}/>
n            </AreaChart>
n          </ResponsiveContainer>
n        </div>
n
n        {/* Holdings */}
n        <div className="bg-white rounded-xl border overflow-hidden">
n          <div className="p-6 border-b"><h3 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500"/> Holdings</h3></div>
n          <div className="overflow-x-auto">
n            <table className="w-full">
n              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fund</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invested</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Returns</th></tr></thead>
n              <tbody className="divide-y">
n                {funds.map((f, i) => (
n                  <tr key={i} className="hover:bg-gray-50">
n                    <td className="px-6 py-4"><p className="font-medium">{f.name}</p></td>
n                    <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{f.category}</span></td>
n                    <td className="px-6 py-4 text-right">{formatFull(f.invested)}</td>
n                    <td className="px-6 py-4 text-right font-medium">{formatFull(f.value)}</td>
n                    <td className="px-6 py-4 text-right"><span className={`px-2.5 py-0.5 rounded-full text-xs ${f.returns >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{f.returns >= 0 ? '+' : ''}{f.returns}%</span></td>
n                  </tr>
n                ))}
n              </tbody>
n            </table>
n          </div>
n        </div>
n      </div>
n    </div>
n  );
n}
