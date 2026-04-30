"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, CheckCircle, Wallet, Clock, PieChart as PieIcon, Activity, Upload, Bell, User, Home, Layers, BarChart3, Banknote, LogOut } from "lucide-react";

// Inline supabase client
const supabase = {
  auth: {
    getSession: async () => {
      const session = typeof window !== "undefined" ? localStorage.getItem("sb-session") : null;
      return { data: { session: session ? JSON.parse(session) : null } };
    },
    signOut: async () => {
      if (typeof window !== "undefined") localStorage.removeItem("sb-session");
    }
  }
};
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

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

function formatL(value) {
  return "₹" + (value / 100000).toFixed(2) + "L";
}

function formatFull(value) {
  return "₹" + value.toLocaleString("en-IN");
}

export default function Dashboard() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session) {
        router.push("/");
      }
    });
    
    setEmail(localStorage.getItem("folioiq_email") || "");
    const saved = localStorage.getItem("folioiq_portfolio");
    if (saved) {
      setPortfolio(JSON.parse(saved));
    } else {
      const tv = DEFAULT_FUNDS.reduce((s, f) => s + f.value, 0);
      const ti = DEFAULT_FUNDS.reduce((s, f) => s + f.invested, 0);
      setPortfolio({
        fileName: "Demo",
        uploadDate: new Date().toISOString(),
        funds: DEFAULT_FUNDS,
        summary: {
          currentValue: tv,
          totalInvested: ti,
          totalReturns: (((tv - ti) / ti) * 100).toFixed(2),
          fundCount: DEFAULT_FUNDS.length,
        },
      });
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const funds = portfolio.funds || DEFAULT_FUNDS;
  const summary = portfolio.summary;
  const ret = (((summary.currentValue - summary.totalInvested) / summary.totalInvested) * 100).toFixed(2);

  const allocMap = {};
  funds.forEach((f) => {
    const t = f.category === "Liquid" || f.category === "Debt" ? "Debt" : f.category === "Hybrid" || f.category === "Balanced" ? "Hybrid" : "Equity";
    allocMap[t] = (allocMap[t] || 0) + f.value;
  });
  const assetAlloc = Object.keys(allocMap).map((k) => ({ name: k, value: allocMap[k] }));

  const catMap = {};
  funds.forEach((f) => {
    catMap[f.category] = (catMap[f.category] || 0) + f.value;
  });
  const catData = Object.keys(catMap)
    .map((k) => ({ name: k, value: catMap[k] }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/profile")} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-xl text-white">FolioIQ</span>
            {email && <span className="text-sm text-slate-500">| {email}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/upload")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
              <Upload className="w-4 h-4" /> Upload New
            </button>
            <Bell className="w-5 h-5 text-slate-400" />
            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Health Score */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-xl">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Portfolio Health Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold text-white">80</span>
                <span className="text-slate-500">/100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 mr-1" /> Healthy
              </span>
              <p className="text-sm text-slate-500 mt-1">{summary.fundCount} funds</p>
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "80%" }} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-slate-400 uppercase tracking-wider">Current Value</p>
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatL(summary.currentValue)}</p>
            <p className="text-sm text-emerald-400 mt-1">+{ret}% all time</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-slate-400 uppercase tracking-wider">Total Invested</p>
              <Banknote className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatL(summary.totalInvested)}</p>
            <p className="text-sm text-slate-500 mt-1">Across {summary.fundCount} funds</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-slate-400 uppercase tracking-wider">Total Returns</p>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">+{ret}%</p>
            <p className="text-sm text-slate-500 mt-1">XIRR: 13.7%</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-slate-400 uppercase tracking-wider">Monthly SIP</p>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹28.5K</p>
            <p className="text-sm text-slate-500 mt-1">6 active SIPs</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <PieIcon className="w-5 h-5 text-emerald-400" /> Asset Allocation
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetAlloc} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {assetAlloc.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
                  formatter={(v) => formatL(v)} 
                />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-blue-400" /> Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={catData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: "#64748b" }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#94a3b8" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
                  formatter={(v) => formatL(v)} 
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800/50 backdrop-blur-sm mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-purple-400" /> Monthly Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={[
                { m: "Jan", D: 8, E: 12, H: 10 },
                { m: "Feb", D: 7, E: 8, H: 6 },
                { m: "Mar", D: 6, E: 5, H: 4 },
                { m: "Apr", D: 7, E: 9, H: 7 },
                { m: "May", D: 8, E: 11, H: 9 },
                { m: "Jun", D: 7, E: 10, H: 8 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="m" tick={{ fill: "#64748b" }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: "#64748b" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
              />
              <Legend wrapperStyle={{ color: "#94a3b8" }} />
              <Area type="monotone" dataKey="D" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="E" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="H" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Holdings Table */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800/50">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Layers className="w-5 h-5 text-blue-400" /> Holdings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fund</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Invested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Value</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Returns</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {funds.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200">{f.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{f.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400">{formatFull(f.invested)}</td>
                    <td className="px-6 py-4 text-right font-medium text-white">{formatFull(f.value)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs border ${f.returns >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {f.returns >= 0 ? "+" : ""}{f.returns}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
