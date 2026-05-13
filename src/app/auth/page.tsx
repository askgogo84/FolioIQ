
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  GoogleAuthProvider, OAuthProvider, onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { createAdminClient } from "@/utils/supabase/admin";

// After Firebase auth, sync user to Supabase
async function syncToSupabase(firebaseUser: any) {
  try {
    await fetch("/api/auth/firebase-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photo: firebaseUser.photoURL,
      }),
    });
  } catch (e) {
    console.error("Supabase sync error:", e);
  }
}

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Check if already logged in or handling redirect result
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await syncToSupabase(user);
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });

    // Handle redirect result on mobile
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        await syncToSupabase(result.user);
        router.push("/dashboard");
      }
    }).catch(() => {});

    return () => unsub();
  }, [router]);

  const isMobile = () =>
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const signIn = async (provider: any, type: "google" | "apple") => {
    setLoading(type);
    setError(null);
    try {
      if (isMobile()) {
        // Mobile: use redirect (popup blocked on mobile browsers)
        await signInWithRedirect(auth, provider);
      } else {
        // Desktop: use popup
        const result = await signInWithPopup(auth, provider);
        await syncToSupabase(result.user);
        router.push("/dashboard");
      }
    } catch (e: any) {
      if (e.code !== "auth/popup-closed-by-user") {
        setError("Sign-in failed. Please try again.");
      }
      setLoading(null);
    }
  };

  if (checking) return (
    <div className="min-h-screen bg-[#0B1221] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-gray-800 border-t-emerald-500 animate-spin"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1221] flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter var',system-ui,sans-serif" }}>

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/30">
            <span className="text-white text-2xl font-black">F</span>
          </div>
          <h1 className="text-[24px] font-black text-white tracking-tight">FolioIQ</h1>
          <p className="text-gray-500 text-[13px] mt-1">AI-Powered Portfolio Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-white/8 rounded-3xl p-7 shadow-2xl">
          <h2 className="text-[18px] font-bold text-white mb-1 text-center">Sign in to FolioIQ</h2>
          <p className="text-gray-500 text-[13px] text-center mb-7">
            One tap — no password, no OTP
          </p>

          {/* Google */}
          <button
            onClick={() => signIn(googleProvider, "google")}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-100 text-gray-800 rounded-2xl font-semibold text-[15px] transition-all mb-3 disabled:opacity-60 shadow-lg active:scale-[0.98]"
          >
            {loading === "google" ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"/>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Apple */}
          <button
            onClick={() => signIn(appleProvider, "apple")}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-semibold text-[15px] transition-all mb-6 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading === "apple" ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )}
            Continue with Apple
          </button>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[13px] text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="text-center">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              By continuing, you agree to FolioIQ's Terms & Privacy Policy.<br/>
              We never access your investments or trading account.
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-[11px] text-gray-600">
          <span className="flex items-center gap-1"><span>🔒</span> Read-only</span>
          <span className="flex items-center gap-1"><span>🇮🇳</span> India-hosted</span>
          <span className="flex items-center gap-1"><span>🆓</span> Free forever</span>
        </div>
      </div>
    </div>
  );
}
