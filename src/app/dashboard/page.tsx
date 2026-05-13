"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AppLayout from "@/components/AppLayout";
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import Link from "next/link";

const fmt = (v: number, hide = false) => {
  if (hide) return "₹ ••••";
  const a = Math.abs(v), s = v < 0 ? "−" : "";
  if (a >= 10000000) return `${s}₹${(a/10000000).toFixed(2)} Cr`;
  if (a >= 100000)   return `${s}₹${(a/100000).toFixed(2)} L`;
  return `${s}₹${Math.round(a).toLocaleString("en-IN")}`;
};
const pct = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
const bucket = (c = "") =>
  /equity|large|mid|small|flexi|elss|sectoral|thematic/i.test(c) ? "Equity"
  : /debt|gilt|bond|liquid|overnight|credit/i.test(c) ? "Debt"
  : /hybrid|balanced/i.test(c) ? "Hybrid"
  : /gold|silver/i.test(c) ? "Gold" : "Other";

const CAT_COLOR: Record<string, string> = {
  Equity: "#16a34a", Debt: "#2563eb", Hybrid: "#f59e0b", Gold: "#ca8a04", Other: "#7c3aed",
};

function AnimVal({ to, hide, dur = 1200 }: { to: number; hide: boolean; dur?: number }) {
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (hide) { setV(to); return; }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, hide]);
  return <>{hide ? "₹ ••••" : fmt(v)}</>;
}

const sig = (r: number) =>
  r < -10 ? { l: "Exit",   c: "#dc2626", bg: "#fef2f2", br: "#fecaca" }
  : r < 0  ? { l: "Review", c: "#ea580c", bg: "#fff7ed", br: "#fed7aa" }
  : r < 8  ? { l: "Watch",  c: "#ca8a04", bg: "#fefce8", br: "#fde68a" }
  : r < 20 ? { l: "Hold",   c: "#16a34a", bg: "#f0fdf4", br: "#bbf7d0" }
  :          { l: "Star ⭐", c: "#15803d", bg: "#dcfce7", br: "#6ee7b7" };

export default function Dashboard() {
  const router = useRouter();
  const sb = createClient();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hide, setHide] = useState(false);
  const [tab, setTab] = useState<"overview" | "holdings" | "insights">("overview");
  const [ticker, setTicker] = useState<any[]>([
    { name: "NIFTY 50",     value: "24,315", change: "+1.12%", up: true  },
    { name: "SENSEX",       value: "80,218", change: "+1.09%", up: true  },
    { name: "MIDCAP 150",   value: "17,842", change: "+0.87%", up: true  },
    { name: "SMALLCAP 250", value: "9,421",  change: "+1.34%", up: true  },
    { name: "GOLD",         value: "₹9,342/g",change: "+0.34%",up: true  },
    { name: "USD/INR",      value: "₹83.42", change: "-0.12%", up: false },
    { name: "NIFTY IT",     value: "38,621", change: "-0.54%", up: false },
    { name: "10Y G-SEC",    value: "6.87%",  change: "-0.04%", up: false },
  ]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: pd } = await sb.from("portfolios").select("data").eq("user_id", user.id).maybeSingle();
      if (pd?.data?.funds) {
        const v = (pd.data.funds as any[]).filter((f: any) => {
          const n = String(f.name || "");
          return n.length > 5 && !/^\d{2}-\d{2}-\d{4}/.test(n)
            && !n.includes("No Of Unit") && !n.includes("Sub Total");
        });
        setHoldings(v);
      }
      setLoading(false);
    })();
    fetch("/api/market").then(r => r.json()).then(d => {
      if (d.indices?.length) setTicker(d.indices);
    }).catch(() => {});
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-lg">F</span>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}/>
          ))}
        </div>
        <p className="text-[12px] text-gray-400 tracking-widest uppercase">Loading portfolio</p>
      </div>
    </div>
  );

  /* ── Computed values ── */
  const inv = holdings.reduce((s, h) => s + (h.invested || 0), 0);
  const cur = holdings.reduce((s, h) => s + (h.value || 0), 0);
  const gain = cur - inv;
  const retPct = inv > 0 ? (gain / inv) * 100 : 0;
  const sip = holdings.reduce((s, h) => s + (h.sip || 0), 0);
  const activeSIPs = holdings.filter(h => h.sip > 0).length;
  const afterTax = gain > 0 ? gain * 0.875 : gain;
  const gainers = holdings.filter(h => (h.value || 0) > (h.invested || 0));
  const losers  = holdings.filter(h => (h.value || 0) < (h.invested || 0));
  const health  = Math.min(100, Math.round(
    (gainers.length / Math.max(holdings.length, 1)) * 45 +
    Math.min(holdings.length, 20) / 20 * 30 +
    (retPct > 12 ? 25 : retPct > 8 ? 15 : retPct > 0 ? 8 : 0)
  ));

  const am: Record<string, number> = {};
  holdings.forEach(h => { const b = bucket(h.category || ""); am[b] = (am[b] || 0) + (h.value || 0); });
  const alloc = Object.entries(am)
    .map(([n, v]) => ({ name: n, value: Math.round(v / Math.max(cur, 1) * 100), amt: v, color: CAT_COLOR[n] || "#7c3aed" }))
    .filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growthData = months.map((m, i) => ({
    m,
    portfolio:  Math.round(inv + (gain * (i + 1) / 12)),
    benchmark:  Math.round(inv * (1 + 0.12 * (i + 1) / 12)),
  }));

  const catBar = alloc.map(a => ({ name: a.name, value: +(a.amt / 100000).toFixed(2), color: a.color }));
  const sorted = [...holdings].sort((a, b) => (b.returnsPercent || 0) - (a.returnsPercent || 0));
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  /* ── Empty state ── */
  if (!holdings.length) return (
    <AppLayout title={`${greeting}, ${firstName} 👋`} subtitle="Connect your portfolio to get started">
      <div className="p-6 sm:p-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 mb-1">Connect your mutual funds</h2>
          <p className="text-gray-500">Import your holdings — takes under 2 minutes</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "📄", title: "Upload CAS / XLS", desc: "CAMS, KFintech, NJ Wealth, CDSL", href: "/upload", primary: true },
            { icon: "🏦", title: "CDSL OTP Fetch",   desc: "Enter Demat ID, verify via OTP",    href: "/connect" },
            { icon: "📧", title: "Gmail Auto-Import",desc: "One-time read-only consent",          href: "/connect" },
          ].map((m, i) => (
            <div key={i} className={`rounded-2xl p-6 border flex flex-col gap-3 ${m.primary ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"}`}>
              <span className="text-3xl">{m.icon}</span>
              <div>
                <div className={`font-bold text-[15px] ${m.primary ? "text-white" : "text-gray-900"}`}>{m.title}</div>
                <div className={`text-[12px] mt-1 ${m.primary ? "text-gray-400" : "text-gray-500"}`}>{m.desc}</div>
              </div>
              <Link href={m.href} className={`mt-auto py-2.5 px-4 rounded-xl text-[13px] font-bold text-center ${m.primary ? "bg-emerald-500 text-white hover:bg-emerald-400" : "bg-gray-900 text-white hover:bg-gray-800"}`}>
                Get started →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );

  /* ── MAIN DASHBOARD ── */
  return (
    <AppLayout title="" subtitle="">
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }
        .tk { animation: ticker 45s linear infinite }
        @keyframes fi { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        .fi { animation: fi 0.4s ease both }
        .kcard { background:white; border-radius:16px; border:1px solid #e8ecf0; box-shadow:0 1px 3px rgba(0,0,0,0.04); }
        .kcard:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); }
      `}</style>

      {/* ── TICKER ── */}
      <div className="bg-gray-900 overflow-hidden" style={{ height: 28 }}>
        <div className="tk flex items-center h-full gap-8 px-4 whitespace-nowrap">
          {[...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-2 text-[10px] flex-shrink-0">
              <span className="text-gray-500 font-medium">{t.name}</span>
              <span className="text-gray-200 font-mono font-semibold">{t.value}</span>
              <span className={`font-bold ${t.up ? "text-emerald-400" : "text-red-400"}`}>{t.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[17px] font-black text-gray-900">
            {greeting}, <span className="text-emerald-600">{firstName}</span> 👋
          </div>
          <div className="text-[12px] text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-bold border ${gain >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {gain >= 0 ? "▲" : "▼"} {pct(retPct)} all time
          </div>
          <button onClick={() => setHide(!hide)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors" title="Toggle values">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {hide
                ? <><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18 18 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18 18 0 0 1-2.16 3.19M1 1l22 22"/></>
                : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
            </svg>
          </button>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-8 flex gap-1">
        {(["overview", "holdings", "insights"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-[13px] font-bold capitalize border-b-2 -mb-px transition-all
              ${tab === t ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            {t}{t === "holdings" ? ` (${holdings.length})` : ""}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="p-4 sm:p-6 lg:p-8 bg-[#F5F7FA] min-h-screen">

        {/* ══════ OVERVIEW TAB ══════ */}
        {tab === "overview" && (
          <div className="space-y-6 fi">

            {/* ROW 1 — hero + 4 KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Hero card — dark, spans 2 cols */}
              <div className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, #10b981, transparent)", transform: "translate(30%, -30%)" }}/>
                <div className="relative">
                  <div className="text-[10px] font-bold text-gray-500 tracking-[0.25em] uppercase mb-2">Total Portfolio Value</div>
                  <div className="text-[44px] font-black text-white leading-none mb-2 tracking-tight">
                    <AnimVal to={cur} hide={hide}/>
                  </div>
                  <div className={`text-[13px] font-bold mb-5 ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {gain >= 0 ? "▲" : "▼"} {hide ? "••••" : fmt(Math.abs(gain))} &nbsp;·&nbsp; {pct(retPct)} all-time
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { l: "Invested",    v: inv, sub: `${holdings.length} funds` },
                      { l: "Monthly SIP", v: sip, sub: `${activeSIPs} active` },
                    ].map((k, i) => (
                      <div key={i} className="rounded-xl px-3.5 py-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-1">{k.l}</div>
                        <div className="text-[18px] font-black text-white">{hide ? "••••" : fmt(k.v)}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{k.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4 KPI cards */}
              <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 gap-4">
                {[
                  { l: "Portfolio Health",  v: `${health}`, u: "/100", sub: health >= 70 ? "Excellent 🎯" : health >= 50 ? "Good" : "Needs work", c: health >= 70 ? "#16a34a" : health >= 50 ? "#ca8a04" : "#dc2626" },
                  { l: "Gainers",          v: `${gainers.length}`, u: `/${holdings.length}`, sub: "funds in profit", c: "#16a34a" },
                  { l: "Losers",           v: `${losers.length}`,  u: `/${holdings.length}`, sub: "funds in loss",   c: losers.length > 0 ? "#dc2626" : "#16a34a" },
                  { l: "Absolute Return",  v: retPct.toFixed(1), u: "%", sub: "all-time XIRR", c: retPct >= 0 ? "#16a34a" : "#dc2626" },
                ].map((k, i) => (
                  <div key={i} className="kcard p-5 flex flex-col justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{k.l}</div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[32px] font-black leading-none" style={{ color: k.c }}>{k.v}</span>
                        <span className="text-[16px] font-bold text-gray-300">{k.u}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mt-1.5">{k.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2 — Growth chart full width */}
            <div className="kcard p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[16px] font-bold text-gray-900">Portfolio Growth</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">Your portfolio vs Nifty 50 benchmark (12-month projection)</div>
                </div>
                <div className="flex items-center gap-5 text-[11px] font-semibold">
                  <span className="flex items-center gap-2 text-emerald-600">
                    <span className="w-3 h-0.5 bg-emerald-500 rounded inline-block"/>Portfolio
                  </span>
                  <span className="flex items-center gap-2 text-gray-400">
                    <span className="w-3 h-0.5 bg-gray-300 rounded inline-block" style={{ borderTop: "2px dashed" }}/>Nifty 50
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growthData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="grd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#16a34a" stopOpacity={0.15}/>
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false}/>
                  <XAxis dataKey="m" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} width={48}/>
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                    formatter={(v: any) => fmt(v)} labelStyle={{ color: "#6b7280", fontWeight: 600 }}/>
                  <Area type="monotone" dataKey="portfolio"  stroke="#16a34a" strokeWidth={2.5} fill="url(#grd)" dot={false}/>
                  <Line type="monotone" dataKey="benchmark"  stroke="#d1d5db" strokeWidth={1.5} dot={false} strokeDasharray="5 4"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* ROW 3 — Allocation donut + Category bar + Top/Bottom funds */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Donut */}
              <div className="kcard p-5">
                <div className="text-[15px] font-bold text-gray-900 mb-1">Asset Allocation</div>
                <div className="text-[11px] text-gray-400 mb-3">by category</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={alloc} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {alloc.map((a, i) => <Cell key={i} fill={a.color}/>)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12 }}
                      formatter={(v: any, _: any, p: any) => [`${v}% · ${fmt(p.payload.amt)}`]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 mt-1">
                  {alloc.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: a.color }}/>
                      <span className="text-[12px] text-gray-600 font-medium flex-1">{a.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${a.value}%`, background: a.color }}/>
                        </div>
                        <span className="text-[12px] font-black text-gray-900 w-8 text-right">{a.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category bar */}
              <div className="kcard p-5">
                <div className="text-[15px] font-bold text-gray-900 mb-1">Value by Category</div>
                <div className="text-[11px] text-gray-400 mb-4">current market value (₹ L)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={catBar} margin={{ top: 5, right: 5, bottom: 5, left: 0 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" horizontal vertical={false}/>
                    <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 12 }} formatter={(v: any) => [`₹${v} L`]}/>
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {catBar.map((c, i) => <Cell key={i} fill={c.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top + Bottom funds */}
              <div className="kcard p-5 flex flex-col gap-5">
                <div>
                  <div className="text-[15px] font-bold text-gray-900 mb-3">Top Performers</div>
                  <div className="space-y-3">
                    {sorted.slice(0, 4).map((h, i) => {
                      const r = h.returnsPercent || 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[11px] font-black text-emerald-700 flex-shrink-0">
                            {(h.name || "F").charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-gray-800 truncate">{h.name}</div>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, r / 2)}%` }}/>
                            </div>
                          </div>
                          <div className="text-[13px] font-black text-emerald-600 flex-shrink-0">{pct(r)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {losers.length > 0 && (
                  <div>
                    <div className="text-[15px] font-bold text-gray-900 mb-3">Watch List</div>
                    <div className="space-y-3">
                      {[...holdings].sort((a, b) => (a.returnsPercent || 0) - (b.returnsPercent || 0))
                        .filter(h => (h.returnsPercent || 0) < 0).slice(0, 3).map((h, i) => {
                        const r = h.returnsPercent || 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[11px] font-black text-red-600 flex-shrink-0">
                              {(h.name || "F").charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-semibold text-gray-800 truncate">{h.name}</div>
                              <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, Math.abs(r) / 2)}%` }}/>
                              </div>
                            </div>
                            <div className="text-[13px] font-black text-red-500 flex-shrink-0">{pct(r)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ROW 4 — Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🤖", title: "AI Insights",   sub: "Smart portfolio analysis",       href: "/intelligence", c: "#16a34a", bg: "#f0fdf4" },
                { icon: "⚖️", title: "Rebalance",     sub: "Optimize your allocation",       href: "/rebalance",    c: "#2563eb", bg: "#eff6ff" },
                { icon: "🌿", title: "Tax Harvest",   sub: "Spot loss-booking opportunities", href: "/tax-harvesting",c: "#d97706", bg: "#fffbeb" },
                { icon: "💬", title: "AI Chat",       sub: "Ask anything about your funds",  href: "/chat",         c: "#7c3aed", bg: "#f5f3ff" },
              ].map((a, i) => (
                <Link key={i} href={a.href}
                  className="kcard p-4 flex flex-col gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 block">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: a.bg }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-900">{a.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ══════ HOLDINGS TAB ══════ */}
        {tab === "holdings" && (
          <div className="fi space-y-3">
            {/* Summary bar */}
            <div className="kcard p-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                  { l: "Invested",  v: fmt(inv, hide),      c: "text-gray-900" },
                  { l: "Current",   v: fmt(cur, hide),      c: "text-gray-900" },
                  { l: "Gain/Loss", v: fmt(gain, hide),     c: gain >= 0 ? "text-emerald-600" : "text-red-500" },
                  { l: "Return",    v: pct(retPct),         c: retPct >= 0 ? "text-emerald-600" : "text-red-500" },
                  { l: "Monthly SIP",v: fmt(sip, hide),     c: "text-gray-900" },
                  { l: "Health",    v: `${health}/100`,     c: "text-emerald-600" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{s.l}</div>
                    <div className={`text-[15px] font-black ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Fund rows */}
            {sorted.map((h, i) => {
              const r = h.returnsPercent || 0;
              const s = sig(r);
              return (
                <div key={i} className="kcard px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-[14px] flex-shrink-0 border"
                      style={{ background: s.bg, color: s.c, borderColor: s.br }}>
                      {(h.name || "F").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-[13px] leading-tight truncate">{h.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">{h.category || "Mutual Fund"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-7 flex-shrink-0 pl-13 sm:pl-0">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Invested</div>
                      <div className="text-[13px] font-bold text-gray-600 mt-0.5">{hide ? "••••" : fmt(h.invested || 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Current</div>
                      <div className="text-[13px] font-black text-gray-900 mt-0.5">{hide ? "••••" : fmt(h.value || 0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">P&L</div>
                      <div className={`text-[15px] font-black mt-0.5 ${r >= 0 ? "text-emerald-600" : "text-red-500"}`}>{pct(r)}</div>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg text-[10px] font-black border w-16 text-center flex-shrink-0"
                      style={{ background: s.bg, color: s.c, borderColor: s.br }}>
                      {s.l}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════ INSIGHTS TAB ══════ */}
        {tab === "insights" && (
          <div className="fi space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { l: "Total Invested", v: fmt(inv, hide),      c: "text-gray-900" },
                { l: "Current Value",  v: fmt(cur, hide),      c: "text-gray-900" },
                { l: "Total Gain",     v: fmt(gain, hide),     c: gain >= 0 ? "text-emerald-600" : "text-red-500" },
                { l: "Est. After-Tax", v: fmt(afterTax, hide), c: gain >= 0 ? "text-emerald-600" : "text-red-500" },
              ].map((s, i) => (
                <div key={i} className="kcard p-5">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{s.l}</div>
                  <div className={`text-[22px] font-black ${s.c}`}>{s.v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="kcard p-5">
                <div className="font-bold text-gray-900 mb-4">Top 5 Gainers</div>
                <div className="space-y-3">
                  {sorted.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-black text-gray-300 w-4">#{i+1}</span>
                        <span className="text-[12px] font-semibold text-gray-700 truncate">{h.name}</span>
                      </div>
                      <span className="text-[13px] font-black text-emerald-600 flex-shrink-0">{pct(h.returnsPercent || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="kcard p-5">
                <div className="font-bold text-gray-900 mb-4">Underperformers</div>
                <div className="space-y-3">
                  {[...holdings].sort((a, b) => (a.returnsPercent || 0) - (b.returnsPercent || 0)).slice(0, 5).map((h, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[11px] font-black text-gray-300 w-4">#{i+1}</span>
                        <span className="text-[12px] font-semibold text-gray-700 truncate">{h.name}</span>
                      </div>
                      <span className={`text-[13px] font-black flex-shrink-0 ${(h.returnsPercent||0)<0?"text-red-500":"text-emerald-600"}`}>
                        {pct(h.returnsPercent || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="kcard p-5">
              <div className="font-bold text-gray-900 mb-4">Allocation Breakdown</div>
              <div className="space-y-3">
                {alloc.map((a, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 text-[12px] font-semibold text-gray-600">{a.name}</div>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.value}%`, background: a.color }}/>
                    </div>
                    <div className="w-10 text-right text-[12px] font-black text-gray-900">{a.value}%</div>
                    <div className="w-20 text-right text-[11px] text-gray-400">{fmt(a.amt)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
