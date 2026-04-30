"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, TrendingUp, Shield, BarChart3, Brain, Award, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if email already saved
  useEffect(() => {
    const saved = localStorage.getItem("folioiq_email");
    if (saved && saved.includes("@")) {
      console.log("Auto-redirecting to profile...");
      window.location.href = "/profile";
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    localStorage.setItem("folioiq_email", email);
    console.log("Email saved, redirecting to /profile...");
    
    // Use window.location for guaranteed navigation
    window.location.href = "/profile";
  };

  const features = [
    { icon: Brain, title: "AI Analysis", desc: "Get personalized recommendations based on your portfolio" },
    { icon: Shield, title: "Risk Assessment", desc: "Understand your risk exposure across categories" },
    { icon: TrendingUp, title: "Tax Optimization", desc: "Maximize tax savings with smart harvesting" },
    { icon: BarChart3, title: "Visual Analytics", desc: "Beautiful charts for portfolio breakdown" },
    { icon: Zap, title: "Instant Insights", desc: "5-second portfolio health check" },
    { icon: Award, title: "Expert Grading", desc: "Portfolio score with actionable fixes" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-bold text-xl">FolioIQ</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm mb-6">
              <Zap className="w-4 h-4" /> AI-Powered Portfolio Intelligence
            </span>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Make better <span className="text-emerald-400">mutual fund</span> decisions.
            </h1>
            <p className="text-lg text-slate-400 mb-8">
              Upload your portfolio and FolioIQ tells you what to fix, what to keep, and what to add next.
            </p>
            <div className="flex gap-8 text-sm text-slate-400 mb-8">
              <div><span className="text-white font-bold text-lg">5 sec</span><br/>Portfolio Scan</div>
              <div><span className="text-white font-bold text-lg">AI</span><br/>Powered Checks</div>
              <div><span className="text-white font-bold text-lg">Simple</span><br/>Action Plan</div>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400 uppercase tracking-wider">Portfolio Health</span>
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Healthy</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">80</span>
              <span className="text-slate-400">/100</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full mb-6">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "80%" }} />
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-200">Small Cap Overexposure</p>
                <p className="text-xs text-amber-300/70">High risk in market downturns</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-200">Tax Saver ELSS Limit Not Utilized</p>
                <p className="text-xs text-emerald-300/70">Save ₹1.5L in taxes annually</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm font-medium text-blue-200">Axis Long Term Underperforming</p>
                <p className="text-xs text-blue-300/70">Potential 8-12% better returns</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-slate-400">Enter your email to get started</p>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="your@email.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Redirecting..." : <>Get Started <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why FolioIQ?</h2>
            <p className="text-slate-400">Everything you need to make smarter mutual fund decisions, powered by AI</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
