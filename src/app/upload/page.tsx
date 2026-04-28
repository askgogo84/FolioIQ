// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// MUST match dashboard/page.tsx
const STORAGE_KEY = "folioiq_portfolio";

const fmtC = (n) => { if (!n && n !== 0) return "—"; const a = Math.abs(Number(n)), s = Number(n) < 0 ? "-" : ""; if (a >= 10000000) return s + "₹" + (a / 10000000).toFixed(2) + "Cr"; if (a >= 100000) return s + "₹" + (a / 100000).toFixed(2) + "L"; return s + "₹" + a.toLocaleString("en-IN", { maximumFractionDigits: 0 }); };
const fmtP = (n, dp = 1) => (n == null || isNaN(Number(n))) ? "—" : (Number(n) > 0 ? "+" : "") + Number(n).toFixed(dp) + "%";

export default function UploadPage() {
  const router = useRouter();
  const [stage, setStage] = useState("idle");
  const [dragOver, setDragOver] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [aiText, setAiText] = useState("");
  const [stats, setStats] = useState({ extracted: 0, matched: 0, unmatched: [] });
  const [errMsg, setErrMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  async function handleFile(file) {
    setFileName(file.name);
    setStage("uploading");
    setErrMsg("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload-portfolio", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success || !data.holdings?.length) {
        setErrMsg(data.error || "No funds found. Try the Excel template or a clearer screenshot.");
        setStage("error");
        return;
      }
      setStats({ extracted: data.totalExtracted, matched: data.totalMatched, unmatched: data.unmatched || [] });
      setStage("enriching");
      const enriched = await enrichHoldings(data.holdings);
      setHoldings(enriched);

      // CRITICAL: Save to shared localStorage key so dashboard picks it up
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));

      setStage("analysing");
      await runAI(enriched);
      setStage("done");
    } catch (e) {
      setErrMsg("Network error. Please try again.");
      setStage("error");
    }
  }

  async function enrichHoldings(raw) {
    const out = [];
    for (let i = 0; i < raw.length; i += 4) {
      const batch = await Promise.allSettled(raw.slice(i, i + 4).map(async (h) => {
        try {
          const d = await (await fetch("https://api.mfapi.in/mf/" + h.schemeCode)).json();
          const nav = d?.data || [];
          const liveNAV = nav.length ? parseFloat(nav[0].nav) : 0;

          // Use pre-enriched values from NJ Wealth XLS if available and > 0
          const usePreEnriched = h.preEnriched && h.preEnrichedCurrentValue && Number(h.preEnrichedCurrentValue) > 0;
          const curNAV = usePreEnriched ? (Number(h.preEnrichedCurrentNAV) || liveNAV) : liveNAV;
          const units = Number(h.units) || 0;
          const avgNav = Number(h.avgNav) || curNAV;
          const inv = Number(h.investedAmount) || (units * avgNav) || 0;
          const cur = usePreEnriched ? Number(h.preEnrichedCurrentValue) : (units * liveNAV);

          const holdingDays = Math.round((Date.now() - new Date(h.purchaseDate).getTime()) / 86400000);
          const cat = h.category || "Equity Scheme";
          const CESS = 0.04;
          const isEq = (c) => /large|mid|small|flexi|multi|focused|value|contra|elss|index|etf|equity|sectoral|thematic/i.test(c || "");
          const isDb = (c) => /liquid|overnight|money market|ultra short|low dur|short dur|medium|long dur|corporate bond|banking|credit|gilt|dynamic bond|floater|conservative hybrid|arbitrage/i.test(c || "");

          const g = cur - inv;
          let tax = 0, netGain = g, netPct = inv > 0 ? g / inv * 100 : 0;
          if (g > 0) {
            if (isEq(cat)) tax = holdingDays >= 365 ? Math.max(0, g - 125000) * 0.125 * (1 + CESS) : g * 0.20 * (1 + CESS);
            else if (isDb(cat)) tax = g * 0.30 * (1 + CESS);
            else tax = holdingDays >= 730 ? g * 0.125 * (1 + CESS) : g * 0.30 * (1 + CESS);
            netGain = g - tax;
            netPct = netGain / inv * 100;
          }

          // CAGR
          function cagrFn(arr, y) { if (!arr || arr.length < 2) return null; const d = Math.round(y * 365); if (arr.length <= d) return null; const c = parseFloat(arr[0].nav), p = parseFloat(arr[Math.min(d, arr.length - 1)].nav); return (!p || p <= 0) ? null : (Math.pow(c / p, 1 / y) - 1) * 100; }
          const r1y = cagrFn(nav, 1), r3y = cagrFn(nav, 3);
          const signal = r1y !== null && r1y < 8 ? "PAUSE" : r1y !== null && r1y > 16 ? "INCREASE" : "CONTINUE";

          return { ...h, currentNAV: curNAV, currentValue: cur, investedAmount: inv, avgNav, units, tax, netGain, netReturnPct: netPct, r1y, r3y, holdingDays, signal };
        } catch {
          const units = Number(h.units) || 0;
          const avgNav = Number(h.avgNav) || 0;
          const inv = Number(h.investedAmount) || units * avgNav;
          const cur = Number(h.preEnrichedCurrentValue) || Number(h.currentValue) || inv;
          return { ...h, investedAmount: inv, currentValue: cur, signal: "CONTINUE", tax: 0, netGain: cur - inv, netReturnPct: inv > 0 ? (cur - inv) / inv * 100 : 0 };
        }
      }));
      for (const r of batch) if (r.status === "fulfilled" && r.value) out.push(r.value);
    }
    return out;
  }

  async function runAI(h) {
    const ti = h.reduce((s, x) => s + (x.investedAmount || 0), 0);
    const tc = h.reduce((s, x) => s + (x.currentValue || 0), 0);
    const tn = h.reduce((s, x) => s + (x.netGain || 0), 0);
    const tt = h.reduce((s, x) => s + (x.tax || 0), 0);
    const pause = h.filter(x => x.signal === "PAUSE");
    const inc = h.filter(x => x.signal === "INCREASE");
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500,
          system: "You are India's sharpest mutual fund advisor. Direct, specific, always name exact fund alternatives. Emojis for sections. Plain language, no jargon.",
          messages: [{
            role: "user",
            content: `Analyse this Indian MF portfolio (Budget 2024 after-tax):\n\nInvested: ${fmtC(ti)} | Current: ${fmtC(tc)} | After-Tax Gain: ${fmtC(tn)} | Tax: ${fmtC(tt)}\n\n${h.map(x => `- ${(x.schemeName || "").replace(/ - Direct.*/i, "").substring(0, 38)}: invested ${fmtC(x.investedAmount || 0)}, after-tax return ${fmtP(x.netReturnPct)}, 1Y CAGR ${x.r1y ? fmtP(x.r1y) : "N/A"}, signal: ${x.signal}`).join("\n")}\n\nPAUSE candidates: ${pause.map(x => (x.schemeName || "").split(" ").slice(0, 3).join(" ")).join(", ") || "None"}\nINCREASE candidates: ${inc.map(x => (x.schemeName || "").split(" ").slice(0, 3).join(" ")).join(", ") || "None"}\n\nSections:\n📊 PORTFOLIO VERDICT (2-3 sentences)\n🔴 PAUSE THESE — each: why + exact alternative fund to switch to\n🟡 CONTINUE BUT WATCH\n🟢 INCREASE SIP HERE\n📉 GAPS IN PORTFOLIO\n💰 TAX HARVEST MOVE (₹1.25L LTCG exemption)\n⚡ DO THIS WEEK`
          }]
        })
      });
      const d = await res.json();
      setAiText(d.content?.[0]?.text || "Analysis unavailable.");
    } catch { setAiText("AI analysis failed. Your portfolio has been saved — go to Dashboard to view."); }
  }

  const onDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, []);

  const ti = holdings.reduce((s, h) => s + (h.investedAmount || 0), 0);
  const tc = holdings.reduce((s, h) => s + (h.currentValue || 0), 0);
  const tn = holdings.reduce((s, h) => s + (h.netGain || 0), 0);
  const tt = holdings.reduce((s, h) => s + (h.tax || 0), 0);
  const np = ti > 0 ? tn / ti * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">F</span></div>
          <span className="font-bold text-lg text-gray-900">FolioIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Dashboard</Link>
          <Link href="/risk" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Risk Profile</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Portfolio</h1>
        <p className="text-gray-500 text-sm mb-6">NJ Wealth XLS · Kuvera · Groww · Zerodha Coin · ET Money · CAS PDF · Any screenshot</p>

        {stage === "idle" && (
          <>
            <div
              className={"border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all mb-5 " + (dragOver ? "border-green-600 bg-green-50" : "border-gray-300 bg-white hover:border-green-600 hover:bg-green-50")}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="text-4xl mb-3">📤</div>
              <div className="text-base font-semibold text-gray-900 mb-1">Drop your file here or click to browse</div>
              <div className="flex flex-wrap justify-center gap-2 mb-3 mt-3">
                {[["📊", "Excel / XLS (NJ Wealth, Kuvera)"], ["📋", "PDF (CAS Statement)"], ["📸", "Screenshot (any MF app)"], ["📄", "CSV"]].map(([icon, label]) => (
                  <span key={label} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">{icon} {label}</span>
                ))}
              </div>
              <div className="text-xs text-gray-400">Works with: NJ Wealth · Kuvera · Groww · Zerodha Coin · ET Money · Paytm Money · CAMS CAS · KFintech · MF Central</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <span className="text-lg">💡</span>
              <div>
                <div className="font-semibold text-yellow-800 text-sm mb-1">No digital statement? Use our Excel template</div>
                <div className="text-yellow-700 text-xs">Download the <a href="/portfolio-template.xlsx" className="underline font-semibold" download>Excel template</a>, fill in your fund names, units, avg NAV and purchase date, then upload here.</div>
              </div>
            </div>
          </>
        )}

        {(stage === "uploading" || stage === "enriching" || stage === "analysing") && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="flex justify-center gap-2 mb-5">
              {[0, 1, 2].map(i => <div key={i} className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: i * 0.15 + "s" }} />)}
            </div>
            <div className="text-base font-semibold text-gray-900 mb-1.5">
              {stage === "uploading" && `Reading ${fileName}...`}
              {stage === "enriching" && `Fetching live NAV for ${stats.matched} funds...`}
              {stage === "analysing" && "Running AI portfolio analysis..."}
            </div>
            <div className="text-sm text-gray-500">
              {stage === "uploading" && "Extracting fund names, units, NAV and dates"}
              {stage === "enriching" && "Getting real-time prices from AMFI · Calculating after-tax returns"}
              {stage === "analysing" && "Writing Stop / Continue / Increase recommendations"}
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-semibold text-red-700 mb-2">{errMsg}</div>
            <div className="text-sm text-gray-500 mb-4">Tips: For NJ Wealth, use the XLS/Excel file (not PDF) · For screenshots, make sure fund names are clearly visible · Or use our Excel template</div>
            <button onClick={() => { setStage("idle"); setErrMsg(""); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">Try Again</button>
          </div>
        )}

        {stage === "done" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 flex items-center justify-between">
              <span className="font-semibold text-green-800">✓ Imported from {fileName} — {stats.matched} funds loaded</span>
              <button onClick={() => { setStage("idle"); setHoldings([]); setAiText(""); }} className="text-sm text-green-700 underline">Upload different file</button>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { l: "Invested", v: fmtC(ti), c: "text-gray-900" },
                { l: "Current Value", v: fmtC(tc), c: tc >= ti ? "text-green-700" : "text-red-600" },
                { l: "After-Tax Return", v: fmtP(np), c: np >= 0 ? "text-green-700" : "text-red-600", hl: true },
                { l: "Tax Liability", v: fmtC(tt), c: "text-amber-700" },
              ].map(({ l, v, c, hl }) => (
                <div key={l} className={`rounded-xl p-4 border ${hl ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{l}</div>
                  <div className={`text-xl font-bold ${c}`}>{v}</div>
                  {hl && <div className="text-xs text-gray-400 mt-0.5">What you actually made</div>}
                </div>
              ))}
            </div>

            {/* Signal summary */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { l: "🔴 Pause / Exit", f: holdings.filter(h => h.signal === "PAUSE"), bg: "bg-red-50", b: "border-red-200", c: "text-red-700" },
                { l: "🟡 Continue & Watch", f: holdings.filter(h => h.signal === "CONTINUE"), bg: "bg-yellow-50", b: "border-yellow-200", c: "text-yellow-700" },
                { l: "🟢 Increase SIP", f: holdings.filter(h => h.signal === "INCREASE"), bg: "bg-green-50", b: "border-green-200", c: "text-green-700" },
              ].map(({ l, f, bg, b, c }) => (
                <div key={l} className={`rounded-xl p-4 border ${bg} ${b}`}>
                  <div className={`text-sm font-bold mb-2 ${c}`}>{l} ({f.length})</div>
                  {f.length === 0 ? <div className="text-xs text-gray-400">None</div> : f.slice(0, 3).map(h => (
                    <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1 truncate">
                      {(h.schemeName || "").replace(/ - Direct.*/i, "").replace(/ Fund/i, "").substring(0, 30)}
                      {h.r1y != null && <span className="ml-1 text-gray-400">({fmtP(h.r1y)})</span>}
                    </div>
                  ))}
                  {f.length > 3 && <div className="text-xs text-gray-400">+{f.length - 3} more</div>}
                </div>
              ))}
            </div>

            {/* AI Analysis */}
            {aiText && (
              <div className="bg-gradient-to-br from-green-50 to-purple-50 border border-green-200 rounded-2xl p-5 mb-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse" />
                  <div className="text-base font-bold text-gray-900">AI Portfolio Advisor</div>
                  <span className="ml-auto text-xs bg-green-700 text-white px-2 py-1 rounded-full font-bold">After-Tax Analysis</span>
                </div>
                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{aiText}</div>
              </div>
            )}

            {/* Holdings table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5">
              <div className="px-5 py-4 border-b border-gray-100 font-bold text-gray-900">All Holdings — After-Tax Returns</div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b-2 border-gray-100">
                    {["Fund", "Signal", "Invested", "Current", "After-Tax Return", "1Y CAGR", "Held"].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {holdings.map(h => {
                      const s = { PAUSE: { cls: "bg-red-100 text-red-700", l: "✕ Pause" }, CONTINUE: { cls: "bg-yellow-100 text-yellow-700", l: "◉ Continue" }, INCREASE: { cls: "bg-green-100 text-green-700", l: "▲ Increase" } };
                      const sig = s[h.signal || "CONTINUE"];
                      return (
                        <tr key={h.schemeCode} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900 text-xs truncate max-w-[180px]" title={h.schemeName}>{(h.schemeName || "").replace(/ - Direct.*/i, "").replace(/ Fund/i, "")}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{(h.category || "").replace(/^(Equity|Other|Debt) Scheme - /, "").substring(0, 20)}</div>
                            {(h.sipAmount || 0) > 0 && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">SIP ₹{(h.sipAmount).toLocaleString("en-IN")}</span>}
                          </td>
                          <td className="py-3 px-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${sig.cls}`}>{sig.l}</span></td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-700">{fmtC(h.investedAmount)}</td>
                          <td className={`py-3 px-4 font-mono text-xs font-semibold ${(h.currentValue || 0) >= (h.investedAmount || 0) ? "text-green-700" : "text-red-600"}`}>{fmtC(h.currentValue)}</td>
                          <td className={`py-3 px-4 font-mono text-xs font-semibold ${(h.netReturnPct || 0) >= 0 ? "text-green-700" : "text-red-600"}`}>{fmtP(h.netReturnPct)}</td>
                          <td className={`py-3 px-4 font-mono text-xs ${(h.r1y || 0) >= 0 ? "text-green-700" : "text-red-600"}`}>{h.r1y != null ? fmtP(h.r1y) : "—"}</td>
                          <td className="py-3 px-4 text-xs text-gray-400">{Math.round((h.holdingDays || 0) / 30)}m</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-yellow-50 border-t border-yellow-100">
                <p className="text-xs text-yellow-700">After-tax: Equity &gt;12m = LTCG 12.5% (₹1.25L exempt) · Equity &lt;12m = STCG 20% · Debt = slab rate · 4% cess</p>
              </div>
            </div>

            {stats.unmatched.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                <div className="text-xs font-bold text-yellow-800 mb-1">⚠️ {stats.unmatched.length} fund(s) not matched in AMFI database — add them manually on Dashboard</div>
                <div className="text-xs text-yellow-700">{stats.unmatched.slice(0, 5).join(" · ")}</div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/dashboard" className="px-5 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700">→ Go to Dashboard</Link>
              <button onClick={() => { setStage("idle"); setHoldings([]); setAiText(""); }} className="px-5 py-3 border border-gray-200 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-100">Upload Another File</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
