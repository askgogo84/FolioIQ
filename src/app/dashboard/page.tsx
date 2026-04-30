"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Wallet, Clock, PieChart as PieIcon, Activity, Upload, Bell, User, Home, Layers, BarChart3, Sparkles, Banknote, ArrowUpRight } from "lucide-react";

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

function formatL(value) { return `?${(value/100000).toFixed(2)}L`; }
function formatFull(value) { return `?${value.toLocaleString('en-IN')}`; }

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
      const tv = DEFAULT_FUNDS.reduce((s,f)=>s+f.value,0);
      const ti = DEFAULT_FUNDS.reduce((s,f)=>s+f.invested,0);
      setPortfolio({ fileName:"Demo", uploadDate:new Date().toISOString(), funds:DEFAULT_FUNDS, summary:{currentValue:tv, totalInvested:ti, totalReturns:(((tv-ti)/ti)*100).toFixed(2), fundCount:DEFAULT_FUNDS.length} });
    }
  }, []);

  if (!portfolio) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>;

  const funds = portfolio.funds || DEFAULT_FUNDS;
  const summary = portfolio.summary;
  const ret = (((summary.currentValue - summary.totalInvested)/summary.totalInvested)*100).toFixed(2);

  const assetAlloc = Object.entries(funds.reduce((a,f)=>{
    const t = f.category==='Liquid'||f.category==='Debt'?'Debt':f.category==='Hybrid'||f.category==='Balanced'?'Hybrid':'Equity';
    a[t]=(a[t]||0)+f.value; return a;
  },{})).map(([n,v])=>({name:n,value:v}));

  const catData = Object.entries(funds.reduce((a,f)=>{a[f.category]=(a[f.category]||0)+f.value;return a;},{})).map(([n,v])=>({name:n,value:v})).sort((a,b)=>b.value-a.value);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={()=>router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg"><Home className="w-5 h-5"/></button>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-xl">FolioIQ</span>
            {email && <span className="text-sm text-gray-500">| {email}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={()=>router.push('/upload')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-emerald-700">
              <Upload className="w-4 h-4"/> Upload New
            </button>
            <Bell className="w-5 h-5 text-gray-500"/>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><User className="w-4 h-4"/></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Health Score */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-white">
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 uppercase">Portfolio Health Score</p>
              <div className="flex items-baseline gap-2 mt-1"><span className="text-5xl font-bold">80</span><span className="text-gray-400">/100</span></div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-4 h-4 mr-1"/> Healthy</span>
              <p className="text-sm text-gray-400 mt-1">{summary.fundCount} funds</p>
            </div>
          </div>
          <div className="h-2 bg-gray-700 rounded-full"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{width:'80%'}}/></div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {label:"Current Value", icon:Wallet, val:formatL(summary.currentValue), sub:`+${ret}% all time`, color:"text-emerald-600"},
            {label:"Total Invested", icon:Banknote, val:formatL(summary.totalInvested), sub:`Across ${summary.fundCount} funds`, color:"text-gray-500"},
            {label:"Total Returns", icon:TrendingUp, val:`+${ret}%`, sub:"XIRR: 13.7%", color:"text-emerald-600"},
            {label:"Monthly SIP", icon:Clock, val:"?28.5K", sub:"6 active SIPs", color:"text-gray-500"}
          ].map((card,i)=>(
            <div key={i} className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between mb-2"><p className="text-sm text-gray-500 uppercase">{card.label}</p><card.icon className="w-5 h-5 text-gray-400"/></div>
              <p className="text-2xl font-bold">{card.val}</p>
              <p className={`text-sm mt-1 ${card.color}`}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieIcon className="w-5 h-5 text-emerald-500"/> Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={assetAlloc} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{assetAlloc.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={(v)=>formatL(v)}/><Legend/></PieChart></ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500"/> Category Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}><BarChart data={catData} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tickFormatter={(v)=>`?${(v/100000).toFixed(0)}L`}/><YAxis type="category" dataKey="name" width={100}/><Tooltip formatter={(v)=>formatL(v)}/><Bar dataKey="value" fill="#00C49F" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl p-6 border mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500"/> Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={300}><AreaChart data={[{m:'Jan',D:8,E:12,H:10},{m:'Feb',D:7,E:8,H:6},{m:'Mar',D:6,E:5,H:4},{m:'Apr',D:7,E:9,H:7},{m:'May',D:8,E:11,H:9},{m:'Jun',D:7,E:10,H:8}]}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis tickFormatter={(v)=>`${v}%`}/><Tooltip/><Legend/><Area type="monotone" dataKey="D" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6}/><Area type="monotone" dataKey="E" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.6}/><Area type="monotone" dataKey="H" stackId="1" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6}/></AreaChart></ResponsiveContainer>
        </div>

        {/* Holdings */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-6 border-b"><h3 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-blue-500"/> Holdings</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fund</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Invested</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Returns</th></tr></thead>
              <tbody className="divide-y">
                {funds.map((f,i)=>(
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><p className="font-medium">{f.name}</p></td>
                    <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">{f.category}</span></td>
                    <td className="px-6 py-4 text-right">{formatFull(f.invested)}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatFull(f.value)}</td>
                    <td className="px-6 py-4 text-right"><span className={`px-2.5 py-0.5 rounded-full text-xs ${f.returns>=0?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-800'}`}>{f.returns>=0?'+':''}{f.returns}%</span></td>
                  </tr>
                ))}
n              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
