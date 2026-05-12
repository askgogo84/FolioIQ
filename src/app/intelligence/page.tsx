
"use client";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const FUNDS = [
  { name:"Invesco Gold ETF FoF", cat:"Gold", val:723776, ret:34.69, risk:"Low", rating:"Buy", health:92, exp:0.15, alpha:8.2, sip:5500 },
  { name:"Parag Parikh Flexi Cap", cat:"Flexi Cap", val:633035, ret:16.81, risk:"Moderate", rating:"Buy", health:88, exp:0.94, alpha:3.1, sip:5000 },
  { name:"Nippon India Small Cap", cat:"Small Cap", val:522494, ret:16.47, risk:"High", rating:"Hold", health:75, exp:0.82, alpha:2.8, sip:10000 },
  { name:"Axis Multicap Fund", cat:"Multi Cap", val:215804, ret:21.21, risk:"Moderate", rating:"Buy", health:90, exp:0.87, alpha:6.8, sip:0 },
  { name:"ICICI Pru ELSS", cat:"ELSS", val:277737, ret:12.89, risk:"Moderate", rating:"Buy", health:78, exp:1.15, alpha:1.2, sip:0 },
  { name:"PGIM India Flexi Cap", cat:"Flexi Cap", val:361021, ret:4.06, risk:"Moderate", rating:"Sell", health:42, exp:0.89, alpha:-2.1, sip:10000 },
  { name:"ICICI Pru Technology", cat:"Sectoral", val:206017, ret:-14.15, risk:"Very High", rating:"Exit", health:25, exp:1.25, alpha:-8.5, sip:10000 },
  { name:"HDFC Flexi Cap", cat:"Flexi Cap", val:263243, ret:4.80, risk:"Moderate", rating:"Sell", health:45, exp:0.95, alpha:-1.5, sip:10000 },
  { name:"Invesco Infrastructure", cat:"Sectoral", val:249813, ret:3.99, risk:"High", rating:"Sell", health:38, exp:1.05, alpha:-3.2, sip:10000 },
  { name:"Mirae Asset ELSS", cat:"ELSS", val:188622, ret:11.65, risk:"Moderate", rating:"Hold", health:72, exp:0.72, alpha:0.9, sip:6000 },
];

const ratingStyle = (r: string) => r==="Buy"||r==="Star" ? {bg:"bg-emerald-50",text:"text-emerald-700",dot:"bg-emerald-500"}
  : r==="Hold" ? {bg:"bg-amber-50",text:"text-amber-700",dot:"bg-amber-500"}
  : {bg:"bg-red-50",text:"text-red-600",dot:"bg-red-500"};

const fmt = (v: number) => v>=100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString()}`;

const ALTERNATIVES: Record<string,string[]> = {
  "PGIM India Flexi Cap": ["Parag Parikh Flexi Cap (+16.8%)", "Mirae Asset Large & Midcap (+11.2%)", "Canara Robeco Flexi Cap (+13.1%)"],
  "ICICI Pru Technology": ["HDFC Mid Cap Opportunities (+22.4%)", "Axis Multicap Fund (+21.2%)", "Mirae Asset Large & Midcap (+11.2%)"],
  "HDFC Flexi Cap": ["Parag Parikh Flexi Cap (+16.8%)", "UTI Flexi Cap Fund (+14.2%)", "Kotak Flexi Cap Fund (+12.9%)"],
  "Invesco Infrastructure": ["ICICI Pru Large Cap Fund (+14.6%)", "Axis Multicap Fund (+21.2%)", "Mirae Asset Large Cap Fund (+13.8%)"],
};

export default function Intelligence() {
  const [filter, setFilter] = useState<"all"|"buy"|"hold"|"sell">("all");
  const [selected, setSelected] = useState<any>(null);
  const [showAlt, setShowAlt] = useState<string|null>(null);

  const buys = FUNDS.filter(f=>f.rating==="Buy"||f.rating==="Star");
  const holds = FUNDS.filter(f=>f.rating==="Hold");
  const sells = FUNDS.filter(f=>f.rating==="Sell"||f.rating==="Exit");
  const filtered = filter==="all"?FUNDS:filter==="buy"?buys:filter==="hold"?holds:sells;

  const totalVal = FUNDS.reduce((s,f)=>s+f.val,0);
  const weightedRet = FUNDS.reduce((s,f)=>s+f.ret*(f.val/totalVal),0);

  return (
    <AppLayout title="AI Insights" subtitle="Signal-based analysis for every fund in your portfolio">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Portfolio XIRR", val:"13.3%", sub:"Beating Nifty 50 (12%)", up:true },
            { label:"Buy signals", val:buys.length.toString(), sub:`${((buys.length/FUNDS.length)*100).toFixed(0)}% of holdings`, up:true },
            { label:"Sell / Exit", val:sells.length.toString(), sub:"Immediate action needed", up:false },
            { label:"Weighted return", val:`+${weightedRet.toFixed(1)}%`, sub:"Across all funds", up:true },
          ].map((k,i)=>(
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-all">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{k.label}</div>
              <div className={`text-[22px] font-black tracking-tight ${k.up?"text-gray-900":"text-red-600"}`}>{k.val}</div>
              <div className={`text-[11px] mt-1 ${k.up?"text-emerald-600":"text-red-500"}`}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Alert banner for sells */}
        {sells.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div className="text-[13px] font-bold text-red-800 mb-0.5">{sells.length} funds need immediate review</div>
              <div className="text-[12px] text-red-600">{sells.map(f=>f.name.split(" ").slice(0,2).join(" ")).join(", ")} — underperforming with negative alpha. Consider switching.</div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100">
            {[
              { id:"all", label:`All (${FUNDS.length})` },
              { id:"buy", label:`Buy / Star (${buys.length})` },
              { id:"hold", label:`Hold (${holds.length})` },
              { id:"sell", label:`Sell / Exit (${sells.length})` },
            ].map(tab=>(
              <button key={tab.id} onClick={()=>setFilter(tab.id as any)}
                className={`flex-1 py-3 text-[12px] sm:text-[13px] font-semibold transition-colors ${filter===tab.id?"text-gray-900 border-b-2 border-gray-900":"text-gray-400 hover:text-gray-600"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fund list */}
          <div className="divide-y divide-gray-50">
            {filtered.map((f, i) => {
              const rs = ratingStyle(f.rating);
              const gain = (f.val - f.val/(1+f.ret/100));
              const alts = ALTERNATIVES[f.name];
              return (
                <div key={i}>
                  <button onClick={() => setSelected(selected?.name===f.name?null:f)}
                    className="w-full text-left px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Health bar */}
                      <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0 w-8">
                        <div className="text-[10px] font-bold text-gray-900">{f.health}</div>
                        <div className="w-1.5 h-12 bg-gray-100 rounded-full overflow-hidden">
                          <div className="w-full rounded-full transition-all" style={{height:`${f.health}%`,backgroundColor:f.health>=70?"#16a34a":f.health>=50?"#d97706":"#dc2626",marginTop:`${100-f.health}%`}}/>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] sm:text-[14px] font-bold text-gray-900 truncate">{f.name}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{f.cat}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`text-[11px] font-bold ${f.ret>=0?"text-emerald-600":"text-red-600"}`}>{f.ret>=0?"+":""}{f.ret.toFixed(1)}%</span>
                          <span className="text-[11px] text-gray-400">Exp: {f.exp}%</span>
                          <span className={`text-[11px] font-medium ${f.alpha>=0?"text-emerald-600":"text-red-500"}`}>α {f.alpha>=0?"+":""}{f.alpha.toFixed(1)}</span>
                          {f.sip>0&&<span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">SIP ₹{f.sip.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-[12px] font-semibold text-gray-900">{fmt(f.val)}</div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${rs.bg} ${rs.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rs.dot}`}/>
                          {f.rating}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className={`transition-transform flex-shrink-0 ${selected?.name===f.name?"rotate-180":""}`}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {selected?.name===f.name && (
                    <div className="px-4 sm:px-5 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 mb-4">
                        {[
                          { l:"Current Value", v:fmt(f.val) },
                          { l:"Returns", v:`${f.ret>=0?"+":""}${f.ret.toFixed(2)}%`, c:f.ret>=0?"text-emerald-600":"text-red-600" },
                          { l:"Alpha vs benchmark", v:`${f.alpha>=0?"+":""}${f.alpha.toFixed(1)}%`, c:f.alpha>=0?"text-emerald-600":"text-red-500" },
                          { l:"Expense ratio", v:`${f.exp}% p.a.`, c:"text-gray-700" },
                        ].map((d,di)=>(
                          <div key={di} className="bg-white rounded-xl p-3 border border-gray-100">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{d.l}</div>
                            <div className={`text-[14px] font-bold ${d.c||"text-gray-900"}`}>{d.v}</div>
                          </div>
                        ))}
                      </div>

                      {/* AI Recommendation */}
                      <div className={`rounded-xl p-4 border ${ratingStyle(f.rating).bg} ${ratingStyle(f.rating).bg.replace("50","100/50")}`}>
                        <div className="text-[12px] font-bold text-gray-900 mb-1">
                          {f.rating==="Buy"||f.rating==="Star" ? "✅ Recommendation: Continue SIP & consider topping up" :
                           f.rating==="Hold" ? "⏸️ Recommendation: Hold — monitor for next 2 quarters" :
                           "🔴 Recommendation: Pause SIP, plan exit in next 3 months"}
                        </div>
                        <div className="text-[11px] text-gray-600 leading-relaxed">
                          {f.ret<0 ? `This fund has delivered ${f.ret.toFixed(1)}% returns with negative alpha of ${f.alpha.toFixed(1)}%, meaning it's underperforming its benchmark. The expense ratio of ${f.exp}% is high relative to returns.`
                          : f.ret<8 ? `Returns of ${f.ret.toFixed(1)}% are below the expected 10-12% for this category. Alpha of ${f.alpha.toFixed(1)}% shows marginal active management value.`
                          : `Excellent performance with ${f.ret.toFixed(1)}% returns and positive alpha of +${f.alpha.toFixed(1)}%. Fund manager is adding value above benchmark consistently.`}
                        </div>
                      </div>

                      {/* Alternatives */}
                      {alts && (
                        <div className="mt-3">
                          <button onClick={()=>setShowAlt(showAlt===f.name?null:f.name)}
                            className="text-[12px] font-semibold text-violet-700 hover:underline flex items-center gap-1">
                            {showAlt===f.name?"Hide":"Show"} alternatives
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={showAlt===f.name?"rotate-180":""}><polyline points="6 9 12 15 18 9"/></svg>
                          </button>
                          {showAlt===f.name && (
                            <div className="mt-2 space-y-1.5">
                              {alts.map((alt,ai)=>(
                                <div key={ai} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-100 text-[12px]">
                                  <span className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-[10px] flex-shrink-0">{ai+1}</span>
                                  <span className="text-gray-700">{alt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-gray-400 text-center pb-4">
          AI signals are based on historical performance, alpha, and expense ratios. Not SEBI-registered advice. Consult a financial advisor before making investment decisions.
        </p>
      </div>
    </AppLayout>
  );
}
