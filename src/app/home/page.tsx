"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Upload, PieChart, TrendingUp, Zap, ChevronRight, Brain } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  const features = [
    { icon: Upload, title: "Smart Upload", desc: "Upload your CAS statement and get instant AI-powered analysis", href: "/upload", color: "bg-blue-500", hoverColor: "hover:shadow-blue-200" },
    { icon: PieChart, title: "Portfolio Analysis", desc: "Deep insights into your asset allocation, returns & risk", href: "/dashboard", color: "bg-emerald-500", hoverColor: "hover:shadow-emerald-200" },
    { icon: TrendingUp, title: "Fund Explorer", desc: "Discover top-performing mutual funds curated for your goals", href: "/explore", color: "bg-purple-500", hoverColor: "hover:shadow-purple-200" },
    { icon: Brain, title: "AI Insights", desc: "Get personalized recommendations and rebalancing suggestions", href: "/dashboard", color: "bg-orange-500", hoverColor: "hover:shadow-orange-200" },
  ];

  const stats = [
    { label: "Portfolio Value", value: "₹12.5L", change: "+8.2%", positive: true },
    { label: "Total Returns", value: "₹1.2L", change: "+12.5%", positive: true },
    { label: "Funds Tracked", value: "8", change: "+2 new", positive: true },
    { label: "Risk Score", value: "Moderate", change: "Balanced", positive: true },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium mb-6">
          <Zap className="w-4 h-4" /> AI-Powered Portfolio Intelligence
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Welcome to <span className="text-emerald-600">FolioIQ</span></h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">Your intelligent mutual fund portfolio analyzer. Upload, analyze, and optimize your investments with AI-powered insights.</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push("/upload")} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-200">Get Started <ArrowRight className="w-5 h-5" /></button>
          <button onClick={() => router.push("/dashboard")} className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-emerald-300 hover:text-emerald-700 transition-all">View Dashboard</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className={`text-sm font-medium mt-1 ${stat.positive ? "text-emerald-600" : "text-red-600"}`}>{stat.change}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Link key={i} href={feature.href} className={`group bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg ${feature.hoverColor} transition-all`}>
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">{feature.title}</h3>
              <p className="text-sm text-slate-600 mb-4">{feature.desc}</p>
              <div className="flex items-center text-emerald-600 text-sm font-medium">Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <Link href="/dashboard" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</Link>
        </div>
        <div className="space-y-4">
          {[
            { action: "Portfolio uploaded", time: "2 hours ago", status: "Analyzed", statusColor: "bg-emerald-50 text-emerald-700" },
            { action: "Rebalancing suggestion generated", time: "1 day ago", status: "Pending", statusColor: "bg-amber-50 text-amber-700" },
            { action: "Monthly report generated", time: "3 days ago", status: "Viewed", statusColor: "bg-blue-50 text-blue-700" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-700">{activity.action}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">{activity.time}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${activity.statusColor}`}>{activity.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
