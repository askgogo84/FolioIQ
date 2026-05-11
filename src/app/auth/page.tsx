
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Mail, ArrowRight, CheckCircle, AlertCircle, KeyRound, Loader2 } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true, // auto-create account if new user
          emailRedirectTo: `https://folio-iq.vercel.app/auth/callback`,
        },
      });

      if (error) throw error;

      setStep("otp");
      // Countdown timer for resend
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(t => { if (t <= 1) { clearInterval(timer); return 0; } return t - 1; });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "email",
      });

      if (error) throw error;
      if (data.session) {
        router.push(redirect);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message?.includes("expired") 
        ? "OTP has expired. Please request a new one."
        : err.message?.includes("Invalid") 
        ? "Incorrect OTP. Please check your email and try again."
        : err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer(t => { if (t <= 1) { clearInterval(timer); return 0; } return t - 1; });
      }, 1000);
      setOtp("");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-emerald-600 rounded-2xl items-center justify-center mb-4 shadow-xl shadow-emerald-900/50">
            <Sparkles className="w-8 h-8 text-white"/>
          </div>
          <h1 className="text-2xl font-black text-white mb-1">FolioIQ</h1>
          <p className="text-gray-400 text-sm">AI-Powered Portfolio Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            {step === "email" ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm">Enter your email to get a one-time login code. Works for new and existing accounts.</p>
              </>
            ) : (
              <>
                <button onClick={() => { setStep("email"); setError(null); setOtp(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
                  ← Change email
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Check your inbox</h2>
                <p className="text-gray-500 text-sm">We sent a 6-digit code to <strong className="text-gray-700">{email}</strong></p>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0"/>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Email input */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="px-6 pb-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Mail className="w-4 h-4"/>}
                {loading ? "Sending code..." : "Send Login Code"}
                {!loading && <ArrowRight className="w-4 h-4"/>}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                New user? We'll create your account automatically.
              </p>
            </form>
          )}

          {/* Step 2: OTP input */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="px-6 pb-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors text-lg tracking-widest font-mono"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">Didn't receive it? Check spam folder.</p>
                  <button type="button" onClick={handleResend} disabled={resendTimer > 0 || loading}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed">
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || otp.length < 6}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4"/>}
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to FolioIQ&apos;s Terms and Privacy Policy.<br/>
          <span className="text-gray-400">Not SEBI registered. Not investment advice.</span>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin"/>
      </div>
    }>
      <AuthForm/>
    </Suspense>
  );
}
