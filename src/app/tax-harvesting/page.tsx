
"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const HARVEST_FUNDS = [
  { name:"Invesco Gold ETF FoF", cat:"Gold", invested:329984, current:723777, units:17323, nav:41.78, days:1461, gain:393793, taxable:268793, tax:33599 },
  { name:"Parag Parikh Flexi Cap", cat:"Flexi Cap", invested:374467, current:633035, units:4042, nav:82.69, days:487, gain:258568, taxable:258568, tax:51714 },
  { name:"Nippon India Small Cap", cat:"Small Cap", invested:361249, current:522495, units:1461, nav:168.02, days:400, gain:161246, taxable:161246, tax:32249 },
  { name:"Axis Multicap Fund", cat:"Multi Cap", invested:102799, current:215804, units:0, nav:0, days:700, gain:113005, taxable:0, tax:0 },
];

const fmt = (v: number) => v>=100000?`₹${(v/100000).toFixed(2)}L`:`₹${Math.round(v).toLocaleString("en-IN")}`;

const LTCG_EXEMPT = 125000;
const totalEligibleGain = HARVEST_FUNDS.filter(f=>f.days>=365).reduce((s,f)=>s+f.gain,0);
const taxFreeGain = Math.min(LTCG_EXEMPT, totalEligibleGain);
const taxSaved = Math.round(taxFreeGain * 0.125 * 1.04);

export default function TaxHarvesting() {
  const [done, setDone] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const STEPS = [
    { title:"Identify eligible gains", desc:"Funds with LTCG gains held 12+ months qualify for ₹1.25L annual exemption." },
    { title:"Calculate redemption units", desc:"Redeem only enough units to book ₹1.25L gains — the rest stays invested." },
    { title:"Same-day reinvestment", desc:"Reinvest immediately in same fund or equivalent. This resets your cost basis." },
    { title:"Wait for settlement", desc:"Equity fund redemptions settle in T+2 days. Reinvestment starts after that." },
  ];

  return (
    <AppLayout title="Tax Harvesting" subtitle={`Save up to ${fmt(taxSaved)} in LTCG taxes this financial year`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Hero metric */}
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-500 uppercase tracking-widest mb-2">Tax saved this FY</div>
              <div className="text-[40px] sm:text-[52px] font-black text-emerald-400 tracking-tight leading-none">{fmt(taxSaved)}</div>
              <div className="text-[13px] text-gray-400 mt-2">Book ₹1.25L LTCG gains tax-free · Reinvest same day · No lock-in</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l:"LTCG Exemption", v:"₹1.25L/yr" },
                { l:"Tax Rate", v:"12.5% + cess" },
                { l:"Eligible gain", v:fmt(Math.min(LTCG_EXEMPT, totalEligibleGain)) },
                { l:"Funds eligible", v:`${HARVEST_FUNDS.filter(f=>f.days>=365).length} funds` },
              ].map((k,i)=>(
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="text-[10px] text-gray-500 mb-1">{k.l}</div>
                  <div className="text-[13px] font-bold text-white">{k.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-[13px] font-bold text-gray-900 mb-4">How to harvest in 4 steps</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STEPS.map((s,i)=>(
              <div key={i} className={`p-3 rounded-xl border transition-all cursor-pointer ${step===i?"bg-gray-900 border-gray-900":"bg-gray-50 border-gray-100 hover:border-gray-200"}`} onClick={()=>setStep(i)}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${step===i?"text-emerald-400":"text-gray-400"}`}>Step {i+1}</div>
                <div className={`text-[12px] font-semibold leading-snug ${step===i?"text-white":"text-gray-700"}`}>{s.title}</div>
                {step===i&&<div className="text-[11px] text-gray-400 mt-2 leading-relaxed">{s.desc}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Fund table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="text-[14px] font-bold text-gray-900">Harvest Plan</div>
              <div className="text-[11px] text-gray-400 mt-0.5">FY 2025–26 · Budget 2024 rules</div>
            </div>
            <div className="text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              {done.length}/{HARVEST_FUNDS.filter(f=>f.days>=365).length} completed
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {HARVEST_FUNDS.map((f,i)=>{
              const eligible = f.days >= 365;
              const isDone = done.includes(f.name);
              return (
                <div key={i} className={`px-4 sm:px-5 py-4 transition-colors ${isDone?"bg-emerald-50":""}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={()=>setDone(d=>d.includes(f.name)?d.filter(x=>x!==f.name):[...d,f.name])}
                      disabled={!eligible}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${isDone?"bg-emerald-500 border-emerald-500":eligible?"border-gray-300 hover:border-emerald-400":"border-gray-200 opacity-40 cursor-not-allowed"}`}>
                      {isDone&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[13px] font-bold ${isDone?"text-emerald-700 line-through":"text-gray-900"}`}>{f.name}</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f.cat}</span>
                        {!eligible&&<span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">STCG — wait {Math.ceil((365-f.days)/30)}mo</span>}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                        {[
                          { l:"Gain", v:fmt(f.gain), c:f.gain>0?"text-emerald-600":"text-red-600" },
                          { l:"Held", v:`${Math.floor(f.days/365)}y ${Math.floor((f.days%365)/30)}m` },
                          { l:"LTCG taxable", v:f.taxable>0?fmt(f.taxable):"₹0" },
                          { l:"Tax saved", v:f.tax>0?fmt(f.tax):"Exempt", c:f.tax>0?"text-emerald-600":undefined },
                        ].map((d,di)=>(
                          <div key={di} className="bg-gray-50 rounded-lg px-2 py-1.5">
                            <div className="text-[9px] text-gray-400 uppercase tracking-wide">{d.l}</div>
                            <div className={`text-[12px] font-semibold ${d.c||"text-gray-800"}`}>{d.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
            <div className="text-[11px] text-amber-700 leading-relaxed">
              ⚡ <strong>Budget 2024:</strong> LTCG on equity funds taxed at 12.5% (above ₹1.25L/year). STCG taxed at 20%. Book gains before March 31 to use this year's exemption. Reinvest same day — no capital loss, just resets cost basis.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
