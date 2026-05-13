
"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

type Stage = "loading" | "ready" | "connecting" | "saving" | "success" | "error";

export default function Connect() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/casparser/token")
      .then(r => r.json())
      .then(d => {
        if (d.access_token) {
          setAccessToken(d.access_token);
          setStage("ready");
        } else {
          setError(d.error || "Failed to initialize");
          setStage("error");
        }
      })
      .catch(e => {
        setError(String(e));
        setStage("error");
      });
  }, []);

  const openWidget = useCallback(async () => {
    if (!accessToken) return;
    setStage("connecting");
    setError(null);

    try {
      // Use the named export `open` from the SDK — correct v2.1 API
      const { open } = await import("@cas-parser/connect");

      const result = await open({
        accessToken,
        config: {
          enableCdslFetch: true,
          enableInbox: false,   // Gmail needs OAuth setup in CASParser dashboard
          enableGenerator: false,
          homeLayout: "actions",
        },
      });

      if (result.status === "closed") {
        // User cancelled — go back to ready
        setStage("ready");
        return;
      }

      if (result.status === "error") {
        setError(result.error?.message || "Import failed. Please try again.");
        setStage("ready");
        return;
      }

      // Success — save to FolioIQ
      setStage("saving");
      const saveRes = await fetch("/api/casparser/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: result.data, metadata: result.metadata }),
      });
      const saved = await saveRes.json();

      if (saved.success) {
        setResult({
          fundCount: saved.fundCount,
          totalValue: saved.totalValue,
          totalInvested: saved.totalInvested,
        });
        setStage("success");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setError(saved.error || "Failed to save. Please try again.");
        setStage("ready");
      }
    } catch (e: any) {
      console.error("Widget error:", e);
      setError(e?.message || "Something went wrong. Please try again.");
      setStage("ready");
    }
  }, [accessToken, router]);

  const fmt = (v: number) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

  if (stage === "success" && result) return (
    <AppLayout title="Portfolio Connected!" subtitle="Your investments are now in FolioIQ">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl mb-5">✅</div>
        <h2 className="text-[26px] font-black text-gray-900 mb-2">Portfolio Synced!</h2>
        <p className="text-[15px] text-gray-500 mb-6">{result.fundCount} funds imported successfully</p>
        <div className="flex gap-8 mb-8">
          <div className="text-center">
            <div className="text-[22px] font-black text-gray-900">{fmt(result.totalInvested)}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">Invested</div>
          </div>
          <div className="text-center">
            <div className={`text-[22px] font-black ${result.totalValue >= result.totalInvested ? "text-emerald-600" : "text-red-600"}`}>{fmt(result.totalValue)}</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">Current Value</div>
          </div>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">Redirecting to your dashboard...</p>
        <Link href="/dashboard" className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-[14px] hover:bg-gray-800 transition-colors">
          View Dashboard →
        </Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Connect Portfolio" subtitle="Import from any Indian mutual fund platform — one time, then auto-syncs">
      <div className="px-4 sm:px-8 py-5 max-w-5xl">

        {/* Hero dark card */}
        <div className="bg-gray-900 rounded-2xl p-5 sm:p-7 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"/>
          <div className="relative flex items-start gap-4">
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg shadow-emerald-500/30">🔗</div>
            <div>
              <h2 className="text-[16px] font-black text-white mb-1">Powered by CASParser</h2>
              <p className="text-gray-400 text-[12px] leading-relaxed mb-3">
                Trusted by Scripbox, Dezerv & AngelOne. PDF upload, Gmail import, and CDSL live fetch — all in one.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["NJ Wealth","Groww","Zerodha","ET Money","CAMS","KFintech","CDSL","NSDL"].map(p=>(
                  <span key={p} className="px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 text-[10px] rounded-md">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards - horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
          {[
            { icon:"📄", title:"PDF Upload", desc:"CAMS, KFintech, CDSL or NSDL CAS PDF. Drag & drop.", badge:"Instant" },
            { icon:"🏦", title:"CDSL OTP", desc:"16-digit Demat ID + OTP = real-time holdings.", badge:"No PDF" },
            { icon:"📧", title:"Gmail Import", desc:"Read-only OAuth. Auto-finds CAS emails.", badge:"Auto-sync" },
          ].map((m,i)=>(
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex-shrink-0 w-[190px] sm:w-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{m.icon}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{m.badge}</span>
              </div>
              <h3 className="text-[13px] font-black text-gray-900 mb-1">{m.title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Main CTA card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm text-center mb-4">
          {(stage === "connecting" || stage === "saving") ? (
            <div className="py-4">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin mx-auto mb-4"/>
              <p className="text-[15px] font-bold text-gray-700">
                {stage === "saving" ? "Saving your portfolio..." : "Opening import widget..."}
              </p>
              <p className="text-[12px] text-gray-400 mt-1">
                {stage === "saving" ? "Fetching latest NAVs from AMFI" : "Please wait a moment"}
              </p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-[20px] font-black text-gray-900 mb-2">Import your complete portfolio</h3>
              <p className="text-[14px] text-gray-500 mb-2 max-w-sm mx-auto leading-relaxed">
                One click opens the import widget. Choose PDF upload, CDSL OTP, or Gmail — whichever works for you.
              </p>
              <p className="text-[12px] text-gray-400 mb-5">Takes under 2 minutes · Works with all AMCs</p>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 max-w-sm mx-auto">
                  {error}
                </div>
              )}

              <button
                onClick={openWidget}
                disabled={stage === "loading" || !accessToken}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[15px] hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg w-full sm:w-auto justify-center"
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
            </>
          )}
        </div>

        {/* Upload file fallback */}
        <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <span className="text-xl">📄</span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-gray-900">Already have your CAS/XLS file?</div>
            <div className="text-[12px] text-gray-500">Upload directly — works without CASParser</div>
          </div>
          <Link href="/upload" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-bold hover:border-gray-900 transition-colors flex-shrink-0">
            Upload →
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
