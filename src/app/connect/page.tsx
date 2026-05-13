
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

type Stage = "loading" | "ready" | "connecting" | "success" | "no-key";

interface PortfolioResult {
  fundCount: number;
  totalValue: number;
  totalInvested: number;
}

export default function Connect() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch short-lived access token from our backend
    fetch("/api/casparser/token")
      .then(r => r.json())
      .then(d => {
        if (d.access_token) {
          setAccessToken(d.access_token);
          setStage("ready");
        } else {
          setError(d.error || "Failed to initialize. Please try again.");
          setStage("ready");
        }
      })
      .catch(() => {
        setStage("no-key");
      });
  }, []);

  const openWidget = useCallback(async () => {
    if (!accessToken) return;
    setStage("connecting");
    setError(null);

    try {
      // Dynamically import the CASParser Connect SDK
      const { PortfolioConnect } = await import("@cas-parser/connect");

      const { data, metadata } = await (PortfolioConnect as any).open({
        accessToken,
        config: {
          enableUpload: true,
          enableCdslFetch: true,
          enableInbox: true,
          enableGenerator: true,
          primaryColor: "#111827",
          title: "Import Your Portfolio",
          closeOnSuccess: true,
          showSummary: true,
        },
      });

      // Save parsed portfolio to FolioIQ via our API
      setStage("connecting");
      const saveRes = await fetch("/api/casparser/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, metadata }),
      });
      const saved = await saveRes.json();

      if (saved.success) {
        setResult({
          fundCount: saved.fundCount,
          totalValue: saved.totalValue,
          totalInvested: saved.totalInvested,
        });
        setStage("success");
        // Redirect to dashboard after 2 seconds
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setError(saved.error || "Failed to save portfolio");
        setStage("ready");
      }
    } catch (e: any) {
      if (e?.message === "Widget closed by user") {
        setStage("ready");
      } else {
        setError(e?.message || "Connection failed");
        setStage("ready");
      }
    }
  }, [accessToken, router]);

  const fmt = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

  if (stage === "success" && result) return (
    <AppLayout title="Portfolio Connected!" subtitle="Your investments are now in FolioIQ">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-sm">✅</div>
        <h2 className="text-[26px] font-black text-gray-900 mb-2">Portfolio Synced!</h2>
        <p className="text-[15px] text-gray-500 mb-2">{result.fundCount} funds imported</p>
        <div className="flex gap-6 mb-8">
          <div className="text-center">
            <div className="text-[20px] font-black text-gray-900">{fmt(result.totalInvested)}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-widest">Invested</div>
          </div>
          <div className="text-center">
            <div className={`text-[20px] font-black ${result.totalValue >= result.totalInvested ? "text-emerald-600" : "text-red-600"}`}>{fmt(result.totalValue)}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-widest">Current Value</div>
          </div>
        </div>
        <p className="text-[13px] text-gray-400 mb-6">Taking you to your dashboard...</p>
        <Link href="/dashboard" className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-[14px] hover:bg-gray-800 transition-colors">
          Go to Dashboard →
        </Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Connect Portfolio" subtitle="Import from any Indian mutual fund platform — one time, then auto-syncs">
      <div className="px-5 sm:px-8 py-6 max-w-5xl">

        {/* Hero */}
        <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none"/>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-emerald-500/30">🔗</div>
            <div className="flex-1">
              <h2 className="text-[20px] font-black text-white mb-1">Powered by CASParser</h2>
              <p className="text-gray-400 text-[13px] leading-relaxed mb-4">
                Trusted by Scripbox, Dezerv, and AngelOne. One widget covers PDF upload, Gmail import, and CDSL live fetch — all in one click.
              </p>
              <div className="flex flex-wrap gap-2">
                {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","CAMS","KFintech","CDSL","NSDL"].map(p=>(
                  <span key={p} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-[11px] rounded-lg">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What's inside */}
        {/* Feature cards - horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-1 mb-6 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
          {[
            { icon:"📄", title:"PDF Upload", desc:"CAMS, KFintech, CDSL or NSDL CAS PDF. Drag & drop.", badge:"Instant" },
            { icon:"🏦", title:"CDSL OTP", desc:"16-digit Demat ID + OTP = live real-time holdings.", badge:"No PDF" },
            { icon:"📧", title:"Gmail Import", desc:"Read-only OAuth. Auto-finds CAS emails from CAMS/KFintech.", badge:"Auto-sync" },
          ].map((m,i)=>(
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex-shrink-0 w-[200px] sm:w-auto">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{m.badge}</span>
              </div>
              <h3 className="text-[13px] font-black text-gray-900 mb-1">{m.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Main CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center mb-5">
          {stage === "no-key" ? (
            <div>
              <div className="text-4xl mb-4">🔑</div>
              <h3 className="text-[18px] font-black text-gray-900 mb-2">API Key Required</h3>
              <p className="text-[13px] text-gray-500 mb-4 max-w-sm mx-auto leading-relaxed">
                Add your CASParser API key to Vercel environment variables to activate live portfolio connect.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-4 border border-gray-100">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">Add to Vercel env vars:</div>
                <code className="text-[12px] text-gray-700 font-mono">CAS_PARSER_API_KEY = your_api_key_here</code>
              </div>
              <p className="text-[12px] text-gray-400 mb-4">
                Get your API key at{" "}
                <a href="https://app.casparser.in/developers" target="_blank" className="text-gray-700 underline font-semibold">app.casparser.in/developers</a>
              </p>
              <p className="text-[12px] text-gray-400">Meanwhile, you can still <Link href="/upload" className="text-gray-700 underline font-semibold">upload an XLS/PDF file</Link> to import your portfolio.</p>
            </div>
          ) : stage === "connecting" ? (
            <div className="py-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin mx-auto mb-4"/>
              <p className="text-[14px] font-semibold text-gray-700">Syncing your portfolio...</p>
              <p className="text-[12px] text-gray-400 mt-1">Reading CAMS/KFintech data and saving to FolioIQ</p>
            </div>
          ) : (
            <div>
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-[20px] font-black text-gray-900 mb-2">Import your complete portfolio</h3>
              <p className="text-[14px] text-gray-500 mb-2 max-w-sm mx-auto leading-relaxed">
                One click opens the import widget. Choose PDF upload, CDSL OTP, or Gmail — whichever works for you.
              </p>
              <p className="text-[12px] text-gray-400 mb-6">Takes under 2 minutes · Works with all AMCs</p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 max-w-sm mx-auto">{error}</div>
              )}

              <button
                onClick={openWidget}
                disabled={stage !== "ready" || !accessToken}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[16px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                {stage === "loading" ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Initializing...</span></>
                ) : (
                  <><span>🔗</span><span>Connect My Portfolio</span></>
                )}
              </button>

              <p className="text-[11px] text-gray-400 mt-4">
                🔒 Read-only · India-hosted · TLS encrypted · No trading access ever
              </p>
            </div>
          )}
        </div>

        {/* Alternative: Manual upload */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <span className="text-xl">📄</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-gray-900">Already have your CAS/XLS file?</div>
            <div className="text-[12px] text-gray-500">Upload it directly — works without CASParser API key</div>
          </div>
          <Link href="/upload" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-bold hover:border-gray-900 transition-colors flex-shrink-0">
            Upload File →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
