"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SessionPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase automatically processes the hash fragment and sets the session
    // We just need to wait for it and redirect
    const handle = async () => {
      // Wait for Supabase to process hash
      await new Promise(r => setTimeout(r, 500));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        // Listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe();
            router.replace("/dashboard");
          }
        });
        // Fallback after 3s
        setTimeout(() => { router.replace("/dashboard"); }, 3000);
      }
    };
    handle();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Signing you in...</h2>
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"/>
      </div>
    </div>
  );
}
