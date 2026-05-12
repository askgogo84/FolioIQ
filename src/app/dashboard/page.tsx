
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis
} from "recharts";
import Link from "next/link";

// ── UTILITIES ────────────────────────────────────────────────
const fmtL = (v: number, hide = false): string => {
  if (hide) return "₹ ••••";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 10000000) return `${s}₹${(a / 10000000).toFixed(2)} Cr`;
  if (a >= 100000) return `${s}₹${(a / 100000).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};
const pctStr = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const getBucket = (c = "") =>
  /equity|large|mid|small|flexi|elss|sectoral|thematic|focused/i.test(c) ? "Equity"
  : /debt|gilt|bond|duration|liquid|overnight|money|credit|floater/i.test(c) ? "Debt"
  : /hybrid|balanced|multi.asset/i.test(c) ? "Hybrid"
  : /gold|silver/i.test(c) ? "Gold" : "Other";

const BUCKET_COLOR: Record<string, string> = {
  Equity: "#16a34a", Debt: "#2563eb", Hybrid: "#d97706", Gold: "#ca8a04", Other: "#64748b"
};

// ── ANIMATED COUNTER ─────────────────────────────────────────
function Counter({ to, hide, prefix = "₹", dur = 1400, cls = "" }:
  { to: number; hide: boolean; prefix?: string; dur?: number; cls?: string }) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (hide) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, hide, dur]);
  if (hide) return <span className={cls}>₹ ••••</span>;
  return <span className={cls}>{fmtL(val)}</span>;
}

// ── MINI SPARKLINE ───────────────────────────────────────────
function Spark({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => ({ x: i, y: v }));
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={pts} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="y" stroke={color} fill={`url(#sg${color.replace("#","")})`}
          strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── NAV ITEMS ────────────────────────────────────────────────
const NAV = [
  { section: "PORTFOLIO", items: [
    { l: "Dashboard", h: "/dashboard", d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", a: true },
    { l: "Upload CAS", h: "/upload", d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" },
    { l: "Transactions", h: "/transactions", d: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
    { l: "Profile", h: "/profile", d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
  ]},
  { section: "INTELLIGENCE", items: [
    { l: "AI Insights", h: "/intelligence", d: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M6.343 6.343l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" },
    { l: "Smart Rebalance", h: "/rebalance", d: "M12 20v-6M6 20V10M18 20V4" },
    { l: "Tax Harvesting", h: "/tax-harvesting", d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
    { l: "AI Chat", h: "/chat", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  ]},
  { section: "PLANNING", items: [
    { l: "Goal Planner", h: "/goals", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { l: "SIP Calculator", h: "/calculator", d: "M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3M13 3h8M21 3v8M11 13L21 3" },
    { l: "Backtesting", h: "/backtest", d: "M3 3v18h18" },
  ]},
  { section: "DISCOVER", items: [
    { l: "Fund Explorer", h: "/explore", d: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" },
    { l: "Fund Screener", h: "/screener", d: "M4 6h16M4 12h8m-8 6h16" },
  ]},
];

const RISK_QS = [
  { q: "Your ₹1L drops to ₹80k. You...", opts: ["Sell everything", "Sell some", "Hold tight", "Buy more"], s: [1,2,3,4] },
  { q: "Investment horizon?", opts: ["< 1 year", "1–3 years", "3–7 years", "7+ years"], s: [1,2,3,4] },
  { q: "Monthly swing you can handle?", opts: ["< 5%", "5–10%", "10–20%", "20%+"], s: [1,2,3,4] },
  { q: "Your goal?", opts: ["Protect capital", "Steady growth", "High growth", "Max returns"], s: [1,2,3,4] },
  { q: "Markets fall 30%: you feel...", opts: ["Panic", "Anxious", "Calm", "Excited to buy"], s: [1,2,3,4] },
];

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [tab, setTab] = useState<"overview" | "funds" | "insights">("overview");
  const [sidebar, setSidebar] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [riskStep, setRiskStep] = useState(0);
  const [riskAns, setRiskAns] = useState<number[]>([]);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [selFund, setSelFund] = useState<any>(null);
  const [ticker, setTicker] = useState<any[]>([
    { n: "NIFTY 50", v: "--", c: "--", up: true },
    { n: "SENSEX", v: "--", c: "--", up: true },
    { n: "GOLD", v: "--", c: "--", up: true },
    { n: "USD/INR", v: "--", c: "--", up: false },
  ]);
  const [tickerPause, setTickerPause] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: pd } = await sb.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const valid = (pd.data.funds as any[]).filter((f: any) => {
          const n = String(f.name || "");
          return n.length > 5 && !/^\d{2}-\d{2}-\d{4}/.test(n) && !n.includes("No Of Unit") && !n.includes("Sub Total");
        });
        setHoldings(valid);
        setMeta(pd.data);
      }
      setLoading(false);
    };
    load();
    // Live market
    fetch("/api/market").then(r => r.json()).then(d => {
      if (d.indices?.length) setTicker(d.indices.map((x: any) => ({ n: x.name, v: x.value, c: x.change, up: x.up })));
    }).catch(() => {});
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    const r = await fetch("/api/market");
    const d = await r.json();
    if (d.indices?.length) setTicker(d.indices.map((x: any) => ({ n: x.name, v: x.value, c: x.change, up: x.up })));
    setTimeout(() => setRefreshing(false), 800);
  };

  const logout = () => sb.auth.signOut().then(() => router.push("/"));

  const handleRisk = (s: number) => {
    const a = [...riskAns, s];
    if (riskStep < RISK_QS.length - 1) { setRiskAns(a); setRiskStep(riskStep + 1); }
    else {
      const avg = a.reduce((x, y) => x + y, 0) / RISK_QS.length;
      setRiskResult(avg <= 1.8
        ? { t: "Conservative", e: "🛡️", col: "#2563eb", rec: "70% Debt · 20% Hybrid · 10% Equity" }
        : avg <= 2.8
        ? { t: "Balanced", e: "⚖️", col: "#d97706", rec: "50% Equity · 30% Hybrid · 20% Debt" }
        : { t: "Aggressive", e: "🚀", col: "#16a34a", rec: "80% Equity · 10% Hybrid · 10% Debt" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-[3px] border-gray-200 border-t-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400 tracking-wide font-medium">Loading portfolio</p>
      </div>
    </div>
  );

  // Metrics
  const inv = holdings.reduce((s, h) => s + (h.invested || 0), 0);
  const cur = holdings.reduce((s, h) => s + (h.value || 0), 0);
  const gain = cur - inv;
  const pct = inv > 0 ? (gain / inv) * 100 : 0;
  const sip = holdings.reduce((s, h) => s + (h.sip || 0), 0);
  const activeSIPs = holdings.filter(h => h.sip > 0).length;
  const afterTax = gain > 0 ? gain * 0.875 : gain;
  const gainers = holdings.filter(h => (h.value || 0) > (h.invested || 0));
  const losers = holdings.filter(h => (h.value || 0) < (h.invested || 0));
  const health = Math.min(100, Math.round(
    (gainers.length / Math.max(holdings.length, 1)) * 45 +
    Math.min(holdings.length, 20) / 20 * 30 +
    (pct > 12 ? 25 : pct > 8 ? 15 : pct > 0 ? 8 : 0)
  ));

  // Day sim
  const dayPct = ((cur % 7) / 7 - 0.42) * 1.8;
  const dayAmt = cur * dayPct / 100;
  const dayUp = dayAmt >= 0;

  // Alloc
  const allocMap: Record<string, number> = {};
  holdings.forEach(h => { const b = getBucket(h.category || ""); allocMap[b] = (allocMap[b] || 0) + (h.value || 0); });
  const alloc = Object.entries(allocMap)
    .map(([name, val]) => ({ name, value: Math.round(val / Math.max(cur, 1) * 100), amt: val, color: BUCKET_COLOR[name] || "#64748b" }))
    .filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  // Chart
  const months = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const growthData = months.map((m, i) => ({
    m,
    p: Math.round(inv + (gain * (i + 1) / 12)),
    n: Math.round(inv * (1 + 0.12 * (i + 1) / 12)),
  }));

  // Sparkline data per KPI
  const sparkBase = (base: number, vol: number) => Array.from({ length: 8 }, (_, i) => base + vol * Math.sin(i * 0.8) + vol * 0.3 * i);

  const sorted = [...holdings].sort((a, b) => (b.returnsPercent || 0) - (a.returnsPercent || 0));
  const top3 = sorted.slice(0, 3);
  const bot3 = sorted.slice(-3).reverse().filter(h => (h.returnsPercent || 0) < 0);
  const taxSave = Math.round(Math.min(125000, holdings.reduce((s, h) => {
    const g = (h.value || 0) - (h.invested || 0);
    return s + (/equity|elss/i.test(h.category || "") && g > 0 ? g : 0);
  }, 0)) * 0.125 * 1.04);

  const sig = (r: number) =>
    r < -10 ? { l: "Exit", bg: "bg-red-100", tc: "text-red-700", dot: "bg-red-500" }
    : r < 0 ? { l: "Review", bg: "bg-orange-100", tc: "text-orange-700", dot: "bg-orange-500" }
    : r < 8 ? { l: "Watch", bg: "bg-amber-100", tc: "text-amber-700", dot: "bg-amber-500" }
    : r < 20 ? { l: "Hold", bg: "bg-emerald-100", tc: "text-emerald-700", dot: "bg-emerald-500" }
    : { l: "Star ⭐", bg: "bg-emerald-200", tc: "text-emerald-800", dot: "bg-emerald-600" };

  const hColor = health >= 70 ? "#16a34a" : health >= 50 ? "#d97706" : "#dc2626";

  // No portfolio
  if (holdings.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-xl shadow-emerald-200">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FolioIQ</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">Upload your NJ Wealth XLS to see your complete portfolio intelligence dashboard.</p>
        <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload Statement
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex" style={{ fontFamily: "'Inter var',system-ui,sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static z-50 inset-y-0 left-0 w-60 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300`}>
        <div className="px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-black">F</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm tracking-tight">FolioIQ</div>
              <div className="text-[9px] text-gray-400 tracking-widest uppercase">Portfolio Intelligence</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {NAV.map((sec, si) => (
            <div key={si}>
              <div className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase px-3 mb-2">{sec.section}</div>
              {sec.items.map(item => (
                <Link key={item.h} href={item.h} onClick={() => setSidebar(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium mb-0.5 transition-all
                    ${(item as any).a ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d={(item as any).d} />
                  </svg>
                  {item.l}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <button onClick={() => { setShowRisk(true); setRiskStep(0); setRiskAns([]); setRiskResult(null); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-violet-600 hover:bg-violet-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
            Risk Profile
          </button>
          <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        {/* ── TICKER ── */}
        <div className="bg-gray-950 overflow-hidden" style={{ height: 30 }}
          onMouseEnter={() => setTickerPause(true)} onMouseLeave={() => setTickerPause(false)}>
          <div className={`flex items-center h-full gap-8 px-4 text-[11px] ${tickerPause ? "" : "animate-[ticker_35s_linear_infinite]"}`}
            style={{ animationPlayState: tickerPause ? "paused" : "running" }}>
            {[...ticker, ...ticker, ...ticker].map((t, i) => (
              <span key={i} className="flex items-center gap-2 flex-shrink-0">
                <span className="text-gray-500">{t.n}</span>
                <span className="text-gray-200 font-mono">{t.v}</span>
                <span className={t.up ? "text-emerald-400" : "text-red-400"}>{t.c}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebar(!sidebar)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[15px] font-bold text-gray-900 truncate">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {user?.email?.split("@")[0]}
              </span>
              <span className={`hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${dayUp ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                {dayUp ? "↑" : "↓"} {fmtL(Math.abs(dayAmt))} ({dayUp ? "+" : ""}{dayPct.toFixed(2)}%) today
              </span>
            </div>
            <p className="text-[11px] text-gray-400">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setHide(!hide)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {hide ? <><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
            <button onClick={refresh} className={`p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${refreshing ? "animate-spin text-emerald-500" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          </div>
        </header>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto space-y-4">

            {/* ── HERO BANNER ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 text-white shadow-xl">
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"/>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"/>

              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Total Portfolio Value</div>
                  <Counter to={cur} hide={hide} cls="text-[38px] sm:text-[48px] font-black tracking-tight text-white block leading-none"/>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className={`text-[13px] font-bold ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {gain >= 0 ? "↑" : "↓"} {hide ? "••••" : fmtL(Math.abs(gain))} ({pctStr(pct)})
                    </span>
                    <span className="text-[11px] text-gray-500">all time</span>
                    <span className="text-[11px] text-gray-500">·</span>
                    <span className="text-[11px] text-gray-400">After-tax ≈ {hide ? "••••" : fmtL(afterTax)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { l: "Invested", v: inv, c: "text-gray-300" },
                    { l: "Monthly SIP", v: sip, c: "text-blue-300" },
                  ].map((k, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-3 sm:p-4 backdrop-blur-sm border border-white/10">
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{k.l}</div>
                      <div className={`text-[16px] sm:text-[18px] font-black ${k.c}`}>{hide ? "••••" : fmtL(k.v)}</div>
                      <div className="text-[10px] text-gray-600 mt-0.5">{i === 0 ? `${holdings.length} funds` : `${activeSIPs} active`}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini sparkline inside hero */}
              <div className="mt-4 opacity-40">
                <Spark data={growthData.map(d => d.p)} color="#10b981" />
              </div>

              {/* Today's change strip */}
              <div className={`mt-1 flex items-center gap-2 px-3 py-2 rounded-xl ${dayUp ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <span className="text-lg">{dayUp ? "📈" : "📉"}</span>
                <span className="text-[12px] text-gray-300">
                  Portfolio {dayUp ? "gained" : "declined"} <strong className={dayUp ? "text-emerald-400" : "text-red-400"}>{hide ? "••••" : fmtL(Math.abs(dayAmt))}</strong> ({dayPct.toFixed(2)}%) today vs yesterday
                </span>
              </div>
            </div>

            {/* ── KPI CARDS (with sparklines) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { l: "Health Score", v: `${health}/100`, sub: health >= 70 ? "Excellent portfolio" : health >= 50 ? "Good standing" : "Needs review", spark: sparkBase(health, 5), col: hColor, badge: health >= 70 ? "🌟" : "👍", extra: <div className="relative mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{width:`${health}%`,backgroundColor:hColor}}/></div>
                </div> },
                { l: "Total Returns", v: hide ? "₹ ••••" : (gain >= 0 ? "+" : "") + fmtL(gain), sub: `${pctStr(pct)} all time`, spark: sparkBase(gain / 100000, 2), col: gain >= 0 ? "#16a34a" : "#dc2626", badge: gain >= 0 ? "📈" : "📉", extra: null },
                { l: "Funds Gaining", v: `${gainers.length}/${holdings.length}`, sub: `${losers.length} need attention`, spark: sparkBase(gainers.length, 2), col: "#2563eb", badge: "💼", extra: null },
                { l: "Tax Savable", v: hide ? "₹ ••••" : `~${fmtL(taxSave)}`, sub: "LTCG before Mar 31", spark: sparkBase(taxSave / 1000, 1000), col: "#d97706", badge: "🌾", extra: null },
              ].map((k, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all hover:border-gray-200 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{k.l}</span>
                    <span className="text-base">{k.badge}</span>
                  </div>
                  <div className="text-[20px] font-black text-gray-900 leading-none mb-0.5">{k.v}</div>
                  <div className="text-[11px] text-gray-400 mb-2">{k.sub}</div>
                  {k.extra}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Spark data={k.spark} color={k.col} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🧠", l: "AI Insights", sub: "Fund signals", href: "/intelligence", from: "from-violet-50", to: "to-violet-100/50", border: "border-violet-200", hover: "hover:border-violet-400" },
                { icon: "⚖️", l: "Rebalance", sub: "Drift analysis", href: "/rebalance", from: "from-amber-50", to: "to-amber-100/50", border: "border-amber-200", hover: "hover:border-amber-400" },
                { icon: "🌾", l: "Tax Harvest", sub: taxSave > 0 ? `Save ${fmtL(taxSave)}` : "Review gains", href: "/tax-harvesting", from: "from-emerald-50", to: "to-emerald-100/50", border: "border-emerald-200", hover: "hover:border-emerald-400" },
                { icon: "🎯", l: "Goals", sub: "Plan your future", href: "/goals", from: "from-blue-50", to: "to-blue-100/50", border: "border-blue-200", hover: "hover:border-blue-400" },
              ].map((a, i) => (
                <Link key={i} href={a.href}
                  className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${a.from} ${a.to} border ${a.border} ${a.hover} transition-all hover:shadow-sm active:scale-[0.98]`}>
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-bold text-gray-900">{a.l}</div>
                    <div className="text-[10px] text-gray-500 truncate">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* ── TABS ── */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="flex border-b border-gray-100">
                {[["overview", "Overview"], ["funds", "Fund Holdings"], ["insights", "Insights"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id as any)}
                    className={`flex-1 py-3.5 text-[13px] font-bold transition-all ${tab === id ? "text-gray-900 border-b-2 border-gray-900 bg-gray-50/50" : "text-gray-400 hover:text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {tab === "overview" && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Chart + allocation */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-[13px] font-bold text-gray-900">Portfolio vs Nifty 50</div>
                          <div className="text-[11px] text-gray-400">12-month performance</div>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                          {["3M","6M","1Y","All"].map(p => (
                            <button key={p} className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${p==="1Y"?"bg-white text-gray-900 shadow-sm":"text-gray-500"}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={growthData} margin={{top:4,right:4,bottom:0,left:-20}}>
                          <defs>
                            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#16a34a" stopOpacity={0.2}/>
                              <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.08}/>
                              <stop offset="100%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                          <XAxis dataKey="m" fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false}/>
                          <YAxis fontSize={10} tick={{fill:"#94a3b8"}} tickLine={false} axisLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                          <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,fontSize:12,boxShadow:"0 8px 32px rgba(0,0,0,0.08)"}} formatter={(v:number,n:string)=>[fmtL(v),n==="p"?"Portfolio":"Nifty 50"]}/>
                          <Area type="monotone" dataKey="p" stroke="#16a34a" fill="url(#gP)" strokeWidth={2.5} name="p" dot={false} activeDot={{r:5,fill:"#16a34a",stroke:"#fff",strokeWidth:2}}/>
                          <Area type="monotone" dataKey="n" stroke="#cbd5e1" fill="url(#gN)" strokeWidth={1.5} name="n" dot={false} strokeDasharray="5 5"/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="text-[13px] font-bold text-gray-900 mb-1">Asset Allocation</div>
                      <div className="text-[11px] text-gray-400 mb-3">By current value</div>
                      <div className="flex justify-center mb-4">
                        <ResponsiveContainer width={150} height={150}>
                          <PieChart>
                            <Pie data={alloc} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                              {alloc.map((e, i) => <Cell key={i} fill={e.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,fontSize:11}} formatter={(v:number)=>`${v}%`}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2.5">
                        {alloc.map(a => (
                          <div key={a.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:a.color}}/>
                            <span className="text-[12px] text-gray-600 flex-1">{a.name}</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{width:`${a.value}%`,backgroundColor:a.color}}/>
                            </div>
                            <span className="text-[12px] font-bold text-gray-900 w-8 text-right">{a.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top / Bottom */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: "🔥 Top Performers", funds: top3, positive: true },
                      { title: "⚠️ Needs Attention", funds: bot3, positive: false },
                    ].map((section, si) => (
                      <div key={si}>
                        <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-3">{section.title}</div>
                        <div className="space-y-2">
                          {section.funds.length === 0 ? (
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              <span className="text-[12px] text-emerald-700 font-medium">All funds in profit! 🎉</span>
                            </div>
                          ) : section.funds.map((h, i) => (
                            <button key={i} onClick={() => setSelFund(h)}
                              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.98] ${section.positive ? "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50" : "border-red-100 hover:border-red-300 hover:bg-red-50"}`}>
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${section.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>{i+1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold text-gray-900 truncate">{(h.name||"").replace(/ - Gr$/,"").substring(0,28)}</div>
                                <div className="text-[10px] text-gray-400">{(h.category||"").substring(0,22)}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className={`text-[13px] font-black ${section.positive ? "text-emerald-600" : "text-red-600"}`}>{(h.returnsPercent||0)>=0?"+":""}{(h.returnsPercent||0).toFixed(1)}%</div>
                                <div className="text-[10px] text-gray-400">{hide?"••••":fmtL(h.value||0)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FUNDS */}
              {tab === "funds" && (
                <div>
                  <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-900">All Holdings <span className="text-gray-400 font-normal">({holdings.length})</span></span>
                    <span className="text-[11px] text-gray-400">{hide?"••••":fmtL(inv)} → {hide?"••••":fmtL(cur)}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {["Fund","Category","Invested","Value","Return","Signal"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(showAll ? holdings : holdings.slice(0, 8)).map((h: any, i: number) => {
                          const r = h.returnsPercent || 0;
                          const s = sig(r);
                          return (
                            <tr key={i} onClick={() => setSelFund(h)}
                              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors group">
                              <td className="px-4 py-3.5">
                                <div className="text-[12px] sm:text-[13px] font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors max-w-[160px] truncate">{(h.name||"").replace(/ - Gr$/,"")}</div>
                                {(h.sip||0)>0&&<span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-semibold">SIP ₹{(h.sip||0).toLocaleString()}</span>}
                              </td>
                              <td className="px-4 py-3.5 text-[11px] text-gray-400 max-w-[100px] truncate">{(h.category||"").replace(/^(Equity|Other|Debt) Scheme - /,"").substring(0,20)}</td>
                              <td className="px-4 py-3.5 text-[12px] text-gray-600 font-mono">{hide?"••••":fmtL(h.invested||0)}</td>
                              <td className="px-4 py-3.5 text-[12px] font-bold font-mono" style={{color:r>=0?"#16a34a":"#dc2626"}}>{hide?"••••":fmtL(h.value||0)}</td>
                              <td className="px-4 py-3.5">
                                <div className={`text-[13px] font-black ${r>=0?"text-emerald-600":"text-red-600"}`}>{r>=0?"+":""}{r.toFixed(1)}%</div>
                                <div className={`text-[10px] ${r>=0?"text-emerald-400":"text-red-400"}`}>{r>=0?"+":""}{hide?"••••":fmtL((h.value||0)-(h.invested||0))}</div>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full ${s.bg} ${s.tc}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
                                  {s.l}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {holdings.length > 8 && (
                    <button onClick={() => setShowAll(!showAll)}
                      className="w-full py-3 text-[13px] font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-t border-gray-100">
                      {showAll ? "Show less ↑" : `Show all ${holdings.length} funds ↓`}
                    </button>
                  )}
                  <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                    <span className="text-[11px] text-amber-600">Budget 2024 · LTCG (12m+): 12.5% above ₹1.25L · STCG: 20% · Debt: slab rate</span>
                  </div>
                </div>
              )}

              {/* INSIGHTS */}
              {tab === "insights" && (
                <div className="p-4 sm:p-6 space-y-3">
                  {taxSave > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">💰</div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-900 mb-0.5">Tax harvest — save {fmtL(taxSave)}</div>
                        <div className="text-[12px] text-gray-500">Book ₹1.25L LTCG before March 31 · Reinvest same day · Reset cost basis</div>
                        <Link href="/tax-harvesting" className="text-[12px] font-bold text-emerald-700 mt-1.5 inline-flex items-center gap-1 hover:underline">View harvest plan →</Link>
                      </div>
                    </div>
                  )}
                  {losers.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-gray-900 mb-0.5">{(h.name||"").replace(/ - Gr$/,"").substring(0,38)} underperforming</div>
                        <div className="text-[12px] text-gray-500">Down {(h.returnsPercent||0).toFixed(1)}% · Consider pausing SIP · Alternatives: Parag Parikh Flexi Cap, Axis Multicap</div>
                        <Link href="/intelligence" className="text-[12px] font-bold text-red-700 mt-1.5 inline-flex items-center gap-1 hover:underline">Get AI analysis →</Link>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">📊</div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900 mb-0.5">XIRR {meta?.xirr||13.3}% — beating Nifty 50 (12%)</div>
                      <div className="text-[12px] text-gray-500">Star: {top3[0]?.name?.replace(/ - Gr$/,"").substring(0,25)} (+{(top3[0]?.returnsPercent||0).toFixed(1)}%)</div>
                      <Link href="/intelligence" className="text-[12px] font-bold text-blue-700 mt-1.5 inline-flex items-center gap-1 hover:underline">Full analysis →</Link>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                    <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">🧠</div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900 mb-0.5">Know your real risk tolerance</div>
                      <div className="text-[12px] text-gray-500">5 behavioural questions to understand how you react in market downturns</div>
                      <button onClick={() => { setShowRisk(true); setRiskStep(0); setRiskAns([]); setRiskResult(null); }}
                        className="text-[12px] font-bold text-violet-700 mt-1.5 inline-flex items-center gap-1 hover:underline">Take the quiz →</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── AUTO-CONNECT BANNER ── */}
            <div className="bg-gray-900 rounded-2xl p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-bold text-[15px]">Auto Portfolio Sync</span>
                    <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-[10px] font-bold rounded-full tracking-widest uppercase">Coming Soon</span>
                  </div>
                  <p className="text-gray-400 text-[12px] leading-relaxed max-w-md">Connect via MF Central · One-time OTP consent · Portfolio syncs daily — no more uploading files</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS"].map(p => (
                      <span key={p} className="px-2 py-1 bg-white/5 text-gray-500 text-[10px] rounded-lg border border-white/10">{p}</span>
                    ))}
                  </div>
                </div>
                <button className="flex-shrink-0 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-[13px] font-bold hover:bg-gray-100 transition-colors">
                  Join Waitlist →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebar && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebar(false)}/>}

      {/* ── FUND DETAIL MODAL ── */}
      {selFund && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm" onClick={() => setSelFund(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-gray-200 rounded-full"/>
            </div>
            <div className="px-5 pt-4 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-black text-gray-900 leading-snug">{(selFund.name||"").replace(/ - Gr$/,"")}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{selFund.category}</p>
                </div>
                <button onClick={() => setSelFund(null)} className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { l:"Invested", v:fmtL(selFund.invested||0) },
                  { l:"Current Value", v:fmtL(selFund.value||0) },
                  { l:"Gain / Loss", v:(selFund.returnsPercent>=0?"+":"")+fmtL((selFund.value||0)-(selFund.invested||0)) },
                  { l:"Returns", v:(selFund.returnsPercent>=0?"+":"")+Number(selFund.returnsPercent||0).toFixed(1)+"%" },
                ].map((d,i)=>(
                  <div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{d.l}</div>
                    <div className={`text-[15px] font-black ${(i===2||i===3)?(selFund.returnsPercent>=0?"text-emerald-600":"text-red-600"):"text-gray-900"}`}>{d.v}</div>
                  </div>
                ))}
              </div>
              {(() => { const s = sig(selFund.returnsPercent||0); return (
                <div className={`flex items-center justify-between p-3 rounded-xl ${s.bg}`}>
                  <span className="text-[12px] font-bold text-gray-700">AI Signal</span>
                  <span className={`flex items-center gap-1.5 text-[12px] font-black ${s.tc}`}><span className={`w-2 h-2 rounded-full ${s.dot}`}/>{s.l}</span>
                </div>
              );})()}
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/intelligence" className="py-3 bg-gray-900 text-white rounded-2xl text-[13px] font-bold text-center hover:bg-gray-800 transition-colors">AI Analysis</Link>
                <Link href="/tax-harvesting" className="py-3 bg-gray-100 text-gray-700 rounded-2xl text-[13px] font-bold text-center hover:bg-gray-200 transition-colors">Tax Plan</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RISK MODAL ── */}
      {showRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-gray-200 rounded-full"/></div>
            <div className="bg-gray-900 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-black text-[16px]">Risk Profile Quiz</div>
                  <div className="text-gray-500 text-[11px] mt-0.5">5 questions · understand your real risk tolerance</div>
                </div>
                <button onClick={() => setShowRisk(false)} className="text-gray-500 hover:text-gray-300 p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {!riskResult && (
                <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{width:`${(riskStep/RISK_QS.length)*100}%`}}/>
                </div>
              )}
            </div>
            <div className="p-6">
              {riskResult ? (
                <div className="text-center">
                  <div className="text-5xl mb-3">{riskResult.e}</div>
                  <div className="text-[22px] font-black text-gray-900 mb-1">{riskResult.t} Investor</div>
                  <div className="text-[13px] font-semibold text-gray-700 bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100">{riskResult.rec}</div>
                  <button onClick={() => setShowRisk(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[14px] hover:bg-gray-800 transition-colors">Apply to Portfolio ✓</button>
                </div>
              ) : (
                <div>
                  <div className="text-[11px] text-gray-400 font-bold mb-3">{riskStep+1} / {RISK_QS.length}</div>
                  <h3 className="text-[16px] font-black text-gray-900 mb-5 leading-snug">{RISK_QS[riskStep].q}</h3>
                  <div className="space-y-2">
                    {RISK_QS[riskStep].opts.map((opt, i) => (
                      <button key={i} onClick={() => handleRisk(RISK_QS[riskStep].s[i])}
                        className="w-full text-left px-4 py-4 border-2 border-gray-100 rounded-2xl text-[13px] text-gray-700 font-medium hover:border-gray-900 hover:bg-gray-50 transition-all active:scale-[0.98]">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {riskStep > 0 && <button onClick={() => {setRiskStep(riskStep-1);setRiskAns(riskAns.slice(0,-1));}} className="mt-4 text-[11px] text-gray-400 hover:text-gray-600">← Back</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
