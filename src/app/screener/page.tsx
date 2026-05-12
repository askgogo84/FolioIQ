
"use client";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/AppLayout";

const ALL_FUNDS = [
  // Large Cap
  {name:"Mirae Asset Large Cap",cat:"Large Cap",amc:"Mirae Asset",r1:14.5,r3:13.2,r5:11.8,exp:0.55,aum:25000,risk:"Moderate",rating:5,sip:1000,tag:"CONSISTENT"},
  {name:"Axis Bluechip Fund",cat:"Large Cap",amc:"Axis",r1:15.2,r3:12.5,r5:11.2,exp:0.95,aum:28000,risk:"Moderate",rating:4,sip:500,tag:"POPULAR"},
  {name:"HDFC Top 100 Fund",cat:"Large Cap",amc:"HDFC",r1:16.8,r3:14.1,r5:12.5,exp:1.05,aum:22000,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"ICICI Pru Bluechip",cat:"Large Cap",amc:"ICICI Pru",r1:15.6,r3:13.8,r5:12.1,exp:0.98,aum:30000,risk:"Moderate",rating:4,sip:100,tag:""},
  {name:"Nippon India Large Cap",cat:"Large Cap",amc:"Nippon",r1:13.9,r3:13.5,r5:11.5,exp:0.88,aum:15000,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"UTI Nifty 50 Index",cat:"Large Cap",amc:"UTI",r1:13.1,r3:11.8,r5:11.5,exp:0.18,aum:18000,risk:"Moderate",rating:5,sip:500,tag:"CHEAPEST"},
  {name:"Nippon Nifty 50 Index",cat:"Large Cap",amc:"Nippon",r1:13.0,r3:11.7,r5:11.4,exp:0.20,aum:42000,risk:"Moderate",rating:5,sip:100,tag:"LOW COST"},
  {name:"HDFC Nifty 50 Index",cat:"Large Cap",amc:"HDFC",r1:13.0,r3:11.7,r5:11.4,exp:0.20,aum:12000,risk:"Moderate",rating:5,sip:100,tag:""},
  {name:"Aditya Birla SL Frontline",cat:"Large Cap",amc:"ABSL",r1:13.8,r3:12.1,r5:10.8,exp:0.88,aum:22000,risk:"Moderate",rating:3,sip:500,tag:""},
  // Mid Cap
  {name:"Nippon India Growth Fund",cat:"Mid Cap",amc:"Nippon",r1:22.1,r3:18.5,r5:15.2,exp:0.82,aum:19000,risk:"High",rating:5,sip:500,tag:"CONSISTENT"},
  {name:"HDFC Mid Cap Opportunities",cat:"Mid Cap",amc:"HDFC",r1:21.5,r3:17.8,r5:14.8,exp:0.85,aum:35000,risk:"High",rating:5,sip:500,tag:"POPULAR"},
  {name:"Motilal Oswal Midcap",cat:"Mid Cap",amc:"Motilal",r1:24.5,r3:22.8,r5:16.5,exp:0.65,aum:8500,risk:"High",rating:5,sip:500,tag:"TOP PERFORMER"},
  {name:"Kotak Emerging Equity",cat:"Mid Cap",amc:"Kotak",r1:19.8,r3:16.5,r5:14.1,exp:0.78,aum:28000,risk:"High",rating:4,sip:500,tag:""},
  {name:"Axis Midcap Fund",cat:"Mid Cap",amc:"Axis",r1:18.5,r3:15.2,r5:13.8,exp:0.85,aum:15000,risk:"High",rating:4,sip:500,tag:""},
  {name:"SBI Magnum Midcap",cat:"Mid Cap",amc:"SBI",r1:20.2,r3:17.1,r5:14.0,exp:0.92,aum:14500,risk:"High",rating:4,sip:500,tag:""},
  {name:"Edelweiss Mid Cap Fund",cat:"Mid Cap",amc:"Edelweiss",r1:21.8,r3:18.2,r5:15.5,exp:0.72,aum:4800,risk:"High",rating:5,sip:500,tag:""},
  // Small Cap
  {name:"Nippon India Small Cap",cat:"Small Cap",amc:"Nippon",r1:16.5,r3:18.5,r5:15.2,exp:0.82,aum:32000,risk:"Very High",rating:5,sip:500,tag:"CONSISTENT"},
  {name:"SBI Small Cap Fund",cat:"Small Cap",amc:"SBI",r1:22.1,r3:16.8,r5:14.5,exp:0.85,aum:18900,risk:"Very High",rating:5,sip:500,tag:"POPULAR"},
  {name:"Axis Small Cap Fund",cat:"Small Cap",amc:"Axis",r1:15.2,r3:17.1,r5:14.8,exp:0.78,aum:8500,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"HDFC Small Cap Fund",cat:"Small Cap",amc:"HDFC",r1:19.8,r3:17.2,r5:14.2,exp:0.92,aum:15000,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"Kotak Small Cap Fund",cat:"Small Cap",amc:"Kotak",r1:18.5,r3:15.5,r5:13.8,exp:0.88,aum:9800,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"DSP Small Cap Fund",cat:"Small Cap",amc:"DSP",r1:17.2,r3:16.8,r5:14.5,exp:0.88,aum:11000,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"Quant Small Cap Fund",cat:"Small Cap",amc:"Quant",r1:32.5,r3:28.5,r5:20.8,exp:0.62,aum:6500,risk:"Very High",rating:5,sip:500,tag:"TOP PERFORMER"},
  // Flexi Cap
  {name:"Parag Parikh Flexi Cap",cat:"Flexi Cap",amc:"PPFAS",r1:16.8,r3:14.2,r5:12.8,exp:0.94,aum:45000,risk:"Moderate",rating:5,sip:1000,tag:"POPULAR"},
  {name:"Kotak Flexicap Fund",cat:"Flexi Cap",amc:"Kotak",r1:14.5,r3:12.8,r5:11.2,exp:0.82,aum:35000,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"UTI Flexi Cap Fund",cat:"Flexi Cap",amc:"UTI",r1:14.2,r3:12.5,r5:11.8,exp:0.95,aum:22000,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"Canara Robeco Flexi Cap",cat:"Flexi Cap",amc:"Canara Robeco",r1:14.8,r3:13.1,r5:12.2,exp:0.88,aum:12000,risk:"Moderate",rating:4,sip:5000,tag:""},
  {name:"HDFC Flexi Cap Fund",cat:"Flexi Cap",amc:"HDFC",r1:4.8,r3:12.1,r5:11.0,exp:0.95,aum:18000,risk:"Moderate",rating:3,sip:500,tag:""},
  // Multi Cap
  {name:"Quant Active Fund",cat:"Multi Cap",amc:"Quant",r1:28.5,r3:22.5,r5:18.2,exp:0.58,aum:4500,risk:"High",rating:5,sip:500,tag:"TOP PERFORMER"},
  {name:"Axis Multicap Fund",cat:"Multi Cap",amc:"Axis",r1:21.2,r3:18.8,r5:15.2,exp:0.87,aum:9500,risk:"High",rating:5,sip:500,tag:""},
  {name:"Nippon India Multi Cap",cat:"Multi Cap",amc:"Nippon",r1:18.5,r3:16.2,r5:14.1,exp:0.88,aum:7800,risk:"High",rating:4,sip:500,tag:""},
  {name:"ICICI Pru Multicap",cat:"Multi Cap",amc:"ICICI Pru",r1:19.8,r3:17.5,r5:14.8,exp:0.95,aum:8200,risk:"High",rating:4,sip:500,tag:""},
  // ELSS
  {name:"Quant ELSS Tax Saver",cat:"ELSS",amc:"Quant",r1:26.5,r3:20.8,r5:17.2,exp:0.58,aum:3200,risk:"High",rating:5,sip:500,tag:"TOP PERFORMER"},
  {name:"Canara Robeco ELSS",cat:"ELSS",amc:"Canara Robeco",r1:15.8,r3:14.5,r5:13.5,exp:0.85,aum:7500,risk:"High",rating:5,sip:500,tag:"CONSISTENT"},
  {name:"DSP ELSS Tax Saver",cat:"ELSS",amc:"DSP",r1:14.2,r3:13.8,r5:12.8,exp:0.85,aum:9800,risk:"High",rating:4,sip:500,tag:""},
  {name:"Mirae Asset ELSS",cat:"ELSS",amc:"Mirae Asset",r1:11.7,r3:11.2,r5:13.1,exp:0.72,aum:18000,risk:"High",rating:4,sip:500,tag:""},
  {name:"Axis ELSS Tax Saver",cat:"ELSS",amc:"Axis",r1:11.8,r3:10.5,r5:12.8,exp:0.68,aum:28000,risk:"High",rating:4,sip:500,tag:""},
  {name:"Nippon India ELSS",cat:"ELSS",amc:"Nippon",r1:13.8,r3:14.5,r5:13.2,exp:0.88,aum:15000,risk:"High",rating:4,sip:500,tag:""},
  // Hybrid
  {name:"HDFC Balanced Advantage",cat:"Hybrid",amc:"HDFC",r1:13.5,r3:11.8,r5:10.5,exp:0.95,aum:45000,risk:"Moderate",rating:5,sip:100,tag:"POPULAR"},
  {name:"ICICI Pru Balanced Advantage",cat:"Hybrid",amc:"ICICI Pru",r1:12.8,r3:10.5,r5:9.2,exp:1.10,aum:15600,risk:"Moderate",rating:4,sip:100,tag:""},
  {name:"SBI Equity Hybrid",cat:"Hybrid",amc:"SBI",r1:12.1,r3:10.2,r5:9.8,exp:1.05,aum:22000,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"Mirae Asset Hybrid Equity",cat:"Hybrid",amc:"Mirae Asset",r1:13.2,r3:11.5,r5:10.8,exp:0.88,aum:8500,risk:"Moderate",rating:4,sip:500,tag:""},
  // Debt
  {name:"Aditya Birla SL Corp Bond",cat:"Corporate Bond",amc:"ABSL",r1:8.2,r3:7.5,r5:7.2,exp:0.38,aum:18000,risk:"Low",rating:5,sip:500,tag:"CONSISTENT"},
  {name:"ICICI Pru Corporate Bond",cat:"Corporate Bond",amc:"ICICI Pru",r1:8.0,r3:7.2,r5:6.9,exp:0.40,aum:15000,risk:"Low",rating:4,sip:500,tag:""},
  {name:"SBI Short Duration",cat:"Short Duration",amc:"SBI",r1:7.8,r3:7.2,r5:7.0,exp:0.42,aum:12000,risk:"Low",rating:4,sip:500,tag:""},
  {name:"Parag Parikh Liquid",cat:"Liquid",amc:"PPFAS",r1:7.0,r3:6.6,r5:6.4,exp:0.10,aum:3500,risk:"Very Low",rating:4,sip:500,tag:"CHEAPEST"},
  {name:"SBI Overnight Fund",cat:"Liquid",amc:"SBI",r1:6.8,r3:6.5,r5:6.2,exp:0.15,aum:35000,risk:"Very Low",rating:4,sip:500,tag:"SAFEST"},
  {name:"SBI Magnum Gilt",cat:"Gilt",amc:"SBI",r1:9.2,r3:7.8,r5:7.2,exp:0.45,aum:8500,risk:"Low",rating:4,sip:500,tag:""},
  // Gold
  {name:"Invesco India Gold ETF FoF",cat:"Gold",amc:"Invesco",r1:34.7,r3:15.2,r5:11.5,exp:0.15,aum:450,risk:"Moderate",rating:5,sip:100,tag:""},
  {name:"SBI Gold Fund",cat:"Gold",amc:"SBI",r1:33.8,r3:14.8,r5:11.2,exp:0.32,aum:2800,risk:"Moderate",rating:4,sip:500,tag:""},
  {name:"Nippon India Gold Savings",cat:"Gold",amc:"Nippon",r1:34.2,r3:15.0,r5:11.4,exp:0.28,aum:1800,risk:"Moderate",rating:4,sip:100,tag:""},
  // Sectoral
  {name:"ICICI Pru Infrastructure",cat:"Infrastructure",amc:"ICICI Pru",r1:32.5,r3:24.8,r5:18.2,exp:1.10,aum:4500,risk:"Very High",rating:5,sip:100,tag:"TOP PERFORMER"},
  {name:"Aditya Birla SL Healthcare",cat:"Healthcare",amc:"ABSL",r1:28.5,r3:22.1,r5:18.5,exp:0.95,aum:3800,risk:"Very High",rating:5,sip:500,tag:""},
  {name:"Nippon India Pharma",cat:"Healthcare",amc:"Nippon",r1:26.8,r3:20.5,r5:17.2,exp:0.85,aum:5800,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"ICICI Pru Technology",cat:"Technology",amc:"ICICI Pru",r1:-14.2,r3:8.5,r5:9.8,exp:1.25,aum:11000,risk:"Very High",rating:2,sip:100,tag:"AVOID"},
  {name:"Tata Digital India",cat:"Technology",amc:"Tata",r1:8.1,r3:12.5,r5:10.2,exp:0.95,aum:6200,risk:"Very High",rating:3,sip:500,tag:""},
  // International
  {name:"Motilal Oswal Nasdaq 100",cat:"International",amc:"Motilal",r1:18.5,r3:12.5,r5:16.8,exp:0.75,aum:4500,risk:"Very High",rating:4,sip:500,tag:""},
  {name:"Mirae Asset NYSE FANG+",cat:"International",amc:"Mirae Asset",r1:22.5,r3:8.5,r5:15.2,exp:0.80,aum:2800,risk:"Very High",rating:4,sip:500,tag:""},
  // Arbitrage
  {name:"Kotak Equity Arbitrage",cat:"Arbitrage",amc:"Kotak",r1:6.8,r3:6.2,r5:5.8,exp:0.38,aum:15000,risk:"Low",rating:3,sip:500,tag:""},
  {name:"Nippon India Arbitrage",cat:"Arbitrage",amc:"Nippon",r1:6.9,r3:6.3,r5:5.9,exp:0.35,aum:12000,risk:"Low",rating:4,sip:500,tag:""},
  {name:"Invesco India Arbitrage",cat:"Arbitrage",amc:"Invesco",r1:6.65,r3:6.1,r5:5.7,exp:0.38,aum:6200,risk:"Low",rating:3,sip:500,tag:""},
];

const CATS = ["All","Large Cap","Mid Cap","Small Cap","Flexi Cap","Multi Cap","ELSS","Hybrid","Corporate Bond","Short Duration","Liquid","Gilt","Gold","Infrastructure","Healthcare","Technology","International","Arbitrage"];
const AMCS = ["All",...Array.from(new Set(ALL_FUNDS.map(f=>f.amc))).sort()];
const RISKS = ["All","Very Low","Low","Moderate","High","Very High"];

const Stars = ({n}:{n:number}) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i=>(
      <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i<=n?"#f59e0b":"#e5e7eb"} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);

const riskColor = (r:string) => r==="Very Low"||r==="Low"?"text-emerald-600 bg-emerald-50":r==="Moderate"?"text-amber-600 bg-amber-50":"text-red-600 bg-red-50";

const tagColor = (t:string) => t==="TOP PERFORMER"?"bg-emerald-900 text-emerald-100":t==="POPULAR"?"bg-blue-900 text-blue-100":t==="CONSISTENT"?"bg-violet-900 text-violet-100":t==="AVOID"?"bg-red-900 text-red-100":t==="TAX SAVING"?"bg-amber-900 text-amber-100":"bg-gray-800 text-gray-200";

export default function Screener() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [amc, setAmc] = useState("All");
  const [risk, setRisk] = useState("All");
  const [sortBy, setSortBy] = useState<"r1"|"r3"|"r5"|"exp"|"aum"|"rating">("r1");
  const [sortDir, setSortDir] = useState<1|-1>(-1);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all"|"top"|"watchlist">("all");
  const [period, setPeriod] = useState<"r1"|"r3"|"r5">("r1");

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortBy(col); setSortDir(-1); }
  };

  const filtered = useMemo(() => {
    let funds = ALL_FUNDS;
    if (activeTab === "top") funds = funds.filter(f => f.rating >= 4 && f.r1 >= 10);
    if (activeTab === "watchlist") funds = funds.filter(f => watchlist.includes(f.name));
    if (search) funds = funds.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.amc.toLowerCase().includes(search.toLowerCase()));
    if (cat !== "All") funds = funds.filter(f => f.cat === cat);
    if (amc !== "All") funds = funds.filter(f => f.amc === amc);
    if (risk !== "All") funds = funds.filter(f => f.risk === risk);
    if (minRating > 0) funds = funds.filter(f => f.rating >= minRating);
    return [...funds].sort((a,b) => ((a[sortBy]||0) - (b[sortBy]||0)) * sortDir);
  }, [search, cat, amc, risk, minRating, sortBy, sortDir, activeTab, watchlist]);

  const activeFilters = [cat!=="All"?cat:null, amc!=="All"?amc:null, risk!=="All"?risk:null, minRating>0?`${minRating}★+`:null].filter(Boolean);

  return (
    <AppLayout title="Fund Screener" subtitle={`${ALL_FUNDS.length} funds · Filter, compare, and find the right one for you`}>
      <div className="px-5 sm:px-6 py-5 space-y-4">

        {/* Search + filter row */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search fund name or AMC..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 transition-all shadow-sm"/>
          </div>
          <button onClick={()=>setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all shadow-sm ${showFilters||activeFilters.length>0?"bg-gray-900 text-white border-gray-900":"bg-white text-gray-700 border-gray-200 hover:border-gray-900"}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
            Filters {activeFilters.length>0&&<span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">{activeFilters.length}</span>}
          </button>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilters.map((f,i)=>(
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full text-[11px] font-semibold">
                {f}
                <button onClick={()=>{ if(f===cat)setCat("All"); if(f===amc)setAmc("All"); if(f===risk)setRisk("All"); if(f?.includes("★"))setMinRating(0); }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            ))}
            <button onClick={()=>{setCat("All");setAmc("All");setRisk("All");setMinRating(0);}} className="text-[11px] text-red-500 hover:underline font-medium">Clear all</button>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:"Category", val:cat, set:setCat, opts:CATS },
                { label:"AMC / Fund House", val:amc, set:setAmc, opts:AMCS },
                { label:"Risk Level", val:risk, set:setRisk, opts:RISKS },
              ].map((f,i)=>(
                <div key={i}>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">{f.label}</label>
                  <select value={f.val} onChange={e=>f.set(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 bg-white">
                    {f.opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Min Rating</label>
                <div className="flex gap-2 pt-1">
                  {[0,3,4,5].map(r=>(
                    <button key={r} onClick={()=>setMinRating(r)}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-lg border transition-all ${minRating===r?"bg-gray-900 text-white border-gray-900":"border-gray-200 text-gray-500 hover:border-gray-900"}`}>
                      {r===0?"Any":`${r}★+`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + results count */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {[["all",`All (${ALL_FUNDS.length})`],["top","🏆 Top Rated"],["watchlist",`⭐ Watchlist (${watchlist.length})`]].map(([id,label])=>(
              <button key={id} onClick={()=>setActiveTab(id as any)}
                className={`px-3 sm:px-4 py-2 text-[12px] font-semibold rounded-lg transition-all ${activeTab===id?"bg-white shadow-sm text-gray-900":"text-gray-500 hover:text-gray-700"}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="text-[12px] text-gray-400">
            <span className="font-semibold text-gray-700">{filtered.length}</span> funds
          </div>
        </div>

        {/* Category quick filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All","Large Cap","Mid Cap","Small Cap","Flexi Cap","ELSS","Hybrid","Debt","Gold"].map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className={`flex-shrink-0 px-3 py-1.5 text-[12px] font-semibold rounded-full border transition-all ${cat===c?"bg-gray-900 text-white border-gray-900":"bg-white text-gray-600 border-gray-200 hover:border-gray-900"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Fund table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest w-8"/>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fund</th>
                  <th className="text-left px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:table-cell">Risk</th>
                  <th className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right hidden sm:table-cell">Rating</th>
                  {[{k:"r1",l:"1Y"},{k:"r3",l:"3Y"},{k:"r5",l:"5Y"}].map(col=>(
                    <th key={col.k} onClick={()=>toggleSort(col.k as any)}
                      className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right cursor-pointer hover:text-gray-900 transition-colors select-none">
                      <span className="flex items-center justify-end gap-1">
                        {col.l} {sortBy===col.k&&<span className="text-gray-900">{sortDir===-1?"↓":"↑"}</span>}
                      </span>
                    </th>
                  ))}
                  <th onClick={()=>toggleSort("exp")}
                    className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right cursor-pointer hover:text-gray-900 hidden sm:table-cell select-none">
                    <span className="flex items-center justify-end gap-1">Exp {sortBy==="exp"&&<span className="text-gray-900">{sortDir===-1?"↓":"↑"}</span>}</span>
                  </th>
                  <th className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right hidden md:table-cell">Min SIP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-[13px]">No funds match your filters. Try clearing some filters.</td></tr>
                ) : filtered.map((f,i)=>{
                  const inWL = watchlist.includes(f.name);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                      {/* Watchlist star */}
                      <td className="pl-4 pr-2 py-3.5">
                        <button onClick={()=>setWatchlist(w=>inWL?w.filter(x=>x!==f.name):[...w,f.name])}
                          className={`transition-colors ${inWL?"text-amber-500":"text-gray-200 hover:text-amber-400"}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={inWL?"currentColor":"none"} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      </td>
                      {/* Fund name */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2 flex-wrap">
                          <div>
                            <div className="text-[13px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">{f.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-[10px] text-gray-400">{f.amc}</span>
                              <span className="text-[10px] text-gray-400">·</span>
                              <span className="text-[10px] text-gray-400">{f.cat}</span>
                              {f.tag&&<span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tagColor(f.tag)}`}>{f.tag}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Risk */}
                      <td className="px-3 py-3.5 hidden sm:table-cell">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskColor(f.risk)}`}>{f.risk}</span>
                      </td>
                      {/* Rating */}
                      <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                        <Stars n={f.rating}/>
                      </td>
                      {/* Returns */}
                      {[f.r1,f.r3,f.r5].map((r,ri)=>(
                        <td key={ri} className="px-3 py-3.5 text-right">
                          <span className={`text-[13px] font-bold ${r>=12?"text-emerald-600":r>=8?"text-gray-900":r>=0?"text-amber-600":"text-red-600"}`}>
                            {r>=0?"+":""}{r.toFixed(1)}%
                          </span>
                        </td>
                      ))}
                      {/* Expense */}
                      <td className="px-3 py-3.5 text-right hidden sm:table-cell">
                        <span className={`text-[12px] ${f.exp<=0.30?"text-emerald-600 font-semibold":f.exp<=0.80?"text-gray-700":"text-amber-600"}`}>{f.exp}%</span>
                      </td>
                      {/* Min SIP */}
                      <td className="px-3 py-3.5 text-right hidden md:table-cell">
                        <span className="text-[12px] text-gray-500">₹{f.sip.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="text-[11px] text-gray-400">Returns are 1Y/3Y/5Y CAGR as of May 2026 · Data sourced from AMFI · Not investment advice · ★ Color: Green &gt;12% · Amber 8-12% · Red &lt;0%</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
