"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Sparkles, LayoutDashboard, Upload, Search, User, Brain,
  TrendingUp, DollarSign, Target, MessageSquare, RefreshCw,
  Scale, Calculator, History, Globe, FileText, FileUp, Activity,
  ChevronLeft, ChevronRight, LogOut, Menu, X
} from "lucide-react";

const navGroups = [
  {
    title: "Portfolio",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Upload CAS", href: "/upload", icon: Upload },
      { name: "Transactions", href: "/transactions", icon: History },
      { name: "Profile", href: "/profile", icon: User },
    ]
  },
  {
    title: "AI Intelligence",
    items: [
      { name: "AI Insights", href: "/intelligence", icon: Brain },
      { name: "Smart Rebalance", href: "/rebalance", icon: RefreshCw },
      { name: "Tax Harvesting", href: "/tax-harvesting", icon: DollarSign },
      { name: "AI Chat", href: "/chat", icon: MessageSquare },
    ]
  },
  {
    title: "Planning",
    items: [
      { name: "Goal Planner", href: "/goals", icon: Target },
      { name: "SIP Calculator", href: "/calculator", icon: Calculator },
      { name: "Backtesting", href: "/backtest", icon: TrendingUp },
    ]
  },
  {
    title: "Discovery",
    items: [
      { name: "Fund Explorer", href: "/explore", icon: Search },
      { name: "Fund Screener", href: "/screener", icon: Scale },
      { name: "Fund Compare", href: "/compare", icon: Scale },
      { name: "Market Overview", href: "/market", icon: Globe },
      { name: "Live NAV", href: "/live-nav", icon: Activity },
    ]
  },
  {
    title: "Reports",
    items: [
      { name: "Capital Gains", href: "/capital-gains", icon: TrendingUp },
      { name: "Export Reports", href: "/reports", icon: FileText },
      { name: "PDF Parser", href: "/parse-cas", icon: FileUp },
    ]
  },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-200 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && <span className="text-lg font-bold text-slate-900">FolioIQ</span>}
        {/* Mobile close button */}
        <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 hover:bg-slate-100 rounded">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!collapsed && (
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle (desktop only) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 border-t border-slate-200 text-slate-400 hover:text-slate-600"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger - only show on small screens */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile spacer - pushes content down when hamburger is visible */}
      <div className="lg:hidden h-16" />
    </>
  );
}
