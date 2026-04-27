"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";

interface Holding {
  schemeCode: string; schemeName: string; category: string; amc: string;
  units: number; avgNav: number; purchaseDate: string; sipAmount: number;
  matchConfidence: "high" | "low"; originalName: string;
  currentNAV?: number; currentValue?: number; investedAmount?: number;
  netReturnPct?: number; netGain?: number; tax?: number;
  r1y?: number | null; r3y?: number | null; holdingDays?: number;
  signal?: "PAUSE" | "CONTINUE" | "INCREASE";
}

const CESS = 0.04;
const isEquity = (c: string) => /large|mid|small|flexi|multi|focused|value|contra|elss|index|etf|equity|sectoral|thematic/i.test(c||"");
const isDebt   = (c: string) => /liquid|overnight|money market|ultra short|low dur|short dur|medium dur|long dur|corporate bond|banking|credit|gilt|dynamic bond|floater|conservative hybrid|arbitrage/i.test(c||"");
function afterTax(inv: number, cur: number, days: number, cat: string, slab=0.30) {
  const g = cur - inv; if (g <= 0) return { tax:0, netGain:g, netPct: inv>0?g/inv*100:0 };
  let tax = 0;
  if (isEquity(cat)) tax = days>=365 ? Math.max(0,g-125000)*0.125*(1+CESS) : g*0.20*(1+CESS);
  else if (isDebt(cat)) tax = g*slab*(1+CESS);
  else tax = days>=730 ? g*0.125*(1+CESS) : g*slab*(1+CESS);
  return { tax, netGain: g-tax, netPct: (g-tax)/inv*100 };
}
const daysFrom = (s: string) => { try { return Math.round((Date.now()-new Date(s).getTime())/86400000); } catch { return 730; } };
const cagrFn = (arr: {nav:string}[], y: number) => {
  if (!arr||arr.length<2) return null;
  const d=Math.round(y*365); if(arr.length<=d) return null;
  const c=parseFloat(arr[0].nav),p=parseFloat(arr[Math.min(d,arr.length-1)].nav);
  return (!p||p<=0)?null:(Math.pow(c/p,1/y)-1)*100;
};
const fmtC = (n: number) => { if(!n||isNaN(n)) return "—"; const a=Math.abs(n),s=n<0?"-":""; return a>=10000000?s+"₹"+(a/10000000).toFixed(2)+"Cr":a>=100000?s+"₹"+(a/100000).toFixed(2)+"L":s+"₹"+a.toLocaleString("en-IN",{maximumFractionDigits:0}); };
const fmtP = (n: number|null|undefined, dp=1) => n==null||isNaN(n)?"—":(n>0?"+":"")+n.toFixed(dp)+"%";
const pc = (n: number) => n>=0?"text-green-700":"text-red-600";

export default function UploadPage() {
  const [stage, setStage] = useState<"idle"|"uploading"|"enriching"|"analysing"|"done"|"error">("idle");
  const [dragOver, setDragOver] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [aiText, setAiText] = useState("");
  const [stats, setStats] = useState({extracted:0,matched:0,unmatched:[] as string[]});
  const [errMsg, setErrMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name); setStage("uploading"); setErrMsg("");
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch("/api/upload-portfolio", { method:"POST", body:form });
      const data = await res.json();
      if (!data.success||!data.holdings?.length) { setErrMsg(data.error||"No funds found. Try a clearer image."); setStage("error"); return; }
      setStats({ extracted:data.totalExtracted, matched:data.totalMatched, unmatched:data.unmatched });
      setStage("enriching");
      const enriched = await enrich(data.holdings);
      setHoldings(enriched);
      setStage("analysing");
      await runAI(enriched);
      setStage("done");
    } catch { setErrMsg("Network error."); setStage("error"); }
  }

  async function enrich(raw: Holding[]): Promise<Holding[]> {
    const out: Holding[] = [];
    for (let i=0;i<raw.length;i+=4) {
      const batch = await Promise.allSettled(raw.slice(i,i+4).map(async h => {
        try {
          const d = await (await fetch(`https://api.mfapi.in/mf/${h.schemeCode}`)).json();
          const nav: {nav:string}[] = d?.data||[];
          const cur = nav.length?parseFloat(nav[0].nav):h.avgNav;
          const hd = daysFrom(h.purchaseDate);
          const inv = h.units*h.avgNav, cv = h.units*cur;
          const t = afterTax(inv,cv,hd,h.category);
          const r1y=cagrFn(nav,1), r3y=cagrFn(nav,3);
          const signal: "PAUSE"|"CONTINUE"|"INCREASE" = r1y!==null&&r1y<8?"PAUSE":r1y!==null&&r1y>16?"INCREASE":"CONTINUE";
          return {...h,currentNAV:cur,currentValue:cv,investedAmount:inv,...t,r1y,r3y,holdingDays:hd,signal};
        } catch { return {...h,investedAmount:h.units*h.avgNav,currentValue:h.units*h.avgNav,signal:"CONTINUE" as const}; }
      }));
      for (const r of batch) if (r.status==="fulfilled") out.push(r.value as Holding);
    }
    return out;
  }

  async function runAI(h: Holding[]) {
    const ti=h.reduce((s,x)=>s+(x.investedAmount||0),0), tc=h.reduce((s,x)=>s+(x.currentValue||0),0);
    const tn=h.reduce((s,x)=>s+(x.netGain||0),0), tt=h.reduce((s,x)=>s+(x.tax||0),0);
    const pause=h.filter(x=>x.signal==="PAUSE"), inc=h.filter(x=>x.signal==="INCREASE");
    try {
      const res = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:1500,
        system:"You are India best mutual fund advisor. Direct, specific, name exact funds always. Format with emojis. No jargon.",
        messages:[{role:"user",content:`Analyse this Indian MF portfolio (Budget 2024 after-tax):

Total Invested: ${fmtC(ti)} | Current: ${fmtC(tc)} | After-Tax Gain: ${fmtC(tn)} | Tax Bill: ${fmtC(tt)}

${h.map(x=>`- ${x.schemeName.replace(/ - Direct (Plan )?- Growth/i,"").replace(/ Fund/i,"")}: invested ${fmtC(x.investedAmount||0)}, after-tax return ${fmtP(x.netReturnPct)}, 1Y CAGR ${x.r1y?fmtP(x.r1y):"N/A"}, signal: ${x.signal}`).join("\n")}

🔴 TO PAUSE: ${pause.map(x=>x.schemeName.split(" ").slice(0,3).join(" ")).join(", ")||"None"}
🟢 TO INCREASE: ${inc.map(x=>x.schemeName.split(" ").slice(0,3).join(" ")).join(", ")||"None"}

Sections:
📊 PORTFOLIO VERDICT (2-3 sentences)
🔴 PAUSE THESE — for each: why exit + ONE specific alternative fund to switch to
🟡 CONTINUE BUT WATCH — what to monitor
🟢 INCREASE SIP HERE — how much more
📉 GAPS — missing categories
💰 TAX MOVE — one action before March 31
⚡ DO THIS WEEK — single most impactful action`}]
      })});
      const d=await res.json(); setAiText(d.content?.[0]?.text||"Analysis unavailable.");
    } catch { setAiText("⚠️ AI failed. Portfolio loaded."); }
  }

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) handleFile(f); },[]);
  const ti=holdings.reduce((s,h)=>s+(h.investedAmount||0),0);
  const tc=holdings.reduce((s,h)=>s+(h.currentValue||0),0);
  const tn=holdings.reduce((s,h)=>s+(h.netGain||0),0);
  const tt=holdings.reduce((s,h)=>s+(h.tax||0),0);
  const np=ti>0?tn/ti*100:0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><span className="text-white font-bold">F</span></div>
          <span className="font-bold text-lg text-gray-900">FolioIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Dashboard</Link>
          <Link href="/risk" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Risk Profile</Link>
          <span className="px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-full">📤 Upload</span>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Portfolio</h1>
        <p className="text-gray-500 text-sm mb-8">Excel · CSV · PDF (CAS) · Screenshot from Kuvera, Groww, Zerodha, ET Money, Paytm Money</p>

        {stage==="idle" && (
          <>
            <div className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6 ${dragOver?"border-green-600 bg-green-50":"border-gray-300 bg-white hover:border-green-600 hover:bg-green-50"}`}
              onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>fileRef.current?.click()}>
              <div className="text-5xl mb-4">📤</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Drop your portfolio file here</div>
              <div className="text-sm text-gray-500 mb-6">or click to browse</div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {[["📊","Excel (.xlsx .xls)"],["📄","CSV"],["📋","PDF (CAS/Statement)"],["📸","Screenshot (PNG JPG)"]].map(([i,l])=>(
                  <span key={l as string} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">{i} {l}</span>
                ))}
              </div>
              <div className="text-xs text-gray-400">Kuvera · Groww · Zerodha Coin · ET Money · Paytm Money · CAMS CAS · KFintech · MF Central</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e=>{if(e.target.files?.[0])handleFile(e.target.files[0]);}}/>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <span className="text-xl">💡</span>
              <div><div className="font-semibold text-yellow-800 text-sm mb-1">No digital statement? Use our Excel template</div>
              <div className="text-yellow-700 text-xs">Download the <a href="/portfolio-template.xlsx" className="underline font-semibold" download>Excel template</a>, fill in your fund names, units and purchase date, then upload here.</div></div>
            </div>
          </>
        )}

        {(stage==="uploading"||stage==="enriching"||stage==="analysing") && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="flex justify-center gap-2 mb-6">{[0,1,2].map(i=><div key={i} className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {stage==="uploading"&&`Reading ${fileName}...`}{stage==="enriching"&&`Fetching live NAV for ${stats.matched} funds...`}{stage==="analysing"&&"Running AI analysis..."}
            </div>
            <div className="text-sm text-gray-500">
              {stage==="uploading"&&"Extracting fund names, units, NAV and purchase dates"}{stage==="enriching"&&"Getting live prices from AMFI via mfapi.in"}{stage==="analysing"&&"Calculating after-tax returns · Writing Stop/Continue/Increase recommendations"}
            </div>
          </div>
        )}

        {stage==="error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-semibold text-red-700 mb-2">{errMsg}</div>
            <div className="text-sm text-gray-500 mb-4">Tips: Use a direct app screenshot · Make sure fund names are visible · For Excel, use our template</div>
            <button onClick={()=>{setStage("idle");setErrMsg("");}} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">Try Again</button>
          </div>
        )}

        {stage==="done" && (<>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="font-semibold text-green-800">✓ Imported from {fileName} — {stats.matched} funds matched</span>
            <button onClick={()=>{setStage("idle");setHoldings([]);setAiText("");}} className="text-sm text-green-700 underline">Upload different file</button>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[{l:"Amount Invested",v:fmtC(ti),c:"text-gray-900"},{l:"Current Value",v:fmtC(tc),c:tc>=ti?"text-green-700":"text-red-600"},{l:"Money You Keep (After Tax)",v:fmtP(np),c:np>=0?"text-green-700":"text-red-600",h:true},{l:"Tax Liability Today",v:fmtC(tt),c:"text-yellow-700"}].map(({l,v,c,h})=>(
              <div key={l} className={`rounded-xl p-4 border ${h?"bg-green-50 border-green-200":"bg-white border-gray-200"}`}>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{l}</div>
                <div className={`text-2xl font-bold ${c}`}>{v}</div>
                {h&&<div className="text-xs text-gray-400 mt-1">What you actually made</div>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[{l:"🔴 Pause / Exit",f:holdings.filter(h=>h.signal==="PAUSE"),bg:"bg-red-50",b:"border-red-200",c:"text-red-700"},{l:"🟡 Continue & Watch",f:holdings.filter(h=>h.signal==="CONTINUE"),bg:"bg-yellow-50",b:"border-yellow-200",c:"text-yellow-700"},{l:"🟢 Increase SIP",f:holdings.filter(h=>h.signal==="INCREASE"),bg:"bg-green-50",b:"border-green-200",c:"text-green-700"}].map(({l,f,bg,b,c})=>(
              <div key={l} className={`rounded-xl p-4 border ${bg} ${b}`}>
                <div className={`text-sm font-bold mb-3 ${c}`}>{l} ({f.length})</div>
                {f.length===0?<div className="text-xs text-gray-400">None</div>:f.slice(0,3).map(h=>(
                  <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1">
                    {h.schemeName.replace(/ - Direct (Plan )?- Growth/i,"").replace(/ Fund/i,"").substring(0,30)}
                    {h.r1y!=null&&<span className="ml-1 text-gray-400">({fmtP(h.r1y)} 1Y)</span>}
                  </div>
                ))}
                {f.length>3&&<div className="text-xs text-gray-400">+{f.length-3} more</div>}
              </div>
            ))}
          </div>
          {aiText&&(
            <div className="bg-gradient-to-br from-green-50 to-purple-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse"/>
                <div className="text-lg font-bold text-gray-900">AI Portfolio Advisor</div>
                <span className="ml-auto text-xs bg-green-700 text-white px-2 py-1 rounded-full font-bold">After-Tax Analysis</span>
              </div>
              <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{aiText}</div>
            </div>
          )}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Holdings — After-Tax Returns</h2>
            <div className="text-xs text-yellow-700 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">After-tax: Equity &gt;12m = LTCG 12.5% (₹1.25L exempt) · Equity &lt;12m = STCG 20% · Debt = slab rate · 4% cess included</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-gray-200">
                  {["Fund","Signal","Invested","Current Value","After-Tax Return","1Y CAGR","3Y CAGR","Held"].map(h=>(
                    <th key={h} className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {holdings.map(h=>{
                    const s={PAUSE:{bg:"bg-red-100 text-red-700",l:"✕ Pause"},CONTINUE:{bg:"bg-yellow-100 text-yellow-700",l:"◉ Continue"},INCREASE:{bg:"bg-green-100 text-green-700",l:"▲ Increase"}};
                    const sig=s[h.signal||"CONTINUE"];
                    return (
                      <tr key={h.schemeCode} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 max-w-[180px]">
                          <div className="font-semibold text-gray-900 text-xs truncate" title={h.schemeName}>{h.schemeName.replace(/ - Direct (Plan )?- Growth/i,"").replace(/ Fund/i,"")}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{h.category?.replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)} · {h.amc?.split(" ")[0]}</div>
                        </td>
                        <td className="py-3 px-2"><span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${sig.bg}`}>{sig.l}</span></td>
                        <td className="py-3 px-2 font-mono text-xs text-gray-700">{fmtC(h.investedAmount||0)}</td>
                        <td className="py-3 px-2 font-mono text-xs"><span className={(h.currentValue||0)>=(h.investedAmount||0)?"text-green-700":"text-red-600"}>{fmtC(h.currentValue||0)}</span></td>
                        <td className="py-3 px-2 font-mono text-xs"><span className={pc(h.netReturnPct||0)}>{fmtP(h.netReturnPct)}</span></td>
                        <td className="py-3 px-2 font-mono text-xs"><span className={pc(h.r1y||0)}>{h.r1y!=null?fmtP(h.r1y):"—"}</span></td>
                        <td className="py-3 px-2 font-mono text-xs"><span className={pc(h.r3y||0)}>{h.r3y!=null?fmtP(h.r3y):"—"}</span></td>
                        <td className="py-3 px-2 text-xs text-gray-400">{Math.round((h.holdingDays||0)/30)}m</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {stats.unmatched.length>0&&(
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-xs font-bold text-yellow-800 mb-1">⚠️ {stats.unmatched.length} fund(s) not found in AMFI — add manually on Dashboard</div>
                <div className="text-xs text-yellow-700">{stats.unmatched.slice(0,5).join(" · ")}</div>
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Link href="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700">→ Go to Dashboard</Link>
              <button onClick={()=>{setStage("idle");setHoldings([]);setAiText("");}} className="px-5 py-2.5 border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100">Upload Another</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
