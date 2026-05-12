
"use client";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

const PORTFOLIO_FUNDS = [
  { name:"Invesco India Gold ETF FoF", category:"Gold - ETF FoF", returns1Y:34.69, returns3Y:15.2, invested:329984, value:723777, expense:0.15, aum:450, sip:5500 },
  { name:"Parag Parikh Flexi Cap", category:"Equity - Flexi Cap", returns1Y:16.81, returns3Y:14.2, invested:374467, value:633035, expense:0.94, aum:45000, sip:5000 },
  { name:"Nippon India Small Cap", category:"Equity - Small Cap", returns1Y:16.47, returns3Y:18.5, invested:361249, value:522495, expense:0.82, aum:32000, sip:10000 },
  { name:"Axis Multicap Fund", category:"Equity - Multi Cap", returns1Y:21.21, returns3Y:18.8, invested:102799, value:215804, expense:0.87, aum:9500, sip:0 },
  { name:"ICICI Pru ELSS Tax Saver", category:"Equity - ELSS", returns1Y:12.89, returns3Y:13.5, invested:200000, value:277737, expense:1.15, aum:15000, sip:0 },
  { name:"PGIM India Flexi Cap", category:"Equity - Flexi Cap", returns1Y:4.06, returns3Y:8.2, invested:380000, value:361021, expense:0.89, aum:8500, sip:10000 },
  { name:"ICICI Prudential Technology", category:"Equity - Sectoral Technology", returns1Y:-14.15, returns3Y:8.5, invested:240000, value:206017, expense:1.25, aum:11000, sip:10000 },
  { name:"HDFC Flexi Cap Fund", category:"Equity - Flexi Cap", returns1Y:4.80, returns3Y:12.1, invested:280000, value:263243, expense:0.95, aum:18000, sip:10000 },
  { name:"Invesco India Infrastructure", category:"Equity - Sectoral Infrastructure", returns1Y:3.99, returns3Y:15.2, invested:260000, value:249813, expense:1.05, aum:3800, sip:10000 },
  { name:"Mirae Asset ELSS", category:"Equity - ELSS", returns1Y:11.65, returns3Y:11.2, invested:170000, value:188622, expense:0.72, aum:18000, sip:6000 },
  { name:"Axis ELSS Tax Saver", category:"Equity - ELSS", returns1Y:11.76, returns3Y:10.5, invested:140000, value:155247, expense:0.68, aum:28000, sip:0 },
  { name:"Nippon India Multi Cap", category:"Equity - Multi Cap", returns1Y:-0.62, returns3Y:16.2, invested:111000, value:109670, expense:0.88, aum:7800, sip:10000 },
];

const fmt = (v:number) => v>=100000?`₹${(v/100000).toFixed(1)}L`:`₹${Math.round(v).toLocaleString()}`;

const sigStyle = (signal:string) =>
  signal==="BUY"?{bg:"bg-emerald-50 border-emerald-200",text:"text-emerald-700",dot:"bg-emerald-500",badge:"bg-emerald-100"}
  :signal==="HOLD"?{bg:"bg-blue-50 border-blue-200",text:"text-blue-700",dot:"bg-blue-500",badge:"bg-blue-100"}
  :signal==="REVIEW"?{bg:"bg-amber-50 border-amber-200",text:"text-amber-700",dot:"bg-amber-500",badge:"bg-amber-100"}
  :{bg:"bg-red-50 border-red-200",text:"text-red-700",dot:"bg-red-500",badge:"bg-red-100"};

export default function Intelligence() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [filter, setFilter] = useState<"all"|"buy"|"hold"|"review"|"sell">("all");
  const [methodology, setMethodology] = useState("");

  useEffect(()=>{
    fetch('/api/intelligence', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ funds: PORTFOLIO_FUNDS })
    }).then(r=>r.json()).then(d=>{
      setAnalyses(d.analyses || []);
      setMethodology(d.methodology || '');
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  const filtered = filter==="all"?analyses
    :analyses.filter(a=>a.signal?.toLowerCase()===filter.toUpperCase()||a.signal===filter.toUpperCase());

  const counts = {
    buy: analyses.filter(a=>a.signal==="BUY").length,
    hold: analyses.filter(a=>a.signal==="HOLD").length,
    review: analyses.filter(a=>a.signal==="REVIEW").length,
    sell: analyses.filter(a=>a.signal==="SELL").length,
  };

  const totalVal = PORTFOLIO_FUNDS.reduce((s,f)=>s+f.value,0);
  const weightedRet = PORTFOLIO_FUNDS.reduce((s,f)=>s+f.returns1Y*(f.value/totalVal),0);

  return (
    <AppLayout title="AI Insights" subtitle="Multi-source intelligence — quantitative scoring + web research synthesis">
      <div className="px-5 sm:px-8 py-6 space-y-5">

        {/* Methodology banner */}
        <div className="bg-gray-900 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">🔬</span>
          <div>
            <div className="text-white font-bold text-[14px] mb-1">How we generate these signals — no hallucination</div>
            <div className="text-gray-400 text-[12px] leading-relaxed">
              Each fund is scored using <strong className="text-gray-200">quantitative metrics</strong> (1Y/3Y CAGR vs category benchmark, expense ratio, AUM size) + <strong className="text-gray-200">web search</strong> across Freefincal, ValueResearch, Morningstar India, Reddit r/IndiaInvestments, ET Markets. We cite sources. We show our working. Signals backed by data, not opinion.
            </div>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:"Buy / Star",val:counts.buy,color:"text-emerald-700",bg:"bg-emerald-50 border-emerald-200"},
            {label:"Hold",val:counts.hold,color:"text-blue-700",bg:"bg-blue-50 border-blue-200"},
            {label:"Review",val:counts.review,color:"text-amber-700",bg:"bg-amber-50 border-amber-200"},
            {label:"Sell / Exit",val:counts.sell,color:"text-red-700",bg:"bg-red-50 border-red-200"},
          ].map((k,i)=>(
            <div key={i} className={`rounded-2xl border p-5 ${k.bg}`}>
              <div className={`text-[34px] font-black leading-none ${k.color}`}>{k.val}</div>
              <div className="text-[12px] font-semibold text-gray-500 mt-1">{k.label}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{Math.round(k.val/Math.max(analyses.length,1)*100)}% of portfolio</div>
            </div>
          ))}
        </div>

        {/* Portfolio metrics */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap gap-6 shadow-sm">
          {[
            {l:"Weighted 1Y Return",v:`+${weightedRet.toFixed(1)}%`,c:"text-emerald-600"},
            {l:"Portfolio XIRR",v:"13.3%",c:"text-emerald-600"},
            {l:"vs Nifty 50 (1Y)",v:"Nifty: +13.1%",c:"text-gray-700"},
            {l:"Outperformance",v:`+${(weightedRet-13.1).toFixed(1)}%`,c:"text-emerald-600"},
            {l:"Funds analyzed",v:`${analyses.length}`,c:"text-gray-900"},
          ].map((m,i)=>(
            <div key={i}>
              <div className="text-[11px] text-gray-400 uppercase tracking-widest">{m.l}</div>
              <div className={`text-[20px] font-black mt-0.5 ${m.c}`}>{m.v}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[
              {id:"all",label:`All (${analyses.length})`},
              {id:"buy",label:`Buy (${counts.buy})`},
              {id:"hold",label:`Hold (${counts.hold})`},
              {id:"review",label:`Review (${counts.review})`},
              {id:"sell",label:`Sell (${counts.sell})`},
            ].map(t=>(
              <button key={t.id} onClick={()=>setFilter(t.id as any)}
                className={`flex-1 py-4 sm:py-5 text-[13px] sm:text-[14px] font-bold transition-all border-b-2 ${
                  filter===t.id?"text-gray-900 border-gray-900 bg-white":"text-gray-400 border-transparent hover:text-gray-600"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin"/>
              <span className="text-[14px] text-gray-500">Analyzing {PORTFOLIO_FUNDS.length} funds with web search...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((fund, i) => {
                const ss = sigStyle(fund.signal||"HOLD");
                const isOpen = expanded === fund.name;
                const retPct = ((fund.value-fund.invested)/fund.invested*100);
                return (
                  <div key={i}>
                    <button onClick={()=>setExpanded(isOpen?null:fund.name)}
                      className="w-full text-left px-5 sm:px-6 py-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {/* Score bar */}
                        <div className="hidden sm:flex flex-col items-center gap-1.5 flex-shrink-0 w-10">
                          <div className="text-[13px] font-black text-gray-900">{fund.score}</div>
                          <div className="w-2 h-14 bg-gray-100 rounded-full overflow-hidden">
                            <div className="w-full rounded-full transition-all" style={{
                              height:`${fund.score}%`,
                              marginTop:`${100-fund.score}%`,
                              backgroundColor: fund.score>=70?"#16a34a":fund.score>=50?"#d97706":"#ef4444"
                            }}/>
                          </div>
                          <div className="text-[9px] text-gray-400">score</div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[15px] font-bold text-gray-900 truncate">{fund.name}</span>
                            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fund.category.replace("Equity - ","").replace("Gold - ","")}</span>
                          </div>
                          {/* Reasons preview */}
                          <div className="text-[12px] text-gray-500 truncate">{fund.reasons?.[0]}</div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className={`text-[15px] font-black ${retPct>=0?"text-emerald-600":"text-red-600"}`}>{retPct>=0?"+":""}{retPct.toFixed(1)}%</div>
                            <div className="text-[11px] text-gray-400">{fmt(fund.value)}</div>
                          </div>
                          <span className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full border ${ss.bg} ${ss.text}`}>
                            <span className={`w-2 h-2 rounded-full ${ss.dot}`}/>
                            {fund.signal}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className={`transition-transform flex-shrink-0 ${isOpen?"rotate-180":""}`}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className={`px-5 sm:px-6 pb-6 ${ss.bg} border-t border-opacity-50`}>
                        <div className="grid sm:grid-cols-2 gap-5 mt-5">
                          {/* Quant evidence */}
                          <div>
                            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-3">📊 Quantitative Evidence</div>
                            <div className="space-y-2">
                              {(fund.reasons||[]).map((r:string,ri:number)=>(
                                <div key={ri} className="flex items-start gap-2 text-[13px] text-gray-700">
                                  <span className={`mt-0.5 flex-shrink-0 ${fund.signal==="BUY"||fund.signal==="HOLD"?"text-emerald-500":"text-red-500"}`}>
                                    {fund.signal==="BUY"||fund.signal==="HOLD"?"✓":"✗"}
                                  </span>
                                  {r}
                                </div>
                              ))}
                            </div>
                            {/* Metrics grid */}
                            <div className="grid grid-cols-3 gap-2 mt-4">
                              {[
                                {l:"1Y Return",v:`${fund.returns1Y?.toFixed(1)}%`,c:fund.returns1Y>=10?"text-emerald-600":"text-red-600"},
                                {l:"Expense",v:`${fund.expense||"N/A"}%`,c:fund.expense<=0.5?"text-emerald-600":"text-gray-700"},
                                {l:"AUM",v:fund.aum>=1000?`₹${(fund.aum/1000).toFixed(0)}KCr`:`₹${fund.aum}Cr`},
                              ].map((m,mi)=>(
                                <div key={mi} className="bg-white rounded-xl p-3 border border-gray-100">
                                  <div className="text-[10px] text-gray-400">{m.l}</div>
                                  <div className={`text-[15px] font-black mt-0.5 ${m.c||"text-gray-900"}`}>{m.v}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* AI recommendation + alternatives */}
                          <div>
                            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-3">🤖 AI Recommendation</div>
                            <div className={`p-4 rounded-2xl border ${ss.bg} mb-4`}>
                              <div className="text-[13px] font-bold text-gray-900 mb-1">
                                {fund.signal==="BUY"?"✅ Continue SIP and consider increasing allocation"
                                :fund.signal==="HOLD"?"⏸️ Hold — monitor for 2 quarters before deciding"
                                :fund.signal==="REVIEW"?"🔍 Review — underperforming but not an emergency exit"
                                :"🛑 Exit — consistent underperformance with better alternatives available"}
                              </div>
                              {fund.webInsight&&(
                                <div className="text-[12px] text-gray-600 mt-2 leading-relaxed">
                                  <strong>Web research:</strong> {fund.webInsight}
                                  {fund.webSource&&<span className="text-gray-400 ml-1">— {fund.webSource}</span>}
                                </div>
                              )}
                              <div className="text-[11px] text-gray-400 mt-2">
                                Confidence: {fund.confidence==="high"?"🟢 High (web-verified)":fund.confidence==="medium"?"🟡 Medium":fund.confidence==="quantitative"?"📊 Quantitative scoring":"🔵 Data-driven"}
                              </div>
                            </div>
                            {(fund.signal==="SELL"||fund.signal==="REVIEW")&&fund.alternatives?.length>0&&(
                              <div>
                                <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">💡 Better Alternatives</div>
                                <div className="space-y-1.5">
                                  {fund.alternatives.map((alt:string,ai:number)=>(
                                    <div key={ai} className="flex items-center gap-2 text-[13px] text-gray-700 bg-white p-2.5 rounded-xl border border-gray-100">
                                      <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-black flex items-center justify-center flex-shrink-0">{ai+1}</span>
                                      {alt}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 text-center pb-4">
          Signals based on quantitative scoring + web search synthesis. Not SEBI-registered investment advice. Always consult a qualified financial advisor before acting.
        </p>
      </div>
    </AppLayout>
  );
}
