/* eslint-disable */
// @ts-nocheck
"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [stage, setStage] = useState("idle");
  const [dragOver, setDragOver] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [aiText, setAiText] = useState("");
  const [stats, setStats] = useState({ extracted: 0, matched: 0, unmatched: [] });
  const [errMsg, setErrMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);

  const fmtC = (n) => {
    if (!n || isNaN(n)) return "—";
    const a = Math.abs(n), s = n < 0 ? "-" : "";
    if (a >= 10000000) return s + "Rs." + (a / 10000000).toFixed(2) + "Cr";
    if (a >= 100000) return s + "Rs." + (a / 100000).toFixed(2) + "L";
    return s + "Rs." + a.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };
  const fmtP = (n, dp) => {
    const d = dp || 1;
    if (n == null || isNaN(n)) return "—";
    return (n > 0 ? "+" : "") + Number(n).toFixed(d) + "%";
  };
  const pc = (n) => Number(n) >= 0 ? "text-green-700" : "text-red-600";

  const CESS = 0.04;
  const isEq = (c) => /large|mid|small|flexi|multi|focused|value|contra|elss|index|etf|equity|sectoral|thematic/i.test(c || "");
  const isDb = (c) => /liquid|overnight|money market|ultra short|low dur|short dur|medium dur|long dur|corporate bond|banking|credit|gilt|dynamic bond|floater|conservative hybrid|arbitrage/i.test(c || "");

  function taxCalc(inv, cur, days, cat, slab) {
    const s = slab || 0.30;
    const g = cur - inv;
    if (g <= 0) return { tax: 0, netGain: g, netPct: inv > 0 ? g / inv * 100 : 0 };
    let tax = 0;
    if (isEq(cat)) { tax = days >= 365 ? Math.max(0, g - 125000) * 0.125 * (1 + CESS) : g * 0.20 * (1 + CESS); }
    else if (isDb(cat)) { tax = g * s * (1 + CESS); }
    else { tax = days >= 730 ? g * 0.125 * (1 + CESS) : g * s * (1 + CESS); }
    return { tax, netGain: g - tax, netPct: (g - tax) / inv * 100 };
  }

  function daysFrom(s) {
    try { return Math.round((Date.now() - new Date(s).getTime()) / 86400000); } catch(e) { return 730; }
  }

  function cagrCalc(arr, y) {
    if (!arr || arr.length < 2) return null;
    const d = Math.round(y * 365);
    if (arr.length <= d) return null;
    const c = parseFloat(arr[0].nav);
    const p = parseFloat(arr[Math.min(d, arr.length - 1)].nav);
    if (!p || p <= 0) return null;
    return (Math.pow(c / p, 1 / y) - 1) * 100;
  }

  async function handleFile(file) {
    setFileName(file.name);
    setStage("uploading");
    setErrMsg("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload-portfolio", { method: "POST", body: form });
      const data = await res.json();
      if (!data.success || !data.holdings || !data.holdings.length) {
        setErrMsg(data.error || "No funds found. Try a clearer image or use the Excel template.");
        setStage("error");
        return;
      }
      setStats({ extracted: data.totalExtracted, matched: data.totalMatched, unmatched: data.unmatched || [] });
      setStage("enriching");
      const enriched = await enrichHoldings(data.holdings);
      setHoldings(enriched);
      setStage("analysing");
      await runAI(enriched);
      setStage("done");
    } catch(e) {
      setErrMsg("Network error. Please try again.");
      setStage("error");
    }
  }

  async function enrichHoldings(raw) {
    const out = [];
    for (let i = 0; i < raw.length; i += 4) {
      const batch = await Promise.allSettled(raw.slice(i, i + 4).map(async function(h) {
        try {
          const d = await (await fetch("https://api.mfapi.in/mf/" + h.schemeCode)).json();
          const nav = d && d.data ? d.data : [];
          const cur = nav.length ? parseFloat(nav[0].nav) : h.avgNav;
          const hd = daysFrom(h.purchaseDate);
          const inv = h.units * h.avgNav;
          const cv = h.units * cur;
          const t = taxCalc(inv, cv, hd, h.category, 0.30);
          const r1y = cagrCalc(nav, 1);
          const r3y = cagrCalc(nav, 3);
          const signal = r1y !== null && r1y < 8 ? "PAUSE" : r1y !== null && r1y > 16 ? "INCREASE" : "CONTINUE";
          return Object.assign({}, h, { currentNAV: cur, currentValue: cv, investedAmount: inv, tax: t.tax, netGain: t.netGain, netReturnPct: t.netPct, r1y: r1y, r3y: r3y, holdingDays: hd, signal: signal });
        } catch(e) {
          return Object.assign({}, h, { investedAmount: h.units * h.avgNav, currentValue: h.units * h.avgNav, signal: "CONTINUE" });
        }
      }));
      for (let j = 0; j < batch.length; j++) {
        if (batch[j].status === "fulfilled") out.push(batch[j].value);
      }
    }
    return out;
  }

  async function runAI(h) {
    const ti = h.reduce(function(s, x) { return s + (x.investedAmount || 0); }, 0);
    const tc = h.reduce(function(s, x) { return s + (x.currentValue || 0); }, 0);
    const tn = h.reduce(function(s, x) { return s + (x.netGain || 0); }, 0);
    const tt = h.reduce(function(s, x) { return s + (x.tax || 0); }, 0);
    const pause = h.filter(function(x) { return x.signal === "PAUSE"; });
    const inc = h.filter(function(x) { return x.signal === "INCREASE"; });
    const lines = h.map(function(x) {
      const name = x.schemeName.replace(/ - Direct (Plan )?- Growth/i, "").replace(/ Fund/i, "");
      return "- " + name + ": invested " + fmtC(x.investedAmount || 0) + ", after-tax return " + fmtP(x.netReturnPct) + ", 1Y CAGR " + (x.r1y ? fmtP(x.r1y) : "N/A") + ", signal: " + x.signal;
    }).join("\n");
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: "You are India best mutual fund advisor. Direct, specific, name exact funds always. Format with emojis and clear sections. No jargon.",
          messages: [{
            role: "user",
            content: "Analyse this Indian MF portfolio (Budget 2024 after-tax):\n\nTotal Invested: " + fmtC(ti) + " | Current: " + fmtC(tc) + " | After-Tax Gain: " + fmtC(tn) + " | Tax Bill: " + fmtC(tt) + "\n\n" + lines + "\n\nFlagged PAUSE: " + (pause.map(function(x) { return x.schemeName.split(" ").slice(0,3).join(" "); }).join(", ") || "None") + "\nFlagged INCREASE: " + (inc.map(function(x) { return x.schemeName.split(" ").slice(0,3).join(" "); }).join(", ") || "None") + "\n\nSections:\n📊 PORTFOLIO VERDICT\n🔴 PAUSE THESE - why + ONE specific alternative fund\n🟡 CONTINUE BUT WATCH\n🟢 INCREASE SIP HERE\n📉 GAPS\n💰 TAX MOVE before March 31\n⚡ DO THIS WEEK"
          }]
        })
      });
      const d = await res.json();
      setAiText((d.content && d.content[0] && d.content[0].text) ? d.content[0].text : "Analysis unavailable.");
    } catch(e) {
      setAiText("AI analysis failed. Your portfolio data loaded successfully.");
    }
  }

  const totalInvested = holdings.reduce(function(s, h) { return s + (h.investedAmount || 0); }, 0);
  const totalCurrent = holdings.reduce(function(s, h) { return s + (h.currentValue || 0); }, 0);
  const totalNetGain = holdings.reduce(function(s, h) { return s + (h.netGain || 0); }, 0);
  const totalTax = holdings.reduce(function(s, h) { return s + (h.tax || 0); }, 0);
  const netReturnPct = totalInvested > 0 ? totalNetGain / totalInvested * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-lg text-gray-900">FolioIQ</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Dashboard</Link>
          <Link href="/risk" className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Risk Profile</Link>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Portfolio</h1>
        <p className="text-gray-500 text-sm mb-8">Excel, CSV, PDF (CAS), or Screenshot from Kuvera, Groww, Zerodha, ET Money</p>

        {stage === "idle" && (
          <div>
            <div
              className={"border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6 " + (dragOver ? "border-green-600 bg-green-50" : "border-gray-300 bg-white hover:border-green-600 hover:bg-green-50")}
              onDragOver={function(e) { e.preventDefault(); setDragOver(true); }}
              onDragLeave={function() { setDragOver(false); }}
              onDrop={function(e) { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={function() { if (fileRef.current) fileRef.current.click(); }}
            >
              <div className="text-5xl mb-4">📤</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Drop your portfolio file here</div>
              <div className="text-sm text-gray-500 mb-6">or click to browse</div>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">📊 Excel</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">📄 CSV</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">📋 PDF (CAS)</span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full">📸 Screenshot</span>
              </div>
              <div className="text-xs text-gray-400">Kuvera, Groww, Zerodha Coin, ET Money, Paytm Money, CAMS CAS, KFintech, MF Central</div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={function(e) { if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
              <span className="text-xl">💡</span>
              <div>
                <div className="font-semibold text-yellow-800 text-sm mb-1">No digital statement? Use our Excel template</div>
                <div className="text-yellow-700 text-xs">
                  Download the <a href="/portfolio-template.xlsx" className="underline font-semibold" download>Excel template</a>, fill in your fund names, units and purchase date, then upload here.
                </div>
              </div>
            </div>
          </div>
        )}

        {(stage === "uploading" || stage === "enriching" || stage === "analysing") && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            </div>
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {stage === "uploading" && ("Reading " + fileName + "...")}
              {stage === "enriching" && ("Fetching live NAV for " + stats.matched + " funds...")}
              {stage === "analysing" && "Running AI analysis..."}
            </div>
            <div className="text-sm text-gray-500">
              {stage === "uploading" && "Extracting fund names, units, NAV and purchase dates"}
              {stage === "enriching" && "Getting live prices from AMFI via mfapi.in"}
              {stage === "analysing" && "Calculating after-tax returns and writing recommendations"}
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <div className="font-semibold text-red-700 mb-2">{errMsg}</div>
            <div className="text-sm text-gray-500 mb-4">Tips: Use a direct app screenshot, make sure fund names are visible, or use our Excel template</div>
            <button onClick={function() { setStage("idle"); setErrMsg(""); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold">Try Again</button>
          </div>
        )}

        {stage === "done" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="font-semibold text-green-800">Imported from {fileName} — {stats.matched} funds matched</span>
              <button onClick={function() { setStage("idle"); setHoldings([]); setAiText(""); }} className="text-sm text-green-700 underline">Upload different file</button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl p-4 border bg-white border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Amount Invested</div>
                <div className="text-2xl font-bold text-gray-900">{fmtC(totalInvested)}</div>
              </div>
              <div className="rounded-xl p-4 border bg-white border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Current Value</div>
                <div className={"text-2xl font-bold " + (totalCurrent >= totalInvested ? "text-green-700" : "text-red-600")}>{fmtC(totalCurrent)}</div>
              </div>
              <div className="rounded-xl p-4 border bg-green-50 border-green-200">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Money You Keep (After Tax)</div>
                <div className={"text-2xl font-bold " + (netReturnPct >= 0 ? "text-green-700" : "text-red-600")}>{fmtP(netReturnPct)}</div>
                <div className="text-xs text-gray-400 mt-1">What you actually made</div>
              </div>
              <div className="rounded-xl p-4 border bg-white border-gray-200">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Tax Liability Today</div>
                <div className="text-2xl font-bold text-yellow-700">{fmtC(totalTax)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl p-4 border bg-red-50 border-red-200">
                <div className="text-sm font-bold mb-3 text-red-700">🔴 Pause / Exit ({holdings.filter(function(h) { return h.signal === "PAUSE"; }).length})</div>
                {holdings.filter(function(h) { return h.signal === "PAUSE"; }).length === 0
                  ? <div className="text-xs text-gray-400">None</div>
                  : holdings.filter(function(h) { return h.signal === "PAUSE"; }).slice(0, 3).map(function(h) {
                      return <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1">{h.schemeName.replace(/ - Direct (Plan )?- Growth/i, "").replace(/ Fund/i, "").substring(0, 30)}{h.r1y != null ? " (" + fmtP(h.r1y) + " 1Y)" : ""}</div>;
                    })
                }
              </div>
              <div className="rounded-xl p-4 border bg-yellow-50 border-yellow-200">
                <div className="text-sm font-bold mb-3 text-yellow-700">🟡 Continue ({holdings.filter(function(h) { return h.signal === "CONTINUE"; }).length})</div>
                {holdings.filter(function(h) { return h.signal === "CONTINUE"; }).length === 0
                  ? <div className="text-xs text-gray-400">None</div>
                  : holdings.filter(function(h) { return h.signal === "CONTINUE"; }).slice(0, 3).map(function(h) {
                      return <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1">{h.schemeName.replace(/ - Direct (Plan )?- Growth/i, "").replace(/ Fund/i, "").substring(0, 30)}{h.r1y != null ? " (" + fmtP(h.r1y) + " 1Y)" : ""}</div>;
                    })
                }
              </div>
              <div className="rounded-xl p-4 border bg-green-50 border-green-200">
                <div className="text-sm font-bold mb-3 text-green-700">🟢 Increase SIP ({holdings.filter(function(h) { return h.signal === "INCREASE"; }).length})</div>
                {holdings.filter(function(h) { return h.signal === "INCREASE"; }).length === 0
                  ? <div className="text-xs text-gray-400">None</div>
                  : holdings.filter(function(h) { return h.signal === "INCREASE"; }).slice(0, 3).map(function(h) {
                      return <div key={h.schemeCode} className="text-xs font-medium text-gray-900 mb-1">{h.schemeName.replace(/ - Direct (Plan )?- Growth/i, "").replace(/ Fund/i, "").substring(0, 30)}{h.r1y != null ? " (" + fmtP(h.r1y) + " 1Y)" : ""}</div>;
                    })
                }
              </div>
            </div>

            {aiText && (
              <div className="bg-gradient-to-br from-green-50 to-purple-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse"></div>
                  <div className="text-lg font-bold text-gray-900">AI Portfolio Advisor</div>
                  <span className="ml-auto text-xs bg-green-700 text-white px-2 py-1 rounded-full font-bold">After-Tax Analysis</span>
                </div>
                <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{aiText}</div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">All Holdings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Fund</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Signal</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Invested</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Current</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">After-Tax Return</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">1Y CAGR</th>
                      <th className="text-left py-3 px-2 text-xs font-bold text-gray-400 uppercase">Held</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(function(h) {
                      const sigLabel = h.signal === "PAUSE" ? "Pause" : h.signal === "INCREASE" ? "Increase" : "Continue";
                      const sigCls = h.signal === "PAUSE" ? "bg-red-100 text-red-700" : h.signal === "INCREASE" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
                      return (
                        <tr key={h.schemeCode} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 max-w-xs">
                            <div className="font-semibold text-gray-900 text-xs truncate">{h.schemeName.replace(/ - Direct (Plan )?- Growth/i, "").replace(/ Fund/i, "")}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{(h.category || "").replace(/^(Equity|Other|Debt) Scheme - /, "").substring(0, 20)}</div>
                          </td>
                          <td className="py-3 px-2"><span className={"text-xs font-bold px-2 py-1 rounded-full " + sigCls}>{sigLabel}</span></td>
                          <td className="py-3 px-2 font-mono text-xs text-gray-700">{fmtC(h.investedAmount || 0)}</td>
                          <td className={"py-3 px-2 font-mono text-xs " + ((h.currentValue || 0) >= (h.investedAmount || 0) ? "text-green-700" : "text-red-600")}>{fmtC(h.currentValue || 0)}</td>
                          <td className={"py-3 px-2 font-mono text-xs " + pc(h.netReturnPct || 0)}>{fmtP(h.netReturnPct)}</td>
                          <td className={"py-3 px-2 font-mono text-xs " + pc(h.r1y || 0)}>{h.r1y != null ? fmtP(h.r1y) : "—"}</td>
                          <td className="py-3 px-2 text-xs text-gray-400">{Math.round((h.holdingDays || 0) / 30)}m</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-700">Go to Dashboard</Link>
                <button onClick={function() { setStage("idle"); setHoldings([]); setAiText(""); }} className="px-5 py-2.5 border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100">Upload Another</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
