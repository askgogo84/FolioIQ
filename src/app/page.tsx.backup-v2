// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── TAX ENGINE ───────────────────────────────────────────────
const CESS = 0.04;
const isEq = (c) => /large|mid|small|flexi|multi|focused|value|contra|elss|index|etf|equity|sectoral|thematic/i.test(c||"");
const isDb = (c) => /liquid|overnight|money market|ultra short|low dur|short dur|medium dur|long dur|corporate bond|banking|credit|gilt|dynamic bond|floater|conservative hybrid|arbitrage/i.test(c||"");

function afterTax(inv, cur, days, cat, slab=0.30) {
  const g = cur - inv;
  if (g <= 0) return { tax:0, netGain:g, netPct:inv>0?g/inv*100:0 };
  let tax = 0;
  if (isEq(cat)) tax = days>=365 ? Math.max(0,g-125000)*0.125*(1+CESS) : g*0.20*(1+CESS);
  else if (isDb(cat)) tax = g*slab*(1+CESS);
  else tax = days>=730 ? g*0.125*(1+CESS) : g*slab*(1+CESS);
  return { tax, netGain:g-tax, netPct:(g-tax)/inv*100 };
}

function daysFrom(s) { try { return Math.round((Date.now()-new Date(s).getTime())/86400000); } catch { return 730; } }
function cagrFn(arr,y) {
  if(!arr||arr.length<2) return null;
  const d=Math.round(y*365); if(arr.length<=d) return null;
  const c=parseFloat(arr[0].nav),p=parseFloat(arr[Math.min(d,arr.length-1)].nav);
  return (!p||p<=0)?null:(Math.pow(c/p,1/y)-1)*100;
}
const fmtC = (n) => { if(!n||isNaN(n)) return "—"; const a=Math.abs(n),s=n<0?"-":""; return a>=10000000?s+"₹"+(a/10000000).toFixed(2)+"Cr":a>=100000?s+"₹"+(a/100000).toFixed(2)+"L":s+"₹"+a.toLocaleString("en-IN",{maximumFractionDigits:0}); };
const fmtP = (n,dp=1) => n==null||isNaN(n)?"—":(n>0?"+":"")+Number(n).toFixed(dp)+"%";

// ── NIFTY BENCHMARK ──────────────────────────────────────────
async function fetchNifty() {
  try {
    const res = await fetch("https://api.mfapi.in/mf/120716"); // Nippon Nifty 50 Index
    const d = await res.json();
    const nav = d?.data || [];
    if (nav.length < 252) return null;
    const cur = parseFloat(nav[0].nav);
    const p1y = parseFloat(nav[Math.min(252,nav.length-1)].nav);
    const p3y = parseFloat(nav[Math.min(756,nav.length-1)].nav);
    return { r1y: p1y>0?(cur/p1y-1)*100:null, r3y: p3y>0?(Math.pow(cur/p3y,1/3)-1)*100:null };
  } catch { return null; }
}

// ── TAX HARVEST CALC ─────────────────────────────────────────
function calcHarvest(holdings) {
  const EXEMPT = 125000;
  let totalGain = 0;
  const candidates = [];
  for (const h of holdings) {
    const inv = h.investedAmount || h.units * h.avgNav;
    const cur = h.currentValue || h.units * h.currentNAV;
    const gain = cur - inv;
    const days = h.holdingDays || daysFrom(h.purchaseDate);
    if (!isEq(h.category) || days < 365 || gain <= 0) continue;
    totalGain += gain;
    const ratio = Math.min(1, EXEMPT / gain);
    candidates.push({ ...h, gain, unitsToSell: Math.floor(h.units * ratio * 100) / 100, amountToSell: Math.floor(cur * ratio) });
  }
  const usable = Math.min(EXEMPT, totalGain);
  return { totalGain, usable, taxSaved: usable * 0.125 * (1+CESS), candidates: candidates.sort((a,b)=>b.gain-a.gain) };
}

// ── SIP CALENDAR ─────────────────────────────────────────────
function getSIPCal(holdings) {
  const today = new Date();
  return holdings
    .filter(h => h.sipAmount > 0)
    .map(h => {
      const sipDay = new Date(h.purchaseDate).getDate() || 1;
      let next = new Date(today.getFullYear(), today.getMonth(), sipDay);
      if (next <= today) next = new Date(today.getFullYear(), today.getMonth()+1, sipDay);
      return { name: h.schemeName, amount: h.sipAmount, nextDate: next, daysUntil: Math.round((next-today)/86400000), amc: h.amc };
    })
    .sort((a,b) => a.daysUntil - b.daysUntil);
}

// ── PDF/HTML REPORT ──────────────────────────────────────────
function buildReport(holdings, stats, aiText, nifty) {
  const date = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const { ti, tc, tn, tt, np } = stats;
  const rows = holdings.map(h => {
    const g = (h.investedAmount||0)>0 ? ((h.currentValue||0)-(h.investedAmount||0))/(h.investedAmount||1)*100 : 0;
    const sig = h.signal==="PAUSE"?"🔴 Pause":h.signal==="INCREASE"?"🟢 Increase":"🟡 Continue";
    return `<tr><td>${(h.schemeName||"").replace(/ - Direct.*/i,"").substring(0,38)}</td><td align="right">${fmtC(h.investedAmount)}</td><td align="right" style="color:${(h.currentValue||0)>=(h.investedAmount||0)?"#15803d":"#dc2626"}">${fmtC(h.currentValue)}</td><td align="right" style="color:${g>=0?"#15803d":"#dc2626"}">${fmtP(g)}</td><td align="right" style="color:${(h.netReturnPct||0)>=0?"#15803d":"#dc2626"}">${fmtP(h.netReturnPct)}</td><td align="center">${sig}</td></tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>FolioIQ Report ${date}</title>
<style>body{font-family:Arial,sans-serif;margin:0;padding:28px;color:#1a1714;max-width:900px;margin:0 auto}
.hdr{background:#1a1714;color:#fff;padding:20px 24px;border-radius:12px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
.logo{font-size:22px;font-weight:700}.sub{font-size:12px;opacity:.6;margin-top:3px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
.kpi{background:#f7f5f0;border:1px solid #e4e0d8;border-radius:10px;padding:14px}
.kl{font-size:10px;color:#7a7669;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
.kv{font-size:20px;font-weight:700}
.bench{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:13px}
.harvest{background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:12px 16px;margin-bottom:18px;font-size:13px}
.sec-title{font-size:14px;font-weight:700;border-bottom:2px solid #1a7a4a;padding-bottom:6px;margin-bottom:12px}
table{width:100%;border-collapse:collapse}th{font-size:10px;color:#7a7669;text-transform:uppercase;padding:8px 6px;border-bottom:2px solid #e4e0d8;letter-spacing:.8px}
td{padding:8px 6px;font-size:11px;border-bottom:1px solid #f2f0eb}
.ai{background:#edf7f2;border:1px solid #b0dcc4;border-radius:10px;padding:16px;font-size:12px;line-height:1.8;white-space:pre-wrap;margin-bottom:18px}
.footer{font-size:10px;color:#b4b0a6;text-align:center;border-top:1px solid #e4e0d8;padding-top:12px;margin-top:20px}
</style></head><body>
<div class="hdr"><div><div class="logo">FolioIQ</div><div class="sub">Portfolio Intelligence Report</div></div><div style="text-align:right;color:rgba(255,255,255,.7);font-size:12px">${date}</div></div>
<div class="kpis">
<div class="kpi"><div class="kl">Total Invested</div><div class="kv">${fmtC(ti)}</div></div>
<div class="kpi"><div class="kl">Current Value</div><div class="kv" style="color:${tc>=ti?"#15803d":"#dc2626"}">${fmtC(tc)}</div></div>
<div class="kpi" style="background:#edf7f2;border-color:#b0dcc4"><div class="kl">After-Tax Return</div><div class="kv" style="color:#15803d">${fmtP(np)}</div><div style="font-size:11px;color:#15803d;margin-top:3px">${fmtC(tn)} net profit</div></div>
<div class="kpi"><div class="kl">Tax Liability</div><div class="kv" style="color:#92400e">${fmtC(tt)}</div><div style="font-size:11px;color:#92400e;margin-top:3px">if sold today</div></div>
</div>
${nifty?`<div class="bench"><strong style="color:#1d4ed8">📊 Nifty 50 Benchmark Comparison</strong> &nbsp;|&nbsp; Your portfolio after-tax: <strong>${fmtP(np)}</strong> &nbsp;|&nbsp; Nifty 50 1Y: <strong style="color:#1d4ed8">${fmtP(nifty.r1y)}</strong> &nbsp;|&nbsp; Nifty 50 3Y CAGR: <strong>${fmtP(nifty.r3y)}</strong></div>`:""}
<div class="sec-title" style="margin-bottom:12px">Holdings — After-Tax Returns</div>
<table><thead><tr><th>Fund</th><th align="right">Invested</th><th align="right">Current</th><th align="right">Gross P&L</th><th align="right">After-Tax Return</th><th align="center">Signal</th></tr></thead><tbody>${rows}</tbody></table>
${aiText?`<div style="margin-top:18px"><div class="sec-title">AI Advisor Analysis</div><div class="ai">${aiText}</div></div>`:""}
<div class="footer">Generated by FolioIQ · folio-iq.vercel.app · Not SEBI-registered investment advice · After-tax uses Budget 2024 rules</div>
</body></html>`;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function Dashboard() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [nifty, setNifty] = useState(null);
  const [tab, setTab] = useState("holdings");
  const [searchQ, setSearchQ] = useState("");
  const [searchRes, setSearchRes] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [addForm, setAddForm] = useState({units:"",avgNav:"",purchaseDate:"",sipAmt:""});
  const [harvest, setHarvest] = useState(null);
  const [sipCal, setSipCal] = useState([]);
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  function showToast(m) { setToast(m); setTimeout(()=>setToast(""),3000); }

  function save(h) {
    localStorage.setItem("folioiq_h",JSON.stringify(h));
    setHoldings(h);
    setHarvest(calcHarvest(h));
    setSipCal(getSIPCal(h));
  }

  useEffect(() => {
    const s = localStorage.getItem("folioiq_h");
    if (s) { const h=JSON.parse(s); setHoldings(h); setHarvest(calcHarvest(h)); setSipCal(getSIPCal(h)); }
    fetchNifty().then(setNifty);
  }, []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (searchQ.length < 2) { setSearchRes([]); setShowDrop(false); return; }
    timer.current = setTimeout(async () => {
      const r = await fetch("https://api.mfapi.in/mf/search?q="+encodeURIComponent(searchQ));
      const d = await r.json();
      setSearchRes((d||[]).slice(0,8)); setShowDrop(true);
    }, 350);
  }, [searchQ]);

  async function addFund(fund) {
    setShowDrop(false); setSearchQ(""); setLoading(true);
    try {
      const r = await fetch("https://api.mfapi.in/mf/"+fund.schemeCode);
      const d = await r.json();
      const nav = d?.data||[];
      const cur = nav.length ? parseFloat(nav[0].nav) : 0;
      const units = parseFloat(addForm.units)||100;
      const avgNav = parseFloat(addForm.avgNav)||cur;
      const pd = addForm.purchaseDate||(()=>{const dt=new Date();dt.setFullYear(dt.getFullYear()-2);return dt.toISOString().split("T")[0];})();
      const sipAmt = parseFloat(addForm.sipAmt)||0;
      const days = daysFrom(pd);
      const cat = d?.meta?.scheme_category||"Equity Scheme";
      const inv=units*avgNav, cv=units*cur;
      const tax=afterTax(inv,cv,days,cat);
      const r1y=cagrFn(nav,1);
      const sig=r1y!==null&&r1y<8?"PAUSE":r1y!==null&&r1y>16?"INCREASE":"CONTINUE";
      const newH=[...holdings.filter(h=>h.schemeCode!==String(fund.schemeCode)),{
        schemeCode:String(fund.schemeCode),schemeName:fund.schemeName,category:cat,amc:d?.meta?.fund_house||"",
        units,avgNav,currentNAV:cur,purchaseDate:pd,sipAmount:sipAmt,holdingDays:days,navArr:nav,
        investedAmount:inv,currentValue:cv,r1y,r3y:cagrFn(nav,3),...tax,signal:sig,
      }];
      save(newH);
      setAddForm({units:"",avgNav:"",purchaseDate:"",sipAmt:""});
      showToast("✓ "+fund.schemeName.substring(0,35)+"... added");
    } catch { showToast("❌ Failed to fetch fund"); }
    setLoading(false);
  }

  function removeFund(code) { save(holdings.filter(h=>h.schemeCode!==code)); setAiText(""); }

  async function runAI() {
    if (!holdings.length) return;
    setAiLoading(true); setAiText(""); setTab("ai");
    const ti=holdings.reduce((s,h)=>s+(h.investedAmount||0),0);
    const tc=holdings.reduce((s,h)=>s+(h.currentValue||0),0);
    const tn=holdings.reduce((s,h)=>s+(h.netGain||0),0);
    const tt=holdings.reduce((s,h)=>s+(h.tax||0),0);
    const lines=holdings.map(h=>`- ${h.schemeName.replace(/ - Direct.*/i,"").replace(/ Fund/i,"")}: invested ${fmtC(h.investedAmount||0)}, after-tax return ${fmtP(h.netReturnPct)}, 1Y CAGR ${h.r1y?fmtP(h.r1y):"N/A"}, signal: ${h.signal}`).join("\n");
    const nc=nifty?`\nNifty 50 1Y: ${fmtP(nifty.r1y)} | Nifty 50 3Y CAGR: ${fmtP(nifty.r3y)}`:"";
    try {
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1500,
        system:"You are India best mutual fund advisor. Direct, specific, name exact fund alternatives. Use emojis. No jargon. Compare to Nifty benchmark.",
        messages:[{role:"user",content:`Analyse this MF portfolio (Budget 2024 after-tax):\n\nInvested: ${fmtC(ti)} | Current: ${fmtC(tc)} | After-Tax Gain: ${fmtC(tn)} | Tax: ${fmtC(tt)}${nc}\n\n${lines}\n\nSections:\n📊 PORTFOLIO VERDICT\n🔴 PAUSE THESE (exact fund + one alternative to switch to)\n🟡 CONTINUE BUT WATCH\n🟢 INCREASE SIP HERE\n📉 MISSING GAPS\n💰 TAX HARVEST MOVE (use ₹1.25L LTCG exemption)\n⚡ DO THIS WEEK`}]
      })});
      const d=await res.json();
      setAiText(d.content?.[0]?.text||"Analysis unavailable.");
    } catch { setAiText("⚠️ AI failed. Try again."); }
    setAiLoading(false);
  }

  function downloadReport() {
    const ti=holdings.reduce((s,h)=>s+(h.investedAmount||0),0);
    const tc=holdings.reduce((s,h)=>s+(h.currentValue||0),0);
    const tn=holdings.reduce((s,h)=>s+(h.netGain||0),0);
    const tt=holdings.reduce((s,h)=>s+(h.tax||0),0);
    const np=ti>0?tn/ti*100:0;
    const html=buildReport(holdings,{ti,tc,tn,tt,np},aiText,nifty);
    const blob=new Blob([html],{type:"text/html"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`FolioIQ-Report-${new Date().toISOString().split("T")[0]}.html`;
    a.click(); URL.revokeObjectURL(url);
  }

  const ti=holdings.reduce((s,h)=>s+(h.investedAmount||0),0);
  const tc=holdings.reduce((s,h)=>s+(h.currentValue||0),0);
  const tn=holdings.reduce((s,h)=>s+(h.netGain||0),0);
  const tt=holdings.reduce((s,h)=>s+(h.tax||0),0);
  const np=ti>0?tn/ti*100:0;
  const gp=ti>0?(tc-ti)/ti*100:0;

  const TABS = [
    ["holdings","📊 Holdings"],
    ["harvest","🌾 Tax Harvest"],
    ["sip","📅 SIP Calendar"],
    ["ai","🤖 AI Advisor"],
    ["add","＋ Add Fund"],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOPBAR */}
      <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
          <span className="font-bold text-lg text-gray-900">FolioIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          {nifty && <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">📊 Nifty 50: {fmtP(nifty.r1y)} 1Y</div>}
          <Link href="/upload" className="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full">📤 Upload</Link>
          <Link href="/risk" className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-50">Risk Profile</Link>
        </div>
      </header>

      {/* KPI STRIP */}
      {holdings.length > 0 && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-6xl mx-auto grid grid-cols-5 gap-4">
            {[
              {l:"Invested",v:fmtC(ti),c:"text-gray-900"},
              {l:"Current Value",v:fmtC(tc),c:tc>=ti?"text-green-700":"text-red-600"},
              {l:"Money You Keep",v:fmtP(np),c:np>=0?"text-green-700":"text-red-600",hl:true},
              {l:"Gross Return",v:fmtP(gp),c:gp>=0?"text-green-700":"text-red-600"},
              {l:"Tax Liability",v:fmtC(tt),c:"text-amber-700"},
            ].map(({l,v,c,hl})=>(
              <div key={l} className={`text-center py-1 ${hl?"bg-green-50 rounded-lg px-2":""}`}>
                <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{l}</div>
                <div className={`text-lg font-bold ${c}`}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {TABS.map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab===id?"border-gray-900 text-gray-900":"border-transparent text-gray-500 hover:text-gray-700"}`}>
              {label}
            </button>
          ))}
          {holdings.length > 0 && (
            <button onClick={downloadReport} className="ml-auto px-4 py-3 text-sm font-medium text-green-700 whitespace-nowrap flex items-center gap-1.5 hover:bg-green-50 rounded-t-lg">
              📄 Download Report
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* EMPTY STATE */}
        {holdings.length === 0 && tab !== "add" && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-xl font-bold text-gray-900 mb-2">No funds yet</div>
            <div className="text-gray-500 text-sm mb-6">Upload your NJ Wealth / Kuvera statement or add funds manually</div>
            <div className="flex gap-3 justify-center">
              <Link href="/upload" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">📤 Upload Statement</Link>
              <button onClick={()=>setTab("add")} className="px-5 py-2.5 border border-gray-200 text-gray-900 rounded-lg text-sm font-medium">＋ Add Manually</button>
            </div>
          </div>
        )}

        {/* ── HOLDINGS TAB ── */}
        {tab === "holdings" && holdings.length > 0 && (
          <div>
            {/* Nifty benchmark banner */}
            {nifty && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-800 text-sm">📊 vs Nifty 50 Benchmark</span>
                  <span className="text-blue-700 text-sm ml-3">Nifty 50 1Y: <strong>{fmtP(nifty.r1y)}</strong> &nbsp;·&nbsp; Nifty 50 3Y CAGR: <strong>{fmtP(nifty.r3y)}</strong></span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 font-semibold">Your Portfolio (after-tax)</div>
                  <div className={`text-lg font-bold ${np>=0?"text-green-700":"text-red-600"}`}>{fmtP(np)}</div>
                </div>
              </div>
            )}

            {/* Signal summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                {l:"🔴 Pause / Exit",f:holdings.filter(h=>h.signal==="PAUSE"),bg:"bg-red-50",b:"border-red-200",c:"text-red-700"},
                {l:"🟡 Continue & Watch",f:holdings.filter(h=>h.signal==="CONTINUE"),bg:"bg-yellow-50",b:"border-yellow-200",c:"text-yellow-700"},
                {l:"🟢 Increase SIP",f:holdings.filter(h=>h.signal==="INCREASE"),bg:"bg-green-50",b:"border-green-200",c:"text-green-700"},
              ].map(({l,f,bg,b,c})=>(
                <div key={l} className={`rounded-xl p-4 border ${bg} ${b}`}>
                  <div className={`text-sm font-bold mb-2 ${c}`}>{l} ({f.length})</div>
                  {f.length===0?<div className="text-xs text-gray-400">None</div>:f.slice(0,2).map(h=>(
                    <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1">
                      {h.schemeName.replace(/ - Direct.*/i,"").replace(/ Fund/i,"").substring(0,28)}
                      {h.r1y!=null&&<span className="ml-1 text-gray-400">({fmtP(h.r1y)} 1Y)</span>}
                    </div>
                  ))}
                  {f.length>2&&<div className="text-xs text-gray-400">+{f.length-2} more</div>}
                </div>
              ))}
            </div>

            {/* Holdings table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="font-bold text-gray-900">All Holdings ({holdings.length})</div>
                <button onClick={runAI} disabled={aiLoading}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-40">
                  {aiLoading?"Analysing...":"🤖 AI Analysis"}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b-2 border-gray-200">
                    {["Fund","Invested","Current","After-Tax Return","1Y CAGR","3Y CAGR","Signal",""].map(h=>(
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {holdings.map(h=>{
                      const sigMap={PAUSE:{bg:"bg-red-100 text-red-700",l:"✕ Pause"},CONTINUE:{bg:"bg-yellow-100 text-yellow-700",l:"◉ Continue"},INCREASE:{bg:"bg-green-100 text-green-700",l:"▲ Increase"}};
                      const sig=sigMap[h.signal||"CONTINUE"];
                      return (
                        <tr key={h.schemeCode} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="font-semibold text-gray-900 text-xs truncate" title={h.schemeName}>{h.schemeName.replace(/ - Direct.*/i,"").replace(/ Fund/i,"")}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,22)} · {(h.amc||"").split(" ")[0]}</div>
                            {h.sipAmount>0&&<span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">SIP ₹{h.sipAmount.toLocaleString("en-IN")}</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-700">{fmtC(h.investedAmount||0)}</td>
                          <td className={"py-3 px-4 font-mono text-xs font-semibold "+((h.currentValue||0)>=(h.investedAmount||0)?"text-green-700":"text-red-600")}>{fmtC(h.currentValue||0)}</td>
                          <td className={"py-3 px-4 font-mono text-xs font-semibold "+((h.netReturnPct||0)>=0?"text-green-700":"text-red-600")}>{fmtP(h.netReturnPct)}</td>
                          <td className={"py-3 px-4 font-mono text-xs "+((h.r1y||0)>=0?"text-green-700":"text-red-600")}>{h.r1y!=null?fmtP(h.r1y):"—"}</td>
                          <td className={"py-3 px-4 font-mono text-xs "+((h.r3y||0)>=0?"text-green-700":"text-red-600")}>{h.r3y!=null?fmtP(h.r3y):"—"}</td>
                          <td className="py-3 px-4"><span className={"text-xs font-bold px-2 py-1 rounded-full "+sig.bg}>{sig.l}</span></td>
                          <td className="py-3 px-4"><button onClick={()=>removeFund(h.schemeCode)} className="text-xs text-red-500 hover:text-red-700 font-medium">✕</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100">
                <p className="text-xs text-yellow-700">After-tax: Equity &gt;12m = LTCG 12.5% (₹1.25L exempt) · Equity &lt;12m = STCG 20% · Debt = slab rate · 4% cess · Assumed redemption today</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAX HARVEST TAB ── */}
        {tab === "harvest" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">🌾 Tax Harvesting</h2>
              <p className="text-gray-500 text-sm">Every FY you can book ₹1,25,000 of Long Term Capital Gains completely tax-free. Here's how to use it.</p>
            </div>

            {!harvest || harvest.candidates.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
                <div className="text-3xl mb-3">✅</div>
                <div className="font-semibold text-gray-900 mb-1">No harvest opportunities right now</div>
                <div className="text-sm text-gray-500">Either no equity funds held over 12 months, or no gains to book</div>
              </div>
            ) : (
              <>
                {/* Summary card */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-5">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">LTCG Available to Book</div>
                      <div className="text-2xl font-bold text-green-800">{fmtC(harvest.totalGain)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">Tax-Free Exemption</div>
                      <div className="text-2xl font-bold text-green-800">₹1,25,000</div>
                    </div>
                    <div className="bg-green-100 rounded-xl p-4">
                      <div className="text-xs text-green-700 font-bold uppercase tracking-wide mb-1">💰 Tax You Can Save</div>
                      <div className="text-3xl font-bold text-green-800">{fmtC(harvest.taxSaved)}</div>
                      <div className="text-xs text-green-600 mt-1">Book gains before March 31st · Reinvest same day</div>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                  <div className="font-semibold text-yellow-800 text-sm mb-2">⚡ How to Execute This</div>
                  <div className="text-yellow-700 text-sm space-y-1">
                    <div>1. Sell the recommended units of your chosen fund on NJ Wealth / any platform</div>
                    <div>2. The gain books against your ₹1.25L exemption — zero tax on this</div>
                    <div>3. Reinvest the exact same amount in the same fund the next day (resets your cost basis)</div>
                    <div>4. You just saved {fmtC(harvest.taxSaved)} in tax legally</div>
                  </div>
                </div>

                {/* Candidates */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">Best Candidates to Harvest From</div>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b-2 border-gray-200">
                      {["Fund","LTCG Gain","Harvest: Sell These Units","Amount to Sell","Then Reinvest"].map(h=>(
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {harvest.candidates.slice(0,5).map(h=>(
                        <tr key={h.schemeCode} className="border-b border-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-xs text-gray-900">{h.schemeName.replace(/ - Direct.*/i,"").replace(/ Fund/i,"").substring(0,35)}</div>
                            <div className="text-xs text-gray-400">{Math.round((h.holdingDays||0)/30)} months held</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-green-700 font-semibold">{fmtC(h.gain)}</td>
                          <td className="py-3 px-4 font-mono text-xs text-amber-700 font-bold">{h.unitsToSell} units</td>
                          <td className="py-3 px-4 font-mono text-xs">{fmtC(h.amountToSell)}</td>
                          <td className="py-3 px-4 text-xs text-green-700 font-medium">Same fund, next day ✓</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SIP CALENDAR TAB ── */}
        {tab === "sip" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">📅 SIP Calendar</h2>
              <p className="text-gray-500 text-sm">Upcoming SIP debits across all your funds</p>
            </div>

            {sipCal.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
                <div className="text-3xl mb-3">📅</div>
                <div className="font-semibold text-gray-900 mb-1">No active SIPs found</div>
                <div className="text-sm text-gray-500">When you add funds with a SIP amount, they appear here</div>
              </div>
            ) : (
              <>
                {/* Monthly SIP total */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-blue-800 text-sm">Monthly SIP Commitment</div>
                    <div className="text-xs text-blue-600 mt-0.5">{sipCal.length} active SIPs</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-800">
                    {fmtC(sipCal.reduce((s,h)=>s+h.amount,0))}<span className="text-sm font-normal text-blue-600">/month</span>
                  </div>
                </div>

                {/* Calendar grid */}
                <div className="grid gap-3">
                  {sipCal.map((s,i)=>{
                    const urgent = s.daysUntil <= 3;
                    const soon = s.daysUntil <= 7;
                    return (
                      <div key={i} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${urgent?"border-red-200 bg-red-50":soon?"border-amber-200 bg-amber-50":"border-gray-200"}`}>
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold ${urgent?"bg-red-600 text-white":soon?"bg-amber-500 text-white":"bg-gray-900 text-white"}`}>
                          <div className="text-xs leading-none">{s.nextDate.toLocaleString("en-IN",{month:"short"})}</div>
                          <div className="text-lg leading-none">{s.nextDate.getDate()}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{s.name.replace(/ - Direct.*/i,"").replace(/ Fund/i,"").substring(0,45)}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{s.amc?.split(" ")[0]} · SIP debit</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{fmtC(s.amount)}</div>
                          <div className={`text-xs font-medium ${urgent?"text-red-600":soon?"text-amber-600":"text-gray-400"}`}>
                            {s.daysUntil === 0 ? "Today!" : s.daysUntil === 1 ? "Tomorrow!" : `In ${s.daysUntil} days`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── AI ADVISOR TAB ── */}
        {tab === "ai" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">🤖 AI Portfolio Advisor</h2>
              <p className="text-gray-500 text-sm">Personalised analysis with after-tax returns vs Nifty 50 benchmark</p>
            </div>

            {holdings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">🤖</div>
                <div className="font-semibold text-gray-900 mb-4">Add funds first</div>
                <button onClick={()=>setTab("add")} className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">Add Funds</button>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-green-50 to-purple-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse"></div>
                    <div className="font-bold text-gray-900 text-lg">AI Wealth Advisor</div>
                    <div className="ml-auto flex gap-2">
                      {aiText && <button onClick={runAI} className="px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-white">↻ Refresh</button>}
                      <button onClick={runAI} disabled={aiLoading} className="px-4 py-1.5 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 disabled:opacity-40">
                        {aiLoading?"Analysing...":"⚡ Analyse"}
                      </button>
                    </div>
                  </div>
                  {aiLoading && (
                    <div className="flex gap-2 items-center">
                      <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{animationDelay:i*0.15+"s"}}/>)}</div>
                      <span className="text-sm text-gray-500">Analysing {holdings.length} funds against Nifty 50 benchmark...</span>
                    </div>
                  )}
                  {aiText && <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{aiText}</div>}
                  {!aiText && !aiLoading && <div className="text-sm text-gray-500">Click Analyse to get personalised recommendations based on your exact portfolio and after-tax returns vs Nifty 50.</div>}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ADD FUND TAB ── */}
        {tab === "add" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">＋ Add Fund</h2>
              <p className="text-gray-500 text-sm">Search all ~20,000 AMFI-registered funds · Or <Link href="/upload" className="text-green-700 underline font-medium">upload your statement</Link></p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  placeholder="Search fund name, AMC..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}
                  onFocus={()=>searchRes.length&&setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),200)}/>
                {showDrop && searchRes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto mt-1">
                    {searchRes.map(f=>(
                      <div key={f.schemeCode} className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0" onMouseDown={()=>addFund(f)}>
                        <div className="text-sm font-medium text-gray-900">{f.schemeName}</div>
                        <div className="text-xs text-gray-400">Code: {f.schemeCode}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  {l:"Units held",ph:"e.g. 125.50",k:"units"},
                  {l:"Avg Purchase NAV (₹)",ph:"e.g. 42.50",k:"avgNav"},
                  {l:"Purchase Date",ph:"",k:"purchaseDate",type:"date"},
                  {l:"Monthly SIP (₹, or 0)",ph:"0 if lumpsum",k:"sipAmt"},
                ].map(({l,ph,k,type})=>(
                  <div key={k}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{l}</label>
                    <input type={type||"text"} placeholder={ph} value={addForm[k]}
                      onChange={e=>setAddForm(p=>({...p,[k]:e.target.value}))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600"/>
                  </div>
                ))}
              </div>

              {loading && <div className="text-sm text-green-700 mb-3">⏳ Fetching live NAV from AMFI...</div>}

              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ <strong>Purchase date is critical</strong> — it determines whether your gains are taxed at 12.5% LTCG or 20% STCG. Set it accurately.
              </div>
            </div>

            {/* Current holdings list */}
            {holdings.length > 0 && (
              <div className="mt-5 bg-white border border-gray-200 rounded-2xl p-5">
                <div className="font-bold text-gray-900 mb-4">Current Holdings ({holdings.length})</div>
                {holdings.map(h=>(
                  <div key={h.schemeCode} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{h.schemeName.replace(/ - Direct.*/i,"").replace(/ Fund/i,"").substring(0,45)}</div>
                      <div className="text-xs text-gray-400">{h.units} units · {h.purchaseDate}{h.sipAmount>0?` · SIP ₹${h.sipAmount.toLocaleString("en-IN")}`:""}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${(h.netReturnPct||0)>=0?"text-green-700":"text-red-600"}`}>{fmtP(h.netReturnPct)}</div>
                      <div className="text-xs text-gray-400">after-tax</div>
                    </div>
                    <button onClick={()=>removeFund(h.schemeCode)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded font-medium">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-xl animate-bounce">{toast}</div>}
    </div>
  );
}
