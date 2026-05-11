
"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowRight, RefreshCw, CheckCircle, Sparkles, Shield, ChevronLeft } from "lucide-react";

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
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [resendTimer]);

  // Send OTP
  const sendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `https://folio-iq.vercel.app/auth/callback`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setStage("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message?.includes("rate") ? "Too many requests. Please wait a minute and try again." : err.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    setError(null);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (newOtp.every(d => d) && newOtp.join("").length === 6) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) otpRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      verifyOTP(paste);
    }
  };

  // Verify OTP
  const verifyOTP = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });
      if (error) throw error;
      setStage("success");
      setTimeout(() => { router.push(redirect); router.refresh(); }, 1000);
    } catch (err: any) {
      setError("Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) verifyOTP(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-white">FolioIQ</h1>
          <p className="text-emerald-300 text-sm mt-1">AI-Powered Portfolio Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">

          {/* SUCCESS */}
          {stage === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white"/>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You&apos;re in! 🎉</h2>
              <p className="text-emerald-300 text-sm">Redirecting to your dashboard...</p>
              <div className="mt-4 flex justify-center">
                <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin"/>
              </div>
            </div>
          )}

          {/* EMAIL STAGE */}
          {stage === "email" && (
            <form onSubmit={sendOTP}>
              <h2 className="text-xl font-bold text-white mb-1">Sign in to FolioIQ</h2>
              <p className="text-gray-400 text-sm mb-6">We&apos;ll send a 6-digit code to your email. No password needed.</p>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null); }}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/30 hover:scale-[1.02] active:scale-[0.98]">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <><span>Send OTP Code</span><ArrowRight className="w-5 h-5"/></>}
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10"/>
                <span className="text-gray-500 text-xs">SECURE LOGIN</span>
                <div className="flex-1 h-px bg-white/10"/>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4 text-emerald-500"/>
                No password stored. OTP expires in 10 minutes.
              </div>
            </form>
          )}

          {/* OTP STAGE */}
          {stage === "otp" && (
            <form onSubmit={handleVerifySubmit}>
              <button type="button" onClick={() => { setStage("email"); setOtp(["","","","","",""]); setError(null); }}
                className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4"/> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <Mail className="w-7 h-7 text-emerald-400"/>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Check your email</h2>
                <p className="text-gray-400 text-sm">We sent a 6-digit code to</p>
                <p className="text-emerald-300 font-semibold text-sm mt-1">{email}</p>
              </div>

              {/* OTP Boxes */}
              <div className="flex gap-2 justify-center mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none bg-white/10 text-white
                      ${digit ? "border-emerald-400 bg-emerald-500/10" : "border-white/20"}
                      focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20
                      ${error ? "border-red-400 bg-red-500/10" : ""}
                      ${loading ? "opacity-50" : ""}`}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || otp.join("").length < 6}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/30">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <><span>Verify OTP</span><CheckCircle className="w-5 h-5"/></>}
              </button>

              {/* Resend */}
              <div className="mt-4 text-center">
                {resendTimer > 0 ? (
                  <p className="text-gray-500 text-sm">Resend code in <span className="text-emerald-400 font-semibold">{resendTimer}s</span></p>
                ) : (
                  <button type="button" onClick={() => sendOTP()} disabled={loading}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors">
                    Didn&apos;t receive it? Resend OTP
                  </button>
                )}
              </div>

              <p className="text-center text-gray-500 text-xs mt-4">
                Code expires in 10 minutes · Check spam folder too
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          By continuing, you agree to FolioIQ&apos;s Terms and Privacy Policy.
        </p>
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
