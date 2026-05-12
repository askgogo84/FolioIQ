
"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const TARGET = { Equity:70, Debt:10, Gold:10, Hybrid:10 };
const CURRENT = { Equity:73, Debt:4, Gold:13, Hybrid:8, Other:2 };
const COLORS: Record<string,string> = { Equity:"#16a34a", Debt:"#2563eb", Gold:"#ca8a04", Hybrid:"#d97706", Other:"#64748b" };

const ACTIONS = [
  { action:"Sell", fund:"Invesco Gold ETF FoF", from:13, to:10, amt:168000, reason:"Gold over target by 3%. Book partial gains." },
  { action:"Buy", fund:"SBI Low Duration Fund", from:4, to:10, amt:325000, reason:"Debt underweight. Add safety cushion." },
  { action:"Sell", fund:"ICICI Pru Technology", from:4, to:0, amt:206017, reason:"Negative alpha. Exit and redeploy to Axis Multicap." },
  { action:"Buy", fund:"Axis Multicap Fund", from:4, to:8, amt:250000, reason:"Strong alpha +6.8%. Increase allocation." },
];

const driftData = Object.keys(TARGET).map(k=>({
  name:k, current:CURRENT[k as keyof typeof CURRENT]||0, target:TARGET[k as keyof typeof TARGET]||0,
  drift:((CURRENT[k as keyof typeof CURRENT]||0)-(TARGET[k as keyof typeof TARGET]||0)),
}));

export default function Rebalance() {
  const [done, setDone] = useState<number[]>([]);
  const totalDrift = driftData.reduce((s,d)=>s+Math.abs(d.drift),0);

  return (
    <AppLayout title="Smart Rebalance" subtitle="Your portfolio has drifted from target allocation — here's the plan">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Drift score */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="8"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke={totalDrift>15?"#dc2626":totalDrift>8?"#d97706":"#16a34a"} strokeWidth="8"
                  strokeDasharray={`${(1-totalDrift/40)*163} 163`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-[14px] font-black text-gray-900">{Math.round(100-totalDrift*2)}</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Balance Score</div>
              <div className="text-[16px] font-bold text-gray-900">{totalDrift>15?"Off-balance":totalDrift>8?"Slight drift":"Well balanced"}</div>
              <div className="text-[11px] text-gray-500">{totalDrift.toFixed(0)}% total drift</div>
            </div>
          </div>

          {driftData.filter(d=>Math.abs(d.drift)>2).slice(0,2).map((d,i)=>(
            <div key={i} className={`bg-white rounded-2xl border p-5 ${d.drift>0?"border-amber-100":"border-blue-100"}`}>
              <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">{d.name}</div>
              <div className="flex items-end gap-2">
                <span className="text-[22px] font-black text-gray-900">{d.current}%</span>
                <span className={`text-[12px] font-semibold mb-0.5 ${d.drift>0?"text-amber-600":"text-blue-600"}`}>
                  {d.drift>0?"↑":"↓"} {Math.abs(d.drift)}% vs target {d.target}%
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${d.current}%`,backgroundColor:COLORS[d.name]}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Drift chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-[13px] font-bold text-gray-900 mb-4">Current vs Target Allocation</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={driftData} barSize={24} barGap={4}>
              <XAxis dataKey="name" stroke="#e2e8f0" fontSize={11} tick={{fill:"#9ca3af"}} tickLine={false} axisLine={false}/>
              <YAxis stroke="#e2e8f0" fontSize={11} tick={{fill:"#9ca3af"}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`}/>
              <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,fontSize:11}} formatter={(v:number)=>`${v}%`}/>
              <Bar dataKey="current" name="Current" radius={[4,4,0,0]}>
                {driftData.map((d,i)=><Cell key={i} fill={COLORS[d.name]}/>)}
              </Bar>
              <Bar dataKey="target" name="Target" radius={[4,4,0,0]} fill="#e2e8f0"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action plan */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-bold text-gray-900">Rebalance Action Plan</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Execute in order · {done.length}/{ACTIONS.length} completed</div>
            </div>
            <div className="hidden sm:block text-[12px] text-gray-500">
              Net: Buy ₹{((ACTIONS.filter(a=>a.action==="Buy").reduce((s,a)=>s+a.amt,0)-ACTIONS.filter(a=>a.action==="Sell").reduce((s,a)=>s+a.amt,0))/100000).toFixed(1)}L
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {ACTIONS.map((a,i)=>{
              const isDone = done.includes(i);
              return (
                <div key={i} className={`px-4 sm:px-5 py-4 flex items-start gap-3 transition-colors ${isDone?"bg-gray-50 opacity-60":""}`}>
                  <button onClick={()=>setDone(d=>d.includes(i)?d.filter(x=>x!==i):[...d,i])}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${isDone?"bg-gray-900 border-gray-900":"border-gray-300 hover:border-gray-900"}`}>
                    {isDone&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${a.action==="Buy"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-600"}`}>{a.action}</span>
                      <span className="text-[13px] font-semibold text-gray-900">{a.fund}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1">{a.reason}</div>
                  </div>
                  <div className={`text-[14px] font-black flex-shrink-0 ${a.action==="Buy"?"text-emerald-600":"text-red-600"}`}>
                    {a.action==="Buy"?"+":"-"}₹{(a.amt/100000).toFixed(1)}L
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
