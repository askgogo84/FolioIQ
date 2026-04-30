"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export default function RiskProfile() {
  const router = useRouter();
  const [score] = useState(72);
  const [appetite] = useState("Moderate");

  const riskFactors = [
    { name: "Equity Exposure", value: 55, status: "High", color: "amber" },
    { name: "Small Cap Allocation", value: 18, status: "Elevated", color: "red" },
    { name: "Sector Concentration", value: 35, status: "Moderate", color: "blue" },
    { name: "Debt Stability", value: 85, status: "Strong", color: "emerald" },
  ];

  const recommendations = [
    { icon: AlertTriangle, title: "Reduce Small Cap", desc: "Current 18% exposure is above recommended 15% for moderate investors", type: "warning" },
    { icon: Target, title: "Add Large Cap", desc: "Increase large cap allocation to 35% for better stability", type: "action" },
    { icon: CheckCircle, title: "Debt Allocation Good", desc: "Your 30% debt allocation provides adequate downside protection", type: "good" },
    { icon: TrendingUp, title: "Consider Balanced Advantage", desc: "Dynamic equity-debt allocation can reduce volatility", type: "idea" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push("/profile")} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Profile</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FolioIQ</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Risk Profile Analysis</h1>
          <p className="text-slate-400">Understanding your portfolio risk and recommended adjustments</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-400 uppercase tracking-wider">Overall Risk Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-bold text-white">{score}</span>
                <span className="text-slate-500">/100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {appetite}
              </span>
              <p className="text-sm text-slate-500 mt-1">Risk Appetite</p>
            </div>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full" style={{ width: `${score}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Conservative (0)</span>
            <span>Moderate (50)</span>
            <span>Aggressive (100)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {riskFactors.map((factor, i) => (
            <div key={i} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-300">{factor.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {factor.status}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${factor.value}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{factor.value}% allocated</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-slate-800">
                <rec.icon className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">{rec.title}</h3>
                <p className="text-sm text-slate-400">{rec.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => router.push("/dashboard")} className="bg-emerald-500 px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 inline-flex items-center gap-2">
            View Full Analysis <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
