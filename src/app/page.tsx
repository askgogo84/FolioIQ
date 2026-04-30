"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, Star, Brain, Shield, TrendingUp, BarChart3, Zap, Award } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStart = () => setShowForm(true);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.includes("@")) {
      localStorage.setItem("folioiq_email", email);
      setSubmitted(true);
      setTimeout(() => router.push("/profile"), 1000);
    }
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
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl">FolioIQ</span>
          </div>
          <button onClick={handleStart} className="bg-emerald-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">
            Get Started
          </button>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm mb-6">
                <Star className="w-4 h-4" /> AI-Powered Portfolio Intelligence
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Make better<br /><span className="text-emerald-400">mutual fund</span><br />decisions.
              </h1>
              <p className="text-lg text-slate-400 mb-8">
                Upload your portfolio and FolioIQ tells you what to fix, what to keep, and what to add next.
              </p>

              {!showForm ? (
                <div className="flex gap-4">
                  <button onClick={handleStart} className="bg-emerald-500 px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-600">
                    Check your portfolio <ArrowRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => router.push("/profile")} className="border border-slate-600 px-6 py-3 rounded-lg hover:bg-slate-800">
                    Upload CAS
                  </button>
                </div>
              ) : submitted ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <div>
                    <p className="font-medium text-emerald-400">Email saved!</p>
                    <p className="text-sm text-slate-400">Redirecting...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-md">
                  <p className="text-sm text-slate-400 mb-3">Enter your email to get started</p>
                  <div className="flex gap-2">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500" required />
                    <button type="submit" className="bg-emerald-500 px-6 py-3 rounded-lg font-medium hover:bg-emerald-600">Continue</button>
                  </div>
                </form>
              )}

              <div className="flex gap-8 mt-12">
                <div><p className="text-2xl font-bold">5 sec</p><p className="text-sm text-slate-500">PORTFOLIO SCAN</p></div>
                <div className="w-px bg-slate-700" />
                <div><p className="text-2xl font-bold">AI</p><p className="text-sm text-slate-500">POWERED CHECKS</p></div>
                <div className="w-px bg-slate-700" />
                <div><p className="text-2xl font-bold">Simple</p><p className="text-sm text-slate-500">ACTION PLAN</p></div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-2xl text-gray-900">
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Portfolio Health</p>
                    <p className="text-3xl font-bold">80<span className="text-gray-500 text-lg">/100</span></p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Healthy</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full mb-4"><div className="h-full bg-emerald-500 rounded-full" style={{width:"80%"}} /></div>
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                    <p className="font-medium">Small Cap Overexposure</p>
                    <p className="text-xs text-gray-500">High risk in market downturns</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                    <p className="font-medium">Tax Saver ELSS Limit Not Utilized</p>
                    <p className="text-xs text-gray-500">Save 31,200 in taxes annually</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                    <p className="font-medium">Axis Long Term Underperforming</p>
                    <p className="text-xs text-gray-500">Potential 8-12% better returns</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why FolioIQ?</h2>
            <p className="text-slate-400">Everything you need to make smarter mutual fund decisions, powered by AI</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to optimize your portfolio?</h2>
          <p className="text-slate-400 mb-8">Join thousands of investors who trust FolioIQ for smarter mutual fund decisions.</p>
          <button onClick={handleStart} className="bg-emerald-500 px-8 py-4 rounded-lg font-medium text-lg hover:bg-emerald-600">
            Get Started Free
          </button>
          <p className="text-sm text-slate-500 mt-4">No credit card required - Takes 5 seconds</p>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">F</span>
            </div>
            <span className="font-bold">FolioIQ</span>
          </div>
          <p className="text-sm text-slate-500">2026 FolioIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

