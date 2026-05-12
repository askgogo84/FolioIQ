
"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";

type Mode = "choose" | "pdf" | "gmail" | "cdsl" | "processing" | "success";

export default function Connect() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [dematId, setDematId] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const otpRefs = useRef<(HTMLInputElement|null)[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // PDF Upload flow
  const handlePdfUpload = async () => {
    if (!file) { setError("Please select a CAS PDF file"); return; }
    setMode("processing");
    setProgress(20);
    setError("");

    const form = new FormData();
    form.append("file", file);
    if (password) form.append("password", password);

    try {
      setProgress(50);
      const res = await fetch("/api/cas-parse", { method: "POST", body: form });
      const data = await res.json();
      setProgress(90);

      if (data.success || data.redirect) {
        setResult(data.summary || { fundCount: "Your", totalValue: 0 });
        setProgress(100);
        setTimeout(() => setMode("success"), 500);
      } else if (data.error) {
        setError(data.error);
        setMode("pdf");
      }
    } catch (e) {
      setError("Upload failed. Please try again.");
      setMode("pdf");
    }
  };

  // CDSL OTP flow
  const requestOTP = async () => {
    if (!dematId.trim()) { setError("Enter your 16-digit CDSL Demat ID"); return; }
    setError("");
    try {
      const res = await fetch("/api/cas-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "cdsl-otp", step: "request", dematId }),
      });
      const data = await res.json();
      if (data.success || data.message) {
        setOtpSent(true);
      } else {
        setError(data.error || "OTP request failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the 6-digit OTP"); return; }
    setMode("processing");
    setProgress(40);
    try {
      const res = await fetch("/api/cas-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "cdsl-otp", step: "verify", dematId, otp: code }),
      });
      setProgress(80);
      const data = await res.json();
      if (data.success) {
        setResult(data.summary);
        setProgress(100);
        setTimeout(() => setMode("success"), 500);
      } else {
        setError(data.error || "Verification failed");
        setMode("cdsl");
      }
    } catch {
      setError("Verification failed. Please try again.");
      setMode("cdsl");
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (val && idx < 5) otpRefs.current[idx+1]?.focus();
    if (n.every(d=>d)) verifyOTP();
  };

  if (mode === "success") return (
    <AppLayout title="Portfolio Connected!" subtitle="Your investments are now synced with FolioIQ">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl mb-6">✅</div>
        <h2 className="text-[28px] font-black text-gray-900 mb-2">Portfolio synced!</h2>
        {result && (
          <p className="text-[16px] text-gray-500 mb-8">
            {result.fundCount} funds imported · ₹{((result.totalValue||0)/100000).toFixed(1)}L current value
          </p>
        )}
        <div className="flex gap-3">
          <Link href="/dashboard" className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 transition-colors">
            View Dashboard →
          </Link>
        </div>
      </div>
    </AppLayout>
  );

  if (mode === "processing") return (
    <AppLayout title="Importing Portfolio" subtitle="Parsing your CAS statement...">
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">📊</div>
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">Analyzing your portfolio</h3>
            <p className="text-[13px] text-gray-500">Extracting fund holdings, NAVs, and transaction history...</p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{width:`${progress}%`}}/>
          </div>
          <div className="text-center mt-3 text-[12px] text-gray-400">{progress}% complete</div>
          <div className="mt-6 space-y-2">
            {[
              {done: progress>=20, text:"Parsing CAS statement format"},
              {done: progress>=50, text:"Extracting fund holdings & units"},
              {done: progress>=80, text:"Fetching latest NAVs from AMFI"},
              {done: progress>=100, text:"Saving to your FolioIQ profile"},
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-3 text-[13px] ${step.done?"text-emerald-600":"text-gray-400"}`}>
                <span>{step.done?"✓":"○"}</span>
                {step.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Connect Portfolio" subtitle="Import from any Indian mutual fund platform — one time, then auto-syncs daily">
      <div className="px-5 sm:px-8 py-6">
        {mode === "choose" && (
          <div className="max-w-4xl">
            {/* Hero */}
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-emerald-500/30">🔗</div>
                <div>
                  <h2 className="text-[20px] font-black text-white mb-1">Auto Portfolio Sync</h2>
                  <p className="text-gray-400 text-[14px] leading-relaxed">
                    Connect once — FolioIQ pulls your holdings from CAMS, KFintech, CDSL, and NSDL. 
                    NAVs refresh daily using AMFI's public feed. No broker password needed, ever.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {["NJ Wealth","Groww","Zerodha","ET Money","Kuvera","Paytm Money","CAMS","KFintech","CDSL","NSDL"].map(b=>(
                      <span key={b} className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-[11px] rounded-lg font-medium">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 methods */}
            <h3 className="text-[16px] font-bold text-gray-900 mb-4">Choose how to connect</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon:"📄",
                  title:"Upload CAS PDF",
                  sub:"Download from CAMS/KFintech/CDSL and upload",
                  tag:"Easiest · Works instantly",
                  tagColor:"bg-emerald-50 text-emerald-700 border-emerald-200",
                  action:()=>setMode("pdf"),
                  cta:"Upload PDF",
                  steps:["Download CAS from cams.com or kfintech.com","Upload here — we parse automatically","All mutual funds extracted in seconds"],
                },
                {
                  icon:"📧",
                  title:"Gmail Import",
                  sub:"We read only CAS emails from CAMS/KFintech",
                  tag:"One-click · Most convenient",
                  tagColor:"bg-blue-50 text-blue-700 border-blue-200",
                  action:()=>setMode("gmail"),
                  cta:"Connect Gmail",
                  steps:["One-time read-only consent","Only reads emails from CAMS & KFintech","No passwords, no other emails accessed"],
                },
                {
                  icon:"🏦",
                  title:"CDSL OTP Fetch",
                  sub:"Real-time demat holdings via OTP verification",
                  tag:"Live data · No PDF needed",
                  tagColor:"bg-violet-50 text-violet-700 border-violet-200",
                  action:()=>setMode("cdsl"),
                  cta:"Fetch via OTP",
                  steps:["Enter your 16-digit CDSL Demat ID","Verify with OTP sent to registered mobile","Get real-time portfolio instantly"],
                },
              ].map((m,i)=>(
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all">
                  <div className="text-3xl mb-3">{m.icon}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.tagColor}`}>{m.tag}</span>
                  <h4 className="text-[15px] font-black text-gray-900 mt-2.5 mb-1">{m.title}</h4>
                  <p className="text-[12px] text-gray-500 mb-4">{m.sub}</p>
                  <div className="space-y-1.5 mb-5">
                    {m.steps.map((s,si)=>(
                      <div key={si} className="flex items-start gap-2 text-[12px] text-gray-500">
                        <span className="w-4 h-4 bg-gray-100 rounded-full text-[9px] font-bold text-gray-500 flex items-center justify-center flex-shrink-0 mt-0.5">{si+1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                  <button onClick={m.action}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-[13px] font-bold hover:bg-gray-800 transition-colors">
                    {m.cta} →
                  </button>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <div className="text-[13px] font-bold text-gray-900 mb-1">Bank-grade security · Read-only · No trading access</div>
                  <div className="text-[12px] text-gray-500 leading-relaxed">
                    Powered by <a href="https://casparser.in" target="_blank" className="underline">CASParser</a> (trusted by Scripbox, Dezerv, AngelOne). 
                    We never store raw PDF data. We never have trading or redemption access. 
                    Portfolio data is encrypted end-to-end and stored only in your account.
                    NAVs are refreshed daily from AMFI's public feed (100% free, no API key needed).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Upload Mode */}
        {mode === "pdf" && (
          <div className="max-w-xl">
            <button onClick={()=>setMode("choose")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] mb-6 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back to options
            </button>
            <h2 className="text-[22px] font-black text-gray-900 mb-1">Upload CAS PDF</h2>
            <p className="text-[14px] text-gray-500 mb-6">From CAMS, KFintech, CDSL, or NSDL — we auto-detect the format</p>

            {/* Download instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5">
              <div className="text-[12px] font-bold text-blue-800 mb-2">How to get your CAS statement:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-blue-700">
                {[
                  {n:"CAMS",u:"cams.com → Statements → CAS"},
                  {n:"KFintech",u:"kfintech.com → My Statements"},
                  {n:"CDSL",u:"eservices.nsdl.com"},
                  {n:"NJ Wealth",u:"Already have it as XLS ✓"},
                ].map((s,i)=>(
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"/>
                    <span><strong>{s.n}:</strong> {s.u}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <div onClick={()=>fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${file?"border-emerald-300 bg-emerald-50":"border-gray-200 hover:border-gray-400 hover:bg-gray-50"}`}>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/>
              <div className="text-4xl mb-3">{file?"📄":"📎"}</div>
              {file ? (
                <div>
                  <div className="text-[14px] font-bold text-emerald-700">{file.name}</div>
                  <div className="text-[12px] text-emerald-600">{(file.size/1024).toFixed(0)} KB · Click to change</div>
                </div>
              ) : (
                <div>
                  <div className="text-[14px] font-bold text-gray-700 mb-1">Drop your CAS PDF here</div>
                  <div className="text-[12px] text-gray-400">or click to browse · PDF up to 10MB</div>
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="text-[12px] font-semibold text-gray-600 block mb-1.5">PDF Password <span className="text-gray-400 font-normal">(if encrypted — your PAN or DOB)</span></label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                placeholder="e.g. PAN number or date of birth"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-gray-900 transition-colors"/>
            </div>

            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">{error}</div>}

            <button onClick={handlePdfUpload} disabled={!file}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Parse & Import Portfolio →
            </button>
          </div>
        )}

        {/* Gmail Mode */}
        {mode === "gmail" && (
          <div className="max-w-xl">
            <button onClick={()=>setMode("choose")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] mb-6 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back to options
            </button>
            <h2 className="text-[22px] font-black text-gray-900 mb-1">Gmail Import</h2>
            <p className="text-[14px] text-gray-500 mb-6">Read CAS emails from CAMS and KFintech automatically</p>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-5">
              <div className="space-y-4">
                {[
                  {icon:"🔒",title:"Read-only access",desc:"We can only read emails — cannot send, delete, or modify anything in your Gmail."},
                  {icon:"📬",title:"CAS emails only",desc:"We only read emails from noreply@camsonline.com and kfintech.com — nothing else."},
                  {icon:"♾️",title:"One-time consent",desc:"Authorize once. The token works forever. No need to re-connect every month."},
                  {icon:"🚫",title:"No password sharing",desc:"Google OAuth only. Your Gmail password never touches our servers."},
                ].map((p,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{p.icon}</span>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900">{p.title}</div>
                      <div className="text-[12px] text-gray-500">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 text-[12px] text-amber-700">
              <strong>Note:</strong> Gmail import requires a CASParser API key. This feature will be enabled when you subscribe to FolioIQ Pro (coming soon). For now, use PDF upload or CDSL OTP.
            </div>

            <button onClick={()=>setMode("pdf")}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 transition-colors">
              Use PDF Upload Instead →
            </button>
          </div>
        )}

        {/* CDSL OTP Mode */}
        {mode === "cdsl" && (
          <div className="max-w-xl">
            <button onClick={()=>setMode("choose")} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] mb-6 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              Back to options
            </button>
            <h2 className="text-[22px] font-black text-gray-900 mb-1">CDSL OTP Fetch</h2>
            <p className="text-[14px] text-gray-500 mb-6">Get live demat holdings without any PDF</p>

            {!otpSent ? (
              <div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-5">
                  <label className="text-[12px] font-bold text-gray-600 block mb-2">Your CDSL Demat Account ID <span className="text-gray-400 font-normal">(16 digits)</span></label>
                  <input value={dematId} onChange={e=>setDematId(e.target.value.replace(/\D/g,"").slice(0,16))}
                    placeholder="1234567890123456"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[14px] font-mono tracking-wider focus:outline-none focus:border-gray-900 transition-colors"/>
                  <p className="text-[11px] text-gray-400 mt-2">Find this in your CDSL account → My Demat Account → DP ID + Client ID combined</p>
                </div>

                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">{error}</div>}

                <button onClick={requestOTP} disabled={dematId.length < 16}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Send OTP to Registered Mobile →
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5 text-[13px] text-emerald-700">
                  OTP sent to your CDSL-registered mobile number
                </div>
                <div className="mb-5">
                  <label className="text-[12px] font-bold text-gray-600 block mb-3">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((d,i)=>(
                      <input key={i} ref={el=>{otpRefs.current[i]=el;}}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e=>handleOtpChange(i,e.target.value)}
                        onKeyDown={e=>{if(e.key==="Backspace"&&!d&&i>0) otpRefs.current[i-1]?.focus();}}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"/>
                    ))}
                  </div>
                </div>

                {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">{error}</div>}

                <button onClick={verifyOTP} disabled={otp.join("").length<6}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-[15px] hover:bg-gray-800 disabled:opacity-40 transition-colors">
                  Verify & Import →
                </button>
                <button onClick={()=>setOtpSent(false)} className="w-full mt-2 py-2 text-gray-400 text-[12px] hover:text-gray-700">
                  ← Change Demat ID
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
