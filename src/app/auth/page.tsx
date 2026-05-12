
"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, RefreshCw, CheckCircle, Sparkles, ChevronLeft, Shield } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const [stage, setStage] = useState<"email" | "otp" | "success">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [useCustomOtp, setUseCustomOtp] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle Supabase hash fragment (access_token in URL hash)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      setStage("success");
      // Give Supabase JS time to process the hash and set the session
      setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.push(redirect);
            router.refresh();
          } else {
            // Force refresh - session should be in cookie after hash processing
            window.location.href = '/dashboard';
          }
        });
      }, 1500);
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [resendTimer]);

  const sendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) { setError("Please enter a valid email address"); return; }
    setLoading(true); setError(null);
    
    try {
      // Try custom Resend OTP first (reliable delivery)
      const res = await fetch("/api/auth-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const sendData = await res.json().catch(()=>({}));
      if (res.ok) {
        // If we got a direct link (all email methods failed), redirect immediately
        if (sendData.link && sendData.method === 'direct_link') {
          setStage("success");
          setTimeout(() => { window.location.href = sendData.link; }, 300);
          return;
        }
        // Invite method — show OTP entry but also let them know
        setUseCustomOtp(sendData.method === 'resend');
        setStage("otp");
        setResendTimer(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        return;
      }
      
      // Fall back to Supabase built-in OTP
      const { error: sbErr } = await supabase.auth.signInWithOtp({
        email, options: { shouldCreateUser: true },
      });
      if (sbErr) throw sbErr;
      setUseCustomOtp(false);
      setStage("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message?.includes("rate") ? "Too many attempts. Wait 1 min." : (err.message || "Failed to send OTP."));
    } finally { setLoading(false); }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n); setError(null);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (n.every(d => d)) verifyOTP(n.join(""));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const p = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (p.length === 6) { setOtp(p.split("")); verifyOTP(p); }
  };

  const verifyOTP = async (code: string) => {
    setLoading(true); setError(null);
    try {
      if (useCustomOtp) {
        // Verify with our custom API (service role key now available)
        const res = await fetch("/api/auth-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid code");
        
        setStage("success");
        if (data.link) {
          // Session link returned — navigate to it to set cookie via /auth/callback
          setTimeout(() => { window.location.href = data.link; }, 600);
        } else {
          setTimeout(() => { router.push(redirect); router.refresh(); }, 1000);
        }
      } else {
        // Supabase native OTP verification — creates session automatically
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
        if (error) throw error;
        setStage("success");
        setTimeout(() => { router.push(redirect); router.refresh(); }, 1000);
      }
    } catch (err: any) {
      setError(err.message?.includes("Invalid") || err.message?.includes("expired") 
        ? "Wrong code or expired. Check email or request new code."
        : (err.message || "Verification failed. Try again."));
      setOtp(["","","","","",""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-white">FolioIQ</h1>
          <p className="text-emerald-300 text-sm mt-1">AI-Powered Portfolio Intelligence</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">

          {stage === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white"/>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verified! 🎉</h2>
              <p className="text-emerald-300 text-sm">Redirecting to your dashboard...</p>
              <div className="mt-4 flex justify-center"><RefreshCw className="w-5 h-5 text-emerald-400 animate-spin"/></div>
            </div>
          )}

          {stage === "email" && (
            <form onSubmit={sendOTP}>
              <h2 className="text-xl font-bold text-white mb-1">Sign in to FolioIQ</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your email — we&apos;ll send a 6-digit login code.</p>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@example.com" autoFocus required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"/>
                </div>
              </div>
              {error && <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>}
              <button type="submit" disabled={loading || !email}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02]">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <><span>Send 6-Digit Code</span><ArrowRight className="w-5 h-5"/></>}
              </button>
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-emerald-500"/>
                No password · Code expires in 10 minutes · Check spam
              </div>
            </form>
          )}

          {stage === "otp" && (
            <div>
              <button onClick={() => { setStage("email"); setOtp(["","","","","",""]); setError(null); }}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4"/> Back
              </button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                  <Mail className="w-7 h-7 text-emerald-400"/>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Check your email</h2>
                <p className="text-gray-400 text-sm">6-digit code sent to</p>
                <p className="text-emerald-300 font-bold text-sm mt-0.5 break-all">{email}</p>
              </div>

              <div className="flex gap-1.5 sm:gap-2 justify-center mb-5" onPaste={handlePaste}>
                {otp.map((d, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)} disabled={loading}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 transition-all outline-none bg-white/10 text-white
                      ${d ? "border-emerald-400 bg-emerald-500/10" : "border-white/20"}
                      focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20
                      ${error ? "border-red-400" : ""} ${loading ? "opacity-50" : ""}`}
                  />
                ))}
              </div>

              {error && <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">{error}</div>}

              <button onClick={() => { const c = otp.join(""); if (c.length === 6) verifyOTP(c); }}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <><span>Verify & Sign In</span><CheckCircle className="w-5 h-5"/></>}
              </button>

              <div className="mt-4 text-center">
                {resendTimer > 0
                  ? <p className="text-gray-500 text-sm">Resend in <span className="text-emerald-400 font-semibold">{resendTimer}s</span></p>
                  : <button onClick={() => sendOTP()} disabled={loading}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                      Didn&apos;t receive it? Resend code
                    </button>
                }
              </div>
              <p className="text-center text-gray-600 text-xs mt-3">Also check your spam folder</p>
            </div>
          )}
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">By continuing you agree to FolioIQ&apos;s Terms and Privacy Policy.</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/></div>}>
      <AuthForm/>
    </Suspense>
  );
}
