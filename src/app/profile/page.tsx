"use client";

import { useState } from "react";
import { Target, MessageSquare, Brain,  User, Settings, Bell, Shield, Home, LayoutDashboard, Upload, Search, Sparkles, Wallet, TrendingUp, PiggyBank, Activity, ArrowRight, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "AI Insights", href: "/intelligence", icon: Brain },{ name: "Profile", href: "/profile", icon: User, active: true },
  ];

  const portfolioSummary = [
    {
      title: "Portfolio Value",
      value: "₹55,32,843",
      change: "+12.5%",
      changeType: "positive",
      icon: Wallet,
      color: "blue"
    },
    {
      title: "Total Returns",
      value: "₹8,42,156",
      change: "+18.2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Active SIPs",
      value: "8 Plans",
      change: "₹45,500/mo",
      changeType: "neutral",
      icon: PiggyBank,
      color: "purple"
    },
    {
      title: "Portfolio XIRR",
      value: "14.8%",
      change: "Since 2020",
      changeType: "positive",
      icon: Activity,
      color: "orange"
    }
  ];

  const settingsItems = [
    { icon: User, label: "Personal Information", description: "Update your name, email, and phone" },
    { icon: Bell, label: "Notifications", description: "Manage alerts and reminders" },
    { icon: Shield, label: "Security", description: "Password, 2FA, and login history" },
    { icon: Settings, label: "Preferences", description: "Theme, language, and display settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">FolioIQ</span>
              </Link>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Divya Goverdhan</h1>
              <p className="text-slate-500">divya.goverdhan@email.com</p>
              <div className="flex gap-3 mt-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Premium Member</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">KYC Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {portfolioSummary.map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                </div>
                <span className={`text-xs font-medium ${
                  item.changeType === "positive" ? "text-green-600" :
                  item.changeType === "negative" ? "text-red-600" :
                  "text-slate-500"
                }`}>
                  {item.change}
                </span>
              </div>
              <h3 className="text-sm text-slate-500 mb-1">{item.title}</h3>
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 mb-8">
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "overview" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "settings" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Settings
            </button>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Portfolio Overview</h3>
                      <p className="text-sm text-slate-500">View detailed portfolio analytics</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span className="text-sm font-medium">Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">SIP Tracker</h3>
                      <p className="text-sm text-slate-500">Manage your systematic investments</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span className="text-sm font-medium">View SIPs</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Goal Tracking</h3>
                      <p className="text-sm text-slate-500">Monitor your financial goals</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    <span className="text-sm font-medium">Set Goals</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                {settingsItems.map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{item.label}</h3>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                ))}

                <div className="pt-4 border-t border-slate-100">
                  <button className="w-full flex items-center justify-center gap-2 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/dashboard" className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors">
            <LayoutDashboard className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Dashboard</h3>
            <p className="text-sm text-blue-100">View your complete portfolio</p>
          </Link>
          <Link href="/explore" className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-700 transition-colors">
            <Search className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Explore Funds</h3>
            <p className="text-sm text-purple-100">Discover new investments</p>
          </Link>
          <Link href="/upload" className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors">
            <Upload className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Upload CAS</h3>
            <p className="text-sm text-green-100">Update portfolio data</p>
          </Link>
        </div>
      </div>
    </div>
  );
}




