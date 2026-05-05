"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Upload, Receipt, User, Sparkles, Scale, 
  DollarSign, MessageSquare, Target, Calculator, TrendingUp,
  Search, Filter, BarChart2, Globe, Activity, FileText, 
  Download, FileCode, LogOut, Menu, X
} from "lucide-react";

const sidebarItems = [
  {
    title: "PORTFOLIO",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Upload CAS", href: "/upload", icon: Upload },
      { name: "Transactions", href: "/transactions", icon: Receipt },
      { name: "Profile", href: "/profile", icon: User },
    ]
  },
  {
    title: "AI INTELLIGENCE",
    items: [
      { name: "AI Insights", href: "/intelligence", icon: Sparkles },
      { name: "Smart Rebalance", href: "/rebalance", icon: Scale },
      { name: "Tax Harvesting", href: "/tax-harvesting", icon: DollarSign },
      { name: "AI Chat", href: "/chat", icon: MessageSquare },
    ]
  },
  {
    title: "PLANNING",
    items: [
      { name: "Goal Planner", href: "/goals", icon: Target },
      { name: "SIP Calculator", href: "/calculator", icon: Calculator },
      { name: "Backtesting", href: "/backtest", icon: TrendingUp },
    ]
  },
  {
    title: "DISCOVERY",
    items: [
      { name: "Fund Explorer", href: "/explore", icon: Search },
      { name: "Fund Screener", href: "/screener", icon: Filter },
      { name: "Fund Compare", href: "/compare", icon: BarChart2 },
      { name: "Market Overview", href: "/market", icon: Globe },
      { name: "Live NAV", href: "/live-nav", icon: Activity },
    ]
  },
  {
    title: "REPORTS",
    items: [
      { name: "Capital Gains", href: "/capital-gains", icon: FileText },
      { name: "Export Reports", href: "/reports", icon: Download },
      { name: "PDF Parser", href: "/parse-cas", icon: FileCode },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-slate-200 
        transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen overflow-y-auto
      `}>
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">FolioIQ</h1>
              <p className="text-xs text-slate-400">Smart Analytics</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link
            href="/auth"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}
