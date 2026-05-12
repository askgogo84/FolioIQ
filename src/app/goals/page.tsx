
"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const GOALS = [
  { id:1, name:"Retirement Corpus", emoji:"🏖️", target:20000000, current:5532844, monthly:91000, horizon:25, category:"Retirement" },
  { id:2, name:"Child's Education", emoji:"🎓", target:5000000, current:800000, monthly:15000, horizon:12, category:"Education" },
  { id:3, name:"Dream Home", emoji:"🏡", target:8000000, current:1500000, monthly:25000, horizon:8, category:"Property" },
  { id:4, name:"Emergency Fund", emoji:"🛡️", target:1800000, current:1781064, monthly:0, horizon:0, category:"Safety" },
];

const fmt = (v: number) => v>=10000000?`₹${(v/10000000).toFixed(1)}Cr`:v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${Math.round(v/1000)}K`;

export default function Goals() {
  const [selected, setSelected] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name:"", target:"", monthly:"", horizon:"" });

  return (
    <AppLayout title="Goal Planner" subtitle="Tag every fund to a life goal — never sell the wrong investment">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Goals grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GOALS.map(g=>{
            const pct = Math.min(100, Math.round((g.current/g.target)*100));
            const onTrack = pct >= Math.round((1-g.horizon/(g.horizon+10))*100);
            return (
              <button key={g.id} onClick={()=>setSelected(selected?.id===g.id?null:g)}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md hover:border-gray-200 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{g.emoji}</span>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900">{g.name}</div>
                      <div className="text-[11px] text-gray-400">{g.horizon>0?`${g.horizon} years`:"Ongoing"}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${onTrack||pct>=90?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>
                    {pct>=100?"✅ Done":onTrack?"On track":"Needs boost"}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-bold text-gray-900">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{width:`${pct}%`,background:pct>=100?"#16a34a":pct>=60?"#16a34a":"#d97706"}}/>
                  </div>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-gray-500">{fmt(g.current)} saved</span>
                  <span className="font-semibold text-gray-900">Goal: {fmt(g.target)}</span>
                </div>
                {selected?.id===g.id&&(
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                    {[
                      { l:"Monthly SIP", v:`₹${g.monthly.toLocaleString()}` },
                      { l:"Remaining", v:fmt(g.target-g.current) },
                      { l:"Projected (8% XIRR)", v:fmt(g.current*Math.pow(1.08,g.horizon)+g.monthly*12*((Math.pow(1.08,g.horizon)-1)/0.08)) },
                      { l:"Years to goal", v:g.horizon>0?`${g.horizon}y`:"Achieved" },
                    ].map((d,di)=>(
                      <div key={di} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="text-[10px] text-gray-400">{d.l}</div>
                        <div className="text-[13px] font-bold text-gray-900 mt-0.5">{d.v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}

          {/* Add goal */}
          <button onClick={()=>setAdding(!adding)}
            className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all hover:border-emerald-300 hover:bg-emerald-50 ${adding?"border-emerald-300 bg-emerald-50":"border-gray-200"}`}>
            {!adding?(
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <div className="text-[13px] font-semibold">Add new goal</div>
                <div className="text-[11px]">Tag a financial milestone</div>
              </div>
            ):(
              <div className="space-y-3 text-left" onClick={e=>e.stopPropagation()}>
                <div className="text-[13px] font-bold text-gray-900 mb-3">New Goal</div>
                {[
                  { label:"Goal name", key:"name", placeholder:"e.g. Retirement Corpus" },
                  { label:"Target amount (₹)", key:"target", placeholder:"e.g. 2,00,00,000" },
                  { label:"Monthly SIP (₹)", key:"monthly", placeholder:"e.g. 25,000" },
                  { label:"Time horizon (years)", key:"horizon", placeholder:"e.g. 20" },
                ].map(f=>(
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block mb-1">{f.label}</label>
                    <input placeholder={f.placeholder} value={newGoal[f.key as keyof typeof newGoal]}
                      onChange={e=>setNewGoal(g=>({...g,[f.key]:e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-emerald-400"/>
                  </div>
                ))}
                <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800">Save Goal</button>
              </div>
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <div className="text-[12px] font-semibold text-blue-800 mb-1">💡 FolioIQ Goal Protection</div>
          <div className="text-[12px] text-blue-700">When you tag funds to goals, FolioIQ will alert you before recommending a sell — so you never accidentally liquidate your emergency fund or education corpus.</div>
        </div>
      </div>
    </AppLayout>
  );
}
